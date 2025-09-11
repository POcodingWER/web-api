import "./style.css";

console.log("🌐 WebSocket API 스크립트 시작!");

class WebSocketAPI {
  constructor() {
    this.connections = new Map();
    this.messageHistory = [];
    this.isAutoReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.currentServer = null;
    this.connectionStats = {
      totalMessages: 0,
      messagesSent: 0,
      messagesReceived: 0,
      reconnections: 0,
      totalConnections: 0,
    };
    this.init();
  }

  init() {
    console.log("🌐 WebSocket API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.startBuiltInServer();
    console.log("✅ WebSocket API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 WebSocket API 지원 여부 확인 중...");

    const support = {
      websocket: "WebSocket" in window,
      binaryType: "WebSocket" in window && "binaryType" in WebSocket.prototype,
      extensions: "WebSocket" in window && "extensions" in WebSocket.prototype,
      protocol: "WebSocket" in window && "protocol" in WebSocket.prototype,
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="websocket-container">
        <header class="websocket-header">
          <h1>🌐 WebSocket API</h1>
          <p>실시간 양방향 통신으로 채팅, 데이터 스트리밍, 멀티플레이어 게임을 체험하세요</p>
          <div class="api-support">
            <div class="support-badge ${
              support.websocket ? "supported" : "unsupported"
            }">
              ${support.websocket ? "✅ WebSocket" : "❌ WebSocket"}
            </div>
            <div class="support-badge ${
              support.binaryType ? "supported" : "unsupported"
            }">
              ${support.binaryType ? "✅ Binary Type" : "❌ Binary Type"}
            </div>
            <div class="support-badge ${
              support.extensions ? "supported" : "unsupported"
            }">
              ${support.extensions ? "✅ Extensions" : "❌ Extensions"}
            </div>
            <div class="support-badge ${
              support.protocol ? "supported" : "unsupported"
            }">
              ${support.protocol ? "✅ Protocol" : "❌ Protocol"}
            </div>
          </div>
        </header>

        <main class="websocket-main">
          <!-- 연결 관리 패널 -->
          <div class="connection-panel">
            <div class="panel-card primary">
              <h2>🔌 연결 관리</h2>
              
              <div class="connection-form">
                <div class="server-presets">
                  <h3>📡 서버 프리셋</h3>
                  <div class="preset-buttons">
                    <button id="connectBuiltIn" class="btn-primary">🏠 내장 서버</button>
                    <button id="connectEcho" class="btn-info">🔄 Echo Server</button>
                    <button id="connectDemo" class="btn-success">🎪 Demo Server</button>
                  </div>
                </div>

                <div class="custom-connection">
                  <h3>🔧 커스텀 연결</h3>
                  <div class="connection-inputs">
                    <div class="input-group">
                      <label for="serverUrl">서버 URL:</label>
                      <input type="text" id="serverUrl" value="ws://localhost:8080" placeholder="ws://localhost:8080">
                    </div>
                    <div class="input-group">
                      <label for="protocols">프로토콜 (선택):</label>
                      <input type="text" id="protocols" placeholder="chat, echo" title="쉼표로 구분">
                    </div>
                    <div class="connection-actions">
                      <button id="connectCustom" class="btn-primary">🔗 연결</button>
                      <button id="disconnect" class="btn-danger" disabled>❌ 연결 해제</button>
                    </div>
                  </div>
                </div>

                <div class="connection-options">
                  <h3>⚙️ 연결 옵션</h3>
                  <div class="options-grid">
                    <label class="checkbox-label">
                      <input type="checkbox" id="autoReconnect" checked>
                      <span class="checkmark"></span>
                      자동 재연결
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" id="binaryMode">
                      <span class="checkmark"></span>
                      바이너리 모드
                    </label>
                    <div class="option-group">
                      <label for="reconnectDelay">재연결 지연:</label>
                      <select id="reconnectDelay">
                        <option value="1000" selected>1초</option>
                        <option value="3000">3초</option>
                        <option value="5000">5초</option>
                        <option value="10000">10초</option>
                      </select>
                    </div>
                    <div class="option-group">
                      <label for="maxAttempts">최대 재시도:</label>
                      <select id="maxAttempts">
                        <option value="3">3회</option>
                        <option value="5" selected>5회</option>
                        <option value="10">10회</option>
                        <option value="0">무제한</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="connection-status">
                <div class="status-indicator">
                  <div class="status-light disconnected" id="connectionLight"></div>
                  <span class="status-text" id="connectionStatus">연결 끊김</span>
                </div>
                <div class="connection-info" id="connectionInfo">
                  <div class="info-item">
                    <span class="info-label">서버:</span>
                    <span class="info-value" id="serverInfo">-</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">프로토콜:</span>
                    <span class="info-value" id="protocolInfo">-</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">확장:</span>
                    <span class="info-value" id="extensionsInfo">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 메시징 패널 -->
          <div class="messaging-panel">
            <div class="panel-card full-width">
              <h2>💬 실시간 메시징</h2>
              
              <div class="messaging-tabs">
                <button class="messaging-tab-btn active" data-mode="chat">💬 채팅</button>
                <button class="messaging-tab-btn" data-mode="broadcast">📢 브로드캐스트</button>
                <button class="messaging-tab-btn" data-mode="binary">🔢 바이너리</button>
                <button class="messaging-tab-btn" data-mode="json">📋 JSON</button>
                <button class="messaging-tab-btn" data-mode="file">📁 파일 전송</button>
              </div>

              <div class="messaging-content">
                <!-- 채팅 모드 -->
                <div class="messaging-mode active" id="chatMode">
                  <div class="chat-container">
                    <div class="chat-messages" id="chatMessages">
                      <div class="system-message">
                        <span class="timestamp">${this.formatTime(
                          new Date()
                        )}</span>
                        <span class="message">💡 서버에 연결하여 채팅을 시작하세요</span>
                      </div>
                    </div>
                    
                    <div class="chat-input-area">
                      <div class="chat-controls">
                        <input type="text" id="username" placeholder="사용자명" value="User${Math.floor(
                          Math.random() * 1000
                        )}">
                        <select id="messageType">
                          <option value="text">텍스트</option>
                          <option value="emoji">이모지</option>
                          <option value="system">시스템</option>
                        </select>
                      </div>
                      <div class="chat-input-group">
                        <input type="text" id="chatInput" placeholder="메시지를 입력하세요..." maxlength="500">
                        <button id="sendMessage" class="btn-primary" disabled>전송</button>
                        <button id="clearChat" class="btn-warning">🗑️ 지우기</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 브로드캐스트 모드 -->
                <div class="messaging-mode" id="broadcastMode">
                  <div class="broadcast-container">
                    <h3>📢 브로드캐스트 메시지</h3>
                    <div class="broadcast-controls">
                      <select id="broadcastType">
                        <option value="announcement">📢 공지사항</option>
                        <option value="alert">⚠️ 경고</option>
                        <option value="info">ℹ️ 정보</option>
                        <option value="success">✅ 성공</option>
                      </select>
                      <input type="text" id="broadcastTitle" placeholder="제목">
                    </div>
                    <textarea id="broadcastMessage" placeholder="브로드캐스트 메시지를 입력하세요..." rows="4"></textarea>
                    <div class="broadcast-actions">
                      <button id="sendBroadcast" class="btn-success" disabled>📢 브로드캐스트</button>
                      <button id="scheduleBroadcast" class="btn-info" disabled>⏰ 예약 전송</button>
                    </div>
                  </div>
                </div>

                <!-- 바이너리 모드 -->
                <div class="messaging-mode" id="binaryMode">
                  <div class="binary-container">
                    <h3>🔢 바이너리 데이터 전송</h3>
                    <div class="binary-controls">
                      <select id="binaryType">
                        <option value="array">배열 데이터</option>
                        <option value="image">이미지 데이터</option>
                        <option value="audio">오디오 데이터</option>
                        <option value="custom">커스텀 바이너리</option>
                      </select>
                      <button id="generateBinary" class="btn-info">🎲 생성</button>
                    </div>
                    <div class="binary-preview" id="binaryPreview">
                      <div class="preview-placeholder">바이너리 데이터를 생성하거나 업로드하세요</div>
                    </div>
                    <div class="binary-actions">
                      <input type="file" id="binaryFile" accept="*/*" style="display: none;">
                      <button id="uploadBinary" class="btn-secondary">📁 파일 업로드</button>
                      <button id="sendBinary" class="btn-primary" disabled>📤 바이너리 전송</button>
                    </div>
                  </div>
                </div>

                <!-- JSON 모드 -->
                <div class="messaging-mode" id="jsonMode">
                  <div class="json-container">
                    <h3>📋 JSON 데이터 전송</h3>
                    <div class="json-templates">
                      <h4>템플릿:</h4>
                      <div class="template-buttons">
                        <button class="template-btn" data-template="user">👤 사용자 정보</button>
                        <button class="template-btn" data-template="order">🛒 주문 정보</button>
                        <button class="template-btn" data-template="status">📊 상태 정보</button>
                        <button class="template-btn" data-template="custom">🔧 커스텀</button>
                      </div>
                    </div>
                    <div class="json-editor">
                      <textarea id="jsonInput" placeholder="JSON 데이터를 입력하세요..." rows="8">{
  "type": "message",
  "data": {
    "text": "Hello WebSocket!",
    "timestamp": "${new Date().toISOString()}"
  }
}</textarea>
                    </div>
                    <div class="json-actions">
                      <button id="validateJson" class="btn-info">✅ 검증</button>
                      <button id="formatJson" class="btn-secondary">🎨 포맷</button>
                      <button id="sendJson" class="btn-primary" disabled>📤 JSON 전송</button>
                    </div>
                  </div>
                </div>

                <!-- 파일 전송 모드 -->
                <div class="messaging-mode" id="fileMode">
                  <div class="file-container">
                    <h3>📁 파일 전송</h3>
                    <div class="file-upload-area" id="fileUploadArea">
                      <div class="upload-placeholder">
                        <div class="upload-icon">📁</div>
                        <p>파일을 드래그하거나 클릭하여 선택하세요</p>
                        <p class="upload-limit">최대 크기: 10MB</p>
                      </div>
                      <input type="file" id="fileInput" multiple>
                    </div>
                    <div class="file-queue" id="fileQueue"></div>
                    <div class="file-actions">
                      <button id="clearQueue" class="btn-warning">🗑️ 대기열 비우기</button>
                      <button id="sendFiles" class="btn-primary" disabled>📤 파일 전송</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 실시간 데이터 스트리밍 -->
          <div class="streaming-panel">
            <div class="panel-card full-width">
              <h2>📊 실시간 데이터 스트리밍</h2>
              
              <div class="streaming-controls">
                <div class="stream-types">
                  <button class="stream-btn" data-stream="sensor" id="startSensorStream">
                    🌡️ 센서 데이터
                  </button>
                  <button class="stream-btn" data-stream="stock" id="startStockStream">
                    📈 주식 데이터
                  </button>
                  <button class="stream-btn" data-stream="log" id="startLogStream">
                    📝 로그 데이터
                  </button>
                  <button class="stream-btn" data-stream="game" id="startGameStream">
                    🎮 게임 데이터
                  </button>
                  <button id="stopAllStreams" class="btn-danger">⏹️ 모든 스트림 중지</button>
                </div>
                
                <div class="stream-settings">
                  <div class="setting-group">
                    <label for="streamInterval">스트림 간격:</label>
                    <select id="streamInterval">
                      <option value="100">100ms</option>
                      <option value="500">500ms</option>
                      <option value="1000" selected>1초</option>
                      <option value="5000">5초</option>
                    </select>
                  </div>
                  <div class="setting-group">
                    <label for="maxDataPoints">최대 데이터:</label>
                    <select id="maxDataPoints">
                      <option value="50">50개</option>
                      <option value="100" selected>100개</option>
                      <option value="200">200개</option>
                      <option value="500">500개</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="streaming-display">
                <div class="stream-charts">
                  <div class="chart-container">
                    <h4>📊 실시간 차트</h4>
                    <div class="chart-area" id="realtimeChart">
                      <div class="chart-placeholder">스트리밍을 시작하면 실시간 데이터가 표시됩니다</div>
                    </div>
                  </div>
                  
                  <div class="stream-data">
                    <h4>📋 최신 데이터</h4>
                    <div class="data-list" id="streamDataList">
                      <div class="data-placeholder">데이터 스트림이 없습니다</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 멀티플레이어 게임 -->
          <div class="game-panel">
            <div class="panel-card full-width">
              <h2>🎮 멀티플레이어 게임</h2>
              
              <div class="game-tabs">
                <button class="game-tab-btn active" data-game="clicker">🖱️ 클릭 게임</button>
                <button class="game-tab-btn" data-game="race">🏁 레이싱</button>
                <button class="game-tab-btn" data-game="snake">🐍 스네이크</button>
                <button class="game-tab-btn" data-game="drawing">🎨 드로잉</button>
              </div>

              <div class="game-content">
                <!-- 클릭 게임 -->
                <div class="game-mode active" id="clickerGame">
                  <div class="clicker-container">
                    <div class="game-info">
                      <h3>🖱️ 실시간 클릭 대전</h3>
                      <p>다른 플레이어와 클릭 속도를 경쟁하세요!</p>
                    </div>
                    
                    <div class="clicker-stats">
                      <div class="stat-item">
                        <span class="stat-label">내 점수:</span>
                        <span class="stat-value" id="myScore">0</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">온라인 플레이어:</span>
                        <span class="stat-value" id="onlinePlayers">0</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">게임 시간:</span>
                        <span class="stat-value" id="gameTime">00:00</span>
                      </div>
                    </div>

                    <div class="clicker-area">
                      <button id="clickButton" class="click-button" disabled>
                        <span class="click-text">클릭!</span>
                        <span class="click-effect"></span>
                      </button>
                    </div>

                    <div class="leaderboard">
                      <h4>🏆 실시간 순위</h4>
                      <div class="leaderboard-list" id="leaderboard">
                        <div class="leaderboard-placeholder">게임을 시작하면 순위가 표시됩니다</div>
                      </div>
                    </div>

                    <div class="game-controls">
                      <button id="startGame" class="btn-success">🚀 게임 시작</button>
                      <button id="stopGame" class="btn-danger" disabled>⏹️ 게임 종료</button>
                      <button id="resetScore" class="btn-warning">🔄 점수 리셋</button>
                    </div>
                  </div>
                </div>

                <!-- 레이싱 게임 -->
                <div class="game-mode" id="raceGame">
                  <div class="race-container">
                    <h3>🏁 멀티플레이어 레이싱</h3>
                    <div class="race-track" id="raceTrack">
                      <div class="track-placeholder">서버에 연결하면 레이스가 시작됩니다</div>
                    </div>
                    <div class="race-controls">
                      <button id="joinRace" class="btn-primary" disabled>🏁 레이스 참가</button>
                      <button id="leaveRace" class="btn-danger" disabled>🚪 나가기</button>
                    </div>
                  </div>
                </div>

                <!-- 스네이크 게임 -->
                <div class="game-mode" id="snakeGame">
                  <div class="snake-container">
                    <h3>🐍 멀티플레이어 스네이크</h3>
                    <div class="snake-arena" id="snakeArena">
                      <div class="arena-placeholder">게임이 준비되지 않았습니다</div>
                    </div>
                    <div class="snake-controls">
                      <button id="joinSnake" class="btn-primary" disabled>🐍 게임 참가</button>
                      <div class="arrow-keys">
                        <button class="arrow-btn">↑</button>
                        <div class="arrow-row">
                          <button class="arrow-btn">←</button>
                          <button class="arrow-btn">→</button>
                        </div>
                        <button class="arrow-btn">↓</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 드로잉 게임 -->
                <div class="game-mode" id="drawingGame">
                  <div class="drawing-container">
                    <h3>🎨 협업 드로잉</h3>
                    <div class="drawing-tools">
                      <select id="brushColor">
                        <option value="#000000">검정</option>
                        <option value="#ff0000">빨강</option>
                        <option value="#00ff00">초록</option>
                        <option value="#0000ff">파랑</option>
                        <option value="#ffff00">노랑</option>
                      </select>
                      <input type="range" id="brushSize" min="1" max="20" value="5">
                      <button id="clearCanvas" class="btn-warning">🗑️ 지우기</button>
                    </div>
                    <canvas id="drawingCanvas" width="600" height="400"></canvas>
                    <div class="drawing-participants" id="drawingParticipants">
                      <div class="participants-placeholder">참가자가 없습니다</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 연결 모니터링 -->
          <div class="monitoring-panel">
            <div class="panel-card full-width">
              <h2>📊 연결 모니터링</h2>
              
              <div class="monitoring-stats">
                <div class="stat-card">
                  <div class="stat-icon">📨</div>
                  <div class="stat-info">
                    <span class="stat-label">총 메시지</span>
                    <span class="stat-value" id="totalMessages">0</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📤</div>
                  <div class="stat-info">
                    <span class="stat-label">전송한 메시지</span>
                    <span class="stat-value" id="sentMessages">0</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">📥</div>
                  <div class="stat-info">
                    <span class="stat-label">받은 메시지</span>
                    <span class="stat-value" id="receivedMessages">0</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">🔄</div>
                  <div class="stat-info">
                    <span class="stat-label">재연결 횟수</span>
                    <span class="stat-value" id="reconnections">0</span>
                  </div>
                </div>
              </div>

              <div class="monitoring-logs">
                <h3>📝 연결 로그</h3>
                <div class="log-controls">
                  <button id="clearLogs" class="btn-warning">🗑️ 로그 지우기</button>
                  <button id="exportLogs" class="btn-info">📤 로그 내보내기</button>
                  <label class="checkbox-label">
                    <input type="checkbox" id="autoScroll" checked>
                    <span class="checkmark"></span>
                    자동 스크롤
                  </label>
                </div>
                <div class="log-display" id="logDisplay">
                  <div class="log-placeholder">연결 로그가 여기에 표시됩니다</div>
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
    // 연결 관련
    document
      .getElementById("connectBuiltIn")
      ?.addEventListener("click", () => this.connectToBuiltInServer());
    document
      .getElementById("connectEcho")
      ?.addEventListener("click", () => this.connectToEchoServer());
    document
      .getElementById("connectDemo")
      ?.addEventListener("click", () => this.connectToDemoServer());
    document
      .getElementById("connectCustom")
      ?.addEventListener("click", () => this.connectToCustomServer());
    document
      .getElementById("disconnect")
      ?.addEventListener("click", () => this.disconnect());

    // 설정 변경
    document
      .getElementById("autoReconnect")
      ?.addEventListener("change", (e) => {
        this.isAutoReconnect = e.target.checked;
      });
    document
      .getElementById("reconnectDelay")
      ?.addEventListener("change", (e) => {
        this.reconnectDelay = parseInt(e.target.value);
      });
    document.getElementById("maxAttempts")?.addEventListener("change", (e) => {
      this.maxReconnectAttempts = parseInt(e.target.value);
    });

    // 메시징 탭
    document.querySelectorAll(".messaging-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchMessagingMode(e.target.dataset.mode);
      });
    });

    // 채팅 관련
    document
      .getElementById("sendMessage")
      ?.addEventListener("click", () => this.sendChatMessage());
    document.getElementById("chatInput")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendChatMessage();
    });
    document
      .getElementById("clearChat")
      ?.addEventListener("click", () => this.clearChat());

    // 브로드캐스트 관련
    document
      .getElementById("sendBroadcast")
      ?.addEventListener("click", () => this.sendBroadcast());
    document
      .getElementById("scheduleBroadcast")
      ?.addEventListener("click", () => this.scheduleBroadcast());

    // 바이너리 관련
    document
      .getElementById("generateBinary")
      ?.addEventListener("click", () => this.generateBinaryData());
    document
      .getElementById("uploadBinary")
      ?.addEventListener("click", () =>
        document.getElementById("binaryFile").click()
      );
    document
      .getElementById("binaryFile")
      ?.addEventListener("change", (e) => this.handleBinaryUpload(e));
    document
      .getElementById("sendBinary")
      ?.addEventListener("click", () => this.sendBinaryData());

    // JSON 관련
    document.querySelectorAll(".template-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.loadJsonTemplate(e.target.dataset.template)
      );
    });
    document
      .getElementById("validateJson")
      ?.addEventListener("click", () => this.validateJson());
    document
      .getElementById("formatJson")
      ?.addEventListener("click", () => this.formatJson());
    document
      .getElementById("sendJson")
      ?.addEventListener("click", () => this.sendJsonData());

    // 파일 전송 관련
    document
      .getElementById("fileInput")
      ?.addEventListener("change", (e) => this.handleFileSelection(e));
    document
      .getElementById("clearQueue")
      ?.addEventListener("click", () => this.clearFileQueue());
    document
      .getElementById("sendFiles")
      ?.addEventListener("click", () => this.sendFiles());

    // 드래그 앤 드롭
    const uploadArea = document.getElementById("fileUploadArea");
    uploadArea?.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("drag-over");
    });
    uploadArea?.addEventListener("dragleave", () => {
      uploadArea.classList.remove("drag-over");
    });
    uploadArea?.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("drag-over");
      this.handleFileDrop(e);
    });
    uploadArea?.addEventListener("click", () =>
      document.getElementById("fileInput").click()
    );

    // 스트리밍 관련
    document
      .getElementById("startSensorStream")
      ?.addEventListener("click", () => this.startDataStream("sensor"));
    document
      .getElementById("startStockStream")
      ?.addEventListener("click", () => this.startDataStream("stock"));
    document
      .getElementById("startLogStream")
      ?.addEventListener("click", () => this.startDataStream("log"));
    document
      .getElementById("startGameStream")
      ?.addEventListener("click", () => this.startDataStream("game"));
    document
      .getElementById("stopAllStreams")
      ?.addEventListener("click", () => this.stopAllStreams());

    // 게임 탭
    document.querySelectorAll(".game-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchGameMode(e.target.dataset.game);
      });
    });

    // 클릭 게임
    document
      .getElementById("startGame")
      ?.addEventListener("click", () => this.startClickerGame());
    document
      .getElementById("stopGame")
      ?.addEventListener("click", () => this.stopClickerGame());
    document
      .getElementById("resetScore")
      ?.addEventListener("click", () => this.resetClickerScore());
    document
      .getElementById("clickButton")
      ?.addEventListener("click", () => this.handleGameClick());

    // 레이싱 게임
    document
      .getElementById("joinRace")
      ?.addEventListener("click", () => this.joinRace());
    document
      .getElementById("leaveRace")
      ?.addEventListener("click", () => this.leaveRace());

    // 스네이크 게임
    document
      .getElementById("joinSnake")
      ?.addEventListener("click", () => this.joinSnakeGame());

    // 드로잉 게임
    this.setupDrawingCanvas();

    // 모니터링 관련
    document
      .getElementById("clearLogs")
      ?.addEventListener("click", () => this.clearLogs());
    document
      .getElementById("exportLogs")
      ?.addEventListener("click", () => this.exportLogs());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  // 내장 서버 시뮬레이션
  startBuiltInServer() {
    this.builtInServerActive = true;
    this.logMessage("info", "내장 서버 시뮬레이션 활성화");
  }

  connectToBuiltInServer() {
    this.connectToServer("ws://localhost:8080", ["chat", "game"], true);
  }

  connectToEchoServer() {
    this.connectToServer("wss://echo.websocket.org", [], false);
  }

  connectToDemoServer() {
    this.connectToServer("ws://localhost:9090", ["demo"], true);
  }

  connectToCustomServer() {
    const url = document.getElementById("serverUrl")?.value?.trim();
    const protocols = document.getElementById("protocols")?.value?.trim();

    if (!url) {
      this.showNotification("서버 URL을 입력하세요", "warning");
      return;
    }

    const protocolList = protocols
      ? protocols.split(",").map((p) => p.trim())
      : [];
    this.connectToServer(url, protocolList, false);
  }

  connectToServer(url, protocols = [], isSimulated = false) {
    if (
      this.currentConnection &&
      this.currentConnection.readyState === WebSocket.OPEN
    ) {
      this.showNotification("이미 연결되어 있습니다", "warning");
      return;
    }

    this.logMessage("info", `서버 연결 시도: ${url}`);
    this.updateConnectionStatus("연결 중...", "connecting");

    try {
      if (isSimulated) {
        // 시뮬레이션 연결
        this.currentConnection = this.createSimulatedConnection(url, protocols);
      } else {
        // 실제 WebSocket 연결
        this.currentConnection =
          protocols.length > 0
            ? new WebSocket(url, protocols)
            : new WebSocket(url);
      }

      this.currentServer = url;
      this.setupConnectionHandlers();
    } catch (error) {
      this.logMessage("error", `연결 실패: ${error.message}`);
      this.updateConnectionStatus("연결 실패", "error");
      this.showNotification("연결 실패", "error");
    }
  }

  createSimulatedConnection(url, protocols) {
    // 시뮬레이션된 WebSocket 연결
    const simulatedWS = {
      url: url,
      protocol: protocols[0] || "",
      extensions: "",
      readyState: WebSocket.CONNECTING,
      binaryType: "blob",
      send: (data) => {
        this.handleSimulatedSend(data);
      },
      close: () => {
        this.handleSimulatedClose();
      },
    };

    // 연결 성공 시뮬레이션
    setTimeout(() => {
      simulatedWS.readyState = WebSocket.OPEN;
      if (simulatedWS.onopen) simulatedWS.onopen();
    }, 1000);

    return simulatedWS;
  }

  setupConnectionHandlers() {
    const ws = this.currentConnection;

    ws.onopen = () => {
      this.connectionStats.totalConnections++;
      this.reconnectAttempts = 0;
      this.logMessage("success", `서버 연결 성공: ${this.currentServer}`);
      this.updateConnectionStatus("연결됨", "connected");
      this.updateConnectionInfo();
      this.enableControls(true);
      this.showNotification("서버에 연결되었습니다", "success");
    };

    ws.onmessage = (event) => {
      this.handleIncomingMessage(event);
    };

    ws.onclose = (event) => {
      this.logMessage(
        "warning",
        `연결 종료: ${event.code} - ${event.reason || "알 수 없는 이유"}`
      );
      this.updateConnectionStatus("연결 끊김", "disconnected");
      this.enableControls(false);

      if (
        this.isAutoReconnect &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.attemptReconnect();
      } else {
        this.showNotification("서버 연결이 끊어졌습니다", "warning");
      }
    };

    ws.onerror = (error) => {
      this.logMessage(
        "error",
        `연결 오류: ${error.message || "알 수 없는 오류"}`
      );
      this.showNotification("연결 오류가 발생했습니다", "error");
    };
  }

  handleSimulatedSend(data) {
    this.connectionStats.messagesSent++;
    this.connectionStats.totalMessages++;
    this.updateStats();

    // 에코 응답 시뮬레이션
    setTimeout(() => {
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "chat") {
            this.simulateIncomingMessage({
              type: "chat",
              username: "Server Bot",
              message: `Echo: ${parsed.message}`,
              timestamp: Date.now(),
            });
          } else if (parsed.type === "game") {
            this.handleGameMessage(parsed);
          }
        } catch {
          // 일반 텍스트 메시지
          this.simulateIncomingMessage({
            type: "echo",
            message: `Echo: ${data}`,
            timestamp: Date.now(),
          });
        }
      }
    }, 100 + Math.random() * 500);
  }

  simulateIncomingMessage(messageData) {
    const event = {
      data: JSON.stringify(messageData),
      type: "message",
    };
    this.handleIncomingMessage(event);
  }

  handleSimulatedClose() {
    this.currentConnection.readyState = WebSocket.CLOSED;
    if (this.currentConnection.onclose) {
      this.currentConnection.onclose({ code: 1000, reason: "시뮬레이션 종료" });
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    this.connectionStats.reconnections++;
    this.updateStats();

    this.logMessage(
      "info",
      `재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );
    this.updateConnectionStatus(
      `재연결 중... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      "connecting"
    );

    setTimeout(() => {
      if (this.currentServer) {
        this.connectToServer(this.currentServer, [], this.builtInServerActive);
      }
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.currentConnection) {
      this.isAutoReconnect = false;
      this.currentConnection.close(1000, "사용자 요청");
      this.currentConnection = null;
      this.currentServer = null;
      this.logMessage("info", "사용자가 연결을 종료했습니다");
    }
  }

  updateConnectionStatus(status, state) {
    const statusElement = document.getElementById("connectionStatus");
    const lightElement = document.getElementById("connectionLight");

    if (statusElement) statusElement.textContent = status;
    if (lightElement) {
      lightElement.className = `status-light ${state}`;
    }
  }

  updateConnectionInfo() {
    const ws = this.currentConnection;
    if (!ws) return;

    document.getElementById("serverInfo").textContent =
      ws.url || this.currentServer;
    document.getElementById("protocolInfo").textContent = ws.protocol || "없음";
    document.getElementById("extensionsInfo").textContent =
      ws.extensions || "없음";
  }

  enableControls(enabled) {
    // 연결 관련 버튼
    document.getElementById("disconnect").disabled = !enabled;

    // 메시징 관련 버튼
    document.getElementById("sendMessage").disabled = !enabled;
    document.getElementById("sendBroadcast").disabled = !enabled;
    document.getElementById("scheduleBroadcast").disabled = !enabled;
    document.getElementById("sendBinary").disabled = !enabled;
    document.getElementById("sendJson").disabled = !enabled;
    document.getElementById("sendFiles").disabled = !enabled;

    // 게임 관련 버튼
    document.getElementById("clickButton").disabled = !enabled;
    document.getElementById("joinRace").disabled = !enabled;
    document.getElementById("joinSnake").disabled = !enabled;

    // 연결 버튼들
    const connectButtons = [
      "connectBuiltIn",
      "connectEcho",
      "connectDemo",
      "connectCustom",
    ];
    connectButtons.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = enabled;
    });
  }

  // 메시징 기능
  switchMessagingMode(mode) {
    document
      .querySelectorAll(".messaging-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

    document
      .querySelectorAll(".messaging-mode")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(`${mode}Mode`).classList.add("active");
  }

  sendChatMessage() {
    const input = document.getElementById("chatInput");
    const username =
      document.getElementById("username")?.value?.trim() || "익명";
    const messageType = document.getElementById("messageType")?.value || "text";
    const message = input?.value?.trim();

    if (!message) {
      this.showNotification("메시지를 입력하세요", "warning");
      return;
    }

    const chatData = {
      type: "chat",
      messageType,
      username,
      message,
      timestamp: Date.now(),
    };

    this.sendMessage(chatData);
    this.addChatMessage(chatData, true);
    input.value = "";
  }

  addChatMessage(data, isSent = false) {
    const container = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");

    const messageClass = isSent
      ? "sent-message"
      : data.username === "System"
      ? "system-message"
      : "received-message";

    messageDiv.className = `chat-message ${messageClass}`;

    const emoji =
      data.messageType === "emoji"
        ? "😊"
        : data.messageType === "system"
        ? "🔧"
        : "💬";

    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="username">${emoji} ${data.username}</span>
        <span class="timestamp">${this.formatTime(
          new Date(data.timestamp)
        )}</span>
      </div>
      <div class="message-content">${this.escapeHtml(data.message)}</div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  clearChat() {
    const container = document.getElementById("chatMessages");
    container.innerHTML = `
      <div class="system-message">
        <span class="timestamp">${this.formatTime(new Date())}</span>
        <span class="message">💡 채팅이 초기화되었습니다</span>
      </div>
    `;
  }

  sendBroadcast() {
    const type = document.getElementById("broadcastType")?.value;
    const title = document.getElementById("broadcastTitle")?.value?.trim();
    const message = document.getElementById("broadcastMessage")?.value?.trim();

    if (!title || !message) {
      this.showNotification("제목과 메시지를 모두 입력하세요", "warning");
      return;
    }

    const broadcastData = {
      type: "broadcast",
      broadcastType: type,
      title,
      message,
      timestamp: Date.now(),
    };

    this.sendMessage(broadcastData);
    this.showNotification("브로드캐스트 메시지를 전송했습니다", "success");

    // 입력 필드 초기화
    document.getElementById("broadcastTitle").value = "";
    document.getElementById("broadcastMessage").value = "";
  }

  scheduleBroadcast() {
    this.showNotification("예약 전송 기능은 서버 구현이 필요합니다", "info");
  }

  generateBinaryData() {
    const type = document.getElementById("binaryType")?.value;
    let binaryData;
    let preview;

    switch (type) {
      case "array":
        binaryData = new Uint8Array(
          Array.from({ length: 100 }, () => Math.floor(Math.random() * 256))
        );
        preview = `배열 데이터 (${binaryData.length} bytes): [${Array.from(
          binaryData.slice(0, 10)
        ).join(", ")}...]`;
        break;
      case "image":
        binaryData = new Uint8Array(
          Array.from({ length: 1024 }, () => Math.floor(Math.random() * 256))
        );
        preview = `이미지 데이터 시뮬레이션 (${binaryData.length} bytes)`;
        break;
      case "audio":
        binaryData = new Uint8Array(
          Array.from({ length: 2048 }, () => Math.floor(Math.random() * 256))
        );
        preview = `오디오 데이터 시뮬레이션 (${binaryData.length} bytes)`;
        break;
      default:
        binaryData = new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
        ]); // "Hello World"
        preview = `커스텀 바이너리: "Hello World" (${binaryData.length} bytes)`;
    }

    this.currentBinaryData = binaryData;
    document.getElementById("binaryPreview").innerHTML = `
      <div class="binary-info">
        <h4>생성된 바이너리 데이터</h4>
        <p>${preview}</p>
        <div class="binary-hex">
          Hex: ${Array.from(binaryData.slice(0, 16))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ")}
          ${binaryData.length > 16 ? "..." : ""}
        </div>
      </div>
    `;
  }

  handleBinaryUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentBinaryData = new Uint8Array(e.target.result);
      document.getElementById("binaryPreview").innerHTML = `
        <div class="binary-info">
          <h4>업로드된 파일</h4>
          <p>파일명: ${file.name}</p>
          <p>크기: ${file.size} bytes</p>
          <p>타입: ${file.type || "알 수 없음"}</p>
        </div>
      `;
    };
    reader.readAsArrayBuffer(file);
  }

  sendBinaryData() {
    if (!this.currentBinaryData) {
      this.showNotification("전송할 바이너리 데이터가 없습니다", "warning");
      return;
    }

    if (
      this.currentConnection &&
      this.currentConnection.readyState === WebSocket.OPEN
    ) {
      this.currentConnection.send(this.currentBinaryData);
      this.connectionStats.messagesSent++;
      this.connectionStats.totalMessages++;
      this.updateStats();
      this.showNotification(
        `바이너리 데이터 전송 완료 (${this.currentBinaryData.length} bytes)`,
        "success"
      );
      this.logMessage(
        "info",
        `바이너리 데이터 전송: ${this.currentBinaryData.length} bytes`
      );
    } else {
      this.showNotification("서버에 연결되어 있지 않습니다", "error");
    }
  }

  loadJsonTemplate(template) {
    const textarea = document.getElementById("jsonInput");
    let jsonData;

    switch (template) {
      case "user":
        jsonData = {
          type: "user",
          data: {
            id: Math.floor(Math.random() * 10000),
            username: "user123",
            email: "user@example.com",
            status: "online",
            lastSeen: new Date().toISOString(),
          },
        };
        break;
      case "order":
        jsonData = {
          type: "order",
          data: {
            orderId: `ORD-${Date.now()}`,
            customerId: 12345,
            items: [
              { id: 1, name: "상품A", quantity: 2, price: 10000 },
              { id: 2, name: "상품B", quantity: 1, price: 25000 },
            ],
            total: 45000,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        };
        break;
      case "status":
        jsonData = {
          type: "status",
          data: {
            server: "웹소켓 서버",
            uptime: "2일 14시간 30분",
            connections: Math.floor(Math.random() * 100),
            memoryUsage: `${Math.floor(Math.random() * 80 + 20)}%`,
            cpuUsage: `${Math.floor(Math.random() * 60 + 10)}%`,
            timestamp: new Date().toISOString(),
          },
        };
        break;
      default:
        jsonData = {
          type: "custom",
          data: {
            message: "커스텀 JSON 메시지",
            value: Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
          },
        };
    }

    textarea.value = JSON.stringify(jsonData, null, 2);
  }

  validateJson() {
    const textarea = document.getElementById("jsonInput");
    try {
      JSON.parse(textarea.value);
      this.showNotification("유효한 JSON 형식입니다", "success");
    } catch (error) {
      this.showNotification(`JSON 형식 오류: ${error.message}`, "error");
    }
  }

  formatJson() {
    const textarea = document.getElementById("jsonInput");
    try {
      const parsed = JSON.parse(textarea.value);
      textarea.value = JSON.stringify(parsed, null, 2);
      this.showNotification("JSON 형식이 정리되었습니다", "success");
    } catch (error) {
      this.showNotification("유효하지 않은 JSON입니다", "error");
    }
  }

  sendJsonData() {
    const textarea = document.getElementById("jsonInput");
    try {
      const jsonData = JSON.parse(textarea.value);
      this.sendMessage(jsonData);
      this.showNotification("JSON 데이터를 전송했습니다", "success");
    } catch (error) {
      this.showNotification("유효하지 않은 JSON입니다", "error");
    }
  }

  // 파일 전송 관련
  handleFileSelection(event) {
    const files = Array.from(event.target.files);
    this.addFilesToQueue(files);
  }

  handleFileDrop(event) {
    const files = Array.from(event.dataTransfer.files);
    this.addFilesToQueue(files);
  }

  addFilesToQueue(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        this.showNotification(
          `파일 크기가 너무 큽니다: ${file.name}`,
          "warning"
        );
        return false;
      }
      return true;
    });

    this.fileQueue = (this.fileQueue || []).concat(validFiles);
    this.updateFileQueueDisplay();
  }

  updateFileQueueDisplay() {
    const container = document.getElementById("fileQueue");

    if (!this.fileQueue || this.fileQueue.length === 0) {
      container.innerHTML = "";
      document.getElementById("sendFiles").disabled = true;
      return;
    }

    container.innerHTML = this.fileQueue
      .map(
        (file, index) => `
      <div class="file-queue-item">
        <div class="file-info">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${this.formatFileSize(file.size)}</span>
        </div>
        <button class="btn-small btn-danger" onclick="window.webSocketAPI.removeFromQueue(${index})">삭제</button>
      </div>
    `
      )
      .join("");

    document.getElementById("sendFiles").disabled = false;
  }

  removeFromQueue(index) {
    this.fileQueue.splice(index, 1);
    this.updateFileQueueDisplay();
  }

  clearFileQueue() {
    this.fileQueue = [];
    this.updateFileQueueDisplay();
  }

  async sendFiles() {
    if (!this.fileQueue || this.fileQueue.length === 0) return;

    for (const file of this.fileQueue) {
      try {
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const fileData = {
          type: "file",
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: Array.from(new Uint8Array(arrayBuffer)),
          timestamp: Date.now(),
        };

        this.sendMessage(fileData);
        this.logMessage(
          "info",
          `파일 전송: ${file.name} (${this.formatFileSize(file.size)})`
        );
      } catch (error) {
        this.showNotification(`파일 전송 실패: ${file.name}`, "error");
      }
    }

    this.showNotification(
      `${this.fileQueue.length}개 파일을 전송했습니다`,
      "success"
    );
    this.clearFileQueue();
  }

  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // 메시지 전송
  sendMessage(data) {
    if (
      !this.currentConnection ||
      this.currentConnection.readyState !== WebSocket.OPEN
    ) {
      this.showNotification("서버에 연결되어 있지 않습니다", "error");
      return;
    }

    const message = typeof data === "string" ? data : JSON.stringify(data);
    this.currentConnection.send(message);

    this.connectionStats.messagesSent++;
    this.connectionStats.totalMessages++;
    this.updateStats();

    this.logMessage(
      "info",
      `메시지 전송: ${message.substring(0, 100)}${
        message.length > 100 ? "..." : ""
      }`
    );
  }

  handleIncomingMessage(event) {
    this.connectionStats.messagesReceived++;
    this.connectionStats.totalMessages++;
    this.updateStats();

    try {
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        this.processIncomingData(data);
      } else {
        // 바이너리 데이터
        this.processBinaryData(event.data);
      }
    } catch (error) {
      // 일반 텍스트 메시지
      this.addChatMessage({
        type: "text",
        username: "Server",
        message: event.data,
        timestamp: Date.now(),
      });
    }

    this.logMessage(
      "info",
      `메시지 수신: ${event.data.toString().substring(0, 100)}`
    );
  }

  processIncomingData(data) {
    switch (data.type) {
      case "chat":
        this.addChatMessage(data);
        break;
      case "broadcast":
        this.showBroadcastMessage(data);
        break;
      case "game":
        this.handleGameMessage(data);
        break;
      case "stream":
        this.handleStreamData(data);
        break;
      case "file":
        this.handleFileReceived(data);
        break;
      default:
        this.addChatMessage({
          type: "system",
          username: "System",
          message: `알 수 없는 메시지 타입: ${data.type}`,
          timestamp: Date.now(),
        });
    }
  }

  processBinaryData(data) {
    this.logMessage(
      "info",
      `바이너리 데이터 수신: ${data.size || data.byteLength} bytes`
    );
    this.showNotification(
      `바이너리 데이터를 받았습니다 (${data.size || data.byteLength} bytes)`,
      "info"
    );
  }

  showBroadcastMessage(data) {
    const icon =
      {
        announcement: "📢",
        alert: "⚠️",
        info: "ℹ️",
        success: "✅",
      }[data.broadcastType] || "📢";

    this.addChatMessage({
      type: "broadcast",
      username: `${icon} ${data.title}`,
      message: data.message,
      timestamp: data.timestamp,
    });

    this.showNotification(`브로드캐스트: ${data.title}`, "info");
  }

  handleFileReceived(data) {
    this.logMessage(
      "info",
      `파일 수신: ${data.name} (${this.formatFileSize(data.size)})`
    );

    this.addChatMessage({
      type: "file",
      username: "File Transfer",
      message: `📁 파일 수신: ${data.name} (${this.formatFileSize(data.size)})`,
      timestamp: data.timestamp,
    });

    // 파일 다운로드 링크 생성
    if (data.data) {
      const uint8Array = new Uint8Array(data.data);
      const blob = new Blob([uint8Array], { type: data.mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = data.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // 데이터 스트리밍
  startDataStream(type) {
    if (this.activeStreams && this.activeStreams.has(type)) {
      this.showNotification(`${type} 스트림이 이미 실행 중입니다`, "warning");
      return;
    }

    const interval =
      parseInt(document.getElementById("streamInterval")?.value) || 1000;

    if (!this.activeStreams) this.activeStreams = new Map();

    const streamId = setInterval(() => {
      const data = this.generateStreamData(type);
      this.sendMessage({
        type: "stream",
        streamType: type,
        data: data,
        timestamp: Date.now(),
      });
      this.updateStreamDisplay(type, data);
    }, interval);

    this.activeStreams.set(type, streamId);

    const button = document.getElementById(
      `start${type.charAt(0).toUpperCase() + type.slice(1)}Stream`
    );
    if (button) {
      button.textContent = `⏹️ ${button.textContent.split(" ")[1]} 중지`;
      button.onclick = () => this.stopDataStream(type);
    }

    this.showNotification(`${type} 데이터 스트리밍을 시작했습니다`, "success");
  }

  generateStreamData(type) {
    switch (type) {
      case "sensor":
        return {
          temperature: (Math.random() * 40 - 10).toFixed(1),
          humidity: (Math.random() * 100).toFixed(1),
          pressure: (1000 + Math.random() * 50).toFixed(1),
        };
      case "stock":
        return {
          symbol: "AAPL",
          price: (150 + Math.random() * 20 - 10).toFixed(2),
          volume: Math.floor(Math.random() * 1000000),
          change: (Math.random() * 10 - 5).toFixed(2),
        };
      case "log":
        const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
        return {
          level: levels[Math.floor(Math.random() * levels.length)],
          message: `시스템 로그 메시지 ${Math.floor(Math.random() * 1000)}`,
          source: "WebSocketAPI",
        };
      case "game":
        return {
          players: Math.floor(Math.random() * 50),
          score: Math.floor(Math.random() * 10000),
          level: Math.floor(Math.random() * 10) + 1,
        };
      default:
        return { value: Math.random() };
    }
  }

  handleStreamData(data) {
    this.updateStreamDisplay(data.streamType, data.data);
  }

  updateStreamDisplay(type, data) {
    const maxPoints =
      parseInt(document.getElementById("maxDataPoints")?.value) || 100;

    if (!this.streamData) this.streamData = new Map();
    if (!this.streamData.has(type)) this.streamData.set(type, []);

    const typeData = this.streamData.get(type);
    typeData.push({ ...data, timestamp: Date.now() });

    if (typeData.length > maxPoints) {
      typeData.shift();
    }

    this.updateStreamChart();
    this.updateStreamList();
  }

  updateStreamChart() {
    const chartContainer = document.getElementById("realtimeChart");

    if (!this.streamData || this.streamData.size === 0) {
      chartContainer.innerHTML =
        '<div class="chart-placeholder">스트리밍을 시작하면 실시간 데이터가 표시됩니다</div>';
      return;
    }

    let chartHtml = '<div class="chart-content">';

    for (const [type, data] of this.streamData) {
      if (data.length > 0) {
        const latest = data[data.length - 1];
        chartHtml += `
          <div class="stream-chart">
            <h5>${type.toUpperCase()} 스트림</h5>
            <div class="chart-line">
              ${Object.entries(latest)
                .filter(([key]) => key !== "timestamp")
                .map(
                  ([key, value]) =>
                    `<span class="data-point">${key}: ${value}</span>`
                )
                .join("")}
            </div>
            <div class="data-count">${data.length}개 데이터 포인트</div>
          </div>
        `;
      }
    }

    chartHtml += "</div>";
    chartContainer.innerHTML = chartHtml;
  }

  updateStreamList() {
    const listContainer = document.getElementById("streamDataList");

    if (!this.streamData || this.streamData.size === 0) {
      listContainer.innerHTML =
        '<div class="data-placeholder">데이터 스트림이 없습니다</div>';
      return;
    }

    let listHtml = "";

    for (const [type, data] of this.streamData) {
      if (data.length > 0) {
        const latest = data[data.length - 1];
        listHtml += `
          <div class="stream-item">
            <div class="stream-header">
              <span class="stream-type">${type.toUpperCase()}</span>
              <span class="stream-time">${this.formatTime(
                new Date(latest.timestamp)
              )}</span>
            </div>
            <div class="stream-data">
              ${Object.entries(latest)
                .filter(([key]) => key !== "timestamp")
                .map(
                  ([key, value]) =>
                    `<span class="data-field">${key}: <strong>${value}</strong></span>`
                )
                .join(" | ")}
            </div>
          </div>
        `;
      }
    }

    listContainer.innerHTML = listHtml;
  }

  stopDataStream(type) {
    if (this.activeStreams && this.activeStreams.has(type)) {
      clearInterval(this.activeStreams.get(type));
      this.activeStreams.delete(type);

      const button = document.getElementById(
        `start${type.charAt(0).toUpperCase() + type.slice(1)}Stream`
      );
      if (button) {
        const originalText = button.textContent.split(" ")[1];
        button.textContent = `🔄 ${originalText}`;
        button.onclick = () => this.startDataStream(type);
      }

      this.showNotification(`${type} 스트리밍이 중지되었습니다`, "info");
    }
  }

  stopAllStreams() {
    if (this.activeStreams) {
      for (const [type, intervalId] of this.activeStreams) {
        clearInterval(intervalId);
        this.stopDataStream(type);
      }
      this.activeStreams.clear();
      this.showNotification("모든 데이터 스트리밍이 중지되었습니다", "info");
    }
  }

  // 게임 기능
  switchGameMode(game) {
    document
      .querySelectorAll(".game-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-game="${game}"]`).classList.add("active");

    document
      .querySelectorAll(".game-mode")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(`${game}Game`).classList.add("active");
  }

  startClickerGame() {
    this.gameData = {
      score: 0,
      startTime: Date.now(),
      isActive: true,
    };

    document.getElementById("startGame").disabled = true;
    document.getElementById("stopGame").disabled = false;
    document.getElementById("clickButton").disabled = false;

    this.gameTimer = setInterval(() => {
      this.updateGameTime();
    }, 1000);

    this.sendMessage({
      type: "game",
      action: "join",
      game: "clicker",
      timestamp: Date.now(),
    });

    this.showNotification("클릭 게임을 시작했습니다!", "success");
  }

  stopClickerGame() {
    if (this.gameData) {
      this.gameData.isActive = false;
    }

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    document.getElementById("startGame").disabled = false;
    document.getElementById("stopGame").disabled = true;
    document.getElementById("clickButton").disabled = true;

    this.sendMessage({
      type: "game",
      action: "leave",
      game: "clicker",
      timestamp: Date.now(),
    });

    this.showNotification("클릭 게임을 종료했습니다", "info");
  }

  resetClickerScore() {
    if (this.gameData) {
      this.gameData.score = 0;
      document.getElementById("myScore").textContent = "0";
      this.showNotification("점수를 리셋했습니다", "info");
    }
  }

  handleGameClick() {
    if (!this.gameData || !this.gameData.isActive) return;

    this.gameData.score++;
    document.getElementById("myScore").textContent = this.gameData.score;

    // 클릭 효과
    const button = document.getElementById("clickButton");
    button.classList.add("clicked");
    setTimeout(() => button.classList.remove("clicked"), 150);

    // 서버에 점수 전송
    this.sendMessage({
      type: "game",
      action: "score",
      game: "clicker",
      score: this.gameData.score,
      timestamp: Date.now(),
    });
  }

  updateGameTime() {
    if (this.gameData && this.gameData.startTime) {
      const elapsed = Math.floor((Date.now() - this.gameData.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (elapsed % 60).toString().padStart(2, "0");
      document.getElementById("gameTime").textContent = `${minutes}:${seconds}`;
    }
  }

  handleGameMessage(data) {
    switch (data.action) {
      case "leaderboard":
        this.updateLeaderboard(data.leaderboard);
        break;
      case "playerCount":
        document.getElementById("onlinePlayers").textContent = data.count;
        break;
      case "gameStart":
        this.showNotification("게임이 시작되었습니다!", "success");
        break;
      case "gameEnd":
        this.showNotification("게임이 종료되었습니다", "info");
        break;
    }
  }

  updateLeaderboard(leaderboard) {
    const container = document.getElementById("leaderboard");

    if (!leaderboard || leaderboard.length === 0) {
      container.innerHTML =
        '<div class="leaderboard-placeholder">순위 데이터가 없습니다</div>';
      return;
    }

    container.innerHTML = leaderboard
      .slice(0, 10)
      .map(
        (player, index) => `
      <div class="leaderboard-item ${player.isMe ? "my-rank" : ""}">
        <span class="rank">${index + 1}</span>
        <span class="player-name">${player.name}</span>
        <span class="player-score">${player.score}</span>
      </div>
    `
      )
      .join("");
  }

  joinRace() {
    this.showNotification("레이싱 게임은 서버 구현이 필요합니다", "info");
  }

  leaveRace() {
    this.showNotification("레이스에서 나갔습니다", "info");
  }

  joinSnakeGame() {
    this.showNotification("스네이크 게임은 서버 구현이 필요합니다", "info");
  }

  setupDrawingCanvas() {
    const canvas = document.getElementById("drawingCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDrawing) return;

      const color = document.getElementById("brushColor")?.value || "#000000";
      const size = document.getElementById("brushSize")?.value || 5;

      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = size;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

      // 다른 플레이어들에게 그리기 데이터 전송
      this.sendMessage({
        type: "drawing",
        action: "draw",
        from: [lastX, lastY],
        to: [e.offsetX, e.offsetY],
        color: color,
        size: size,
        timestamp: Date.now(),
      });

      [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener("mouseup", () => (isDrawing = false));
    canvas.addEventListener("mouseout", () => (isDrawing = false));

    document.getElementById("clearCanvas")?.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.sendMessage({
        type: "drawing",
        action: "clear",
        timestamp: Date.now(),
      });
    });
  }

  // 모니터링 및 로깅
  updateStats() {
    document.getElementById("totalMessages").textContent =
      this.connectionStats.totalMessages;
    document.getElementById("sentMessages").textContent =
      this.connectionStats.messagesSent;
    document.getElementById("receivedMessages").textContent =
      this.connectionStats.messagesReceived;
    document.getElementById("reconnections").textContent =
      this.connectionStats.reconnections;
  }

  logMessage(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      type,
      message,
    };

    this.messageHistory.push(logEntry);

    // 로그 표시 업데이트
    this.updateLogDisplay();
  }

  updateLogDisplay() {
    const container = document.getElementById("logDisplay");
    const autoScroll = document.getElementById("autoScroll")?.checked;

    if (this.messageHistory.length === 0) {
      container.innerHTML =
        '<div class="log-placeholder">연결 로그가 여기에 표시됩니다</div>';
      return;
    }

    const recentLogs = this.messageHistory.slice(-100); // 최근 100개만 표시

    container.innerHTML = recentLogs
      .map(
        (log) => `
      <div class="log-entry ${log.type}">
        <span class="log-timestamp">${log.timestamp}</span>
        <span class="log-type">${log.type.toUpperCase()}</span>
        <span class="log-message">${this.escapeHtml(log.message)}</span>
      </div>
    `
      )
      .join("");

    if (autoScroll) {
      container.scrollTop = container.scrollHeight;
    }
  }

  clearLogs() {
    this.messageHistory = [];
    this.updateLogDisplay();
    this.showNotification("로그가 삭제되었습니다", "info");
  }

  exportLogs() {
    if (this.messageHistory.length === 0) {
      this.showNotification("내보낼 로그가 없습니다", "warning");
      return;
    }

    const logData = {
      exportedAt: new Date().toISOString(),
      totalLogs: this.messageHistory.length,
      logs: this.messageHistory,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `websocket_logs_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification("로그를 내보냈습니다", "success");
  }

  // 유틸리티 메소드
  formatTime(date) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
window.webSocketAPI = null;

// 초기화
function initWebSocketAPI() {
  console.log("🚀 WebSocket API 초기화 함수 호출");
  window.webSocketAPI = new WebSocketAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initWebSocketAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initWebSocketAPI();
}

console.log(
  "📄 WebSocket API 스크립트 로드 완료, readyState:",
  document.readyState
);
