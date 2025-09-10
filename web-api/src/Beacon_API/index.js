import "./style.css";

console.log("📡 Beacon API 스크립트 시작!");

class BeaconAPI {
  constructor() {
    this.analytics = {
      pageViews: 0,
      clicks: 0,
      timeOnPage: 0,
      scrollDepth: 0,
      errors: [],
      performance: {},
    };
    this.startTime = Date.now();
    this.lastScrollPosition = 0;
    this.maxScrollDepth = 0;
    this.beaconEndpoint = "https://httpbin.org/post"; // 테스트용 엔드포인트
    this.queuedData = [];
    this.isUnloading = false;
    this.init();
  }

  init() {
    console.log("📡 Beacon API 초기화 시작");
    this.checkBeaconSupport();
    this.setupUI();
    this.setupEventListeners();
    this.startTracking();
    this.setupUnloadHandlers();
    console.log("✅ Beacon API 초기화 완료");
  }

  checkBeaconSupport() {
    console.log("🔍 Beacon 지원 여부 확인 중...");

    if (!("sendBeacon" in navigator)) {
      console.warn("⚠️ Beacon API 지원 안됨");
      this.showNotification(
        "이 브라우저는 Beacon API를 지원하지 않습니다",
        "warning"
      );
    } else {
      console.log("✅ Beacon API 지원됨");
    }
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }

    appDiv.innerHTML = `
      <div class="beacon-container">
        <header class="beacon-header">
          <h1>📡 Beacon API 데모</h1>
          <p>안전한 데이터 전송 및 분석 추적</p>
          <div class="api-support">
            <div class="support-badge ${
              navigator.sendBeacon ? "supported" : "unsupported"
            }">
              ${navigator.sendBeacon ? "✅ 완전 지원" : "❌ 미지원"}
            </div>
          </div>
        </header>

        <main class="beacon-main">
          <div class="analytics-section">
            <div class="beacon-card primary">
              <h2>📊 실시간 분석 데이터</h2>
              <div class="analytics-grid">
                <div class="metric-item">
                  <div class="metric-value" id="pageViews">1</div>
                  <div class="metric-label">페이지 뷰</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value" id="timeOnPage">00:00</div>
                  <div class="metric-label">체류 시간</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value" id="clickCount">0</div>
                  <div class="metric-label">클릭 수</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value" id="scrollDepth">0%</div>
                  <div class="metric-label">스크롤 깊이</div>
                </div>
              </div>

              <div class="beacon-controls">
                <button id="sendAnalytics" class="btn-primary">
                  📤 분석 데이터 전송
                </button>
                <button id="resetAnalytics" class="btn-secondary">
                  🔄 데이터 초기화
                </button>
              </div>
            </div>

            <div class="beacon-card">
              <h2>⚡ 성능 메트릭</h2>
              <div class="performance-metrics" id="performanceMetrics">
                <div class="perf-item">
                  <span class="perf-label">페이지 로드:</span>
                  <span class="perf-value" id="loadTime">-</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">DOM 준비:</span>
                  <span class="perf-value" id="domReady">-</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">첫 바이트:</span>
                  <span class="perf-value" id="ttfb">-</span>
                </div>
                <div class="perf-item">
                  <span class="perf-label">리소스 수:</span>
                  <span class="perf-value" id="resourceCount">-</span>
                </div>
              </div>
              
              <button id="sendPerformance" class="btn-accent">
                ⚡ 성능 데이터 전송
              </button>
            </div>
          </div>

          <div class="demo-section">
            <div class="beacon-card">
              <h2>🎯 인터랙션 테스트</h2>
              <div class="interaction-demo">
                <p>아래 버튼들을 클릭해서 이벤트 추적을 테스트해보세요:</p>
                
                <div class="demo-buttons">
                  <button class="demo-btn" data-action="button-click" data-category="demo">
                    🎯 버튼 클릭 추적
                  </button>
                  <button class="demo-btn" data-action="feature-use" data-category="engagement">
                    ⭐ 기능 사용 추적
                  </button>
                  <button class="demo-btn" data-action="download" data-category="conversion">
                    📥 다운로드 추적
                  </button>
                  <button class="demo-btn error-btn" data-action="error-test">
                    💥 에러 발생 테스트
                  </button>
                </div>

                <div class="scroll-demo">
                  <h3>📜 스크롤 추적 테스트</h3>
                  <div class="scroll-content">
                    <p>이 영역을 스크롤해서 스크롤 깊이 추적을 테스트해보세요.</p>
                    <div class="filler-content">
                      <div class="content-block">섹션 1: 페이지 시작 부분</div>
                      <div class="content-block">섹션 2: 25% 지점</div>
                      <div class="content-block">섹션 3: 50% 지점</div>
                      <div class="content-block">섹션 4: 75% 지점</div>
                      <div class="content-block">섹션 5: 페이지 끝 부분</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="beacon-card">
              <h2>🚨 에러 로깅</h2>
              <div class="error-log" id="errorLog">
                <div class="log-placeholder">에러가 발생하면 여기에 표시됩니다</div>
              </div>
              
              <div class="error-controls">
                <button id="clearErrors" class="btn-danger">🧹 에러 로그 지우기</button>
                <button id="sendErrors" class="btn-warning">📤 에러 로그 전송</button>
              </div>
            </div>
          </div>

          <div class="beacon-info-section">
            <div class="beacon-card">
              <h2>📋 전송 로그</h2>
              <div class="transmission-log" id="transmissionLog">
                <div class="log-placeholder">Beacon 전송 기록이 여기에 표시됩니다</div>
              </div>
              
              <button id="clearTransmissions" class="btn-secondary">
                🧹 전송 로그 지우기
              </button>
            </div>

            <div class="beacon-card">
              <h2>⚙️ Beacon 설정</h2>
              <div class="beacon-settings">
                <div class="setting-group">
                  <label for="beaconEndpoint">전송 엔드포인트:</label>
                  <input 
                    type="url" 
                    id="beaconEndpoint" 
                    value="${this.beaconEndpoint}"
                    placeholder="https://your-analytics.com/beacon"
                  >
                </div>
                
                <div class="setting-group">
                  <label for="autoSend">자동 전송:</label>
                  <select id="autoSend">
                    <option value="disabled">비활성화</option>
                    <option value="5000">5초마다</option>
                    <option value="10000">10초마다</option>
                    <option value="30000">30초마다</option>
                    <option value="unload" selected>페이지 종료 시</option>
                  </select>
                </div>

                <div class="setting-group">
                  <label for="includeUserAgent">User Agent 포함:</label>
                  <input type="checkbox" id="includeUserAgent" checked>
                </div>

                <div class="setting-group">
                  <label for="includeLocation">위치 정보 포함:</label>
                  <input type="checkbox" id="includeLocation" checked>
                </div>
              </div>
            </div>
          </div>

          <div class="usage-section">
            <div class="beacon-card">
              <h2>💡 Beacon API 활용법</h2>
              <div class="usage-content">
                <div class="code-example">
                  <h3>기본 사용법:</h3>
                  <pre><code>// 기본 Beacon 전송
navigator.sendBeacon('/analytics', JSON.stringify({
  event: 'page_view',
  timestamp: Date.now(),
  user_id: 'user123'
}));

// 페이지 떠날 때 데이터 전송
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/analytics', JSON.stringify({
    event: 'page_unload',
    timeOnPage: Date.now() - startTime,
    scrollDepth: Math.max(scrollDepth)
  }));
});

// FormData로 전송
const formData = new FormData();
formData.append('event', 'button_click');
formData.append('element', 'header-cta');
navigator.sendBeacon('/analytics', formData);

// Blob으로 전송
const data = new Blob([JSON.stringify({
  errors: errorLog,
  timestamp: Date.now()
})], { type: 'application/json' });
navigator.sendBeacon('/error-log', data);</code></pre>
                </div>

                <div class="use-cases">
                  <h3>🎯 주요 사용 사례:</h3>
                  <ul class="use-case-list">
                    <li><strong>페이지 이탈 추적:</strong> 사용자가 페이지를 떠날 때 확실한 데이터 전송</li>
                    <li><strong>클릭 이벤트:</strong> 버튼, 링크 클릭 등 사용자 행동 추적</li>
                    <li><strong>성능 모니터링:</strong> 페이지 로드 시간, 에러율 등 성능 지표</li>
                    <li><strong>에러 로깅:</strong> JavaScript 에러, API 실패 등 오류 수집</li>
                    <li><strong>사용자 세션:</strong> 체류 시간, 스크롤 깊이 등 참여도 측정</li>
                    <li><strong>A/B 테스트:</strong> 실험 결과 및 변환율 데이터 수집</li>
                  </ul>
                </div>

                <div class="browser-support">
                  <h3>🌐 브라우저 지원:</h3>
                  <div class="support-grid">
                    <div class="support-item">
                      <span class="browser-name">Chrome</span>
                      <span class="support-status supported">39+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Firefox</span>
                      <span class="support-status supported">31+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Safari</span>
                      <span class="support-status supported">11.1+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Edge</span>
                      <span class="support-status supported">14+ ✅</span>
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

    this.updateAnalyticsDisplay();
    this.measurePerformance();
    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 분석 데이터 전송
    const sendAnalyticsBtn = document.getElementById("sendAnalytics");
    if (sendAnalyticsBtn) {
      sendAnalyticsBtn.addEventListener("click", () =>
        this.sendAnalyticsData()
      );
    }

    // 데이터 초기화
    const resetAnalyticsBtn = document.getElementById("resetAnalytics");
    if (resetAnalyticsBtn) {
      resetAnalyticsBtn.addEventListener("click", () => this.resetAnalytics());
    }

    // 성능 데이터 전송
    const sendPerformanceBtn = document.getElementById("sendPerformance");
    if (sendPerformanceBtn) {
      sendPerformanceBtn.addEventListener("click", () =>
        this.sendPerformanceData()
      );
    }

    // 데모 버튼들
    document.querySelectorAll(".demo-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleDemoClick(e));
    });

    // 에러 로그 관리
    const clearErrorsBtn = document.getElementById("clearErrors");
    if (clearErrorsBtn) {
      clearErrorsBtn.addEventListener("click", () => this.clearErrorLog());
    }

    const sendErrorsBtn = document.getElementById("sendErrors");
    if (sendErrorsBtn) {
      sendErrorsBtn.addEventListener("click", () => this.sendErrorLog());
    }

    // 전송 로그 지우기
    const clearTransmissionsBtn = document.getElementById("clearTransmissions");
    if (clearTransmissionsBtn) {
      clearTransmissionsBtn.addEventListener("click", () =>
        this.clearTransmissionLog()
      );
    }

    // 설정 변경
    const endpointInput = document.getElementById("beaconEndpoint");
    if (endpointInput) {
      endpointInput.addEventListener("change", (e) => {
        this.beaconEndpoint = e.target.value;
        this.showNotification("전송 엔드포인트가 변경되었습니다", "success");
      });
    }

    // 클릭 추적
    document.addEventListener("click", (e) => this.trackClick(e));

    // 스크롤 추적
    window.addEventListener("scroll", () => this.trackScroll());

    // 에러 추적
    window.addEventListener("error", (e) => this.trackError(e));
    window.addEventListener("unhandledrejection", (e) =>
      this.trackPromiseRejection(e)
    );

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  setupUnloadHandlers() {
    // 페이지 떠날 때 데이터 전송
    window.addEventListener("beforeunload", () => {
      this.isUnloading = true;
      this.sendBeaconData({
        type: "page_unload",
        analytics: this.analytics,
        sessionDuration: Date.now() - this.startTime,
        timestamp: Date.now(),
      });
    });

    // 페이지 숨김/보임 감지
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.sendBeaconData({
          type: "page_hidden",
          analytics: this.analytics,
          timestamp: Date.now(),
        });
      } else {
        this.sendBeaconData({
          type: "page_visible",
          analytics: this.analytics,
          timestamp: Date.now(),
        });
      }
    });
  }

  startTracking() {
    // 페이지 뷰 카운트
    this.analytics.pageViews = 1;

    // 시간 추적 시작
    setInterval(() => {
      this.analytics.timeOnPage = Date.now() - this.startTime;
      this.updateAnalyticsDisplay();
    }, 1000);

    // 자동 전송 설정 확인
    this.setupAutoSend();
  }

  setupAutoSend() {
    const autoSendSelect = document.getElementById("autoSend");
    if (autoSendSelect) {
      autoSendSelect.addEventListener("change", (e) => {
        const interval = parseInt(e.target.value);

        if (this.autoSendInterval) {
          clearInterval(this.autoSendInterval);
          this.autoSendInterval = null;
        }

        if (interval > 0) {
          this.autoSendInterval = setInterval(() => {
            this.sendAnalyticsData();
          }, interval);

          this.showNotification(
            `자동 전송이 ${interval / 1000}초마다 설정되었습니다`,
            "success"
          );
        }
      });
    }
  }

  trackClick(event) {
    this.analytics.clicks++;

    const element = event.target;
    const clickData = {
      type: "click",
      element: element.tagName.toLowerCase(),
      className: element.className,
      id: element.id,
      text: element.textContent?.slice(0, 50) || "",
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    };

    this.queuedData.push(clickData);
    this.updateAnalyticsDisplay();
  }

  trackScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    this.analytics.scrollDepth = Math.max(
      this.analytics.scrollDepth,
      scrollPercent
    );
    this.updateAnalyticsDisplay();
  }

  trackError(errorEvent) {
    const errorData = {
      type: "javascript_error",
      message: errorEvent.message,
      filename: errorEvent.filename,
      lineno: errorEvent.lineno,
      colno: errorEvent.colno,
      stack: errorEvent.error?.stack || "",
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    this.analytics.errors.push(errorData);
    this.displayError(errorData);
  }

  trackPromiseRejection(event) {
    const errorData = {
      type: "promise_rejection",
      reason: event.reason?.toString() || "Unknown rejection",
      stack: event.reason?.stack || "",
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    this.analytics.errors.push(errorData);
    this.displayError(errorData);
  }

  handleDemoClick(event) {
    const button = event.target;
    const action = button.dataset.action;
    const category = button.dataset.category || "demo";

    if (action === "error-test") {
      // 의도적 에러 발생
      throw new Error("테스트용 에러입니다");
    }

    const eventData = {
      type: "user_action",
      action: action,
      category: category,
      label: button.textContent,
      timestamp: Date.now(),
    };

    this.sendBeaconData(eventData);
    this.showNotification(`${action} 이벤트가 전송되었습니다`, "success");
  }

  sendBeaconData(data) {
    if (!navigator.sendBeacon) {
      this.showNotification("Beacon API를 지원하지 않습니다", "error");
      return false;
    }

    // 추가 메타데이터 포함
    const enrichedData = {
      ...data,
      url: window.location.href,
      referrer: document.referrer,
      sessionId: this.getSessionId(),
    };

    // 설정에 따라 추가 데이터 포함
    const includeUserAgent =
      document.getElementById("includeUserAgent")?.checked;
    const includeLocation = document.getElementById("includeLocation")?.checked;

    if (includeUserAgent) {
      enrichedData.userAgent = navigator.userAgent;
    }

    if (includeLocation) {
      enrichedData.location = {
        href: window.location.href,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        search: window.location.search,
      };
    }

    try {
      const payload = JSON.stringify(enrichedData);
      const success = navigator.sendBeacon(this.beaconEndpoint, payload);

      this.logTransmission({
        success: success,
        data: enrichedData,
        size: payload.length,
        timestamp: Date.now(),
      });

      return success;
    } catch (error) {
      console.error("Beacon 전송 실패:", error);
      this.showNotification(`Beacon 전송 실패: ${error.message}`, "error");
      return false;
    }
  }

  sendAnalyticsData() {
    const success = this.sendBeaconData({
      type: "analytics",
      analytics: { ...this.analytics },
      queuedEvents: [...this.queuedData],
      timestamp: Date.now(),
    });

    if (success) {
      this.queuedData = []; // 전송 성공 시 큐 비우기
      this.showNotification("분석 데이터가 전송되었습니다", "success");
    }
  }

  sendPerformanceData() {
    const success = this.sendBeaconData({
      type: "performance",
      performance: this.analytics.performance,
      timestamp: Date.now(),
    });

    if (success) {
      this.showNotification("성능 데이터가 전송되었습니다", "success");
    }
  }

  sendErrorLog() {
    if (this.analytics.errors.length === 0) {
      this.showNotification("전송할 에러가 없습니다", "warning");
      return;
    }

    const success = this.sendBeaconData({
      type: "error_log",
      errors: [...this.analytics.errors],
      timestamp: Date.now(),
    });

    if (success) {
      this.showNotification(
        `${this.analytics.errors.length}개의 에러가 전송되었습니다`,
        "success"
      );
    }
  }

  measurePerformance() {
    if ("performance" in window) {
      const perf = performance.timing;
      const navigation = performance.getEntriesByType("navigation")[0];

      this.analytics.performance = {
        loadTime: perf.loadEventEnd - perf.navigationStart,
        domReady: perf.domContentLoadedEventEnd - perf.navigationStart,
        ttfb: perf.responseStart - perf.navigationStart,
        resourceCount: performance.getEntriesByType("resource").length,
        transferSize: navigation?.transferSize || 0,
        encodedSize: navigation?.encodedBodySize || 0,
      };

      this.updatePerformanceDisplay();
    }
  }

  updateAnalyticsDisplay() {
    const pageViewsEl = document.getElementById("pageViews");
    const timeOnPageEl = document.getElementById("timeOnPage");
    const clickCountEl = document.getElementById("clickCount");
    const scrollDepthEl = document.getElementById("scrollDepth");

    if (pageViewsEl) {
      pageViewsEl.textContent = this.analytics.pageViews.toString();
    }

    if (timeOnPageEl) {
      timeOnPageEl.textContent = this.formatTime(this.analytics.timeOnPage);
    }

    if (clickCountEl) {
      clickCountEl.textContent = this.analytics.clicks.toString();
    }

    if (scrollDepthEl) {
      scrollDepthEl.textContent = `${this.analytics.scrollDepth}%`;
    }
  }

  updatePerformanceDisplay() {
    const loadTimeEl = document.getElementById("loadTime");
    const domReadyEl = document.getElementById("domReady");
    const ttfbEl = document.getElementById("ttfb");
    const resourceCountEl = document.getElementById("resourceCount");

    const perf = this.analytics.performance;

    if (loadTimeEl && perf.loadTime) {
      loadTimeEl.textContent = `${perf.loadTime}ms`;
    }

    if (domReadyEl && perf.domReady) {
      domReadyEl.textContent = `${perf.domReady}ms`;
    }

    if (ttfbEl && perf.ttfb) {
      ttfbEl.textContent = `${perf.ttfb}ms`;
    }

    if (resourceCountEl && perf.resourceCount) {
      resourceCountEl.textContent = perf.resourceCount.toString();
    }
  }

  displayError(errorData) {
    const errorLog = document.getElementById("errorLog");
    if (!errorLog) return;

    // 플레이스홀더 제거
    const placeholder = errorLog.querySelector(".log-placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    const errorEntry = document.createElement("div");
    errorEntry.className = "error-entry";
    errorEntry.innerHTML = `
      <div class="error-header">
        <span class="error-type">${errorData.type}</span>
        <span class="error-time">${new Date(
          errorData.timestamp
        ).toLocaleTimeString()}</span>
      </div>
      <div class="error-message">${errorData.message || errorData.reason}</div>
      <div class="error-details">
        ${
          errorData.filename
            ? `파일: ${errorData.filename}:${errorData.lineno}`
            : ""
        }
      </div>
    `;

    errorLog.insertBefore(errorEntry, errorLog.firstChild);

    // 최대 10개까지만 표시
    const errorEntries = errorLog.querySelectorAll(".error-entry");
    if (errorEntries.length > 10) {
      errorEntries[errorEntries.length - 1].remove();
    }
  }

  logTransmission(transmissionData) {
    const transmissionLog = document.getElementById("transmissionLog");
    if (!transmissionLog) return;

    // 플레이스홀더 제거
    const placeholder = transmissionLog.querySelector(".log-placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    const logEntry = document.createElement("div");
    logEntry.className = `transmission-entry ${
      transmissionData.success ? "success" : "failed"
    }`;
    logEntry.innerHTML = `
      <div class="transmission-header">
        <span class="transmission-status">
          ${transmissionData.success ? "✅ 성공" : "❌ 실패"}
        </span>
        <span class="transmission-time">
          ${new Date(transmissionData.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div class="transmission-details">
        <span class="transmission-type">${transmissionData.data.type}</span>
        <span class="transmission-size">${transmissionData.size} bytes</span>
      </div>
    `;

    transmissionLog.insertBefore(logEntry, transmissionLog.firstChild);

    // 최대 20개까지만 표시
    const logEntries = transmissionLog.querySelectorAll(".transmission-entry");
    if (logEntries.length > 20) {
      logEntries[logEntries.length - 1].remove();
    }
  }

  resetAnalytics() {
    this.analytics = {
      pageViews: 1,
      clicks: 0,
      timeOnPage: 0,
      scrollDepth: 0,
      errors: [],
      performance: this.analytics.performance, // 성능 데이터는 유지
    };
    this.queuedData = [];
    this.startTime = Date.now();
    this.updateAnalyticsDisplay();
    this.showNotification("분석 데이터가 초기화되었습니다", "success");
  }

  clearErrorLog() {
    this.analytics.errors = [];
    const errorLog = document.getElementById("errorLog");
    if (errorLog) {
      errorLog.innerHTML =
        '<div class="log-placeholder">에러가 발생하면 여기에 표시됩니다</div>';
    }
    this.showNotification("에러 로그가 지워졌습니다", "success");
  }

  clearTransmissionLog() {
    const transmissionLog = document.getElementById("transmissionLog");
    if (transmissionLog) {
      transmissionLog.innerHTML =
        '<div class="log-placeholder">Beacon 전송 기록이 여기에 표시됩니다</div>';
    }
    this.showNotification("전송 로그가 지워졌습니다", "success");
  }

  getSessionId() {
    // 간단한 세션 ID 생성 (실제로는 더 정교한 방법 사용)
    if (!this.sessionId) {
      this.sessionId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    return this.sessionId;
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  // 정리
  cleanup() {
    if (this.autoSendInterval) {
      clearInterval(this.autoSendInterval);
    }

    // 마지막 데이터 전송
    this.sendBeaconData({
      type: "cleanup",
      analytics: this.analytics,
      timestamp: Date.now(),
    });
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

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  if (window.beaconAPI) {
    window.beaconAPI.cleanup();
  }
});

// 초기화
function initBeaconAPI() {
  console.log("🚀 Beacon API 초기화 함수 호출");
  window.beaconAPI = new BeaconAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initBeaconAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initBeaconAPI();
}

console.log(
  "📄 Beacon API 스크립트 로드 완료, readyState:",
  document.readyState
);
