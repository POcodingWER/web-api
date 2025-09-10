import "./style.css";

console.log("💾 Device Memory API 스크립트 시작!");

class DeviceMemoryAPI {
  constructor() {
    this.memoryInfo = {
      deviceMemory: null,
      approximateMemory: null,
      memoryTier: null,
      supportLevel: "unknown",
    };
    this.performanceMode = "auto";
    this.monitoringInterval = null;
    this.init();
  }

  init() {
    console.log("💾 Device Memory API 초기화 시작");
    this.detectDeviceMemory();
    this.setupUI();
    this.setupEventListeners();
    this.startMemoryMonitoring();
    console.log("✅ Device Memory API 초기화 완료");
  }

  detectDeviceMemory() {
    console.log("🔍 디바이스 메모리 감지 중...");

    // Device Memory API 지원 확인
    if ("deviceMemory" in navigator) {
      this.memoryInfo.deviceMemory = navigator.deviceMemory;
      this.memoryInfo.supportLevel = "full";
      this.memoryInfo.approximateMemory = this.getApproximateMemory(
        navigator.deviceMemory
      );
      this.memoryInfo.memoryTier = this.getMemoryTier(navigator.deviceMemory);
      console.log(`✅ Device Memory: ${navigator.deviceMemory}GB`);
    } else {
      this.memoryInfo.supportLevel = "fallback";
      this.memoryInfo.approximateMemory = this.estimateMemoryFromOtherAPIs();
      this.memoryInfo.memoryTier = this.getMemoryTier(
        this.memoryInfo.approximateMemory
      );
      console.log("⚠️ Device Memory API 지원 안됨, 추정값 사용");
    }
  }

  getApproximateMemory(deviceMemory) {
    if (!deviceMemory) return this.estimateMemoryFromOtherAPIs();

    // Device Memory API는 2의 거듭제곱으로 반환 (0.25, 0.5, 1, 2, 4, 8GB 등)
    return deviceMemory;
  }

  estimateMemoryFromOtherAPIs() {
    let estimatedMemory = 4; // 기본값 4GB

    try {
      // Performance API를 통한 추정
      if ("memory" in performance) {
        const heapSize = performance.memory.totalJSHeapSize;
        const heapSizeGB = heapSize / (1024 * 1024 * 1024);

        // JavaScript Heap 크기를 기반으로 총 메모리 추정
        if (heapSizeGB < 0.1) estimatedMemory = 1;
        else if (heapSizeGB < 0.5) estimatedMemory = 2;
        else if (heapSizeGB < 1) estimatedMemory = 4;
        else if (heapSizeGB < 2) estimatedMemory = 8;
        else estimatedMemory = 16;
      }

      // Hardware Concurrency를 통한 보조 추정
      if ("hardwareConcurrency" in navigator) {
        const cores = navigator.hardwareConcurrency;
        // 일반적으로 코어당 1-2GB 정도로 추정
        const estimatedFromCores = cores * 1.5;

        // 두 추정값의 평균 사용
        estimatedMemory = Math.round(
          (estimatedMemory + estimatedFromCores) / 2
        );
      }

      // 현실적인 범위로 제한
      if (estimatedMemory < 1) estimatedMemory = 1;
      if (estimatedMemory > 32) estimatedMemory = 32;
    } catch (error) {
      console.warn("메모리 추정 중 오류:", error);
    }

    return estimatedMemory;
  }

  getMemoryTier(memory) {
    if (!memory) return "unknown";

    if (memory <= 1) return "low"; // 1GB 이하
    if (memory <= 2) return "medium-low"; // 2GB
    if (memory <= 4) return "medium"; // 4GB
    if (memory <= 8) return "medium-high"; // 8GB
    if (memory <= 16) return "high"; // 16GB
    return "very-high"; // 16GB 초과
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }

    appDiv.innerHTML = `
      <div class="device-memory-container">
        <header class="memory-header">
          <h1>💾 Device Memory API 데모</h1>
          <p>디바이스 메모리 정보와 최적화된 사용자 경험</p>
          <div class="api-support">
            <div class="support-badge ${
              this.memoryInfo.supportLevel === "full" ? "supported" : "fallback"
            }">
              ${
                this.memoryInfo.supportLevel === "full"
                  ? "✅ 완전 지원"
                  : "⚠️ 추정값 사용"
              }
            </div>
          </div>
        </header>

        <main class="memory-main">
          <div class="memory-info-section">
            <div class="memory-card primary">
              <h2>📊 디바이스 메모리 정보</h2>
              <div class="memory-details">
                <div class="memory-item">
                  <span class="label">감지된 메모리:</span>
                  <span class="value" id="deviceMemoryValue">
                    ${
                      this.memoryInfo.deviceMemory ||
                      this.memoryInfo.approximateMemory
                    }GB
                    ${
                      this.memoryInfo.supportLevel === "fallback"
                        ? " (추정)"
                        : ""
                    }
                  </span>
                </div>
                <div class="memory-item">
                  <span class="label">메모리 등급:</span>
                  <span class="value memory-tier ${
                    this.memoryInfo.memoryTier
                  }" id="memoryTier">
                    ${this.getTierDisplayName(this.memoryInfo.memoryTier)}
                  </span>
                </div>
                <div class="memory-item">
                  <span class="label">추천 성능 모드:</span>
                  <span class="value" id="recommendedMode">
                    ${this.getRecommendedPerformanceMode()}
                  </span>
                </div>
              </div>
            </div>

            <div class="memory-card">
              <h2>🔧 성능 최적화 설정</h2>
              <div class="performance-controls">
                <div class="control-group">
                  <label for="performanceMode">성능 모드:</label>
                  <select id="performanceMode" class="mode-select">
                    <option value="auto">🤖 자동 (추천)</option>
                    <option value="low">🐌 절약 모드</option>
                    <option value="medium">⚖️ 균형 모드</option>
                    <option value="high">🚀 고성능 모드</option>
                  </select>
                </div>
                
                <div class="current-settings" id="currentSettings">
                  <h3>현재 설정:</h3>
                  <div class="setting-item">
                    <span class="setting-label">이미지 품질:</span>
                    <span class="setting-value" id="imageQuality">자동</span>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">애니메이션:</span>
                    <span class="setting-value" id="animationLevel">자동</span>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">캐싱 전략:</span>
                    <span class="setting-value" id="cachingStrategy">자동</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="monitoring-section">
            <div class="memory-card">
              <h2>📈 실시간 메모리 모니터링</h2>
              <div class="monitoring-controls">
                <button id="startMonitoring" class="btn-primary">▶️ 모니터링 시작</button>
                <button id="stopMonitoring" class="btn-secondary">⏸️ 모니터링 중지</button>
                <button id="clearMonitoring" class="btn-danger">🧹 기록 지우기</button>
              </div>
              
              <div class="memory-stats" id="memoryStats">
                <div class="stat-item">
                  <span class="stat-label">사용된 JS Heap:</span>
                  <span class="stat-value" id="usedJSHeap">-</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">총 JS Heap:</span>
                  <span class="stat-value" id="totalJSHeap">-</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">JS Heap 한계:</span>
                  <span class="stat-value" id="jsHeapLimit">-</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">메모리 사용률:</span>
                  <span class="stat-value" id="memoryUsage">-</span>
                </div>
              </div>

              <div class="memory-chart" id="memoryChart">
                <canvas id="memoryCanvas" width="400" height="200"></canvas>
              </div>
            </div>

            <div class="memory-card">
              <h2>🎯 적응형 콘텐츠 데모</h2>
              <div class="adaptive-content" id="adaptiveContent">
                <div class="content-explanation">
                  <p>메모리 등급에 따라 다른 콘텐츠를 제공합니다:</p>
                </div>
                
                <div class="image-demo">
                  <h3>📸 이미지 품질 적응</h3>
                  <div class="image-container">
                    <div class="image-placeholder" id="adaptiveImage">
                      이미지가 메모리에 따라 로드됩니다
                    </div>
                  </div>
                </div>

                <div class="animation-demo">
                  <h3>🎭 애니메이션 적응</h3>
                  <div class="animation-container">
                    <div class="animated-element" id="animatedElement">
                      애니메이션 요소
                    </div>
                  </div>
                </div>

                <div class="content-density">
                  <h3>📄 콘텐츠 밀도 적응</h3>
                  <div class="content-grid" id="contentGrid">
                    <!-- 메모리에 따라 동적 생성 -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="usage-section">
            <div class="memory-card">
              <h2>💡 Device Memory API 활용법</h2>
              <div class="usage-content">
                <div class="code-example">
                  <h3>기본 사용법:</h3>
                  <pre><code>// Device Memory 확인
if ('deviceMemory' in navigator) {
  const memory = navigator.deviceMemory;
  console.log(\`디바이스 메모리: \${memory}GB\`);
  
  // 메모리에 따른 최적화
  if (memory <= 2) {
    // 저사양 디바이스 최적화
    loadLowResImages();
    disableHeavyAnimations();
  } else if (memory >= 8) {
    // 고사양 디바이스 최적화
    loadHighResImages();
    enableRichAnimations();
  }
} else {
  // Fallback 처리
  console.log('Device Memory API 지원 안됨');
}</code></pre>
                </div>

                <div class="tips-section">
                  <h3>🚀 최적화 팁:</h3>
                  <ul class="tips-list">
                    <li><strong>이미지 품질 조절:</strong> 저메모리 기기에는 압축된 이미지 제공</li>
                    <li><strong>애니메이션 제어:</strong> 메모리가 부족하면 애니메이션 단순화</li>
                    <li><strong>캐싱 전략:</strong> 메모리 여유에 따라 캐시 크기 조절</li>
                    <li><strong>콘텐츠 지연로딩:</strong> 저메모리에서는 더 적극적인 lazy loading</li>
                    <li><strong>번들 크기:</strong> 메모리에 따라 다른 번들 제공</li>
                  </ul>
                </div>

                <div class="browser-support">
                  <h3>🌐 브라우저 지원:</h3>
                  <div class="support-table">
                    <div class="support-row">
                      <span class="browser">Chrome</span>
                      <span class="version">63+ ✅</span>
                    </div>
                    <div class="support-row">
                      <span class="browser">Edge</span>
                      <span class="version">79+ ✅</span>
                    </div>
                    <div class="support-row">
                      <span class="browser">Firefox</span>
                      <span class="version">❌</span>
                    </div>
                    <div class="support-row">
                      <span class="browser">Safari</span>
                      <span class="version">❌</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>
      </div>
    `;

    this.updateAdaptiveContent();
    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 성능 모드 변경
    document
      .getElementById("performanceMode")
      ?.addEventListener("change", (e) => {
        this.performanceMode = e.target.value;
        this.updatePerformanceSettings();
        this.updateAdaptiveContent();
        this.showNotification(
          `성능 모드가 "${this.getPerformanceModeDisplayName()}"로 변경되었습니다`,
          "success"
        );
      });

    // 모니터링 제어
    document
      .getElementById("startMonitoring")
      ?.addEventListener("click", () => {
        this.startMemoryMonitoring();
      });

    document.getElementById("stopMonitoring")?.addEventListener("click", () => {
      this.stopMemoryMonitoring();
    });

    document
      .getElementById("clearMonitoring")
      ?.addEventListener("click", () => {
        this.clearMemoryChart();
      });

    // 초기 설정 적용
    this.updatePerformanceSettings();
    console.log("✅ 이벤트 리스너 설정 완료");
  }

  getRecommendedPerformanceMode() {
    const tier = this.memoryInfo.memoryTier;
    switch (tier) {
      case "low":
        return "🐌 절약 모드";
      case "medium-low":
        return "⚖️ 균형 모드";
      case "medium":
        return "⚖️ 균형 모드";
      case "medium-high":
        return "🚀 고성능 모드";
      case "high":
        return "🚀 고성능 모드";
      case "very-high":
        return "🚀 고성능 모드";
      default:
        return "🤖 자동";
    }
  }

  getPerformanceModeDisplayName() {
    switch (this.performanceMode) {
      case "low":
        return "절약 모드";
      case "medium":
        return "균형 모드";
      case "high":
        return "고성능 모드";
      case "auto":
        return "자동";
      default:
        return "알 수 없음";
    }
  }

  getTierDisplayName(tier) {
    switch (tier) {
      case "low":
        return "🔴 저사양 (≤1GB)";
      case "medium-low":
        return "🟡 중저사양 (2GB)";
      case "medium":
        return "🟢 중간사양 (4GB)";
      case "medium-high":
        return "🔵 중고사양 (8GB)";
      case "high":
        return "🟣 고사양 (16GB)";
      case "very-high":
        return "🌟 최고사양 (16GB+)";
      default:
        return "❓ 알 수 없음";
    }
  }

  updatePerformanceSettings() {
    const mode =
      this.performanceMode === "auto"
        ? this.getAutoMode()
        : this.performanceMode;

    const settings = this.getSettingsForMode(mode);

    document.getElementById("imageQuality").textContent = settings.imageQuality;
    document.getElementById("animationLevel").textContent =
      settings.animationLevel;
    document.getElementById("cachingStrategy").textContent =
      settings.cachingStrategy;
  }

  getAutoMode() {
    const tier = this.memoryInfo.memoryTier;
    switch (tier) {
      case "low":
      case "medium-low":
        return "low";
      case "medium":
        return "medium";
      case "medium-high":
      case "high":
      case "very-high":
        return "high";
      default:
        return "medium";
    }
  }

  getSettingsForMode(mode) {
    const settings = {
      low: {
        imageQuality: "낮음 (압축)",
        animationLevel: "최소",
        cachingStrategy: "보수적",
      },
      medium: {
        imageQuality: "중간",
        animationLevel: "기본",
        cachingStrategy: "균형",
      },
      high: {
        imageQuality: "높음",
        animationLevel: "풍부",
        cachingStrategy: "적극적",
      },
    };

    return settings[mode] || settings.medium;
  }

  updateAdaptiveContent() {
    const mode =
      this.performanceMode === "auto"
        ? this.getAutoMode()
        : this.performanceMode;

    this.updateImageDemo(mode);
    this.updateAnimationDemo(mode);
    this.updateContentGrid(mode);
  }

  updateImageDemo(mode) {
    const imageContainer = document.getElementById("adaptiveImage");
    if (!imageContainer) return;

    const imageConfigs = {
      low: { text: "📸 저화질 이미지 (압축)", bgColor: "#ffcccb" },
      medium: { text: "📸 중간 화질 이미지", bgColor: "#ffffcc" },
      high: { text: "📸 고화질 이미지 (원본)", bgColor: "#ccffcc" },
    };

    const config = imageConfigs[mode];
    imageContainer.textContent = config.text;
    imageContainer.style.backgroundColor = config.bgColor;
  }

  updateAnimationDemo(mode) {
    const animatedElement = document.getElementById("animatedElement");
    if (!animatedElement) return;

    // 기존 애니메이션 클래스 제거
    animatedElement.className = "animated-element";

    // 모드에 따른 애니메이션 클래스 추가
    switch (mode) {
      case "low":
        animatedElement.classList.add("animation-minimal");
        break;
      case "medium":
        animatedElement.classList.add("animation-basic");
        break;
      case "high":
        animatedElement.classList.add("animation-rich");
        break;
    }
  }

  updateContentGrid(mode) {
    const contentGrid = document.getElementById("contentGrid");
    if (!contentGrid) return;

    const itemCounts = {
      low: 4,
      medium: 8,
      high: 16,
    };

    const itemCount = itemCounts[mode] || 8;

    contentGrid.innerHTML = "";
    for (let i = 1; i <= itemCount; i++) {
      const item = document.createElement("div");
      item.className = "content-item";
      item.textContent = `콘텐츠 ${i}`;
      contentGrid.appendChild(item);
    }
  }

  startMemoryMonitoring() {
    if (this.monitoringInterval) {
      this.showNotification("이미 모니터링이 실행 중입니다", "warning");
      return;
    }

    if (!("memory" in performance)) {
      this.showNotification(
        "이 브라우저는 메모리 모니터링을 지원하지 않습니다",
        "error"
      );
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.updateMemoryStats();
    }, 1000);

    this.showNotification("메모리 모니터링을 시작했습니다", "success");
  }

  stopMemoryMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.showNotification("메모리 모니터링을 중지했습니다", "info");
    }
  }

  updateMemoryStats() {
    if (!("memory" in performance)) return;

    const memory = performance.memory;

    document.getElementById("usedJSHeap").textContent = this.formatBytes(
      memory.usedJSHeapSize
    );
    document.getElementById("totalJSHeap").textContent = this.formatBytes(
      memory.totalJSHeapSize
    );
    document.getElementById("jsHeapLimit").textContent = this.formatBytes(
      memory.jsHeapSizeLimit
    );

    const usagePercent = (
      (memory.usedJSHeapSize / memory.jsHeapSizeLimit) *
      100
    ).toFixed(1);
    document.getElementById("memoryUsage").textContent = `${usagePercent}%`;

    // 사용률에 따른 색상 변경
    const usageElement = document.getElementById("memoryUsage");
    if (usagePercent > 80) {
      usageElement.className = "stat-value high-usage";
    } else if (usagePercent > 60) {
      usageElement.className = "stat-value medium-usage";
    } else {
      usageElement.className = "stat-value low-usage";
    }
  }

  clearMemoryChart() {
    const canvas = document.getElementById("memoryCanvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.showNotification("메모리 차트를 초기화했습니다", "info");
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // 유틸리티 메서드
  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notification = document.createElement("div");
    notification.className = "notification notification-" + type;

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };
    const icon = icons[type] || "ℹ️";

    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <span class="notification-close">&times;</span>
    `;

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    notifications.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// 초기화
function initDeviceMemoryAPI() {
  console.log("🚀 Device Memory API 초기화 함수 호출");
  new DeviceMemoryAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initDeviceMemoryAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initDeviceMemoryAPI();
}

console.log(
  "📄 Device Memory API 스크립트 로드 완료, readyState:",
  document.readyState
);
