import "./style.css";

console.log("📡 Channel Messaging API 스크립트 시작!");

class ChannelMessagingAPI {
  constructor() {
    this.channels = new Map();
    this.workers = new Map();
    this.iframes = new Map();
    this.messageHistory = [];
    this.activeConnections = 0;
    this.messageCounter = 0;
    this.isListening = false;
    this.init();
  }

  init() {
    console.log("📡 Channel Messaging API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.setupInitialChannels();
    console.log("✅ Channel Messaging API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Channel Messaging API 지원 여부 확인 중...");

    const support = {
      MessageChannel: !!window.MessageChannel,
      MessagePort: !!window.MessagePort,
      Worker: !!window.Worker,
      SharedWorker: !!window.SharedWorker,
      BroadcastChannel: !!window.BroadcastChannel,
      StructuredClone: !!window.structuredClone,
    };

    console.log("Channel Messaging API 지원 상태:", support);

    if (!support.MessageChannel) {
      this.showNotification(
        "이 브라우저는 MessageChannel을 지원하지 않습니다",
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
      <div class="channel-messaging-container">
        <header class="channel-messaging-header">
          <h1>📡 Channel Messaging API</h1>
          <p>안전하고 직접적인 메시지 채널 통신</p>
          <div class="api-support">
            <div class="support-badge ${
              support.MessageChannel ? "supported" : "unsupported"
            }">
              ${
                support.MessageChannel
                  ? "✅ MessageChannel"
                  : "❌ MessageChannel"
              }
            </div>
            <div class="support-badge ${
              support.MessagePort ? "supported" : "unsupported"
            }">
              ${support.MessagePort ? "✅ MessagePort" : "❌ MessagePort"}
            </div>
            <div class="support-badge ${
              support.Worker ? "supported" : "unsupported"
            }">
              ${support.Worker ? "✅ Worker" : "❌ Worker"}
            </div>
            <div class="support-badge ${
              support.BroadcastChannel ? "supported" : "unsupported"
            }">
              ${
                support.BroadcastChannel
                  ? "✅ BroadcastChannel"
                  : "❌ BroadcastChannel"
              }
            </div>
          </div>
        </header>

        <main class="channel-messaging-main">
          <div class="control-section">
            <div class="channel-card primary">
              <h2>🎛️ 채널 제어</h2>
              
              <div class="channel-controls">
                <div class="control-group">
                  <label for="channelName">채널 이름:</label>
                  <input 
                    type="text" 
                    id="channelName" 
                    placeholder="새 채널 이름을 입력하세요..."
                    value="demo-channel"
                  >
                </div>

                <div class="control-buttons">
                  <button id="createChannel" class="btn-primary">
                    ➕ 채널 생성
                  </button>
                  <button id="closeChannel" class="btn-danger">
                    ❌ 채널 닫기
                  </button>
                  <button id="clearHistory" class="btn-secondary">
                    🗑️ 히스토리 삭제
                  </button>
                  <button id="exportData" class="btn-accent">
                    📤 데이터 내보내기
                  </button>
                </div>

                <div class="channel-status">
                  <div class="status-item">
                    <span class="status-label">활성 채널:</span>
                    <span class="status-value" id="activeChannels">0</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">연결된 포트:</span>
                    <span class="status-value" id="connectedPorts">0</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">전송된 메시지:</span>
                    <span class="status-value" id="totalMessages">0</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="channel-card">
              <h2>📊 채널 목록</h2>
              
              <div class="channel-list" id="channelList">
                <div class="list-placeholder">
                  생성된 채널이 없습니다
                </div>
              </div>

              <div class="channel-actions">
                <button id="selectAllChannels" class="btn-secondary">
                  ☑️ 전체 선택
                </button>
                <button id="testAllChannels" class="btn-accent">
                  🧪 전체 테스트
                </button>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <div class="channel-card">
              <h2>🎮 데모 시나리오</h2>
              
              <div class="demo-controls">
                <button id="basicDemo" class="btn-primary">
                  🔄 기본 채널 통신
                </button>
                <button id="workerDemo" class="btn-accent">
                  👷 워커 통신
                </button>
                <button id="iframeDemo" class="btn-warning">
                  🖼️ iframe 통신
                </button>
                <button id="broadcastDemo" class="btn-success">
                  📢 브로드캐스트 통신
                </button>
                <button id="fileTransferDemo" class="btn-danger">
                  📁 파일 전송
                </button>
                <button id="chatDemo" class="btn-accent">
                  💬 실시간 채팅
                </button>
              </div>

              <div class="demo-status" id="demoStatus">
                데모를 선택하여 Channel Messaging의 다양한 기능을 체험해보세요
              </div>
            </div>

            <div class="channel-card">
              <h2>💬 메시지 전송</h2>
              
              <div class="message-controls">
                <div class="message-input-group">
                  <select id="targetChannel">
                    <option value="">채널을 선택하세요</option>
                  </select>
                  <select id="messageType">
                    <option value="text">텍스트</option>
                    <option value="json">JSON</option>
                    <option value="binary">바이너리</option>
                    <option value="object">객체</option>
                  </select>
                </div>

                <div class="message-content-group">
                  <textarea 
                    id="messageContent" 
                    placeholder="전송할 메시지를 입력하세요..."
                    rows="4"
                  ></textarea>
                  <input 
                    type="file" 
                    id="fileInput" 
                    style="display: none;"
                    accept="*/*"
                  >
                </div>

                <div class="message-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="structuredClone">
                    <span class="checkmark"></span>
                    Structured Clone 사용
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="transferable">
                    <span class="checkmark"></span>
                    Transferable Objects
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="autoReply">
                    <span class="checkmark"></span>
                    자동 응답
                  </label>
                </div>

                <div class="send-controls">
                  <button id="sendMessage" class="btn-primary">
                    📤 메시지 전송
                  </button>
                  <button id="sendFile" class="btn-accent">
                    📁 파일 선택
                  </button>
                  <button id="sendBroadcast" class="btn-warning">
                    📢 브로드캐스트
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="communication-section">
            <div class="channel-card full-width">
              <h2>📨 메시지 히스토리</h2>
              
              <div class="message-filters">
                <select id="historyFilter">
                  <option value="all">모든 메시지</option>
                  <option value="sent">보낸 메시지</option>
                  <option value="received">받은 메시지</option>
                  <option value="error">오류 메시지</option>
                </select>
                <button id="toggleAutoScroll" class="btn-secondary active">
                  📜 자동 스크롤
                </button>
                <button id="pauseLogging" class="btn-secondary">
                  ⏸️ 로깅 일시정지
                </button>
              </div>

              <div class="message-history" id="messageHistory">
                <div class="history-placeholder">
                  메시지 히스토리가 여기에 표시됩니다
                </div>
              </div>
            </div>
          </div>

          <div class="examples-section">
            <div class="channel-card">
              <h2>💡 사용 예제</h2>
              
              <div class="example-tabs">
                <button class="tab-btn active" data-tab="basic">기본 사용법</button>
                <button class="tab-btn" data-tab="worker">Worker 통신</button>
                <button class="tab-btn" data-tab="iframe">iframe 통신</button>
                <button class="tab-btn" data-tab="broadcast">브로드캐스트</button>
              </div>

              <div class="example-content">
                <div class="tab-content active" id="tab-basic">
                  <h3>기본 MessageChannel</h3>
                  <pre><code>// MessageChannel 생성
const channel = new MessageChannel();
const port1 = channel.port1;
const port2 = channel.port2;

// Port 1에서 메시지 수신
port1.onmessage = (event) => {
  console.log('Port 1 받음:', event.data);
};

// Port 2에서 메시지 전송
port2.postMessage('Hello from Port 2!');

// 양방향 통신
port2.onmessage = (event) => {
  console.log('Port 2 받음:', event.data);
  port2.postMessage('Reply from Port 2');
};

port1.postMessage('Hello from Port 1!');</code></pre>
                </div>

                <div class="tab-content" id="tab-worker">
                  <h3>Worker와 통신</h3>
                  <pre><code>// Worker 생성
const worker = new Worker('worker.js');
const channel = new MessageChannel();

// Worker에 port2 전달
worker.postMessage({ type: 'CONNECT' }, [channel.port2]);

// Main thread에서 port1 사용
channel.port1.onmessage = (event) => {
  console.log('Worker로부터:', event.data);
};

// Worker에게 메시지 전송
channel.port1.postMessage({
  type: 'TASK',
  data: { numbers: [1, 2, 3, 4, 5] }
});

// worker.js
self.onmessage = (event) => {
  if (event.data.type === 'CONNECT') {
    const port = event.ports[0];
    
    port.onmessage = (e) => {
      if (e.data.type === 'TASK') {
        const result = e.data.data.numbers.reduce((a, b) => a + b);
        port.postMessage({ type: 'RESULT', result });
      }
    };
  }
};</code></pre>
                </div>

                <div class="tab-content" id="tab-iframe">
                  <h3>iframe 간 통신</h3>
                  <pre><code>// 부모 페이지
const channel = new MessageChannel();
const iframe = document.querySelector('iframe');

// iframe에 port2 전달
iframe.contentWindow.postMessage('CONNECT', '*', [channel.port2]);

// 부모에서 port1 사용
channel.port1.onmessage = (event) => {
  console.log('iframe으로부터:', event.data);
};

// iframe 페이지
window.addEventListener('message', (event) => {
  if (event.data === 'CONNECT') {
    const port = event.ports[0];
    
    port.onmessage = (e) => {
      console.log('부모로부터:', e.data);
      port.postMessage('Hello from iframe!');
    };
    
    // 연결 확인
    port.postMessage('iframe connected');
  }
});</code></pre>
                </div>

                <div class="tab-content" id="tab-broadcast">
                  <h3>브로드캐스트 채널</h3>
                  <pre><code>// 브로드캐스트 채널 생성
const bc = new BroadcastChannel('my-channel');

// 메시지 수신
bc.onmessage = (event) => {
  console.log('브로드캐스트 받음:', event.data);
  
  // 다른 탭/워커에서 온 메시지 처리
  if (event.data.type === 'USER_LOGIN') {
    updateUserStatus(event.data.user);
  }
};

// 모든 연결된 컨텍스트에 메시지 전송
bc.postMessage({
  type: 'NOTIFICATION',
  message: '새로운 메시지가 도착했습니다',
  timestamp: Date.now()
});

// 브로드캐스트 채널 닫기
bc.close();</code></pre>
                </div>
              </div>
            </div>

            <div class="channel-card">
              <h2>🎯 활용 사례</h2>
              
              <div class="use-cases">
                <div class="use-case-item">
                  <div class="use-case-icon">👷</div>
                  <div class="use-case-content">
                    <h3>Web Worker 통신</h3>
                    <p>메인 스레드와 워커 간 안전한 메시지 교환</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">🖼️</div>
                  <div class="use-case-content">
                    <h3>iframe 통신</h3>
                    <p>서로 다른 도메인의 iframe과 부모 페이지 간 통신</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">📢</div>
                  <div class="use-case-content">
                    <h3>탭 간 통신</h3>
                    <p>동일 원본의 여러 탭/창 간 실시간 동기화</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">🔒</div>
                  <div class="use-case-content">
                    <h3>보안 통신</h3>
                    <p>신뢰할 수 있는 양방향 메시지 채널 구축</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">📁</div>
                  <div class="use-case-content">
                    <h3>파일 전송</h3>
                    <p>Transferable Objects를 통한 효율적 데이터 이동</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">💬</div>
                  <div class="use-case-content">
                    <h3>실시간 채팅</h3>
                    <p>멀티탭 환경에서 동기화된 채팅 시스템</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="performance-section">
            <div class="channel-card">
              <h2>📈 성능 모니터링</h2>
              
              <div class="performance-stats">
                <div class="stat-group">
                  <div class="stat-item">
                    <div class="stat-label">메시지 처리율</div>
                    <div class="stat-value" id="messageRate">0/s</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">평균 지연시간</div>
                    <div class="stat-value" id="averageLatency">0ms</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">성공률</div>
                    <div class="stat-value" id="successRate">100%</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">대기열 크기</div>
                    <div class="stat-value" id="queueSize">0</div>
                  </div>
                </div>

                <div class="performance-chart" id="performanceChart">
                  <canvas id="statsCanvas" width="400" height="200"></canvas>
                </div>
              </div>
            </div>

            <div class="channel-card">
              <h2>🌐 브라우저 지원</h2>
              
              <div class="browser-grid">
                <div class="browser-item">
                  <div class="browser-icon">🌐</div>
                  <div class="browser-name">Chrome</div>
                  <div class="browser-version supported">2+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">🦊</div>
                  <div class="browser-name">Firefox</div>
                  <div class="browser-version supported">41+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">🧭</div>
                  <div class="browser-name">Safari</div>
                  <div class="browser-version supported">5+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">⚡</div>
                  <div class="browser-name">Edge</div>
                  <div class="browser-version supported">12+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">📱</div>
                  <div class="browser-name">iOS Safari</div>
                  <div class="browser-version supported">5+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">🤖</div>
                  <div class="browser-name">Android</div>
                  <div class="browser-version supported">37+ ✅</div>
                </div>
              </div>

              <div class="compatibility-notes">
                <h3>📝 호환성 참고사항</h3>
                <ul>
                  <li><strong>MessageChannel:</strong> 거의 모든 모던 브라우저 지원</li>
                  <li><strong>BroadcastChannel:</strong> Chrome 54+, Firefox 38+</li>
                  <li><strong>SharedWorker:</strong> 제한적 지원 (Safari 제외)</li>
                  <li><strong>Transferable Objects:</strong> ArrayBuffer, MessagePort 등</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>

        <!-- 동적 iframe 영역 -->
        <div id="iframeContainer" class="iframe-container hidden"></div>
      </div>
    `;

    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 채널 제어
    const createChannelBtn = document.getElementById("createChannel");
    if (createChannelBtn) {
      createChannelBtn.addEventListener("click", () => this.createChannel());
    }

    const closeChannelBtn = document.getElementById("closeChannel");
    if (closeChannelBtn) {
      closeChannelBtn.addEventListener("click", () =>
        this.closeSelectedChannel()
      );
    }

    const clearHistoryBtn = document.getElementById("clearHistory");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () =>
        this.clearMessageHistory()
      );
    }

    const exportDataBtn = document.getElementById("exportData");
    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", () => this.exportData());
    }

    // 데모 버튼들
    const basicDemoBtn = document.getElementById("basicDemo");
    if (basicDemoBtn) {
      basicDemoBtn.addEventListener("click", () => this.runBasicDemo());
    }

    const workerDemoBtn = document.getElementById("workerDemo");
    if (workerDemoBtn) {
      workerDemoBtn.addEventListener("click", () => this.runWorkerDemo());
    }

    const iframeDemoBtn = document.getElementById("iframeDemo");
    if (iframeDemoBtn) {
      iframeDemoBtn.addEventListener("click", () => this.runIframeDemo());
    }

    const broadcastDemoBtn = document.getElementById("broadcastDemo");
    if (broadcastDemoBtn) {
      broadcastDemoBtn.addEventListener("click", () => this.runBroadcastDemo());
    }

    const fileTransferDemoBtn = document.getElementById("fileTransferDemo");
    if (fileTransferDemoBtn) {
      fileTransferDemoBtn.addEventListener("click", () =>
        this.runFileTransferDemo()
      );
    }

    const chatDemoBtn = document.getElementById("chatDemo");
    if (chatDemoBtn) {
      chatDemoBtn.addEventListener("click", () => this.runChatDemo());
    }

    // 메시지 전송
    const sendMessageBtn = document.getElementById("sendMessage");
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener("click", () => this.sendMessage());
    }

    const sendFileBtn = document.getElementById("sendFile");
    if (sendFileBtn) {
      sendFileBtn.addEventListener("click", () => this.selectFile());
    }

    const sendBroadcastBtn = document.getElementById("sendBroadcast");
    if (sendBroadcastBtn) {
      sendBroadcastBtn.addEventListener("click", () => this.sendBroadcast());
    }

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelection(e));
    }

    // 메시지 입력 엔터키
    const messageContent = document.getElementById("messageContent");
    if (messageContent) {
      messageContent.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
          this.sendMessage();
        }
      });
    }

    // 히스토리 필터
    const historyFilter = document.getElementById("historyFilter");
    if (historyFilter) {
      historyFilter.addEventListener("change", (e) =>
        this.filterMessageHistory(e.target.value)
      );
    }

    const toggleAutoScrollBtn = document.getElementById("toggleAutoScroll");
    if (toggleAutoScrollBtn) {
      toggleAutoScrollBtn.addEventListener("click", () =>
        this.toggleAutoScroll()
      );
    }

    const pauseLoggingBtn = document.getElementById("pauseLogging");
    if (pauseLoggingBtn) {
      pauseLoggingBtn.addEventListener("click", () => this.toggleLogging());
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

  setupInitialChannels() {
    // 기본 데모 채널 생성
    this.createChannelWithName("demo-channel");
    this.createChannelWithName("test-channel");
  }

  createChannel() {
    const channelNameInput = document.getElementById("channelName");
    const name = channelNameInput.value.trim();

    if (!name) {
      this.showNotification("채널 이름을 입력해주세요", "warning");
      return;
    }

    if (this.channels.has(name)) {
      this.showNotification("이미 존재하는 채널 이름입니다", "warning");
      return;
    }

    this.createChannelWithName(name);
    channelNameInput.value = "";
    this.showNotification(`채널 '${name}'이 생성되었습니다`, "success");
  }

  createChannelWithName(name) {
    const channel = new MessageChannel();
    const port1 = channel.port1;
    const port2 = channel.port2;

    // 포트 설정
    port1.onmessage = (event) => this.handleMessage(name, "port1", event);
    port2.onmessage = (event) => this.handleMessage(name, "port2", event);

    port1.start();
    port2.start();

    this.channels.set(name, {
      channel,
      port1,
      port2,
      created: Date.now(),
      messageCount: 0,
      isActive: true,
    });

    this.updateChannelList();
    this.updateTargetChannelOptions();
    this.updateStatistics();
  }

  handleMessage(channelName, portName, event) {
    if (!this.isListening) return;

    const message = {
      id: this.messageCounter++,
      channel: channelName,
      port: portName,
      type: "received",
      data: event.data,
      timestamp: Date.now(),
      size: this.calculateMessageSize(event.data),
    };

    this.messageHistory.push(message);
    this.addMessageToHistory(message);

    // 채널 통계 업데이트
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).messageCount++;
    }

    this.updateStatistics();

    // 자동 응답 처리
    const autoReply = document.getElementById("autoReply");
    if (autoReply && autoReply.checked) {
      this.sendAutoReply(channelName, portName, event.data);
    }

    console.log(`메시지 수신 [${channelName}:${portName}]:`, event.data);
  }

  sendMessage() {
    const targetChannel = document.getElementById("targetChannel").value;
    const messageType = document.getElementById("messageType").value;
    const messageContent = document.getElementById("messageContent").value;

    if (!targetChannel) {
      this.showNotification("대상 채널을 선택해주세요", "warning");
      return;
    }

    if (!messageContent.trim()) {
      this.showNotification("메시지 내용을 입력해주세요", "warning");
      return;
    }

    const channel = this.channels.get(targetChannel);
    if (!channel) {
      this.showNotification("선택한 채널이 존재하지 않습니다", "error");
      return;
    }

    let data;
    try {
      switch (messageType) {
        case "text":
          data = messageContent;
          break;
        case "json":
          data = JSON.parse(messageContent);
          break;
        case "binary":
          data = new TextEncoder().encode(messageContent);
          break;
        case "object":
          data = {
            text: messageContent,
            timestamp: Date.now(),
            type: "object",
            metadata: {
              userAgent: navigator.userAgent,
              language: navigator.language,
            },
          };
          break;
        default:
          data = messageContent;
      }
    } catch (error) {
      this.showNotification(`메시지 파싱 오류: ${error.message}`, "error");
      return;
    }

    // Structured Clone 옵션 처리
    const useStructuredClone =
      document.getElementById("structuredClone").checked;
    if (useStructuredClone && window.structuredClone) {
      data = structuredClone(data);
    }

    // 메시지 전송
    const startTime = performance.now();
    try {
      channel.port1.postMessage(data);

      const message = {
        id: this.messageCounter++,
        channel: targetChannel,
        port: "port1",
        type: "sent",
        data,
        timestamp: Date.now(),
        latency: performance.now() - startTime,
        size: this.calculateMessageSize(data),
      };

      this.messageHistory.push(message);
      this.addMessageToHistory(message);
      this.updateStatistics();

      document.getElementById("messageContent").value = "";
      this.showNotification("메시지가 전송되었습니다", "success");
    } catch (error) {
      this.showNotification(`메시지 전송 실패: ${error.message}`, "error");
    }
  }

  sendAutoReply(channelName, portName, originalData) {
    const channel = this.channels.get(channelName);
    if (!channel) return;

    const replyData = {
      type: "auto-reply",
      originalMessage: originalData,
      reply: "자동 응답: 메시지를 받았습니다",
      timestamp: Date.now(),
    };

    // 반대 포트로 응답
    const replyPort = portName === "port1" ? channel.port2 : channel.port1;
    replyPort.postMessage(replyData);

    const message = {
      id: this.messageCounter++,
      channel: channelName,
      port: portName === "port1" ? "port2" : "port1",
      type: "auto-reply",
      data: replyData,
      timestamp: Date.now(),
      size: this.calculateMessageSize(replyData),
    };

    this.messageHistory.push(message);
    this.addMessageToHistory(message);
  }

  // 데모 메서드들
  runBasicDemo() {
    this.updateDemoStatus("기본 채널 통신 데모를 실행 중입니다...");

    const demoChannel = "demo-channel";
    if (!this.channels.has(demoChannel)) {
      this.createChannelWithName(demoChannel);
    }

    const channel = this.channels.get(demoChannel);
    const messages = [
      "안녕하세요! 첫 번째 메시지입니다.",
      { type: "greeting", message: "JSON 메시지입니다", timestamp: Date.now() },
      "이것은 세 번째 메시지입니다.",
      new Uint8Array([72, 101, 108, 108, 111]), // "Hello" in bytes
      { action: "demo", status: "complete", data: [1, 2, 3, 4, 5] },
    ];

    let messageIndex = 0;
    const sendNextMessage = () => {
      if (messageIndex < messages.length) {
        const data = messages[messageIndex];
        channel.port1.postMessage(data);

        setTimeout(() => {
          // 응답 메시지
          channel.port2.postMessage(
            `응답 ${messageIndex + 1}: 메시지를 받았습니다`
          );
          messageIndex++;
          setTimeout(sendNextMessage, 1000);
        }, 500);
      } else {
        this.updateDemoStatus("기본 채널 통신 데모가 완료되었습니다");
        this.showNotification("기본 데모가 완료되었습니다", "success");
      }
    };

    sendNextMessage();
  }

  runWorkerDemo() {
    this.updateDemoStatus("Web Worker 통신 데모를 실행 중입니다...");

    try {
      // Worker 코드를 Blob으로 생성
      const workerCode = `
        let port = null;
        
        self.onmessage = function(event) {
          if (event.data.type === 'CONNECT') {
            port = event.ports[0];
            
            port.onmessage = function(e) {
              console.log('Worker가 받은 메시지:', e.data);
              
              if (e.data.type === 'CALCULATE') {
                const numbers = e.data.data;
                const sum = numbers.reduce((a, b) => a + b, 0);
                const average = sum / numbers.length;
                
                port.postMessage({
                  type: 'RESULT',
                  sum: sum,
                  average: average,
                  timestamp: Date.now()
                });
              } else if (e.data.type === 'HEAVY_TASK') {
                // 무거운 작업 시뮬레이션
                let result = 0;
                for (let i = 0; i < e.data.iterations; i++) {
                  result += Math.sqrt(i);
                }
                
                port.postMessage({
                  type: 'TASK_COMPLETE',
                  result: result,
                  timestamp: Date.now()
                });
              }
            };
            
            port.postMessage({ type: 'CONNECTED', message: 'Worker 연결됨' });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      const channel = new MessageChannel();
      const workerName = `worker-${Date.now()}`;

      // Worker에 port2 전달
      worker.postMessage({ type: "CONNECT" }, [channel.port2]);

      // Main thread에서 port1 사용
      channel.port1.onmessage = (event) => {
        const message = {
          id: this.messageCounter++,
          channel: workerName,
          port: "main-thread",
          type: "received",
          data: event.data,
          timestamp: Date.now(),
          size: this.calculateMessageSize(event.data),
        };

        this.messageHistory.push(message);
        this.addMessageToHistory(message);
        this.updateStatistics();
      };

      // Worker 저장
      this.workers.set(workerName, { worker, channel });

      // 테스트 메시지들 전송
      setTimeout(() => {
        channel.port1.postMessage({
          type: "CALCULATE",
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });
      }, 500);

      setTimeout(() => {
        channel.port1.postMessage({
          type: "HEAVY_TASK",
          iterations: 1000000,
        });
      }, 1500);

      this.updateDemoStatus(
        "Worker 통신 데모가 실행되었습니다. 계산 결과를 확인하세요."
      );
      this.showNotification("Worker 데모가 시작되었습니다", "success");

      // 리소스 정리
      setTimeout(() => {
        URL.revokeObjectURL(workerUrl);
      }, 10000);
    } catch (error) {
      this.showNotification(`Worker 데모 실패: ${error.message}`, "error");
    }
  }

  runIframeDemo() {
    this.updateDemoStatus("iframe 통신 데모를 실행 중입니다...");

    const iframeContainer = document.getElementById("iframeContainer");
    iframeContainer.classList.remove("hidden");

    const iframe = document.createElement("iframe");
    iframe.style.width = "400px";
    iframe.style.height = "300px";
    iframe.style.border = "2px solid #667eea";
    iframe.style.borderRadius = "8px";

    // iframe 내용 생성
    const iframeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>iframe Demo</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            margin: 0;
          }
          .message-box {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
          }
          button {
            background: white;
            color: #667eea;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <h3>📱 iframe 통신 데모</h3>
        <div class="message-box">
          <p>부모 페이지와 MessageChannel로 통신합니다</p>
          <div id="messages"></div>
        </div>
        <button onclick="sendToParent()">부모에게 메시지 전송</button>
        
        <script>
          let port = null;
          
          window.addEventListener('message', (event) => {
            if (event.data === 'CONNECT') {
              port = event.ports[0];
              
              port.onmessage = (e) => {
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML += '<p>부모로부터: ' + JSON.stringify(e.data) + '</p>';
                
                // 자동 응답
                if (e.data.type === 'ping') {
                  port.postMessage({ type: 'pong', timestamp: Date.now() });
                }
              };
              
              port.postMessage({ type: 'connected', message: 'iframe 연결됨' });
            }
          });
          
          function sendToParent() {
            if (port) {
              port.postMessage({
                type: 'iframe-message',
                message: 'Hello from iframe!',
                timestamp: Date.now()
              });
            }
          }
        </script>
      </body>
      </html>
    `;

    iframe.src =
      "data:text/html;charset=utf-8," + encodeURIComponent(iframeContent);
    iframeContainer.appendChild(iframe);

    // iframe 로드 완료 후 통신 설정
    iframe.onload = () => {
      const channel = new MessageChannel();
      const iframeName = `iframe-${Date.now()}`;

      // iframe에 port2 전달
      iframe.contentWindow.postMessage("CONNECT", "*", [channel.port2]);

      // 부모에서 port1 사용
      channel.port1.onmessage = (event) => {
        const message = {
          id: this.messageCounter++,
          channel: iframeName,
          port: "parent",
          type: "received",
          data: event.data,
          timestamp: Date.now(),
          size: this.calculateMessageSize(event.data),
        };

        this.messageHistory.push(message);
        this.addMessageToHistory(message);
        this.updateStatistics();
      };

      // iframe 저장
      this.iframes.set(iframeName, { iframe, channel });

      // 테스트 메시지들 전송
      setTimeout(() => {
        channel.port1.postMessage({
          type: "ping",
          message: "부모에서 iframe으로 ping",
          timestamp: Date.now(),
        });
      }, 1000);

      setTimeout(() => {
        channel.port1.postMessage({
          type: "data",
          payload: { numbers: [1, 2, 3], text: "테스트 데이터" },
        });
      }, 2000);

      this.updateDemoStatus(
        "iframe과 통신이 설정되었습니다. 메시지를 주고받아보세요."
      );
      this.showNotification("iframe 데모가 설정되었습니다", "success");
    };

    // 5초 후 iframe 제거
    setTimeout(() => {
      iframeContainer.innerHTML = "";
      iframeContainer.classList.add("hidden");
    }, 15000);
  }

  runBroadcastDemo() {
    if (!window.BroadcastChannel) {
      this.showNotification(
        "이 브라우저는 BroadcastChannel을 지원하지 않습니다",
        "error"
      );
      return;
    }

    this.updateDemoStatus("브로드캐스트 채널 데모를 실행 중입니다...");

    const channelName = "demo-broadcast";
    const bc = new BroadcastChannel(channelName);

    bc.onmessage = (event) => {
      const message = {
        id: this.messageCounter++,
        channel: channelName,
        port: "broadcast",
        type: "received",
        data: event.data,
        timestamp: Date.now(),
        size: this.calculateMessageSize(event.data),
      };

      this.messageHistory.push(message);
      this.addMessageToHistory(message);
      this.updateStatistics();
    };

    // 브로드캐스트 메시지들 전송
    const messages = [
      { type: "announcement", message: "브로드캐스트 데모 시작" },
      { type: "user-action", action: "login", user: "demo-user" },
      { type: "notification", title: "새 메시지", body: "브로드캐스트 알림" },
      { type: "system", status: "online", timestamp: Date.now() },
    ];

    let messageIndex = 0;
    const sendBroadcastMessage = () => {
      if (messageIndex < messages.length) {
        bc.postMessage(messages[messageIndex]);

        const sentMessage = {
          id: this.messageCounter++,
          channel: channelName,
          port: "broadcast",
          type: "sent",
          data: messages[messageIndex],
          timestamp: Date.now(),
          size: this.calculateMessageSize(messages[messageIndex]),
        };

        this.messageHistory.push(sentMessage);
        this.addMessageToHistory(sentMessage);

        messageIndex++;
        setTimeout(sendBroadcastMessage, 2000);
      } else {
        bc.close();
        this.updateDemoStatus("브로드캐스트 데모가 완료되었습니다");
        this.showNotification("브로드캐스트 데모가 완료되었습니다", "success");
      }
    };

    sendBroadcastMessage();
  }

  runFileTransferDemo() {
    this.updateDemoStatus("파일 전송 데모를 실행 중입니다...");

    const demoChannel = "file-transfer";
    if (!this.channels.has(demoChannel)) {
      this.createChannelWithName(demoChannel);
    }

    // 가상 파일 데이터 생성
    const fileData = new ArrayBuffer(1024 * 10); // 10KB
    const view = new Uint8Array(fileData);
    for (let i = 0; i < view.length; i++) {
      view[i] = i % 256;
    }

    const fileInfo = {
      name: "demo-file.bin",
      size: fileData.byteLength,
      type: "application/octet-stream",
      timestamp: Date.now(),
    };

    const channel = this.channels.get(demoChannel);

    try {
      // Transferable Objects 사용 여부 확인
      const useTransferable = document.getElementById("transferable").checked;

      if (useTransferable) {
        // ArrayBuffer를 transfer
        channel.port1.postMessage(
          {
            type: "file-transfer",
            info: fileInfo,
            data: fileData,
          },
          [fileData]
        );
        this.showNotification(
          "파일이 Transferable Objects로 전송되었습니다",
          "success"
        );
      } else {
        // 일반 전송 (복사)
        channel.port1.postMessage({
          type: "file-transfer",
          info: fileInfo,
          data: fileData.slice(), // 복사본 생성
        });
        this.showNotification("파일이 복사되어 전송되었습니다", "success");
      }

      this.updateDemoStatus("파일 전송 데모가 완료되었습니다");
    } catch (error) {
      this.showNotification(`파일 전송 실패: ${error.message}`, "error");
    }
  }

  runChatDemo() {
    this.updateDemoStatus("실시간 채팅 데모를 실행 중입니다...");

    const chatChannel = "chat-demo";
    if (!this.channels.has(chatChannel)) {
      this.createChannelWithName(chatChannel);
    }

    const channel = this.channels.get(chatChannel);
    const users = ["Alice", "Bob", "Charlie"];
    const messages = [
      "안녕하세요! 채팅방에 입장했습니다.",
      "오늘 날씨가 정말 좋네요!",
      "Channel Messaging API 데모를 보고 계시는군요 👍",
      "이 기술로 실시간 채팅을 구현할 수 있어요",
      "멀티탭 환경에서도 동기화됩니다!",
    ];

    let messageIndex = 0;
    const sendChatMessage = () => {
      if (messageIndex < messages.length) {
        const user = users[messageIndex % users.length];
        const message = messages[messageIndex];

        const chatData = {
          type: "chat-message",
          user: user,
          message: message,
          timestamp: Date.now(),
          id: Math.random().toString(36).substr(2, 9),
        };

        channel.port1.postMessage(chatData);

        // 읽음 확인 시뮬레이션
        setTimeout(() => {
          channel.port2.postMessage({
            type: "message-read",
            messageId: chatData.id,
            reader: user === "Alice" ? "Bob" : "Alice",
            timestamp: Date.now(),
          });
        }, Math.random() * 2000 + 500);

        messageIndex++;
        setTimeout(sendChatMessage, Math.random() * 3000 + 1000);
      } else {
        this.updateDemoStatus("채팅 데모가 완료되었습니다");
        this.showNotification("채팅 데모가 완료되었습니다", "success");
      }
    };

    sendChatMessage();
  }

  // 파일 관련 메서드들
  selectFile() {
    const fileInput = document.getElementById("fileInput");
    fileInput.click();
  }

  handleFileSelection(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const targetChannel = document.getElementById("targetChannel").value;
      if (!targetChannel) {
        this.showNotification("대상 채널을 선택해주세요", "warning");
        return;
      }

      const channel = this.channels.get(targetChannel);
      if (!channel) {
        this.showNotification("선택한 채널이 존재하지 않습니다", "error");
        return;
      }

      const fileData = {
        type: "file",
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: e.target.result,
        timestamp: Date.now(),
      };

      try {
        channel.port1.postMessage(fileData);
        this.showNotification(
          `파일 '${file.name}'이 전송되었습니다`,
          "success"
        );

        // 히스토리에 추가
        const message = {
          id: this.messageCounter++,
          channel: targetChannel,
          port: "port1",
          type: "sent",
          data: fileData,
          timestamp: Date.now(),
          size: file.size,
        };

        this.messageHistory.push(message);
        this.addMessageToHistory(message);
        this.updateStatistics();
      } catch (error) {
        this.showNotification(`파일 전송 실패: ${error.message}`, "error");
      }
    };

    reader.readAsArrayBuffer(file);
  }

  sendBroadcast() {
    if (!window.BroadcastChannel) {
      this.showNotification(
        "이 브라우저는 BroadcastChannel을 지원하지 않습니다",
        "error"
      );
      return;
    }

    const messageContent = document.getElementById("messageContent").value;
    if (!messageContent.trim()) {
      this.showNotification("브로드캐스트할 메시지를 입력해주세요", "warning");
      return;
    }

    const bc = new BroadcastChannel("global-broadcast");
    const broadcastData = {
      type: "user-broadcast",
      message: messageContent,
      timestamp: Date.now(),
      source: "Channel Messaging API Demo",
    };

    bc.postMessage(broadcastData);
    bc.close();

    // 히스토리에 추가
    const message = {
      id: this.messageCounter++,
      channel: "global-broadcast",
      port: "broadcast",
      type: "sent",
      data: broadcastData,
      timestamp: Date.now(),
      size: this.calculateMessageSize(broadcastData),
    };

    this.messageHistory.push(message);
    this.addMessageToHistory(message);
    this.updateStatistics();

    document.getElementById("messageContent").value = "";
    this.showNotification("브로드캐스트 메시지가 전송되었습니다", "success");
  }

  // UI 업데이트 메서드들
  updateChannelList() {
    const channelList = document.getElementById("channelList");
    if (!channelList) return;

    if (this.channels.size === 0) {
      channelList.innerHTML =
        '<div class="list-placeholder">생성된 채널이 없습니다</div>';
      return;
    }

    const channelArray = Array.from(this.channels.entries());
    channelList.innerHTML = channelArray
      .map(
        ([name, data]) => `
        <div class="channel-item ${
          data.isActive ? "active" : "inactive"
        }" data-channel="${name}">
          <div class="channel-info">
            <div class="channel-name">${name}</div>
            <div class="channel-meta">
              <span class="channel-created">생성: ${new Date(
                data.created
              ).toLocaleTimeString()}</span>
              <span class="channel-messages">메시지: ${data.messageCount}</span>
            </div>
          </div>
          <div class="channel-actions">
            <button class="channel-test" onclick="window.channelMessagingAPI.testChannel('${name}')">테스트</button>
            <button class="channel-close" onclick="window.channelMessagingAPI.closeChannel('${name}')">닫기</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  updateTargetChannelOptions() {
    const targetChannel = document.getElementById("targetChannel");
    if (!targetChannel) return;

    const currentValue = targetChannel.value;
    targetChannel.innerHTML = '<option value="">채널을 선택하세요</option>';

    this.channels.forEach((data, name) => {
      if (data.isActive) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (name === currentValue) {
          option.selected = true;
        }
        targetChannel.appendChild(option);
      }
    });
  }

  updateStatistics() {
    const activeChannels = Array.from(this.channels.values()).filter(
      (c) => c.isActive
    ).length;
    const connectedPorts = activeChannels * 2;
    const totalMessages = this.messageHistory.length;

    document.getElementById("activeChannels").textContent = activeChannels;
    document.getElementById("connectedPorts").textContent = connectedPorts;
    document.getElementById("totalMessages").textContent = totalMessages;

    // 성능 통계 계산
    const now = Date.now();
    const recentMessages = this.messageHistory.filter(
      (m) => now - m.timestamp < 60000
    );
    const messageRate = recentMessages.length / 60;

    const sentMessages = this.messageHistory.filter(
      (m) => m.type === "sent" && m.latency
    );
    const averageLatency =
      sentMessages.length > 0
        ? sentMessages.reduce((sum, m) => sum + m.latency, 0) /
          sentMessages.length
        : 0;

    const errorMessages = this.messageHistory.filter((m) => m.type === "error");
    const successRate =
      totalMessages > 0
        ? ((totalMessages - errorMessages.length) / totalMessages) * 100
        : 100;

    document.getElementById("messageRate").textContent = `${messageRate.toFixed(
      1
    )}/s`;
    document.getElementById(
      "averageLatency"
    ).textContent = `${averageLatency.toFixed(1)}ms`;
    document.getElementById("successRate").textContent = `${successRate.toFixed(
      1
    )}%`;
    document.getElementById("queueSize").textContent = "0"; // 큐 크기는 간단히 0으로 설정
  }

  addMessageToHistory(message) {
    const messageHistory = document.getElementById("messageHistory");
    if (!messageHistory) return;

    // 플레이스홀더 제거
    const placeholder = messageHistory.querySelector(".history-placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    const messageElement = document.createElement("div");
    messageElement.className = `message-item ${message.type}`;
    messageElement.innerHTML = `
      <div class="message-header">
        <div class="message-info">
          <span class="message-id">#${message.id}</span>
          <span class="message-channel">${message.channel}</span>
          <span class="message-port">${message.port}</span>
          <span class="message-type">${message.type}</span>
        </div>
        <div class="message-meta">
          <span class="message-time">${new Date(
            message.timestamp
          ).toLocaleTimeString()}</span>
          <span class="message-size">${this.formatSize(message.size)}</span>
        </div>
      </div>
      <div class="message-content">
        <pre>${this.formatMessageData(message.data)}</pre>
      </div>
    `;

    messageHistory.appendChild(messageElement);

    // 자동 스크롤
    const autoScrollBtn = document.getElementById("toggleAutoScroll");
    if (autoScrollBtn && autoScrollBtn.classList.contains("active")) {
      messageHistory.scrollTop = messageHistory.scrollHeight;
    }

    // 최대 메시지 수 제한
    const messages = messageHistory.querySelectorAll(".message-item");
    if (messages.length > 100) {
      messages[0].remove();
    }
  }

  filterMessageHistory(filter) {
    const messages = document.querySelectorAll(".message-item");

    messages.forEach((message) => {
      let show = false;

      switch (filter) {
        case "all":
          show = true;
          break;
        case "sent":
          show = message.classList.contains("sent");
          break;
        case "received":
          show = message.classList.contains("received");
          break;
        case "error":
          show = message.classList.contains("error");
          break;
      }

      message.style.display = show ? "block" : "none";
    });
  }

  toggleAutoScroll() {
    const autoScrollBtn = document.getElementById("toggleAutoScroll");
    if (autoScrollBtn) {
      autoScrollBtn.classList.toggle("active");
      const isActive = autoScrollBtn.classList.contains("active");
      autoScrollBtn.textContent = isActive
        ? "📜 자동 스크롤"
        : "📜 수동 스크롤";
    }
  }

  toggleLogging() {
    this.isListening = !this.isListening;
    const pauseBtn = document.getElementById("pauseLogging");
    if (pauseBtn) {
      pauseBtn.textContent = this.isListening
        ? "⏸️ 로깅 일시정지"
        : "▶️ 로깅 재시작";
      pauseBtn.className = this.isListening ? "btn-secondary" : "btn-primary";
    }

    this.showNotification(
      this.isListening
        ? "메시지 로깅이 재시작되었습니다"
        : "메시지 로깅이 일시정지되었습니다",
      "info"
    );
  }

  clearMessageHistory() {
    this.messageHistory = [];
    const messageHistory = document.getElementById("messageHistory");
    if (messageHistory) {
      messageHistory.innerHTML =
        '<div class="history-placeholder">메시지 히스토리가 여기에 표시됩니다</div>';
    }
    this.updateStatistics();
    this.showNotification("메시지 히스토리가 삭제되었습니다", "info");
  }

  closeSelectedChannel() {
    const targetChannel = document.getElementById("targetChannel").value;
    if (!targetChannel) {
      this.showNotification("닫을 채널을 선택해주세요", "warning");
      return;
    }

    this.closeChannel(targetChannel);
  }

  closeChannel(name) {
    if (this.channels.has(name)) {
      const channel = this.channels.get(name);
      channel.port1.close();
      channel.port2.close();
      channel.isActive = false;
      this.channels.delete(name);

      this.updateChannelList();
      this.updateTargetChannelOptions();
      this.updateStatistics();
      this.showNotification(`채널 '${name}'이 닫혔습니다`, "info");
    }
  }

  testChannel(name) {
    if (!this.channels.has(name)) {
      this.showNotification("채널이 존재하지 않습니다", "error");
      return;
    }

    const channel = this.channels.get(name);
    const testData = {
      type: "test",
      message: "테스트 메시지",
      timestamp: Date.now(),
      random: Math.random(),
    };

    channel.port1.postMessage(testData);
    this.showNotification(
      `채널 '${name}' 테스트 메시지가 전송되었습니다`,
      "success"
    );
  }

  exportData() {
    const exportData = {
      channels: Array.from(this.channels.entries()).map(([name, data]) => ({
        name,
        created: data.created,
        messageCount: data.messageCount,
        isActive: data.isActive,
      })),
      messageHistory: this.messageHistory.map((msg) => ({
        ...msg,
        data: this.sanitizeForExport(msg.data),
      })),
      statistics: {
        totalChannels: this.channels.size,
        totalMessages: this.messageHistory.length,
        exportTimestamp: Date.now(),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `channel-messaging-data-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    this.showNotification("데이터가 내보내졌습니다", "success");
  }

  switchTab(tabId) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    document.getElementById(`tab-${tabId}`).classList.add("active");
  }

  updateDemoStatus(message) {
    const demoStatus = document.getElementById("demoStatus");
    if (demoStatus) {
      demoStatus.textContent = message;
    }
  }

  // 유틸리티 메서드들
  calculateMessageSize(data) {
    if (typeof data === "string") {
      return new Blob([data]).size;
    } else if (data instanceof ArrayBuffer) {
      return data.byteLength;
    } else if (data instanceof Uint8Array) {
      return data.byteLength;
    } else {
      return new Blob([JSON.stringify(data)]).size;
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  formatMessageData(data) {
    if (data instanceof ArrayBuffer) {
      return `ArrayBuffer(${data.byteLength} bytes)`;
    } else if (data instanceof Uint8Array) {
      return `Uint8Array(${data.byteLength} bytes): [${Array.from(
        data.slice(0, 20)
      ).join(", ")}${data.byteLength > 20 ? "..." : ""}]`;
    } else if (typeof data === "object") {
      return JSON.stringify(data, null, 2);
    } else {
      return String(data);
    }
  }

  sanitizeForExport(data) {
    if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      return `[Binary Data: ${data.byteLength || data.length} bytes]`;
    }
    return data;
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

  // 정리
  cleanup() {
    // 모든 채널 닫기
    this.channels.forEach((channel) => {
      channel.port1.close();
      channel.port2.close();
    });
    this.channels.clear();

    // Worker 정리
    this.workers.forEach((worker) => {
      worker.worker.terminate();
    });
    this.workers.clear();

    // iframe 정리
    this.iframes.forEach((iframe) => {
      if (iframe.iframe.parentNode) {
        iframe.iframe.parentNode.removeChild(iframe.iframe);
      }
    });
    this.iframes.clear();
  }
}

// 전역 접근을 위한 설정
window.channelMessagingAPI = null;

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  if (window.channelMessagingAPI) {
    window.channelMessagingAPI.cleanup();
  }
});

// 초기화
function initChannelMessagingAPI() {
  console.log("🚀 Channel Messaging API 초기화 함수 호출");
  window.channelMessagingAPI = new ChannelMessagingAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initChannelMessagingAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initChannelMessagingAPI();
}

console.log(
  "📄 Channel Messaging API 스크립트 로드 완료, readyState:",
  document.readyState
);
