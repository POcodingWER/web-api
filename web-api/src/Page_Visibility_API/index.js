import "./style.css";

// Page Visibility API 테스트 및 데모
class PageVisibilityDemo {
  constructor() {
    this.visibilityState = document.visibilityState;
    this.isVisible = !document.hidden;
    this.sessionStartTime = Date.now();
    this.totalActiveTime = 0;
    this.totalInactiveTime = 0;
    this.lastVisibilityChange = Date.now();
    this.visibilityHistory = [];
    this.performanceMetrics = {
      tabSwitches: 0,
      hiddenEvents: 0,
      visibleEvents: 0,
      averageHiddenDuration: 0,
      averageVisibleDuration: 0,
      longestHiddenSession: 0,
      longestVisibleSession: 0,
    };
    this.resourceUsageTracker = {
      cpuIntensiveTask: null,
      networkRequests: [],
      intervalTasks: [],
    };
    this.notifications = [];
    this.gameState = {
      score: 0,
      lives: 3,
      isPlaying: false,
      isPaused: false,
      gameTimer: null,
      enemy: { x: 50, y: 50, direction: 1 },
    };

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
    this.startTracking();
    this.initializeDemo();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    const pageVisibilitySupport =
      typeof document.hidden !== "undefined" ||
      typeof document.visibilityState !== "undefined";

    let statusHTML = "";

    if (pageVisibilitySupport) {
      statusHTML = `<span class="status-success">✅ Page Visibility API 완전 지원됨</span>`;
    } else {
      statusHTML = `<span class="status-error">❌ Page Visibility API가 지원되지 않습니다</span>`;
      this.disableFeatures();
    }

    statusElement.innerHTML = statusHTML;
    return pageVisibilitySupport;
  }

  disableFeatures() {
    document.querySelectorAll(".visibility-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="page-visibility-demo">
        <h1>👁️ Page Visibility API 테스트</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <!-- 현재 상태 섹션 -->
        <div class="visibility-section current-state-section">
          <h2>📊 현재 페이지 상태</h2>
          
          <div class="state-display">
            <div class="state-card">
              <div class="state-icon" id="visibilityIcon">👁️</div>
              <div class="state-info">
                <h3>페이지 가시성</h3>
                <div class="state-value" id="visibilityState">visible</div>
                <div class="state-description" id="visibilityDescription">페이지가 현재 보이는 상태입니다</div>
              </div>
            </div>
            
            <div class="state-card">
              <div class="state-icon">⏱️</div>
              <div class="state-info">
                <h3>현재 세션 시간</h3>
                <div class="state-value" id="currentSessionTime">00:00:00</div>
                <div class="state-description">페이지가 열린 후 경과 시간</div>
              </div>
            </div>
            
            <div class="state-card">
              <div class="state-icon">⚡</div>
              <div class="state-info">
                <h3>활성 시간</h3>
                <div class="state-value" id="activeTime">00:00:00</div>
                <div class="state-description">페이지가 보인 총 시간</div>
              </div>
            </div>
            
            <div class="state-card">
              <div class="state-icon">😴</div>
              <div class="state-info">
                <h3>비활성 시간</h3>
                <div class="state-value" id="inactiveTime">00:00:00</div>
                <div class="state-description">페이지가 숨겨진 총 시간</div>
              </div>
            </div>
          </div>

          <div class="realtime-indicator">
            <div class="indicator-light" id="indicatorLight"></div>
            <span id="indicatorText">페이지 활성 상태</span>
            <div class="pulse-animation" id="pulseAnimation"></div>
          </div>
        </div>

        <!-- 이벤트 로그 섹션 -->
        <div class="visibility-section event-log-section">
          <h2>📝 가시성 이벤트 로그</h2>
          
          <div class="log-controls">
            <button id="clearLog" class="visibility-btn clear-btn">
              🗑️ 로그 지우기
            </button>
            <button id="exportLog" class="visibility-btn export-btn">
              📤 로그 내보내기
            </button>
            <div class="log-filter">
              <label>
                <input type="checkbox" id="filterVisible" checked> 👁️ 표시 이벤트
              </label>
              <label>
                <input type="checkbox" id="filterHidden" checked> 🙈 숨김 이벤트
              </label>
            </div>
          </div>
          
          <div class="event-log" id="eventLog">
            <div class="log-placeholder">
              <p>아직 가시성 변경 이벤트가 없습니다.</p>
              <p>탭을 전환하거나 창을 최소화해보세요!</p>
            </div>
          </div>
        </div>

        <!-- 성능 메트릭 섹션 -->
        <div class="visibility-section metrics-section">
          <h2>📈 성능 및 사용 통계</h2>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <h4>🔄 탭 전환 횟수</h4>
              <div class="metric-value" id="tabSwitches">0</div>
            </div>
            <div class="metric-card">
              <h4>📱 평균 숨김 시간</h4>
              <div class="metric-value" id="avgHiddenTime">0초</div>
            </div>
            <div class="metric-card">
              <h4>💻 평균 활성 시간</h4>
              <div class="metric-value" id="avgVisibleTime">0초</div>
            </div>
            <div class="metric-card">
              <h4>⏳ 최장 숨김 세션</h4>
              <div class="metric-value" id="longestHidden">0초</div>
            </div>
            <div class="metric-card">
              <h4>🎯 활성도 비율</h4>
              <div class="metric-value" id="activityRatio">100%</div>
            </div>
            <div class="metric-card">
              <h4>📊 전체 이벤트</h4>
              <div class="metric-value" id="totalEvents">0</div>
            </div>
          </div>

          <div class="activity-chart">
            <h4>📊 활동 시간 차트</h4>
            <div class="chart-container">
              <div class="chart-bar">
                <div class="bar-section active-bar" id="activeBar" style="width: 100%;">
                  <span>활성</span>
                </div>
                <div class="bar-section inactive-bar" id="inactiveBar" style="width: 0%;">
                  <span>비활성</span>
                </div>
              </div>
              <div class="chart-labels">
                <div class="label active-label">
                  <div class="color-indicator active-color"></div>
                  활성 시간: <span id="activePercent">100%</span>
                </div>
                <div class="label inactive-label">
                  <div class="color-indicator inactive-color"></div>
                  비활성 시간: <span id="inactivePercent">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 리소스 관리 데모 섹션 -->
        <div class="visibility-section resource-demo-section">
          <h2>⚡ 리소스 관리 데모</h2>
          
          <div class="demo-controls">
            <div class="demo-group">
              <h4>🖥️ CPU 집약적 작업</h4>
              <p>페이지가 숨겨질 때 자동으로 일시정지되는 애니메이션</p>
              <button id="startCpuTask" class="visibility-btn start-btn">
                ▶️ 애니메이션 시작
              </button>
              <button id="stopCpuTask" class="visibility-btn stop-btn">
                ⏹️ 애니메이션 중지
              </button>
              <div class="cpu-demo" id="cpuDemo">
                <div class="rotating-element" id="rotatingElement">🌀</div>
                <div class="cpu-status" id="cpuStatus">대기 중...</div>
              </div>
            </div>
            
            <div class="demo-group">
              <h4>🌐 네트워크 요청 관리</h4>
              <p>페이지가 보일 때만 주기적 요청 수행</p>
              <button id="startNetworkTask" class="visibility-btn start-btn">
                ▶️ 주기적 요청 시작
              </button>
              <button id="stopNetworkTask" class="visibility-btn stop-btn">
                ⏹️ 요청 중지
              </button>
              <div class="network-demo">
                <div class="network-status" id="networkStatus">대기 중...</div>
                <div class="request-log" id="requestLog"></div>
              </div>
            </div>
            
            <div class="demo-group">
              <h4>⏰ 타이머 관리</h4>
              <p>페이지 가시성에 따른 타이머 제어</p>
              <button id="startTimer" class="visibility-btn start-btn">
                ▶️ 타이머 시작
              </button>
              <button id="stopTimer" class="visibility-btn stop-btn">
                ⏹️ 타이머 중지
              </button>
              <div class="timer-demo">
                <div class="timer-display" id="timerDisplay">00:00</div>
                <div class="timer-status" id="timerStatus">대기 중...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 알림 관리 섹션 -->
        <div class="visibility-section notification-section">
          <h2>🔔 알림 관리</h2>
          
          <div class="notification-controls">
            <div class="control-group">
              <label>
                <input type="checkbox" id="enableNotifications" checked>
                페이지가 숨겨질 때 알림 표시
              </label>
            </div>
            <div class="control-group">
              <label>
                <input type="number" id="notificationDelay" value="5" min="1" max="60" step="1">
                초 후 알림 (숨겨진 상태일 때)
              </label>
            </div>
            <button id="testNotification" class="visibility-btn test-btn">
              🔔 알림 테스트
            </button>
            <button id="requestNotificationPermission" class="visibility-btn permission-btn">
              🔐 알림 권한 요청
            </button>
          </div>
          
          <div class="notification-status" id="notificationStatus">
            <div class="permission-status" id="permissionStatus">알림 권한 확인 중...</div>
            <div class="notification-list" id="notificationList"></div>
          </div>
        </div>

        <!-- 미니 게임 섹션 -->
        <div class="visibility-section game-section">
          <h2>🎮 Visibility 미니게임</h2>
          
          <div class="game-description">
            <p>페이지가 숨겨지면 게임이 자동으로 일시정지됩니다!</p>
            <p>적을 피하면서 점수를 올려보세요. 페이지를 벗어나면 게임이 멈춰요.</p>
          </div>
          
          <div class="game-controls">
            <button id="startGame" class="visibility-btn game-btn">
              🎮 게임 시작
            </button>
            <button id="pauseGame" class="visibility-btn game-btn">
              ⏸️ 일시정지
            </button>
            <button id="resetGame" class="visibility-btn game-btn">
              🔄 리셋
            </button>
          </div>
          
          <div class="game-stats">
            <div class="stat">점수: <span id="gameScore">0</span></div>
            <div class="stat">생명: <span id="gameLives">3</span></div>
            <div class="stat">상태: <span id="gameStatus">대기 중</span></div>
          </div>
          
          <div class="game-area" id="gameArea">
            <div class="player" id="player">🚀</div>
            <div class="enemy" id="enemy">👾</div>
            <div class="game-overlay" id="gameOverlay">
              <div class="overlay-content">
                <h3>게임 일시정지</h3>
                <p>페이지가 숨겨져 있어요!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 테스트 도구 섹션 -->
        <div class="visibility-section test-tools-section">
          <h2>🧪 테스트 도구</h2>
          
          <div class="test-instructions">
            <h4>📋 테스트 방법</h4>
            <ul>
              <li><strong>탭 전환:</strong> 다른 탭으로 이동했다가 돌아오기</li>
              <li><strong>창 최소화:</strong> 브라우저 창 최소화 후 복원</li>
              <li><strong>앱 전환:</strong> Alt+Tab (Windows) 또는 Cmd+Tab (Mac)</li>
              <li><strong>모바일:</strong> 홈 버튼 누르기 또는 앱 전환</li>
              <li><strong>개발자 도구:</strong> F12로 개발자 도구 열기/닫기</li>
            </ul>
          </div>
          
          <div class="test-actions">
            <button id="simulateHidden" class="visibility-btn test-btn">
              🙈 숨김 상태 시뮬레이션
            </button>
            <button id="simulateVisible" class="visibility-btn test-btn">
              👁️ 표시 상태 시뮬레이션
            </button>
            <button id="resetMetrics" class="visibility-btn reset-btn">
              🔄 모든 통계 리셋
            </button>
          </div>
          
          <div class="api-info">
            <h4>🔧 API 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <strong>document.hidden:</strong> <span id="documentHidden">false</span>
              </div>
              <div class="info-item">
                <strong>document.visibilityState:</strong> <span id="documentVisibilityState">visible</span>
              </div>
              <div class="info-item">
                <strong>지원 이벤트:</strong> <span>visibilitychange</span>
              </div>
              <div class="info-item">
                <strong>브라우저:</strong> <span id="browserInfo">-</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Page Visibility API 정보</h3>
          <div class="info-grid">
            <div class="info-card">
              <h4>👁️ Page Visibility</h4>
              <ul>
                <li>페이지 가시성 상태 감지</li>
                <li>탭 전환/창 최소화 감지</li>
                <li>백그라운드 실행 제어</li>
                <li>사용자 참여도 측정</li>
                <li>배터리 절약 최적화</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🔧 주요 속성</h4>
              <ul>
                <li><strong>document.hidden:</strong> 숨김 여부</li>
                <li><strong>visibilityState:</strong> 상태 정보</li>
                <li><strong>visible:</strong> 완전히 보임</li>
                <li><strong>hidden:</strong> 완전히 숨겨짐</li>
                <li><strong>prerender:</strong> 미리 렌더링</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>⚡ 최적화 활용</h4>
              <ul>
                <li><strong>애니메이션:</strong> 일시정지/재개</li>
                <li><strong>네트워크:</strong> 요청 빈도 조절</li>
                <li><strong>타이머:</strong> 백그라운드 제한</li>
                <li><strong>알림:</strong> 적절한 시점 알림</li>
                <li><strong>게임:</strong> 자동 일시정지</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>💼 실무 활용</h4>
              <ul>
                <li>사용자 분석 및 통계</li>
                <li>성능 최적화</li>
                <li>배터리 수명 연장</li>
                <li>네트워크 효율성</li>
                <li>사용자 경험 개선</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Page Visibility API 이벤트
    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });

    // 로그 관리
    document
      .getElementById("clearLog")
      .addEventListener("click", () => this.clearEventLog());
    document
      .getElementById("exportLog")
      .addEventListener("click", () => this.exportEventLog());

    // 필터
    document
      .getElementById("filterVisible")
      .addEventListener("change", () => this.updateLogDisplay());
    document
      .getElementById("filterHidden")
      .addEventListener("change", () => this.updateLogDisplay());

    // 리소스 관리 데모
    document
      .getElementById("startCpuTask")
      .addEventListener("click", () => this.startCpuIntensiveTask());
    document
      .getElementById("stopCpuTask")
      .addEventListener("click", () => this.stopCpuIntensiveTask());
    document
      .getElementById("startNetworkTask")
      .addEventListener("click", () => this.startNetworkTask());
    document
      .getElementById("stopNetworkTask")
      .addEventListener("click", () => this.stopNetworkTask());
    document
      .getElementById("startTimer")
      .addEventListener("click", () => this.startTimer());
    document
      .getElementById("stopTimer")
      .addEventListener("click", () => this.stopTimer());

    // 알림 관리
    document
      .getElementById("testNotification")
      .addEventListener("click", () => this.testNotification());
    document
      .getElementById("requestNotificationPermission")
      .addEventListener("click", () => this.requestNotificationPermission());

    // 게임 컨트롤
    document
      .getElementById("startGame")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("pauseGame")
      .addEventListener("click", () => this.pauseGame());
    document
      .getElementById("resetGame")
      .addEventListener("click", () => this.resetGame());

    // 게임 조작
    document.addEventListener("keydown", (e) => this.handleGameInput(e));

    // 테스트 도구
    document
      .getElementById("simulateHidden")
      .addEventListener("click", () => this.simulateVisibilityChange("hidden"));
    document
      .getElementById("simulateVisible")
      .addEventListener("click", () =>
        this.simulateVisibilityChange("visible")
      );
    document
      .getElementById("resetMetrics")
      .addEventListener("click", () => this.resetAllMetrics());
  }

  initializeDemo() {
    this.updateCurrentState();
    this.updateMetricsDisplay();
    this.updateAPIInfo();
    this.updateNotificationStatus();
    this.startPeriodicUpdates();
  }

  startTracking() {
    // 1초마다 업데이트
    setInterval(() => {
      this.updateSessionTime();
      this.updateCurrentState();
    }, 1000);
  }

  handleVisibilityChange() {
    const now = Date.now();
    const previousState = this.visibilityState;
    const currentState = document.visibilityState;
    const isCurrentlyVisible = !document.hidden;

    // 시간 추적 업데이트
    const duration = now - this.lastVisibilityChange;
    if (this.isVisible) {
      this.totalActiveTime += duration;
    } else {
      this.totalInactiveTime += duration;
    }

    // 상태 업데이트
    this.visibilityState = currentState;
    this.isVisible = isCurrentlyVisible;
    this.lastVisibilityChange = now;

    // 통계 업데이트
    if (currentState === "hidden") {
      this.performanceMetrics.hiddenEvents++;
      this.performanceMetrics.tabSwitches++;
    } else if (currentState === "visible") {
      this.performanceMetrics.visibleEvents++;
    }

    // 히스토리 추가
    this.addToVisibilityHistory({
      timestamp: now,
      previousState: previousState,
      currentState: currentState,
      isVisible: isCurrentlyVisible,
      duration: duration,
      sessionTime: now - this.sessionStartTime,
    });

    // UI 업데이트
    this.updateCurrentState();
    this.updateMetricsDisplay();
    this.updateEventLog();

    // 리소스 관리
    this.handleResourceManagement();

    // 알림 처리
    this.handleNotifications();

    // 게임 처리
    this.handleGameVisibility();

    // 로그 출력
    console.log(`페이지 가시성 변경: ${previousState} → ${currentState}`);
  }

  addToVisibilityHistory(entry) {
    this.visibilityHistory.unshift(entry);

    // 최대 100개까지만 보관
    if (this.visibilityHistory.length > 100) {
      this.visibilityHistory = this.visibilityHistory.slice(0, 100);
    }

    // 성능 메트릭 계산
    this.calculatePerformanceMetrics();
  }

  calculatePerformanceMetrics() {
    const visibleSessions = this.visibilityHistory.filter(
      (h) => h.currentState === "visible"
    );
    const hiddenSessions = this.visibilityHistory.filter(
      (h) => h.currentState === "hidden"
    );

    if (visibleSessions.length > 0) {
      const avgVisible =
        visibleSessions.reduce((sum, s) => sum + s.duration, 0) /
        visibleSessions.length;
      this.performanceMetrics.averageVisibleDuration = avgVisible;
      this.performanceMetrics.longestVisibleSession = Math.max(
        ...visibleSessions.map((s) => s.duration)
      );
    }

    if (hiddenSessions.length > 0) {
      const avgHidden =
        hiddenSessions.reduce((sum, s) => sum + s.duration, 0) /
        hiddenSessions.length;
      this.performanceMetrics.averageHiddenDuration = avgHidden;
      this.performanceMetrics.longestHiddenSession = Math.max(
        ...hiddenSessions.map((s) => s.duration)
      );
    }
  }

  updateCurrentState() {
    // 가시성 상태
    const visibilityIcon = document.getElementById("visibilityIcon");
    const visibilityState = document.getElementById("visibilityState");
    const visibilityDescription = document.getElementById(
      "visibilityDescription"
    );
    const indicatorLight = document.getElementById("indicatorLight");
    const indicatorText = document.getElementById("indicatorText");

    if (this.isVisible) {
      visibilityIcon.textContent = "👁️";
      visibilityState.textContent = "Visible";
      visibilityState.className = "state-value visible";
      visibilityDescription.textContent = "페이지가 현재 보이는 상태입니다";
      indicatorLight.className = "indicator-light active";
      indicatorText.textContent = "페이지 활성 상태";
    } else {
      visibilityIcon.textContent = "🙈";
      visibilityState.textContent = "Hidden";
      visibilityState.className = "state-value hidden";
      visibilityDescription.textContent = "페이지가 현재 숨겨진 상태입니다";
      indicatorLight.className = "indicator-light inactive";
      indicatorText.textContent = "페이지 비활성 상태";
    }

    // 시간 업데이트
    this.updateTimeDisplays();
  }

  updateSessionTime() {
    const sessionTime = Date.now() - this.sessionStartTime;
    document.getElementById("currentSessionTime").textContent =
      this.formatDuration(sessionTime);
  }

  updateTimeDisplays() {
    const now = Date.now();
    const currentSessionDuration = now - this.lastVisibilityChange;

    // 현재 세션에 따른 활성/비활성 시간 업데이트
    let displayActiveTime = this.totalActiveTime;
    let displayInactiveTime = this.totalInactiveTime;

    if (this.isVisible) {
      displayActiveTime += currentSessionDuration;
    } else {
      displayInactiveTime += currentSessionDuration;
    }

    document.getElementById("activeTime").textContent =
      this.formatDuration(displayActiveTime);
    document.getElementById("inactiveTime").textContent =
      this.formatDuration(displayInactiveTime);

    // 활동 차트 업데이트
    this.updateActivityChart(displayActiveTime, displayInactiveTime);
  }

  updateActivityChart(activeTime, inactiveTime) {
    const total = activeTime + inactiveTime;
    if (total === 0) return;

    const activePercent = (activeTime / total) * 100;
    const inactivePercent = (inactiveTime / total) * 100;

    document.getElementById("activeBar").style.width = `${activePercent}%`;
    document.getElementById("inactiveBar").style.width = `${inactivePercent}%`;
    document.getElementById(
      "activePercent"
    ).textContent = `${activePercent.toFixed(1)}%`;
    document.getElementById(
      "inactivePercent"
    ).textContent = `${inactivePercent.toFixed(1)}%`;
  }

  updateMetricsDisplay() {
    document.getElementById("tabSwitches").textContent =
      this.performanceMetrics.tabSwitches;
    document.getElementById("avgHiddenTime").textContent = this.formatDuration(
      this.performanceMetrics.averageHiddenDuration
    );
    document.getElementById("avgVisibleTime").textContent = this.formatDuration(
      this.performanceMetrics.averageVisibleDuration
    );
    document.getElementById("longestHidden").textContent = this.formatDuration(
      this.performanceMetrics.longestHiddenSession
    );
    document.getElementById("totalEvents").textContent =
      this.performanceMetrics.hiddenEvents +
      this.performanceMetrics.visibleEvents;

    // 활성도 비율
    const total = this.totalActiveTime + this.totalInactiveTime;
    const ratio = total > 0 ? (this.totalActiveTime / total) * 100 : 100;
    document.getElementById("activityRatio").textContent = `${ratio.toFixed(
      1
    )}%`;
  }

  updateEventLog() {
    if (this.visibilityHistory.length === 0) return;

    const latestEvent = this.visibilityHistory[0];
    this.addLogEntry(latestEvent);
  }

  updateLogDisplay() {
    const log = document.getElementById("eventLog");
    const showVisible = document.getElementById("filterVisible").checked;
    const showHidden = document.getElementById("filterHidden").checked;

    // 필터링된 이벤트만 표시
    const filteredEvents = this.visibilityHistory.filter((event) => {
      if (event.currentState === "visible" && !showVisible) return false;
      if (event.currentState === "hidden" && !showHidden) return false;
      return true;
    });

    if (filteredEvents.length === 0) {
      log.innerHTML = `
        <div class="log-placeholder">
          <p>필터 조건에 맞는 이벤트가 없습니다.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="log-entries">';
    filteredEvents.slice(0, 20).forEach((event) => {
      html += this.createLogEntryHTML(event);
    });
    html += "</div>";

    log.innerHTML = html;
  }

  addLogEntry(event) {
    const log = document.getElementById("eventLog");

    // 플레이스홀더 제거
    if (log.querySelector(".log-placeholder")) {
      log.innerHTML = '<div class="log-entries"></div>';
    }

    const entriesContainer = log.querySelector(".log-entries");
    const entryHTML = this.createLogEntryHTML(event);

    entriesContainer.insertAdjacentHTML("afterbegin", entryHTML);

    // 최대 20개까지만 표시
    const entries = entriesContainer.querySelectorAll(".log-entry");
    if (entries.length > 20) {
      entries[entries.length - 1].remove();
    }
  }

  createLogEntryHTML(event) {
    const timeString = new Date(event.timestamp).toLocaleTimeString();
    const stateIcon = event.currentState === "visible" ? "👁️" : "🙈";
    const stateClass = event.currentState === "visible" ? "visible" : "hidden";
    const durationText =
      event.duration > 0 ? this.formatDuration(event.duration) : "즉시";

    return `
      <div class="log-entry ${stateClass}">
        <div class="log-time">${timeString}</div>
        <div class="log-icon">${stateIcon}</div>
        <div class="log-content">
          <div class="log-state">
            ${event.previousState} → <strong>${event.currentState}</strong>
          </div>
          <div class="log-duration">지속 시간: ${durationText}</div>
        </div>
        <div class="log-session-time">
          세션: ${this.formatDuration(event.sessionTime)}
        </div>
      </div>
    `;
  }

  // 리소스 관리 기능들
  startCpuIntensiveTask() {
    const element = document.getElementById("rotatingElement");
    const status = document.getElementById("cpuStatus");

    if (this.resourceUsageTracker.cpuIntensiveTask) {
      this.stopCpuIntensiveTask();
    }

    let rotation = 0;
    this.resourceUsageTracker.cpuIntensiveTask = setInterval(() => {
      if (!document.hidden) {
        rotation += 5;
        element.style.transform = `rotate(${rotation}deg)`;
        status.textContent = "실행 중... (회전 애니메이션)";
      } else {
        status.textContent = "일시정지 (페이지 숨겨짐)";
      }
    }, 50);

    status.textContent = "실행 중... (회전 애니메이션)";
  }

  stopCpuIntensiveTask() {
    if (this.resourceUsageTracker.cpuIntensiveTask) {
      clearInterval(this.resourceUsageTracker.cpuIntensiveTask);
      this.resourceUsageTracker.cpuIntensiveTask = null;
      document.getElementById("cpuStatus").textContent = "중지됨";
    }
  }

  startNetworkTask() {
    const status = document.getElementById("networkStatus");
    const log = document.getElementById("requestLog");

    if (this.resourceUsageTracker.intervalTasks.length > 0) {
      this.stopNetworkTask();
    }

    const interval = setInterval(async () => {
      if (!document.hidden) {
        try {
          // 가상의 API 요청 (실제로는 JSONPlaceholder 사용)
          const response = await fetch(
            "https://jsonplaceholder.typicode.com/posts/1"
          );
          const data = await response.json();

          const timestamp = new Date().toLocaleTimeString();
          log.innerHTML =
            `
            <div class="request-item success">
              <strong>${timestamp}</strong> - 요청 성공 (Post ID: ${data.id})
            </div>
          ` + log.innerHTML;

          status.textContent = "활성 중 - 주기적 요청 수행";
        } catch (error) {
          const timestamp = new Date().toLocaleTimeString();
          log.innerHTML =
            `
            <div class="request-item error">
              <strong>${timestamp}</strong> - 요청 실패: ${error.message}
            </div>
          ` + log.innerHTML;
        }
      } else {
        status.textContent = "일시정지 - 페이지 숨겨짐";
      }

      // 로그 항목이 너무 많으면 제거
      const items = log.querySelectorAll(".request-item");
      if (items.length > 10) {
        items[items.length - 1].remove();
      }
    }, 3000);

    this.resourceUsageTracker.intervalTasks.push(interval);
    status.textContent = "시작됨 - 3초마다 요청";
  }

  stopNetworkTask() {
    this.resourceUsageTracker.intervalTasks.forEach((interval) => {
      clearInterval(interval);
    });
    this.resourceUsageTracker.intervalTasks = [];
    document.getElementById("networkStatus").textContent = "중지됨";
  }

  startTimer() {
    if (this.timerInterval) {
      this.stopTimer();
    }

    let seconds = 0;
    const display = document.getElementById("timerDisplay");
    const status = document.getElementById("timerStatus");

    this.timerInterval = setInterval(() => {
      if (!document.hidden) {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        display.textContent = `${minutes.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;
        status.textContent = "실행 중";
      } else {
        status.textContent = "일시정지 (페이지 숨겨짐)";
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      document.getElementById("timerStatus").textContent = "중지됨";
    }
  }

  handleResourceManagement() {
    // CPU 집약적 작업은 이미 각 interval에서 처리됨
    // 여기서는 추가적인 리소스 관리 로직을 구현할 수 있음
  }

  // 알림 관리 기능들
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      this.showNotification("이 브라우저는 알림을 지원하지 않습니다.", "error");
      return;
    }

    const permission = await Notification.requestPermission();
    this.updateNotificationStatus();

    if (permission === "granted") {
      this.showNotification("알림 권한이 허용되었습니다!", "success");
    } else {
      this.showNotification("알림 권한이 거부되었습니다.", "warning");
    }
  }

  updateNotificationStatus() {
    const status = document.getElementById("permissionStatus");

    if (!("Notification" in window)) {
      status.innerHTML = '<span class="status-error">❌ 알림 미지원</span>';
      return;
    }

    const permission = Notification.permission;
    let statusHTML = "";

    switch (permission) {
      case "granted":
        statusHTML = '<span class="status-success">✅ 알림 허용됨</span>';
        break;
      case "denied":
        statusHTML = '<span class="status-error">❌ 알림 거부됨</span>';
        break;
      case "default":
        statusHTML = '<span class="status-warning">⚠️ 알림 권한 필요</span>';
        break;
    }

    status.innerHTML = statusHTML;
  }

  testNotification() {
    if (Notification.permission !== "granted") {
      this.showNotification("먼저 알림 권한을 허용해주세요.", "warning");
      return;
    }

    const notification = new Notification("Page Visibility 테스트", {
      body: "알림이 정상적으로 작동합니다!",
      icon: "/vite.svg",
      tag: "test-notification",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 5000);
  }

  handleNotifications() {
    const enableNotifications = document.getElementById(
      "enableNotifications"
    ).checked;
    const delay =
      parseInt(document.getElementById("notificationDelay").value) * 1000;

    if (!enableNotifications || Notification.permission !== "granted") {
      return;
    }

    if (!this.isVisible) {
      // 페이지가 숨겨진 상태에서 일정 시간 후 알림
      setTimeout(() => {
        if (!this.isVisible) {
          // 여전히 숨겨진 상태인지 확인
          const notification = new Notification("페이지가 기다리고 있어요!", {
            body: "다시 돌아와서 테스트를 계속해보세요.",
            icon: "/vite.svg",
            tag: "return-notification",
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          setTimeout(() => notification.close(), 5000);
        }
      }, delay);
    }
  }

  // 게임 기능들
  startGame() {
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
    this.gameState.score = 0;
    this.gameState.lives = 3;

    this.updateGameDisplay();
    this.startGameLoop();
  }

  pauseGame() {
    this.gameState.isPaused = !this.gameState.isPaused;
    this.updateGameDisplay();
  }

  resetGame() {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
    this.gameState.score = 0;
    this.gameState.lives = 3;

    if (this.gameState.gameTimer) {
      clearInterval(this.gameState.gameTimer);
      this.gameState.gameTimer = null;
    }

    this.updateGameDisplay();
    this.resetGamePositions();
  }

  startGameLoop() {
    if (this.gameState.gameTimer) {
      clearInterval(this.gameState.gameTimer);
    }

    this.gameState.gameTimer = setInterval(() => {
      if (
        this.gameState.isPlaying &&
        !this.gameState.isPaused &&
        !document.hidden
      ) {
        this.updateGameLogic();
        this.gameState.score += 1;
        this.updateGameDisplay();
      }
    }, 100);
  }

  updateGameLogic() {
    // 적 이동
    this.gameState.enemy.x += this.gameState.enemy.direction * 2;

    if (this.gameState.enemy.x <= 0 || this.gameState.enemy.x >= 90) {
      this.gameState.enemy.direction *= -1;
      this.gameState.enemy.y += 10;
    }

    // 충돌 감지 (간단한 버전)
    const playerElement = document.getElementById("player");
    const enemyElement = document.getElementById("enemy");

    if (enemyElement && playerElement) {
      enemyElement.style.left = this.gameState.enemy.x + "%";
      enemyElement.style.top = this.gameState.enemy.y + "%";

      // 적이 아래까지 내려오면 게임 오버
      if (this.gameState.enemy.y > 80) {
        this.gameState.lives--;
        this.gameState.enemy.y = 10;

        if (this.gameState.lives <= 0) {
          this.resetGame();
        }
      }
    }
  }

  handleGameInput(e) {
    if (!this.gameState.isPlaying) return;

    const player = document.getElementById("player");
    if (!player) return;

    const currentLeft = parseFloat(player.style.left) || 45;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        if (currentLeft > 0) {
          player.style.left = Math.max(0, currentLeft - 5) + "%";
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (currentLeft < 90) {
          player.style.left = Math.min(90, currentLeft + 5) + "%";
        }
        break;
      case " ": // 스페이스바
        e.preventDefault();
        this.pauseGame();
        break;
    }
  }

  handleGameVisibility() {
    const overlay = document.getElementById("gameOverlay");

    if (!this.isVisible && this.gameState.isPlaying) {
      this.gameState.isPaused = true;
      if (overlay) overlay.style.display = "flex";
    } else if (this.isVisible && this.gameState.isPlaying) {
      this.gameState.isPaused = false;
      if (overlay) overlay.style.display = "none";
    }

    this.updateGameDisplay();
  }

  updateGameDisplay() {
    document.getElementById("gameScore").textContent = this.gameState.score;
    document.getElementById("gameLives").textContent = this.gameState.lives;

    let status = "대기 중";
    if (this.gameState.isPlaying) {
      if (this.gameState.isPaused || document.hidden) {
        status = "일시정지";
      } else {
        status = "게임 중";
      }
    }

    document.getElementById("gameStatus").textContent = status;
  }

  resetGamePositions() {
    const player = document.getElementById("player");
    const enemy = document.getElementById("enemy");
    const overlay = document.getElementById("gameOverlay");

    if (player) player.style.left = "45%";
    if (enemy) {
      enemy.style.left = "50%";
      enemy.style.top = "10%";
    }
    if (overlay) overlay.style.display = "none";

    this.gameState.enemy = { x: 50, y: 10, direction: 1 };
  }

  // 테스트 및 유틸리티 기능들
  simulateVisibilityChange(state) {
    // 실제 브라우저 이벤트는 시뮬레이션할 수 없지만,
    // 데모용으로 상태를 변경해서 보여줄 수 있음
    console.log(`시뮬레이션: ${state} 상태`);
    this.showNotification(
      `${state} 상태 시뮬레이션 (실제 변경은 탭 전환으로 테스트하세요)`,
      "info"
    );
  }

  resetAllMetrics() {
    this.totalActiveTime = 0;
    this.totalInactiveTime = 0;
    this.sessionStartTime = Date.now();
    this.lastVisibilityChange = Date.now();
    this.visibilityHistory = [];
    this.performanceMetrics = {
      tabSwitches: 0,
      hiddenEvents: 0,
      visibleEvents: 0,
      averageHiddenDuration: 0,
      averageVisibleDuration: 0,
      longestHiddenSession: 0,
      longestVisibleSession: 0,
    };

    this.updateCurrentState();
    this.updateMetricsDisplay();
    this.clearEventLog();
    this.showNotification("모든 통계가 초기화되었습니다.", "success");
  }

  clearEventLog() {
    const log = document.getElementById("eventLog");
    log.innerHTML = `
      <div class="log-placeholder">
        <p>아직 가시성 변경 이벤트가 없습니다.</p>
        <p>탭을 전환하거나 창을 최소화해보세요!</p>
      </div>
    `;
  }

  exportEventLog() {
    if (this.visibilityHistory.length === 0) {
      this.showNotification("내보낼 이벤트 로그가 없습니다.", "warning");
      return;
    }

    const exportData = {
      sessionInfo: {
        startTime: this.sessionStartTime,
        totalActiveTime: this.totalActiveTime,
        totalInactiveTime: this.totalInactiveTime,
        exportTime: Date.now(),
      },
      metrics: this.performanceMetrics,
      events: this.visibilityHistory,
    };

    this.downloadJSON(
      exportData,
      `page-visibility-log-${this.getTimestamp()}.json`
    );
    this.showNotification(
      "이벤트 로그가 JSON 파일로 내보내졌습니다!",
      "success"
    );
  }

  updateAPIInfo() {
    document.getElementById("documentHidden").textContent = document.hidden;
    document.getElementById("documentVisibilityState").textContent =
      document.visibilityState;
    document.getElementById("browserInfo").textContent = this.getBrowserInfo();
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  }

  startPeriodicUpdates() {
    // API 정보를 주기적으로 업데이트
    setInterval(() => {
      this.updateAPIInfo();
    }, 1000);
  }

  // 유틸리티 함수들
  formatDuration(milliseconds) {
    if (milliseconds < 1000) return "0초";

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${(minutes % 60)
        .toString()
        .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${(seconds % 60)
        .toString()
        .padStart(2, "0")}`;
    }
  }

  downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  }

  showNotification(message, type) {
    // 기존 알림 제거
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    // 새 알림 생성
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 애니메이션 후 제거
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new PageVisibilityDemo();
});
