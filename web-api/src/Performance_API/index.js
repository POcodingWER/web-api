import "./style.css";

console.log("🚀 Performance API 스크립트 시작!");

class PerformanceAPI {
  constructor() {
    this.performanceData = {
      navigation: {},
      resources: [],
      marks: new Map(),
      measures: new Map(),
      observers: new Map(),
      memoryStats: [],
      customMetrics: new Map(),
    };
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.resourceObserver = null;
    this.navigationObserver = null;
    this.paintObserver = null;
    this.layoutShiftObserver = null;
    this.init();
  }

  init() {
    console.log("🚀 Performance API Manager 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.loadInitialData();
    this.setupPerformanceObservers();
    console.log("✅ Performance API Manager 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Performance API 지원 여부 확인 중...");

    const support = {
      performance: "performance" in window,
      performanceObserver: "PerformanceObserver" in window,
      performanceNavigation: "PerformanceNavigationTiming" in window,
      performanceResource: "PerformanceResourceTiming" in window,
      performancePaint: "PerformancePaintTiming" in window,
      performanceMark: "PerformanceMark" in window,
      performanceMeasure: "PerformanceMeasure" in window,
      performanceMemory: "memory" in performance,
      userTiming: "mark" in performance && "measure" in performance,
      highResolutionTime: "now" in performance,
      layoutShift: "LayoutShift" in window,
      largestContentfulPaint: "LargestContentfulPaint" in window,
      firstInput: "FirstInput" in window,
    };

    console.log("📊 Performance API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");

    appDiv.innerHTML = `
      <div class="performance-container">
        <header class="performance-header">
          <h1>🚀 Performance API</h1>
          <p>웹 성능 측정, 모니터링, 분석의 모든 기능을 체험하세요</p>
          
          <div style="margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="quickPerformanceTest" class="btn-primary">🚀 빠른 성능 테스트</button>
            <button id="startMonitoring" class="btn-success">📊 실시간 모니터링 시작</button>
            <button id="stopMonitoring" class="btn-warning">⏹️ 모니터링 정지</button>
            <button id="exportReport" class="btn-info">📤 성능 리포트 내보내기</button>
          </div>

          <div class="api-support">
            ${Object.entries(this.apiSupport)
              .map(
                ([key, supported]) => `
              <div class="support-badge ${
                supported ? "supported" : "unsupported"
              }">
                ${supported ? "✅" : "❌"} ${this.formatSupportLabel(key)}
              </div>
            `
              )
              .join("")}
          </div>
        </header>

        <main class="performance-main">
          <!-- 실시간 성능 대시보드 -->
          <div class="panel-card primary">
            <h2>📊 실시간 성능 대시보드</h2>
            
            <div class="dashboard-grid">
              <!-- 핵심 웹 지표 -->
              <div class="metric-group">
                <h3>🎯 핵심 웹 지표 (Core Web Vitals)</h3>
                <div class="vitals-grid">
                  <div class="vital-card lcp">
                    <div class="vital-icon">🎨</div>
                    <div class="vital-info">
                      <span class="vital-label">LCP</span>
                      <span class="vital-value" id="lcpValue">측정 중...</span>
                      <span class="vital-description">Largest Contentful Paint</span>
                    </div>
                    <div class="vital-status" id="lcpStatus">⏳</div>
                  </div>
                  <div class="vital-card fid">
                    <div class="vital-icon">⚡</div>
                    <div class="vital-info">
                      <span class="vital-label">FID</span>
                      <span class="vital-value" id="fidValue">측정 중...</span>
                      <span class="vital-description">First Input Delay</span>
                    </div>
                    <div class="vital-status" id="fidStatus">⏳</div>
                  </div>
                  <div class="vital-card cls">
                    <div class="vital-icon">📐</div>
                    <div class="vital-info">
                      <span class="vital-label">CLS</span>
                      <span class="vital-value" id="clsValue">측정 중...</span>
                      <span class="vital-description">Cumulative Layout Shift</span>
                    </div>
                    <div class="vital-status" id="clsStatus">⏳</div>
                  </div>
                </div>
              </div>

              <!-- 페이지 로드 성능 -->
              <div class="metric-group">
                <h3>⏱️ 페이지 로드 성능</h3>
                <div class="load-metrics">
                  <div class="load-timeline">
                    <div class="timeline-bar">
                      <div class="timeline-segment dns" id="dnsSegment">
                        <span class="segment-label">DNS</span>
                      </div>
                      <div class="timeline-segment connect" id="connectSegment">
                        <span class="segment-label">연결</span>
                      </div>
                      <div class="timeline-segment request" id="requestSegment">
                        <span class="segment-label">요청</span>
                      </div>
                      <div class="timeline-segment response" id="responseSegment">
                        <span class="segment-label">응답</span>
                      </div>
                      <div class="timeline-segment dom" id="domSegment">
                        <span class="segment-label">DOM</span>
                      </div>
                      <div class="timeline-segment load" id="loadSegment">
                        <span class="segment-label">로드</span>
                      </div>
                    </div>
                    <div class="timeline-labels">
                      <span>0ms</span>
                      <span id="totalLoadTime">측정 중...</span>
                    </div>
                  </div>
                  <div class="load-details">
                    <div class="detail-item">
                      <span class="detail-label">DOM Content Loaded:</span>
                      <span class="detail-value" id="domContentLoaded">-</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Load Event:</span>
                      <span class="detail-value" id="loadEvent">-</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">First Paint:</span>
                      <span class="detail-value" id="firstPaint">-</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">First Contentful Paint:</span>
                      <span class="detail-value" id="firstContentfulPaint">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 메모리 사용량 -->
              <div class="metric-group">
                <h3>💾 메모리 사용량</h3>
                <div class="memory-stats">
                  <div class="memory-chart-container">
                    <canvas id="memoryChart" width="300" height="150"></canvas>
                  </div>
                  <div class="memory-details">
                    <div class="memory-item">
                      <span class="memory-label">사용된 JS 힙:</span>
                      <span class="memory-value" id="usedJSHeapSize">-</span>
                    </div>
                    <div class="memory-item">
                      <span class="memory-label">총 JS 힙:</span>
                      <span class="memory-value" id="totalJSHeapSize">-</span>
                    </div>
                    <div class="memory-item">
                      <span class="memory-label">JS 힙 한계:</span>
                      <span class="memory-value" id="jsHeapSizeLimit">-</span>
                    </div>
                    <div class="memory-item">
                      <span class="memory-label">메모리 사용률:</span>
                      <span class="memory-value" id="memoryUsagePercent">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="monitoring-controls">
              <button id="refreshDashboard" class="btn-primary">🔄 대시보드 새로고침</button>
              <button id="clearMetrics" class="btn-danger">🗑️ 지표 초기화</button>
              <button id="simulateLoad" class="btn-info">⚡ 부하 시뮬레이션</button>
            </div>
          </div>

          <!-- User Timing API -->
          <div class="panel-card">
            <h2>⏱️ User Timing API</h2>
            
            <div class="timing-section">
              <div class="timing-controls">
                <h3>🎯 사용자 정의 타이밍</h3>
                <div class="timing-form">
                  <div class="form-row">
                    <input type="text" id="markName" placeholder="마크 이름 (예: user-action-start)" class="form-input">
                    <button id="createMark" class="btn-primary">📍 마크 생성</button>
                  </div>
                  <div class="form-row">
                    <input type="text" id="measureName" placeholder="측정 이름 (예: user-action-duration)" class="form-input">
                    <input type="text" id="startMark" placeholder="시작 마크" class="form-input">
                    <input type="text" id="endMark" placeholder="종료 마크" class="form-input">
                    <button id="createMeasure" class="btn-success">📏 측정 생성</button>
                  </div>
                </div>
                <div class="timing-presets">
                  <button id="measurePageLoad" class="btn-info">📄 페이지 로드 측정</button>
                  <button id="measureImageLoad" class="btn-info">🖼️ 이미지 로드 측정</button>
                  <button id="measureApiCall" class="btn-info">🌐 API 호출 측정</button>
                  <button id="measureUserInteraction" class="btn-info">👆 사용자 상호작용 측정</button>
                </div>
              </div>

              <div class="timing-results">
                <h3>📊 타이밍 결과</h3>
                <div class="timing-tabs">
                  <button class="timing-tab-btn active" data-tab="marks">마크</button>
                  <button class="timing-tab-btn" data-tab="measures">측정</button>
                  <button class="timing-tab-btn" data-tab="timeline">타임라인</button>
                </div>
                
                <div class="timing-content">
                  <!-- 마크 탭 -->
                  <div class="timing-panel active" id="marks">
                    <div class="marks-list">
                      <div class="marks-header">
                        <span>이름</span>
                        <span>시간</span>
                        <span>타입</span>
                        <span>액션</span>
                      </div>
                      <div id="marksList" class="marks-items">
                        <div class="marks-placeholder">생성된 마크가 없습니다</div>
                      </div>
                    </div>
                  </div>

                  <!-- 측정 탭 -->
                  <div class="timing-panel" id="measures">
                    <div class="measures-list">
                      <div class="measures-header">
                        <span>이름</span>
                        <span>지속시간</span>
                        <span>시작</span>
                        <span>종료</span>
                        <span>액션</span>
                      </div>
                      <div id="measuresList" class="measures-items">
                        <div class="measures-placeholder">생성된 측정이 없습니다</div>
                      </div>
                    </div>
                  </div>

                  <!-- 타임라인 탭 -->
                  <div class="timing-panel" id="timeline">
                    <div class="timeline-visualization">
                      <canvas id="timelineChart" width="600" height="300"></canvas>
                    </div>
                    <div class="timeline-controls">
                      <button id="exportTimeline" class="btn-primary">📤 타임라인 내보내기</button>
                      <button id="clearTimeline" class="btn-danger">🗑️ 타임라인 초기화</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resource Timing -->
          <div class="panel-card">
            <h2>📦 Resource Timing</h2>
            
            <div class="resource-section">
              <div class="resource-controls">
                <h3>🔍 리소스 분석</h3>
                <div class="resource-filters">
                  <select id="resourceTypeFilter">
                    <option value="all">모든 리소스</option>
                    <option value="document">문서</option>
                    <option value="script">스크립트</option>
                    <option value="stylesheet">스타일시트</option>
                    <option value="image">이미지</option>
                    <option value="fetch">Fetch/XHR</option>
                    <option value="other">기타</option>
                  </select>
                  <button id="refreshResources" class="btn-primary">🔄 리소스 새로고침</button>
                  <button id="loadTestResource" class="btn-info">🧪 테스트 리소스 로드</button>
                </div>
              </div>

              <div class="resource-summary">
                <h3>📊 리소스 요약</h3>
                <div class="summary-stats">
                  <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-info">
                      <span class="stat-label">총 리소스</span>
                      <span class="stat-value" id="totalResources">0</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-info">
                      <span class="stat-label">평균 로드 시간</span>
                      <span class="stat-value" id="avgLoadTime">0ms</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                      <span class="stat-label">총 전송 크기</span>
                      <span class="stat-value" id="totalTransferSize">0 KB</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">🚀</div>
                    <div class="stat-info">
                      <span class="stat-label">가장 느린 리소스</span>
                      <span class="stat-value" id="slowestResource">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="resource-details">
                <h3>📋 리소스 상세</h3>
                <div class="resource-table">
                  <div class="resource-header">
                    <span>이름</span>
                    <span>타입</span>
                    <span>크기</span>
                    <span>로드 시간</span>
                    <span>상태</span>
                  </div>
                  <div id="resourcesList" class="resource-items">
                    <div class="resource-placeholder">리소스 로드 중...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Observer -->
          <div class="panel-card">
            <h2>👁️ Performance Observer</h2>
            
            <div class="observer-section">
              <div class="observer-controls">
                <h3>🎛️ 옵저버 제어</h3>
                <div class="observer-grid">
                  <div class="observer-card">
                    <h4>📈 Navigation Timing</h4>
                    <p>페이지 네비게이션 성능 모니터링</p>
                    <button id="toggleNavigationObserver" class="btn-primary observer-toggle" data-type="navigation">시작</button>
                  </div>
                  <div class="observer-card">
                    <h4>📦 Resource Timing</h4>
                    <p>리소스 로드 성능 모니터링</p>
                    <button id="toggleResourceObserver" class="btn-primary observer-toggle" data-type="resource">시작</button>
                  </div>
                  <div class="observer-card">
                    <h4>🎨 Paint Timing</h4>
                    <p>페인트 이벤트 모니터링</p>
                    <button id="togglePaintObserver" class="btn-primary observer-toggle" data-type="paint">시작</button>
                  </div>
                  <div class="observer-card">
                    <h4>📐 Layout Shift</h4>
                    <p>레이아웃 변화 모니터링</p>
                    <button id="toggleLayoutShiftObserver" class="btn-primary observer-toggle" data-type="layout-shift">시작</button>
                  </div>
                  <div class="observer-card">
                    <h4>⏱️ User Timing</h4>
                    <p>사용자 정의 타이밍 모니터링</p>
                    <button id="toggleUserTimingObserver" class="btn-primary observer-toggle" data-type="mark,measure">시작</button>
                  </div>
                  <div class="observer-card">
                    <h4>🎯 Largest Contentful Paint</h4>
                    <p>LCP 이벤트 모니터링</p>
                    <button id="toggleLCPObserver" class="btn-primary observer-toggle" data-type="largest-contentful-paint">시작</button>
                  </div>
                </div>
              </div>

              <div class="observer-logs">
                <h3>📊 옵저버 로그</h3>
                <div class="log-controls">
                  <button id="clearLogs" class="btn-danger">🗑️ 로그 초기화</button>
                  <button id="exportLogs" class="btn-info">📤 로그 내보내기</button>
                  <label>
                    <input type="checkbox" id="autoScroll" checked>
                    자동 스크롤
                  </label>
                </div>
                <div id="observerLogs" class="logs-container">
                  <div class="logs-placeholder">옵저버를 시작하면 로그가 여기에 표시됩니다</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 성능 테스트 -->
          <div class="panel-card">
            <h2>🧪 성능 테스트</h2>
            
            <div class="test-section">
              <div class="test-scenarios">
                <h3>🎯 테스트 시나리오</h3>
                <div class="scenario-grid">
                  <div class="scenario-card">
                    <h4>💾 메모리 부하 테스트</h4>
                    <p>메모리 집약적 작업으로 성능 영향 측정</p>
                    <div class="scenario-controls">
                      <input type="range" id="memoryTestSize" min="1" max="100" value="10">
                      <span id="memoryTestSizeValue">10MB</span>
                      <button id="runMemoryTest" class="btn-primary">🚀 실행</button>
                    </div>
                  </div>
                  <div class="scenario-card">
                    <h4>🔄 CPU 부하 테스트</h4>
                    <p>CPU 집약적 계산으로 성능 영향 측정</p>
                    <div class="scenario-controls">
                      <input type="range" id="cpuTestDuration" min="100" max="5000" value="1000" step="100">
                      <span id="cpuTestDurationValue">1000ms</span>
                      <button id="runCpuTest" class="btn-primary">🚀 실행</button>
                    </div>
                  </div>
                  <div class="scenario-card">
                    <h4>🌐 네트워크 부하 테스트</h4>
                    <p>여러 리소스 동시 로드로 네트워크 성능 측정</p>
                    <div class="scenario-controls">
                      <input type="range" id="networkTestCount" min="1" max="20" value="5">
                      <span id="networkTestCountValue">5개 요청</span>
                      <button id="runNetworkTest" class="btn-primary">🚀 실행</button>
                    </div>
                  </div>
                  <div class="scenario-card">
                    <h4>🎨 렌더링 부하 테스트</h4>
                    <p>DOM 조작과 애니메이션으로 렌더링 성능 측정</p>
                    <div class="scenario-controls">
                      <input type="range" id="renderTestElements" min="100" max="10000" value="1000" step="100">
                      <span id="renderTestElementsValue">1000개 요소</span>
                      <button id="runRenderTest" class="btn-primary">🚀 실행</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="test-results">
                <h3>📊 테스트 결과</h3>
                <div id="testResults" class="results-container">
                  <div class="results-placeholder">테스트를 실행하면 결과가 여기에 표시됩니다</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 커스텀 메트릭 -->
          <div class="panel-card">
            <h2>📏 커스텀 메트릭</h2>
            
            <div class="metrics-section">
              <div class="metrics-creator">
                <h3>✨ 메트릭 생성기</h3>
                <div class="metric-form">
                  <div class="form-group">
                    <label for="metricName">메트릭 이름</label>
                    <input type="text" id="metricName" placeholder="예: button-click-response-time">
                  </div>
                  <div class="form-group">
                    <label for="metricDescription">설명</label>
                    <input type="text" id="metricDescription" placeholder="메트릭에 대한 설명">
                  </div>
                  <div class="form-group">
                    <label for="metricType">메트릭 타입</label>
                    <select id="metricType">
                      <option value="timing">타이밍 (ms)</option>
                      <option value="counter">카운터</option>
                      <option value="gauge">게이지</option>
                      <option value="ratio">비율 (%)</option>
                    </select>
                  </div>
                  <div class="form-actions">
                    <button id="createMetric" class="btn-primary">📊 메트릭 생성</button>
                    <button id="startMetricRecording" class="btn-success">🎬 기록 시작</button>
                    <button id="stopMetricRecording" class="btn-warning">⏹️ 기록 정지</button>
                  </div>
                </div>
              </div>

              <div class="metrics-dashboard">
                <h3>📈 커스텀 메트릭 대시보드</h3>
                <div id="customMetricsList" class="custom-metrics-grid">
                  <div class="metrics-placeholder">생성된 커스텀 메트릭이 없습니다</div>
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

  formatSupportLabel(key) {
    const labels = {
      performance: "Performance",
      performanceObserver: "Performance Observer",
      performanceNavigation: "Navigation Timing",
      performanceResource: "Resource Timing",
      performancePaint: "Paint Timing",
      performanceMark: "Performance Mark",
      performanceMeasure: "Performance Measure",
      performanceMemory: "Memory Info",
      userTiming: "User Timing",
      highResolutionTime: "High Resolution Time",
      layoutShift: "Layout Shift",
      largestContentfulPaint: "Largest Contentful Paint",
      firstInput: "First Input Delay",
    };
    return labels[key] || key;
  }

  setupEventListeners() {
    // 빠른 테스트 및 기본 제어
    document
      .getElementById("quickPerformanceTest")
      ?.addEventListener("click", () => this.runQuickTest());
    document
      .getElementById("startMonitoring")
      ?.addEventListener("click", () => this.startMonitoring());
    document
      .getElementById("stopMonitoring")
      ?.addEventListener("click", () => this.stopMonitoring());
    document
      .getElementById("exportReport")
      ?.addEventListener("click", () => this.exportReport());

    // 대시보드 제어
    document
      .getElementById("refreshDashboard")
      ?.addEventListener("click", () => this.refreshDashboard());
    document
      .getElementById("clearMetrics")
      ?.addEventListener("click", () => this.clearMetrics());
    document
      .getElementById("simulateLoad")
      ?.addEventListener("click", () => this.simulateLoad());

    // User Timing
    document
      .getElementById("createMark")
      ?.addEventListener("click", () => this.createMark());
    document
      .getElementById("createMeasure")
      ?.addEventListener("click", () => this.createMeasure());
    document
      .getElementById("measurePageLoad")
      ?.addEventListener("click", () => this.measurePageLoad());
    document
      .getElementById("measureImageLoad")
      ?.addEventListener("click", () => this.measureImageLoad());
    document
      .getElementById("measureApiCall")
      ?.addEventListener("click", () => this.measureApiCall());
    document
      .getElementById("measureUserInteraction")
      ?.addEventListener("click", () => this.measureUserInteraction());

    // 타이밍 탭
    document.querySelectorAll(".timing-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTimingTab(e.target.dataset.tab)
      );
    });

    document
      .getElementById("exportTimeline")
      ?.addEventListener("click", () => this.exportTimeline());
    document
      .getElementById("clearTimeline")
      ?.addEventListener("click", () => this.clearTimeline());

    // Resource Timing
    document
      .getElementById("resourceTypeFilter")
      ?.addEventListener("change", () => this.filterResources());
    document
      .getElementById("refreshResources")
      ?.addEventListener("click", () => this.refreshResources());
    document
      .getElementById("loadTestResource")
      ?.addEventListener("click", () => this.loadTestResource());

    // Performance Observer
    document.querySelectorAll(".observer-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => this.toggleObserver(e.target));
    });

    document
      .getElementById("clearLogs")
      ?.addEventListener("click", () => this.clearLogs());
    document
      .getElementById("exportLogs")
      ?.addEventListener("click", () => this.exportLogs());

    // 성능 테스트
    document
      .getElementById("memoryTestSize")
      ?.addEventListener("input", (e) =>
        this.updateTestValue("memoryTest", e.target.value, "MB")
      );
    document
      .getElementById("cpuTestDuration")
      ?.addEventListener("input", (e) =>
        this.updateTestValue("cpuTest", e.target.value, "ms")
      );
    document
      .getElementById("networkTestCount")
      ?.addEventListener("input", (e) =>
        this.updateTestValue("networkTest", e.target.value, "개 요청")
      );
    document
      .getElementById("renderTestElements")
      ?.addEventListener("input", (e) =>
        this.updateTestValue("renderTest", e.target.value, "개 요소")
      );

    document
      .getElementById("runMemoryTest")
      ?.addEventListener("click", () => this.runMemoryTest());
    document
      .getElementById("runCpuTest")
      ?.addEventListener("click", () => this.runCpuTest());
    document
      .getElementById("runNetworkTest")
      ?.addEventListener("click", () => this.runNetworkTest());
    document
      .getElementById("runRenderTest")
      ?.addEventListener("click", () => this.runRenderTest());

    // 커스텀 메트릭
    document
      .getElementById("createMetric")
      ?.addEventListener("click", () => this.createCustomMetric());
    document
      .getElementById("startMetricRecording")
      ?.addEventListener("click", () => this.startMetricRecording());
    document
      .getElementById("stopMetricRecording")
      ?.addEventListener("click", () => this.stopMetricRecording());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  loadInitialData() {
    this.loadNavigationTiming();
    this.loadResourceTiming();
    this.loadPaintTiming();
    this.updateMemoryStats();
    this.updateCoreWebVitals();
  }

  setupPerformanceObservers() {
    if (!this.apiSupport.performanceObserver) {
      console.warn("PerformanceObserver가 지원되지 않습니다");
      return;
    }

    // Layout Shift Observer 자동 시작
    this.setupLayoutShiftObserver();
    // LCP Observer 자동 시작
    this.setupLCPObserver();
    // FID Observer 자동 시작
    this.setupFIDObserver();
  }

  // 빠른 테스트
  async runQuickTest() {
    this.showInPageNotification("빠른 성능 테스트 시작!", "info");

    try {
      // 1. 현재 성능 지표 수집
      const navTiming = performance.getEntriesByType("navigation")[0];
      const paintTiming = performance.getEntriesByType("paint");
      const memoryInfo = this.getMemoryInfo();

      // 2. User Timing 테스트
      performance.mark("quick-test-start");

      // 3. 간단한 계산 작업
      const start = performance.now();
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.random();
      }
      const end = performance.now();

      performance.mark("quick-test-end");
      performance.measure(
        "quick-test-duration",
        "quick-test-start",
        "quick-test-end"
      );

      // 4. 결과 표시
      const testResult = {
        계산_시간: `${(end - start).toFixed(2)}ms`,
        DOM_로드: navTiming
          ? `${navTiming.domContentLoadedEventEnd.toFixed(2)}ms`
          : "N/A",
        페이지_로드: navTiming
          ? `${navTiming.loadEventEnd.toFixed(2)}ms`
          : "N/A",
        첫_페인트:
          paintTiming.length > 0
            ? `${paintTiming[0].startTime.toFixed(2)}ms`
            : "N/A",
        메모리_사용: memoryInfo
          ? this.formatBytes(memoryInfo.usedJSHeapSize)
          : "N/A",
        계산_결과: result.toFixed(2),
      };

      console.log("🚀 빠른 성능 테스트 결과:", testResult);

      this.showInPageNotification(
        `
        빠른 테스트 완료!
        계산 시간: ${testResult.계산_시간}
        DOM 로드: ${testResult.DOM_로드}
        메모리 사용: ${testResult.메모리_사용}
      `,
        "success"
      );

      // 5. 타이밍 결과 업데이트
      this.updateTimingResults();
    } catch (error) {
      console.error("빠른 테스트 오류:", error);
      this.showInPageNotification(`테스트 실패: ${error.message}`, "error");
    }
  }

  startMonitoring() {
    if (this.isMonitoring) {
      this.showInPageNotification("이미 모니터링이 진행 중입니다", "warning");
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMemoryStats();
      this.updateCoreWebVitals();
      this.refreshDashboard();
    }, 1000);

    this.showInPageNotification("실시간 모니터링을 시작했습니다", "success");
    document.getElementById("startMonitoring").textContent =
      "📊 모니터링 중...";
    document.getElementById("startMonitoring").disabled = true;
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      this.showInPageNotification("모니터링이 진행 중이지 않습니다", "warning");
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.showInPageNotification("실시간 모니터링을 정지했습니다", "info");
    document.getElementById("startMonitoring").textContent =
      "📊 실시간 모니터링 시작";
    document.getElementById("startMonitoring").disabled = false;
  }

  loadNavigationTiming() {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length === 0) return;

    const nav = navEntries[0];
    this.performanceData.navigation = nav;

    // 타임라인 업데이트
    this.updateLoadTimeline(nav);

    // 로드 세부사항 업데이트
    document.getElementById(
      "domContentLoaded"
    ).textContent = `${nav.domContentLoadedEventEnd.toFixed(2)}ms`;
    document.getElementById(
      "loadEvent"
    ).textContent = `${nav.loadEventEnd.toFixed(2)}ms`;
  }

  loadPaintTiming() {
    const paintEntries = performance.getEntriesByType("paint");

    paintEntries.forEach((entry) => {
      if (entry.name === "first-paint") {
        document.getElementById(
          "firstPaint"
        ).textContent = `${entry.startTime.toFixed(2)}ms`;
      } else if (entry.name === "first-contentful-paint") {
        document.getElementById(
          "firstContentfulPaint"
        ).textContent = `${entry.startTime.toFixed(2)}ms`;
      }
    });
  }

  loadResourceTiming() {
    const resources = performance.getEntriesByType("resource");
    this.performanceData.resources = resources;
    this.updateResourceSummary();
    this.updateResourceList();
  }

  updateLoadTimeline(nav) {
    const totalTime = nav.loadEventEnd;

    // 각 세그먼트의 시간 계산
    const segments = {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      connect: nav.connectEnd - nav.connectStart,
      request: nav.responseStart - nav.requestStart,
      response: nav.responseEnd - nav.responseStart,
      dom: nav.domContentLoadedEventEnd - nav.responseEnd,
      load: nav.loadEventEnd - nav.domContentLoadedEventEnd,
    };

    // 타임라인 바 업데이트
    let cumulativeTime = 0;
    Object.entries(segments).forEach(([key, duration]) => {
      const element = document.getElementById(`${key}Segment`);
      if (element) {
        const width = (duration / totalTime) * 100;
        element.style.width = `${width}%`;
        element.style.left = `${(cumulativeTime / totalTime) * 100}%`;
        element.title = `${key}: ${duration.toFixed(2)}ms`;
      }
      cumulativeTime += duration;
    });

    document.getElementById("totalLoadTime").textContent = `${totalTime.toFixed(
      2
    )}ms`;
  }

  updateMemoryStats() {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return;

    document.getElementById("usedJSHeapSize").textContent = this.formatBytes(
      memoryInfo.usedJSHeapSize
    );
    document.getElementById("totalJSHeapSize").textContent = this.formatBytes(
      memoryInfo.totalJSHeapSize
    );
    document.getElementById("jsHeapSizeLimit").textContent = this.formatBytes(
      memoryInfo.jsHeapSizeLimit
    );

    const usagePercent =
      (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
    document.getElementById(
      "memoryUsagePercent"
    ).textContent = `${usagePercent.toFixed(1)}%`;

    // 메모리 차트 업데이트
    this.performanceData.memoryStats.push({
      timestamp: Date.now(),
      used: memoryInfo.usedJSHeapSize,
      total: memoryInfo.totalJSHeapSize,
    });

    // 최근 100개 데이터만 유지
    if (this.performanceData.memoryStats.length > 100) {
      this.performanceData.memoryStats.shift();
    }

    this.updateMemoryChart();
  }

  updateMemoryChart() {
    const canvas = document.getElementById("memoryChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.performanceData.memoryStats;

    if (data.length === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 차트 그리기
    const maxMemory = Math.max(...data.map((d) => d.total));
    const width = canvas.width;
    const height = canvas.height;

    // 배경 그리드
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 사용된 메모리 라인
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (point.used / maxMemory) * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 총 메모리 라인
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (point.total / maxMemory) * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  updateCoreWebVitals() {
    // LCP는 observer에서 업데이트
    // FID는 observer에서 업데이트
    // CLS는 observer에서 업데이트
  }

  setupLayoutShiftObserver() {
    if (!("PerformanceObserver" in window) || !("LayoutShift" in window))
      return;

    try {
      let clsValue = 0;

      this.layoutShiftObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        document.getElementById("clsValue").textContent = clsValue.toFixed(4);
        document.getElementById("clsStatus").textContent =
          clsValue < 0.1 ? "✅" : clsValue < 0.25 ? "⚠️" : "❌";
      });

      this.layoutShiftObserver.observe({
        type: "layout-shift",
        buffered: true,
      });
    } catch (error) {
      console.warn("Layout Shift Observer 설정 실패:", error);
    }
  }

  setupLCPObserver() {
    if (
      !("PerformanceObserver" in window) ||
      !("LargestContentfulPaint" in window)
    )
      return;

    try {
      this.lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        document.getElementById(
          "lcpValue"
        ).textContent = `${lastEntry.startTime.toFixed(2)}ms`;
        document.getElementById("lcpStatus").textContent =
          lastEntry.startTime < 2500
            ? "✅"
            : lastEntry.startTime < 4000
            ? "⚠️"
            : "❌";
      });

      this.lcpObserver.observe({
        type: "largest-contentful-paint",
        buffered: true,
      });
    } catch (error) {
      console.warn("LCP Observer 설정 실패:", error);
    }
  }

  setupFIDObserver() {
    if (!("PerformanceObserver" in window) || !("FirstInput" in window)) return;

    try {
      this.fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = entry.processingStart - entry.startTime;

          document.getElementById("fidValue").textContent = `${fid.toFixed(
            2
          )}ms`;
          document.getElementById("fidStatus").textContent =
            fid < 100 ? "✅" : fid < 300 ? "⚠️" : "❌";
        }
      });

      this.fidObserver.observe({ type: "first-input", buffered: true });
    } catch (error) {
      console.warn("FID Observer 설정 실패:", error);
    }
  }

  // User Timing 메소드들
  createMark() {
    const markName = document.getElementById("markName").value.trim();
    if (!markName) {
      this.showInPageNotification("마크 이름을 입력하세요", "warning");
      return;
    }

    try {
      performance.mark(markName);
      this.performanceData.marks.set(markName, {
        name: markName,
        time: performance.now(),
        timestamp: Date.now(),
      });

      this.showInPageNotification(
        `마크 '${markName}'이 생성되었습니다`,
        "success"
      );
      this.updateTimingResults();
      document.getElementById("markName").value = "";
    } catch (error) {
      this.showInPageNotification(`마크 생성 실패: ${error.message}`, "error");
    }
  }

  createMeasure() {
    const measureName = document.getElementById("measureName").value.trim();
    const startMark = document.getElementById("startMark").value.trim();
    const endMark = document.getElementById("endMark").value.trim();

    if (!measureName) {
      this.showInPageNotification("측정 이름을 입력하세요", "warning");
      return;
    }

    try {
      let measure;
      if (startMark && endMark) {
        measure = performance.measure(measureName, startMark, endMark);
      } else if (startMark) {
        measure = performance.measure(measureName, startMark);
      } else {
        measure = performance.measure(measureName);
      }

      this.performanceData.measures.set(measureName, {
        name: measureName,
        duration: measure.duration,
        startTime: measure.startTime,
        startMark: startMark || "navigationStart",
        endMark: endMark || "now",
      });

      this.showInPageNotification(
        `측정 '${measureName}'이 생성되었습니다`,
        "success"
      );
      this.updateTimingResults();

      // 폼 초기화
      document.getElementById("measureName").value = "";
      document.getElementById("startMark").value = "";
      document.getElementById("endMark").value = "";
    } catch (error) {
      this.showInPageNotification(`측정 생성 실패: ${error.message}`, "error");
    }
  }

  updateTimingResults() {
    this.updateMarksList();
    this.updateMeasuresList();
  }

  updateMarksList() {
    const container = document.getElementById("marksList");
    if (!container) return;

    if (this.performanceData.marks.size === 0) {
      container.innerHTML =
        '<div class="marks-placeholder">생성된 마크가 없습니다</div>';
      return;
    }

    container.innerHTML = Array.from(this.performanceData.marks.values())
      .map(
        (mark) => `
        <div class="mark-item">
          <span class="mark-name">${mark.name}</span>
          <span class="mark-time">${mark.time.toFixed(2)}ms</span>
          <span class="mark-type">User Mark</span>
          <span class="mark-actions">
            <button onclick="window.performanceAPI.deleteMark('${
              mark.name
            }')" class="btn-small btn-danger">🗑️</button>
          </span>
        </div>
      `
      )
      .join("");
  }

  updateMeasuresList() {
    const container = document.getElementById("measuresList");
    if (!container) return;

    if (this.performanceData.measures.size === 0) {
      container.innerHTML =
        '<div class="measures-placeholder">생성된 측정이 없습니다</div>';
      return;
    }

    container.innerHTML = Array.from(this.performanceData.measures.values())
      .map(
        (measure) => `
        <div class="measure-item">
          <span class="measure-name">${measure.name}</span>
          <span class="measure-duration">${measure.duration.toFixed(2)}ms</span>
          <span class="measure-start">${measure.startMark}</span>
          <span class="measure-end">${measure.endMark}</span>
          <span class="measure-actions">
            <button onclick="window.performanceAPI.deleteMeasure('${
              measure.name
            }')" class="btn-small btn-danger">🗑️</button>
          </span>
        </div>
      `
      )
      .join("");
  }

  deleteMark(name) {
    try {
      performance.clearMarks(name);
      this.performanceData.marks.delete(name);
      this.updateTimingResults();
      this.showInPageNotification(`마크 '${name}'이 삭제되었습니다`, "info");
    } catch (error) {
      this.showInPageNotification(`마크 삭제 실패: ${error.message}`, "error");
    }
  }

  deleteMeasure(name) {
    try {
      performance.clearMeasures(name);
      this.performanceData.measures.delete(name);
      this.updateTimingResults();
      this.showInPageNotification(`측정 '${name}'이 삭제되었습니다`, "info");
    } catch (error) {
      this.showInPageNotification(`측정 삭제 실패: ${error.message}`, "error");
    }
  }

  // 미리 정의된 측정들
  measurePageLoad() {
    performance.mark("page-load-start");
    setTimeout(() => {
      performance.mark("page-load-end");
      performance.measure("page-load-time", "page-load-start", "page-load-end");
      this.updateTimingResults();
      this.showInPageNotification(
        "페이지 로드 시간이 측정되었습니다",
        "success"
      );
    }, 100);
  }

  measureImageLoad() {
    performance.mark("image-load-start");

    const img = new Image();
    img.onload = () => {
      performance.mark("image-load-end");
      performance.measure(
        "image-load-time",
        "image-load-start",
        "image-load-end"
      );
      this.updateTimingResults();
      this.showInPageNotification(
        "이미지 로드 시간이 측정되었습니다",
        "success"
      );
    };
    img.onerror = () => {
      this.showInPageNotification("이미지 로드 실패", "error");
    };
    img.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NjZmMSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=";
  }

  measureApiCall() {
    performance.mark("api-call-start");

    fetch("data:application/json;base64,eyJ0ZXN0IjoidmFsdWUifQ==")
      .then(() => {
        performance.mark("api-call-end");
        performance.measure("api-call-time", "api-call-start", "api-call-end");
        this.updateTimingResults();
        this.showInPageNotification(
          "API 호출 시간이 측정되었습니다",
          "success"
        );
      })
      .catch(() => {
        this.showInPageNotification("API 호출 실패", "error");
      });
  }

  measureUserInteraction() {
    this.showInPageNotification("아무 곳이나 클릭하세요 (5초 내)", "info");

    performance.mark("interaction-start");

    const handleClick = () => {
      performance.mark("interaction-end");
      performance.measure(
        "user-interaction-time",
        "interaction-start",
        "interaction-end"
      );
      this.updateTimingResults();
      this.showInPageNotification(
        "사용자 상호작용 시간이 측정되었습니다",
        "success"
      );
      document.removeEventListener("click", handleClick);
    };

    document.addEventListener("click", handleClick);

    // 5초 후 자동 취소
    setTimeout(() => {
      document.removeEventListener("click", handleClick);
    }, 5000);
  }

  // 리소스 관련 메소드들
  updateResourceSummary() {
    const resources = this.performanceData.resources;

    document.getElementById("totalResources").textContent = resources.length;

    if (resources.length > 0) {
      const avgLoadTime =
        resources.reduce((sum, r) => sum + r.duration, 0) / resources.length;
      document.getElementById(
        "avgLoadTime"
      ).textContent = `${avgLoadTime.toFixed(2)}ms`;

      const totalSize = resources.reduce(
        (sum, r) => sum + (r.transferSize || 0),
        0
      );
      document.getElementById("totalTransferSize").textContent =
        this.formatBytes(totalSize);

      const slowest = resources.reduce((max, r) =>
        r.duration > max.duration ? r : max
      );
      document.getElementById("slowestResource").textContent =
        slowest.name.split("/").pop() || slowest.name.substring(0, 20) + "...";
    }
  }

  updateResourceList() {
    const container = document.getElementById("resourcesList");
    if (!container) return;

    const resources = this.performanceData.resources;

    if (resources.length === 0) {
      container.innerHTML =
        '<div class="resource-placeholder">리소스 로드 중...</div>';
      return;
    }

    container.innerHTML = resources
      .slice(0, 20) // 처음 20개만 표시
      .map(
        (resource) => `
        <div class="resource-item">
          <span class="resource-name" title="${resource.name}">
            ${
              resource.name.split("/").pop() ||
              resource.name.substring(0, 30) + "..."
            }
          </span>
          <span class="resource-type">${this.getResourceType(resource)}</span>
          <span class="resource-size">${this.formatBytes(
            resource.transferSize || 0
          )}</span>
          <span class="resource-time">${resource.duration.toFixed(2)}ms</span>
          <span class="resource-status">${this.getResourceStatus(
            resource
          )}</span>
        </div>
      `
      )
      .join("");
  }

  getResourceType(resource) {
    const name = resource.name.toLowerCase();
    if (name.includes(".js")) return "script";
    if (name.includes(".css")) return "stylesheet";
    if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)/)) return "image";
    if (
      resource.initiatorType === "fetch" ||
      resource.initiatorType === "xmlhttprequest"
    )
      return "fetch";
    return resource.initiatorType || "other";
  }

  getResourceStatus(resource) {
    if (resource.duration > 1000) return "🐌 느림";
    if (resource.duration > 500) return "⚠️ 보통";
    return "✅ 빠름";
  }

  // 유틸리티 메소드들
  getMemoryInfo() {
    return this.apiSupport.performanceMemory ? performance.memory : null;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // UI 업데이트 메소드들
  switchTimingTab(tab) {
    document
      .querySelectorAll(".timing-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    document
      .querySelectorAll(".timing-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }

  refreshDashboard() {
    this.loadNavigationTiming();
    this.loadResourceTiming();
    this.loadPaintTiming();
    this.updateMemoryStats();
    this.showInPageNotification("대시보드가 새로고침되었습니다", "info");
  }

  clearMetrics() {
    // User Timing 초기화
    performance.clearMarks();
    performance.clearMeasures();
    this.performanceData.marks.clear();
    this.performanceData.measures.clear();

    // 메모리 통계 초기화
    this.performanceData.memoryStats = [];

    this.updateTimingResults();
    this.updateMemoryChart();
    this.showInPageNotification("모든 지표가 초기화되었습니다", "info");
  }

  simulateLoad() {
    this.showInPageNotification("부하 시뮬레이션 시작...", "info");

    performance.mark("load-simulation-start");

    // CPU 부하
    const start = performance.now();
    let result = 0;
    while (performance.now() - start < 500) {
      result += Math.random();
    }

    // 메모리 부하
    const largeArray = new Array(100000).fill(0).map(() => Math.random());

    performance.mark("load-simulation-end");
    performance.measure(
      "load-simulation",
      "load-simulation-start",
      "load-simulation-end"
    );

    setTimeout(() => {
      this.updateTimingResults();
      this.showInPageNotification("부하 시뮬레이션 완료", "success");
    }, 100);
  }

  // 기본 구현들 (추후 확장 가능)
  exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      navigation: this.performanceData.navigation,
      resources: this.performanceData.resources.slice(0, 10), // 처음 10개만
      marks: Array.from(this.performanceData.marks.values()),
      measures: Array.from(this.performanceData.measures.values()),
      memory: this.getMemoryInfo(),
      customMetrics: Array.from(this.performanceData.customMetrics.values()),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showInPageNotification("성능 리포트가 다운로드되었습니다", "success");
  }

  filterResources() {
    this.showInPageNotification("리소스 필터링 기능은 개발 중입니다", "info");
  }

  refreshResources() {
    this.loadResourceTiming();
    this.showInPageNotification("리소스 목록이 새로고침되었습니다", "info");
  }

  loadTestResource() {
    const testUrl = "data:text/plain;base64,VGVzdCByZXNvdXJjZSBkYXRh";

    performance.mark("test-resource-start");

    fetch(testUrl)
      .then(() => {
        performance.mark("test-resource-end");
        performance.measure(
          "test-resource-load",
          "test-resource-start",
          "test-resource-end"
        );

        setTimeout(() => {
          this.loadResourceTiming();
          this.updateTimingResults();
          this.showInPageNotification(
            "테스트 리소스가 로드되었습니다",
            "success"
          );
        }, 100);
      })
      .catch(() => {
        this.showInPageNotification("테스트 리소스 로드 실패", "error");
      });
  }

  toggleObserver(button) {
    const type = button.dataset.type;
    const isActive = button.textContent === "정지";

    if (isActive) {
      // 옵저버 정지
      if (this.performanceData.observers.has(type)) {
        this.performanceData.observers.get(type).disconnect();
        this.performanceData.observers.delete(type);
      }
      button.textContent = "시작";
      button.classList.remove("btn-danger");
      button.classList.add("btn-primary");
    } else {
      // 옵저버 시작
      this.startObserver(type);
      button.textContent = "정지";
      button.classList.remove("btn-primary");
      button.classList.add("btn-danger");
    }
  }

  startObserver(type) {
    if (!this.apiSupport.performanceObserver) {
      this.showInPageNotification(
        "PerformanceObserver가 지원되지 않습니다",
        "error"
      );
      return;
    }

    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.logObserverEntry(type, entry);
        }
      });

      observer.observe({ type: type, buffered: true });
      this.performanceData.observers.set(type, observer);

      this.showInPageNotification(`${type} 옵저버가 시작되었습니다`, "success");
    } catch (error) {
      this.showInPageNotification(
        `옵저버 시작 실패: ${error.message}`,
        "error"
      );
    }
  }

  logObserverEntry(type, entry) {
    const logContainer = document.getElementById("observerLogs");
    if (!logContainer) return;

    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.innerHTML = `
      <span class="log-time">${new Date().toLocaleTimeString()}</span>
      <span class="log-type">${type}</span>
      <span class="log-name">${entry.name || entry.entryType}</span>
      <span class="log-details">${this.formatEntryDetails(entry)}</span>
    `;

    // 플레이스홀더 제거
    const placeholder = logContainer.querySelector(".logs-placeholder");
    if (placeholder) placeholder.remove();

    logContainer.appendChild(logEntry);

    // 자동 스크롤
    if (document.getElementById("autoScroll")?.checked) {
      logEntry.scrollIntoView({ behavior: "smooth" });
    }

    // 로그 수 제한 (최근 100개)
    const logs = logContainer.querySelectorAll(".log-entry");
    if (logs.length > 100) {
      logs[0].remove();
    }
  }

  formatEntryDetails(entry) {
    const details = [];

    if (entry.duration !== undefined) {
      details.push(`duration: ${entry.duration.toFixed(2)}ms`);
    }
    if (entry.startTime !== undefined) {
      details.push(`start: ${entry.startTime.toFixed(2)}ms`);
    }
    if (entry.value !== undefined) {
      details.push(`value: ${entry.value.toFixed(4)}`);
    }
    if (entry.size !== undefined) {
      details.push(`size: ${entry.size}`);
    }

    return details.join(", ") || "N/A";
  }

  clearLogs() {
    const logContainer = document.getElementById("observerLogs");
    if (logContainer) {
      logContainer.innerHTML =
        '<div class="logs-placeholder">옵저버를 시작하면 로그가 여기에 표시됩니다</div>';
    }
    this.showInPageNotification("로그가 초기화되었습니다", "info");
  }

  exportLogs() {
    const logs = Array.from(document.querySelectorAll(".log-entry")).map(
      (entry) => ({
        time: entry.querySelector(".log-time").textContent,
        type: entry.querySelector(".log-type").textContent,
        name: entry.querySelector(".log-name").textContent,
        details: entry.querySelector(".log-details").textContent,
      })
    );

    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `observer-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showInPageNotification("옵저버 로그가 다운로드되었습니다", "success");
  }

  // 성능 테스트 메소드들
  updateTestValue(testType, value, unit) {
    document.getElementById(
      `${testType}SizeValue`
    ).textContent = `${value}${unit}`;
  }

  async runMemoryTest() {
    const size = parseInt(document.getElementById("memoryTestSize").value);
    this.showInPageNotification(`${size}MB 메모리 테스트 시작...`, "info");

    performance.mark("memory-test-start");

    try {
      // 대용량 배열 생성
      const arraySize = (size * 1024 * 1024) / 8; // 8바이트당 하나의 숫자
      const largeArray = new Array(arraySize).fill(0).map(() => Math.random());

      // 메모리 사용량 측정
      const memoryBefore = this.getMemoryInfo();

      // 배열 조작
      largeArray.sort((a, b) => a - b);

      const memoryAfter = this.getMemoryInfo();

      performance.mark("memory-test-end");
      performance.measure(
        "memory-test-duration",
        "memory-test-start",
        "memory-test-end"
      );

      const result = {
        테스트_크기: `${size}MB`,
        실행_시간: `${performance
          .getEntriesByName("memory-test-duration")[0]
          .duration.toFixed(2)}ms`,
        메모리_증가:
          memoryAfter && memoryBefore
            ? this.formatBytes(
                memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize
              )
            : "N/A",
        배열_크기: `${arraySize.toLocaleString()}개 요소`,
      };

      this.addTestResult("메모리 부하 테스트", result);
      this.showInPageNotification("메모리 테스트 완료!", "success");
    } catch (error) {
      this.showInPageNotification(
        `메모리 테스트 실패: ${error.message}`,
        "error"
      );
    }
  }

  async runCpuTest() {
    const duration = parseInt(document.getElementById("cpuTestDuration").value);
    this.showInPageNotification(`${duration}ms CPU 테스트 시작...`, "info");

    performance.mark("cpu-test-start");

    try {
      const startTime = performance.now();
      let operations = 0;

      // CPU 집약적 계산
      while (performance.now() - startTime < duration) {
        Math.sqrt(Math.random() * 1000000);
        operations++;
      }

      performance.mark("cpu-test-end");
      performance.measure(
        "cpu-test-duration",
        "cpu-test-start",
        "cpu-test-end"
      );

      const actualDuration = performance.now() - startTime;

      const result = {
        목표_시간: `${duration}ms`,
        실제_시간: `${actualDuration.toFixed(2)}ms`,
        연산_횟수: `${operations.toLocaleString()}회`,
        초당_연산: `${Math.round(
          operations / (actualDuration / 1000)
        ).toLocaleString()}ops/s`,
      };

      this.addTestResult("CPU 부하 테스트", result);
      this.showInPageNotification("CPU 테스트 완료!", "success");
    } catch (error) {
      this.showInPageNotification(`CPU 테스트 실패: ${error.message}`, "error");
    }
  }

  async runNetworkTest() {
    const count = parseInt(document.getElementById("networkTestCount").value);
    this.showInPageNotification(
      `${count}개 요청 네트워크 테스트 시작...`,
      "info"
    );

    performance.mark("network-test-start");

    try {
      const promises = [];
      const startTime = performance.now();

      // 여러 요청 동시 실행
      for (let i = 0; i < count; i++) {
        const promise = fetch(
          `data:application/json;base64,eyJ0ZXN0IjoiZGF0YSIsImluZGV4Ijoke2l9fQ==`
        );
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = performance.now();

      performance.mark("network-test-end");
      performance.measure(
        "network-test-duration",
        "network-test-start",
        "network-test-end"
      );

      const result = {
        요청_수: `${count}개`,
        총_시간: `${(endTime - startTime).toFixed(2)}ms`,
        평균_시간: `${((endTime - startTime) / count).toFixed(2)}ms`,
        성공_요청: `${results.filter((r) => r.ok).length}개`,
        초당_요청: `${(count / ((endTime - startTime) / 1000)).toFixed(
          2
        )}req/s`,
      };

      this.addTestResult("네트워크 부하 테스트", result);
      this.showInPageNotification("네트워크 테스트 완료!", "success");
    } catch (error) {
      this.showInPageNotification(
        `네트워크 테스트 실패: ${error.message}`,
        "error"
      );
    }
  }

  async runRenderTest() {
    const elementCount = parseInt(
      document.getElementById("renderTestElements").value
    );
    this.showInPageNotification(
      `${elementCount}개 요소 렌더링 테스트 시작...`,
      "info"
    );

    performance.mark("render-test-start");

    try {
      // 테스트용 컨테이너 생성
      const container = document.createElement("div");
      container.style.cssText =
        "position: absolute; top: -9999px; left: -9999px;";
      document.body.appendChild(container);

      const startTime = performance.now();

      // 대량의 DOM 요소 생성
      for (let i = 0; i < elementCount; i++) {
        const element = document.createElement("div");
        element.textContent = `Element ${i}`;
        element.style.cssText = `
          width: 100px;
          height: 20px;
          background: hsl(${i % 360}, 50%, 50%);
          margin: 1px;
          display: inline-block;
        `;
        container.appendChild(element);
      }

      // 강제 리플로우
      container.offsetHeight;

      const endTime = performance.now();

      performance.mark("render-test-end");
      performance.measure(
        "render-test-duration",
        "render-test-start",
        "render-test-end"
      );

      // 정리
      document.body.removeChild(container);

      const result = {
        요소_수: `${elementCount.toLocaleString()}개`,
        렌더링_시간: `${(endTime - startTime).toFixed(2)}ms`,
        초당_요소: `${Math.round(
          elementCount / ((endTime - startTime) / 1000)
        ).toLocaleString()}elements/s`,
        평균_요소_시간: `${((endTime - startTime) / elementCount).toFixed(
          4
        )}ms/element`,
      };

      this.addTestResult("렌더링 부하 테스트", result);
      this.showInPageNotification("렌더링 테스트 완료!", "success");
    } catch (error) {
      this.showInPageNotification(
        `렌더링 테스트 실패: ${error.message}`,
        "error"
      );
    }
  }

  addTestResult(testName, result) {
    const container = document.getElementById("testResults");
    if (!container) return;

    // 플레이스홀더 제거
    const placeholder = container.querySelector(".results-placeholder");
    if (placeholder) placeholder.remove();

    const resultElement = document.createElement("div");
    resultElement.className = "test-result";
    resultElement.innerHTML = `
      <h4>${testName}</h4>
      <div class="result-details">
        ${Object.entries(result)
          .map(
            ([key, value]) => `
          <div class="result-item">
            <span class="result-label">${key}:</span>
            <span class="result-value">${value}</span>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="result-time">${new Date().toLocaleTimeString()}</div>
    `;

    container.insertBefore(resultElement, container.firstChild);

    // 결과 수 제한 (최근 10개)
    const results = container.querySelectorAll(".test-result");
    if (results.length > 10) {
      results[results.length - 1].remove();
    }
  }

  // 커스텀 메트릭 메소드들
  createCustomMetric() {
    this.showInPageNotification(
      "커스텀 메트릭 생성 기능은 개발 중입니다",
      "info"
    );
  }

  startMetricRecording() {
    this.showInPageNotification(
      "메트릭 기록 시작 기능은 개발 중입니다",
      "info"
    );
  }

  stopMetricRecording() {
    this.showInPageNotification(
      "메트릭 기록 정지 기능은 개발 중입니다",
      "info"
    );
  }

  exportTimeline() {
    this.showInPageNotification(
      "타임라인 내보내기 기능은 개발 중입니다",
      "info"
    );
  }

  clearTimeline() {
    this.clearMetrics();
    this.showInPageNotification("타임라인이 초기화되었습니다", "info");
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
window.performanceAPI = null;

// 초기화
function initPerformanceAPI() {
  console.log("🚀 Performance API Manager 초기화 함수 호출");
  window.performanceAPI = new PerformanceAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initPerformanceAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initPerformanceAPI();
}

console.log(
  "📄 Performance API 스크립트 로드 완료, readyState:",
  document.readyState
);
