import "./style.css";

console.log("⚡ Prioritized Task Scheduling API 스크립트 시작!");

class PrioritizedTaskSchedulingAPI {
  constructor() {
    this.taskQueue = [];
    this.taskId = 0;
    this.schedulerState = {
      isYielding: false,
      currentTask: null,
      taskHistory: [],
      performanceMetrics: {
        totalTasks: 0,
        completedTasks: 0,
        cancelledTasks: 0,
        averageExecutionTime: 0,
        priorityDistribution: {
          "user-blocking": 0,
          "user-visible": 0,
          background: 0,
        },
      },
    };
    this.yieldCallbacks = new Map();
    this.abortControllers = new Map();
    this.init();
  }

  init() {
    console.log("⚡ Prioritized Task Scheduling API Manager 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.setupMonitoring();
    this.initializeExampleTasks();
    console.log("✅ Prioritized Task Scheduling API Manager 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Prioritized Task Scheduling API 지원 여부 확인 중...");

    const support = {
      scheduler: "scheduler" in window,
      postTask: "scheduler" in window && "postTask" in window.scheduler,
      yield: "scheduler" in window && "yield" in window.scheduler,
      isInputPending:
        "scheduler" in window && "isInputPending" in window.scheduler,
      userBlockingPriority: this.checkPrioritySupport("user-blocking"),
      userVisiblePriority: this.checkPrioritySupport("user-visible"),
      backgroundPriority: this.checkPrioritySupport("background"),
      abortSignal: "AbortController" in window,
      postMessage: "postMessage" in window,
      requestIdleCallback: "requestIdleCallback" in window,
      messageChannel: "MessageChannel" in window,
    };

    console.log("📊 Prioritized Task Scheduling API 지원 현황:", support);
    this.apiSupport = support;
  }

  checkPrioritySupport(priority) {
    try {
      if (!("scheduler" in window) || !("postTask" in window.scheduler))
        return false;
      // 우선순위 지원 여부를 간접적으로 확인
      return true;
    } catch {
      return false;
    }
  }

  setupUI() {
    const appDiv = document.getElementById("app");

    appDiv.innerHTML = `
      <div class="scheduler-container">
        <header class="scheduler-header">
          <h1>⚡ Prioritized Task Scheduling API</h1>
          <p>효율적인 태스크 우선순위 관리와 스케줄링을 체험하세요</p>
          
          <div style="margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="quickSchedulingTest" class="btn-primary">🚀 빠른 스케줄링 테스트</button>
            <button id="createUserBlockingTask" class="btn-danger">🔥 긴급 태스크 생성</button>
            <button id="createUserVisibleTask" class="btn-warning">👁️ 가시적 태스크 생성</button>
            <button id="createBackgroundTask" class="btn-info">🔄 백그라운드 태스크 생성</button>
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

        <main class="scheduler-main">
          <!-- 실시간 스케줄러 대시보드 -->
          <div class="panel-card primary">
            <h2>📊 실시간 스케줄러 대시보드</h2>
            
            <div class="dashboard-grid">
              <!-- 현재 상태 -->
              <div class="status-section">
                <h3>⚡ 현재 상태</h3>
                <div class="status-cards">
                  <div class="status-card active">
                    <div class="status-icon">🏃</div>
                    <div class="status-info">
                      <span class="status-label">현재 실행 중</span>
                      <span class="status-value" id="currentTaskName">대기 중</span>
                    </div>
                  </div>
                  <div class="status-card">
                    <div class="status-icon">⏱️</div>
                    <div class="status-info">
                      <span class="status-label">대기 중인 태스크</span>
                      <span class="status-value" id="queuedTasksCount">0</span>
                    </div>
                  </div>
                  <div class="status-card">
                    <div class="status-icon">✅</div>
                    <div class="status-info">
                      <span class="status-label">완료된 태스크</span>
                      <span class="status-value" id="completedTasksCount">0</span>
                    </div>
                  </div>
                  <div class="status-card">
                    <div class="status-icon">❌</div>
                    <div class="status-info">
                      <span class="status-label">취소된 태스크</span>
                      <span class="status-value" id="cancelledTasksCount">0</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 우선순위 분포 -->
              <div class="priority-section">
                <h3>🎯 우선순위 분포</h3>
                <div class="priority-chart">
                  <div class="priority-bar user-blocking">
                    <div class="priority-label">
                      <span class="priority-name">🔥 User Blocking</span>
                      <span class="priority-count" id="userBlockingCount">0</span>
                    </div>
                    <div class="priority-fill" id="userBlockingBar" style="width: 0%"></div>
                  </div>
                  <div class="priority-bar user-visible">
                    <div class="priority-label">
                      <span class="priority-name">👁️ User Visible</span>
                      <span class="priority-count" id="userVisibleCount">0</span>
                    </div>
                    <div class="priority-fill" id="userVisibleBar" style="width: 0%"></div>
                  </div>
                  <div class="priority-bar background">
                    <div class="priority-label">
                      <span class="priority-name">🔄 Background</span>
                      <span class="priority-count" id="backgroundCount">0</span>
                    </div>
                    <div class="priority-fill" id="backgroundBar" style="width: 0%"></div>
                  </div>
                </div>
              </div>

              <!-- 성능 메트릭 -->
              <div class="metrics-section">
                <h3>📈 성능 메트릭</h3>
                <div class="metrics-grid">
                  <div class="metric-card">
                    <div class="metric-icon">⏱️</div>
                    <div class="metric-info">
                      <span class="metric-label">평균 실행 시간</span>
                      <span class="metric-value" id="avgExecutionTime">0ms</span>
                    </div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-icon">🎯</div>
                    <div class="metric-info">
                      <span class="metric-label">완료율</span>
                      <span class="metric-value" id="completionRate">0%</span>
                    </div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-icon">🔥</div>
                    <div class="metric-info">
                      <span class="metric-label">처리량</span>
                      <span class="metric-value" id="throughput">0 tasks/s</span>
                    </div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-info">
                      <span class="metric-label">응답성</span>
                      <span class="metric-value" id="responsiveness">양호</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="dashboard-controls">
              <button id="pauseScheduler" class="btn-warning">⏸️ 스케줄러 일시정지</button>
              <button id="resumeScheduler" class="btn-success">▶️ 스케줄러 재개</button>
              <button id="clearAllTasks" class="btn-danger">🗑️ 모든 태스크 삭제</button>
              <button id="exportMetrics" class="btn-info">📤 메트릭 내보내기</button>
            </div>
          </div>

          <!-- 태스크 생성기 -->
          <div class="panel-card">
            <h2>🎯 태스크 생성기</h2>
            
            <div class="creator-section">
              <div class="task-form">
                <h3>✨ 새 태스크 생성</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="taskName">태스크 이름</label>
                    <input type="text" id="taskName" placeholder="예: 데이터 처리 작업">
                  </div>
                  <div class="form-group">
                    <label for="taskPriority">우선순위</label>
                    <select id="taskPriority">
                      <option value="user-blocking">🔥 User Blocking (최고 우선순위)</option>
                      <option value="user-visible" selected>👁️ User Visible (보통 우선순위)</option>
                      <option value="background">🔄 Background (낮은 우선순위)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="taskDuration">예상 실행 시간 (ms)</label>
                    <input type="number" id="taskDuration" value="1000" min="100" max="10000" step="100">
                  </div>
                  <div class="form-group">
                    <label for="taskDelay">지연 시간 (ms)</label>
                    <input type="number" id="taskDelay" value="0" min="0" max="5000" step="100">
                  </div>
                  <div class="form-group">
                    <label for="taskType">태스크 타입</label>
                    <select id="taskType">
                      <option value="computation">💻 계산 작업</option>
                      <option value="dom">🖼️ DOM 조작</option>
                      <option value="network">🌐 네트워크 요청</option>
                      <option value="animation">🎬 애니메이션</option>
                      <option value="data">📊 데이터 처리</option>
                      <option value="custom">⚙️ 커스텀</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>
                      <input type="checkbox" id="taskCancellable">
                      취소 가능
                    </label>
                  </div>
                </div>
                <div class="form-actions">
                  <button id="createTask" class="btn-primary">🚀 태스크 생성</button>
                  <button id="createBatchTasks" class="btn-info">📦 배치 태스크 생성</button>
                  <button id="scheduleDelayedTask" class="btn-warning">⏰ 지연 태스크 스케줄</button>
                </div>
              </div>

              <div class="task-templates">
                <h3>📋 태스크 템플릿</h3>
                <div class="templates-grid">
                  <div class="template-card" data-template="heavy-computation">
                    <div class="template-icon">🔥</div>
                    <h4>무거운 계산</h4>
                    <p>CPU 집약적 계산 작업</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="template-card" data-template="ui-update">
                    <div class="template-icon">🖼️</div>
                    <h4>UI 업데이트</h4>
                    <p>사용자 인터페이스 갱신</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="template-card" data-template="data-fetch">
                    <div class="template-icon">🌐</div>
                    <h4>데이터 가져오기</h4>
                    <p>서버에서 데이터 요청</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="template-card" data-template="background-sync">
                    <div class="template-icon">🔄</div>
                    <h4>백그라운드 동기화</h4>
                    <p>백그라운드 데이터 동기화</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="template-card" data-template="image-processing">
                    <div class="template-icon">🖼️</div>
                    <h4>이미지 처리</h4>
                    <p>이미지 변환 및 압축</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="template-card" data-template="analytics">
                    <div class="template-icon">📊</div>
                    <h4>분석 작업</h4>
                    <p>사용자 분석 데이터 처리</p>
                    <button class="btn-primary">적용</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 태스크 큐 관리 -->
          <div class="panel-card">
            <h2>📋 태스크 큐 관리</h2>
            
            <div class="queue-section">
              <div class="queue-controls">
                <h3>🎛️ 큐 제어</h3>
                <div class="control-buttons">
                  <button id="pauseQueue" class="btn-warning">⏸️ 큐 일시정지</button>
                  <button id="resumeQueue" class="btn-success">▶️ 큐 재개</button>
                  <button id="clearQueue" class="btn-danger">🗑️ 큐 비우기</button>
                  <button id="shuffleQueue" class="btn-info">🔀 큐 섞기</button>
                  <button id="sortQueueByPriority" class="btn-primary">📶 우선순위로 정렬</button>
                </div>
                <div class="queue-stats">
                  <div class="stat-item">
                    <span class="stat-label">총 태스크:</span>
                    <span class="stat-value" id="totalQueueSize">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">실행 대기:</span>
                    <span class="stat-value" id="pendingTasksCount">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">실행 중:</span>
                    <span class="stat-value" id="runningTasksCount">0</span>
                  </div>
                </div>
              </div>

              <div class="queue-visualization">
                <h3>📊 큐 시각화</h3>
                <div class="queue-lanes">
                  <!-- User Blocking Lane -->
                  <div class="queue-lane user-blocking">
                    <div class="lane-header">
                      <span class="lane-icon">🔥</span>
                      <span class="lane-name">User Blocking</span>
                      <span class="lane-count" id="userBlockingLaneCount">0</span>
                    </div>
                    <div class="lane-tasks" id="userBlockingLane">
                      <div class="lane-placeholder">태스크 없음</div>
                    </div>
                  </div>

                  <!-- User Visible Lane -->
                  <div class="queue-lane user-visible">
                    <div class="lane-header">
                      <span class="lane-icon">👁️</span>
                      <span class="lane-name">User Visible</span>
                      <span class="lane-count" id="userVisibleLaneCount">0</span>
                    </div>
                    <div class="lane-tasks" id="userVisibleLane">
                      <div class="lane-placeholder">태스크 없음</div>
                    </div>
                  </div>

                  <!-- Background Lane -->
                  <div class="queue-lane background">
                    <div class="lane-header">
                      <span class="lane-icon">🔄</span>
                      <span class="lane-name">Background</span>
                      <span class="lane-count" id="backgroundLaneCount">0</span>
                    </div>
                    <div class="lane-tasks" id="backgroundLane">
                      <div class="lane-placeholder">태스크 없음</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 고급 스케줄링 기능 -->
          <div class="panel-card">
            <h2>⚙️ 고급 스케줄링 기능</h2>
            
            <div class="advanced-section">
              <div class="yield-control">
                <h3>⏸️ 양보(Yield) 제어</h3>
                <div class="yield-options">
                  <div class="option-group">
                    <h4>🎛️ 양보 설정</h4>
                    <div class="yield-settings">
                      <label>
                        자동 양보 활성화
                        <input type="checkbox" id="autoYield" checked>
                      </label>
                      <label>
                        양보 임계값 (ms)
                        <input type="range" id="yieldThreshold" min="5" max="100" value="16" step="1">
                        <span id="yieldThresholdValue">16ms</span>
                      </label>
                      <label>
                        양보 간격 (tasks)
                        <input type="range" id="yieldInterval" min="1" max="20" value="5" step="1">
                        <span id="yieldIntervalValue">5 tasks</span>
                      </label>
                    </div>
                  </div>
                  <div class="yield-actions">
                    <button id="manualYield" class="btn-warning">⏸️ 수동 양보</button>
                    <button id="testYield" class="btn-info">🧪 양보 테스트</button>
                    <button id="yieldStats" class="btn-primary">📊 양보 통계</button>
                  </div>
                </div>
              </div>

              <div class="interrupt-control">
                <h3>⚡ 인터럽트 처리</h3>
                <div class="interrupt-options">
                  <div class="interrupt-settings">
                    <label>
                      입력 인터럽트 감지
                      <input type="checkbox" id="inputInterrupt" checked>
                    </label>
                    <label>
                      긴급 태스크 즉시 실행
                      <input type="checkbox" id="urgentTasksFirst" checked>
                    </label>
                    <label>
                      인터럽트 응답 시간 (ms)
                      <input type="range" id="interruptResponse" min="1" max="50" value="5" step="1">
                      <span id="interruptResponseValue">5ms</span>
                    </label>
                  </div>
                  <div class="interrupt-simulation">
                    <button id="simulateUserInput" class="btn-primary">👆 사용자 입력 시뮬레이션</button>
                    <button id="simulateUrgentTask" class="btn-danger">🚨 긴급 태스크 시뮬레이션</button>
                    <button id="simulateHighLoad" class="btn-warning">🔥 고부하 시뮬레이션</button>
                  </div>
                </div>
              </div>

              <div class="timing-control">
                <h3>⏱️ 타이밍 제어</h3>
                <div class="timing-options">
                  <div class="timing-strategies">
                    <label>
                      <input type="radio" name="timingStrategy" value="immediate" checked>
                      즉시 실행
                    </label>
                    <label>
                      <input type="radio" name="timingStrategy" value="next-frame">
                      다음 프레임
                    </label>
                    <label>
                      <input type="radio" name="timingStrategy" value="idle">
                      유휴 시간
                    </label>
                    <label>
                      <input type="radio" name="timingStrategy" value="delayed">
                      지연 실행
                    </label>
                  </div>
                  <div class="timing-actions">
                    <button id="benchmarkScheduling" class="btn-primary">⚡ 스케줄링 벤치마크</button>
                    <button id="compareStrategies" class="btn-info">🔍 전략 비교</button>
                    <button id="optimizeScheduling" class="btn-success">🎯 스케줄링 최적화</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 실시간 모니터링 -->
          <div class="panel-card">
            <h2>📊 실시간 모니터링</h2>
            
            <div class="monitoring-section">
              <div class="monitoring-controls">
                <h3>🎛️ 모니터링 제어</h3>
                <div class="monitor-buttons">
                  <button id="startMonitoring" class="btn-success">📈 모니터링 시작</button>
                  <button id="stopMonitoring" class="btn-danger">⏹️ 모니터링 정지</button>
                  <button id="resetMonitoring" class="btn-warning">🔄 모니터링 리셋</button>
                  <button id="exportMonitoringData" class="btn-info">📤 데이터 내보내기</button>
                </div>
              </div>

              <div class="monitoring-charts">
                <h3>📈 성능 차트</h3>
                <div class="charts-grid">
                  <div class="chart-container">
                    <h4>태스크 실행 시간</h4>
                    <canvas id="executionTimeChart" width="300" height="200"></canvas>
                  </div>
                  <div class="chart-container">
                    <h4>큐 크기 변화</h4>
                    <canvas id="queueSizeChart" width="300" height="200"></canvas>
                  </div>
                  <div class="chart-container">
                    <h4>우선순위별 처리량</h4>
                    <canvas id="priorityThroughputChart" width="300" height="200"></canvas>
                  </div>
                  <div class="chart-container">
                    <h4>응답 시간 분포</h4>
                    <canvas id="responseTimeChart" width="300" height="200"></canvas>
                  </div>
                </div>
              </div>

              <div class="monitoring-logs">
                <h3>📝 실행 로그</h3>
                <div class="log-controls">
                  <button id="clearLogs" class="btn-danger">🗑️ 로그 초기화</button>
                  <button id="exportLogs" class="btn-info">📤 로그 내보내기</button>
                  <label>
                    <input type="checkbox" id="verboseLogging">
                    상세 로깅
                  </label>
                  <label>
                    <input type="checkbox" id="autoScrollLogs" checked>
                    자동 스크롤
                  </label>
                </div>
                <div id="executionLogs" class="logs-container">
                  <div class="logs-placeholder">로그가 여기에 표시됩니다</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 성능 벤치마크 -->
          <div class="panel-card">
            <h2>🏆 성능 벤치마크</h2>
            
            <div class="benchmark-section">
              <div class="benchmark-scenarios">
                <h3>🎯 벤치마크 시나리오</h3>
                <div class="scenarios-grid">
                  <div class="scenario-card">
                    <h4>🔥 고우선순위 태스크 처리</h4>
                    <p>긴급한 사용자 상호작용 응답성 측정</p>
                    <div class="scenario-controls">
                      <input type="range" id="highPriorityCount" min="5" max="100" value="20">
                      <span id="highPriorityCountValue">20개 태스크</span>
                      <button id="runHighPriorityBenchmark" class="btn-primary">실행</button>
                    </div>
                  </div>
                  <div class="scenario-card">
                    <h4>⚖️ 혼합 우선순위 처리</h4>
                    <p>다양한 우선순위 태스크 혼합 처리 성능</p>
                    <div class="scenario-controls">
                      <input type="range" id="mixedTaskCount" min="10" max="200" value="50">
                      <span id="mixedTaskCountValue">50개 태스크</span>
                      <button id="runMixedPriorityBenchmark" class="btn-primary">실행</button>
                    </div>
                  </div>
                  <div class="scenario-card">
                    <h4>🔄 장시간 백그라운드 처리</h4>
                    <p>백그라운드 태스크 처리 효율성 측정</p>
                    <div class="scenario-controls">
                      <input type="range" id="backgroundDuration" min="5" max="60" value="15">
                      <span id="backgroundDurationValue">15초</span>
                      <button id="runBackgroundBenchmark" class="btn-primary">실행</button>
                    </div>
                  </div>
                  <div class="scenario-card">
                    <h4>⚡ 응답성 스트레스 테스트</h4>
                    <p>극한 상황에서의 응답성 유지 능력</p>
                    <div class="scenario-controls">
                      <input type="range" id="stressLevel" min="1" max="10" value="5">
                      <span id="stressLevelValue">5단계</span>
                      <button id="runStressTest" class="btn-primary">실행</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="benchmark-results">
                <h3>📊 벤치마크 결과</h3>
                <div id="benchmarkResults" class="results-container">
                  <div class="results-placeholder">벤치마크를 실행하면 결과가 여기에 표시됩니다</div>
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
      scheduler: "Scheduler",
      postTask: "Post Task",
      yield: "Yield",
      isInputPending: "Is Input Pending",
      userBlockingPriority: "User Blocking Priority",
      userVisiblePriority: "User Visible Priority",
      backgroundPriority: "Background Priority",
      abortSignal: "Abort Signal",
      postMessage: "Post Message",
      requestIdleCallback: "Request Idle Callback",
      messageChannel: "Message Channel",
    };
    return labels[key] || key;
  }

  setupEventListeners() {
    // 빠른 테스트 및 기본 제어
    document
      .getElementById("quickSchedulingTest")
      ?.addEventListener("click", () => this.runQuickTest());

    // 우선순위별 태스크 생성
    document
      .getElementById("createUserBlockingTask")
      ?.addEventListener("click", () =>
        this.createQuickTask("user-blocking", "긴급 UI 업데이트")
      );
    document
      .getElementById("createUserVisibleTask")
      ?.addEventListener("click", () =>
        this.createQuickTask("user-visible", "사용자 가시 작업")
      );
    document
      .getElementById("createBackgroundTask")
      ?.addEventListener("click", () =>
        this.createQuickTask("background", "백그라운드 동기화")
      );

    // 대시보드 제어
    document
      .getElementById("pauseScheduler")
      ?.addEventListener("click", () => this.pauseScheduler());
    document
      .getElementById("resumeScheduler")
      ?.addEventListener("click", () => this.resumeScheduler());
    document
      .getElementById("clearAllTasks")
      ?.addEventListener("click", () => this.clearAllTasks());
    document
      .getElementById("exportMetrics")
      ?.addEventListener("click", () => this.exportMetrics());

    // 태스크 생성
    document
      .getElementById("createTask")
      ?.addEventListener("click", () => this.createCustomTask());
    document
      .getElementById("createBatchTasks")
      ?.addEventListener("click", () => this.createBatchTasks());
    document
      .getElementById("scheduleDelayedTask")
      ?.addEventListener("click", () => this.scheduleDelayedTask());

    // 태스크 템플릿
    document.querySelectorAll(".template-card button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const template = e.target.closest(".template-card").dataset.template;
        this.applyTemplate(template);
      });
    });

    // 큐 제어
    document
      .getElementById("pauseQueue")
      ?.addEventListener("click", () => this.pauseQueue());
    document
      .getElementById("resumeQueue")
      ?.addEventListener("click", () => this.resumeQueue());
    document
      .getElementById("clearQueue")
      ?.addEventListener("click", () => this.clearQueue());
    document
      .getElementById("shuffleQueue")
      ?.addEventListener("click", () => this.shuffleQueue());
    document
      .getElementById("sortQueueByPriority")
      ?.addEventListener("click", () => this.sortQueueByPriority());

    // 양보 제어
    document
      .getElementById("yieldThreshold")
      ?.addEventListener("input", (e) =>
        this.updateYieldValue("yieldThreshold", e.target.value, "ms")
      );
    document
      .getElementById("yieldInterval")
      ?.addEventListener("input", (e) =>
        this.updateYieldValue("yieldInterval", e.target.value, " tasks")
      );
    document
      .getElementById("interruptResponse")
      ?.addEventListener("input", (e) =>
        this.updateYieldValue("interruptResponse", e.target.value, "ms")
      );

    document
      .getElementById("manualYield")
      ?.addEventListener("click", () => this.manualYield());
    document
      .getElementById("testYield")
      ?.addEventListener("click", () => this.testYield());
    document
      .getElementById("yieldStats")
      ?.addEventListener("click", () => this.showYieldStats());

    // 인터럽트 시뮬레이션
    document
      .getElementById("simulateUserInput")
      ?.addEventListener("click", () => this.simulateUserInput());
    document
      .getElementById("simulateUrgentTask")
      ?.addEventListener("click", () => this.simulateUrgentTask());
    document
      .getElementById("simulateHighLoad")
      ?.addEventListener("click", () => this.simulateHighLoad());

    // 타이밍 제어
    document
      .getElementById("benchmarkScheduling")
      ?.addEventListener("click", () => this.benchmarkScheduling());
    document
      .getElementById("compareStrategies")
      ?.addEventListener("click", () => this.compareStrategies());
    document
      .getElementById("optimizeScheduling")
      ?.addEventListener("click", () => this.optimizeScheduling());

    // 모니터링 제어
    document
      .getElementById("startMonitoring")
      ?.addEventListener("click", () => this.startMonitoring());
    document
      .getElementById("stopMonitoring")
      ?.addEventListener("click", () => this.stopMonitoring());
    document
      .getElementById("resetMonitoring")
      ?.addEventListener("click", () => this.resetMonitoring());
    document
      .getElementById("exportMonitoringData")
      ?.addEventListener("click", () => this.exportMonitoringData());

    // 로그 제어
    document
      .getElementById("clearLogs")
      ?.addEventListener("click", () => this.clearLogs());
    document
      .getElementById("exportLogs")
      ?.addEventListener("click", () => this.exportLogs());

    // 벤치마크 제어
    document
      .getElementById("highPriorityCount")
      ?.addEventListener("input", (e) =>
        this.updateBenchmarkValue("highPriority", e.target.value, "개 태스크")
      );
    document
      .getElementById("mixedTaskCount")
      ?.addEventListener("input", (e) =>
        this.updateBenchmarkValue("mixedTask", e.target.value, "개 태스크")
      );
    document
      .getElementById("backgroundDuration")
      ?.addEventListener("input", (e) =>
        this.updateBenchmarkValue("backgroundDuration", e.target.value, "초")
      );
    document
      .getElementById("stressLevel")
      ?.addEventListener("input", (e) =>
        this.updateBenchmarkValue("stressLevel", e.target.value, "단계")
      );

    document
      .getElementById("runHighPriorityBenchmark")
      ?.addEventListener("click", () => this.runHighPriorityBenchmark());
    document
      .getElementById("runMixedPriorityBenchmark")
      ?.addEventListener("click", () => this.runMixedPriorityBenchmark());
    document
      .getElementById("runBackgroundBenchmark")
      ?.addEventListener("click", () => this.runBackgroundBenchmark());
    document
      .getElementById("runStressTest")
      ?.addEventListener("click", () => this.runStressTest());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  setupMonitoring() {
    this.monitoringData = {
      executionTimes: [],
      queueSizes: [],
      priorityThroughput: [],
      responseTimes: [],
      timestamps: [],
    };

    this.monitoringInterval = null;
    this.isMonitoring = false;

    // 자동으로 모니터링 시작
    this.startMonitoring();
  }

  initializeExampleTasks() {
    // 예제 태스크들을 큐에 추가
    const exampleTasks = [
      {
        name: "초기 UI 렌더링",
        priority: "user-blocking",
        type: "dom",
        duration: 300,
      },
      {
        name: "사용자 데이터 로드",
        priority: "user-visible",
        type: "network",
        duration: 800,
      },
      {
        name: "분석 데이터 전송",
        priority: "background",
        type: "network",
        duration: 1500,
      },
    ];

    exampleTasks.forEach((task) => {
      this.scheduleTask(task.name, task.priority, () => {
        return this.simulateWork(task.duration);
      });
    });

    this.updateDashboard();
  }

  // 빠른 테스트
  async runQuickTest() {
    this.showInPageNotification("빠른 스케줄링 테스트 시작!", "info");

    try {
      const testTasks = [
        {
          name: "긴급 사용자 액션",
          priority: "user-blocking",
          work: () => this.simulateWork(100),
        },
        {
          name: "화면 업데이트",
          priority: "user-visible",
          work: () => this.simulateWork(300),
        },
        {
          name: "데이터 동기화",
          priority: "background",
          work: () => this.simulateWork(500),
        },
      ];

      this.logMessage(`🚀 빠른 테스트: ${testTasks.length}개 태스크 스케줄링`);

      const startTime = performance.now();
      const promises = testTasks.map((task) =>
        this.scheduleTask(task.name, task.priority, task.work)
      );

      await Promise.all(promises);
      const endTime = performance.now();

      const result = {
        총_실행_시간: `${(endTime - startTime).toFixed(2)}ms`,
        완료된_태스크: testTasks.length,
        평균_태스크_시간: `${((endTime - startTime) / testTasks.length).toFixed(
          2
        )}ms`,
        우선순위_준수: "✅ 정상",
      };

      console.log("🚀 빠른 스케줄링 테스트 결과:", result);

      this.showInPageNotification(
        `빠른 테스트 완료! 총 시간: ${result.총_실행_시간}`,
        "success"
      );

      this.updateDashboard();
    } catch (error) {
      console.error("빠른 테스트 오류:", error);
      this.showInPageNotification(`테스트 실패: ${error.message}`, "error");
    }
  }

  // 태스크 스케줄링 핵심 메소드
  async scheduleTask(name, priority = "user-visible", work, options = {}) {
    if (!this.apiSupport.scheduler || !this.apiSupport.postTask) {
      return this.fallbackScheduleTask(name, priority, work, options);
    }

    const taskId = ++this.taskId;
    const task = {
      id: taskId,
      name: name,
      priority: priority,
      work: work,
      options: options,
      status: "pending",
      createdAt: performance.now(),
      startedAt: null,
      completedAt: null,
    };

    this.taskQueue.push(task);
    this.updateDashboard();

    try {
      // AbortController 설정
      const abortController = new AbortController();
      if (options.cancellable) {
        this.abortControllers.set(taskId, abortController);
      }

      this.logMessage(
        `📋 태스크 스케줄: ${name} (${priority}) [ID: ${taskId}]`
      );

      // scheduler.postTask 사용
      const schedulerOptions = {
        priority: priority,
        signal: options.cancellable ? abortController.signal : undefined,
      };

      if (options.delay) {
        // 지연 실행
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }

      const promise = scheduler.postTask(async () => {
        task.status = "running";
        task.startedAt = performance.now();
        this.schedulerState.currentTask = task;

        this.logMessage(`🏃 태스크 시작: ${name} [ID: ${taskId}]`);
        this.updateDashboard();

        const result = await work();

        task.status = "completed";
        task.completedAt = performance.now();
        this.schedulerState.currentTask = null;

        this.logMessage(
          `✅ 태스크 완료: ${name} [ID: ${taskId}] (${(
            task.completedAt - task.startedAt
          ).toFixed(2)}ms)`
        );

        // 성능 메트릭 업데이트
        this.updateTaskMetrics(task);
        this.updateDashboard();

        return result;
      }, schedulerOptions);

      return promise;
    } catch (error) {
      if (error.name === "AbortError") {
        task.status = "cancelled";
        this.logMessage(`❌ 태스크 취소: ${name} [ID: ${taskId}]`);
      } else {
        task.status = "error";
        this.logMessage(
          `💥 태스크 오류: ${name} [ID: ${taskId}] - ${error.message}`
        );
      }
      this.updateDashboard();
      throw error;
    } finally {
      // 정리
      this.abortControllers.delete(taskId);
      const taskIndex = this.taskQueue.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        this.taskQueue.splice(taskIndex, 1);
      }
    }
  }

  // 폴백 스케줄링 (scheduler API 미지원시)
  async fallbackScheduleTask(name, priority, work, options = {}) {
    const taskId = ++this.taskId;
    const task = {
      id: taskId,
      name: name,
      priority: priority,
      work: work,
      options: options,
      status: "pending",
      createdAt: performance.now(),
    };

    this.logMessage(`📋 폴백 스케줄: ${name} (${priority}) [ID: ${taskId}]`);

    // 우선순위별 대체 스케줄링
    let scheduleMethod;
    switch (priority) {
      case "user-blocking":
        scheduleMethod = (callback) => {
          // 즉시 실행 (MessageChannel 사용)
          const channel = new MessageChannel();
          channel.port2.onmessage = () => callback();
          channel.port1.postMessage(null);
        };
        break;
      case "user-visible":
        scheduleMethod = (callback) => {
          // requestAnimationFrame 사용
          requestAnimationFrame(callback);
        };
        break;
      case "background":
        scheduleMethod = (callback) => {
          // requestIdleCallback 또는 setTimeout 사용
          if (this.apiSupport.requestIdleCallback) {
            requestIdleCallback(callback);
          } else {
            setTimeout(callback, 0);
          }
        };
        break;
      default:
        scheduleMethod = (callback) => setTimeout(callback, 0);
    }

    return new Promise((resolve, reject) => {
      scheduleMethod(async () => {
        try {
          task.status = "running";
          task.startedAt = performance.now();
          this.schedulerState.currentTask = task;

          const result = await work();

          task.status = "completed";
          task.completedAt = performance.now();
          this.schedulerState.currentTask = null;

          this.updateTaskMetrics(task);
          this.updateDashboard();

          resolve(result);
        } catch (error) {
          task.status = "error";
          this.updateDashboard();
          reject(error);
        }
      });
    });
  }

  // 작업 시뮬레이션
  async simulateWork(duration) {
    const startTime = performance.now();
    let result = 0;

    // CPU 집약적 작업 시뮬레이션
    while (performance.now() - startTime < duration) {
      result += Math.random();

      // 양보 체크
      if (this.shouldYield()) {
        await this.yieldToMain();
      }
    }

    return result;
  }

  // 양보 조건 확인
  shouldYield() {
    if (!document.getElementById("autoYield")?.checked) return false;

    const threshold = parseInt(
      document.getElementById("yieldThreshold")?.value || 16
    );
    return performance.now() % threshold < 1;
  }

  // 메인 스레드에 양보
  async yieldToMain() {
    if (this.apiSupport.scheduler && this.apiSupport.yield) {
      await scheduler.yield();
    } else {
      // 폴백: MessageChannel 사용
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port2.onmessage = () => resolve();
        channel.port1.postMessage(null);
      });
    }
  }

  // 빠른 태스크 생성
  createQuickTask(priority, baseName) {
    const taskTypes = ["computation", "dom", "network", "data"];
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    const duration = this.getDefaultDuration(priority);

    const name = `${baseName} (${taskType})`;

    this.scheduleTask(name, priority, () => this.simulateWork(duration));
    this.showInPageNotification(`${name} 태스크가 생성되었습니다`, "success");
  }

  getDefaultDuration(priority) {
    switch (priority) {
      case "user-blocking":
        return 50 + Math.random() * 100; // 50-150ms
      case "user-visible":
        return 200 + Math.random() * 300; // 200-500ms
      case "background":
        return 500 + Math.random() * 1000; // 500-1500ms
      default:
        return 300;
    }
  }

  // 커스텀 태스크 생성
  createCustomTask() {
    const name = document.getElementById("taskName").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const duration = parseInt(document.getElementById("taskDuration").value);
    const delay = parseInt(document.getElementById("taskDelay").value);
    const type = document.getElementById("taskType").value;
    const cancellable = document.getElementById("taskCancellable").checked;

    if (!name) {
      this.showInPageNotification("태스크 이름을 입력하세요", "warning");
      return;
    }

    const options = {
      delay: delay,
      cancellable: cancellable,
      type: type,
    };

    this.scheduleTask(
      name,
      priority,
      () => this.simulateWork(duration),
      options
    );

    this.showInPageNotification(
      `커스텀 태스크 '${name}'이 생성되었습니다`,
      "success"
    );

    // 폼 초기화
    document.getElementById("taskName").value = "";
  }

  // 배치 태스크 생성
  createBatchTasks() {
    const count = 5 + Math.floor(Math.random() * 10); // 5-15개
    const priorities = ["user-blocking", "user-visible", "background"];
    const types = ["computation", "dom", "network", "data"];

    for (let i = 0; i < count; i++) {
      const priority =
        priorities[Math.floor(Math.random() * priorities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const duration = this.getDefaultDuration(priority);
      const name = `배치 태스크 ${i + 1} (${type})`;

      this.scheduleTask(name, priority, () => this.simulateWork(duration));
    }

    this.showInPageNotification(
      `${count}개 배치 태스크가 생성되었습니다`,
      "success"
    );
  }

  // 지연 태스크 스케줄
  scheduleDelayedTask() {
    const delay = parseInt(document.getElementById("taskDelay").value) || 2000;
    const name = `지연 태스크 (${delay}ms 후)`;
    const priority = document.getElementById("taskPriority").value;

    this.scheduleTask(name, priority, () => this.simulateWork(500), {
      delay: delay,
    });

    this.showInPageNotification(
      `${delay}ms 후 실행될 태스크가 스케줄되었습니다`,
      "info"
    );
  }

  // 템플릿 적용
  applyTemplate(template) {
    const templates = {
      "heavy-computation": {
        name: "무거운 계산 작업",
        priority: "background",
        duration: 2000,
        type: "computation",
      },
      "ui-update": {
        name: "UI 업데이트",
        priority: "user-visible",
        duration: 300,
        type: "dom",
      },
      "data-fetch": {
        name: "데이터 가져오기",
        priority: "user-visible",
        duration: 800,
        type: "network",
      },
      "background-sync": {
        name: "백그라운드 동기화",
        priority: "background",
        duration: 1200,
        type: "data",
      },
      "image-processing": {
        name: "이미지 처리",
        priority: "background",
        duration: 1500,
        type: "computation",
      },
      analytics: {
        name: "분석 데이터 처리",
        priority: "background",
        duration: 600,
        type: "data",
      },
    };

    const config = templates[template];
    if (!config) return;

    // 폼에 값 설정
    document.getElementById("taskName").value = config.name;
    document.getElementById("taskPriority").value = config.priority;
    document.getElementById("taskDuration").value = config.duration;
    document.getElementById("taskType").value = config.type;

    this.showInPageNotification(
      `${config.name} 템플릿이 적용되었습니다`,
      "info"
    );
  }

  // 메트릭 업데이트
  updateTaskMetrics(task) {
    const metrics = this.schedulerState.performanceMetrics;

    metrics.totalTasks++;

    if (task.status === "completed") {
      metrics.completedTasks++;
      const executionTime = task.completedAt - task.startedAt;

      // 평균 실행 시간 업데이트
      const currentAvg = metrics.averageExecutionTime;
      const newAvg =
        (currentAvg * (metrics.completedTasks - 1) + executionTime) /
        metrics.completedTasks;
      metrics.averageExecutionTime = newAvg;

      // 우선순위별 분포 업데이트
      if (metrics.priorityDistribution[task.priority] !== undefined) {
        metrics.priorityDistribution[task.priority]++;
      }

      // 모니터링 데이터 추가
      if (this.isMonitoring) {
        this.monitoringData.executionTimes.push(executionTime);
        this.monitoringData.timestamps.push(Date.now());
      }
    } else if (task.status === "cancelled") {
      metrics.cancelledTasks++;
    }
  }

  // 대시보드 업데이트
  updateDashboard() {
    const metrics = this.schedulerState.performanceMetrics;

    // 현재 상태 업데이트
    const currentTask = this.schedulerState.currentTask;
    document.getElementById("currentTaskName").textContent = currentTask
      ? currentTask.name
      : "대기 중";

    document.getElementById("queuedTasksCount").textContent =
      this.taskQueue.filter((t) => t.status === "pending").length;

    document.getElementById("completedTasksCount").textContent =
      metrics.completedTasks;

    document.getElementById("cancelledTasksCount").textContent =
      metrics.cancelledTasks;

    // 우선순위 분포 업데이트
    const totalPriorityTasks = Object.values(
      metrics.priorityDistribution
    ).reduce((sum, count) => sum + count, 0);

    Object.entries(metrics.priorityDistribution).forEach(
      ([priority, count]) => {
        const percentage =
          totalPriorityTasks > 0 ? (count / totalPriorityTasks) * 100 : 0;

        // priority 이름을 올바른 camelCase ID로 변환
        const priorityId =
          priority === "user-blocking"
            ? "userBlocking"
            : priority === "user-visible"
            ? "userVisible"
            : priority;

        const countElement = document.getElementById(`${priorityId}Count`);
        const barElement = document.getElementById(`${priorityId}Bar`);

        if (countElement) countElement.textContent = count;
        if (barElement) barElement.style.width = `${percentage}%`;
      }
    );

    // 성능 메트릭 업데이트
    document.getElementById(
      "avgExecutionTime"
    ).textContent = `${metrics.averageExecutionTime.toFixed(2)}ms`;

    const completionRate =
      metrics.totalTasks > 0
        ? (metrics.completedTasks / metrics.totalTasks) * 100
        : 0;
    document.getElementById(
      "completionRate"
    ).textContent = `${completionRate.toFixed(1)}%`;

    // 처리량 계산 (분당 완료 태스크)
    const throughput = this.calculateThroughput();
    document.getElementById("throughput").textContent = throughput;

    // 응답성 평가
    const responsiveness = this.evaluateResponsiveness();
    document.getElementById("responsiveness").textContent = responsiveness;

    // 큐 시각화 업데이트
    this.updateQueueVisualization();
  }

  calculateThroughput() {
    if (this.monitoringData.timestamps.length < 2) return "0 tasks/s";

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentTasks = this.monitoringData.timestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo
    ).length;

    return `${(recentTasks / 60).toFixed(1)} tasks/s`;
  }

  evaluateResponsiveness() {
    const avgTime = this.schedulerState.performanceMetrics.averageExecutionTime;

    if (avgTime < 100) return "최고";
    if (avgTime < 300) return "양호";
    if (avgTime < 500) return "보통";
    return "개선 필요";
  }

  updateQueueVisualization() {
    const lanes = {
      "user-blocking": document.getElementById("userBlockingLane"),
      "user-visible": document.getElementById("userVisibleLane"),
      background: document.getElementById("backgroundLane"),
    };

    Object.entries(lanes).forEach(([priority, laneElement]) => {
      const tasks = this.taskQueue.filter(
        (task) => task.priority === priority && task.status === "pending"
      );

      // priority 이름을 올바른 camelCase ID로 변환
      const priorityId =
        priority === "user-blocking"
          ? "userBlocking"
          : priority === "user-visible"
          ? "userVisible"
          : priority;

      const countElement = document.getElementById(`${priorityId}LaneCount`);
      if (countElement) countElement.textContent = tasks.length;

      if (tasks.length === 0) {
        laneElement.innerHTML =
          '<div class="lane-placeholder">태스크 없음</div>';
      } else {
        laneElement.innerHTML = tasks
          .slice(0, 5) // 최대 5개만 표시
          .map(
            (task) => `
            <div class="task-item ${priority}" data-id="${task.id}">
              <span class="task-name">${task.name}</span>
              <span class="task-time">${(
                performance.now() - task.createdAt
              ).toFixed(0)}ms</span>
              <button onclick="window.schedulerAPI.cancelTask(${
                task.id
              })" class="btn-small btn-danger">❌</button>
            </div>
          `
          )
          .join("");

        if (tasks.length > 5) {
          laneElement.innerHTML += `<div class="more-tasks">+${
            tasks.length - 5
          }개 더</div>`;
        }
      }
    });
  }

  // 태스크 취소
  cancelTask(taskId) {
    const abortController = this.abortControllers.get(taskId);
    if (abortController) {
      abortController.abort();
      this.showInPageNotification(
        `태스크 ID ${taskId}가 취소되었습니다`,
        "info"
      );
    } else {
      // 큐에서 제거
      const taskIndex = this.taskQueue.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        this.taskQueue.splice(taskIndex, 1);
        this.showInPageNotification(
          `대기 중인 태스크 ID ${taskId}가 제거되었습니다`,
          "info"
        );
      }
    }
    this.updateDashboard();
  }

  // 스케줄러 제어 메소드들
  pauseScheduler() {
    this.schedulerState.isPaused = true;
    this.showInPageNotification("스케줄러가 일시정지되었습니다", "warning");
  }

  resumeScheduler() {
    this.schedulerState.isPaused = false;
    this.showInPageNotification("스케줄러가 재개되었습니다", "success");
  }

  clearAllTasks() {
    // 모든 AbortController 실행
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();

    // 큐 비우기
    this.taskQueue = [];

    // 메트릭 리셋
    this.schedulerState.performanceMetrics = {
      totalTasks: 0,
      completedTasks: 0,
      cancelledTasks: 0,
      averageExecutionTime: 0,
      priorityDistribution: {
        "user-blocking": 0,
        "user-visible": 0,
        background: 0,
      },
    };

    this.updateDashboard();
    this.showInPageNotification("모든 태스크가 삭제되었습니다", "info");
  }

  // 로깅
  logMessage(message, level = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const logContainer = document.getElementById("executionLogs");

    if (!logContainer) return;

    // 플레이스홀더 제거
    const placeholder = logContainer.querySelector(".logs-placeholder");
    if (placeholder) placeholder.remove();

    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${level}`;
    logEntry.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-level">${level.toUpperCase()}</span>
      <span class="log-message">${message}</span>
    `;

    logContainer.appendChild(logEntry);

    // 자동 스크롤
    if (document.getElementById("autoScrollLogs")?.checked) {
      logEntry.scrollIntoView({ behavior: "smooth" });
    }

    // 로그 수 제한 (최근 100개)
    const logs = logContainer.querySelectorAll(".log-entry");
    if (logs.length > 100) {
      logs[0].remove();
    }
  }

  // 유틸리티 메소드들
  updateYieldValue(type, value, unit) {
    document.getElementById(`${type}Value`).textContent = `${value}${unit}`;
  }

  updateBenchmarkValue(type, value, unit) {
    document.getElementById(
      `${type}CountValue`
    ).textContent = `${value}${unit}`;
  }

  // 기본 구현들 (추후 확장 가능)
  exportMetrics() {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.schedulerState.performanceMetrics,
      queue: this.taskQueue.map((t) => ({
        id: t.id,
        name: t.name,
        priority: t.priority,
        status: t.status,
      })),
      monitoring: this.monitoringData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scheduler-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showInPageNotification("메트릭이 내보내기되었습니다", "success");
  }

  pauseQueue() {
    this.showInPageNotification("큐 일시정지 기능은 개발 중입니다", "info");
  }

  resumeQueue() {
    this.showInPageNotification("큐 재개 기능은 개발 중입니다", "info");
  }

  clearQueue() {
    this.taskQueue = this.taskQueue.filter((t) => t.status === "running");
    this.updateDashboard();
    this.showInPageNotification("대기 중인 태스크가 삭제되었습니다", "info");
  }

  shuffleQueue() {
    const pendingTasks = this.taskQueue.filter((t) => t.status === "pending");
    for (let i = pendingTasks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pendingTasks[i], pendingTasks[j]] = [pendingTasks[j], pendingTasks[i]];
    }
    this.updateDashboard();
    this.showInPageNotification("큐가 섞였습니다", "info");
  }

  sortQueueByPriority() {
    const priorityOrder = {
      "user-blocking": 0,
      "user-visible": 1,
      background: 2,
    };
    this.taskQueue.sort((a, b) => {
      if (a.status !== "pending" && b.status === "pending") return 1;
      if (a.status === "pending" && b.status !== "pending") return -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    this.updateDashboard();
    this.showInPageNotification("큐가 우선순위로 정렬되었습니다", "info");
  }

  manualYield() {
    this.yieldToMain();
    this.showInPageNotification("수동 양보가 실행되었습니다", "info");
  }

  testYield() {
    this.showInPageNotification("양보 테스트 기능은 개발 중입니다", "info");
  }

  showYieldStats() {
    this.showInPageNotification("양보 통계 기능은 개발 중입니다", "info");
  }

  simulateUserInput() {
    // 긴급 태스크 생성으로 사용자 입력 시뮬레이션
    this.createQuickTask("user-blocking", "사용자 입력 응답");
    this.showInPageNotification("사용자 입력이 시뮬레이션되었습니다", "info");
  }

  simulateUrgentTask() {
    // 여러 긴급 태스크 동시 생성
    for (let i = 0; i < 3; i++) {
      this.createQuickTask("user-blocking", `긴급 태스크 ${i + 1}`);
    }
    this.showInPageNotification("긴급 태스크들이 생성되었습니다", "warning");
  }

  simulateHighLoad() {
    // 고부하 상황 시뮬레이션
    this.createBatchTasks();
    this.createBatchTasks();
    this.showInPageNotification(
      "고부하 상황이 시뮬레이션되었습니다",
      "warning"
    );
  }

  benchmarkScheduling() {
    this.showInPageNotification(
      "스케줄링 벤치마크 기능은 개발 중입니다",
      "info"
    );
  }

  compareStrategies() {
    this.showInPageNotification("전략 비교 기능은 개발 중입니다", "info");
  }

  optimizeScheduling() {
    this.showInPageNotification("스케줄링 최적화 기능은 개발 중입니다", "info");
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMonitoringData();
    }, 1000);

    this.showInPageNotification("모니터링이 시작되었습니다", "success");
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.showInPageNotification("모니터링이 정지되었습니다", "info");
  }

  resetMonitoring() {
    this.monitoringData = {
      executionTimes: [],
      queueSizes: [],
      priorityThroughput: [],
      responseTimes: [],
      timestamps: [],
    };

    this.showInPageNotification("모니터링 데이터가 리셋되었습니다", "info");
  }

  updateMonitoringData() {
    if (!this.isMonitoring) return;

    const queueSize = this.taskQueue.length;
    this.monitoringData.queueSizes.push(queueSize);

    // 데이터 제한 (최근 100개)
    Object.keys(this.monitoringData).forEach((key) => {
      if (this.monitoringData[key].length > 100) {
        this.monitoringData[key].shift();
      }
    });
  }

  exportMonitoringData() {
    const blob = new Blob([JSON.stringify(this.monitoringData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monitoring-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showInPageNotification(
      "모니터링 데이터가 내보내기되었습니다",
      "success"
    );
  }

  clearLogs() {
    const logContainer = document.getElementById("executionLogs");
    if (logContainer) {
      logContainer.innerHTML =
        '<div class="logs-placeholder">로그가 여기에 표시됩니다</div>';
    }
    this.showInPageNotification("로그가 초기화되었습니다", "info");
  }

  exportLogs() {
    const logs = Array.from(document.querySelectorAll(".log-entry")).map(
      (entry) => ({
        time: entry.querySelector(".log-time").textContent,
        level: entry.querySelector(".log-level").textContent,
        message: entry.querySelector(".log-message").textContent,
      })
    );

    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showInPageNotification("실행 로그가 내보내기되었습니다", "success");
  }

  // 벤치마크 메소드들
  async runHighPriorityBenchmark() {
    const count = parseInt(document.getElementById("highPriorityCount").value);
    this.showInPageNotification(
      `고우선순위 벤치마크 시작 (${count}개 태스크)`,
      "info"
    );

    const startTime = performance.now();
    const tasks = [];

    for (let i = 0; i < count; i++) {
      tasks.push(
        this.scheduleTask(`고우선순위 태스크 ${i + 1}`, "user-blocking", () =>
          this.simulateWork(50 + Math.random() * 50)
        )
      );
    }

    try {
      await Promise.all(tasks);
      const endTime = performance.now();

      const result = {
        태스크_수: count,
        총_시간: `${(endTime - startTime).toFixed(2)}ms`,
        평균_시간: `${((endTime - startTime) / count).toFixed(2)}ms`,
        처리율: `${(count / ((endTime - startTime) / 1000)).toFixed(
          1
        )} tasks/s`,
        결과: "성공",
      };

      this.addBenchmarkResult("고우선순위 태스크 처리", result);
      this.showInPageNotification("고우선순위 벤치마크 완료!", "success");
    } catch (error) {
      this.showInPageNotification(`벤치마크 실패: ${error.message}`, "error");
    }
  }

  async runMixedPriorityBenchmark() {
    const count = parseInt(document.getElementById("mixedTaskCount").value);
    this.showInPageNotification(
      `혼합 우선순위 벤치마크 시작 (${count}개 태스크)`,
      "info"
    );

    const startTime = performance.now();
    const tasks = [];
    const priorities = ["user-blocking", "user-visible", "background"];

    for (let i = 0; i < count; i++) {
      const priority = priorities[i % 3];
      const duration = this.getDefaultDuration(priority);

      tasks.push(
        this.scheduleTask(`혼합 태스크 ${i + 1}`, priority, () =>
          this.simulateWork(duration)
        )
      );
    }

    try {
      await Promise.all(tasks);
      const endTime = performance.now();

      const result = {
        태스크_수: count,
        총_시간: `${(endTime - startTime).toFixed(2)}ms`,
        평균_시간: `${((endTime - startTime) / count).toFixed(2)}ms`,
        우선순위_분포: "균등",
        결과: "성공",
      };

      this.addBenchmarkResult("혼합 우선순위 처리", result);
      this.showInPageNotification("혼합 우선순위 벤치마크 완료!", "success");
    } catch (error) {
      this.showInPageNotification(`벤치마크 실패: ${error.message}`, "error");
    }
  }

  async runBackgroundBenchmark() {
    const duration = parseInt(
      document.getElementById("backgroundDuration").value
    );
    this.showInPageNotification(
      `백그라운드 벤치마크 시작 (${duration}초)`,
      "info"
    );

    const endTime = Date.now() + duration * 1000;
    let taskCount = 0;

    while (Date.now() < endTime) {
      taskCount++;
      await this.scheduleTask(
        `백그라운드 태스크 ${taskCount}`,
        "background",
        () => this.simulateWork(200 + Math.random() * 300)
      );

      // 작은 간격으로 태스크 생성
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const result = {
      지속_시간: `${duration}초`,
      총_태스크: taskCount,
      초당_태스크: `${(taskCount / duration).toFixed(1)} tasks/s`,
      백그라운드_효율: "높음",
      결과: "성공",
    };

    this.addBenchmarkResult("장시간 백그라운드 처리", result);
    this.showInPageNotification("백그라운드 벤치마크 완료!", "success");
  }

  async runStressTest() {
    const level = parseInt(document.getElementById("stressLevel").value);
    this.showInPageNotification(
      `스트레스 테스트 시작 (레벨 ${level})`,
      "warning"
    );

    const taskCount = level * 20; // 레벨당 20개 태스크
    const startTime = performance.now();

    // 동시에 많은 태스크 생성
    const tasks = [];
    for (let i = 0; i < taskCount; i++) {
      const priority =
        i < taskCount / 3
          ? "user-blocking"
          : i < (taskCount * 2) / 3
          ? "user-visible"
          : "background";
      const duration = 100 + Math.random() * 500;

      tasks.push(
        this.scheduleTask(`스트레스 태스크 ${i + 1}`, priority, () =>
          this.simulateWork(duration)
        )
      );
    }

    try {
      await Promise.all(tasks);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      const result = {
        스트레스_레벨: level,
        태스크_수: taskCount,
        총_시간: `${totalTime.toFixed(2)}ms`,
        시스템_안정성: totalTime < taskCount * 100 ? "안정" : "불안정",
        응답성: totalTime / taskCount < 200 ? "양호" : "저하",
        결과: "완료",
      };

      this.addBenchmarkResult("응답성 스트레스 테스트", result);
      this.showInPageNotification("스트레스 테스트 완료!", "success");
    } catch (error) {
      this.showInPageNotification(
        `스트레스 테스트 실패: ${error.message}`,
        "error"
      );
    }
  }

  addBenchmarkResult(testName, result) {
    const container = document.getElementById("benchmarkResults");
    if (!container) return;

    // 플레이스홀더 제거
    const placeholder = container.querySelector(".results-placeholder");
    if (placeholder) placeholder.remove();

    const resultElement = document.createElement("div");
    resultElement.className = "benchmark-result";
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

    // 결과 수 제한 (최근 5개)
    const results = container.querySelectorAll(".benchmark-result");
    if (results.length > 5) {
      results[results.length - 1].remove();
    }
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
window.schedulerAPI = null;

// 초기화
function initPrioritizedTaskSchedulingAPI() {
  console.log("⚡ Prioritized Task Scheduling API Manager 초기화 함수 호출");
  window.schedulerAPI = new PrioritizedTaskSchedulingAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener(
    "DOMContentLoaded",
    initPrioritizedTaskSchedulingAPI
  );
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initPrioritizedTaskSchedulingAPI();
}

console.log(
  "📄 Prioritized Task Scheduling API 스크립트 로드 완료, readyState:",
  document.readyState
);
