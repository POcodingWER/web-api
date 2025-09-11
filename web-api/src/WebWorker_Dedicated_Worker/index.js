import "./style.css";

console.log("🛠️ WebWorker (Dedicated Worker) 스크립트 시작!");

class WebWorkerAPI {
  constructor() {
    this.workers = new Map();
    this.taskHistory = [];
    this.performanceStats = {
      totalTasks: 0,
      averageTime: 0,
      successRate: 100,
      errorCount: 0,
    };
    this.workerPool = [];
    this.maxPoolSize = 4;
    this.taskQueue = [];
    this.isProcessingQueue = false;
    this.animationActive = false;
    this.animationInterval = null;
    this.init();
  }

  init() {
    console.log("🛠️ WebWorker API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.setupExperimentListeners();
    this.initializeWorkerPool();
    console.log("✅ WebWorker API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Web Worker API 지원 여부 확인 중...");

    const support = {
      webWorker: typeof Worker !== "undefined",
      sharedWorker: typeof SharedWorker !== "undefined",
      serviceWorker: "serviceWorker" in navigator,
      transferableObjects: typeof ArrayBuffer !== "undefined",
      importScripts: true, // Worker 내부에서만 확인 가능
    };

    console.log("Web Worker API 지원 상태:", support);

    if (!support.webWorker) {
      this.showNotification(
        "이 브라우저는 Web Worker를 지원하지 않습니다",
        "error"
      );
    }

    return support;
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }

    const support = this.checkAPISupport();

    appDiv.innerHTML = `
      <div class="webworker-container">
        <header class="webworker-header">
          <h1>🛠️ WebWorker (Dedicated Worker)</h1>
          <p>백그라운드 스레드에서 무거운 작업을 처리하세요</p>
          <div class="api-support">
            <div class="support-badge ${
              support.webWorker ? "supported" : "unsupported"
            }">
              ${support.webWorker ? "✅ Web Worker" : "❌ Web Worker"}
            </div>
            <div class="support-badge ${
              support.sharedWorker ? "supported" : "unsupported"
            }">
              ${support.sharedWorker ? "✅ Shared Worker" : "❌ Shared Worker"}
            </div>
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
              support.transferableObjects ? "supported" : "unsupported"
            }">
              ${
                support.transferableObjects
                  ? "✅ Transferable Objects"
                  : "❌ Transferable Objects"
              }
            </div>
          </div>
        </header>

        <!-- 멀티스레드 증명 실험 -->
        <div class="demo-section thread-experiment">
          <h2>🧪 싱글스레드 vs 멀티스레드 증명 실험</h2>
          <div class="experiment-controls">
            <button id="blockingTest" class="btn-danger">❌ 메인 스레드 블록킹 테스트</button>
            <button id="nonBlockingTest" class="btn-success">✅ 워커 멀티스레드 테스트</button>
            <button id="animationToggle" class="btn-accent">🎪 애니메이션 시작</button>
          </div>
          
          <div class="animation-container">
            <div id="spinningBox" class="spinning-box">🔄</div>
            <div id="threadStatus" class="thread-status">메인 스레드 상태: 대기 중</div>
          </div>
          
          <div class="test-results">
            <div id="experimentOutput" class="experiment-output">
              <h4>📋 실험 설명:</h4>
              <p><strong>❌ 블록킹 테스트:</strong> 메인 스레드에서 무거운 계산 → 애니메이션 멈춤</p>
              <p><strong>✅ 멀티스레드 테스트:</strong> 워커에서 계산 → 애니메이션 계속 실행</p>
            </div>
          </div>
        </div>

        <main class="webworker-main">
          <!-- Worker Management Panel -->
          <div class="worker-management">
            <div class="panel-card primary">
              <h2>🔧 워커 관리</h2>
              
              <div class="worker-controls">
                <div class="control-group">
                  <label for="workerType">워커 타입:</label>
                  <select id="workerType">
                    <option value="math">수학 계산</option>
                    <option value="image">이미지 처리</option>
                    <option value="data">데이터 분석</option>
                    <option value="crypto">암호화</option>
                    <option value="sorting">정렬 알고리즘</option>
                  </select>
                </div>

                <div class="worker-actions">
                  <button id="createWorker" class="btn-primary">
                    ➕ 워커 생성
                  </button>
                  <button id="terminateWorker" class="btn-danger">
                    ⏹️ 워커 종료
                  </button>
                  <button id="terminateAllWorkers" class="btn-warning">
                    🗑️ 모든 워커 종료
                  </button>
                  <button id="poolStatus" class="btn-secondary">
                    📊 풀 상태 확인
                  </button>
                </div>
              </div>

              <div class="active-workers" id="activeWorkers">
                <h3>활성 워커 목록</h3>
                <div class="worker-list" id="workerList">
                  <div class="list-placeholder">활성 워커가 없습니다</div>
                </div>
              </div>
            </div>

            <div class="panel-card">
              <h2>📊 성능 통계</h2>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">총 작업 수:</span>
                  <span class="stat-value" id="totalTasks">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">평균 처리 시간:</span>
                  <span class="stat-value" id="averageTime">0ms</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">성공률:</span>
                  <span class="stat-value" id="successRate">100%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">오류 수:</span>
                  <span class="stat-value" id="errorCount">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">대기 중인 작업:</span>
                  <span class="stat-value" id="queueLength">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">풀 크기:</span>
                  <span class="stat-value" id="poolSize">0</span>
                </div>
              </div>

              <div class="performance-chart">
                <canvas id="performanceChart" width="300" height="150"></canvas>
              </div>
            </div>
          </div>

          <!-- Task Demo Section -->
          <div class="task-demo-section">
            <div class="panel-card full-width">
              <h2>🎬 작업 데모</h2>
              
              <div class="demo-tabs">
                <button class="demo-tab-btn active" data-demo="math">🧮 수학 계산</button>
                <button class="demo-tab-btn" data-demo="image">🖼️ 이미지 처리</button>
                <button class="demo-tab-btn" data-demo="data">📊 데이터 분석</button>
                <button class="demo-tab-btn" data-demo="benchmark">⚡ 벤치마크</button>
              </div>

              <div class="demo-content">
                <!-- Math Demo -->
                <div class="demo-panel active" id="mathDemo">
                  <div class="demo-controls">
                    <h3>🧮 수학 계산 데모</h3>
                    <div class="math-controls">
                      <div class="control-group">
                        <label for="mathOperation">연산 타입:</label>
                        <select id="mathOperation">
                          <option value="prime">소수 찾기</option>
                          <option value="fibonacci">피보나치 수열</option>
                          <option value="factorial">팩토리얼</option>
                          <option value="pi">원주율 계산</option>
                          <option value="matrix">행렬 곱셈</option>
                        </select>
                      </div>
                      <div class="control-group">
                        <label for="mathInput">입력값:</label>
                        <input type="number" id="mathInput" value="10000" min="1" max="1000000">
                        <small style="color: var(--text-secondary); font-size: 12px;">
                          추천: 소수찾기(10000), 피보나치(40), 팩토리얼(20)
                        </small>
                      </div>
                      <div class="control-group">
                        <label class="checkbox-label">
                          <input type="checkbox" id="useWorker" checked>
                          <span class="checkmark"></span>
                          워커 사용 (비교용)
                        </label>
                      </div>
                      <div style="display: flex; gap: 10px;">
                        <button id="startMathTask" class="btn-primary">🚀 계산 시작</button>
                        <button id="quickDemo" class="btn-accent">⚡ 빠른 데모</button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="demo-results">
                    <div class="result-section">
                      <h4>📈 결과</h4>
                      <div class="result-display" id="mathResult">
                        계산 결과가 여기에 표시됩니다
                      </div>
                    </div>
                    <div class="performance-comparison">
                      <h4>⚡ 성능 비교</h4>
                      <div class="comparison-chart" id="comparisonChart">
                        <div class="chart-bar">
                          <span class="chart-label">메인 스레드:</span>
                          <div class="chart-progress">
                            <div class="progress-bar main-thread" id="mainThreadTime">0ms</div>
                          </div>
                        </div>
                        <div class="chart-bar">
                          <span class="chart-label">워커 스레드:</span>
                          <div class="chart-progress">
                            <div class="progress-bar worker-thread" id="workerThreadTime">0ms</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Image Demo -->
                <div class="demo-panel" id="imageDemo">
                  <div class="demo-controls">
                    <h3>🖼️ 이미지 처리 데모</h3>
                    <div class="image-controls">
                      <div class="control-group">
                        <label for="imageFile">이미지 선택:</label>
                        <input type="file" id="imageFile" accept="image/*">
                        <button id="loadSampleImage" class="btn-secondary">📷 샘플 이미지</button>
                      </div>
                      <div class="control-group">
                        <label for="imageFilter">필터 타입:</label>
                        <select id="imageFilter">
                          <option value="grayscale">흑백</option>
                          <option value="blur">블러</option>
                          <option value="sharpen">선명화</option>
                          <option value="edge">엣지 검출</option>
                          <option value="emboss">엠보싱</option>
                        </select>
                      </div>
                      <div class="control-group">
                        <label for="filterIntensity">강도:</label>
                        <input type="range" id="filterIntensity" min="0" max="100" value="50">
                        <span id="intensityValue">50%</span>
                      </div>
                      <button id="processImage" class="btn-accent">🎨 이미지 처리</button>
                    </div>
                  </div>
                  
                  <div class="image-preview">
                    <div class="image-container">
                      <div class="image-section">
                        <h4>원본 이미지</h4>
                        <canvas id="originalCanvas" width="300" height="200"></canvas>
                      </div>
                      <div class="image-section">
                        <h4>처리된 이미지</h4>
                        <canvas id="processedCanvas" width="300" height="200"></canvas>
                        <div class="processing-status" id="processingStatus">
                          이미지를 선택하고 처리 버튼을 클릭하세요
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Data Demo -->
                <div class="demo-panel" id="dataDemo">
                  <div class="demo-controls">
                    <h3>📊 데이터 분석 데모</h3>
                    <div class="data-controls">
                      <div class="control-group">
                        <label for="dataSize">데이터 크기:</label>
                        <select id="dataSize">
                          <option value="1000">1천 개</option>
                          <option value="10000">1만 개</option>
                          <option value="100000">10만 개</option>
                          <option value="1000000">100만 개</option>
                        </select>
                      </div>
                      <div class="control-group">
                        <label for="analysisType">분석 타입:</label>
                        <select id="analysisType">
                          <option value="sort">정렬</option>
                          <option value="search">검색</option>
                          <option value="statistics">통계 분석</option>
                          <option value="filter">필터링</option>
                          <option value="aggregate">집계</option>
                        </select>
                      </div>
                      <div class="control-group">
                        <label for="workerCount">워커 수:</label>
                        <input type="range" id="workerCount" min="1" max="8" value="4">
                        <span id="workerCountValue">4개</span>
                      </div>
                      <button id="generateData" class="btn-secondary">📊 데이터 생성</button>
                      <button id="analyzeData" class="btn-success">🔍 분석 시작</button>
                    </div>
                  </div>
                  
                  <div class="data-results">
                    <div class="data-info">
                      <h4>📈 데이터 정보</h4>
                      <div class="info-grid" id="dataInfo">
                        <div class="info-item">
                          <span class="info-label">생성된 데이터:</span>
                          <span class="info-value" id="generatedCount">0개</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">처리 시간:</span>
                          <span class="info-value" id="processingTime">0ms</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">사용된 워커:</span>
                          <span class="info-value" id="usedWorkers">0개</span>
                        </div>
                      </div>
                    </div>
                    <div class="analysis-result">
                      <h4>🎯 분석 결과</h4>
                      <div class="result-content" id="analysisResult">
                        데이터를 생성하고 분석을 시작하세요
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Benchmark Demo -->
                <div class="demo-panel" id="benchmarkDemo">
                  <div class="demo-controls">
                    <h3>⚡ 성능 벤치마크</h3>
                    <div class="benchmark-controls">
                      <div class="test-options">
                        <h4>테스트 옵션</h4>
                        <label class="checkbox-label">
                          <input type="checkbox" id="testCPU" checked>
                          <span class="checkmark"></span>
                          CPU 집약적 작업
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" id="testMemory" checked>
                          <span class="checkmark"></span>
                          메모리 처리
                        </label>
                        <label class="checkbox-label">
                          <input type="checkbox" id="testCommunication" checked>
                          <span class="checkmark"></span>
                          통신 오버헤드
                        </label>
                      </div>
                      <div class="benchmark-settings">
                        <div class="control-group">
                          <label for="benchmarkIterations">반복 횟수:</label>
                          <input type="number" id="benchmarkIterations" value="1000" min="100" max="10000">
                        </div>
                        <div class="control-group">
                          <label for="benchmarkComplexity">복잡도:</label>
                          <select id="benchmarkComplexity">
                            <option value="low">낮음</option>
                            <option value="medium">보통</option>
                            <option value="high">높음</option>
                          </select>
                        </div>
                      </div>
                      <button id="runBenchmark" class="btn-warning">🚀 벤치마크 실행</button>
                    </div>
                  </div>
                  
                  <div class="benchmark-results">
                    <div class="benchmark-progress">
                      <h4>📊 진행 상황</h4>
                      <div class="progress-container">
                        <div class="progress-bar-container">
                          <div class="progress-bar-fill" id="benchmarkProgress"></div>
                        </div>
                        <span class="progress-text" id="benchmarkProgressText">0%</span>
                      </div>
                    </div>
                    <div class="benchmark-chart">
                      <h4>📈 결과 차트</h4>
                      <canvas id="benchmarkChart" width="400" height="250"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Real-time Monitoring -->
          <div class="monitoring-section">
            <div class="panel-card">
              <h2>📡 실시간 모니터링</h2>
              
              <div class="monitoring-grid">
                <div class="monitor-item">
                  <h4>🧵 스레드 상태</h4>
                  <div class="thread-status" id="threadStatus">
                    <div class="thread-item">
                      <span class="thread-label">메인 스레드:</span>
                      <span class="thread-indicator active" id="mainThreadStatus">활성</span>
                    </div>
                    <div class="thread-item">
                      <span class="thread-label">워커 스레드:</span>
                      <span class="thread-indicator" id="workerThreadStatus">비활성</span>
                    </div>
                  </div>
                </div>

                <div class="monitor-item">
                  <h4>💾 메모리 사용량</h4>
                  <div class="memory-usage" id="memoryUsage">
                    <div class="memory-bar">
                      <div class="memory-fill" id="memoryFill"></div>
                    </div>
                    <span class="memory-text" id="memoryText">0 MB</span>
                  </div>
                </div>

                <div class="monitor-item">
                  <h4>📊 작업 큐</h4>
                  <div class="queue-status" id="queueStatus">
                    <div class="queue-item">
                      <span class="queue-label">대기 중:</span>
                      <span class="queue-count" id="pendingTasks">0</span>
                    </div>
                    <div class="queue-item">
                      <span class="queue-label">실행 중:</span>
                      <span class="queue-count" id="runningTasks">0</span>
                    </div>
                    <div class="queue-item">
                      <span class="queue-label">완료:</span>
                      <span class="queue-count" id="completedTasks">0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="task-history">
                <h4>📋 작업 이력</h4>
                <div class="history-list" id="taskHistoryList">
                  <div class="history-placeholder">작업 이력이 여기에 표시됩니다</div>
                </div>
                <div class="history-controls">
                  <button id="clearHistory" class="btn-secondary">🗑️ 이력 삭제</button>
                  <button id="exportHistory" class="btn-accent">📤 이력 내보내기</button>
                </div>
              </div>
            </div>

            <div class="panel-card">
              <h2>🔧 고급 설정</h2>
              
              <div class="advanced-settings">
                <div class="setting-group">
                  <h4>워커 풀 설정</h4>
                  <div class="control-group">
                    <label for="maxPoolSize">최대 풀 크기:</label>
                    <input type="range" id="maxPoolSize" min="1" max="16" value="4">
                    <span id="maxPoolSizeValue">4</span>
                  </div>
                  <div class="control-group">
                    <label for="workerTimeout">워커 타임아웃 (ms):</label>
                    <input type="number" id="workerTimeout" value="30000" min="1000" max="300000">
                  </div>
                </div>

                <div class="setting-group">
                  <h4>성능 옵션</h4>
                  <label class="checkbox-label">
                    <input type="checkbox" id="enableTransferable" checked>
                    <span class="checkmark"></span>
                    Transferable Objects 사용
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="enableBatching">
                    <span class="checkmark"></span>
                    작업 배치 처리
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="enableCaching">
                    <span class="checkmark"></span>
                    결과 캐싱
                  </label>
                </div>

                <div class="setting-actions">
                  <button id="applySettings" class="btn-primary">⚙️ 설정 적용</button>
                  <button id="resetSettings" class="btn-secondary">🔄 설정 초기화</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Examples Section -->
        <section class="examples-section">
          <h2>💡 사용 예제</h2>
          
          <div class="example-tabs">
            <button class="tab-btn active" data-tab="basic">기본 사용법</button>
            <button class="tab-btn" data-tab="advanced">고급 기법</button>
            <button class="tab-btn" data-tab="optimization">성능 최적화</button>
            <button class="tab-btn" data-tab="patterns">디자인 패턴</button>
          </div>

          <div class="example-content">
            <div class="tab-content active" id="tab-basic">
              <h3>기본 워커 생성 및 사용</h3>
              <pre><code>// 워커 생성
const worker = new Worker('worker.js');

// 메시지 전송
worker.postMessage({
  command: 'calculate',
  data: [1, 2, 3, 4, 5]
});

// 메시지 수신
worker.onmessage = function(event) {
  const result = event.data;
  console.log('결과:', result);
};

// 오류 처리
worker.onerror = function(error) {
  console.error('워커 오류:', error);
};

// 워커 종료
worker.terminate();</code></pre>
            </div>

            <div class="tab-content" id="tab-advanced">
              <h3>Transferable Objects 활용</h3>
              <pre><code>// 대용량 ArrayBuffer 전송
const largeBuffer = new ArrayBuffer(1024 * 1024); // 1MB
const uint8Array = new Uint8Array(largeBuffer);

// Transferable Object로 전송 (복사가 아닌 이동)
worker.postMessage({
  command: 'processBuffer',
  buffer: largeBuffer
}, [largeBuffer]); // 두 번째 매개변수로 전송할 객체 지정

// 워커에서 데이터 처리
// worker.js
self.onmessage = function(event) {
  const { command, buffer } = event.data;
  
  if (command === 'processBuffer') {
    const data = new Uint8Array(buffer);
    // 데이터 처리...
    
    // 결과 반환 (다시 transfer)
    self.postMessage({
      result: 'processed',
      buffer: buffer
    }, [buffer]);
  }
};</code></pre>
            </div>

            <div class="tab-content" id="tab-optimization">
              <h3>워커 풀과 작업 분산</h3>
              <pre><code>class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.busyWorkers = new Set();
    
    // 워커 풀 초기화
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.id = i;
      worker.onmessage = this.handleWorkerMessage.bind(this);
      this.workers.push(worker);
    }
  }
  
  execute(task) {
    return new Promise((resolve, reject) => {
      const taskWithCallback = { ...task, resolve, reject };
      
      const availableWorker = this.getAvailableWorker();
      if (availableWorker) {
        this.assignTask(availableWorker, taskWithCallback);
      } else {
        this.taskQueue.push(taskWithCallback);
      }
    });
  }
  
  getAvailableWorker() {
    return this.workers.find(worker => !this.busyWorkers.has(worker.id));
  }
  
  assignTask(worker, task) {
    this.busyWorkers.add(worker.id);
    worker.currentTask = task;
    worker.postMessage(task);
  }
  
  handleWorkerMessage(event) {
    const worker = event.target;
    const task = worker.currentTask;
    
    this.busyWorkers.delete(worker.id);
    task.resolve(event.data);
    
    // 대기 중인 작업 처리
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.assignTask(worker, nextTask);
    }
  }
}

// 사용 예제
const pool = new WorkerPool('math-worker.js', 4);

// 병렬 처리
const tasks = [
  { operation: 'fibonacci', n: 40 },
  { operation: 'prime', limit: 10000 },
  { operation: 'factorial', n: 20 }
];

Promise.all(tasks.map(task => pool.execute(task)))
  .then(results => {
    console.log('모든 작업 완료:', results);
  });</code></pre>
            </div>

            <div class="tab-content" id="tab-patterns">
              <h3>워커 통신 패턴</h3>
              <pre><code>// 1. 요청-응답 패턴
class WorkerManager {
  constructor(workerScript) {
    this.worker = new Worker(workerScript);
    this.pendingRequests = new Map();
    this.requestId = 0;
    
    this.worker.onmessage = this.handleResponse.bind(this);
  }
  
  request(command, data) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      this.pendingRequests.set(id, { resolve, reject });
      
      this.worker.postMessage({ id, command, data });
    });
  }
  
  handleResponse(event) {
    const { id, result, error } = event.data;
    const request = this.pendingRequests.get(id);
    
    if (request) {
      this.pendingRequests.delete(id);
      if (error) {
        request.reject(new Error(error));
      } else {
        request.resolve(result);
      }
    }
  }
}

// 2. 스트리밍 패턴
class StreamingWorker {
  constructor(workerScript) {
    this.worker = new Worker(workerScript);
    this.streams = new Map();
  }
  
  createStream(command, data) {
    const streamId = Date.now();
    
    return new ReadableStream({
      start: (controller) => {
        this.streams.set(streamId, controller);
        
        this.worker.onmessage = (event) => {
          const { id, chunk, done } = event.data;
          
          if (id === streamId) {
            if (done) {
              controller.close();
              this.streams.delete(streamId);
            } else {
              controller.enqueue(chunk);
            }
          }
        };
        
        this.worker.postMessage({ streamId, command, data });
      }
    });
  }
}

// 3. 상태 동기화 패턴
class StatefulWorker {
  constructor(workerScript) {
    this.worker = new Worker(workerScript);
    this.state = {};
    this.listeners = new Set();
    
    this.worker.onmessage = this.handleStateUpdate.bind(this);
  }
  
  setState(updates) {
    this.worker.postMessage({ type: 'setState', updates });
  }
  
  handleStateUpdate(event) {
    if (event.data.type === 'stateChanged') {
      Object.assign(this.state, event.data.changes);
      this.notifyListeners();
    }
  }
  
  onStateChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }
}</code></pre>
            </div>
          </div>
        </section>

        <!-- Notifications -->
        <div id="notifications" class="notifications"></div>
      </div>
    `;

    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 워커 관리 버튼들
    const workerBtns = [
      "createWorker",
      "terminateWorker",
      "terminateAllWorkers",
      "poolStatus",
    ];
    workerBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId
            .replace("Worker", "")
            .replace("poolStatus", "status");
          this.handleWorkerAction(action);
        });
      }
    });

    // 데모 탭 버튼들
    const demoTabBtns = document.querySelectorAll(".demo-tab-btn");
    demoTabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const demo = e.target.dataset.demo;
        this.switchDemoTab(demo);
      });
    });

    // 작업 실행 버튼들
    const taskBtns = [
      "startMathTask",
      "quickDemo",
      "processImage",
      "generateData",
      "analyzeData",
      "runBenchmark",
    ];
    taskBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId
            .replace("start", "")
            .replace("Task", "")
            .toLowerCase();
          this.handleTaskAction(action);
        });
      }
    });

    // 설정 관련 버튼들
    const settingBtns = [
      "applySettings",
      "resetSettings",
      "clearHistory",
      "exportHistory",
    ];
    settingBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId.replace("Settings", "").replace("History", "");
          this.handleSettingAction(action);
        });
      }
    });

    // 슬라이더 이벤트들
    const sliders = [
      { id: "filterIntensity", target: "intensityValue", suffix: "%" },
      { id: "workerCount", target: "workerCountValue", suffix: "개" },
      { id: "maxPoolSize", target: "maxPoolSizeValue", suffix: "" },
    ];

    sliders.forEach(({ id, target, suffix }) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener("input", (e) => {
          const valueDisplay = document.getElementById(target);
          if (valueDisplay) {
            valueDisplay.textContent = `${e.target.value}${suffix}`;
          }
        });
      }
    });

    // 파일 입력 이벤트
    const imageFile = document.getElementById("imageFile");
    if (imageFile) {
      imageFile.addEventListener("change", (e) => {
        this.handleImageUpload(e);
      });
    }

    // 샘플 이미지 로드
    const loadSampleBtn = document.getElementById("loadSampleImage");
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener("click", () => {
        this.loadSampleImage();
      });
    }

    // 탭 버튼들
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabId = e.target.dataset.tab;
        this.switchTab(tabId);
      });
    });

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  setupExperimentListeners() {
    // 실험 버튼들
    const blockingBtn = document.getElementById("blockingTest");
    const nonBlockingBtn = document.getElementById("nonBlockingTest");
    const animationBtn = document.getElementById("animationToggle");

    if (blockingBtn) {
      blockingBtn.addEventListener("click", () => this.runBlockingTest());
    }

    if (nonBlockingBtn) {
      nonBlockingBtn.addEventListener("click", () => this.runNonBlockingTest());
    }

    if (animationBtn) {
      animationBtn.addEventListener("click", () => this.toggleAnimation());
    }

    console.log("🧪 실험 이벤트 리스너 설정 완료");
  }

  toggleAnimation() {
    const animationBtn = document.getElementById("animationToggle");
    const spinningBox = document.getElementById("spinningBox");

    if (this.animationActive) {
      // 애니메이션 정지
      clearInterval(this.animationInterval);
      this.animationActive = false;
      animationBtn.textContent = "🎪 애니메이션 시작";
      spinningBox.style.animation = "none";
      this.updateThreadStatus("애니메이션 정지됨");
    } else {
      // 애니메이션 시작
      this.animationActive = true;
      animationBtn.textContent = "⏹️ 애니메이션 정지";
      spinningBox.style.animation = "spin 1s linear infinite";
      this.updateThreadStatus("애니메이션 실행 중");

      // 부드러운 회전을 위한 추가 애니메이션
      let rotation = 0;
      this.animationInterval = setInterval(() => {
        rotation += 5;
        if (rotation >= 360) rotation = 0;
      }, 16); // 60fps
    }
  }

  updateThreadStatus(status) {
    const statusElement = document.getElementById("threadStatus");
    if (statusElement) {
      statusElement.textContent = `메인 스레드 상태: ${status}`;
    }
  }

  updateExperimentOutput(message) {
    const output = document.getElementById("experimentOutput");
    if (output) {
      output.innerHTML += `<div class="experiment-log">${new Date().toLocaleTimeString()}: ${message}</div>`;
      output.scrollTop = output.scrollHeight;
    }
  }

  async runBlockingTest() {
    this.updateThreadStatus("🔥 블록킹 계산 중... (메인 스레드 정지!)");
    this.updateExperimentOutput(
      "❌ <strong>블록킹 테스트 시작</strong> - 메인 스레드에서 무거운 계산"
    );

    const startTime = performance.now();

    // 메인 스레드를 블록하는 무거운 계산
    let result = 0;
    for (let i = 0; i < 200000000; i++) {
      result += Math.sqrt(i) * Math.sin(i / 1000) * Math.cos(i / 2000);
    }

    const endTime = performance.now();

    this.updateThreadStatus("계산 완료 - 메인 스레드 정상");
    this.updateExperimentOutput(
      `❌ 블록킹 테스트 완료: ${(endTime - startTime).toFixed(2)}ms`
    );
    this.updateExperimentOutput(
      "🚨 <strong>결과:</strong> 계산 중 애니메이션이 멈췄나요? (메인 스레드 블록됨)"
    );
  }

  async runNonBlockingTest() {
    this.updateThreadStatus("✅ 워커에서 계산 중... (메인 스레드 자유!)");
    this.updateExperimentOutput(
      "✅ <strong>멀티스레드 테스트 시작</strong> - 워커에서 무거운 계산"
    );

    if (this.workerPool.length === 0) {
      this.updateExperimentOutput("⚠️ 워커가 없습니다! 먼저 워커를 생성하세요");
      return;
    }

    const startTime = performance.now();

    try {
      const result = await this.executeTask({
        command: "heavyCalculation",
        data: { iterations: 200000000 },
      });

      const endTime = performance.now();

      this.updateThreadStatus("계산 완료 - 멀티스레드 성공");
      this.updateExperimentOutput(
        `✅ 멀티스레드 테스트 완료: ${(endTime - startTime).toFixed(2)}ms`
      );
      this.updateExperimentOutput(
        "🎉 <strong>결과:</strong> 애니메이션이 계속 실행됐나요? (메인 스레드 자유!)"
      );
    } catch (error) {
      this.updateExperimentOutput(`❌ 오류: ${error.message}`);
    }
  }

  initializeWorkerPool() {
    console.log("🏊‍♂️ 워커 풀 초기화 중...");

    // 기본 워커 2개만 생성 (너무 많이 생성하지 않음)
    for (let i = 0; i < 2; i++) {
      this.createPoolWorker();
    }

    this.updateWorkerList();
    this.updateStats();

    console.log(`✅ 워커 풀 초기화 완료 (2개)`);

    // 사용법 안내
    setTimeout(() => {
      this.showNotification(
        "🎯 사용법: 1️⃣ 워커 생성 → 2️⃣ 수학 계산 탭에서 테스트!",
        "info"
      );
    }, 1000);
  }

  createPoolWorker() {
    const workerId = `pool-worker-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 워커 스크립트를 인라인으로 생성
    const workerScript = this.createWorkerScript();
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);

    const worker = new Worker(workerUrl);
    worker.id = workerId;
    worker.busy = false;
    worker.taskCount = 0;
    worker.createdAt = Date.now();
    worker.blobUrl = workerUrl; // URL 추적을 위해 저장

    worker.onmessage = (event) => {
      this.handleWorkerMessage(worker, event);
    };

    worker.onerror = (error) => {
      this.handleWorkerError(worker, error);
    };

    this.workerPool.push(worker);
    return worker;
  }

  createWorkerScript() {
    return `
      // 워커 스크립트
      let workerState = {
        id: null,
        taskCount: 0,
        startTime: Date.now()
      };

      // 메시지 핸들러
      self.onmessage = function(event) {
        const { id, command, data, type } = event.data;
        
        try {
          let result;
          
          switch (command) {
            case 'ping':
              result = { pong: true, timestamp: Date.now() };
              break;
              
            case 'math':
              result = handleMathOperation(data);
              break;
              
            case 'imageProcessing':
              result = handleImageProcessing(data);
              break;
              
            case 'dataAnalysis':
              result = handleDataAnalysis(data);
              break;
              
            case 'generateData':
              result = handleDataGeneration(data);
              break;
              
            case 'benchmark':
              result = handleBenchmark(data);
              break;
              
            case 'heavyCalculation':
              result = handleHeavyCalculation(data);
              break;
              
            default:
              throw new Error('Unknown command: ' + command);
          }
          
          workerState.taskCount++;
          
          self.postMessage({
            id: id,
            result: result,
            timestamp: Date.now(),
            workerId: workerState.id
          });
          
        } catch (error) {
          self.postMessage({
            id: id,
            error: error.message,
            timestamp: Date.now(),
            workerId: workerState.id
          });
        }
      };

      // 수학 연산 처리
      function handleMathOperation(data) {
        const { operation, input } = data;
        
        switch (operation) {
          case 'prime':
            return findPrimes(input);
          case 'fibonacci':
            return fibonacci(input);
          case 'factorial':
            return factorial(input);
          case 'pi':
            return calculatePi(input);
          case 'matrix':
            return matrixMultiply(input.a, input.b);
          default:
            throw new Error('Unknown math operation: ' + operation);
        }
      }

      // 소수 찾기
      function findPrimes(limit) {
        const primes = [];
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;
        
        for (let i = 2; i * i <= limit; i++) {
          if (sieve[i]) {
            for (let j = i * i; j <= limit; j += i) {
              sieve[j] = false;
            }
          }
        }
        
        for (let i = 2; i <= limit; i++) {
          if (sieve[i]) primes.push(i);
        }
        
        return { primes: primes.slice(0, 100), count: primes.length };
      }

      // 피보나치 수열
      function fibonacci(n) {
        if (n <= 1) return n;
        
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
          [a, b] = [b, a + b];
        }
        return b;
      }

      // 팩토리얼
      function factorial(n) {
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result;
      }

      // 원주율 계산 (라이프니츠 공식)
      function calculatePi(iterations) {
        let pi = 0;
        let sign = 1;
        
        for (let i = 0; i < iterations; i++) {
          pi += sign / (2 * i + 1);
          sign *= -1;
        }
        
        return pi * 4;
      }

      // 행렬 곱셈
      function matrixMultiply(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
          result[i] = [];
          for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < b.length; k++) {
              sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
          }
        }
        return result;
      }

      // 이미지 처리
      function handleImageProcessing(data) {
        const { filter, intensity, imageData } = data;
        
        switch (filter) {
          case 'grayscale':
            return applyGrayscale(imageData, intensity);
          case 'blur':
            return applyBlur(imageData, intensity);
          case 'sharpen':
            return applySharpen(imageData, intensity);
          default:
            throw new Error('Unknown image filter: ' + filter);
        }
      }

      // 흑백 필터
      function applyGrayscale(imageData, intensity) {
        const data = imageData.data;
        const factor = intensity / 100;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = data[i] * (1 - factor) + gray * factor;
          data[i + 1] = data[i + 1] * (1 - factor) + gray * factor;
          data[i + 2] = data[i + 2] * (1 - factor) + gray * factor;
        }
        
        return imageData;
      }

      // 데이터 처리
      function handleDataProcessing(data) {
        const { type, dataset, options } = data;
        
        switch (type) {
          case 'sort':
            return sortData(dataset, options);
          case 'search':
            return searchData(dataset, options);
          case 'statistics':
            return calculateStatistics(dataset);
          case 'filter':
            return filterData(dataset, options);
          case 'aggregate':
            return aggregateData(dataset, options);
          default:
            throw new Error('Unknown data operation: ' + type);
        }
      }

      // 데이터 정렬
      function sortData(data, options) {
        const startTime = performance.now();
        const sorted = [...data].sort((a, b) => a - b);
        const endTime = performance.now();
        
        return {
          sorted: sorted.slice(0, 100), // 샘플만 반환
          time: endTime - startTime,
          length: sorted.length
        };
      }

      // 통계 계산
      function calculateStatistics(data) {
        const sum = data.reduce((a, b) => a + b, 0);
        const mean = sum / data.length;
        const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);
        
        return {
          count: data.length,
          sum: sum,
          mean: mean,
          min: Math.min(...data),
          max: Math.max(...data),
          stdDev: stdDev
        };
      }

      // 데이터 분석 처리
      function handleDataAnalysis(data) {
        const { type, size } = data;
        
        // 테스트 데이터 생성
        const testData = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
        
        switch (type) {
          case 'sort':
            const sorted = [...testData].sort((a, b) => a - b);
            return { type: 'sort', original: testData.slice(0, 10), sorted: sorted.slice(0, 10), size };
            
          case 'filter':
            const filtered = testData.filter(x => x > 500);
            return { type: 'filter', count: filtered.length, sample: filtered.slice(0, 10) };
            
          case 'reduce':
            const sum = testData.reduce((a, b) => a + b, 0);
            const avg = sum / testData.length;
            return { type: 'reduce', sum, average: avg.toFixed(2), count: testData.length };
            
          default:
            return { error: '알 수 없는 분석 타입' };
        }
      }
      
      // 데이터 생성 처리
      function handleDataGeneration(data) {
        const { size } = data;
        
        const generatedData = Array.from({ length: size }, (_, i) => ({
          id: i + 1,
          value: Math.floor(Math.random() * 1000),
          category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          timestamp: Date.now() + i
        }));
        
        return { 
          length: generatedData.length, 
          sample: generatedData.slice(0, 5),
          stats: {
            avgValue: generatedData.reduce((sum, item) => sum + item.value, 0) / generatedData.length,
            categories: ['A', 'B', 'C'].map(cat => ({
              name: cat,
              count: generatedData.filter(item => item.category === cat).length
            }))
          }
        };
      }

      // 벤치마크 처리
      function handleBenchmark(data) {
        const { type, iterations, complexity } = data;
        const results = {};
        
        // CPU 테스트
        if (type.includes('cpu')) {
          const startTime = performance.now();
          let sum = 0;
          for (let i = 0; i < iterations; i++) {
            sum += Math.sqrt(i) * Math.sin(i);
          }
          results.cpu = {
            time: performance.now() - startTime,
            result: sum
          };
        }
        
        // 메모리 테스트
        if (type.includes('memory')) {
          const startTime = performance.now();
          const array = new Array(iterations).fill(0).map((_, i) => i);
          const processed = array.map(x => x * 2).filter(x => x % 2 === 0);
          results.memory = {
            time: performance.now() - startTime,
            length: processed.length
          };
        }
        
        return results;
      }
      
      // 무거운 계산 (실험용)
      function handleHeavyCalculation(data) {
        const { iterations } = data;
        
        console.log(\`워커에서 무거운 계산 시작: \${iterations}번 반복\`);
        
        let result = 0;
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          result += Math.sqrt(i) * Math.sin(i / 1000) * Math.cos(i / 2000);
          
          // 진행률 보고 (매 100만번마다)
          if (i % 1000000 === 0 && i > 0) {
            console.log(\`워커 계산 진행률: \${((i / iterations) * 100).toFixed(1)}%\`);
          }
        }
        
        const endTime = performance.now();
        
        return {
          result: result,
          iterations: iterations,
          duration: endTime - startTime,
          averagePerIteration: (endTime - startTime) / iterations,
          message: '워커에서 계산 완료!'
        };
      }
    `;
  }

  // Worker Management Methods
  handleWorkerAction(action) {
    switch (action) {
      case "create":
        this.createNewWorker();
        break;
      case "terminate":
        this.terminateSelectedWorker();
        break;
      case "terminateAll":
        this.terminateAllWorkers();
        break;
      case "status":
        this.showPoolStatus();
        break;
    }
  }

  createNewWorker() {
    const workerType = document.getElementById("workerType").value;

    if (this.workerPool.length >= this.maxPoolSize) {
      this.showNotification("워커 풀이 가득 찼습니다 (최대 4개)", "warning");
      return;
    }

    const worker = this.createPoolWorker();
    worker.type = workerType;

    this.updateWorkerList();
    this.updateStats();

    this.showNotification(
      `✅ ${workerType} 워커가 생성되었습니다! (총 ${this.workerPool.length}개)`,
      "success"
    );

    // 첫 번째 워커 생성 시 사용법 안내
    if (this.workerPool.length === 1) {
      setTimeout(() => {
        this.showNotification(
          "💡 이제 '수학 계산' 탭에서 '빠른 데모' 버튼을 눌러보세요!",
          "info"
        );
      }, 2000);
    }
  }

  terminateSelectedWorker() {
    if (this.workerPool.length === 0) {
      this.showNotification("종료할 워커가 없습니다", "warning");
      return;
    }

    // 가장 오래된 워커부터 종료 (FIFO)
    const worker = this.workerPool.shift();

    // 진행 중인 작업이 있다면 먼저 완료 처리
    if (worker.currentTask) {
      worker.currentTask.reject(new Error("워커가 종료되었습니다"));
      clearTimeout(worker.timeout);
    }

    // 워커 종료
    worker.terminate();

    // URL 객체 해제
    if (worker.blobUrl) {
      URL.revokeObjectURL(worker.blobUrl);
    }

    this.updateWorkerList();
    this.updateStats();

    this.showNotification(
      `워커가 종료되었습니다 (남은 워커: ${this.workerPool.length}개)`,
      "info"
    );
  }

  terminateAllWorkers() {
    const workerCount = this.workerPool.length;

    this.workerPool.forEach((worker) => {
      // 진행 중인 작업이 있다면 먼저 완료 처리
      if (worker.currentTask) {
        worker.currentTask.reject(new Error("모든 워커가 종료되었습니다"));
        clearTimeout(worker.timeout);
      }

      // 워커 종료
      worker.terminate();

      // URL 객체 해제
      if (worker.blobUrl) {
        URL.revokeObjectURL(worker.blobUrl);
      }
    });

    this.workerPool = [];
    this.taskQueue = []; // 대기 중인 작업도 모두 취소

    this.updateWorkerList();
    this.updateStats();

    this.showNotification(
      `모든 워커가 종료되었습니다 (${workerCount}개)`,
      "info"
    );
  }

  showPoolStatus() {
    const status = {
      total: this.workerPool.length,
      busy: this.workerPool.filter((w) => w.busy).length,
      idle: this.workerPool.filter((w) => !w.busy).length,
      queueLength: this.taskQueue.length,
    };

    this.showNotification(
      `워커 풀 상태: 총 ${status.total}개, 사용 중 ${status.busy}개, 대기 중 ${status.idle}개, 큐 ${status.queueLength}개`,
      "info"
    );
  }

  // Task Execution Methods
  handleTaskAction(action) {
    switch (action) {
      case "math":
        this.executeMathTask();
        break;
      case "quickdemo":
        this.runQuickDemo();
        break;
      case "processimage":
        this.executeImageTask();
        break;
      case "generatedata":
        this.generateTestData();
        break;
      case "analyzedata":
        this.executeDataAnalysis();
        break;
      case "runbenchmark":
        this.executeBenchmark();
        break;
    }
  }

  async runQuickDemo() {
    this.showNotification("🚀 빠른 데모 시작! 소수 찾기를 실행합니다", "info");

    // 데모용 설정
    document.getElementById("mathOperation").value = "prime";
    document.getElementById("mathInput").value = "5000";
    document.getElementById("useWorker").checked = true;

    // 1초 후 자동 실행
    setTimeout(() => {
      this.executeMathTask();
    }, 1000);
  }

  async executeMathTask() {
    const operation = document.getElementById("mathOperation").value;
    const input = parseInt(document.getElementById("mathInput").value);
    const useWorker = document.getElementById("useWorker").checked;

    // 워커 사용 시 워커가 있는지 확인
    if (useWorker && this.workerPool.length === 0) {
      this.showNotification(
        "워커가 없습니다! 먼저 '워커 생성' 버튼을 클릭하세요",
        "warning"
      );
      return;
    }

    const resultDiv = document.getElementById("mathResult");
    resultDiv.textContent = "계산 중...";

    const startTime = performance.now();

    try {
      let result;

      if (useWorker) {
        // 워커에서 실행
        result = await this.executeTask({
          command: "math",
          data: { operation, input },
        });

        const workerTime = performance.now() - startTime;
        document.getElementById(
          "workerThreadTime"
        ).textContent = `${workerTime.toFixed(2)}ms`;

        // 메인 스레드에서도 실행 (비교용)
        const mainStartTime = performance.now();
        const mainResult = this.executeMathOnMainThread(operation, input);
        const mainTime = performance.now() - mainStartTime;
        document.getElementById(
          "mainThreadTime"
        ).textContent = `${mainTime.toFixed(2)}ms`;
      } else {
        // 메인 스레드에서만 실행
        result = this.executeMathOnMainThread(operation, input);
        const mainTime = performance.now() - startTime;
        document.getElementById(
          "mainThreadTime"
        ).textContent = `${mainTime.toFixed(2)}ms`;
        document.getElementById("workerThreadTime").textContent = "사용 안함";
      }

      // 결과 표시
      this.displayMathResult(result, operation);
      this.recordTask("math", performance.now() - startTime, true);
    } catch (error) {
      resultDiv.textContent = `오류: ${error.message}`;
      this.recordTask("math", performance.now() - startTime, false);
      this.showNotification("계산 중 오류가 발생했습니다", "error");
    }
  }

  executeMathOnMainThread(operation, input) {
    switch (operation) {
      case "prime":
        return this.findPrimes(input);
      case "fibonacci":
        return this.fibonacci(input);
      case "factorial":
        return this.factorial(input);
      case "pi":
        return this.calculatePi(input);
      default:
        throw new Error("지원하지 않는 연산입니다");
    }
  }

  findPrimes(limit) {
    const primes = [];
    const sieve = new Array(limit + 1).fill(true);
    sieve[0] = sieve[1] = false;

    for (let i = 2; i * i <= limit; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= limit; j += i) {
          sieve[j] = false;
        }
      }
    }

    for (let i = 2; i <= limit; i++) {
      if (sieve[i]) primes.push(i);
    }

    return { primes: primes.slice(0, 100), count: primes.length };
  }

  fibonacci(n) {
    if (n <= 1) return n;

    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  calculatePi(iterations) {
    let pi = 0;
    let sign = 1;

    for (let i = 0; i < iterations; i++) {
      pi += sign / (2 * i + 1);
      sign *= -1;
    }

    return pi * 4;
  }

  displayMathResult(result, operation) {
    const resultDiv = document.getElementById("mathResult");

    let displayText = "";
    switch (operation) {
      case "prime":
        displayText = `${
          result.count
        }개의 소수를 찾았습니다. 예시: ${result.primes
          .slice(0, 10)
          .join(", ")}...`;
        break;
      case "fibonacci":
        displayText = `피보나치 수: ${result}`;
        break;
      case "factorial":
        displayText = `팩토리얼 결과: ${result}`;
        break;
      case "pi":
        displayText = `계산된 π 값: ${result}`;
        break;
      default:
        displayText = JSON.stringify(result);
    }

    resultDiv.textContent = displayText;
  }

  async executeTask(task) {
    return new Promise((resolve, reject) => {
      const taskId = `task-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const availableWorker = this.getAvailableWorker();
      if (!availableWorker) {
        // 큐에 추가
        this.taskQueue.push({ ...task, taskId, resolve, reject });
        this.processTaskQueue();
        return;
      }

      // 워커에 작업 할당
      availableWorker.busy = true;
      availableWorker.currentTask = { taskId, resolve, reject };

      // 타임아웃 설정
      const timeout = setTimeout(() => {
        availableWorker.busy = false;
        delete availableWorker.currentTask;
        reject(new Error("작업 타임아웃"));
      }, 30000);

      availableWorker.timeout = timeout;
      availableWorker.postMessage({ id: taskId, ...task });
    });
  }

  getAvailableWorker() {
    return this.workerPool.find((worker) => !worker.busy);
  }

  handleWorkerMessage(worker, event) {
    const { id, result, error } = event.data;

    if (worker.currentTask && worker.currentTask.taskId === id) {
      clearTimeout(worker.timeout);
      worker.busy = false;
      worker.taskCount++;

      const task = worker.currentTask;
      delete worker.currentTask;

      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }

      // 대기 중인 작업 처리
      this.processTaskQueue();
      this.updateStats();
    }
  }

  handleWorkerError(worker, error) {
    console.error("워커 오류:", error);

    if (worker.currentTask) {
      worker.currentTask.reject(error);
      delete worker.currentTask;
    }

    worker.busy = false;
    this.performanceStats.errorCount++;
    this.updateStats();

    this.showNotification("워커에서 오류가 발생했습니다", "error");
  }

  processTaskQueue() {
    if (this.isProcessingQueue || this.taskQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.taskQueue.length > 0) {
      const availableWorker = this.getAvailableWorker();
      if (!availableWorker) break;

      const task = this.taskQueue.shift();

      availableWorker.busy = true;
      availableWorker.currentTask = {
        taskId: task.taskId,
        resolve: task.resolve,
        reject: task.reject,
      };

      const timeout = setTimeout(() => {
        availableWorker.busy = false;
        delete availableWorker.currentTask;
        task.reject(new Error("작업 타임아웃"));
      }, 30000);

      availableWorker.timeout = timeout;
      availableWorker.postMessage({
        id: task.taskId,
        command: task.command,
        data: task.data,
      });
    }

    this.isProcessingQueue = false;
  }

  recordTask(type, duration, success) {
    const task = {
      type,
      duration,
      success,
      timestamp: Date.now(),
    };

    this.taskHistory.push(task);

    // 통계 업데이트
    this.performanceStats.totalTasks++;
    if (success) {
      this.performanceStats.averageTime =
        (this.performanceStats.averageTime *
          (this.performanceStats.totalTasks - 1) +
          duration) /
        this.performanceStats.totalTasks;
    } else {
      this.performanceStats.errorCount++;
    }

    this.performanceStats.successRate =
      ((this.performanceStats.totalTasks - this.performanceStats.errorCount) /
        this.performanceStats.totalTasks) *
      100;

    this.updateStats();
    this.updateTaskHistory();
  }

  // Demo Tab Methods
  switchDemoTab(demo) {
    document.querySelectorAll(".demo-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.demo === demo) {
        btn.classList.add("active");
      }
    });

    document.querySelectorAll(".demo-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    const targetPanel = document.getElementById(`${demo}Demo`);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  }

  // UI Update Methods
  updateWorkerList() {
    const workerList = document.getElementById("workerList");
    if (!workerList) return;

    if (this.workerPool.length === 0) {
      workerList.innerHTML =
        '<div class="list-placeholder">활성 워커가 없습니다</div>';
      return;
    }

    workerList.innerHTML = this.workerPool
      .map(
        (worker, index) => `
      <div class="worker-item">
        <div class="worker-info">
          <span class="worker-id">워커 #${index + 1}</span>
          <span class="worker-status ${worker.busy ? "busy" : "idle"}">
            ${worker.busy ? "사용 중" : "대기 중"}
          </span>
        </div>
        <div class="worker-stats">
          <span class="worker-tasks">작업: ${worker.taskCount}</span>
          <span class="worker-uptime">
            가동: ${Math.floor((Date.now() - worker.createdAt) / 1000)}초
          </span>
        </div>
      </div>
    `
      )
      .join("");
  }

  updateStats() {
    const elements = {
      totalTasks: document.getElementById("totalTasks"),
      averageTime: document.getElementById("averageTime"),
      successRate: document.getElementById("successRate"),
      errorCount: document.getElementById("errorCount"),
      queueLength: document.getElementById("queueLength"),
      poolSize: document.getElementById("poolSize"),
    };

    if (elements.totalTasks)
      elements.totalTasks.textContent = this.performanceStats.totalTasks;
    if (elements.averageTime)
      elements.averageTime.textContent = `${this.performanceStats.averageTime.toFixed(
        2
      )}ms`;
    if (elements.successRate)
      elements.successRate.textContent = `${this.performanceStats.successRate.toFixed(
        1
      )}%`;
    if (elements.errorCount)
      elements.errorCount.textContent = this.performanceStats.errorCount;
    if (elements.queueLength)
      elements.queueLength.textContent = this.taskQueue.length;
    if (elements.poolSize)
      elements.poolSize.textContent = this.workerPool.length;

    // 메모리 사용량 업데이트
    if (performance.memory) {
      const memoryMB = Math.round(
        performance.memory.usedJSHeapSize / 1024 / 1024
      );
      const memoryText = document.getElementById("memoryText");
      if (memoryText) memoryText.textContent = `${memoryMB} MB`;

      const memoryFill = document.getElementById("memoryFill");
      if (memoryFill) {
        const percentage = Math.min(100, (memoryMB / 100) * 100);
        memoryFill.style.width = `${percentage}%`;
      }
    }
  }

  updateTaskHistory() {
    const historyList = document.getElementById("taskHistoryList");
    if (!historyList) return;

    if (this.taskHistory.length === 0) {
      historyList.innerHTML =
        '<div class="history-placeholder">작업 이력이 여기에 표시됩니다</div>';
      return;
    }

    const recentTasks = this.taskHistory.slice(-10).reverse();
    historyList.innerHTML = recentTasks
      .map(
        (task) => `
      <div class="history-item ${task.success ? "success" : "error"}">
        <div class="task-info">
          <span class="task-type">${task.type}</span>
          <span class="task-duration">${task.duration.toFixed(2)}ms</span>
          <span class="task-status">${task.success ? "✅" : "❌"}</span>
        </div>
        <div class="task-time">${new Date(
          task.timestamp
        ).toLocaleTimeString()}</div>
      </div>
    `
      )
      .join("");
  }

  switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    document.getElementById(`tab-${tabId}`).classList.add("active");
  }

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
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Data Analysis Task
  async executeDataAnalysis() {
    const dataSize = parseInt(
      document.getElementById("dataSize")?.value || "1000"
    );
    const analysisType =
      document.getElementById("analysisType")?.value || "sort";

    try {
      if (this.workerPool.length === 0) {
        this.showNotification(
          "워커가 없습니다! 먼저 워커를 생성하세요",
          "warning"
        );
        return;
      }

      this.showNotification(
        `${analysisType} 데이터 분석을 시작합니다 (${dataSize}개 항목)`,
        "info"
      );

      const result = await this.executeTask({
        command: "dataAnalysis",
        data: { type: analysisType, size: dataSize },
      });

      const resultDiv = document.getElementById("dataResult");
      if (resultDiv) {
        resultDiv.textContent = `분석 완료: ${JSON.stringify(result).substring(
          0,
          100
        )}...`;
      }

      this.showNotification("데이터 분석이 완료되었습니다", "success");
      this.recordTask("dataAnalysis", performance.now() - Date.now(), true);
    } catch (error) {
      console.error("데이터 분석 오류:", error);
      this.showNotification(`데이터 분석 오류: ${error.message}`, "error");
      this.recordTask("dataAnalysis", 0, false);
    }
  }

  // Benchmark Task
  async executeBenchmark() {
    try {
      if (this.workerPool.length === 0) {
        this.showNotification(
          "워커가 없습니다! 먼저 워커를 생성하세요",
          "warning"
        );
        return;
      }

      this.showNotification("성능 벤치마크를 시작합니다...", "info");

      const benchmarks = [
        {
          name: "소수 찾기",
          command: "math",
          data: { operation: "prime", input: 5000 },
        },
        {
          name: "피보나치",
          command: "math",
          data: { operation: "fibonacci", input: 35 },
        },
        {
          name: "팩토리얼",
          command: "math",
          data: { operation: "factorial", input: 15 },
        },
      ];

      const results = [];

      for (const benchmark of benchmarks) {
        const startTime = performance.now();

        try {
          await this.executeTask(benchmark);
          const duration = performance.now() - startTime;
          results.push({
            name: benchmark.name,
            duration: duration.toFixed(2),
            success: true,
          });
        } catch (error) {
          results.push({
            name: benchmark.name,
            duration: "실패",
            success: false,
          });
        }
      }

      const resultDiv = document.getElementById("benchmarkResult");
      if (resultDiv) {
        const resultText = results
          .map((r) => `${r.name}: ${r.duration}${r.success ? "ms" : ""}`)
          .join(", ");
        resultDiv.textContent = `벤치마크 결과: ${resultText}`;
      }

      this.showNotification("벤치마크가 완료되었습니다", "success");
      this.recordTask("benchmark", performance.now() - Date.now(), true);
    } catch (error) {
      console.error("벤치마크 오류:", error);
      this.showNotification(`벤치마크 오류: ${error.message}`, "error");
      this.recordTask("benchmark", 0, false);
    }
  }

  // Generate test data for analysis
  async generateTestData() {
    try {
      if (this.workerPool.length === 0) {
        this.showNotification(
          "워커가 없습니다! 먼저 워커를 생성하세요",
          "warning"
        );
        return;
      }

      const dataSize = parseInt(
        document.getElementById("dataSize")?.value || "1000"
      );
      this.showNotification(
        `${dataSize}개의 테스트 데이터를 생성합니다...`,
        "info"
      );

      const result = await this.executeTask({
        command: "generateData",
        data: { size: dataSize },
      });

      const resultDiv = document.getElementById("dataResult");
      if (resultDiv) {
        resultDiv.textContent = `데이터 생성 완료: ${result.length}개 항목`;
      }

      this.showNotification("테스트 데이터 생성이 완료되었습니다", "success");
      this.recordTask("generateData", performance.now() - Date.now(), true);
    } catch (error) {
      console.error("데이터 생성 오류:", error);
      this.showNotification(`데이터 생성 오류: ${error.message}`, "error");
      this.recordTask("generateData", 0, false);
    }
  }

  // Image processing task
  async executeImageTask() {
    try {
      if (this.workerPool.length === 0) {
        this.showNotification(
          "워커가 없습니다! 먼저 워커를 생성하세요",
          "warning"
        );
        return;
      }

      const filterType = document.getElementById("filterType")?.value || "blur";
      const intensity = parseInt(
        document.getElementById("filterIntensity")?.value || "50"
      );

      this.showNotification(
        `${filterType} 이미지 필터를 적용합니다...`,
        "info"
      );

      // 간단한 이미지 데이터 생성 (실제로는 Canvas에서 가져옴)
      const imageData = new Uint8ClampedArray(100 * 100 * 4); // 100x100 RGBA
      for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = Math.random() * 255; // R
        imageData[i + 1] = Math.random() * 255; // G
        imageData[i + 2] = Math.random() * 255; // B
        imageData[i + 3] = 255; // A
      }

      const result = await this.executeTask({
        command: "imageProcessing",
        data: { filterType, intensity, imageData: Array.from(imageData) },
      });

      const resultDiv = document.getElementById("imageResult");
      if (resultDiv) {
        resultDiv.textContent = `이미지 처리 완료: ${filterType} 필터 적용됨`;
      }

      this.showNotification("이미지 처리가 완료되었습니다", "success");
      this.recordTask("imageProcessing", performance.now() - Date.now(), true);
    } catch (error) {
      console.error("이미지 처리 오류:", error);
      this.showNotification(`이미지 처리 오류: ${error.message}`, "error");
      this.recordTask("imageProcessing", 0, false);
    }
  }
}

// 전역 접근을 위한 설정
window.webWorkerAPI = null;

// 초기화
function initWebWorkerAPI() {
  console.log("🚀 WebWorker API 초기화 함수 호출");
  window.webWorkerAPI = new WebWorkerAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initWebWorkerAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initWebWorkerAPI();
}

console.log(
  "📄 WebWorker (Dedicated Worker) 스크립트 로드 완료, readyState:",
  document.readyState
);
