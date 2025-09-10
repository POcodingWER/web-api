import "./style.css";

console.log("📡 Network Information API 스크립트 시작!");

class NetworkInformationAPI {
  constructor() {
    this.connection = null;
    this.networkData = {
      effectiveType: "unknown",
      downlink: 0,
      rtt: 0,
      saveData: false,
      type: "unknown",
    };
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.speedTestHistory = [];
    this.adaptiveMode = "auto";
    this.init();
  }

  init() {
    console.log("📡 Network Information API 초기화 시작");
    this.detectNetworkConnection();
    this.setupUI();
    this.setupEventListeners();
    this.startNetworkMonitoring();
    console.log("✅ Network Information API 초기화 완료");
  }

  detectNetworkConnection() {
    console.log("🔍 네트워크 연결 정보 감지 중...");

    // Navigator.connection API 확인
    this.connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (this.connection) {
      this.updateNetworkInfo();
      console.log("✅ Network Information API 지원됨");
    } else {
      console.log("⚠️ Network Information API 지원 안됨, 추정값 사용");
      this.estimateNetworkInfo();
    }
  }

  updateNetworkInfo() {
    if (!this.connection) return;

    this.networkData = {
      effectiveType: this.connection.effectiveType || "unknown",
      downlink: this.connection.downlink || 0,
      rtt: this.connection.rtt || 0,
      saveData: this.connection.saveData || false,
      type: this.connection.type || "unknown",
    };

    this.updateNetworkDisplay();
  }

  estimateNetworkInfo() {
    // 추정값 설정 (실제 환경에서는 더 정교한 추정 필요)
    this.networkData = {
      effectiveType: "4g", // 기본값
      downlink: 10, // 추정 10Mbps
      rtt: 100, // 추정 100ms
      saveData: false,
      type: "cellular", // 추정
    };

    this.updateNetworkDisplay();
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }

    appDiv.innerHTML = `
      <div class="network-container">
        <header class="network-header">
          <h1>📡 Network Information API 데모</h1>
          <p>네트워크 상태 감지 및 적응형 콘텐츠 최적화</p>
          <div class="api-support">
            <div class="support-badge ${
              this.connection ? "supported" : "fallback"
            }">
              ${this.connection ? "✅ 완전 지원" : "⚠️ 추정값 사용"}
            </div>
          </div>
        </header>

        <main class="network-main">
          <div class="network-info-section">
            <div class="network-card primary">
              <h2>📊 현재 네트워크 상태</h2>
              <div class="network-details">
                <div class="network-item">
                  <span class="label">연결 타입:</span>
                  <span class="value" id="connectionType">-</span>
                </div>
                <div class="network-item">
                  <span class="label">효과적 타입:</span>
                  <span class="value effective-type" id="effectiveType">-</span>
                </div>
                <div class="network-item">
                  <span class="label">다운링크:</span>
                  <span class="value" id="downlink">-</span>
                </div>
                <div class="network-item">
                  <span class="label">RTT (지연시간):</span>
                  <span class="value" id="rtt">-</span>
                </div>
                <div class="network-item">
                  <span class="label">데이터 절약:</span>
                  <span class="value" id="saveData">-</span>
                </div>
                <div class="network-item">
                  <span class="label">네트워크 품질:</span>
                  <span class="value quality-indicator" id="networkQuality">-</span>
                </div>
              </div>

              <div class="network-controls">
                <button id="refreshNetwork" class="btn-primary">🔄 정보 새로고침</button>
                <button id="runSpeedTest" class="btn-accent">⚡ 속도 테스트</button>
              </div>
            </div>

            <div class="network-card">
              <h2>📈 실시간 모니터링</h2>
              <div class="monitoring-controls">
                <button id="startMonitoring" class="btn-success">▶️ 모니터링 시작</button>
                <button id="stopMonitoring" class="btn-warning">⏸️ 모니터링 중지</button>
                <button id="clearHistory" class="btn-danger">🧹 기록 지우기</button>
              </div>

              <div class="monitoring-status">
                <div class="status-indicator" id="monitoringStatus">중지됨</div>
              </div>

              <div class="network-chart">
                <canvas id="networkCanvas" width="300" height="150"></canvas>
              </div>
            </div>
          </div>

          <div class="adaptive-section">
            <div class="network-card">
              <h2>🎯 적응형 콘텐츠 최적화</h2>
              <div class="adaptive-controls">
                <div class="control-group">
                  <label for="adaptiveMode">최적화 모드:</label>
                  <select id="adaptiveMode" class="mode-select">
                    <option value="auto">🤖 자동 (추천)</option>
                    <option value="always-fast">🚀 항상 빠른 로딩</option>
                    <option value="data-saver">💾 데이터 절약</option>
                    <option value="quality-first">🎨 품질 우선</option>
                  </select>
                </div>
              </div>

              <div class="optimization-results" id="optimizationResults">
                <h3>현재 최적화 설정:</h3>
                <div class="optimization-item">
                  <span class="opt-label">이미지 품질:</span>
                  <span class="opt-value" id="imageOptimization">자동</span>
                </div>
                <div class="optimization-item">
                  <span class="opt-label">비디오 품질:</span>
                  <span class="opt-value" id="videoOptimization">자동</span>
                </div>
                <div class="optimization-item">
                  <span class="opt-label">프리로딩:</span>
                  <span class="opt-value" id="preloadingStrategy">자동</span>
                </div>
                <div class="optimization-item">
                  <span class="opt-label">번들 크기:</span>
                  <span class="opt-value" id="bundleStrategy">자동</span>
                </div>
              </div>
            </div>

            <div class="network-card">
              <h2>📱 적응형 콘텐츠 데모</h2>
              <div class="content-demo">
                <div class="demo-section">
                  <h3>🖼️ 이미지 로딩 데모</h3>
                  <div class="image-demo" id="imageDemo">
                    <div class="image-placeholder" id="demoImage">
                      이미지가 네트워크 속도에 따라 로드됩니다
                    </div>
                    <div class="image-info">
                      <span id="imageSize">-</span> | <span id="imageFormat">-</span>
                    </div>
                  </div>
                </div>

                <div class="demo-section">
                  <h3>🎬 비디오 품질 데모</h3>
                  <div class="video-demo">
                    <div class="video-placeholder" id="demoVideo">
                      📹 비디오 품질: <span id="videoQuality">자동</span>
                    </div>
                  </div>
                </div>

                <div class="demo-section">
                  <h3>📊 데이터 사용량</h3>
                  <div class="data-usage">
                    <div class="usage-item">
                      <span class="usage-label">예상 이미지 크기:</span>
                      <span class="usage-value" id="estimatedImageSize">-</span>
                    </div>
                    <div class="usage-item">
                      <span class="usage-label">예상 비디오 크기:</span>
                      <span class="usage-value" id="estimatedVideoSize">-</span>
                    </div>
                    <div class="usage-item">
                      <span class="usage-label">절약된 데이터:</span>
                      <span class="usage-value" id="dataSaved">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="speed-test-section">
            <div class="network-card">
              <h2>⚡ 네트워크 속도 테스트</h2>
              <div class="speed-test-controls">
                <button id="measureLatency" class="btn-primary">📡 지연시간 측정</button>
                <button id="measureDownload" class="btn-accent">⬇️ 다운로드 속도</button>
                <button id="measureUpload" class="btn-secondary">⬆️ 업로드 속도</button>
              </div>

              <div class="speed-results">
                <div class="speed-item">
                  <span class="speed-label">지연시간 (Ping):</span>
                  <span class="speed-value" id="latencyResult">-</span>
                </div>
                <div class="speed-item">
                  <span class="speed-label">다운로드:</span>
                  <span class="speed-value" id="downloadResult">-</span>
                </div>
                <div class="speed-item">
                  <span class="speed-label">업로드:</span>
                  <span class="speed-value" id="uploadResult">-</span>
                </div>
              </div>

              <div class="speed-history">
                <h3>📈 측정 기록</h3>
                <div class="history-list" id="speedHistory">
                  <p class="no-data">아직 측정 기록이 없습니다</p>
                </div>
              </div>
            </div>

            <div class="network-card">
              <h2>💡 Network Information API 활용법</h2>
              <div class="usage-content">
                <div class="code-example">
                  <h3>기본 사용법:</h3>
                  <pre><code>// Network Connection 정보 확인
const connection = navigator.connection;

if (connection) {
  console.log('연결 타입:', connection.effectiveType);
  console.log('다운링크:', connection.downlink + 'Mbps');
  console.log('RTT:', connection.rtt + 'ms');
  console.log('데이터 절약:', connection.saveData);

  // 네트워크 변경 감지
  connection.addEventListener('change', () => {
    console.log('네트워크 상태 변경됨');
    adaptContentToNetwork();
  });
}

// 네트워크에 따른 콘텐츠 최적화
function adaptContentToNetwork() {
  if (connection.effectiveType === 'slow-2g') {
    loadLowQualityImages();
    disableAutoplay();
  } else if (connection.effectiveType === '4g') {
    loadHighQualityImages();
    enablePreloading();
  }
}</code></pre>
                </div>

                <div class="optimization-tips">
                  <h3>🚀 최적화 팁:</h3>
                  <ul class="tips-list">
                    <li><strong>이미지 최적화:</strong> 느린 연결에서는 WebP, 압축 이미지 사용</li>
                    <li><strong>비디오 품질:</strong> 연결 속도에 따라 해상도 자동 조절</li>
                    <li><strong>프리로딩:</strong> 빠른 연결에서만 다음 페이지 프리로드</li>
                    <li><strong>번들 최적화:</strong> 느린 연결에서는 code splitting 적극 활용</li>
                    <li><strong>데이터 절약:</strong> Save-Data 헤더 감지 시 최소 전송</li>
                  </ul>
                </div>

                <div class="browser-support">
                  <h3>🌐 브라우저 지원:</h3>
                  <div class="support-grid">
                    <div class="support-item">
                      <span class="browser-name">Chrome</span>
                      <span class="support-status supported">61+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Edge</span>
                      <span class="support-status supported">79+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Firefox</span>
                      <span class="support-status partial">부분 지원 ⚠️</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Safari</span>
                      <span class="support-status unsupported">❌</span>
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

    this.updateNetworkDisplay();
    this.updateAdaptiveContent();
    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 네트워크 변경 감지
    if (this.connection) {
      this.connection.addEventListener("change", () => {
        this.updateNetworkInfo();
        this.updateAdaptiveContent();
        this.showNotification("네트워크 상태가 변경되었습니다", "info");
      });
    }

    // 제어 버튼들
    document.getElementById("refreshNetwork")?.addEventListener("click", () => {
      this.updateNetworkInfo();
      this.showNotification("네트워크 정보를 새로고침했습니다", "success");
    });

    document.getElementById("runSpeedTest")?.addEventListener("click", () => {
      this.runComprehensiveSpeedTest();
    });

    // 모니터링 제어
    document
      .getElementById("startMonitoring")
      ?.addEventListener("click", () => {
        this.startNetworkMonitoring();
      });

    document.getElementById("stopMonitoring")?.addEventListener("click", () => {
      this.stopNetworkMonitoring();
    });

    document.getElementById("clearHistory")?.addEventListener("click", () => {
      this.clearSpeedHistory();
    });

    // 적응형 모드 변경
    document.getElementById("adaptiveMode")?.addEventListener("change", (e) => {
      this.adaptiveMode = e.target.value;
      this.updateAdaptiveContent();
      this.showNotification(
        `적응형 모드가 "${this.getAdaptiveModeDisplayName()}"로 변경되었습니다`,
        "success"
      );
    });

    // 속도 테스트 버튼들
    document.getElementById("measureLatency")?.addEventListener("click", () => {
      this.measureLatency();
    });

    document
      .getElementById("measureDownload")
      ?.addEventListener("click", () => {
        this.measureDownloadSpeed();
      });

    document.getElementById("measureUpload")?.addEventListener("click", () => {
      this.measureUploadSpeed();
    });

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  updateNetworkDisplay() {
    const connectionTypeEl = document.getElementById("connectionType");
    if (connectionTypeEl) {
      connectionTypeEl.textContent = this.getConnectionTypeDisplay(
        this.networkData.type
      );
    }

    const effectiveTypeEl = document.getElementById("effectiveType");
    if (effectiveTypeEl) {
      effectiveTypeEl.textContent = this.getEffectiveTypeDisplay(
        this.networkData.effectiveType
      );
      effectiveTypeEl.className = `value effective-type ${this.networkData.effectiveType}`;
    }

    const downlinkEl = document.getElementById("downlink");
    if (downlinkEl) {
      downlinkEl.textContent =
        this.networkData.downlink > 0
          ? `${this.networkData.downlink} Mbps`
          : "알 수 없음";
    }

    const rttEl = document.getElementById("rtt");
    if (rttEl) {
      rttEl.textContent =
        this.networkData.rtt > 0 ? `${this.networkData.rtt} ms` : "알 수 없음";
    }

    const saveDataEl = document.getElementById("saveData");
    if (saveDataEl) {
      saveDataEl.textContent = this.networkData.saveData
        ? "🟢 활성화"
        : "🔴 비활성화";
    }

    // 네트워크 품질 표시
    const quality = this.getNetworkQuality();
    const qualityElement = document.getElementById("networkQuality");
    if (qualityElement) {
      qualityElement.textContent = quality.text;
      qualityElement.className = `value quality-indicator ${quality.class}`;
    }
  }

  getConnectionTypeDisplay(type) {
    const types = {
      bluetooth: "🔵 블루투스",
      cellular: "📱 셀룰러",
      ethernet: "🔗 이더넷",
      wifi: "📶 Wi-Fi",
      wimax: "📡 WiMAX",
      other: "❓ 기타",
      unknown: "❓ 알 수 없음",
    };
    return types[type] || "❓ 알 수 없음";
  }

  getEffectiveTypeDisplay(effectiveType) {
    const types = {
      "slow-2g": "🐌 Slow 2G",
      "2g": "📶 2G",
      "3g": "📶📶 3G",
      "4g": "📶📶📶 4G",
    };
    return types[effectiveType] || "❓ 알 수 없음";
  }

  getNetworkQuality() {
    const { effectiveType, downlink, rtt } = this.networkData;

    if (effectiveType === "4g" && downlink > 10) {
      return { text: "🟢 매우 좋음", class: "excellent" };
    } else if (
      effectiveType === "4g" ||
      (effectiveType === "3g" && downlink > 5)
    ) {
      return { text: "🟡 좋음", class: "good" };
    } else if (effectiveType === "3g" || effectiveType === "2g") {
      return { text: "🟠 보통", class: "fair" };
    } else if (effectiveType === "slow-2g") {
      return { text: "🔴 느림", class: "poor" };
    }

    return { text: "❓ 알 수 없음", class: "unknown" };
  }

  startNetworkMonitoring() {
    if (this.isMonitoring) {
      this.showNotification("이미 모니터링이 실행 중입니다", "warning");
      return;
    }

    this.isMonitoring = true;
    const monitoringStatusEl = document.getElementById("monitoringStatus");
    if (monitoringStatusEl) {
      monitoringStatusEl.textContent = "🟢 실행 중";
    }

    this.monitoringInterval = setInterval(() => {
      if (this.connection) {
        this.updateNetworkInfo();
      }
      this.updateNetworkChart();
    }, 2000);

    this.showNotification("네트워크 모니터링을 시작했습니다", "success");
  }

  stopNetworkMonitoring() {
    if (!this.isMonitoring) {
      this.showNotification("모니터링이 실행되고 있지 않습니다", "warning");
      return;
    }

    this.isMonitoring = false;
    const monitoringStatusEl = document.getElementById("monitoringStatus");
    if (monitoringStatusEl) {
      monitoringStatusEl.textContent = "🔴 중지됨";
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.showNotification("네트워크 모니터링을 중지했습니다", "info");
  }

  updateNetworkChart() {
    const canvas = document.getElementById("networkCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // 차트 배경 지우기
    ctx.clearRect(0, 0, width, height);

    // 간단한 라인 차트 그리기 (실제로는 Chart.js 등 사용 권장)
    ctx.strokeStyle = "#667eea";
    ctx.lineWidth = 2;
    ctx.beginPath();

    // 예시 데이터로 차트 그리기
    const downlink = this.networkData.downlink || 1;
    const points = 10;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = height - (downlink / 50) * height + Math.random() * 20;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 축 그리기
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 1);
    ctx.lineTo(width, height - 1);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
  }

  getAdaptiveModeDisplayName() {
    const modes = {
      auto: "자동",
      "always-fast": "항상 빠른 로딩",
      "data-saver": "데이터 절약",
      "quality-first": "품질 우선",
    };
    return modes[this.adaptiveMode] || "알 수 없음";
  }

  updateAdaptiveContent() {
    const settings = this.getOptimizationSettings();

    const imageOptEl = document.getElementById("imageOptimization");
    if (imageOptEl) {
      imageOptEl.textContent = settings.image;
    }

    const videoOptEl = document.getElementById("videoOptimization");
    if (videoOptEl) {
      videoOptEl.textContent = settings.video;
    }

    const preloadingEl = document.getElementById("preloadingStrategy");
    if (preloadingEl) {
      preloadingEl.textContent = settings.preloading;
    }

    const bundleEl = document.getElementById("bundleStrategy");
    if (bundleEl) {
      bundleEl.textContent = settings.bundle;
    }

    this.updateContentDemo(settings);
    this.updateDataUsageEstimates(settings);
  }

  getOptimizationSettings() {
    const { effectiveType, saveData } = this.networkData;
    const mode = this.adaptiveMode;

    // 기본 설정
    let settings = {
      image: "중간 품질",
      video: "720p",
      preloading: "제한적",
      bundle: "분할 로딩",
    };

    // 모드별 설정
    if (mode === "data-saver" || saveData) {
      settings = {
        image: "낮은 품질 (WebP)",
        video: "480p",
        preloading: "비활성화",
        bundle: "최소 번들",
      };
    } else if (mode === "quality-first") {
      settings = {
        image: "최고 품질",
        video: "1080p",
        preloading: "적극적",
        bundle: "전체 로딩",
      };
    } else if (mode === "always-fast") {
      settings = {
        image: "압축 최적화",
        video: "적응형",
        preloading: "선택적",
        bundle: "지연 로딩",
      };
    } else {
      // auto 모드 - 네트워크 상태에 따라
      if (effectiveType === "slow-2g" || effectiveType === "2g") {
        settings = {
          image: "매우 낮은 품질",
          video: "360p",
          preloading: "비활성화",
          bundle: "초기 필수만",
        };
      } else if (effectiveType === "3g") {
        settings = {
          image: "낮은 품질",
          video: "480p",
          preloading: "제한적",
          bundle: "분할 로딩",
        };
      } else if (effectiveType === "4g") {
        settings = {
          image: "높은 품질",
          video: "1080p",
          preloading: "적극적",
          bundle: "지능적 로딩",
        };
      }
    }

    return settings;
  }

  updateContentDemo(settings) {
    // 이미지 데모 업데이트
    const imageElement = document.getElementById("demoImage");
    const imageSize = document.getElementById("imageSize");
    const imageFormat = document.getElementById("imageFormat");

    if (imageElement) {
      if (settings.image.includes("낮은") || settings.image.includes("매우")) {
        imageElement.style.backgroundColor = "#ffcccb";
        imageElement.textContent = "📸 압축된 이미지 로드됨";
      } else if (
        settings.image.includes("높은") ||
        settings.image.includes("최고")
      ) {
        imageElement.style.backgroundColor = "#ccffcc";
        imageElement.textContent = "📸 고품질 이미지 로드됨";
      } else {
        imageElement.style.backgroundColor = "#ffffcc";
        imageElement.textContent = "📸 중간 품질 이미지 로드됨";
      }
    }

    if (imageSize) {
      if (settings.image.includes("낮은") || settings.image.includes("매우")) {
        imageSize.textContent = "120KB";
      } else if (
        settings.image.includes("높은") ||
        settings.image.includes("최고")
      ) {
        imageSize.textContent = "850KB";
      } else {
        imageSize.textContent = "420KB";
      }
    }

    if (imageFormat) {
      if (settings.image.includes("낮은") || settings.image.includes("매우")) {
        imageFormat.textContent = "WebP";
      } else if (
        settings.image.includes("높은") ||
        settings.image.includes("최고")
      ) {
        imageFormat.textContent = "JPEG";
      } else {
        imageFormat.textContent = "WebP";
      }
    }

    // 비디오 데모 업데이트
    const videoQuality = document.getElementById("videoQuality");
    if (videoQuality) {
      videoQuality.textContent = settings.video;
    }
  }

  updateDataUsageEstimates(settings) {
    const estimates = this.calculateDataUsage(settings);

    const imageSizeEl = document.getElementById("estimatedImageSize");
    if (imageSizeEl) {
      imageSizeEl.textContent = estimates.image;
    }

    const videoSizeEl = document.getElementById("estimatedVideoSize");
    if (videoSizeEl) {
      videoSizeEl.textContent = estimates.video;
    }

    const dataSavedEl = document.getElementById("dataSaved");
    if (dataSavedEl) {
      dataSavedEl.textContent = estimates.saved;
    }
  }

  calculateDataUsage(settings) {
    // 기본 사용량 (품질별)
    const baseSizes = {
      image: {
        "매우 낮은 품질": 0.1,
        "낮은 품질": 0.3,
        "중간 품질": 0.8,
        "높은 품질": 1.5,
        "최고 품질": 3.0,
      },
      video: {
        "360p": 25,
        "480p": 50,
        "720p": 100,
        "1080p": 200,
      },
    };

    const imageSize = baseSizes.image[settings.image] || 0.8;
    const videoSize = baseSizes.video[settings.video] || 100;
    const standardSize = baseSizes.image["중간 품질"] + baseSizes.video["720p"];
    const currentSize = imageSize + videoSize;
    const saved = Math.max(0, standardSize - currentSize);

    return {
      image: `${imageSize.toFixed(1)} MB`,
      video: `${videoSize} MB/분`,
      saved: `${saved.toFixed(1)} MB`,
    };
  }

  async measureLatency() {
    this.showNotification("지연시간 측정 중...", "info");

    try {
      const start = performance.now();
      await fetch("/favicon.ico?" + Date.now(), { method: "HEAD" });
      const end = performance.now();
      const latency = Math.round(end - start);

      const latencyResultEl = document.getElementById("latencyResult");
      if (latencyResultEl) {
        latencyResultEl.textContent = `${latency} ms`;
      }
      this.addSpeedHistoryEntry("지연시간", `${latency} ms`);
      this.showNotification(`지연시간: ${latency}ms`, "success");
    } catch (error) {
      this.showNotification("지연시간 측정 실패", "error");
    }
  }

  async measureDownloadSpeed() {
    this.showNotification("다운로드 속도 측정 중...", "info");

    try {
      const testSize = 1024 * 1024; // 1MB 테스트
      const testData = new ArrayBuffer(testSize);

      const start = performance.now();
      // 실제로는 서버에서 파일을 다운로드해야 함
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );
      const end = performance.now();

      const timeSeconds = (end - start) / 1000;
      const speedMbps = (testSize * 8) / (1024 * 1024) / timeSeconds;

      const downloadResultEl = document.getElementById("downloadResult");
      if (downloadResultEl) {
        downloadResultEl.textContent = `${speedMbps.toFixed(2)} Mbps`;
      }
      this.addSpeedHistoryEntry("다운로드", `${speedMbps.toFixed(2)} Mbps`);
      this.showNotification(
        `다운로드 속도: ${speedMbps.toFixed(2)} Mbps`,
        "success"
      );
    } catch (error) {
      this.showNotification("다운로드 속도 측정 실패", "error");
    }
  }

  async measureUploadSpeed() {
    this.showNotification("업로드 속도 측정 중...", "info");

    try {
      const testSize = 512 * 1024; // 512KB 테스트
      const testData = new ArrayBuffer(testSize);

      const start = performance.now();
      // 실제로는 서버로 데이터를 업로드해야 함
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 2000)
      );
      const end = performance.now();

      const timeSeconds = (end - start) / 1000;
      const speedMbps = (testSize * 8) / (1024 * 1024) / timeSeconds;

      const uploadResultEl = document.getElementById("uploadResult");
      if (uploadResultEl) {
        uploadResultEl.textContent = `${speedMbps.toFixed(2)} Mbps`;
      }
      this.addSpeedHistoryEntry("업로드", `${speedMbps.toFixed(2)} Mbps`);
      this.showNotification(
        `업로드 속도: ${speedMbps.toFixed(2)} Mbps`,
        "success"
      );
    } catch (error) {
      this.showNotification("업로드 속도 측정 실패", "error");
    }
  }

  async runComprehensiveSpeedTest() {
    this.showNotification("종합 속도 테스트 시작...", "info");

    await this.measureLatency();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.measureDownloadSpeed();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.measureUploadSpeed();

    this.showNotification("종합 속도 테스트 완료!", "success");
  }

  addSpeedHistoryEntry(type, result) {
    const historyContainer = document.getElementById("speedHistory");
    const time = new Date().toLocaleTimeString();

    // 기록이 없다는 메시지 제거
    const noDataMsg = historyContainer.querySelector(".no-data");
    if (noDataMsg) {
      noDataMsg.remove();
    }

    const entry = document.createElement("div");
    entry.className = "history-entry";
    entry.innerHTML = `
      <span class="history-time">${time}</span>
      <span class="history-type">${type}</span>
      <span class="history-result">${result}</span>
    `;

    historyContainer.insertBefore(entry, historyContainer.firstChild);

    // 최대 10개 기록만 유지
    const entries = historyContainer.querySelectorAll(".history-entry");
    if (entries.length > 10) {
      entries[entries.length - 1].remove();
    }
  }

  clearSpeedHistory() {
    const historyContainer = document.getElementById("speedHistory");
    historyContainer.innerHTML =
      '<p class="no-data">아직 측정 기록이 없습니다</p>';
    this.showNotification("측정 기록을 삭제했습니다", "info");
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
function initNetworkInformationAPI() {
  console.log("🚀 Network Information API 초기화 함수 호출");
  new NetworkInformationAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initNetworkInformationAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initNetworkInformationAPI();
}

console.log(
  "📄 Network Information API 스크립트 로드 완료, readyState:",
  document.readyState
);
