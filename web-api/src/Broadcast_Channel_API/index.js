import "./style.css";

// Broadcast Channel API 테스트 및 데모
class BroadcastChannelDemo {
  constructor() {
    this.channels = new Map();
    this.connectedTabs = new Set();
    this.messageHistory = [];
    this.clientId = this.generateClientId();
    this.isOnline = true;
    this.heartbeatInterval = null;
    this.pingStats = {
      sent: 0,
      received: 0,
      averageLatency: 0,
      latencies: [],
    };
    this.fileTransfers = new Map();
    this.gameState = {
      isHost: false,
      players: new Map(),
      gameData: null,
      currentGame: null,
    };

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
    this.initializeDefaultChannels();
    this.startHeartbeat();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    const broadcastChannelSupport = "BroadcastChannel" in window;

    let statusHTML = "";

    if (broadcastChannelSupport) {
      statusHTML = `<span class="status-success">✅ Broadcast Channel API 완전 지원됨</span>`;
    } else {
      statusHTML = `<span class="status-error">❌ Broadcast Channel API가 지원되지 않습니다</span>`;
      this.disableFeatures();
    }

    statusElement.innerHTML = statusHTML;
    return broadcastChannelSupport;
  }

  disableFeatures() {
    document.querySelectorAll(".broadcast-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="broadcast-demo">
        <h1>📡 Broadcast Channel API 테스트</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <!-- 클라이언트 정보 섹션 -->
        <div class="broadcast-section client-info-section">
          <h2>🏷️ 클라이언트 정보</h2>
          
          <div class="client-info">
            <div class="info-card">
              <div class="info-icon">🆔</div>
              <div class="info-content">
                <h4>클라이언트 ID</h4>
                <div class="client-id" id="clientId">${this.clientId}</div>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${this.clientId}')">📋 복사</button>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-icon">🌐</div>
              <div class="info-content">
                <h4>연결 상태</h4>
                <div class="connection-status" id="connectionStatus">
                  <div class="status-indicator online" id="statusIndicator"></div>
                  <span id="statusText">온라인</span>
                </div>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-icon">🔗</div>
              <div class="info-content">
                <h4>연결된 탭</h4>
                <div class="tab-count" id="tabCount">1개</div>
                <div class="tab-list" id="tabList"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 채널 관리 섹션 -->
        <div class="broadcast-section channel-management-section">
          <h2>📺 채널 관리</h2>
          
          <div class="channel-controls">
            <div class="input-group">
              <label for="channelName">채널 이름:</label>
              <input type="text" id="channelName" placeholder="my-channel" value="general">
              <button id="createChannel" class="broadcast-btn create-btn">
                ➕ 채널 생성
              </button>
            </div>
          </div>
          
          <div class="active-channels">
            <h4>📋 활성 채널</h4>
            <div class="channel-list" id="channelList">
              <div class="empty-channels">
                <p>아직 생성된 채널이 없습니다.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 메시지 통신 섹션 -->
        <div class="broadcast-section messaging-section">
          <h2>💬 메시지 통신</h2>
          
          <div class="messaging-controls">
            <div class="channel-selector">
              <label for="targetChannel">대상 채널:</label>
              <select id="targetChannel">
                <option value="">채널을 선택하세요</option>
              </select>
            </div>
            
            <div class="message-types">
              <label>메시지 타입:</label>
              <div class="type-buttons">
                <button class="type-btn active" data-type="text">📝 텍스트</button>
                <button class="type-btn" data-type="json">🔗 JSON</button>
                <button class="type-btn" data-type="binary">📦 바이너리</button>
                <button class="type-btn" data-type="file">📁 파일</button>
              </div>
            </div>
            
            <div class="message-input">
              <div class="input-panel text-panel active">
                <textarea id="textMessage" placeholder="전송할 메시지를 입력하세요..."></textarea>
                <div class="message-actions">
                  <button id="sendTextMessage" class="broadcast-btn send-btn">
                    📤 메시지 전송
                  </button>
                  <button id="sendPing" class="broadcast-btn ping-btn">
                    🏓 Ping 전송
                  </button>
                </div>
              </div>
              
              <div class="input-panel json-panel">
                <textarea id="jsonMessage" placeholder='{"type": "notification", "data": "Hello World"}'></textarea>
                <div class="message-actions">
                  <button id="sendJsonMessage" class="broadcast-btn send-btn">
                    📤 JSON 전송
                  </button>
                  <button id="validateJson" class="broadcast-btn validate-btn">
                    ✅ JSON 검증
                  </button>
                </div>
              </div>
              
              <div class="input-panel binary-panel">
                <div class="binary-controls">
                  <input type="file" id="binaryFile" accept="*/*">
                  <button id="sendBinaryMessage" class="broadcast-btn send-btn">
                    📤 바이너리 전송
                  </button>
                </div>
                <div class="binary-info" id="binaryInfo"></div>
              </div>
              
              <div class="input-panel file-panel">
                <div class="file-transfer">
                  <input type="file" id="fileInput" multiple accept="*/*">
                  <button id="sendFile" class="broadcast-btn send-btn">
                    📤 파일 전송
                  </button>
                  <div class="transfer-progress" id="transferProgress"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 메시지 히스토리 섹션 -->
        <div class="broadcast-section history-section">
          <h2>📜 메시지 히스토리</h2>
          
          <div class="history-controls">
            <div class="filter-controls">
              <label>
                <input type="checkbox" id="filterIncoming" checked> 📥 수신 메시지
              </label>
              <label>
                <input type="checkbox" id="filterOutgoing" checked> 📤 발신 메시지
              </label>
              <label>
                <input type="checkbox" id="filterSystem" checked> ⚙️ 시스템 메시지
              </label>
            </div>
            <div class="history-actions">
              <button id="clearHistory" class="broadcast-btn clear-btn">
                🗑️ 히스토리 지우기
              </button>
              <button id="exportHistory" class="broadcast-btn export-btn">
                📤 히스토리 내보내기
              </button>
            </div>
          </div>
          
          <div class="message-history" id="messageHistory">
            <div class="history-placeholder">
              <p>아직 주고받은 메시지가 없습니다.</p>
              <p>다른 탭을 열어서 메시지를 주고받아보세요!</p>
            </div>
          </div>
        </div>

        <!-- 실시간 채팅 섹션 -->
        <div class="broadcast-section chat-section">
          <h2>💭 실시간 채팅</h2>
          
          <div class="chat-container">
            <div class="chat-header">
              <div class="chat-info">
                <span class="chat-channel" id="chatChannel">general</span>
                <span class="chat-participants" id="chatParticipants">1명 참여</span>
              </div>
              <div class="chat-controls">
                <button id="clearChat" class="broadcast-btn clear-btn">🗑️ 채팅 지우기</button>
              </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
              <div class="welcome-message">
                <p>🎉 실시간 채팅에 오신 것을 환영합니다!</p>
                <p>다른 탭을 열어서 대화해보세요.</p>
              </div>
            </div>
            
            <div class="chat-input">
              <div class="user-info">
                <input type="text" id="userName" placeholder="사용자 이름" value="사용자">
                <div class="user-status">
                  <div class="status-dot online"></div>
                  <span>온라인</span>
                </div>
              </div>
              <div class="input-container">
                <input type="text" id="chatInput" placeholder="메시지를 입력하세요..." maxlength="500">
                <button id="sendChatMessage" class="broadcast-btn send-btn">📤 전송</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 네트워크 상태 섹션 -->
        <div class="broadcast-section network-section">
          <h2>📊 네트워크 상태</h2>
          
          <div class="network-stats">
            <div class="stats-grid">
              <div class="stat-card">
                <h4>📤 전송한 Ping</h4>
                <div class="stat-value" id="pingSent">0</div>
              </div>
              <div class="stat-card">
                <h4>📥 받은 Pong</h4>
                <div class="stat-value" id="pongReceived">0</div>
              </div>
              <div class="stat-card">
                <h4>⚡ 평균 지연시간</h4>
                <div class="stat-value" id="averageLatency">0ms</div>
              </div>
              <div class="stat-card">
                <h4>📊 성공률</h4>
                <div class="stat-value" id="successRate">100%</div>
              </div>
            </div>
            
            <div class="latency-chart">
              <h4>📈 지연시간 차트</h4>
              <div class="chart-container">
                <canvas id="latencyChart" width="400" height="200"></canvas>
              </div>
              <button id="resetStats" class="broadcast-btn reset-btn">🔄 통계 초기화</button>
            </div>
          </div>
        </div>

        <!-- 멀티탭 게임 섹션 -->
        <div class="broadcast-section game-section">
          <h2>🎮 멀티탭 게임</h2>
          
          <div class="game-description">
            <p>여러 탭에서 동시에 플레이할 수 있는 간단한 클릭 경쟁 게임입니다!</p>
            <p>가장 많이 클릭한 플레이어가 승리합니다.</p>
          </div>
          
          <div class="game-controls">
            <div class="game-setup">
              <input type="text" id="playerName" placeholder="플레이어 이름" value="Player">
              <button id="joinGame" class="broadcast-btn game-btn">🎯 게임 참가</button>
              <button id="startGame" class="broadcast-btn game-btn">🚀 게임 시작</button>
              <button id="resetGame" class="broadcast-btn reset-btn">🔄 게임 리셋</button>
            </div>
            
            <div class="game-status">
              <div class="game-info">
                <div class="info-item">
                  <span>게임 상태:</span>
                  <span id="gameStatus">대기 중</span>
                </div>
                <div class="info-item">
                  <span>참가자:</span>
                  <span id="gameParticipants">0명</span>
                </div>
                <div class="info-item">
                  <span>시간:</span>
                  <span id="gameTimer">00:00</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="game-area">
            <div class="game-board" id="gameBoard">
              <div class="click-target" id="clickTarget">
                <div class="target-content">
                  <div class="click-count" id="clickCount">0</div>
                  <div class="click-text">클릭하세요!</div>
                </div>
              </div>
            </div>
            
            <div class="leaderboard">
              <h4>🏆 리더보드</h4>
              <div class="player-list" id="playerList">
                <div class="no-players">아직 참가한 플레이어가 없습니다.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 파일 공유 섹션 -->
        <div class="broadcast-section file-sharing-section">
          <h2>📁 파일 공유</h2>
          
          <div class="file-sharing-controls">
            <div class="upload-area" id="uploadArea">
              <div class="upload-content">
                <div class="upload-icon">📁</div>
                <div class="upload-text">파일을 드래그하거나 클릭하여 업로드</div>
                <input type="file" id="shareFileInput" multiple hidden>
              </div>
            </div>
            
            <div class="sharing-options">
              <label>
                <input type="checkbox" id="enableEncryption" checked>
                🔐 암호화 전송
              </label>
              <label>
                <input type="checkbox" id="enableCompression">
                🗜️ 압축 전송
              </label>
            </div>
          </div>
          
          <div class="shared-files">
            <h4>📋 공유된 파일</h4>
            <div class="file-list" id="sharedFileList">
              <div class="no-files">아직 공유된 파일이 없습니다.</div>
            </div>
          </div>
        </div>

        <!-- 테스트 도구 섹션 -->
        <div class="broadcast-section test-tools-section">
          <h2>🧪 테스트 도구</h2>
          
          <div class="test-instructions">
            <h4>📋 테스트 방법</h4>
            <ul>
              <li><strong>새 탭 열기:</strong> Ctrl+T (Windows) 또는 Cmd+T (Mac)로 새 탭 생성</li>
              <li><strong>같은 페이지 열기:</strong> 현재 URL을 새 탭에서 열기</li>
              <li><strong>메시지 전송:</strong> 한 탭에서 메시지 보내고 다른 탭에서 확인</li>
              <li><strong>채팅 테스트:</strong> 실시간 채팅으로 대화해보기</li>
              <li><strong>게임 플레이:</strong> 여러 탭에서 동시에 게임 참가</li>
            </ul>
          </div>
          
          <div class="test-actions">
            <button id="openNewTab" class="broadcast-btn test-btn">
              🆕 새 탭 열기
            </button>
            <button id="sendTestMessage" class="broadcast-btn test-btn">
              📮 테스트 메시지 전송
            </button>
            <button id="simulateDisconnect" class="broadcast-btn test-btn">
              🔌 연결 끊기 시뮬레이션
            </button>
            <button id="stressTest" class="broadcast-btn test-btn">
              💪 스트레스 테스트
            </button>
          </div>
          
          <div class="api-info">
            <h4>🔧 API 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <strong>지원 데이터 타입:</strong>
                <span>String, Object, ArrayBuffer, Blob</span>
              </div>
              <div class="info-item">
                <strong>통신 범위:</strong>
                <span>같은 Origin (protocol + domain + port)</span>
              </div>
              <div class="info-item">
                <strong>메시지 크기 제한:</strong>
                <span>브라우저별 상이 (일반적으로 2MB)</span>
              </div>
              <div class="info-item">
                <strong>전송 방식:</strong>
                <span>비동기, 이벤트 기반</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Broadcast Channel API 정보</h3>
          <div class="info-grid">
            <div class="info-card">
              <h4>📡 Broadcast Channel</h4>
              <ul>
                <li>탭/창 간 실시간 통신</li>
                <li>같은 Origin 내 메시지 브로드캐스트</li>
                <li>Service Worker와 통신 가능</li>
                <li>WebSocket 없이 실시간 기능</li>
                <li>간단한 API로 강력한 기능</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🔧 주요 메서드</h4>
              <ul>
                <li><strong>new BroadcastChannel():</strong> 채널 생성</li>
                <li><strong>postMessage():</strong> 메시지 전송</li>
                <li><strong>onmessage:</strong> 메시지 수신 이벤트</li>
                <li><strong>close():</strong> 채널 닫기</li>
                <li><strong>onmessageerror:</strong> 에러 핸들링</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>💼 활용 사례</h4>
              <ul>
                <li><strong>멀티탭 동기화:</strong> 로그인 상태 동기화</li>
                <li><strong>실시간 채팅:</strong> 탭 간 메시지 전달</li>
                <li><strong>게임:</strong> 멀티탭 게임 개발</li>
                <li><strong>알림:</strong> 시스템 알림 공유</li>
                <li><strong>상태 관리:</strong> 앱 상태 동기화</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🚀 고급 기능</h4>
              <ul>
                <li>파일 전송 및 공유</li>
                <li>암호화된 메시지 전송</li>
                <li>네트워크 지연시간 측정</li>
                <li>연결 상태 모니터링</li>
                <li>메시지 히스토리 관리</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 채널 관리
    document
      .getElementById("createChannel")
      .addEventListener("click", () => this.createChannel());

    // 메시지 타입 전환
    document.querySelectorAll(".type-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchMessageType(e.target.dataset.type)
      );
    });

    // 메시지 전송
    document
      .getElementById("sendTextMessage")
      .addEventListener("click", () => this.sendTextMessage());
    document
      .getElementById("sendPing")
      .addEventListener("click", () => this.sendPing());
    document
      .getElementById("sendJsonMessage")
      .addEventListener("click", () => this.sendJsonMessage());
    document
      .getElementById("validateJson")
      .addEventListener("click", () => this.validateJson());
    document
      .getElementById("sendBinaryMessage")
      .addEventListener("click", () => this.sendBinaryMessage());
    document
      .getElementById("sendFile")
      .addEventListener("click", () => this.sendFile());

    // 채팅
    document
      .getElementById("sendChatMessage")
      .addEventListener("click", () => this.sendChatMessage());
    document.getElementById("chatInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendChatMessage();
    });
    document
      .getElementById("clearChat")
      .addEventListener("click", () => this.clearChat());

    // 히스토리 관리
    document
      .getElementById("clearHistory")
      .addEventListener("click", () => this.clearHistory());
    document
      .getElementById("exportHistory")
      .addEventListener("click", () => this.exportHistory());

    // 필터
    ["filterIncoming", "filterOutgoing", "filterSystem"].forEach((id) => {
      document
        .getElementById(id)
        .addEventListener("change", () => this.updateHistoryDisplay());
    });

    // 게임
    document
      .getElementById("joinGame")
      .addEventListener("click", () => this.joinGame());
    document
      .getElementById("startGame")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("resetGame")
      .addEventListener("click", () => this.resetGame());
    document
      .getElementById("clickTarget")
      .addEventListener("click", () => this.handleGameClick());

    // 파일 공유
    const uploadArea = document.getElementById("uploadArea");
    const shareFileInput = document.getElementById("shareFileInput");

    uploadArea.addEventListener("click", () => shareFileInput.click());
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });
    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      this.handleFileShare(e.dataTransfer.files);
    });
    shareFileInput.addEventListener("change", (e) => {
      this.handleFileShare(e.target.files);
    });

    // 테스트 도구
    document
      .getElementById("openNewTab")
      .addEventListener("click", () => this.openNewTab());
    document
      .getElementById("sendTestMessage")
      .addEventListener("click", () => this.sendTestMessage());
    document
      .getElementById("simulateDisconnect")
      .addEventListener("click", () => this.simulateDisconnect());
    document
      .getElementById("stressTest")
      .addEventListener("click", () => this.stressTest());
    document
      .getElementById("resetStats")
      .addEventListener("click", () => this.resetStats());

    // 바이너리 파일 선택
    document
      .getElementById("binaryFile")
      .addEventListener("change", (e) => this.handleBinaryFileSelect(e));
  }

  initializeDefaultChannels() {
    // 기본 채널들 생성
    this.createChannelInternal("general");
    this.createChannelInternal("system");
    this.createChannelInternal("game");

    // 채널 셀렉터 업데이트
    this.updateChannelSelector();

    // 기본적으로 general 채널 선택
    document.getElementById("targetChannel").value = "general";
  }

  createChannel() {
    const channelName = document.getElementById("channelName").value.trim();

    if (!channelName) {
      this.showNotification("채널 이름을 입력해주세요.", "warning");
      return;
    }

    if (this.channels.has(channelName)) {
      this.showNotification("이미 존재하는 채널입니다.", "warning");
      return;
    }

    this.createChannelInternal(channelName);
    this.updateChannelSelector();
    this.updateChannelList();

    // 입력 필드 초기화
    document.getElementById("channelName").value = "";

    this.showNotification(`채널 '${channelName}'이 생성되었습니다.`, "success");

    // 시스템 메시지로 채널 생성 알림
    this.broadcastMessage("system", {
      type: "channel_created",
      channel: channelName,
      clientId: this.clientId,
      timestamp: Date.now(),
    });
  }

  createChannelInternal(channelName) {
    if (this.channels.has(channelName)) return;

    const channel = new BroadcastChannel(channelName);

    channel.onmessage = (event) => {
      this.handleMessage(channelName, event.data);
    };

    channel.onmessageerror = (event) => {
      console.error(`Channel ${channelName} message error:`, event);
      this.showNotification(
        `채널 ${channelName}에서 메시지 오류가 발생했습니다.`,
        "error"
      );
    };

    this.channels.set(channelName, channel);
  }

  updateChannelSelector() {
    const selector = document.getElementById("targetChannel");
    const currentValue = selector.value;

    selector.innerHTML = '<option value="">채널을 선택하세요</option>';

    for (const channelName of this.channels.keys()) {
      const option = document.createElement("option");
      option.value = channelName;
      option.textContent = channelName;
      selector.appendChild(option);
    }

    // 이전 선택값 복원
    if (currentValue && this.channels.has(currentValue)) {
      selector.value = currentValue;
    }
  }

  updateChannelList() {
    const list = document.getElementById("channelList");

    if (this.channels.size === 0) {
      list.innerHTML = `
        <div class="empty-channels">
          <p>아직 생성된 채널이 없습니다.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="channels">';
    for (const channelName of this.channels.keys()) {
      html += `
        <div class="channel-item">
          <div class="channel-info">
            <span class="channel-name">${channelName}</span>
            <span class="channel-status">활성</span>
          </div>
          <div class="channel-actions">
            <button class="channel-btn" onclick="broadcastDemo.closeChannel('${channelName}')">
              ❌ 닫기
            </button>
          </div>
        </div>
      `;
    }
    html += "</div>";

    list.innerHTML = html;
  }

  closeChannel(channelName) {
    if (!this.channels.has(channelName)) return;

    const channel = this.channels.get(channelName);
    channel.close();
    this.channels.delete(channelName);

    this.updateChannelSelector();
    this.updateChannelList();

    this.showNotification(`채널 '${channelName}'이 닫혔습니다.`, "info");
  }

  switchMessageType(type) {
    // 타입 버튼 업데이트
    document.querySelectorAll(".type-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-type="${type}"]`).classList.add("active");

    // 패널 전환
    document.querySelectorAll(".input-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.querySelector(`.${type}-panel`).classList.add("active");
  }

  sendTextMessage() {
    const channel = document.getElementById("targetChannel").value;
    const message = document.getElementById("textMessage").value.trim();

    if (!channel) {
      this.showNotification("채널을 선택해주세요.", "warning");
      return;
    }

    if (!message) {
      this.showNotification("메시지를 입력해주세요.", "warning");
      return;
    }

    this.broadcastMessage(channel, {
      type: "text",
      content: message,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    document.getElementById("textMessage").value = "";
    this.showNotification("텍스트 메시지가 전송되었습니다.", "success");
  }

  sendPing() {
    const channel = document.getElementById("targetChannel").value;

    if (!channel) {
      this.showNotification("채널을 선택해주세요.", "warning");
      return;
    }

    const pingId = Date.now();

    this.broadcastMessage(channel, {
      type: "ping",
      pingId: pingId,
      clientId: this.clientId,
      timestamp: pingId,
    });

    this.pingStats.sent++;
    this.updateNetworkStats();

    this.showNotification("Ping이 전송되었습니다.", "info");
  }

  sendJsonMessage() {
    const channel = document.getElementById("targetChannel").value;
    const jsonText = document.getElementById("jsonMessage").value.trim();

    if (!channel) {
      this.showNotification("채널을 선택해주세요.", "warning");
      return;
    }

    if (!jsonText) {
      this.showNotification("JSON 데이터를 입력해주세요.", "warning");
      return;
    }

    try {
      const jsonData = JSON.parse(jsonText);

      this.broadcastMessage(channel, {
        type: "json",
        content: jsonData,
        clientId: this.clientId,
        timestamp: Date.now(),
      });

      document.getElementById("jsonMessage").value = "";
      this.showNotification("JSON 메시지가 전송되었습니다.", "success");
    } catch (error) {
      this.showNotification("유효하지 않은 JSON 형식입니다.", "error");
    }
  }

  validateJson() {
    const jsonText = document.getElementById("jsonMessage").value.trim();

    if (!jsonText) {
      this.showNotification("JSON 데이터를 입력해주세요.", "warning");
      return;
    }

    try {
      JSON.parse(jsonText);
      this.showNotification("유효한 JSON 형식입니다.", "success");
    } catch (error) {
      this.showNotification(`JSON 오류: ${error.message}`, "error");
    }
  }

  sendBinaryMessage() {
    const channel = document.getElementById("targetChannel").value;
    const fileInput = document.getElementById("binaryFile");

    if (!channel) {
      this.showNotification("채널을 선택해주세요.", "warning");
      return;
    }

    if (!fileInput.files.length) {
      this.showNotification("파일을 선택해주세요.", "warning");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      this.broadcastMessage(channel, {
        type: "binary",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content: e.target.result,
        clientId: this.clientId,
        timestamp: Date.now(),
      });

      this.showNotification("바이너리 데이터가 전송되었습니다.", "success");
    };

    reader.readAsArrayBuffer(file);
  }

  sendFile() {
    const channel = document.getElementById("targetChannel").value;
    const fileInput = document.getElementById("fileInput");

    if (!channel) {
      this.showNotification("채널을 선택해주세요.", "warning");
      return;
    }

    if (!fileInput.files.length) {
      this.showNotification("파일을 선택해주세요.", "warning");
      return;
    }

    Array.from(fileInput.files).forEach((file) => {
      this.transferFile(channel, file);
    });
  }

  transferFile(channel, file) {
    const transferId = `transfer_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const chunkSize = 64 * 1024; // 64KB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    this.fileTransfers.set(transferId, {
      file: file,
      channel: channel,
      totalChunks: totalChunks,
      currentChunk: 0,
      startTime: Date.now(),
    });

    // 파일 전송 시작 메시지
    this.broadcastMessage(channel, {
      type: "file_transfer_start",
      transferId: transferId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      totalChunks: totalChunks,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    // 첫 번째 청크 전송 시작
    this.sendNextChunk(transferId);
  }

  sendNextChunk(transferId) {
    const transfer = this.fileTransfers.get(transferId);
    if (!transfer) return;

    const { file, channel, totalChunks, currentChunk } = transfer;
    const chunkSize = 64 * 1024;
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.broadcastMessage(channel, {
        type: "file_chunk",
        transferId: transferId,
        chunkIndex: currentChunk,
        totalChunks: totalChunks,
        content: e.target.result,
        clientId: this.clientId,
        timestamp: Date.now(),
      });

      transfer.currentChunk++;

      // 진행률 업데이트
      const progress = (transfer.currentChunk / totalChunks) * 100;
      this.updateTransferProgress(transferId, progress);

      if (transfer.currentChunk < totalChunks) {
        // 다음 청크 전송
        setTimeout(() => this.sendNextChunk(transferId), 10);
      } else {
        // 전송 완료
        this.broadcastMessage(channel, {
          type: "file_transfer_complete",
          transferId: transferId,
          clientId: this.clientId,
          timestamp: Date.now(),
        });

        this.fileTransfers.delete(transferId);
        this.showNotification(
          `파일 '${file.name}' 전송이 완료되었습니다.`,
          "success"
        );
      }
    };

    reader.readAsArrayBuffer(chunk);
  }

  updateTransferProgress(transferId, progress) {
    const progressElement = document.getElementById("transferProgress");
    progressElement.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">${Math.round(progress)}% 전송 중...</div>
    `;
  }

  handleBinaryFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const info = document.getElementById("binaryInfo");
    info.innerHTML = `
      <div class="file-info">
        <div><strong>파일명:</strong> ${file.name}</div>
        <div><strong>크기:</strong> ${this.formatFileSize(file.size)}</div>
        <div><strong>타입:</strong> ${file.type || "알 수 없음"}</div>
      </div>
    `;
  }

  broadcastMessage(channelName, data) {
    if (!this.channels.has(channelName)) {
      this.showNotification(
        `채널 '${channelName}'이 존재하지 않습니다.`,
        "error"
      );
      return;
    }

    try {
      const channel = this.channels.get(channelName);
      channel.postMessage(data);

      // 발신 메시지를 히스토리에 추가
      this.addToHistory({
        direction: "outgoing",
        channel: channelName,
        data: data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Message broadcast error:", error);
      this.showNotification("메시지 전송 중 오류가 발생했습니다.", "error");
    }
  }

  handleMessage(channelName, data) {
    // 수신 메시지를 히스토리에 추가
    this.addToHistory({
      direction: "incoming",
      channel: channelName,
      data: data,
      timestamp: Date.now(),
    });

    // 메시지 타입별 처리
    switch (data.type) {
      case "ping":
        this.handlePing(channelName, data);
        break;
      case "pong":
        this.handlePong(data);
        break;
      case "chat":
        this.handleChatMessage(data);
        break;
      case "game_join":
        this.handleGameJoin(data);
        break;
      case "game_start":
        this.handleGameStart(data);
        break;
      case "game_click":
        this.handleGameClick(data);
        break;
      case "game_reset":
        this.handleGameReset();
        break;
      case "heartbeat":
        this.handleHeartbeat(data);
        break;
      case "client_disconnect":
        this.handleClientDisconnect(data);
        break;
      default:
        // 일반 메시지 처리
        break;
    }

    // 연결된 탭 수 업데이트 (heartbeat 메시지 기반)
    if (data.clientId && data.clientId !== this.clientId) {
      this.connectedTabs.add(data.clientId);
      this.updateTabCount();
    }
  }

  handlePing(channelName, data) {
    // Ping에 대한 Pong 응답
    this.broadcastMessage(channelName, {
      type: "pong",
      pingId: data.pingId,
      originalTimestamp: data.timestamp,
      clientId: this.clientId,
      timestamp: Date.now(),
    });
  }

  handlePong(data) {
    if (data.originalTimestamp) {
      const latency = Date.now() - data.originalTimestamp;
      this.pingStats.received++;
      this.pingStats.latencies.push(latency);

      // 최근 10개의 latency만 유지
      if (this.pingStats.latencies.length > 10) {
        this.pingStats.latencies.shift();
      }

      // 평균 계산
      this.pingStats.averageLatency = Math.round(
        this.pingStats.latencies.reduce((a, b) => a + b, 0) /
          this.pingStats.latencies.length
      );

      this.updateNetworkStats();
      this.updateLatencyChart();
    }
  }

  // 채팅 기능
  sendChatMessage() {
    const message = document.getElementById("chatInput").value.trim();
    const userName = document.getElementById("userName").value.trim() || "익명";

    if (!message) return;

    this.broadcastMessage("general", {
      type: "chat",
      content: message,
      userName: userName,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    // 내 메시지를 채팅창에 추가
    this.addChatMessage(
      {
        content: message,
        userName: userName,
        clientId: this.clientId,
        timestamp: Date.now(),
      },
      true
    );

    document.getElementById("chatInput").value = "";
  }

  handleChatMessage(data) {
    if (data.clientId !== this.clientId) {
      this.addChatMessage(data, false);
    }
  }

  addChatMessage(data, isOwn) {
    const chatMessages = document.getElementById("chatMessages");

    // 환영 메시지 제거
    const welcomeMessage = chatMessages.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${isOwn ? "own" : "other"}`;

    const time = new Date(data.timestamp).toLocaleTimeString();
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="user-name">${data.userName}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-content">${this.escapeHtml(data.content)}</div>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  clearChat() {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = `
      <div class="welcome-message">
        <p>🎉 실시간 채팅에 오신 것을 환영합니다!</p>
        <p>다른 탭을 열어서 대화해보세요.</p>
      </div>
    `;
  }

  // 게임 기능
  joinGame() {
    const playerName =
      document.getElementById("playerName").value.trim() || "Player";

    this.gameState.players.set(this.clientId, {
      name: playerName,
      clicks: 0,
      isReady: true,
    });

    this.broadcastMessage("game", {
      type: "game_join",
      playerName: playerName,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    this.updateGameDisplay();
    this.showNotification("게임에 참가했습니다!", "success");
  }

  handleGameJoin(data) {
    if (data.clientId !== this.clientId) {
      this.gameState.players.set(data.clientId, {
        name: data.playerName,
        clicks: 0,
        isReady: true,
      });

      this.updateGameDisplay();
      this.showNotification(
        `${data.playerName}님이 게임에 참가했습니다.`,
        "info"
      );
    }
  }

  startGame() {
    this.gameState.isHost = true;
    this.gameState.currentGame = {
      duration: 30, // 30초
      startTime: Date.now(),
      isActive: true,
    };

    this.broadcastMessage("game", {
      type: "game_start",
      gameData: this.gameState.currentGame,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    this.startGameTimer();
    this.updateGameDisplay();
    this.showNotification("게임이 시작되었습니다!", "success");
  }

  handleGameStart(data) {
    if (data.clientId !== this.clientId) {
      this.gameState.currentGame = data.gameData;
      this.startGameTimer();
      this.updateGameDisplay();
      this.showNotification("게임이 시작되었습니다!", "info");
    }
  }

  startGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    this.gameTimer = setInterval(() => {
      if (!this.gameState.currentGame) return;

      const elapsed = Date.now() - this.gameState.currentGame.startTime;
      const remaining = Math.max(
        0,
        this.gameState.currentGame.duration * 1000 - elapsed
      );

      const seconds = Math.ceil(remaining / 1000);
      document.getElementById("gameTimer").textContent = `${Math.floor(
        seconds / 60
      )
        .toString()
        .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

      if (remaining <= 0) {
        this.endGame();
      }
    }, 100);
  }

  handleGameClick() {
    if (!this.gameState.currentGame || !this.gameState.currentGame.isActive) {
      this.showNotification("게임이 진행 중이 아닙니다.", "warning");
      return;
    }

    const player = this.gameState.players.get(this.clientId);
    if (player) {
      player.clicks++;

      this.broadcastMessage("game", {
        type: "game_click",
        clientId: this.clientId,
        clicks: player.clicks,
        timestamp: Date.now(),
      });

      this.updateGameDisplay();
    }
  }

  handleGameClick(data) {
    if (data.clientId !== this.clientId) {
      const player = this.gameState.players.get(data.clientId);
      if (player) {
        player.clicks = data.clicks;
        this.updateGameDisplay();
      }
    }
  }

  resetGame() {
    this.gameState.currentGame = null;
    this.gameState.players.clear();

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.broadcastMessage("game", {
      type: "game_reset",
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    this.updateGameDisplay();
    this.showNotification("게임이 리셋되었습니다.", "info");
  }

  handleGameReset() {
    this.gameState.currentGame = null;
    this.gameState.players.clear();

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.updateGameDisplay();
  }

  updateGameDisplay() {
    const status = document.getElementById("gameStatus");
    const participants = document.getElementById("gameParticipants");
    const clickCount = document.getElementById("clickCount");
    const playerList = document.getElementById("playerList");

    // 게임 상태
    if (this.gameState.currentGame && this.gameState.currentGame.isActive) {
      status.textContent = "진행 중";
    } else if (this.gameState.players.size > 0) {
      status.textContent = "대기 중";
    } else {
      status.textContent = "대기 중";
    }

    // 참가자 수
    participants.textContent = `${this.gameState.players.size}명`;

    // 내 클릭 수
    const myPlayer = this.gameState.players.get(this.clientId);
    clickCount.textContent = myPlayer ? myPlayer.clicks : 0;

    // 플레이어 리스트
    if (this.gameState.players.size === 0) {
      playerList.innerHTML =
        '<div class="no-players">아직 참가한 플레이어가 없습니다.</div>';
    } else {
      const sortedPlayers = Array.from(this.gameState.players.entries()).sort(
        ([, a], [, b]) => b.clicks - a.clicks
      );

      let html = "";
      sortedPlayers.forEach(([clientId, player], index) => {
        const isMe = clientId === this.clientId;
        html += `
          <div class="player-item ${isMe ? "me" : ""}">
            <div class="player-rank">#${index + 1}</div>
            <div class="player-name">${player.name}${isMe ? " (나)" : ""}</div>
            <div class="player-score">${player.clicks}</div>
          </div>
        `;
      });

      playerList.innerHTML = html;
    }
  }

  endGame() {
    if (this.gameState.currentGame) {
      this.gameState.currentGame.isActive = false;
    }

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    // 승자 결정
    const winner = Array.from(this.gameState.players.entries()).sort(
      ([, a], [, b]) => b.clicks - a.clicks
    )[0];

    if (winner) {
      this.showNotification(
        `🏆 게임 종료! 승자: ${winner[1].name} (${winner[1].clicks}클릭)`,
        "success"
      );
    }

    this.updateGameDisplay();
  }

  // 파일 공유 기능
  handleFileShare(files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result,
          sharedBy: this.clientId,
          timestamp: Date.now(),
        };

        this.broadcastMessage("general", {
          type: "file_share",
          fileData: fileData,
          clientId: this.clientId,
          timestamp: Date.now(),
        });

        this.addSharedFile(fileData);
        this.showNotification(
          `파일 '${file.name}'이 공유되었습니다.`,
          "success"
        );
      };

      reader.readAsDataURL(file);
    });
  }

  addSharedFile(fileData) {
    const fileList = document.getElementById("sharedFileList");

    // "파일 없음" 메시지 제거
    const noFiles = fileList.querySelector(".no-files");
    if (noFiles) {
      noFiles.remove();
    }

    const fileElement = document.createElement("div");
    fileElement.className = "shared-file-item";

    const time = new Date(fileData.timestamp).toLocaleTimeString();
    const isOwn = fileData.sharedBy === this.clientId;

    fileElement.innerHTML = `
      <div class="file-icon">📁</div>
      <div class="file-info">
        <div class="file-name">${fileData.name}</div>
        <div class="file-details">
          <span>${this.formatFileSize(fileData.size)}</span>
          <span>${time}</span>
          <span>${isOwn ? "나" : "다른 사용자"}</span>
        </div>
      </div>
      <div class="file-actions">
        <button class="download-btn" onclick="broadcastDemo.downloadSharedFile('${
          fileData.name
        }', '${fileData.content}')">
          💾 다운로드
        </button>
      </div>
    `;

    fileList.appendChild(fileElement);
  }

  downloadSharedFile(fileName, content) {
    const link = document.createElement("a");
    link.href = content;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showNotification(`파일 '${fileName}' 다운로드를 시작합니다.`, "info");
  }

  // 히스토리 관리
  addToHistory(entry) {
    this.messageHistory.unshift(entry);

    // 최대 100개까지만 보관
    if (this.messageHistory.length > 100) {
      this.messageHistory = this.messageHistory.slice(0, 100);
    }

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const history = document.getElementById("messageHistory");
    const showIncoming = document.getElementById("filterIncoming").checked;
    const showOutgoing = document.getElementById("filterOutgoing").checked;
    const showSystem = document.getElementById("filterSystem").checked;

    // 필터링
    const filteredHistory = this.messageHistory.filter((entry) => {
      if (entry.direction === "incoming" && !showIncoming) return false;
      if (entry.direction === "outgoing" && !showOutgoing) return false;
      if (
        entry.data.type === "heartbeat" ||
        entry.data.type === "ping" ||
        entry.data.type === "pong"
      ) {
        if (!showSystem) return false;
      }
      return true;
    });

    if (filteredHistory.length === 0) {
      history.innerHTML = `
        <div class="history-placeholder">
          <p>필터 조건에 맞는 메시지가 없습니다.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="history-entries">';
    filteredHistory.slice(0, 50).forEach((entry) => {
      html += this.createHistoryEntryHTML(entry);
    });
    html += "</div>";

    history.innerHTML = html;
  }

  createHistoryEntryHTML(entry) {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const direction = entry.direction === "incoming" ? "📥" : "📤";
    const typeIcon = this.getMessageTypeIcon(entry.data.type);

    let content = "";
    switch (entry.data.type) {
      case "text":
        content = entry.data.content;
        break;
      case "json":
        content = JSON.stringify(entry.data.content, null, 2);
        break;
      case "ping":
        content = `Ping (ID: ${entry.data.pingId})`;
        break;
      case "pong":
        content = `Pong (Latency: ${
          Date.now() - entry.data.originalTimestamp
        }ms)`;
        break;
      case "chat":
        content = `${entry.data.userName}: ${entry.data.content}`;
        break;
      default:
        content = entry.data.type;
    }

    return `
      <div class="history-entry ${entry.direction}">
        <div class="entry-header">
          <span class="entry-direction">${direction}</span>
          <span class="entry-type">${typeIcon} ${entry.data.type}</span>
          <span class="entry-channel">#${entry.channel}</span>
          <span class="entry-time">${time}</span>
        </div>
        <div class="entry-content">${this.escapeHtml(content)}</div>
        ${
          entry.data.clientId
            ? `<div class="entry-client">Client: ${entry.data.clientId}</div>`
            : ""
        }
      </div>
    `;
  }

  getMessageTypeIcon(type) {
    const icons = {
      text: "📝",
      json: "🔗",
      binary: "📦",
      file: "📁",
      ping: "🏓",
      pong: "🏓",
      chat: "💬",
      game_join: "🎮",
      game_start: "🚀",
      game_click: "👆",
      heartbeat: "💓",
      file_share: "🔗",
    };
    return icons[type] || "📄";
  }

  clearHistory() {
    this.messageHistory = [];
    this.updateHistoryDisplay();
    this.showNotification("메시지 히스토리가 지워졌습니다.", "info");
  }

  exportHistory() {
    if (this.messageHistory.length === 0) {
      this.showNotification("내보낼 히스토리가 없습니다.", "warning");
      return;
    }

    const exportData = {
      clientId: this.clientId,
      exportTime: Date.now(),
      totalMessages: this.messageHistory.length,
      messages: this.messageHistory,
    };

    this.downloadJSON(
      exportData,
      `broadcast-history-${this.getTimestamp()}.json`
    );
    this.showNotification("히스토리가 JSON 파일로 내보내졌습니다!", "success");
  }

  // 네트워크 상태 관리
  startHeartbeat() {
    // 5초마다 하트비트 전송
    this.heartbeatInterval = setInterval(() => {
      if (this.channels.has("system")) {
        this.broadcastMessage("system", {
          type: "heartbeat",
          clientId: this.clientId,
          timestamp: Date.now(),
        });
      }
    }, 5000);
  }

  handleHeartbeat(data) {
    if (data.clientId !== this.clientId) {
      this.connectedTabs.add(data.clientId);

      // 5초 후에 이 클라이언트를 비활성으로 표시
      setTimeout(() => {
        this.connectedTabs.delete(data.clientId);
        this.updateTabCount();
      }, 10000);
    }
  }

  updateTabCount() {
    const count = this.connectedTabs.size + 1; // +1 for current tab
    document.getElementById("tabCount").textContent = `${count}개`;

    // 탭 목록 업데이트
    const tabList = document.getElementById("tabList");
    if (this.connectedTabs.size === 0) {
      tabList.innerHTML = "<div>현재 탭만 연결됨</div>";
    } else {
      let html = "<div>연결된 탭들:</div>";
      for (const tabId of this.connectedTabs) {
        html += `<div class="tab-item">${tabId.substring(0, 12)}...</div>`;
      }
      tabList.innerHTML = html;
    }
  }

  updateNetworkStats() {
    document.getElementById("pingSent").textContent = this.pingStats.sent;
    document.getElementById("pongReceived").textContent =
      this.pingStats.received;
    document.getElementById(
      "averageLatency"
    ).textContent = `${this.pingStats.averageLatency}ms`;

    const successRate =
      this.pingStats.sent > 0
        ? Math.round((this.pingStats.received / this.pingStats.sent) * 100)
        : 100;
    document.getElementById("successRate").textContent = `${successRate}%`;
  }

  updateLatencyChart() {
    const canvas = document.getElementById("latencyChart");
    const ctx = canvas.getContext("2d");

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.pingStats.latencies.length === 0) return;

    const padding = 20;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const maxLatency = Math.max(...this.pingStats.latencies, 100);
    const step = chartWidth / Math.max(this.pingStats.latencies.length - 1, 1);

    // 격자 그리기
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    // 수직 격자
    for (let i = 0; i <= 5; i++) {
      const x = padding + (chartWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // 수평 격자
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // 라인 차트 그리기
    ctx.strokeStyle = "#646cff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    this.pingStats.latencies.forEach((latency, index) => {
      const x = padding + step * index;
      const y = padding + chartHeight - (latency / maxLatency) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 포인트 그리기
    ctx.fillStyle = "#646cff";
    this.pingStats.latencies.forEach((latency, index) => {
      const x = padding + step * index;
      const y = padding + chartHeight - (latency / maxLatency) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  resetStats() {
    this.pingStats = {
      sent: 0,
      received: 0,
      averageLatency: 0,
      latencies: [],
    };

    this.updateNetworkStats();
    this.updateLatencyChart();
    this.showNotification("네트워크 통계가 초기화되었습니다.", "info");
  }

  // 테스트 도구
  openNewTab() {
    window.open(window.location.href, "_blank");
    this.showNotification("새 탭이 열렸습니다.", "info");
  }

  sendTestMessage() {
    const testMessages = [
      "안녕하세요! 테스트 메시지입니다.",
      "Broadcast Channel API가 잘 작동하고 있습니다.",
      "여러 탭에서 실시간 통신을 테스트해보세요!",
      "JSON 데이터도 전송할 수 있습니다.",
      "파일 공유 기능도 사용해보세요.",
    ];

    const randomMessage =
      testMessages[Math.floor(Math.random() * testMessages.length)];

    this.broadcastMessage("general", {
      type: "text",
      content: randomMessage,
      clientId: this.clientId,
      timestamp: Date.now(),
    });

    this.showNotification("테스트 메시지가 전송되었습니다.", "success");
  }

  simulateDisconnect() {
    this.isOnline = false;
    const statusIndicator = document.getElementById("statusIndicator");
    const statusText = document.getElementById("statusText");

    statusIndicator.className = "status-indicator offline";
    statusText.textContent = "오프라인";

    // 3초 후 다시 연결
    setTimeout(() => {
      this.isOnline = true;
      statusIndicator.className = "status-indicator online";
      statusText.textContent = "온라인";
      this.showNotification("연결이 복구되었습니다.", "success");
    }, 3000);

    this.showNotification("연결이 끊어졌습니다. 3초 후 복구됩니다.", "warning");
  }

  stressTest() {
    this.showNotification("스트레스 테스트를 시작합니다...", "info");

    // 100개의 메시지를 빠르게 전송
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        this.broadcastMessage("general", {
          type: "text",
          content: `스트레스 테스트 메시지 #${i + 1}`,
          clientId: this.clientId,
          timestamp: Date.now(),
        });

        if (i === 99) {
          this.showNotification("스트레스 테스트가 완료되었습니다.", "success");
        }
      }, i * 10);
    }
  }

  // 유틸리티 함수들
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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

// 전역 인스턴스 생성 (onclick 핸들러에서 사용)
let broadcastDemo;

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  broadcastDemo = new BroadcastChannelDemo();
});
