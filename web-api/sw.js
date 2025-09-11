// Service Worker for PWA Demo
// Progressive Web App의 핵심 기능인 오프라인 캐싱, 백그라운드 동기화 등을 담당

const CACHE_NAME = "pwa-demo-v1";
const RUNTIME_CACHE = "pwa-runtime-v1";

// 캐시할 정적 리소스 목록
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/PWA/",
  "/src/PWA/style.css",
  "/vite.svg",
  // 추가 리소스들...
];

// 캐시 전략 설정
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// URL 패턴별 캐시 전략
const ROUTE_CACHE_STRATEGIES = [
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: "images-cache",
  },
  {
    pattern: /\.(?:css|js)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: "static-cache",
  },
  {
    pattern: /^https:\/\/api\./,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: "api-cache",
  },
];

// Service Worker 설치 이벤트
self.addEventListener("install", (event) => {
  console.log("🔄 Service Worker 설치 중...");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(STATIC_ASSETS);
        console.log("✅ 정적 리소스 캐시 완료");

        // 즉시 활성화 (skipWaiting)
        await self.skipWaiting();
      } catch (error) {
        console.error("❌ Service Worker 설치 실패:", error);
      }
    })()
  );
});

// Service Worker 활성화 이벤트
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker 활성화 중...");

  event.waitUntil(
    (async () => {
      try {
        // 오래된 캐시 정리
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(
          (name) =>
            name !== CACHE_NAME &&
            name !== RUNTIME_CACHE &&
            !ROUTE_CACHE_STRATEGIES.some((route) => route.cacheName === name)
        );

        await Promise.all(oldCaches.map((name) => caches.delete(name)));
        console.log("🗑️ 오래된 캐시 정리 완료:", oldCaches);

        // 모든 클라이언트 제어
        await self.clients.claim();
        console.log("✅ Service Worker 활성화 완료");

        // 클라이언트에 활성화 알림
        await broadcastMessage({
          type: "SW_ACTIVATED",
          payload: { timestamp: Date.now() },
        });
      } catch (error) {
        console.error("❌ Service Worker 활성화 실패:", error);
      }
    })()
  );
});

// Fetch 이벤트 - 네트워크 요청 가로채기
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome extension이나 moz-extension은 처리하지 않음
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // GET 요청만 캐시 처리
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(handleFetchRequest(request));
});

// Fetch 요청 처리 함수
async function handleFetchRequest(request) {
  const url = new URL(request.url);

  try {
    // 캐시 전략 결정
    const strategy = getCacheStrategy(url);

    switch (strategy.type) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, strategy.cacheName);
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, strategy.cacheName);
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, strategy.cacheName);
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, strategy.cacheName);
      default:
        return await networkFirst(request, RUNTIME_CACHE);
    }
  } catch (error) {
    console.error("Fetch 처리 오류:", error);
    return await handleFetchError(request, error);
  }
}

// 캐시 전략 결정
function getCacheStrategy(url) {
  for (const route of ROUTE_CACHE_STRATEGIES) {
    if (route.pattern.test(url.pathname) || route.pattern.test(url.href)) {
      return {
        type: route.strategy,
        cacheName: route.cacheName,
      };
    }
  }

  // 기본 전략
  return {
    type: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: RUNTIME_CACHE,
  };
}

// Cache First 전략
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn("Cache First 네트워크 오류:", error);
    throw error;
  }
}

// Network First 전략
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn("Network First 네트워크 오류, 캐시에서 반환:", error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate 전략
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // 백그라운드에서 네트워크 요청
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn("Stale While Revalidate 백그라운드 업데이트 실패:", error);
    });

  // 캐시된 응답이 있으면 즉시 반환, 없으면 네트워크 대기
  return cachedResponse || (await networkPromise);
}

// Cache Only 전략
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  throw new Error("Cache only: 캐시에서 찾을 수 없음");
}

// Fetch 오류 처리
async function handleFetchError(request, error) {
  const url = new URL(request.url);

  // HTML 페이지 요청인 경우 오프라인 페이지 반환
  if (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  ) {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match("/");

    if (offlinePage) {
      await broadcastMessage({
        type: "OFFLINE_FALLBACK",
        payload: { url: url.href },
      });
      return offlinePage;
    }
  }

  // API 요청인 경우 간단한 오프라인 응답
  if (url.pathname.startsWith("/api/")) {
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "오프라인 상태입니다. 나중에 다시 시도해주세요.",
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  throw error;
}

// 메시지 이벤트 처리
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
    case "GET_CACHE_STATS":
      handleGetCacheStats(event);
      break;
    case "CLEAR_CACHE":
      handleClearCache(event, payload);
      break;
    case "UPDATE_CACHE":
      handleUpdateCache(event, payload);
      break;
    case "PRELOAD_RESOURCES":
      handlePreloadResources(event, payload);
      break;
    default:
      console.log("알 수 없는 메시지:", event.data);
  }
});

// 캐시 통계 조회
async function handleGetCacheStats(event) {
  try {
    const cacheNames = await caches.keys();
    const stats = {};

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();

      let totalSize = 0;
      for (const key of keys) {
        try {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        } catch (e) {
          // 개별 항목 오류는 무시
        }
      }

      stats[name] = {
        count: keys.length,
        size: totalSize,
      };
    }

    event.ports[0]?.postMessage({
      type: "CACHE_STATS",
      payload: stats,
    });
  } catch (error) {
    console.error("캐시 통계 조회 실패:", error);
    event.ports[0]?.postMessage({
      type: "ERROR",
      payload: { message: error.message },
    });
  }
}

// 캐시 정리
async function handleClearCache(event, payload) {
  try {
    const { cacheNames: targetCaches } = payload || {};

    if (targetCaches && Array.isArray(targetCaches)) {
      // 특정 캐시만 삭제
      await Promise.all(targetCaches.map((name) => caches.delete(name)));
    } else {
      // 모든 캐시 삭제
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    event.ports[0]?.postMessage({
      type: "CACHE_CLEARED",
      payload: { timestamp: Date.now() },
    });

    await broadcastMessage({
      type: "CACHE_UPDATED",
      payload: { action: "cleared" },
    });
  } catch (error) {
    console.error("캐시 정리 실패:", error);
    event.ports[0]?.postMessage({
      type: "ERROR",
      payload: { message: error.message },
    });
  }
}

// 캐시 업데이트
async function handleUpdateCache(event, payload) {
  try {
    const { urls } = payload || {};
    const cache = await caches.open(CACHE_NAME);

    if (urls && Array.isArray(urls)) {
      await cache.addAll(urls);
    } else {
      await cache.addAll(STATIC_ASSETS);
    }

    event.ports[0]?.postMessage({
      type: "CACHE_UPDATED",
      payload: { timestamp: Date.now() },
    });

    await broadcastMessage({
      type: "CACHE_UPDATED",
      payload: { action: "updated" },
    });
  } catch (error) {
    console.error("캐시 업데이트 실패:", error);
    event.ports[0]?.postMessage({
      type: "ERROR",
      payload: { message: error.message },
    });
  }
}

// 리소스 사전 로드
async function handlePreloadResources(event, payload) {
  try {
    const { urls, cacheName = RUNTIME_CACHE } = payload || {};

    if (!urls || !Array.isArray(urls)) {
      throw new Error("사전 로드할 URL 목록이 필요합니다");
    }

    const cache = await caches.open(cacheName);
    const results = [];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          results.push({ url, status: "success" });
        } else {
          results.push({ url, status: "failed", error: response.statusText });
        }
      } catch (error) {
        results.push({ url, status: "failed", error: error.message });
      }
    }

    event.ports[0]?.postMessage({
      type: "PRELOAD_COMPLETED",
      payload: { results },
    });
  } catch (error) {
    console.error("리소스 사전 로드 실패:", error);
    event.ports[0]?.postMessage({
      type: "ERROR",
      payload: { message: error.message },
    });
  }
}

// Push 이벤트 처리
self.addEventListener("push", (event) => {
  console.log("📬 Push 메시지 수신:", event);

  let notificationData = {
    title: "PWA Demo",
    body: "Push 알림 테스트입니다.",
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: "pwa-demo",
    data: {
      timestamp: Date.now(),
      url: "/",
    },
  };

  // Push 데이터가 있는 경우 파싱
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.warn("Push 데이터 파싱 실패:", error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: "open",
          title: "열기",
        },
        {
          action: "close",
          title: "닫기",
        },
      ],
      requireInteraction: false,
      silent: false,
    })
  );
});

// 알림 클릭 이벤트 처리
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 알림 클릭:", event);

  event.notification.close();

  const { action, data } = event;
  const targetUrl = data?.url || "/";

  if (action === "close") {
    return;
  }

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // 이미 열린 창이 있는지 확인
      for (const client of clients) {
        if (client.url === targetUrl && "focus" in client) {
          await client.focus();
          return;
        }
      }

      // 새 창 열기
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// 백그라운드 동기화 이벤트 처리
self.addEventListener("sync", (event) => {
  console.log("🔄 백그라운드 동기화:", event.tag);

  switch (event.tag) {
    case "background-sync":
      event.waitUntil(handleBackgroundSync());
      break;
    case "offline-data-sync":
      event.waitUntil(handleOfflineDataSync());
      break;
    default:
      console.log("알 수 없는 동기화 태그:", event.tag);
  }
});

// 백그라운드 동기화 처리
async function handleBackgroundSync() {
  try {
    console.log("🔄 백그라운드 동기화 실행");

    // 오프라인 중 저장된 데이터 동기화
    const offlineData = await getOfflineData();

    for (const item of offlineData) {
      try {
        await syncDataItem(item);
        await removeOfflineData(item.id);
      } catch (error) {
        console.error("데이터 동기화 실패:", error);
      }
    }

    await broadcastMessage({
      type: "BACKGROUND_SYNC_COMPLETED",
      payload: {
        syncedCount: offlineData.length,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("백그라운드 동기화 실패:", error);
  }
}

// 오프라인 데이터 동기화
async function handleOfflineDataSync() {
  try {
    console.log("📦 오프라인 데이터 동기화 실행");

    // 구현 예정: 실제 오프라인 데이터 처리 로직
    await broadcastMessage({
      type: "OFFLINE_DATA_SYNCED",
      payload: { timestamp: Date.now() },
    });
  } catch (error) {
    console.error("오프라인 데이터 동기화 실패:", error);
  }
}

// 유틸리티 함수들
async function broadcastMessage(message) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

async function getOfflineData() {
  // 구현 예정: IndexedDB에서 오프라인 데이터 조회
  return [];
}

async function syncDataItem(item) {
  // 구현 예정: 서버와 데이터 동기화
  console.log("데이터 동기화:", item);
}

async function removeOfflineData(id) {
  // 구현 예정: 동기화 완료된 오프라인 데이터 제거
  console.log("오프라인 데이터 제거:", id);
}

// 정기적인 캐시 정리 (매일 한 번)
setInterval(() => {
  cleanupOldCaches();
}, 24 * 60 * 60 * 1000);

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7일

    for (const name of cacheNames) {
      // 캐시 이름에 타임스탬프가 포함된 경우 오래된 캐시 정리
      const timestampMatch = name.match(/v(\d+)$/);
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1]);
        if (now - timestamp > maxAge) {
          await caches.delete(name);
          console.log("🗑️ 오래된 캐시 정리:", name);
        }
      }
    }
  } catch (error) {
    console.error("캐시 정리 실패:", error);
  }
}

// Service Worker 생명주기 로깅
console.log("🔧 Service Worker 스크립트 로드됨");

// 글로벌 에러 핸들링
self.addEventListener("error", (event) => {
  console.error("Service Worker 오류:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker Promise 거부:", event.reason);
  event.preventDefault();
});
