import "./style.css";

console.log("🌊 Stream API 스크립트 시작!");

class StreamAPI {
  constructor() {
    this.streams = new Map();
    this.transforms = new Map();
    this.readers = new Map();
    this.writers = new Map();
    this.controllers = new Map();
    this.viewerPaused = false;
    this.abortController = null;
    this.streamStats = {
      totalStreams: 0,
      activeStreams: 0,
      bytesProcessed: 0,
      chunksProcessed: 0,
    };
    this.init();
  }

  init() {
    console.log("🌊 Stream API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.initializePresets();
    this.updateStats();
    console.log("✅ Stream API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Stream API 지원 여부 확인 중...");

    const support = {
      readableStream: typeof ReadableStream !== "undefined",
      writableStream: typeof WritableStream !== "undefined",
      transformStream: typeof TransformStream !== "undefined",
      textEncoder: typeof TextEncoder !== "undefined",
      textDecoder: typeof TextDecoder !== "undefined",
      compressionStream: typeof CompressionStream !== "undefined",
      decompressionStream: typeof DecompressionStream !== "undefined",
      fetch: typeof fetch !== "undefined",
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="stream-container">
        <header class="stream-header">
          <h1>🌊 Stream API</h1>
          <p>ReadableStream, WritableStream, TransformStream의 모든 기능을 체험하세요</p>
          <div style="margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="quickTest" class="btn-primary">🚀 청크 처리 테스트</button>
            <button id="fileStreamTest" class="btn-info">📁 파일 스트림 테스트</button>
            <button id="fetchStreamTest" class="btn-success">🌐 Fetch 스트림 테스트</button>
          </div>
          <div class="api-support">
            <div class="support-badge ${
              support.readableStream ? "supported" : "unsupported"
            }">
              ${
                support.readableStream
                  ? "✅ ReadableStream"
                  : "❌ ReadableStream"
              }
            </div>
            <div class="support-badge ${
              support.writableStream ? "supported" : "unsupported"
            }">
              ${
                support.writableStream
                  ? "✅ WritableStream"
                  : "❌ WritableStream"
              }
            </div>
            <div class="support-badge ${
              support.transformStream ? "supported" : "unsupported"
            }">
              ${
                support.transformStream
                  ? "✅ TransformStream"
                  : "❌ TransformStream"
              }
            </div>
            <div class="support-badge ${
              support.textEncoder ? "supported" : "unsupported"
            }">
              ${support.textEncoder ? "✅ TextEncoder" : "❌ TextEncoder"}
            </div>
            <div class="support-badge ${
              support.compressionStream ? "supported" : "unsupported"
            }">
              ${
                support.compressionStream
                  ? "✅ CompressionStream"
                  : "❌ CompressionStream"
              }
            </div>
          </div>
        </header>

        <main class="stream-main">
          <!-- 스트림 데이터 뷰어 - 상단으로 이동 -->
          <div class="panel-card">
            <h2>👁️ 스트림 데이터 뷰어 (실시간)</h2>
            
            <div class="viewer-section">
              <div class="viewer-controls">
                <div class="control-group">
                  <button id="clearViewer" class="btn-warning">🗑️ 뷰어 지우기</button>
                  <button id="pauseViewer" class="btn-secondary">⏸️ 뷰어 일시정지</button>
                </div>
              </div>
              
              <div class="data-viewer" id="dataViewer" style="max-height: 200px; min-height: 150px;">
                <div class="viewer-placeholder">🌊 스트림 데이터가 여기에 실시간으로 표시됩니다! 위의 테스트 버튼을 눌러보세요!</div>
              </div>
            </div>
          </div>

          <!-- 스트림 생성 & 제어 -->
          <div class="panel-card primary">
            <h2>🚀 스트림 생성 & 제어</h2>
            
            <div class="stream-creator">
              <div class="creator-tabs">
                <button class="creator-tab-btn active" data-tab="readable">📖 ReadableStream</button>
                <button class="creator-tab-btn" data-tab="writable">✍️ WritableStream</button>
                <button class="creator-tab-btn" data-tab="transform">🔄 TransformStream</button>
                <button class="creator-tab-btn" data-tab="fetch">🌐 Fetch Stream</button>
              </div>

              <div class="creator-content">
                <!-- ReadableStream 생성 -->
                <div class="creator-panel active" id="readable">
                  <h3>📖 ReadableStream 생성</h3>
                  <div class="stream-options">
                    <div class="option-group">
                      <label for="readableType">스트림 타입:</label>
                      <select id="readableType">
                        <option value="text">텍스트 스트림</option>
                        <option value="number">숫자 스트림</option>
                        <option value="binary">바이너리 스트림</option>
                        <option value="json">JSON 스트림</option>
                        <option value="csv">CSV 스트림</option>
                        <option value="infinite">무한 스트림</option>
                      </select>
                    </div>
                    <div class="option-group">
                      <label for="readableChunks">청크 수: <span id="readableChunksValue">10</span></label>
                      <input type="range" id="readableChunks" min="1" max="1000" value="10" step="1">
                    </div>
                    <div class="option-group">
                      <label for="readableDelay">청크 지연 (ms): <span id="readableDelayValue">100</span></label>
                      <input type="range" id="readableDelay" min="0" max="2000" value="100" step="10">
                    </div>
                    <div class="option-group">
                      <label for="readableSize">청크 크기: <span id="readableSizeValue">1024</span> bytes</label>
                      <input type="range" id="readableSize" min="64" max="8192" value="1024" step="64">
                    </div>
                  </div>
                  <div class="stream-actions">
                    <button id="createReadableStream" class="btn-primary">📖 ReadableStream 생성</button>
                    <button id="pauseReadableStream" class="btn-warning" disabled>⏸️ 일시정지</button>
                    <button id="resumeReadableStream" class="btn-success" disabled>▶️ 재개</button>
                    <button id="cancelReadableStream" class="btn-danger" disabled>❌ 취소</button>
                  </div>
                </div>

                <!-- WritableStream 생성 -->
                <div class="creator-panel" id="writable">
                  <h3>✍️ WritableStream 생성</h3>
                  <div class="stream-options">
                    <div class="option-group">
                      <label for="writableTarget">출력 대상:</label>
                      <select id="writableTarget">
                        <option value="console">콘솔</option>
                        <option value="file">파일 다운로드</option>
                        <option value="memory">메모리 버퍼</option>
                        <option value="display">화면 표시</option>
                        <option value="counter">카운터</option>
                      </select>
                    </div>
                    <div class="option-group">
                      <label for="writableFormat">데이터 형식:</label>
                      <select id="writableFormat">
                        <option value="text">텍스트</option>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                        <option value="binary">바이너리</option>
                      </select>
                    </div>
                    <div class="option-group">
                      <label>
                        <input type="checkbox" id="writableBackpressure">
                        백프레셔 시뮬레이션
                      </label>
                    </div>
                  </div>
                  <div class="stream-actions">
                    <button id="createWritableStream" class="btn-primary">✍️ WritableStream 생성</button>
                    <button id="writeToStream" class="btn-success" disabled>📝 데이터 쓰기</button>
                    <button id="closeWritableStream" class="btn-danger" disabled>🔒 스트림 닫기</button>
                  </div>
                  <div class="write-input">
                    <textarea id="writeData" placeholder="쓸 데이터를 입력하세요..." rows="3"></textarea>
                  </div>
                </div>

                <!-- TransformStream 생성 -->
                <div class="creator-panel" id="transform">
                  <h3>🔄 TransformStream 생성</h3>
                  <div class="stream-options">
                    <div class="option-group">
                      <label for="transformType">변환 타입:</label>
                      <select id="transformType">
                        <option value="uppercase">대문자 변환</option>
                        <option value="lowercase">소문자 변환</option>
                        <option value="reverse">문자열 뒤집기</option>
                        <option value="base64">Base64 인코딩</option>
                        <option value="compression">압축</option>
                        <option value="json-parse">JSON 파싱</option>
                        <option value="csv-parse">CSV 파싱</option>
                        <option value="filter">필터링</option>
                        <option value="map">맵핑</option>
                        <option value="throttle">스로틀링</option>
                      </select>
                    </div>
                    <div class="option-group">
                      <label for="transformOptions">변환 옵션:</label>
                      <input type="text" id="transformOptions" placeholder="옵션 (예: minLength=5, multiplier=2)">
                    </div>
                    <div class="option-group">
                      <label>
                        <input type="checkbox" id="transformFlush">
                        플러시 핸들러 포함
                      </label>
                    </div>
                  </div>
                  <div class="stream-actions">
                    <button id="createTransformStream" class="btn-primary">🔄 TransformStream 생성</button>
                    <button id="testTransformStream" class="btn-info">🧪 변환 테스트</button>
                  </div>
                  <div class="transform-test">
                    <div class="test-input">
                      <label for="transformTestData">테스트 데이터:</label>
                      <textarea id="transformTestData" placeholder="변환할 데이터를 입력하세요..." rows="2"></textarea>
                    </div>
                    <div class="test-output">
                      <label>변환 결과:</label>
                      <div id="transformResult" class="result-display">변환 결과가 여기에 표시됩니다</div>
                    </div>
                  </div>
                </div>

                <!-- Fetch Stream -->
                <div class="creator-panel" id="fetch">
                  <h3>🌐 Fetch Stream</h3>
                  <div class="stream-options">
                    <div class="option-group">
                      <label for="fetchUrl">URL:</label>
                      <input type="url" id="fetchUrl" placeholder="https://api.example.com/data" value="https://httpbin.org/stream/20">
                    </div>
                    <div class="option-group">
                      <label for="fetchMethod">HTTP 메소드:</label>
                      <select id="fetchMethod">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div class="option-group">
                      <label>
                        <input type="checkbox" id="fetchProgress">
                        진행률 추적
                      </label>
                    </div>
                  </div>
                  <div class="stream-actions">
                    <button id="fetchStreamData" class="btn-primary">🌐 Fetch 시작</button>
                    <button id="abortFetch" class="btn-danger" disabled>🛑 중단</button>
                  </div>
                  <div class="fetch-progress">
                    <div class="progress-info">
                      <span>진행률: <span id="fetchProgressPercent">0%</span></span>
                      <span>다운로드: <span id="fetchDownloaded">0 bytes</span></span>
                      <span>속도: <span id="fetchSpeed">0 KB/s</span></span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" id="fetchProgressFill"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 스트림 파이프라인 -->
          <div class="panel-card">
            <h2>🔗 스트림 파이프라인</h2>
            
            <div class="pipeline-section">
              <div class="pipeline-builder">
                <h3>🏗️ 파이프라인 구성</h3>
                <div class="pipeline-stages">
                  <div class="stage-list" id="pipelineStages">
                    <div class="stage-placeholder">파이프라인 단계를 추가하세요</div>
                  </div>
                  <div class="stage-controls">
                    <select id="stageType">
                      <option value="source">📖 소스</option>
                      <option value="transform">🔄 변환</option>
                      <option value="filter">🔍 필터</option>
                      <option value="map">🗺️ 맵</option>
                      <option value="compression">📦 압축</option>
                      <option value="sink">🎯 싱크</option>
                    </select>
                    <input type="text" id="stageConfig" placeholder="단계 설정">
                    <button id="addPipelineStage" class="btn-success">➕ 단계 추가</button>
                    <button id="clearPipeline" class="btn-danger">🗑️ 파이프라인 초기화</button>
                  </div>
                </div>
                
                <div class="pipeline-actions">
                  <button id="runPipeline" class="btn-primary" disabled>🚀 파이프라인 실행</button>
                  <button id="savePipeline" class="btn-info">💾 파이프라인 저장</button>
                  <button id="loadPipeline" class="btn-secondary">📂 파이프라인 로드</button>
                </div>
              </div>

              <div class="pipeline-visualizer">
                <h3>👁️ 파이프라인 시각화</h3>
                <div class="pipeline-flow" id="pipelineFlow">
                  <div class="flow-placeholder">파이프라인이 실행되면 데이터 흐름이 표시됩니다</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 스트림 모니터링 -->
          <div class="panel-card">
            <h2>📊 스트림 모니터링</h2>
            
            <div class="monitoring-section">
              <div class="stream-list">
                <h3>🌊 활성 스트림 목록</h3>
                <div class="streams-container" id="streamsContainer">
                  <div class="streams-placeholder">생성된 스트림이 없습니다</div>
                </div>
              </div>

              <div class="stream-details">
                <h3>🔍 스트림 상세 정보</h3>
                <div class="stream-info" id="streamInfo">
                  <div class="info-placeholder">스트림을 선택하여 상세 정보를 확인하세요</div>
                </div>
              </div>
            </div>
          </div>


          <!-- 스트림 성능 & 통계 -->
          <div class="panel-card">
            <h2>📈 스트림 성능 & 통계</h2>
            
            <div class="stats-section">
              <div class="performance-stats">
                <div class="stat-card">
                  <div class="stat-icon">🌊</div>
                  <div class="stat-info">
                    <span class="stat-label">총 스트림 수</span>
                    <span class="stat-value" id="totalStreams">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔄</div>
                  <div class="stat-info">
                    <span class="stat-label">활성 스트림</span>
                    <span class="stat-value" id="activeStreams">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">📦</div>
                  <div class="stat-info">
                    <span class="stat-label">처리된 청크</span>
                    <span class="stat-value" id="chunksProcessed">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">💾</div>
                  <div class="stat-info">
                    <span class="stat-label">처리된 바이트</span>
                    <span class="stat-value" id="bytesProcessed">0 B</span>
                  </div>
                </div>
              </div>

              <div class="performance-charts">
                <div class="chart-container">
                  <h3>📊 처리량 차트</h3>
                  <canvas id="throughputChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                  <h3>⏱️ 지연시간 차트</h3>
                  <canvas id="latencyChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- 스트림 예제 & 프리셋 -->
          <div class="panel-card">
            <h2>📚 스트림 예제 & 프리셋</h2>
            
            <div class="examples-section">
              <div class="example-categories">
                <div class="category-tabs">
                  <button class="category-tab-btn active" data-category="basic">🌟 기본 예제</button>
                  <button class="category-tab-btn" data-category="advanced">🚀 고급 예제</button>
                  <button class="category-tab-btn" data-category="realworld">🌍 실제 활용</button>
                  <button class="category-tab-btn" data-category="custom">⚙️ 커스텀</button>
                </div>

                <div class="category-content">
                  <!-- 기본 예제 -->
                  <div class="category-panel active" id="basic">
                    <div class="example-grid">
                      <div class="example-card" data-example="text-stream">
                        <h4>📝 텍스트 스트림</h4>
                        <p>기본적인 텍스트 데이터 스트리밍</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="number-stream">
                        <h4>🔢 숫자 스트림</h4>
                        <p>순차적인 숫자 데이터 생성</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="file-stream">
                        <h4>📁 파일 스트림</h4>
                        <p>파일 업로드/다운로드 스트리밍</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="echo-stream">
                        <h4>🔊 에코 스트림</h4>
                        <p>입력을 그대로 출력하는 스트림</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                    </div>
                  </div>

                  <!-- 고급 예제 -->
                  <div class="category-panel" id="advanced">
                    <div class="example-grid">
                      <div class="example-card" data-example="parallel-stream">
                        <h4>⚡ 병렬 스트림</h4>
                        <p>여러 스트림 동시 처리</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="backpressure-stream">
                        <h4>🔙 백프레셔 데모</h4>
                        <p>흐름 제어 및 백프레셔 처리</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="compression-stream">
                        <h4>📦 압축 스트림</h4>
                        <p>실시간 데이터 압축/해제</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="crypto-stream">
                        <h4>🔒 암호화 스트림</h4>
                        <p>스트림 데이터 암호화</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                    </div>
                  </div>

                  <!-- 실제 활용 -->
                  <div class="category-panel" id="realworld">
                    <div class="example-grid">
                      <div class="example-card" data-example="log-stream">
                        <h4>📋 로그 스트림</h4>
                        <p>실시간 로그 모니터링</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="chat-stream">
                        <h4>💬 채팅 스트림</h4>
                        <p>실시간 메시지 스트리밍</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="data-processing">
                        <h4>⚙️ 데이터 처리</h4>
                        <p>대용량 데이터 파이프라인</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="video-stream">
                        <h4>🎥 비디오 스트림</h4>
                        <p>비디오 데이터 스트리밍</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                    </div>
                  </div>

                  <!-- 커스텀 -->
                  <div class="category-panel" id="custom">
                    <div class="custom-stream-builder">
                      <h3>⚙️ 커스텀 스트림 빌더</h3>
                      <div class="custom-options">
                        <div class="option-row">
                          <label for="customSourceType">소스 타입:</label>
                          <select id="customSourceType">
                            <option value="generator">제너레이터</option>
                            <option value="array">배열</option>
                            <option value="interval">인터벌</option>
                            <option value="user-input">사용자 입력</option>
                          </select>
                        </div>
                        <div class="option-row">
                          <label for="customTransforms">변환 체인:</label>
                          <input type="text" id="customTransforms" placeholder="uppercase,filter:length>5,reverse">
                        </div>
                        <div class="option-row">
                          <label for="customSink">싱크 타입:</label>
                          <select id="customSink">
                            <option value="console">콘솔</option>
                            <option value="display">화면</option>
                            <option value="file">파일</option>
                            <option value="array">배열</option>
                          </select>
                        </div>
                      </div>
                      <div class="custom-actions">
                        <button id="buildCustomStream" class="btn-primary">🏗️ 커스텀 스트림 생성</button>
                        <button id="saveCustomPreset" class="btn-info">💾 프리셋 저장</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 영역 -->
          <div id="notifications" class="notifications-container"></div>
        </main>
      </div>
    `;

    console.log("✅ UI 설정 완료");
  }

  setupEventListeners() {
    // 크리에이터 탭
    document.querySelectorAll(".creator-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchCreatorTab(e.target.dataset.tab)
      );
    });

    // ReadableStream 컨트롤
    document
      .getElementById("readableChunks")
      ?.addEventListener("input", (e) =>
        this.updateReadableChunksDisplay(e.target.value)
      );
    document
      .getElementById("readableDelay")
      ?.addEventListener("input", (e) =>
        this.updateReadableDelayDisplay(e.target.value)
      );
    document
      .getElementById("readableSize")
      ?.addEventListener("input", (e) =>
        this.updateReadableSizeDisplay(e.target.value)
      );

    document
      .getElementById("createReadableStream")
      ?.addEventListener("click", () => this.createReadableStream());
    document
      .getElementById("pauseReadableStream")
      ?.addEventListener("click", () => this.pauseReadableStream());
    document
      .getElementById("resumeReadableStream")
      ?.addEventListener("click", () => this.resumeReadableStream());
    document
      .getElementById("cancelReadableStream")
      ?.addEventListener("click", () => this.cancelReadableStream());

    // WritableStream 컨트롤
    document
      .getElementById("createWritableStream")
      ?.addEventListener("click", () => this.createWritableStream());
    document
      .getElementById("writeToStream")
      ?.addEventListener("click", () => this.writeToStream());
    document
      .getElementById("closeWritableStream")
      ?.addEventListener("click", () => this.closeWritableStream());

    // TransformStream 컨트롤
    document
      .getElementById("createTransformStream")
      ?.addEventListener("click", () => this.createTransformStream());
    document
      .getElementById("testTransformStream")
      ?.addEventListener("click", () => this.testTransformStream());

    // Fetch Stream 컨트롤
    document
      .getElementById("fetchStreamData")
      ?.addEventListener("click", () => this.fetchStreamData());
    document
      .getElementById("abortFetch")
      ?.addEventListener("click", () => this.abortFetch());

    // 파이프라인 컨트롤
    document
      .getElementById("addPipelineStage")
      ?.addEventListener("click", () => this.addPipelineStage());
    document
      .getElementById("clearPipeline")
      ?.addEventListener("click", () => this.clearPipeline());
    document
      .getElementById("runPipeline")
      ?.addEventListener("click", () => this.runPipeline());
    document
      .getElementById("savePipeline")
      ?.addEventListener("click", () => this.savePipeline());
    document
      .getElementById("loadPipeline")
      ?.addEventListener("click", () => this.loadPipeline());

    // 뷰어 컨트롤
    document
      .getElementById("maxLines")
      ?.addEventListener("input", (e) =>
        this.updateMaxLinesDisplay(e.target.value)
      );
    document
      .getElementById("clearViewer")
      ?.addEventListener("click", () => this.clearViewer());
    document
      .getElementById("exportViewerData")
      ?.addEventListener("click", () => this.exportViewerData());
    document
      .getElementById("pauseViewer")
      ?.addEventListener("click", () => this.pauseViewer());

    // 예제 카테고리 탭
    document.querySelectorAll(".category-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchCategoryTab(e.target.dataset.category)
      );
    });

    // 예제 카드 클릭
    document.querySelectorAll(".example-card").forEach((card) => {
      const button = card.querySelector("button");
      button?.addEventListener("click", () =>
        this.runExample(card.dataset.example)
      );
    });

    // 커스텀 스트림 빌더
    document
      .getElementById("buildCustomStream")
      ?.addEventListener("click", () => this.buildCustomStream());
    document
      .getElementById("saveCustomPreset")
      ?.addEventListener("click", () => this.saveCustomPreset());

    // 빠른 테스트
    document
      .getElementById("quickTest")
      ?.addEventListener("click", () => this.runQuickTest());
    document
      .getElementById("fileStreamTest")
      ?.addEventListener("click", () => this.runFileStreamTest());
    document
      .getElementById("fetchStreamTest")
      ?.addEventListener("click", () => this.runFetchStreamTest());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  // UI 업데이트 메소드들
  updateReadableChunksDisplay(value) {
    document.getElementById("readableChunksValue").textContent = value;
  }

  updateReadableDelayDisplay(value) {
    document.getElementById("readableDelayValue").textContent = value;
  }

  updateReadableSizeDisplay(value) {
    document.getElementById("readableSizeValue").textContent = value;
  }

  updateMaxLinesDisplay(value) {
    document.getElementById("maxLinesValue").textContent = value;
  }

  switchCreatorTab(tab) {
    document
      .querySelectorAll(".creator-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    document
      .querySelectorAll(".creator-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }

  switchCategoryTab(category) {
    document
      .querySelectorAll(".category-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector(`[data-category="${category}"]`)
      .classList.add("active");

    document
      .querySelectorAll(".category-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(category).classList.add("active");
  }

  // ReadableStream 관리
  async createReadableStream() {
    const type = document.getElementById("readableType").value;
    const chunks = parseInt(document.getElementById("readableChunks").value);
    const delay = parseInt(document.getElementById("readableDelay").value);
    const size = parseInt(document.getElementById("readableSize").value);

    try {
      const streamId = `readable-${Date.now()}`;
      let controller;
      let currentChunk = 0;
      let isPaused = false;

      const stream = new ReadableStream({
        start: (ctrl) => {
          controller = ctrl;
        },
        pull: (ctrl) => {
          if (isPaused) return;

          return new Promise((resolve) => {
            setTimeout(() => {
              if (currentChunk >= chunks && chunks !== -1) {
                ctrl.close();
                resolve();
                return;
              }

              const chunk = window.streamAPI.generateChunk(
                type,
                currentChunk,
                size
              );
              ctrl.enqueue(chunk);
              currentChunk++;

              window.streamAPI.updateStreamStats("chunk");
              window.streamAPI.updateViewer(chunk);
              resolve();
            }, delay);
          });
        },
        cancel: (reason) => {
          console.log("ReadableStream 취소됨:", reason);
        },
      });

      this.streams.set(streamId, {
        stream,
        controller,
        type: "readable",
        config: { type, chunks, delay, size },
        isPaused: () => isPaused,
        pause: () => (isPaused = true),
        resume: () => (isPaused = false),
        cancel: () => controller.close(),
      });

      this.displayStream(streamId);
      this.updateStreamStats("create");

      // 버튼 상태 업데이트
      document.getElementById("createReadableStream").disabled = true;
      document.getElementById("pauseReadableStream").disabled = false;
      document.getElementById("resumeReadableStream").disabled = true;
      document.getElementById("cancelReadableStream").disabled = false;

      this.showNotification(`ReadableStream (${type}) 생성 완료`, "success");
    } catch (error) {
      this.showNotification(
        `ReadableStream 생성 실패: ${error.message}`,
        "error"
      );
    }
  }

  generateChunk(type, index, size) {
    switch (type) {
      case "text":
        return `텍스트 청크 #${index + 1}: ${"A".repeat(
          Math.floor(size / 20)
        )}\n`;
      case "number":
        return index + 1;
      case "binary":
        return new Uint8Array(size).fill(index % 256);
      case "json":
        return JSON.stringify({
          id: index + 1,
          timestamp: Date.now(),
          data: `샘플 데이터 ${index + 1}`,
          size: size,
        });
      case "csv":
        return `${index + 1},샘플${index + 1},${Date.now()},${size}\n`;
      case "infinite":
        return `무한 스트림 데이터 #${
          index + 1
        } - ${new Date().toISOString()}\n`;
      default:
        return `기본 청크 #${index + 1}`;
    }
  }

  pauseReadableStream() {
    const activeStream = Array.from(this.streams.values()).find(
      (s) => s.type === "readable" && !s.isPaused()
    );
    if (activeStream) {
      activeStream.pause();
      document.getElementById("pauseReadableStream").disabled = true;
      document.getElementById("resumeReadableStream").disabled = false;
      this.showNotification("ReadableStream 일시정지됨", "warning");
    }
  }

  resumeReadableStream() {
    const activeStream = Array.from(this.streams.values()).find(
      (s) => s.type === "readable" && s.isPaused()
    );
    if (activeStream) {
      activeStream.resume();
      document.getElementById("pauseReadableStream").disabled = false;
      document.getElementById("resumeReadableStream").disabled = true;
      this.showNotification("ReadableStream 재개됨", "success");
    }
  }

  cancelReadableStream() {
    const activeStream = Array.from(this.streams.values()).find(
      (s) => s.type === "readable"
    );
    if (activeStream) {
      activeStream.cancel();
      this.streams.delete(
        Array.from(this.streams.keys()).find(
          (key) => this.streams.get(key) === activeStream
        )
      );

      // 버튼 상태 재설정
      document.getElementById("createReadableStream").disabled = false;
      document.getElementById("pauseReadableStream").disabled = true;
      document.getElementById("resumeReadableStream").disabled = true;
      document.getElementById("cancelReadableStream").disabled = true;

      this.updateStreamStats("cancel");
      this.showNotification("ReadableStream 취소됨", "info");
    }
  }

  // WritableStream 관리
  async createWritableStream() {
    const target = document.getElementById("writableTarget").value;
    const format = document.getElementById("writableFormat").value;
    const backpressure = document.getElementById(
      "writableBackpressure"
    ).checked;

    try {
      const streamId = `writable-${Date.now()}`;
      let buffer = [];

      const stream = new WritableStream({
        start: (controller) => {
          console.log("WritableStream 시작됨");
        },
        write: (chunk, controller) => {
          return new Promise((resolve, reject) => {
            // 백프레셔 시뮬레이션
            const delay = backpressure ? Math.random() * 100 : 0;

            setTimeout(() => {
              try {
                window.streamAPI.handleWriteChunk(
                  chunk,
                  target,
                  format,
                  buffer
                );
                window.streamAPI.updateStreamStats("chunk");
                window.streamAPI.updateViewer(chunk);
                resolve();
              } catch (error) {
                reject(error);
              }
            }, delay);
          });
        },
        close: () => {
          console.log("WritableStream 닫힘");
          window.streamAPI.finalizeWrite(target, format, buffer);
        },
        abort: (reason) => {
          console.log("WritableStream 중단됨:", reason);
        },
      });

      this.streams.set(streamId, {
        stream,
        type: "writable",
        config: { target, format, backpressure },
        buffer,
      });

      this.displayStream(streamId);
      this.updateStreamStats("create");

      // 버튼 상태 업데이트
      document.getElementById("createWritableStream").disabled = true;
      document.getElementById("writeToStream").disabled = false;
      document.getElementById("closeWritableStream").disabled = false;

      this.showNotification(`WritableStream (${target}) 생성 완료`, "success");
    } catch (error) {
      this.showNotification(
        `WritableStream 생성 실패: ${error.message}`,
        "error"
      );
    }
  }

  handleWriteChunk(chunk, target, format, buffer) {
    const formattedChunk = this.formatChunk(chunk, format);

    switch (target) {
      case "console":
        console.log("WritableStream 출력:", formattedChunk);
        break;
      case "file":
        buffer.push(formattedChunk);
        break;
      case "memory":
        buffer.push(formattedChunk);
        break;
      case "display":
        this.displayInViewer(formattedChunk);
        break;
      case "counter":
        this.updateCounter(formattedChunk);
        break;
    }
  }

  formatChunk(chunk, format) {
    switch (format) {
      case "json":
        return typeof chunk === "string" ? chunk : JSON.stringify(chunk);
      case "csv":
        return Array.isArray(chunk) ? chunk.join(",") : String(chunk);
      case "binary":
        return chunk instanceof ArrayBuffer
          ? new Uint8Array(chunk)
          : new TextEncoder().encode(String(chunk));
      default:
        return String(chunk);
    }
  }

  finalizeWrite(target, format, buffer) {
    if (target === "file" && buffer.length > 0) {
      const content = buffer.join("");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stream-output.${format === "json" ? "json" : "txt"}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async writeToStream() {
    const data = document.getElementById("writeData").value;
    if (!data.trim()) {
      this.showNotification("쓸 데이터를 입력하세요", "warning");
      return;
    }

    const activeStream = Array.from(this.streams.values()).find(
      (s) => s.type === "writable"
    );
    if (!activeStream) {
      this.showNotification("WritableStream이 없습니다", "warning");
      return;
    }

    try {
      const writer = activeStream.stream.getWriter();
      await writer.write(data);
      writer.releaseLock();

      document.getElementById("writeData").value = "";
      this.showNotification("데이터 쓰기 완료", "success");
    } catch (error) {
      this.showNotification(`데이터 쓰기 실패: ${error.message}`, "error");
    }
  }

  async closeWritableStream() {
    const activeStream = Array.from(this.streams.values()).find(
      (s) => s.type === "writable"
    );
    if (!activeStream) return;

    try {
      const writer = activeStream.stream.getWriter();
      await writer.close();

      this.streams.delete(
        Array.from(this.streams.keys()).find(
          (key) => this.streams.get(key) === activeStream
        )
      );

      // 버튼 상태 재설정
      document.getElementById("createWritableStream").disabled = false;
      document.getElementById("writeToStream").disabled = true;
      document.getElementById("closeWritableStream").disabled = true;

      this.updateStreamStats("close");
      this.showNotification("WritableStream 닫힘", "info");
    } catch (error) {
      this.showNotification(
        `WritableStream 닫기 실패: ${error.message}`,
        "error"
      );
    }
  }

  // TransformStream 관리
  createTransformStream() {
    const type = document.getElementById("transformType").value;
    const options = document.getElementById("transformOptions").value;
    const includeFlush = document.getElementById("transformFlush").checked;

    try {
      const streamId = `transform-${Date.now()}`;
      const parsedOptions = this.parseTransformOptions(options);

      const transformerConfig = {
        transform: (chunk, controller) => {
          const transformed = window.streamAPI.applyTransform(
            chunk,
            type,
            parsedOptions
          );
          controller.enqueue(transformed);
          window.streamAPI.updateStreamStats("chunk");
        },
      };

      if (includeFlush) {
        transformerConfig.flush = (controller) => {
          console.log("TransformStream 플러시됨");
          controller.enqueue("<!-- 플러시 완료 -->");
        };
      }

      const stream = new TransformStream(transformerConfig);

      this.streams.set(streamId, {
        stream,
        type: "transform",
        config: { type, options, includeFlush },
        transformer: (input) => this.applyTransform(input, type, parsedOptions),
      });

      this.displayStream(streamId);
      this.updateStreamStats("create");

      this.showNotification(`TransformStream (${type}) 생성 완료`, "success");
    } catch (error) {
      this.showNotification(
        `TransformStream 생성 실패: ${error.message}`,
        "error"
      );
    }
  }

  parseTransformOptions(optionsString) {
    const options = {};
    if (!optionsString.trim()) return options;

    optionsString.split(",").forEach((pair) => {
      const [key, value] = pair.split("=").map((s) => s.trim());
      if (key && value) {
        options[key] = isNaN(value) ? value : Number(value);
      }
    });

    return options;
  }

  applyTransform(chunk, type, options) {
    const input = String(chunk);

    switch (type) {
      case "uppercase":
        return input.toUpperCase();
      case "lowercase":
        return input.toLowerCase();
      case "reverse":
        return input.split("").reverse().join("");
      case "base64":
        return btoa(input);
      case "compression":
        // 단순 압축 시뮬레이션 (반복 문자 제거)
        return input.replace(/(.)\1+/g, "$1");
      case "json-parse":
        try {
          return JSON.stringify(JSON.parse(input), null, 2);
        } catch {
          return input;
        }
      case "csv-parse":
        return input
          .split(",")
          .map((cell, i) => `컬럼${i + 1}: ${cell.trim()}`)
          .join(" | ");
      case "filter":
        const minLength = options.minLength || 0;
        return input.length >= minLength ? input : "";
      case "map":
        const multiplier = options.multiplier || 1;
        return isNaN(input) ? input : String(Number(input) * multiplier);
      case "throttle":
        // 스로틀링은 실제로는 지연을 포함하지만 여기서는 시뮬레이션
        return input + " [스로틀됨]";
      default:
        return input;
    }
  }

  async testTransformStream() {
    const testData = document.getElementById("transformTestData").value;
    if (!testData.trim()) {
      this.showNotification("테스트할 데이터를 입력하세요", "warning");
      return;
    }

    const activeTransform = Array.from(this.streams.values()).find(
      (s) => s.type === "transform"
    );
    if (!activeTransform) {
      this.showNotification("TransformStream이 없습니다", "warning");
      return;
    }

    try {
      const result = activeTransform.transformer(testData);
      document.getElementById("transformResult").textContent = result;
      this.showNotification("변환 테스트 완료", "success");
    } catch (error) {
      this.showNotification(`변환 테스트 실패: ${error.message}`, "error");
    }
  }

  // Fetch Stream 관리
  async fetchStreamData() {
    const url = document.getElementById("fetchUrl").value;
    const method = document.getElementById("fetchMethod").value;
    const trackProgress = document.getElementById("fetchProgress").checked;

    if (!url.trim()) {
      this.showNotification("URL을 입력하세요", "warning");
      return;
    }

    try {
      const controller = new AbortController();
      this.abortController = controller;

      document.getElementById("fetchStreamData").disabled = true;
      document.getElementById("abortFetch").disabled = false;

      const response = await fetch(url, {
        method,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength) : 0;
      let downloaded = 0;
      const startTime = Date.now();

      const stream = response.body;
      const reader = stream.getReader();

      const readLoop = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            downloaded += value.length;
            this.updateStreamStats("chunk");
            this.updateViewer(new TextDecoder().decode(value));

            if (trackProgress && total > 0) {
              this.updateFetchProgress(downloaded, total, startTime);
            }
          }

          this.showNotification("Fetch 스트림 완료", "success");
        } catch (error) {
          if (error.name !== "AbortError") {
            this.showNotification(`Fetch 오류: ${error.message}`, "error");
          }
        } finally {
          document.getElementById("fetchStreamData").disabled = false;
          document.getElementById("abortFetch").disabled = true;
        }
      };

      readLoop();
      this.showNotification("Fetch 스트림 시작", "info");
    } catch (error) {
      this.showNotification(`Fetch 실패: ${error.message}`, "error");
      document.getElementById("fetchStreamData").disabled = false;
      document.getElementById("abortFetch").disabled = true;
    }
  }

  updateFetchProgress(downloaded, total, startTime) {
    const percent = Math.round((downloaded / total) * 100);
    const elapsed = (Date.now() - startTime) / 1000;
    const speed = downloaded / elapsed / 1024; // KB/s

    document.getElementById("fetchProgressPercent").textContent = `${percent}%`;
    document.getElementById("fetchDownloaded").textContent =
      this.formatBytes(downloaded);
    document.getElementById("fetchSpeed").textContent = `${speed.toFixed(
      1
    )} KB/s`;
    document.getElementById("fetchProgressFill").style.width = `${percent}%`;
  }

  abortFetch() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.showNotification("Fetch 중단됨", "warning");
    }
  }

  // 파이프라인 관리
  addPipelineStage() {
    const type = document.getElementById("stageType").value;
    const config = document.getElementById("stageConfig").value;

    const container = document.getElementById("pipelineStages");
    if (container.querySelector(".stage-placeholder")) {
      container.innerHTML = "";
    }

    const stageDiv = document.createElement("div");
    stageDiv.className = "pipeline-stage";
    stageDiv.innerHTML = `
      <div class="stage-info">
        <span class="stage-type">${this.getStageIcon(type)} ${type}</span>
        <span class="stage-config">${config || "기본 설정"}</span>
      </div>
      <div class="stage-actions">
        <button onclick="this.parentElement.parentElement.remove()" class="btn-small btn-danger">🗑️</button>
      </div>
    `;

    container.appendChild(stageDiv);
    document.getElementById("stageConfig").value = "";
    document.getElementById("runPipeline").disabled = false;

    this.showNotification(`${type} 단계 추가됨`, "success");
  }

  getStageIcon(type) {
    const icons = {
      source: "📖",
      transform: "🔄",
      filter: "🔍",
      map: "🗺️",
      compression: "📦",
      sink: "🎯",
    };
    return icons[type] || "⚙️";
  }

  clearPipeline() {
    const container = document.getElementById("pipelineStages");
    container.innerHTML =
      '<div class="stage-placeholder">파이프라인 단계를 추가하세요</div>';
    document.getElementById("runPipeline").disabled = true;
    this.showNotification("파이프라인이 초기화되었습니다", "info");
  }

  async runPipeline() {
    const stages = document.querySelectorAll(".pipeline-stage");
    if (stages.length === 0) {
      this.showNotification("파이프라인 단계를 추가하세요", "warning");
      return;
    }

    try {
      this.showNotification("파이프라인 실행 중...", "info");
      this.visualizePipelineFlow(stages);

      // 파이프라인 실행 시뮬레이션
      for (let i = 0; i < stages.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        stages[i].classList.add("stage-active");
        this.updateStreamStats("chunk");
      }

      this.showNotification("파이프라인 실행 완료", "success");
    } catch (error) {
      this.showNotification(`파이프라인 실행 실패: ${error.message}`, "error");
    }
  }

  visualizePipelineFlow(stages) {
    const flowContainer = document.getElementById("pipelineFlow");
    flowContainer.innerHTML = "";

    stages.forEach((stage, index) => {
      const flowItem = document.createElement("div");
      flowItem.className = "flow-item";
      flowItem.innerHTML = `
        <div class="flow-stage">${
          stage.querySelector(".stage-type").textContent
        }</div>
        ${index < stages.length - 1 ? '<div class="flow-arrow">→</div>' : ""}
      `;
      flowContainer.appendChild(flowItem);
    });
  }

  savePipeline() {
    const stages = Array.from(document.querySelectorAll(".pipeline-stage")).map(
      (stage) => ({
        type: stage.querySelector(".stage-type").textContent,
        config: stage.querySelector(".stage-config").textContent,
      })
    );

    if (stages.length === 0) {
      this.showNotification("저장할 파이프라인이 없습니다", "warning");
      return;
    }

    const pipeline = {
      name: `파이프라인-${Date.now()}`,
      stages,
      created: new Date().toISOString(),
    };

    localStorage.setItem(
      "stream-pipelines",
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem("stream-pipelines")) || []),
        pipeline,
      ])
    );

    this.showNotification("파이프라인이 저장되었습니다", "success");
  }

  loadPipeline() {
    const pipelines =
      JSON.parse(localStorage.getItem("stream-pipelines")) || [];
    if (pipelines.length === 0) {
      this.showNotification("저장된 파이프라인이 없습니다", "info");
      return;
    }

    // 가장 최근 파이프라인 로드 (실제로는 선택 UI가 필요)
    const pipeline = pipelines[pipelines.length - 1];
    this.clearPipeline();

    pipeline.stages.forEach((stage) => {
      document.getElementById("stageType").value = stage.type.split(" ")[1];
      document.getElementById("stageConfig").value = stage.config;
      this.addPipelineStage();
    });

    this.showNotification(`파이프라인 "${pipeline.name}" 로드됨`, "success");
  }

  // 스트림 모니터링
  displayStream(streamId) {
    const container = document.getElementById("streamsContainer");
    if (container.querySelector(".streams-placeholder")) {
      container.innerHTML = "";
    }

    const stream = this.streams.get(streamId);
    const streamDiv = document.createElement("div");
    streamDiv.className = "stream-item";
    streamDiv.innerHTML = `
      <div class="stream-header">
        <span class="stream-id">${streamId}</span>
        <span class="stream-type ${stream.type}">${stream.type}</span>
        <span class="stream-status active">활성</span>
      </div>
      <div class="stream-config">
        ${Object.entries(stream.config)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")}
      </div>
      <div class="stream-actions">
        <button onclick="window.streamAPI.selectStream('${streamId}')" class="btn-small btn-info">상세보기</button>
        <button onclick="window.streamAPI.removeStream('${streamId}')" class="btn-small btn-danger">제거</button>
      </div>
    `;

    container.appendChild(streamDiv);
  }

  selectStream(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    const infoContainer = document.getElementById("streamInfo");
    infoContainer.innerHTML = `
      <div class="stream-details">
        <h4>${streamId}</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">타입:</span>
            <span class="detail-value">${stream.type}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">상태:</span>
            <span class="detail-value">활성</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">설정:</span>
            <span class="detail-value">${JSON.stringify(stream.config)}</span>
          </div>
        </div>
      </div>
    `;
  }

  removeStream(streamId) {
    this.streams.delete(streamId);
    const streamItems = document.querySelectorAll(".stream-item");
    streamItems.forEach((item) => {
      if (item.querySelector(".stream-id").textContent === streamId) {
        item.remove();
      }
    });

    this.updateStreamStats("remove");
    this.showNotification(`스트림 ${streamId} 제거됨`, "info");
  }

  // 데이터 뷰어
  updateViewer(data) {
    if (this.viewerPaused) return;

    const viewer = document.getElementById("dataViewer");
    if (!viewer) return;

    // placeholder 제거
    if (viewer.querySelector(".viewer-placeholder")) {
      viewer.innerHTML = "";
    }

    const formattedData = this.escapeHtml(String(data));
    const dataLine = document.createElement("div");
    dataLine.className = "data-line";
    dataLine.innerHTML = `
      <span class="data-timestamp">${new Date().toLocaleTimeString()}</span>
      <span class="data-content">${formattedData}</span>
    `;

    viewer.appendChild(dataLine);

    // 최대 100라인 제한
    const lines = viewer.querySelectorAll(".data-line");
    if (lines.length > 100) {
      lines[0].remove();
    }

    // 자동 스크롤
    viewer.scrollTop = viewer.scrollHeight;
  }

  formatViewerData(data, mode) {
    switch (mode) {
      case "raw":
        return this.escapeHtml(String(data));
      case "text":
        return this.escapeHtml(String(data));
      case "json":
        try {
          return this.escapeHtml(JSON.stringify(JSON.parse(data), null, 2));
        } catch {
          return this.escapeHtml(String(data));
        }
      case "hex":
        return Array.from(new TextEncoder().encode(String(data)))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join(" ");
      case "binary":
        return Array.from(new TextEncoder().encode(String(data)))
          .map((byte) => byte.toString(2).padStart(8, "0"))
          .join(" ");
      default:
        return this.escapeHtml(String(data));
    }
  }

  displayInViewer(data) {
    this.updateViewer(data);
  }

  clearViewer() {
    const viewer = document.getElementById("dataViewer");
    if (viewer) {
      viewer.innerHTML = "";
    }
  }

  exportViewerData() {
    const viewer = document.getElementById("dataViewer");
    const lines = viewer.querySelectorAll(".data-line");

    if (lines.length === 0) {
      this.showNotification("내보낼 데이터가 없습니다", "warning");
      return;
    }

    const data = Array.from(lines)
      .map((line) => {
        const timestamp = line.querySelector(".data-timestamp").textContent;
        const content = line.querySelector(".data-content").textContent;
        return `${timestamp}: ${content}`;
      })
      .join("\n");

    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stream-data-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification("데이터가 내보내졌습니다", "success");
  }

  pauseViewer() {
    this.viewerPaused = !this.viewerPaused;
    const button = document.getElementById("pauseViewer");
    button.textContent = this.viewerPaused
      ? "▶️ 뷰어 재개"
      : "⏸️ 뷰어 일시정지";
    button.className = this.viewerPaused ? "btn-success" : "btn-secondary";
    this.showNotification(
      `뷰어 ${this.viewerPaused ? "일시정지" : "재개"}됨`,
      "info"
    );
  }

  // 예제 실행
  runExample(example) {
    switch (example) {
      case "text-stream":
        this.runTextStreamExample();
        break;
      case "number-stream":
        this.runNumberStreamExample();
        break;
      case "file-stream":
        this.runFileStreamExample();
        break;
      case "echo-stream":
        this.runEchoStreamExample();
        break;
      case "parallel-stream":
        this.runParallelStreamExample();
        break;
      case "backpressure-stream":
        this.runBackpressureExample();
        break;
      case "compression-stream":
        this.runCompressionExample();
        break;
      case "crypto-stream":
        this.runCryptoExample();
        break;
      case "log-stream":
        this.runLogStreamExample();
        break;
      case "chat-stream":
        this.runChatStreamExample();
        break;
      case "data-processing":
        this.runDataProcessingExample();
        break;
      case "video-stream":
        this.runVideoStreamExample();
        break;
      default:
        this.showNotification(
          `예제 ${example}은 아직 구현되지 않았습니다`,
          "info"
        );
    }
  }

  runTextStreamExample() {
    document.getElementById("readableType").value = "text";
    document.getElementById("readableChunks").value = "5";
    document.getElementById("readableDelay").value = "500";
    this.updateReadableChunksDisplay("5");
    this.updateReadableDelayDisplay("500");
    this.switchCreatorTab("readable");
    this.createReadableStream();
    this.showNotification("텍스트 스트림 예제 실행됨", "success");
  }

  runNumberStreamExample() {
    document.getElementById("readableType").value = "number";
    document.getElementById("readableChunks").value = "10";
    document.getElementById("readableDelay").value = "200";
    this.updateReadableChunksDisplay("10");
    this.updateReadableDelayDisplay("200");
    this.createReadableStream();
    this.showNotification("숫자 스트림 예제 실행됨", "success");
  }

  runFileStreamExample() {
    // 파일 스트림 시뮬레이션
    const data = "파일 스트림 예제 데이터\n".repeat(10);
    document.getElementById("writeData").value = data;
    document.getElementById("writableTarget").value = "file";
    this.createWritableStream();
    setTimeout(() => this.writeToStream(), 500);
    this.showNotification("파일 스트림 예제 실행됨", "success");
  }

  runEchoStreamExample() {
    // 에코 스트림 (TransformStream 사용)
    document.getElementById("transformType").value = "uppercase";
    this.createTransformStream();
    document.getElementById("transformTestData").value = "hello world";
    this.testTransformStream();
    this.showNotification("에코 스트림 예제 실행됨", "success");
  }

  runParallelStreamExample() {
    // 여러 스트림 동시 실행
    this.runTextStreamExample();
    setTimeout(() => this.runNumberStreamExample(), 1000);
    this.showNotification("병렬 스트림 예제 실행됨", "success");
  }

  runBackpressureExample() {
    document.getElementById("writableBackpressure").checked = true;
    document.getElementById("writableTarget").value = "console";
    this.createWritableStream();
    this.showNotification("백프레셔 예제 실행됨", "success");
  }

  runCompressionExample() {
    document.getElementById("transformType").value = "compression";
    this.createTransformStream();
    document.getElementById("transformTestData").value =
      "aaaaabbbbccccddddeeee";
    this.testTransformStream();
    this.showNotification("압축 스트림 예제 실행됨", "success");
  }

  runCryptoExample() {
    document.getElementById("transformType").value = "base64";
    this.createTransformStream();
    document.getElementById("transformTestData").value = "암호화할 데이터";
    this.testTransformStream();
    this.showNotification("암호화 스트림 예제 실행됨", "success");
  }

  runLogStreamExample() {
    // 로그 스트림 시뮬레이션
    document.getElementById("readableType").value = "json";
    document.getElementById("readableChunks").value = "20";
    document.getElementById("readableDelay").value = "1000";
    this.updateReadableChunksDisplay("20");
    this.updateReadableDelayDisplay("1000");
    this.createReadableStream();
    this.showNotification("로그 스트림 예제 실행됨", "success");
  }

  runChatStreamExample() {
    // 채팅 스트림 시뮬레이션
    const messages = [
      "사용자1: 안녕하세요!",
      "사용자2: 반갑습니다!",
      "사용자1: 스트림 API 테스트 중입니다",
      "사용자2: 잘 동작하네요!",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index >= messages.length) {
        clearInterval(interval);
        return;
      }
      this.updateViewer(messages[index++]);
    }, 1500);

    this.showNotification("채팅 스트림 예제 실행됨", "success");
  }

  runDataProcessingExample() {
    // 데이터 처리 파이프라인 예제
    this.clearPipeline();
    const stages = [
      { type: "source", config: "CSV 데이터" },
      { type: "transform", config: "데이터 정제" },
      { type: "filter", config: "유효성 검사" },
      { type: "map", config: "형식 변환" },
      { type: "sink", config: "데이터베이스" },
    ];

    stages.forEach((stage) => {
      document.getElementById("stageType").value = stage.type;
      document.getElementById("stageConfig").value = stage.config;
      this.addPipelineStage();
    });

    this.runPipeline();
    this.showNotification("데이터 처리 예제 실행됨", "success");
  }

  runVideoStreamExample() {
    // 비디오 스트림 시뮬레이션
    document.getElementById("readableType").value = "binary";
    document.getElementById("readableChunks").value = "50";
    document.getElementById("readableDelay").value = "100";
    document.getElementById("readableSize").value = "4096";
    this.updateReadableChunksDisplay("50");
    this.updateReadableDelayDisplay("100");
    this.updateReadableSizeDisplay("4096");
    this.createReadableStream();
    this.showNotification("비디오 스트림 예제 실행됨", "success");
  }

  // 커스텀 스트림 빌더
  buildCustomStream() {
    const sourceType = document.getElementById("customSourceType").value;
    const transforms = document.getElementById("customTransforms").value;
    const sinkType = document.getElementById("customSink").value;

    try {
      // 커스텀 스트림 구축 로직
      this.showNotification(
        `커스텀 스트림 생성됨: ${sourceType} → ${transforms} → ${sinkType}`,
        "success"
      );
    } catch (error) {
      this.showNotification(
        `커스텀 스트림 생성 실패: ${error.message}`,
        "error"
      );
    }
  }

  saveCustomPreset() {
    const sourceType = document.getElementById("customSourceType").value;
    const transforms = document.getElementById("customTransforms").value;
    const sinkType = document.getElementById("customSink").value;

    const preset = {
      name: `커스텀-${Date.now()}`,
      sourceType,
      transforms,
      sinkType,
      created: new Date().toISOString(),
    };

    localStorage.setItem(
      "stream-presets",
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem("stream-presets")) || []),
        preset,
      ])
    );

    this.showNotification("커스텀 프리셋이 저장되었습니다", "success");
  }

  // 빠른 테스트
  async runQuickTest() {
    this.showNotification("스트림 청크 처리 테스트 시작!", "info");
    this.updateViewer("🚀 청크 처리 테스트 시작!");

    try {
      // 1. ReadableStream 생성 - 텍스트 데이터를 청크로 나누어서 전송
      const textData =
        "안녕하세요! 이것은 Stream API 테스트입니다. 데이터가 청크 단위로 처리되는 것을 확인해보세요!";
      const chunks = textData.match(/.{1,10}/g) || []; // 10글자씩 청크로 나누기

      let chunkIndex = 0;
      const readable = new ReadableStream({
        start(controller) {
          console.log("📖 ReadableStream 시작!");
        },
        pull(controller) {
          if (chunkIndex >= chunks.length) {
            controller.close();
            console.log("📖 ReadableStream 완료!");
            return;
          }

          const chunk = chunks[chunkIndex++];
          console.log(`📦 청크 ${chunkIndex}: "${chunk}"`);
          controller.enqueue(chunk);

          // 뷰어에 표시
          window.streamAPI.updateViewer(`청크 ${chunkIndex}: "${chunk}"`);
        },
      });

      // 2. TransformStream 생성 - 청크를 대문자로 변환
      const transformer = new TransformStream({
        transform(chunk, controller) {
          const transformed = chunk.toUpperCase();
          console.log(`🔄 변환: "${chunk}" → "${transformed}"`);
          controller.enqueue(transformed);

          // 뷰어에 변환 결과 표시
          window.streamAPI.updateViewer(
            `변환됨: "${chunk}" → "${transformed}"`
          );
        },
      });

      // 3. WritableStream 생성 - 변환된 데이터를 수집
      let result = "";
      const writable = new WritableStream({
        write(chunk) {
          result += chunk;
          console.log(`✍️ 쓰기: "${chunk}"`);
          console.log(`📝 현재 결과: "${result}"`);

          // 뷰어에 결과 표시
          window.streamAPI.updateViewer(`결과 누적: "${result}"`);
        },
        close() {
          console.log("✅ 최종 결과:", result);
          window.streamAPI.showNotification(`최종 결과: ${result}`, "success");
          window.streamAPI.updateViewer(`🎉 최종 완성: "${result}"`);
        },
      });

      // 4. 스트림 파이프라인 연결: ReadableStream → TransformStream → WritableStream
      console.log("🔗 스트림 파이프라인 연결 중...");
      window.streamAPI.updateViewer("🔗 파이프라인: 읽기 → 변환 → 쓰기");

      const pipelinePromise = readable
        .pipeThrough(transformer)
        .pipeTo(writable);

      await pipelinePromise;

      this.showNotification("스트림 파이프라인 처리 완료!", "success");
    } catch (error) {
      console.error("스트림 테스트 오류:", error);
      this.showNotification(`테스트 실패: ${error.message}`, "error");
    }
  }

  // 파일 스트림 테스트
  async runFileStreamTest() {
    this.showNotification("파일 스트림 테스트 시작!", "info");
    this.updateViewer("📁 파일 스트림 테스트 시작!");

    try {
      // 가상의 큰 텍스트 파일 데이터 (실제로는 File API로 파일을 읽음)
      const fileContent =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(100);
      const fileBlob = new Blob([fileContent], { type: "text/plain" });

      console.log(`📁 파일 크기: ${fileBlob.size} bytes`);
      this.updateViewer(`📁 파일 크기: ${fileBlob.size} bytes`);

      // ReadableStream으로 파일을 청크 단위로 읽기
      const fileStream = fileBlob.stream();
      const reader = fileStream.getReader();

      let totalBytesRead = 0;
      let chunkCount = 0;

      // TransformStream으로 바이트를 텍스트로 변환하고 통계 수집
      const decoder = new TextDecoder();
      const statsTransform = new TransformStream({
        transform(chunk, controller) {
          totalBytesRead += chunk.length;
          chunkCount++;

          const text = decoder.decode(chunk, { stream: true });
          const stats = {
            chunkNumber: chunkCount,
            chunkSize: chunk.length,
            totalRead: totalBytesRead,
            textPreview: text.substring(0, 50) + "...",
          };

          console.log(`📦 청크 ${chunkCount}: ${chunk.length} bytes`);
          window.streamAPI.updateViewer(
            `청크 ${chunkCount}: ${chunk.length} bytes, 누계: ${totalBytesRead} bytes`
          );

          controller.enqueue(stats);
        },
      });

      // WritableStream으로 최종 결과 출력
      const resultWriter = new WritableStream({
        write(stats) {
          console.log("📊 통계:", stats);
          window.streamAPI.updateViewer(
            `📊 처리 완료 - 청크: ${stats.chunkNumber}, 총 바이트: ${stats.totalRead}`
          );
        },
        close() {
          console.log(
            `✅ 파일 스트림 처리 완료! 총 ${chunkCount}개 청크, ${totalBytesRead} bytes 처리`
          );
          window.streamAPI.showNotification(
            `파일 처리 완료: ${chunkCount}개 청크, ${totalBytesRead} bytes`,
            "success"
          );
        },
      });

      // 파이프라인 실행
      await fileStream.pipeThrough(statsTransform).pipeTo(resultWriter);
    } catch (error) {
      console.error("파일 스트림 테스트 오류:", error);
      this.showNotification(`파일 테스트 실패: ${error.message}`, "error");
    }
  }

  // Fetch 스트림 테스트
  async runFetchStreamTest() {
    this.showNotification("Fetch 스트림 테스트 시작!", "info");
    this.updateViewer("🌐 Fetch 스트림 테스트 시작!");

    try {
      // JSONPlaceholder API로 테스트 (실제 HTTP 스트림)
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log("🌐 Fetch 응답 수신, 스트림 처리 시작");
      this.updateViewer("🌐 HTTP 응답 스트림 처리 시작");

      const contentLength = response.headers.get("content-length");
      console.log(`📊 예상 크기: ${contentLength} bytes`);

      let downloadedBytes = 0;
      let chunkCount = 0;

      // TransformStream으로 다운로드 진행률 추적
      const progressTransform = new TransformStream({
        transform(chunk, controller) {
          downloadedBytes += chunk.length;
          chunkCount++;

          const progress = contentLength
            ? ((downloadedBytes / contentLength) * 100).toFixed(1)
            : "?";

          console.log(
            `📥 청크 ${chunkCount}: ${chunk.length} bytes (${progress}%)`
          );
          window.streamAPI.updateViewer(
            `📥 다운로드 중... 청크 ${chunkCount}: ${chunk.length} bytes (${progress}%)`
          );

          controller.enqueue(chunk);
        },
      });

      // WritableStream으로 최종 데이터 수집
      const chunks = [];
      const collector = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
        close() {
          // 모든 청크를 합쳐서 JSON 파싱
          const allBytes = new Uint8Array(downloadedBytes);
          let offset = 0;
          for (const chunk of chunks) {
            allBytes.set(chunk, offset);
            offset += chunk.length;
          }

          const text = new TextDecoder().decode(allBytes);
          const data = JSON.parse(text);

          console.log(`✅ Fetch 완료: ${data.length}개 게시물 수신`);
          window.streamAPI.showNotification(
            `Fetch 완료: ${data.length}개 게시물, ${downloadedBytes} bytes`,
            "success"
          );
          window.streamAPI.updateViewer(
            `🎉 JSON 파싱 완료: ${data.length}개 게시물 데이터`
          );
        },
      });

      // 파이프라인 실행
      await response.body.pipeThrough(progressTransform).pipeTo(collector);
    } catch (error) {
      console.error("Fetch 스트림 테스트 오류:", error);
      this.showNotification(`Fetch 테스트 실패: ${error.message}`, "error");
    }
  }

  // 프리셋 초기화
  initializePresets() {
    // 기본 프리셋들 설정
    const defaultPresets = [
      {
        name: "기본 텍스트 스트림",
        type: "readable",
        config: { type: "text", chunks: 10, delay: 100 },
      },
      {
        name: "실시간 로그 스트림",
        type: "readable",
        config: { type: "json", chunks: -1, delay: 1000 },
      },
      {
        name: "파일 출력 스트림",
        type: "writable",
        config: { target: "file", format: "text" },
      },
    ];

    // localStorage에 저장
    if (!localStorage.getItem("stream-presets")) {
      localStorage.setItem("stream-presets", JSON.stringify(defaultPresets));
    }
  }

  // 통계 업데이트
  updateStreamStats(action) {
    switch (action) {
      case "create":
        this.streamStats.totalStreams++;
        this.streamStats.activeStreams++;
        break;
      case "chunk":
        this.streamStats.chunksProcessed++;
        this.streamStats.bytesProcessed += 1024; // 예상 크기
        break;
      case "cancel":
      case "close":
      case "remove":
        this.streamStats.activeStreams = Math.max(
          0,
          this.streamStats.activeStreams - 1
        );
        break;
    }

    this.updateStats();
  }

  updateStats() {
    // UI 업데이트
    const totalStreamsEl = document.getElementById("totalStreams");
    const activeStreamsEl = document.getElementById("activeStreams");
    const chunksProcessedEl = document.getElementById("chunksProcessed");
    const bytesProcessedEl = document.getElementById("bytesProcessed");

    if (totalStreamsEl)
      totalStreamsEl.textContent = this.streamStats.totalStreams;
    if (activeStreamsEl)
      activeStreamsEl.textContent = this.streamStats.activeStreams;
    if (chunksProcessedEl)
      chunksProcessedEl.textContent = this.streamStats.chunksProcessed;
    if (bytesProcessedEl)
      bytesProcessedEl.textContent = this.formatBytes(
        this.streamStats.bytesProcessed
      );
  }

  updateCounter(data) {
    // 카운터 업데이트 로직 (예: 단어 수, 문자 수 등)
    const counter = document.getElementById("dataCounter");
    if (counter) {
      counter.textContent = parseInt(counter.textContent || "0") + 1;
    }
  }

  // 차트 업데이트 (간단한 시각화)
  updateCharts() {
    this.updateThroughputChart();
    this.updateLatencyChart();
  }

  updateThroughputChart() {
    const canvas = document.getElementById("throughputChart");
    const ctx = canvas.getContext("2d");

    // 간단한 처리량 차트 그리기
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(
      0,
      0,
      (this.streamStats.chunksProcessed / 100) * canvas.width,
      canvas.height
    );
  }

  updateLatencyChart() {
    const canvas = document.getElementById("latencyChart");
    const ctx = canvas.getContext("2d");

    // 간단한 지연시간 차트 그리기
    ctx.fillStyle = "#10b981";
    const latency = Math.random() * 100; // 시뮬레이션된 지연시간
    ctx.fillRect(0, 0, (latency / 100) * canvas.width, canvas.height);
  }

  // 유틸리티 메소드
  formatBytes(bytes) {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notification = document.createElement("div");

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    const icon = icons[type] || "ℹ️";

    notification.className = `notification ${type}`;
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

    notifications.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// 전역 접근을 위한 설정
window.streamAPI = null;

// 초기화
function initStreamAPI() {
  console.log("🚀 Stream API 초기화 함수 호출");
  window.streamAPI = new StreamAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initStreamAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initStreamAPI();
}

console.log(
  "📄 Stream API 스크립트 로드 완료, readyState:",
  document.readyState
);
