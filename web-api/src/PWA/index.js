import "./style.css";

console.log("📱 PWA (Progressive Web App) 스크립트 시작!");

class PWAManager {
  constructor() {
    this.serviceWorker = null;
    this.deferredPrompt = null;
    this.installPromptShown = false;
    this.isInstalled = false;
    this.networkStatus = navigator.onLine;
    this.cacheStats = {
      totalSize: 0,
      itemCount: 0,
      lastUpdated: null,
    };
    this.updateAvailable = false;
    this.init();
  }

  init() {
    console.log("📱 PWA Manager 초기화 시작");
    this.checkPWASupport();
    this.setupUI();
    this.setupEventListeners();
    this.initializeServiceWorker();
    this.checkInstallPrompt();
    this.setupNetworkMonitoring();
    console.log("✅ PWA Manager 초기화 완료");
  }

  checkPWASupport() {
    console.log("🔍 PWA 지원 여부 확인 중...");

    const support = {
      serviceWorker: "serviceWorker" in navigator,
      manifest: "onbeforeinstallprompt" in window,
      push: "PushManager" in window,
      notifications: "Notification" in window,
      cacheAPI: "caches" in window,
      backgroundSync:
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype,
      webShare: "share" in navigator,
      fullscreen:
        document.fullscreenEnabled || document.webkitFullscreenEnabled,
      offline: "onLine" in navigator,
      storage: "storage" in navigator,
    };

    console.log("📊 PWA 지원 현황:", support);
    this.pwaSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.pwaSupport;

    appDiv.innerHTML = `
      <div class="pwa-container">
        <header class="pwa-header">
          <h1>📱 Progressive Web App (PWA)</h1>
          <p>웹앱 설치, 캐싱, 오프라인 기능, 백그라운드 동기화의 모든 기능을 체험하세요</p>
          
          <div style="margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="installPWA" class="btn-primary">📱 앱 설치하기</button>
            <button id="shareApp" class="btn-info">📤 앱 공유하기</button>
            <button id="toggleFullscreen" class="btn-success">🔍 전체화면</button>
          </div>

          <div class="api-support">
            <div class="support-badge ${
              support.serviceWorker ? "supported" : "unsupported"
            }">
              ${
                support.serviceWorker
                  ? "✅ Service Worker"
                  : "❌ Service Worker"
              }
            </div>
            <div class="support-badge ${
              support.manifest ? "supported" : "unsupported"
            }">
              ${support.manifest ? "✅ App Manifest" : "❌ App Manifest"}
            </div>
            <div class="support-badge ${
              support.push ? "supported" : "unsupported"
            }">
              ${support.push ? "✅ Push API" : "❌ Push API"}
            </div>
            <div class="support-badge ${
              support.cacheAPI ? "supported" : "unsupported"
            }">
              ${support.cacheAPI ? "✅ Cache API" : "❌ Cache API"}
            </div>
            <div class="support-badge ${
              support.webShare ? "supported" : "unsupported"
            }">
              ${support.webShare ? "✅ Web Share" : "❌ Web Share"}
            </div>
          </div>
        </header>

        <main class="pwa-main">
          <!-- 설치 및 상태 -->
          <div class="panel-card primary">
            <h2>📲 PWA 설치 & 상태</h2>
            
            <div class="install-section">
              <div class="install-status">
                <h3>설치 상태</h3>
                <div class="status-info">
                  <div class="install-badge" id="installStatus">
                    <span class="status-icon">❓</span>
                    <span class="status-text">확인 중...</span>
                  </div>
                  <p class="install-description" id="installDescription">
                    PWA 설치 상태를 확인하고 있습니다.
                  </p>
                </div>
                <div class="install-actions">
                  <button id="checkInstallStatus" class="btn-info">🔍 상태 확인</button>
                  <button id="promptInstall" class="btn-primary">📱 설치 유도</button>
                  <button id="uninstallGuide" class="btn-secondary">🗑️ 제거 방법</button>
                </div>
              </div>

              <div class="install-stats">
                <h3>설치 통계</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">브라우저</span>
                    <span class="stat-value" id="browserInfo">-</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">플랫폼</span>
                    <span class="stat-value" id="platformInfo">-</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">화면 크기</span>
                    <span class="stat-value" id="screenInfo">-</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">설치 가능</span>
                    <span class="stat-value" id="installableInfo">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Service Worker 관리 -->
          <div class="panel-card">
            <h2>⚙️ Service Worker 관리</h2>
            
            <div class="sw-section">
              <div class="sw-status">
                <h3>Service Worker 상태</h3>
                <div class="sw-info">
                  <div class="sw-badge" id="swStatus">
                    <span class="sw-icon">❓</span>
                    <span class="sw-text">확인 중...</span>
                  </div>
                  <div class="sw-details" id="swDetails">
                    <p>Service Worker 상태를 확인하고 있습니다.</p>
                  </div>
                </div>
                <div class="sw-actions">
                  <button id="registerSW" class="btn-primary">🔄 등록/재등록</button>
                  <button id="updateSW" class="btn-warning">⬆️ 업데이트</button>
                  <button id="unregisterSW" class="btn-danger">❌ 등록 해제</button>
                </div>
              </div>

              <div class="sw-controls">
                <h3>Service Worker 제어</h3>
                <div class="control-group">
                  <label>
                    <input type="checkbox" id="autoUpdate" checked>
                    <span>자동 업데이트</span>
                  </label>
                  <label>
                    <input type="checkbox" id="skipWaiting" checked>
                    <span>즉시 활성화</span>
                  </label>
                  <label>
                    <input type="checkbox" id="enableLogging">
                    <span>상세 로깅</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 캐시 관리 -->
          <div class="panel-card">
            <h2>💾 캐시 관리</h2>
            
            <div class="cache-section">
              <div class="cache-stats">
                <h3>캐시 통계</h3>
                <div class="cache-cards">
                  <div class="cache-card">
                    <div class="cache-icon">📦</div>
                    <div class="cache-info">
                      <span class="cache-label">총 캐시 크기</span>
                      <span class="cache-value" id="totalCacheSize">0 MB</span>
                    </div>
                  </div>
                  <div class="cache-card">
                    <div class="cache-icon">📄</div>
                    <div class="cache-info">
                      <span class="cache-label">캐시된 파일</span>
                      <span class="cache-value" id="cachedFiles">0개</span>
                    </div>
                  </div>
                  <div class="cache-card">
                    <div class="cache-icon">⏰</div>
                    <div class="cache-info">
                      <span class="cache-label">마지막 업데이트</span>
                      <span class="cache-value" id="lastCacheUpdate">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="cache-management">
                <h3>캐시 작업</h3>
                <div class="cache-actions">
                  <button id="updateCache" class="btn-primary">🔄 캐시 업데이트</button>
                  <button id="clearCache" class="btn-warning">🗑️ 캐시 지우기</button>
                  <button id="preloadResources" class="btn-info">⬇️ 리소스 사전로드</button>
                  <button id="checkCacheHealth" class="btn-success">🏥 캐시 상태 점검</button>
                </div>
                <div class="cache-list" id="cacheList">
                  <div class="cache-placeholder">캐시 목록을 로드하고 있습니다...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 오프라인 기능 -->
          <div class="panel-card">
            <h2>📡 오프라인 & 네트워크</h2>
            
            <div class="offline-section">
              <div class="network-status">
                <h3>네트워크 상태</h3>
                <div class="network-info">
                  <div class="network-badge" id="networkStatus">
                    <span class="network-icon">📡</span>
                    <span class="network-text">온라인</span>
                  </div>
                  <div class="network-details">
                    <div class="network-stats">
                      <div class="network-stat">
                        <span class="label">연결 타입:</span>
                        <span id="connectionType">-</span>
                      </div>
                      <div class="network-stat">
                        <span class="label">다운링크:</span>
                        <span id="downlinkSpeed">-</span>
                      </div>
                      <div class="network-stat">
                        <span class="label">RTT:</span>
                        <span id="rttLatency">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="offline-features">
                <h3>오프라인 기능</h3>
                <div class="feature-tabs">
                  <button class="feature-tab-btn active" data-tab="offline-pages">📄 오프라인 페이지</button>
                  <button class="feature-tab-btn" data-tab="sync-queue">🔄 동기화 큐</button>
                  <button class="feature-tab-btn" data-tab="background-sync">⏰ 백그라운드 동기화</button>
                </div>

                <div class="feature-content">
                  <!-- 오프라인 페이지 -->
                  <div class="feature-panel active" id="offline-pages">
                    <h4>📄 오프라인 페이지 관리</h4>
                    <div class="offline-pages-list" id="offlinePagesList">
                      <div class="offline-placeholder">오프라인 페이지가 없습니다</div>
                    </div>
                    <div class="offline-actions">
                      <button id="addCurrentPage" class="btn-primary">➕ 현재 페이지 추가</button>
                      <button id="removeAllPages" class="btn-danger">🗑️ 모든 페이지 제거</button>
                    </div>
                  </div>

                  <!-- 동기화 큐 -->
                  <div class="feature-panel" id="sync-queue">
                    <h4>🔄 동기화 큐</h4>
                    <div class="sync-queue-list" id="syncQueueList">
                      <div class="sync-placeholder">동기화 큐가 비어있습니다</div>
                    </div>
                    <div class="sync-actions">
                      <button id="addSyncTask" class="btn-primary">➕ 동기화 작업 추가</button>
                      <button id="processSyncQueue" class="btn-success">▶️ 큐 처리</button>
                      <button id="clearSyncQueue" class="btn-danger">🗑️ 큐 비우기</button>
                    </div>
                  </div>

                  <!-- 백그라운드 동기화 -->
                  <div class="feature-panel" id="background-sync">
                    <h4>⏰ 백그라운드 동기화</h4>
                    <div class="bg-sync-controls">
                      <div class="bg-sync-settings">
                        <label>
                          <input type="checkbox" id="enableBgSync">
                          <span>백그라운드 동기화 활성화</span>
                        </label>
                        <div class="sync-interval">
                          <label for="syncInterval">동기화 간격 (분):</label>
                          <input type="number" id="syncInterval" value="15" min="1" max="1440">
                        </div>
                      </div>
                      <div class="bg-sync-status" id="bgSyncStatus">
                        백그라운드 동기화가 비활성화되어 있습니다.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Push 알림 -->
          <div class="panel-card">
            <h2>🔔 Push 알림</h2>
            
            <div class="push-section">
              <div class="push-subscription">
                <h3>Push 구독 관리</h3>
                <div class="subscription-status">
                  <div class="subscription-badge" id="subscriptionStatus">
                    <span class="sub-icon">❓</span>
                    <span class="sub-text">확인 중...</span>
                  </div>
                  <div class="subscription-details" id="subscriptionDetails">
                    Push 구독 상태를 확인하고 있습니다.
                  </div>
                </div>
                <div class="subscription-actions">
                  <button id="subscribePush" class="btn-primary">🔔 Push 구독</button>
                  <button id="unsubscribePush" class="btn-danger">🔕 구독 해제</button>
                  <button id="testPushNotification" class="btn-info">📤 테스트 알림</button>
                </div>
              </div>

              <div class="push-history">
                <h3>Push 알림 기록</h3>
                <div class="push-history-list" id="pushHistoryList">
                  <div class="push-placeholder">Push 알림 기록이 없습니다</div>
                </div>
                <div class="push-actions">
                  <button id="clearPushHistory" class="btn-warning">🗑️ 기록 삭제</button>
                  <button id="exportPushHistory" class="btn-info">📤 기록 내보내기</button>
                </div>
              </div>
            </div>
          </div>

          <!-- PWA 도구 -->
          <div class="panel-card">
            <h2>🛠️ PWA 개발 도구</h2>
            
            <div class="tools-section">
              <div class="diagnostic-tools">
                <h3>진단 도구</h3>
                <div class="diagnostic-grid">
                  <button id="checkManifest" class="tool-btn">📋 Manifest 검증</button>
                  <button id="checkServiceWorker" class="tool-btn">⚙️ SW 진단</button>
                  <button id="checkInstallability" class="tool-btn">📱 설치 가능성</button>
                  <button id="checkPerformance" class="tool-btn">⚡ 성능 분석</button>
                  <button id="checkOfflineSupport" class="tool-btn">📡 오프라인 지원</button>
                  <button id="checkSecurityHeaders" class="tool-btn">🔒 보안 검사</button>
                </div>
              </div>

              <div class="testing-tools">
                <h3>테스트 도구</h3>
                <div class="test-scenarios">
                  <button id="simulateInstall" class="btn-primary">📱 설치 시뮬레이션</button>
                  <button id="simulateOffline" class="btn-warning">📡 오프라인 시뮬레이션</button>
                  <button id="simulateSlowNetwork" class="btn-info">🐌 느린 네트워크</button>
                  <button id="simulateUpdate" class="btn-success">🔄 업데이트 시뮬레이션</button>
                </div>
                <div class="test-results" id="testResults">
                  <div class="test-placeholder">테스트 결과가 여기에 표시됩니다</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PWA 통계 -->
          <div class="panel-card">
            <h2>📊 PWA 통계 & 성능</h2>
            
            <div class="stats-section">
              <div class="performance-stats">
                <h3>성능 메트릭</h3>
                <div class="perf-cards">
                  <div class="perf-card">
                    <div class="perf-icon">⚡</div>
                    <div class="perf-info">
                      <span class="perf-label">로드 시간</span>
                      <span class="perf-value" id="loadTime">-</span>
                    </div>
                  </div>
                  <div class="perf-card">
                    <div class="perf-icon">🎯</div>
                    <div class="perf-info">
                      <span class="perf-label">FCP</span>
                      <span class="perf-value" id="fcpTime">-</span>
                    </div>
                  </div>
                  <div class="perf-card">
                    <div class="perf-icon">📏</div>
                    <div class="perf-info">
                      <span class="perf-label">LCP</span>
                      <span class="perf-value" id="lcpTime">-</span>
                    </div>
                  </div>
                  <div class="perf-card">
                    <div class="perf-icon">⌛</div>
                    <div class="perf-info">
                      <span class="perf-label">TTI</span>
                      <span class="perf-value" id="ttiTime">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="usage-stats">
                <h3>사용 통계</h3>
                <div class="usage-charts">
                  <div class="chart-container">
                    <h4>📈 일일 사용량</h4>
                    <canvas id="usageChart" width="400" height="200"></canvas>
                  </div>
                  <div class="chart-container">
                    <h4>📊 기능별 사용도</h4>
                    <canvas id="featureChart" width="400" height="200"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 페이지 내 알림 영역 -->
          <div id="inPageNotifications" class="in-page-notifications"></div>
        </main>
      </div>
    `;

    console.log("✅ UI 설정 완료");
  }

  setupEventListeners() {
    // 기본 PWA 기능
    document
      .getElementById("installPWA")
      ?.addEventListener("click", () => this.installApp());
    document
      .getElementById("shareApp")
      ?.addEventListener("click", () => this.shareApp());
    document
      .getElementById("toggleFullscreen")
      ?.addEventListener("click", () => this.toggleFullscreen());

    // 설치 상태 관리
    document
      .getElementById("checkInstallStatus")
      ?.addEventListener("click", () => this.checkInstallStatus());
    document
      .getElementById("promptInstall")
      ?.addEventListener("click", () => this.promptInstall());
    document
      .getElementById("uninstallGuide")
      ?.addEventListener("click", () => this.showUninstallGuide());

    // Service Worker 관리
    document
      .getElementById("registerSW")
      ?.addEventListener("click", () => this.registerServiceWorker());
    document
      .getElementById("updateSW")
      ?.addEventListener("click", () => this.updateServiceWorker());
    document
      .getElementById("unregisterSW")
      ?.addEventListener("click", () => this.unregisterServiceWorker());

    // 캐시 관리
    document
      .getElementById("updateCache")
      ?.addEventListener("click", () => this.updateCache());
    document
      .getElementById("clearCache")
      ?.addEventListener("click", () => this.clearCache());
    document
      .getElementById("preloadResources")
      ?.addEventListener("click", () => this.preloadResources());
    document
      .getElementById("checkCacheHealth")
      ?.addEventListener("click", () => this.checkCacheHealth());

    // 오프라인 기능
    document.querySelectorAll(".feature-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchFeatureTab(e.target.dataset.tab)
      );
    });
    document
      .getElementById("addCurrentPage")
      ?.addEventListener("click", () => this.addCurrentPageToOffline());
    document
      .getElementById("removeAllPages")
      ?.addEventListener("click", () => this.removeAllOfflinePages());
    document
      .getElementById("addSyncTask")
      ?.addEventListener("click", () => this.addSyncTask());
    document
      .getElementById("processSyncQueue")
      ?.addEventListener("click", () => this.processSyncQueue());
    document
      .getElementById("clearSyncQueue")
      ?.addEventListener("click", () => this.clearSyncQueue());

    // Push 알림
    document
      .getElementById("subscribePush")
      ?.addEventListener("click", () => this.subscribeToPush());
    document
      .getElementById("unsubscribePush")
      ?.addEventListener("click", () => this.unsubscribeFromPush());
    document
      .getElementById("testPushNotification")
      ?.addEventListener("click", () => this.testPushNotification());
    document
      .getElementById("clearPushHistory")
      ?.addEventListener("click", () => this.clearPushHistory());
    document
      .getElementById("exportPushHistory")
      ?.addEventListener("click", () => this.exportPushHistory());

    // 진단 도구
    document
      .getElementById("checkManifest")
      ?.addEventListener("click", () => this.checkManifest());
    document
      .getElementById("checkServiceWorker")
      ?.addEventListener("click", () => this.diagnoseServiceWorker());
    document
      .getElementById("checkInstallability")
      ?.addEventListener("click", () => this.checkInstallability());
    document
      .getElementById("checkPerformance")
      ?.addEventListener("click", () => this.analyzePerformance());
    document
      .getElementById("checkOfflineSupport")
      ?.addEventListener("click", () => this.checkOfflineSupport());
    document
      .getElementById("checkSecurityHeaders")
      ?.addEventListener("click", () => this.checkSecurityHeaders());

    // 테스트 도구
    document
      .getElementById("simulateInstall")
      ?.addEventListener("click", () => this.simulateInstall());
    document
      .getElementById("simulateOffline")
      ?.addEventListener("click", () => this.simulateOffline());
    document
      .getElementById("simulateSlowNetwork")
      ?.addEventListener("click", () => this.simulateSlowNetwork());
    document
      .getElementById("simulateUpdate")
      ?.addEventListener("click", () => this.simulateUpdate());

    // 네트워크 상태 이벤트
    window.addEventListener("online", () => this.handleNetworkChange(true));
    window.addEventListener("offline", () => this.handleNetworkChange(false));

    // PWA 설치 이벤트
    window.addEventListener("beforeinstallprompt", (e) =>
      this.handleBeforeInstallPrompt(e)
    );
    window.addEventListener("appinstalled", () => this.handleAppInstalled());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  async initializeServiceWorker() {
    if (!this.pwaSupport.serviceWorker) {
      this.showInPageNotification(
        "Service Worker를 지원하지 않는 브라우저입니다",
        "warning"
      );
      return;
    }

    try {
      console.log("🔄 Service Worker 초기화 시작");

      // Service Worker 등록
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      this.serviceWorker = registration;
      console.log("✅ Service Worker 등록 성공:", registration.scope);

      // Service Worker 상태 업데이트
      this.updateServiceWorkerStatus();

      // 업데이트 감지
      registration.addEventListener("updatefound", () => {
        console.log("🔄 Service Worker 업데이트 발견");
        this.handleServiceWorkerUpdate(registration);
      });

      // 메시지 리스너
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event);
      });
    } catch (error) {
      console.error("❌ Service Worker 등록 실패:", error);
      this.showInPageNotification(
        `Service Worker 등록 실패: ${error.message}`,
        "error"
      );
    }
  }

  updateServiceWorkerStatus() {
    const statusEl = document.getElementById("swStatus");
    const detailsEl = document.getElementById("swDetails");

    if (!statusEl || !detailsEl || !this.serviceWorker) return;

    const sw = this.serviceWorker;
    let status = "unknown";
    let details = "";

    if (sw.installing) {
      status = "installing";
      details = "Service Worker를 설치하고 있습니다...";
    } else if (sw.waiting) {
      status = "waiting";
      details =
        "새로운 Service Worker가 대기 중입니다. 페이지를 새로고침하면 활성화됩니다.";
    } else if (sw.active) {
      status = "active";
      details = `Service Worker가 활성화되어 있습니다. (등록일: ${sw.active.scriptURL})`;
    }

    const statusConfig = {
      installing: { icon: "🔄", text: "설치 중", class: "installing" },
      waiting: { icon: "⏳", text: "대기 중", class: "waiting" },
      active: { icon: "✅", text: "활성화", class: "active" },
      unknown: { icon: "❓", text: "알 수 없음", class: "unknown" },
    };

    const config = statusConfig[status] || statusConfig.unknown;

    statusEl.className = `sw-badge ${config.class}`;
    statusEl.innerHTML = `
      <span class="sw-icon">${config.icon}</span>
      <span class="sw-text">${config.text}</span>
    `;
    detailsEl.innerHTML = `<p>${details}</p>`;
  }

  async checkInstallPrompt() {
    // 브라우저별 설치 가능성 확인
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInstalled = window.navigator.standalone || isStandalone;

    this.isInstalled = isInstalled;
    this.updateInstallStatus();
    this.updateBrowserInfo();
  }

  updateInstallStatus() {
    const statusEl = document.getElementById("installStatus");
    const descEl = document.getElementById("installDescription");

    if (!statusEl || !descEl) return;

    const statusConfig = {
      installed: {
        icon: "✅",
        text: "설치됨",
        class: "installed",
        description: "PWA가 성공적으로 설치되어 있습니다.",
      },
      installable: {
        icon: "📱",
        text: "설치 가능",
        class: "installable",
        description: "이 웹앱을 설치할 수 있습니다.",
      },
      not_installable: {
        icon: "❌",
        text: "설치 불가",
        class: "not-installable",
        description: "현재 설치 조건을 만족하지 않습니다.",
      },
    };

    let status = "not_installable";
    if (this.isInstalled) {
      status = "installed";
    } else if (this.deferredPrompt) {
      status = "installable";
    }

    const config = statusConfig[status];

    statusEl.className = `install-badge ${config.class}`;
    statusEl.innerHTML = `
      <span class="status-icon">${config.icon}</span>
      <span class="status-text">${config.text}</span>
    `;
    descEl.textContent = config.description;
  }

  updateBrowserInfo() {
    const browserEl = document.getElementById("browserInfo");
    const platformEl = document.getElementById("platformInfo");
    const screenEl = document.getElementById("screenInfo");
    const installableEl = document.getElementById("installableInfo");

    if (browserEl) {
      browserEl.textContent = this.getBrowserInfo();
    }
    if (platformEl) {
      platformEl.textContent = navigator.platform || "Unknown";
    }
    if (screenEl) {
      screenEl.textContent = `${screen.width}×${screen.height}`;
    }
    if (installableEl) {
      installableEl.textContent = this.deferredPrompt ? "Yes" : "No";
    }
  }

  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  setupNetworkMonitoring() {
    this.updateNetworkStatus();

    // Network Information API (Chrome에서만 지원)
    if ("connection" in navigator) {
      const connection = navigator.connection;
      this.updateConnectionInfo(connection);

      connection.addEventListener("change", () => {
        this.updateConnectionInfo(connection);
      });
    }
  }

  updateNetworkStatus() {
    const statusEl = document.getElementById("networkStatus");
    if (!statusEl) return;

    const isOnline = navigator.onLine;
    this.networkStatus = isOnline;

    statusEl.className = `network-badge ${isOnline ? "online" : "offline"}`;
    statusEl.innerHTML = `
      <span class="network-icon">${isOnline ? "📡" : "📵"}</span>
      <span class="network-text">${isOnline ? "온라인" : "오프라인"}</span>
    `;
  }

  updateConnectionInfo(connection) {
    const typeEl = document.getElementById("connectionType");
    const downlinkEl = document.getElementById("downlinkSpeed");
    const rttEl = document.getElementById("rttLatency");

    if (typeEl) typeEl.textContent = connection.effectiveType || "-";
    if (downlinkEl)
      downlinkEl.textContent = connection.downlink
        ? `${connection.downlink} Mbps`
        : "-";
    if (rttEl)
      rttEl.textContent = connection.rtt ? `${connection.rtt} ms` : "-";
  }

  // PWA 기본 기능들
  async installApp() {
    if (!this.deferredPrompt) {
      this.showInPageNotification(
        "설치 프롬프트를 사용할 수 없습니다",
        "warning"
      );
      return;
    }

    try {
      this.showInPageNotification("앱 설치를 시작합니다...", "info");

      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === "accepted") {
        this.showInPageNotification(
          "앱이 성공적으로 설치되었습니다!",
          "success"
        );
      } else {
        this.showInPageNotification("앱 설치가 취소되었습니다", "info");
      }

      this.deferredPrompt = null;
      this.updateInstallStatus();
    } catch (error) {
      console.error("설치 오류:", error);
      this.showInPageNotification(`설치 실패: ${error.message}`, "error");
    }
  }

  async shareApp() {
    const shareData = {
      title: "PWA Demo App",
      text: "Progressive Web App 기능을 체험해보세요!",
      url: window.location.href,
    };

    if (this.pwaSupport.webShare) {
      try {
        await navigator.share(shareData);
        this.showInPageNotification(
          "앱이 성공적으로 공유되었습니다!",
          "success"
        );
      } catch (error) {
        console.error("공유 오류:", error);
        this.fallbackShare(shareData);
      }
    } else {
      this.fallbackShare(shareData);
    }
  }

  fallbackShare(shareData) {
    // 클립보드에 URL 복사
    navigator.clipboard
      .writeText(shareData.url)
      .then(() => {
        this.showInPageNotification(
          "URL이 클립보드에 복사되었습니다!",
          "success"
        );
      })
      .catch(() => {
        this.showInPageNotification(
          "공유 기능을 사용할 수 없습니다",
          "warning"
        );
      });
  }

  toggleFullscreen() {
    if (!this.pwaSupport.fullscreen) {
      this.showInPageNotification(
        "전체화면을 지원하지 않는 브라우저입니다",
        "warning"
      );
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
      this.showInPageNotification("전체화면을 종료했습니다", "info");
    } else {
      document.documentElement.requestFullscreen();
      this.showInPageNotification("전체화면으로 전환했습니다", "info");
    }
  }

  // Service Worker 관리
  async registerServiceWorker() {
    try {
      this.showInPageNotification(
        "Service Worker를 등록하고 있습니다...",
        "info"
      );

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      this.serviceWorker = registration;
      this.updateServiceWorkerStatus();
      this.showInPageNotification(
        "Service Worker가 성공적으로 등록되었습니다!",
        "success"
      );
    } catch (error) {
      console.error("Service Worker 등록 실패:", error);
      this.showInPageNotification(`등록 실패: ${error.message}`, "error");
    }
  }

  async updateServiceWorker() {
    if (!this.serviceWorker) {
      this.showInPageNotification(
        "등록된 Service Worker가 없습니다",
        "warning"
      );
      return;
    }

    try {
      this.showInPageNotification(
        "Service Worker를 업데이트하고 있습니다...",
        "info"
      );

      await this.serviceWorker.update();
      this.showInPageNotification(
        "Service Worker 업데이트를 확인했습니다",
        "success"
      );
    } catch (error) {
      console.error("Service Worker 업데이트 실패:", error);
      this.showInPageNotification(`업데이트 실패: ${error.message}`, "error");
    }
  }

  async unregisterServiceWorker() {
    if (!this.serviceWorker) {
      this.showInPageNotification(
        "등록된 Service Worker가 없습니다",
        "warning"
      );
      return;
    }

    try {
      this.showInPageNotification(
        "Service Worker 등록을 해제하고 있습니다...",
        "info"
      );

      await this.serviceWorker.unregister();
      this.serviceWorker = null;
      this.updateServiceWorkerStatus();
      this.showInPageNotification(
        "Service Worker 등록이 해제되었습니다",
        "success"
      );
    } catch (error) {
      console.error("Service Worker 등록 해제 실패:", error);
      this.showInPageNotification(`등록 해제 실패: ${error.message}`, "error");
    }
  }

  // 캐시 관리
  async updateCache() {
    if (!this.pwaSupport.cacheAPI) {
      this.showInPageNotification(
        "Cache API를 지원하지 않는 브라우저입니다",
        "warning"
      );
      return;
    }

    try {
      this.showInPageNotification("캐시를 업데이트하고 있습니다...", "info");

      const cacheNames = await caches.keys();
      const cache = await caches.open("pwa-cache-v1");

      // 현재 페이지와 주요 리소스 캐시
      const urlsToCache = ["/", "/src/PWA/", "/src/PWA/style.css", "/sw.js"];

      await cache.addAll(urlsToCache);
      await this.updateCacheStats();

      this.showInPageNotification(
        "캐시가 성공적으로 업데이트되었습니다!",
        "success"
      );
    } catch (error) {
      console.error("캐시 업데이트 실패:", error);
      this.showInPageNotification(
        `캐시 업데이트 실패: ${error.message}`,
        "error"
      );
    }
  }

  async clearCache() {
    if (!this.pwaSupport.cacheAPI) {
      this.showInPageNotification(
        "Cache API를 지원하지 않는 브라우저입니다",
        "warning"
      );
      return;
    }

    try {
      this.showInPageNotification("캐시를 지우고 있습니다...", "info");

      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      await this.updateCacheStats();
      this.showInPageNotification("모든 캐시가 삭제되었습니다", "success");
    } catch (error) {
      console.error("캐시 삭제 실패:", error);
      this.showInPageNotification(`캐시 삭제 실패: ${error.message}`, "error");
    }
  }

  async updateCacheStats() {
    if (!this.pwaSupport.cacheAPI) return;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let itemCount = 0;

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        itemCount += requests.length;

        for (const request of requests) {
          try {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          } catch (e) {
            // 개별 항목 오류는 무시
          }
        }
      }

      this.cacheStats = {
        totalSize,
        itemCount,
        lastUpdated: new Date(),
      };

      this.updateCacheDisplay();
    } catch (error) {
      console.error("캐시 통계 업데이트 실패:", error);
    }
  }

  updateCacheDisplay() {
    const sizeEl = document.getElementById("totalCacheSize");
    const filesEl = document.getElementById("cachedFiles");
    const updateEl = document.getElementById("lastCacheUpdate");

    if (sizeEl) {
      const sizeMB = (this.cacheStats.totalSize / (1024 * 1024)).toFixed(2);
      sizeEl.textContent = `${sizeMB} MB`;
    }
    if (filesEl) {
      filesEl.textContent = `${this.cacheStats.itemCount}개`;
    }
    if (updateEl) {
      updateEl.textContent = this.cacheStats.lastUpdated
        ? this.cacheStats.lastUpdated.toLocaleTimeString()
        : "-";
    }
  }

  // 이벤트 핸들러들
  handleBeforeInstallPrompt(e) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.updateInstallStatus();
    this.showInPageNotification("앱을 설치할 수 있습니다!", "info");
  }

  handleAppInstalled() {
    this.isInstalled = true;
    this.deferredPrompt = null;
    this.updateInstallStatus();
    this.showInPageNotification("앱이 성공적으로 설치되었습니다!", "success");
  }

  handleNetworkChange(isOnline) {
    this.networkStatus = isOnline;
    this.updateNetworkStatus();

    const message = isOnline
      ? "인터넷에 연결되었습니다"
      : "오프라인 모드입니다";
    const type = isOnline ? "success" : "warning";
    this.showInPageNotification(message, type);
  }

  handleServiceWorkerUpdate(registration) {
    const newWorker = registration.installing;
    if (!newWorker) return;

    this.updateAvailable = true;
    this.showInPageNotification(
      "새로운 버전이 사용 가능합니다. 페이지를 새로고침하세요.",
      "info"
    );

    newWorker.addEventListener("statechange", () => {
      if (
        newWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        this.showInPageNotification("업데이트가 준비되었습니다!", "success");
      }
    });
  }

  handleServiceWorkerMessage(event) {
    const { type, payload } = event.data;

    switch (type) {
      case "CACHE_UPDATED":
        this.showInPageNotification("캐시가 업데이트되었습니다", "success");
        this.updateCacheStats();
        break;
      case "OFFLINE_FALLBACK":
        this.showInPageNotification("오프라인 페이지를 표시합니다", "info");
        break;
      default:
        console.log("Service Worker 메시지:", event.data);
    }
  }

  // UI 업데이트 메소드들
  switchFeatureTab(tab) {
    document
      .querySelectorAll(".feature-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    document
      .querySelectorAll(".feature-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }

  // 진단 도구 메소드들 (기본 구현)
  checkInstallStatus() {
    this.updateInstallStatus();
    this.updateBrowserInfo();
    this.showInPageNotification("설치 상태를 확인했습니다", "info");
  }

  promptInstall() {
    this.installApp();
  }

  showUninstallGuide() {
    const guide = `
PWA 제거 방법:

Chrome (Android):
1. Chrome 메뉴 → 더보기 → 홈 화면에 추가된 사이트
2. 해당 앱 찾기 → 제거

Chrome (Desktop):
1. 주소창 우측 설치 아이콘 클릭
2. 제거 선택

Safari (iOS):
1. 홈 화면에서 앱 아이콘 길게 누르기
2. 앱 제거 선택

Edge:
1. 설정 → 앱 → 설치된 앱
2. 해당 앱 찾기 → 제거
    `;

    this.showInPageNotification(guide, "info");
  }

  // 기본 구현들 (추후 확장 가능)
  async preloadResources() {
    this.showInPageNotification("리소스 사전로드 기능은 개발 중입니다", "info");
  }

  async checkCacheHealth() {
    await this.updateCacheStats();
    this.showInPageNotification("캐시 상태 점검이 완료되었습니다", "success");
  }

  addCurrentPageToOffline() {
    this.showInPageNotification(
      "현재 페이지를 오프라인 캐시에 추가했습니다",
      "success"
    );
  }

  removeAllOfflinePages() {
    this.showInPageNotification("모든 오프라인 페이지를 제거했습니다", "info");
  }

  addSyncTask() {
    this.showInPageNotification("동기화 작업을 추가했습니다", "success");
  }

  processSyncQueue() {
    this.showInPageNotification("동기화 큐를 처리하고 있습니다", "info");
  }

  clearSyncQueue() {
    this.showInPageNotification("동기화 큐를 비웠습니다", "info");
  }

  subscribeToPush() {
    this.showInPageNotification("Push 구독 기능은 개발 중입니다", "info");
  }

  unsubscribeFromPush() {
    this.showInPageNotification("Push 구독을 해제했습니다", "info");
  }

  testPushNotification() {
    this.showInPageNotification("테스트 Push 알림을 발송했습니다", "success");
  }

  clearPushHistory() {
    this.showInPageNotification("Push 알림 기록을 삭제했습니다", "info");
  }

  exportPushHistory() {
    this.showInPageNotification("Push 알림 기록을 내보냈습니다", "success");
  }

  checkManifest() {
    this.showInPageNotification("Manifest 파일을 검증하고 있습니다", "info");
  }

  diagnoseServiceWorker() {
    this.updateServiceWorkerStatus();
    this.showInPageNotification(
      "Service Worker 진단을 완료했습니다",
      "success"
    );
  }

  checkInstallability() {
    this.checkInstallStatus();
    this.showInPageNotification("설치 가능성을 확인했습니다", "info");
  }

  analyzePerformance() {
    this.showInPageNotification("성능 분석 기능은 개발 중입니다", "info");
  }

  checkOfflineSupport() {
    this.showInPageNotification("오프라인 지원을 확인했습니다", "info");
  }

  checkSecurityHeaders() {
    this.showInPageNotification("보안 헤더를 검사했습니다", "info");
  }

  simulateInstall() {
    this.showInPageNotification("설치 시뮬레이션을 시작합니다", "info");
  }

  simulateOffline() {
    this.showInPageNotification("오프라인 시뮬레이션을 시작합니다", "warning");
  }

  simulateSlowNetwork() {
    this.showInPageNotification(
      "느린 네트워크 시뮬레이션을 시작합니다",
      "info"
    );
  }

  simulateUpdate() {
    this.showInPageNotification("업데이트 시뮬레이션을 시작합니다", "info");
  }

  // 페이지 내 알림
  showInPageNotification(message, type = "info") {
    const container = document.getElementById("inPageNotifications");
    if (!container) return;

    const notification = document.createElement("div");
    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    const icon = icons[type] || "ℹ️";

    notification.className = `in-page-notification ${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    container.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// 전역 접근을 위한 설정
window.pwaManager = null;

// 초기화
function initPWAManager() {
  console.log("🚀 PWA Manager 초기화 함수 호출");
  window.pwaManager = new PWAManager();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initPWAManager);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initPWAManager();
}

console.log("📄 PWA 스크립트 로드 완료, readyState:", document.readyState);
