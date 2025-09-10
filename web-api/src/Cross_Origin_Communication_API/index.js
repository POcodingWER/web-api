import "./style.css";

/**
 * Cross Origin Communication API 데모 클래스
 * postMessage, CORS, iframe 통신, 팝업 통신 등 크로스 오리진 통신 기능을 구현
 */
class CrossOriginCommunicationAPI {
  constructor() {
    this.iframes = new Map();
    this.popups = new Map();
    this.messageHandlers = new Map();
    this.allowedOrigins = new Set([
      "http://localhost:5173",
      "https://example.com",
    ]);
    this.messageHistory = [];
    this.settings = {
      enableEncryption: true,
      validateOrigin: true,
      logMessages: true,
      autoReconnect: true,
      messageTimeout: 5000,
      maxHistorySize: 100,
      filterExtensions: true, // 브라우저 확장 프로그램 메시지 필터링
    };

    this.init();
  }

  init() {
    this.createHTML();
    this.setupEventListeners();
    this.loadSettings();
    this.setupMessageListener();
    this.startHeartbeat();
    console.log("🌐 Cross Origin Communication API initialized!");
  }

  createHTML() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="cross-origin-container">
        <!-- 헤더 -->
        <header class="header">
          <h1>🌐 Cross Origin Communication API</h1>
          <p>다른 도메인과의 안전한 통신 - postMessage, CORS, iframe 통신</p>
        </header>

        <!-- 상태 패널 -->
        <div class="status-panel">
          <div class="status-item">
            <span class="status-label">활성 연결:</span>
            <span id="activeConnections" class="status-value">0</span>
          </div>
          <div class="status-item">
            <span class="status-label">전송된 메시지:</span>
            <span id="sentMessages" class="status-value">0</span>
          </div>
          <div class="status-item">
            <span class="status-label">수신된 메시지:</span>
            <span id="receivedMessages" class="status-value">0</span>
          </div>
          <div class="status-item">
            <span class="status-label">현재 Origin:</span>
            <span id="currentOrigin" class="status-value">${
              window.location.origin
            }</span>
          </div>
        </div>

        <!-- 메인 탭 -->
        <div class="main-tabs">
          <button class="tab-btn active" data-tab="iframe">📱 iFrame 통신</button>
          <button class="tab-btn" data-tab="popup">🪟 팝업 통신</button>
          <button class="tab-btn" data-tab="cors">🌍 CORS 요청</button>
          <button class="tab-btn" data-tab="messaging">💬 메시징</button>
          <button class="tab-btn" data-tab="security">🔒 보안</button>
        </div>

        <!-- iFrame 통신 탭 -->
        <div class="tab-content active" data-tab="iframe">
          <div class="section">
            <h2>📱 iFrame 크로스 오리진 통신</h2>
            
            <div class="iframe-controls">
              <div class="control-group">
                <label for="iframeUrl">iFrame URL:</label>
                <input type="text" id="iframeUrl" placeholder="https://example.com" value="data:text/html;charset=utf-8,${encodeURIComponent(`
                  <!DOCTYPE html>
                  <html lang="ko">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Demo Frame</title>
                  </head>
                  <body style='font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-align: center;'>
                    <h2>🎯 Demo iFrame</h2>
                    <p>이것은 크로스 오리진 통신을 테스트하는 데모 iFrame입니다.</p>
                    <p><strong>한글 테스트:</strong> 안녕하세요! 🇰🇷</p>
                    <div style="margin: 20px 0;">
                      <button onclick="sendToParent()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; font-family: inherit;">부모에게 인사하기</button>
                      <button onclick="sendKoreanMessage()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; font-family: inherit;">한글 메시지 전송</button>
                    </div>
                    <div id="messages" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin-top: 10px; text-align: left; font-size: 12px; max-height: 150px; overflow-y: auto;"></div>
                    <script>
                      function sendToParent() {
                        parent.postMessage({
                          type: 'greeting',
                          message: 'iFrame에서 안녕하세요! 한글 메시지 테스트입니다! 🚀',
                          timestamp: Date.now()
                        }, '*');
                      }
                      
                      function sendKoreanMessage() {
                        parent.postMessage({
                          type: 'korean-test',
                          message: '한글 인코딩 테스트 성공! 🎉 이모지도 잘 보이나요? 💻🌟',
                          data: {
                            korean: '한국어',
                            english: 'English',
                            mixed: '혼합 Mixed 🌈'
                          },
                          timestamp: Date.now()
                        }, '*');
                      }
                      
                      window.addEventListener('message', (event) => {
                        const div = document.createElement('div');
                        div.style.cssText = 'margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;';
                        div.innerHTML = '<strong>수신:</strong> ' + JSON.stringify(event.data, null, 2).replace(/\\n/g, '<br>');
                        document.getElementById('messages').appendChild(div);
                        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
                      });
                      
                      // 자동 인사
                      setTimeout(() => {
                        sendToParent();
                      }, 1000);
                    </script>
                  </body>
                  </html>
                `)}">
                <button id="loadIframe" class="btn btn-primary">iFrame 로드</button>
                <button id="removeIframe" class="btn btn-secondary">제거</button>
              </div>
              
              <div class="control-group">
                <label for="iframeMessage">iFrame에 보낼 메시지:</label>
                <input type="text" id="iframeMessage" placeholder="메시지를 입력하세요">
                <button id="sendToIframe" class="btn btn-accent">전송</button>
              </div>
            </div>

            <div class="iframe-container">
              <div id="iframeWrapper" class="iframe-wrapper">
                <p class="placeholder">iFrame을 로드하려면 위의 버튼을 클릭하세요</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 팝업 통신 탭 -->
        <div class="tab-content" data-tab="popup">
          <div class="section">
            <h2>🪟 팝업 크로스 오리진 통신</h2>
            
            <div class="popup-controls">
              <div class="control-group">
                <label for="popupUrl">팝업 URL:</label>
                <input type="text" id="popupUrl" placeholder="https://example.com" value="data:text/html;charset=utf-8,${encodeURIComponent(`
                  <!DOCTYPE html>
                  <html lang="ko">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Demo Popup</title>
                  </head>
                  <body style='font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: linear-gradient(45deg, #f093fb, #f5576c); color: white; text-align: center;'>
                    <h2>🚀 Demo 팝업</h2>
                    <p>이것은 크로스 오리진 통신을 테스트하는 데모 팝업 창입니다.</p>
                    <p><strong>한글 테스트:</strong> 팝업에서 안녕하세요! 🎪</p>
                    <div style="margin: 20px 0;">
                      <button onclick="sendToOpener()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; font-family: inherit;">부모에게 메시지 보내기</button>
                      <button onclick="sendKoreanMessage()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; font-family: inherit;">한글 메시지 전송</button>
                      <button onclick="window.close()" style="background: rgba(255,0,0,0.3); border: 2px solid #ff6b6b; color: white; padding: 10px 15px; margin: 5px; border-radius: 5px; cursor: pointer; font-family: inherit;">창 닫기</button>
                    </div>
                    <div id="messages" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin-top: 10px; text-align: left; font-size: 12px; max-height: 150px; overflow-y: auto;"></div>
                    <script>
                      function sendToOpener() {
                        if (window.opener) {
                          window.opener.postMessage({
                            type: 'popup-message',
                            message: '팝업에서 안녕하세요! 한글 메시지 테스트입니다! 🎈',
                            timestamp: Date.now()
                          }, '*');
                        }
                      }
                      
                      function sendKoreanMessage() {
                        if (window.opener) {
                          window.opener.postMessage({
                            type: 'korean-popup-test',
                            message: '팝업에서 한글 인코딩 테스트! 🎆 이모지와 함께! 🌸',
                            data: {
                              source: '팝업 창',
                              test: '한글 테스트',
                              emoji: '🎊🎉🎈',
                              mixed: '한글 + English + 🌟'
                            },
                            timestamp: Date.now()
                          }, '*');
                        }
                      }
                      
                      window.addEventListener('message', (event) => {
                        const div = document.createElement('div');
                        div.style.cssText = 'margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 3px;';
                        div.innerHTML = '<strong>수신:</strong> ' + JSON.stringify(event.data, null, 2).replace(/\\n/g, '<br>');
                        document.getElementById('messages').appendChild(div);
                        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
                      });
                      
                      window.addEventListener('beforeunload', () => {
                        if (window.opener) {
                          window.opener.postMessage({type: 'popup-closed'}, '*');
                        }
                      });
                      
                      // 자동 인사
                      setTimeout(() => {
                        sendToOpener();
                      }, 1000);
                    </script>
                  </body>
                  </html>
                `)}">
                <button id="openPopup" class="btn btn-primary">팝업 열기</button>
                <button id="openTestPopup" class="btn btn-accent">간단한 테스트 팝업</button>
                <button id="closeAllPopups" class="btn btn-secondary">모든 팝업 닫기</button>
              </div>
              
              <div class="control-group">
                <label for="popupMessage">팝업에 보낼 메시지:</label>
                <input type="text" id="popupMessage" placeholder="메시지를 입력하세요">
                <button id="sendToPopup" class="btn btn-accent">모든 팝업에 전송</button>
              </div>

              <div class="popup-list">
                <h3>열린 팝업 목록:</h3>
                <div id="popupList" class="popup-items">
                  <p class="empty-state">열린 팝업이 없습니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CORS 요청 탭 -->
        <div class="tab-content" data-tab="cors">
          <div class="section">
            <h2>🌍 CORS (Cross-Origin Resource Sharing)</h2>
            
            <div class="cors-controls">
              <div class="control-group">
                <label for="corsUrl">요청 URL:</label>
                <input type="text" id="corsUrl" placeholder="https://api.example.com/data" value="https://jsonplaceholder.typicode.com/posts/1">
                <select id="corsMethod">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <button id="sendCorsRequest" class="btn btn-primary">요청 보내기</button>
              </div>

              <div class="control-group">
                <label for="corsHeaders">커스텀 헤더 (JSON):</label>
                <textarea id="corsHeaders" placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'></textarea>
              </div>

              <div class="control-group">
                <label for="corsBody">요청 Body (JSON):</label>
                <textarea id="corsBody" placeholder='{"title": "foo", "body": "bar", "userId": 1}'></textarea>
              </div>
            </div>

            <div class="cors-response">
              <h3>응답 결과:</h3>
              <div id="corsResponse" class="response-area">
                <p class="placeholder">CORS 요청을 보내면 여기에 결과가 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 메시징 탭 -->
        <div class="tab-content" data-tab="messaging">
          <div class="section">
            <h2>💬 실시간 메시징 시스템</h2>
            
            <div class="messaging-controls">
              <div class="control-group">
                <label for="targetOrigin">대상 Origin:</label>
                <input type="text" id="targetOrigin" placeholder="https://example.com" value="*">
                <button id="addOrigin" class="btn btn-secondary">허용 목록에 추가</button>
              </div>

              <div class="control-group">
                <label for="messageType">메시지 타입:</label>
                <select id="messageType">
                  <option value="text">텍스트</option>
                  <option value="json">JSON 데이터</option>
                  <option value="binary">바이너리</option>
                  <option value="encrypted">암호화된 메시지</option>
                </select>
              </div>

              <div class="control-group">
                <label for="messageContent">메시지 내용:</label>
                <textarea id="messageContent" placeholder="전송할 메시지를 입력하세요"></textarea>
                <button id="sendMessage" class="btn btn-accent">메시지 전송</button>
                <button id="broadcastMessage" class="btn btn-primary">브로드캐스트</button>
              </div>
            </div>

            <div class="message-history">
              <h3>메시지 히스토리:</h3>
              <div class="history-controls">
                <button id="clearHistory" class="btn btn-secondary">히스토리 삭제</button>
                <button id="exportHistory" class="btn btn-info">히스토리 내보내기</button>
                <label>
                  <input type="checkbox" id="autoScroll" checked>
                  자동 스크롤
                </label>
              </div>
              <div id="messageHistory" class="message-list">
                <p class="empty-state">아직 메시지가 없습니다</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 보안 탭 -->
        <div class="tab-content" data-tab="security">
          <div class="section">
            <h2>🔒 보안 및 설정</h2>
            
            <div class="security-settings">
              <h3>보안 설정:</h3>
              <div class="settings-grid">
                <label class="setting-item">
                  <input type="checkbox" id="enableEncryption">
                  <span>메시지 암호화 활성화</span>
                </label>
                <label class="setting-item">
                  <input type="checkbox" id="validateOrigin">
                  <span>Origin 검증 활성화</span>
                </label>
                <label class="setting-item">
                  <input type="checkbox" id="logMessages">
                  <span>메시지 로깅 활성화</span>
                </label>
                <label class="setting-item">
                  <input type="checkbox" id="autoReconnect">
                  <span>자동 재연결 활성화</span>
                </label>
                <label class="setting-item">
                  <input type="checkbox" id="filterExtensions">
                  <span>브라우저 확장 프로그램 메시지 필터링</span>
                </label>
              </div>

              <div class="setting-item">
                <label for="messageTimeout">메시지 타임아웃: <span id="timeoutValue">5000</span>ms</label>
                <input type="range" id="messageTimeout" min="1000" max="30000" value="5000" step="1000">
              </div>

              <div class="setting-item">
                <label for="maxHistorySize">최대 히스토리 크기: <span id="historyValue">100</span></label>
                <input type="range" id="maxHistorySize" min="10" max="1000" value="100" step="10">
              </div>
            </div>

            <div class="allowed-origins">
              <h3>허용된 Origin 목록:</h3>
              <div id="originList" class="origin-list">
                <!-- 동적으로 생성 -->
              </div>
              <div class="origin-controls">
                <input type="text" id="newOrigin" placeholder="새 Origin 추가 (예: https://example.com)">
                <button id="addOriginBtn" class="btn btn-primary">추가</button>
              </div>
            </div>

            <div class="encryption-demo">
              <h3>암호화 데모:</h3>
              <div class="control-group">
                <label for="plainText">평문:</label>
                <textarea id="plainText" placeholder="암호화할 텍스트를 입력하세요"></textarea>
                <button id="encryptText" class="btn btn-accent">암호화</button>
              </div>
              <div class="control-group">
                <label for="encryptedText">암호화된 텍스트:</label>
                <textarea id="encryptedText" readonly></textarea>
                <button id="decryptText" class="btn btn-secondary">복호화</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 연결 상태 모니터 -->
        <div class="connection-monitor">
          <h2>📊 연결 상태 모니터</h2>
          <div class="monitor-grid">
            <div class="monitor-item">
              <h4>iFrame 연결</h4>
              <div id="iframeStatus" class="connection-status disconnected">
                <span class="status-dot"></span>
                <span class="status-text">연결 안됨</span>
              </div>
            </div>
            <div class="monitor-item">
              <h4>팝업 연결</h4>
              <div id="popupStatus" class="connection-status disconnected">
                <span class="status-dot"></span>
                <span class="status-text">연결 안됨</span>
              </div>
            </div>
            <div class="monitor-item">
              <h4>CORS 상태</h4>
              <div id="corsStatus" class="connection-status disconnected">
                <span class="status-dot"></span>
                <span class="status-text">대기 중</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 실제 사용 예제 -->
        <div class="examples-section">
          <h2>🔧 실제 사용 예제</h2>
          <div class="examples-grid">
            <div class="example-card">
              <h3>🎮 게임 임베드</h3>
              <p>외부 게임을 iFrame으로 임베드하고 점수 통신</p>
              <button class="btn btn-primary" onclick="this.parentElement.parentElement.loadGameExample()">데모 실행</button>
            </div>
            <div class="example-card">
              <h3>💳 결제 시스템</h3>
              <p>안전한 결제 팝업과 부모 창 간의 통신</p>
              <button class="btn btn-primary" onclick="this.parentElement.parentElement.loadPaymentExample()">데모 실행</button>
            </div>
            <div class="example-card">
              <h3>📊 위젯 통신</h3>
              <p>대시보드 위젯 간의 데이터 동기화</p>
              <button class="btn btn-primary" onclick="this.parentElement.parentElement.loadWidgetExample()">데모 실행</button>
            </div>
            <div class="example-card">
              <h3>🔐 OAuth 인증</h3>
              <p>OAuth 팝업과 메인 앱 간의 인증 토큰 교환</p>
              <button class="btn btn-primary" onclick="this.parentElement.parentElement.loadOAuthExample()">데모 실행</button>
            </div>
          </div>
        </div>

        <!-- 개발자 도구 -->
        <div class="dev-tools">
          <h2>🛠️ 개발자 도구</h2>
          <div class="tools-grid">
            <button id="inspectMessages" class="btn btn-info">메시지 인스펙터</button>
            <button id="networkAnalyzer" class="btn btn-info">네트워크 분석기</button>
            <button id="securityChecker" class="btn btn-warning">보안 검사기</button>
            <button id="performanceMonitor" class="btn btn-success">성능 모니터</button>
          </div>
          <div id="devToolsOutput" class="dev-output">
            <p class="placeholder">개발자 도구 결과가 여기에 표시됩니다</p>
          </div>
        </div>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>

        <!-- 메시지 인스펙터 모달 -->
        <div id="messageInspector" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h3>🔍 메시지 인스펙터</h3>
              <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
              <div id="inspectorContent"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // 탭 전환
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTab(e.target.dataset.tab)
      );
    });

    // iFrame 관련
    document
      .getElementById("loadIframe")
      .addEventListener("click", () => this.loadIframe());
    document
      .getElementById("removeIframe")
      .addEventListener("click", () => this.removeIframe());
    document
      .getElementById("sendToIframe")
      .addEventListener("click", () => this.sendToIframe());

    // 팝업 관련
    document
      .getElementById("openPopup")
      .addEventListener("click", () => this.openPopup());
    document
      .getElementById("openTestPopup")
      .addEventListener("click", () => this.openTestPopup());
    document
      .getElementById("closeAllPopups")
      .addEventListener("click", () => this.closeAllPopups());
    document
      .getElementById("sendToPopup")
      .addEventListener("click", () => this.sendToPopup());

    // CORS 관련
    document
      .getElementById("sendCorsRequest")
      .addEventListener("click", () => this.sendCorsRequest());

    // 메시징 관련
    document
      .getElementById("addOrigin")
      .addEventListener("click", () => this.addAllowedOrigin());
    document
      .getElementById("sendMessage")
      .addEventListener("click", () => this.sendMessage());
    document
      .getElementById("broadcastMessage")
      .addEventListener("click", () => this.broadcastMessage());
    document
      .getElementById("clearHistory")
      .addEventListener("click", () => this.clearMessageHistory());
    document
      .getElementById("exportHistory")
      .addEventListener("click", () => this.exportMessageHistory());

    // 보안 설정
    document
      .getElementById("enableEncryption")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("validateOrigin")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("logMessages")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("autoReconnect")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("filterExtensions")
      .addEventListener("change", () => this.saveSettings());
    document.getElementById("messageTimeout").addEventListener("input", (e) => {
      document.getElementById("timeoutValue").textContent = e.target.value;
      this.saveSettings();
    });
    document.getElementById("maxHistorySize").addEventListener("input", (e) => {
      document.getElementById("historyValue").textContent = e.target.value;
      this.saveSettings();
    });

    // Origin 관리
    document
      .getElementById("addOriginBtn")
      .addEventListener("click", () => this.addNewOrigin());

    // 암호화 데모
    document
      .getElementById("encryptText")
      .addEventListener("click", () => this.encryptDemo());
    document
      .getElementById("decryptText")
      .addEventListener("click", () => this.decryptDemo());

    // 개발자 도구
    document
      .getElementById("inspectMessages")
      .addEventListener("click", () => this.openMessageInspector());
    document
      .getElementById("networkAnalyzer")
      .addEventListener("click", () => this.analyzeNetwork());
    document
      .getElementById("securityChecker")
      .addEventListener("click", () => this.checkSecurity());
    document
      .getElementById("performanceMonitor")
      .addEventListener("click", () => this.monitorPerformance());

    // 모달 닫기
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal").classList.add("hidden");
      });
    });

    // 키보드 단축키
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // 페이지 언로드 시 정리
    window.addEventListener("beforeunload", () => this.cleanup());
  }

  // 메시지 리스너 설정
  setupMessageListener() {
    window.addEventListener("message", (event) => {
      this.handleMessage(event);
    });
  }

  // 메시지 핸들러
  handleMessage(event) {
    // 브라우저 확장 프로그램 메시지 필터링
    if (this.settings.filterExtensions && this.isExtensionMessage(event.data)) {
      return; // 확장 프로그램 메시지는 무시
    }

    // Origin 검증
    if (this.settings.validateOrigin && !this.isOriginAllowed(event.origin)) {
      console.warn("Message from unauthorized origin:", event.origin);
      this.showNotification(`허용되지 않은 Origin: ${event.origin}`, "warning");
      return;
    }

    // 메시지 로깅
    if (this.settings.logMessages) {
      console.log("Received message:", event);
    }

    // 히스토리에 추가
    this.addToMessageHistory("received", event.data, event.origin);

    // 메시지 타입별 처리
    if (event.data && typeof event.data === "object") {
      switch (event.data.type) {
        case "greeting":
          this.handleGreeting(event);
          break;
        case "popup-message":
          this.handlePopupMessage(event);
          break;
        case "popup-closed":
          this.handlePopupClosed(event);
          break;
        case "heartbeat":
          this.handleHeartbeat(event);
          break;
        case "encrypted":
          this.handleEncryptedMessage(event);
          break;
        case "korean-test":
          this.handleKoreanTest(event);
          break;
        case "korean-popup-test":
          this.handleKoreanPopupTest(event);
          break;
        default:
          this.handleGenericMessage(event);
      }
    }

    // 통계 업데이트
    this.updateMessageStats("received");
    this.updateConnectionStatus();
  }

  // 인사 메시지 처리
  handleGreeting(event) {
    this.showNotification(`iFrame에서 인사: ${event.data.message}`, "success");

    // 자동 응답
    setTimeout(() => {
      this.sendToIframe("Hello back from parent!");
    }, 1000);
  }

  // 팝업 메시지 처리
  handlePopupMessage(event) {
    this.showNotification(`팝업에서 메시지: ${event.data.message}`, "info");
  }

  // 팝업 닫힘 처리
  handlePopupClosed(event) {
    // 팝업 목록에서 제거
    for (const [id, popup] of this.popups.entries()) {
      if (popup.closed) {
        this.popups.delete(id);
      }
    }
    this.updatePopupList();
    this.updateConnectionStatus();
  }

  // 하트비트 처리
  handleHeartbeat(event) {
    // 하트비트 응답
    if (event.source) {
      event.source.postMessage(
        {
          type: "heartbeat-response",
          timestamp: Date.now(),
        },
        event.origin
      );
    }
  }

  // 한글 테스트 메시지 처리 (iFrame)
  handleKoreanTest(event) {
    this.showNotification(
      `🇰🇷 한글 테스트 메시지: ${event.data.message}`,
      "success"
    );

    // 한글 응답
    if (event.source) {
      event.source.postMessage(
        {
          type: "response",
          message:
            "부모에서 한글 응답합니다! 🎉 인코딩이 정상적으로 작동하네요! ✨",
          koreanData: {
            greeting: "안녕하세요",
            status: "성공",
            emoji: "🚀🌟💻",
          },
          timestamp: Date.now(),
        },
        event.origin
      );
    }
  }

  // 한글 팝업 테스트 메시지 처리
  handleKoreanPopupTest(event) {
    this.showNotification(
      `🎪 팝업 한글 테스트: ${event.data.message}`,
      "success"
    );

    // 팝업에 한글 응답
    if (event.source) {
      event.source.postMessage(
        {
          type: "response",
          message:
            "부모에서 팝업에 한글 응답! 🎈 팝업 통신도 완벽하게 작동합니다! 🎊",
          popupResponse: {
            status: "팝업 통신 성공",
            encoding: "UTF-8 정상 작동",
            emoji: "🎉🎆🌈",
          },
          timestamp: Date.now(),
        },
        event.origin
      );
    }
  }

  // 암호화된 메시지 처리
  handleEncryptedMessage(event) {
    if (this.settings.enableEncryption) {
      try {
        const decrypted = this.decrypt(event.data.content);
        this.showNotification(`암호화된 메시지 수신: ${decrypted}`, "success");
      } catch (error) {
        this.showNotification("메시지 복호화 실패", "error");
      }
    }
  }

  // 일반 메시지 처리
  handleGenericMessage(event) {
    this.showNotification(`메시지 수신: ${JSON.stringify(event.data)}`, "info");
  }

  // 탭 전환
  switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // 모든 탭 컨텐츠 숨김
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    // 선택된 탭 활성화
    document
      .querySelector(`.tab-btn[data-tab="${tabName}"]`)
      .classList.add("active");
    document
      .querySelector(`.tab-content[data-tab="${tabName}"]`)
      .classList.add("active");
  }

  // iFrame 로드
  loadIframe() {
    const url = document.getElementById("iframeUrl").value;
    const wrapper = document.getElementById("iframeWrapper");

    if (!url) {
      this.showNotification("iFrame URL을 입력하세요.", "warning");
      return;
    }

    // 기존 iFrame 제거
    this.removeIframe();

    // 새 iFrame 생성
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.width = "100%";
    iframe.style.height = "400px";
    iframe.style.border = "1px solid #ddd";
    iframe.style.borderRadius = "8px";

    // iFrame 이벤트 리스너
    iframe.onload = () => {
      this.iframes.set("main", iframe);
      this.updateConnectionStatus();
      this.showNotification("iFrame이 로드되었습니다.", "success");
    };

    iframe.onerror = () => {
      this.showNotification("iFrame 로드 실패", "error");
    };

    wrapper.innerHTML = "";
    wrapper.appendChild(iframe);
  }

  // iFrame 제거
  removeIframe() {
    const wrapper = document.getElementById("iframeWrapper");
    wrapper.innerHTML =
      '<p class="placeholder">iFrame을 로드하려면 위의 버튼을 클릭하세요</p>';
    this.iframes.clear();
    this.updateConnectionStatus();
  }

  // iFrame에 메시지 전송
  sendToIframe() {
    const message = document.getElementById("iframeMessage").value;
    const iframe = this.iframes.get("main");

    if (!iframe) {
      this.showNotification("먼저 iFrame을 로드하세요.", "warning");
      return;
    }

    if (!message) {
      this.showNotification("메시지를 입력하세요.", "warning");
      return;
    }

    const messageData = {
      type: "parent-message",
      message: message,
      timestamp: Date.now(),
    };

    // 암호화가 활성화된 경우
    if (this.settings.enableEncryption) {
      messageData.type = "encrypted";
      messageData.content = this.encrypt(message);
    }

    iframe.contentWindow.postMessage(messageData, "*");
    this.addToMessageHistory("sent", messageData, "iframe");
    this.updateMessageStats("sent");

    // 입력 필드 초기화
    document.getElementById("iframeMessage").value = "";
    this.showNotification("iFrame에 메시지를 전송했습니다.", "success");
  }

  // 팝업 열기
  openPopup() {
    const url = document.getElementById("popupUrl").value;

    if (!url) {
      this.showNotification("팝업 URL을 입력하세요.", "warning");
      return;
    }

    const popupId = Date.now().toString();

    // data URI의 경우 특별 처리
    if (url.startsWith("data:")) {
      // 먼저 빈 팝업을 열고
      const popup = window.open(
        "",
        `popup_${popupId}`,
        "width=600,height=400,scrollbars=yes,resizable=yes"
      );

      if (popup) {
        // 그 다음 document.write로 내용을 작성
        try {
          // data URI에서 실제 HTML 내용 추출
          const htmlContent = decodeURIComponent(url.split(",")[1]);

          popup.document.open();
          popup.document.write(htmlContent);
          popup.document.close();

          this.popups.set(popupId, popup);
          this.updatePopupList();
          this.updateConnectionStatus();
          this.showNotification(
            "팝업이 열렸습니다. (data URI 방식)",
            "success"
          );

          // 팝업 닫힘 감지
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              this.popups.delete(popupId);
              this.updatePopupList();
              this.updateConnectionStatus();
              clearInterval(checkClosed);
            }
          }, 1000);
        } catch (error) {
          console.error("팝업 내용 작성 실패:", error);
          popup.close();
          this.showNotification("팝업 내용 로드 실패", "error");
        }
      } else {
        this.showNotification(
          "팝업이 차단되었습니다. 팝업 차단을 해제하세요.",
          "error"
        );
      }
    } else {
      // 일반 URL의 경우 기존 방식
      const popup = window.open(
        url,
        `popup_${popupId}`,
        "width=600,height=400,scrollbars=yes,resizable=yes"
      );

      if (popup) {
        this.popups.set(popupId, popup);
        this.updatePopupList();
        this.updateConnectionStatus();
        this.showNotification("팝업이 열렸습니다.", "success");

        // 팝업 닫힘 감지
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            this.popups.delete(popupId);
            this.updatePopupList();
            this.updateConnectionStatus();
            clearInterval(checkClosed);
          }
        }, 1000);
      } else {
        this.showNotification("팝업 차단됨. 팝업 차단을 해제하세요.", "error");
      }
    }
  }

  // 간단한 테스트 팝업 열기
  openTestPopup() {
    const popupId = Date.now().toString();

    // 직접 HTML을 document.write로 작성하는 방식
    const popup = window.open(
      "",
      `test_popup_${popupId}`,
      "width=500,height=350,scrollbars=yes,resizable=yes"
    );

    if (popup) {
      try {
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="ko">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>테스트 팝업</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                margin: 0;
                text-align: center;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
              }
              button {
                background: rgba(255,255,255,0.2);
                border: 2px solid white;
                color: white;
                padding: 12px 20px;
                margin: 8px;
                border-radius: 6px;
                cursor: pointer;
                font-family: inherit;
                font-size: 14px;
              }
              button:hover {
                background: rgba(255,255,255,0.3);
              }
              .close-btn {
                background: rgba(255,0,0,0.3);
                border: 2px solid #ff6b6b;
              }
              .close-btn:hover {
                background: rgba(255,0,0,0.5);
              }
              #status {
                background: rgba(0,0,0,0.2);
                padding: 10px;
                border-radius: 5px;
                margin-top: 15px;
                font-size: 12px;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>🎉 테스트 팝업</h2>
              <p><strong>한글 테스트:</strong> 안녕하세요! 🇰🇷</p>
              <p>이 팝업은 document.write() 방식으로 생성되었습니다.</p>
              
              <div>
                <button onclick="sendTestMessage()">부모에게 테스트 메시지</button>
                <button onclick="sendKoreanMessage()">한글 메시지 전송</button>
                <button class="close-btn" onclick="window.close()">창 닫기</button>
              </div>
              
              <div id="status">대기 중...</div>
            </div>

            <script>
              function sendTestMessage() {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'popup-message',
                    message: '테스트 팝업에서 안녕하세요! 🚀',
                    timestamp: Date.now()
                  }, '*');
                  updateStatus('테스트 메시지 전송 완료!');
                }
              }
              
              function sendKoreanMessage() {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'korean-popup-test',
                    message: '한글 인코딩 테스트 성공! 🎊 document.write 방식도 잘 작동합니다!',
                    data: {
                      method: 'document.write',
                      encoding: 'UTF-8',
                      test: '한글 완벽 지원',
                      emoji: '🌟💻🎯'
                    },
                    timestamp: Date.now()
                  }, '*');
                  updateStatus('한글 메시지 전송 완료! ✨');
                }
              }
              
              function updateStatus(message) {
                document.getElementById('status').innerHTML = 
                  '<strong>상태:</strong> ' + message + '<br><small>' + new Date().toLocaleTimeString() + '</small>';
              }
              
              window.addEventListener('message', (event) => {
                updateStatus('부모로부터 메시지 수신: ' + JSON.stringify(event.data));
              });
              
              // 자동 인사
              setTimeout(() => {
                sendTestMessage();
              }, 1000);
              
              updateStatus('팝업 로드 완료! 👍');
            </script>
          </body>
          </html>
        `;

        popup.document.open();
        popup.document.write(htmlContent);
        popup.document.close();

        this.popups.set(popupId, popup);
        this.updatePopupList();
        this.updateConnectionStatus();
        this.showNotification("테스트 팝업이 열렸습니다! 🎉", "success");

        // 팝업 닫힘 감지
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            this.popups.delete(popupId);
            this.updatePopupList();
            this.updateConnectionStatus();
            clearInterval(checkClosed);
          }
        }, 1000);
      } catch (error) {
        console.error("테스트 팝업 생성 실패:", error);
        popup.close();
        this.showNotification("테스트 팝업 생성 실패", "error");
      }
    } else {
      this.showNotification(
        "팝업이 차단되었습니다. 팝업 차단을 해제하세요.",
        "error"
      );
    }
  }

  // 모든 팝업 닫기
  closeAllPopups() {
    for (const [id, popup] of this.popups.entries()) {
      if (!popup.closed) {
        popup.close();
      }
    }
    this.popups.clear();
    this.updatePopupList();
    this.updateConnectionStatus();
    this.showNotification("모든 팝업이 닫혔습니다.", "info");
  }

  // 팝업에 메시지 전송
  sendToPopup() {
    const message = document.getElementById("popupMessage").value;

    if (this.popups.size === 0) {
      this.showNotification("열린 팝업이 없습니다.", "warning");
      return;
    }

    if (!message) {
      this.showNotification("메시지를 입력하세요.", "warning");
      return;
    }

    const messageData = {
      type: "parent-to-popup",
      message: message,
      timestamp: Date.now(),
    };

    let sentCount = 0;
    for (const [id, popup] of this.popups.entries()) {
      if (!popup.closed) {
        popup.postMessage(messageData, "*");
        sentCount++;
      } else {
        this.popups.delete(id);
      }
    }

    if (sentCount > 0) {
      this.addToMessageHistory("sent", messageData, "popup");
      this.updateMessageStats("sent");
      document.getElementById("popupMessage").value = "";
      this.showNotification(
        `${sentCount}개 팝업에 메시지를 전송했습니다.`,
        "success"
      );
    }

    this.updatePopupList();
  }

  // 팝업 목록 업데이트
  updatePopupList() {
    const container = document.getElementById("popupList");

    if (this.popups.size === 0) {
      container.innerHTML = '<p class="empty-state">열린 팝업이 없습니다</p>';
      return;
    }

    container.innerHTML = Array.from(this.popups.entries())
      .map(
        ([id, popup]) => `
        <div class="popup-item">
          <span class="popup-id">팝업 ${id}</span>
          <span class="popup-status ${popup.closed ? "closed" : "open"}">
            ${popup.closed ? "닫힘" : "열림"}
          </span>
          <button class="btn-small" onclick="this.parentElement.parentElement.parentElement.closePopup('${id}')">
            닫기
          </button>
        </div>
      `
      )
      .join("");
  }

  // 특정 팝업 닫기
  closePopup(id) {
    const popup = this.popups.get(id);
    if (popup && !popup.closed) {
      popup.close();
    }
    this.popups.delete(id);
    this.updatePopupList();
    this.updateConnectionStatus();
  }

  // CORS 요청 전송
  async sendCorsRequest() {
    const url = document.getElementById("corsUrl").value;
    const method = document.getElementById("corsMethod").value;
    const headersText = document.getElementById("corsHeaders").value;
    const bodyText = document.getElementById("corsBody").value;

    if (!url) {
      this.showNotification("요청 URL을 입력하세요.", "warning");
      return;
    }

    // CORS 상태 업데이트
    document.getElementById("corsStatus").className =
      "connection-status connecting";
    document.querySelector("#corsStatus .status-text").textContent =
      "요청 중...";

    try {
      const options = {
        method: method,
        mode: "cors",
        credentials: "omit",
      };

      // 헤더 추가
      if (headersText.trim()) {
        try {
          options.headers = JSON.parse(headersText);
        } catch (error) {
          this.showNotification("헤더 JSON 형식이 잘못되었습니다.", "error");
          return;
        }
      }

      // Body 추가 (GET 요청이 아닌 경우)
      if (method !== "GET" && bodyText.trim()) {
        try {
          options.body = JSON.stringify(JSON.parse(bodyText));
          options.headers = options.headers || {};
          options.headers["Content-Type"] = "application/json";
        } catch (error) {
          options.body = bodyText;
        }
      }

      const response = await fetch(url, options);
      const responseData = await response.text();

      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      // 응답 표시
      const responseArea = document.getElementById("corsResponse");
      responseArea.innerHTML = `
        <div class="response-success">
          <h4>✅ 요청 성공</h4>
          <div class="response-meta">
            <span><strong>상태:</strong> ${response.status} ${
        response.statusText
      }</span>
            <span><strong>URL:</strong> ${url}</span>
            <span><strong>메서드:</strong> ${method}</span>
          </div>
          <div class="response-headers">
            <h5>응답 헤더:</h5>
            <pre>${Array.from(response.headers.entries())
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")}</pre>
          </div>
          <div class="response-body">
            <h5>응답 내용:</h5>
            <pre>${JSON.stringify(parsedData, null, 2)}</pre>
          </div>
        </div>
      `;

      // CORS 상태 업데이트
      document.getElementById("corsStatus").className =
        "connection-status connected";
      document.querySelector("#corsStatus .status-text").textContent = "성공";

      this.showNotification("CORS 요청이 성공했습니다.", "success");
    } catch (error) {
      // 오류 표시
      const responseArea = document.getElementById("corsResponse");
      responseArea.innerHTML = `
        <div class="response-error">
          <h4>❌ 요청 실패</h4>
          <div class="error-details">
            <p><strong>오류:</strong> ${error.message}</p>
            <p><strong>가능한 원인:</strong></p>
            <ul>
              <li>CORS 정책에 의해 차단됨</li>
              <li>네트워크 연결 오류</li>
              <li>서버에서 요청을 거부함</li>
              <li>잘못된 URL 또는 메서드</li>
            </ul>
          </div>
        </div>
      `;

      // CORS 상태 업데이트
      document.getElementById("corsStatus").className =
        "connection-status error";
      document.querySelector("#corsStatus .status-text").textContent = "실패";

      this.showNotification(`CORS 요청 실패: ${error.message}`, "error");
    }
  }

  // 허용된 Origin 추가
  addAllowedOrigin() {
    const origin = document.getElementById("targetOrigin").value.trim();
    if (origin && !this.allowedOrigins.has(origin)) {
      this.allowedOrigins.add(origin);
      this.updateOriginList();
      this.showNotification(
        `Origin "${origin}"이 허용 목록에 추가되었습니다.`,
        "success"
      );
      document.getElementById("targetOrigin").value = "";
    }
  }

  // 새 Origin 추가
  addNewOrigin() {
    const origin = document.getElementById("newOrigin").value.trim();
    if (origin && !this.allowedOrigins.has(origin)) {
      this.allowedOrigins.add(origin);
      this.updateOriginList();
      this.showNotification(
        `Origin "${origin}"이 허용 목록에 추가되었습니다.`,
        "success"
      );
      document.getElementById("newOrigin").value = "";
    }
  }

  // Origin 목록 업데이트
  updateOriginList() {
    const container = document.getElementById("originList");
    container.innerHTML = Array.from(this.allowedOrigins)
      .map(
        (origin) => `
        <div class="origin-item">
          <span class="origin-url">${origin}</span>
          <button class="btn-small btn-danger" onclick="this.parentElement.parentElement.parentElement.removeOrigin('${origin}')">
            제거
          </button>
        </div>
      `
      )
      .join("");
  }

  // Origin 제거
  removeOrigin(origin) {
    this.allowedOrigins.delete(origin);
    this.updateOriginList();
    this.showNotification(
      `Origin "${origin}"이 허용 목록에서 제거되었습니다.`,
      "info"
    );
  }

  // Origin 허용 여부 확인
  isOriginAllowed(origin) {
    return this.allowedOrigins.has("*") || this.allowedOrigins.has(origin);
  }

  // 브라우저 확장 프로그램 메시지 감지
  isExtensionMessage(data) {
    if (!data || typeof data !== "object") return false;

    // 알려진 확장 프로그램 메시지 패턴들
    const extensionPatterns = [
      // React DevTools
      data.source === "react-devtools-content-script",
      data.source === "react-devtools-bridge",
      data.source === "react-devtools-detector",

      // Vue DevTools
      data.source === "vue-devtools",
      data._vueDevtools === true,

      // Redux DevTools
      data.type === "DISPATCH" && data.state,
      data.source === "redux-devtools-extension",

      // 기타 개발자 도구
      data.source &&
        typeof data.source === "string" &&
        (data.source.includes("devtools") ||
          data.source.includes("extension") ||
          data.source.includes("chrome-extension")),

      // 브라우저 확장 프로그램 특정 속성들
      data.__REACT_DEVTOOLS_GLOBAL_HOOK__,
      data.__VUE_DEVTOOLS_GLOBAL_HOOK__,
      data.hello === true && data.source, // DevTools의 일반적인 핸드셰이크
    ];

    return extensionPatterns.some((pattern) => pattern);
  }

  // 메시지 전송
  sendMessage() {
    const targetOrigin = document.getElementById("targetOrigin").value || "*";
    const messageType = document.getElementById("messageType").value;
    const content = document.getElementById("messageContent").value;

    if (!content.trim()) {
      this.showNotification("메시지 내용을 입력하세요.", "warning");
      return;
    }

    let messageData;

    switch (messageType) {
      case "text":
        messageData = {
          type: "text",
          content: content,
          timestamp: Date.now(),
        };
        break;

      case "json":
        try {
          messageData = {
            type: "json",
            content: JSON.parse(content),
            timestamp: Date.now(),
          };
        } catch (error) {
          this.showNotification("JSON 형식이 잘못되었습니다.", "error");
          return;
        }
        break;

      case "binary":
        messageData = {
          type: "binary",
          content: new TextEncoder().encode(content),
          timestamp: Date.now(),
        };
        break;

      case "encrypted":
        if (this.settings.enableEncryption) {
          messageData = {
            type: "encrypted",
            content: this.encrypt(content),
            timestamp: Date.now(),
          };
        } else {
          this.showNotification("암호화가 비활성화되어 있습니다.", "warning");
          return;
        }
        break;
    }

    // 모든 연결된 창에 메시지 전송
    this.broadcastToAll(messageData, targetOrigin);
    this.addToMessageHistory("sent", messageData, targetOrigin);
    this.updateMessageStats("sent");

    document.getElementById("messageContent").value = "";
    this.showNotification("메시지를 전송했습니다.", "success");
  }

  // 브로드캐스트 메시지
  broadcastMessage() {
    const content = document.getElementById("messageContent").value;

    if (!content.trim()) {
      this.showNotification("메시지 내용을 입력하세요.", "warning");
      return;
    }

    const messageData = {
      type: "broadcast",
      content: content,
      timestamp: Date.now(),
      from: window.location.origin,
    };

    this.broadcastToAll(messageData, "*");
    this.addToMessageHistory("broadcast", messageData, "*");
    this.updateMessageStats("sent");

    document.getElementById("messageContent").value = "";
    this.showNotification("브로드캐스트 메시지를 전송했습니다.", "success");
  }

  // 모든 연결에 브로드캐스트
  broadcastToAll(messageData, targetOrigin) {
    let sentCount = 0;

    // iFrame에 전송
    for (const iframe of this.iframes.values()) {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(messageData, targetOrigin);
        sentCount++;
      }
    }

    // 팝업에 전송
    for (const [id, popup] of this.popups.entries()) {
      if (!popup.closed) {
        popup.postMessage(messageData, targetOrigin);
        sentCount++;
      } else {
        this.popups.delete(id);
      }
    }

    return sentCount;
  }

  // 메시지 히스토리에 추가
  addToMessageHistory(direction, data, target) {
    const historyItem = {
      id: Date.now() + Math.random(),
      direction: direction, // sent, received, broadcast
      data: data,
      target: target,
      timestamp: new Date(),
    };

    this.messageHistory.unshift(historyItem);

    // 최대 크기 제한
    if (this.messageHistory.length > this.settings.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(
        0,
        this.settings.maxHistorySize
      );
    }

    this.updateMessageHistoryDisplay();
  }

  // 메시지 히스토리 표시 업데이트
  updateMessageHistoryDisplay() {
    const container = document.getElementById("messageHistory");

    if (this.messageHistory.length === 0) {
      container.innerHTML = '<p class="empty-state">아직 메시지가 없습니다</p>';
      return;
    }

    container.innerHTML = this.messageHistory
      .map(
        (item) => `
        <div class="message-item ${item.direction}">
          <div class="message-header">
            <span class="message-direction ${item.direction}">
              ${
                item.direction === "sent"
                  ? "📤"
                  : item.direction === "received"
                  ? "📥"
                  : "📡"
              } 
              ${
                item.direction === "sent"
                  ? "전송"
                  : item.direction === "received"
                  ? "수신"
                  : "브로드캐스트"
              }
            </span>
            <span class="message-target">${item.target}</span>
            <span class="message-time">${item.timestamp.toLocaleTimeString()}</span>
          </div>
          <div class="message-content">
            <pre>${JSON.stringify(item.data, null, 2)}</pre>
          </div>
        </div>
      `
      )
      .join("");

    // 자동 스크롤
    if (document.getElementById("autoScroll").checked) {
      container.scrollTop = 0;
    }
  }

  // 메시지 히스토리 삭제
  clearMessageHistory() {
    this.messageHistory = [];
    this.updateMessageHistoryDisplay();
    this.showNotification("메시지 히스토리가 삭제되었습니다.", "info");
  }

  // 메시지 히스토리 내보내기
  exportMessageHistory() {
    const data = JSON.stringify(this.messageHistory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `message-history-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification("메시지 히스토리를 내보냈습니다.", "success");
  }

  // 암호화 (간단한 Base64 예제 - 실제로는 더 강력한 암호화 사용)
  encrypt(text) {
    return btoa(encodeURIComponent(text));
  }

  // 복호화
  decrypt(encryptedText) {
    return decodeURIComponent(atob(encryptedText));
  }

  // 암호화 데모
  encryptDemo() {
    const plainText = document.getElementById("plainText").value;
    if (!plainText) {
      this.showNotification("암호화할 텍스트를 입력하세요.", "warning");
      return;
    }

    const encrypted = this.encrypt(plainText);
    document.getElementById("encryptedText").value = encrypted;
    this.showNotification("텍스트가 암호화되었습니다.", "success");
  }

  // 복호화 데모
  decryptDemo() {
    const encryptedText = document.getElementById("encryptedText").value;
    if (!encryptedText) {
      this.showNotification("복호화할 텍스트를 입력하세요.", "warning");
      return;
    }

    try {
      const decrypted = this.decrypt(encryptedText);
      document.getElementById("plainText").value = decrypted;
      this.showNotification("텍스트가 복호화되었습니다.", "success");
    } catch (error) {
      this.showNotification("복호화 실패: 잘못된 암호화 텍스트", "error");
    }
  }

  // 하트비트 시작
  startHeartbeat() {
    setInterval(() => {
      const heartbeatMessage = {
        type: "heartbeat",
        timestamp: Date.now(),
      };

      this.broadcastToAll(heartbeatMessage, "*");
    }, 10000); // 10초마다
  }

  // 연결 상태 업데이트
  updateConnectionStatus() {
    // iFrame 상태
    const iframeStatus = document.getElementById("iframeStatus");
    if (this.iframes.size > 0) {
      iframeStatus.className = "connection-status connected";
      iframeStatus.querySelector(".status-text").textContent = "연결됨";
    } else {
      iframeStatus.className = "connection-status disconnected";
      iframeStatus.querySelector(".status-text").textContent = "연결 안됨";
    }

    // 팝업 상태
    const popupStatus = document.getElementById("popupStatus");
    const openPopups = Array.from(this.popups.values()).filter(
      (p) => !p.closed
    ).length;
    if (openPopups > 0) {
      popupStatus.className = "connection-status connected";
      popupStatus.querySelector(
        ".status-text"
      ).textContent = `${openPopups}개 연결됨`;
    } else {
      popupStatus.className = "connection-status disconnected";
      popupStatus.querySelector(".status-text").textContent = "연결 안됨";
    }

    // 활성 연결 수 업데이트
    document.getElementById("activeConnections").textContent =
      this.iframes.size + openPopups;
  }

  // 메시지 통계 업데이트
  updateMessageStats(direction) {
    if (direction === "sent") {
      const current = parseInt(
        document.getElementById("sentMessages").textContent
      );
      document.getElementById("sentMessages").textContent = current + 1;
    } else if (direction === "received") {
      const current = parseInt(
        document.getElementById("receivedMessages").textContent
      );
      document.getElementById("receivedMessages").textContent = current + 1;
    }
  }

  // 메시지 인스펙터 열기
  openMessageInspector() {
    const modal = document.getElementById("messageInspector");
    const content = document.getElementById("inspectorContent");

    content.innerHTML = `
      <div class="inspector-stats">
        <h4>📊 메시지 통계</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">총 메시지:</span>
            <span class="stat-value">${this.messageHistory.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">전송된 메시지:</span>
            <span class="stat-value">${
              this.messageHistory.filter((m) => m.direction === "sent").length
            }</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">수신된 메시지:</span>
            <span class="stat-value">${
              this.messageHistory.filter((m) => m.direction === "received")
                .length
            }</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">브로드캐스트:</span>
            <span class="stat-value">${
              this.messageHistory.filter((m) => m.direction === "broadcast")
                .length
            }</span>
          </div>
        </div>
      </div>
      
      <div class="inspector-origins">
        <h4>🌐 Origin 분석</h4>
        <div class="origins-list">
          ${Array.from(this.allowedOrigins)
            .map(
              (origin) => `
            <div class="origin-analysis">
              <span class="origin">${origin}</span>
              <span class="message-count">
                ${
                  this.messageHistory.filter((m) => m.target === origin).length
                } 메시지
              </span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="inspector-recent">
        <h4>⏰ 최근 메시지 (최대 10개)</h4>
        <div class="recent-messages">
          ${this.messageHistory
            .slice(0, 10)
            .map(
              (msg) => `
            <div class="recent-message">
              <div class="message-meta">
                <span class="direction ${msg.direction}">${msg.direction}</span>
                <span class="target">${msg.target}</span>
                <span class="time">${msg.timestamp.toLocaleString()}</span>
              </div>
              <div class="message-preview">
                ${JSON.stringify(msg.data).substring(0, 100)}...
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  // 네트워크 분석
  analyzeNetwork() {
    const output = document.getElementById("devToolsOutput");

    const analysis = {
      activeConnections:
        this.iframes.size +
        Array.from(this.popups.values()).filter((p) => !p.closed).length,
      messageRate:
        (this.messageHistory.length /
          (Date.now() - (this.startTime || Date.now()))) *
        60000, // 분당 메시지
      averageMessageSize:
        this.messageHistory.reduce(
          (sum, msg) => sum + JSON.stringify(msg.data).length,
          0
        ) / Math.max(this.messageHistory.length, 1),
      errorRate:
        (this.messageHistory.filter((msg) => msg.data.type === "error").length /
          Math.max(this.messageHistory.length, 1)) *
        100,
    };

    output.innerHTML = `
      <div class="analysis-result">
        <h3>🔍 네트워크 분석 결과</h3>
        <div class="analysis-grid">
          <div class="analysis-item">
            <span class="label">활성 연결:</span>
            <span class="value">${analysis.activeConnections}개</span>
          </div>
          <div class="analysis-item">
            <span class="label">메시지 전송률:</span>
            <span class="value">${analysis.messageRate.toFixed(
              2
            )} msg/min</span>
          </div>
          <div class="analysis-item">
            <span class="label">평균 메시지 크기:</span>
            <span class="value">${analysis.averageMessageSize.toFixed(
              0
            )} bytes</span>
          </div>
          <div class="analysis-item">
            <span class="label">오류율:</span>
            <span class="value">${analysis.errorRate.toFixed(1)}%</span>
          </div>
        </div>
        <div class="recommendations">
          <h4>📋 권장사항:</h4>
          <ul>
            ${
              analysis.messageRate > 100
                ? "<li>⚠️ 높은 메시지 전송률 - 성능 최적화 필요</li>"
                : ""
            }
            ${
              analysis.averageMessageSize > 1000
                ? "<li>⚠️ 큰 메시지 크기 - 데이터 압축 고려</li>"
                : ""
            }
            ${
              analysis.errorRate > 5
                ? "<li>🚨 높은 오류율 - 오류 처리 개선 필요</li>"
                : ""
            }
            ${
              analysis.activeConnections === 0
                ? "<li>💡 연결을 생성하여 테스트해보세요</li>"
                : ""
            }
          </ul>
        </div>
      </div>
    `;
  }

  // 보안 검사
  checkSecurity() {
    const output = document.getElementById("devToolsOutput");

    const securityChecks = {
      originValidation: this.settings.validateOrigin,
      encryption: this.settings.enableEncryption,
      allowsWildcard: this.allowedOrigins.has("*"),
      httpsOnly: Array.from(this.allowedOrigins).every(
        (origin) =>
          origin === "*" ||
          origin.startsWith("https://") ||
          origin.startsWith("http://localhost")
      ),
      messageLogging: this.settings.logMessages,
    };

    const securityScore =
      (Object.values(securityChecks).filter(Boolean).length /
        Object.keys(securityChecks).length) *
      100;

    output.innerHTML = `
      <div class="security-result">
        <h3>🛡️ 보안 검사 결과</h3>
        <div class="security-score">
          <span class="score-label">보안 점수:</span>
          <span class="score-value ${
            securityScore >= 80
              ? "good"
              : securityScore >= 60
              ? "medium"
              : "poor"
          }">
            ${securityScore.toFixed(0)}/100
          </span>
        </div>
        <div class="security-checks">
          <div class="check-item ${
            securityChecks.originValidation ? "pass" : "fail"
          }">
            <span class="check-icon">${
              securityChecks.originValidation ? "✅" : "❌"
            }</span>
            <span class="check-text">Origin 검증</span>
          </div>
          <div class="check-item ${
            securityChecks.encryption ? "pass" : "fail"
          }">
            <span class="check-icon">${
              securityChecks.encryption ? "✅" : "❌"
            }</span>
            <span class="check-text">메시지 암호화</span>
          </div>
          <div class="check-item ${
            !securityChecks.allowsWildcard ? "pass" : "fail"
          }">
            <span class="check-icon">${
              !securityChecks.allowsWildcard ? "✅" : "⚠️"
            }</span>
            <span class="check-text">와일드카드 제한</span>
          </div>
          <div class="check-item ${securityChecks.httpsOnly ? "pass" : "fail"}">
            <span class="check-icon">${
              securityChecks.httpsOnly ? "✅" : "⚠️"
            }</span>
            <span class="check-text">HTTPS 전용</span>
          </div>
          <div class="check-item ${
            !securityChecks.messageLogging ? "pass" : "warning"
          }">
            <span class="check-icon">${
              !securityChecks.messageLogging ? "✅" : "⚠️"
            }</span>
            <span class="check-text">메시지 로깅 비활성화</span>
          </div>
        </div>
        <div class="security-recommendations">
          <h4>🔧 보안 권장사항:</h4>
          <ul>
            ${
              !securityChecks.originValidation
                ? "<li>Origin 검증을 활성화하세요</li>"
                : ""
            }
            ${
              !securityChecks.encryption
                ? "<li>민감한 데이터 전송 시 암호화를 사용하세요</li>"
                : ""
            }
            ${
              securityChecks.allowsWildcard
                ? "<li>와일드카드(*) 대신 구체적인 Origin을 지정하세요</li>"
                : ""
            }
            ${
              !securityChecks.httpsOnly
                ? "<li>HTTPS를 사용하는 Origin만 허용하세요</li>"
                : ""
            }
            ${
              securityChecks.messageLogging
                ? "<li>프로덕션에서는 메시지 로깅을 비활성화하세요</li>"
                : ""
            }
          </ul>
        </div>
      </div>
    `;
  }

  // 성능 모니터
  monitorPerformance() {
    const output = document.getElementById("devToolsOutput");

    const performance = {
      memoryUsage: performance.memory
        ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
        : "N/A",
      messageLatency: this.calculateAverageLatency(),
      connectionHealth: this.checkConnectionHealth(),
      resourceUsage: this.calculateResourceUsage(),
    };

    output.innerHTML = `
      <div class="performance-result">
        <h3>⚡ 성능 모니터링</h3>
        <div class="performance-grid">
          <div class="perf-item">
            <span class="perf-label">메모리 사용량:</span>
            <span class="perf-value">${performance.memoryUsage} MB</span>
          </div>
          <div class="perf-item">
            <span class="perf-label">평균 지연시간:</span>
            <span class="perf-value">${performance.messageLatency} ms</span>
          </div>
          <div class="perf-item">
            <span class="perf-label">연결 상태:</span>
            <span class="perf-value ${
              performance.connectionHealth >= 80 ? "good" : "poor"
            }">
              ${performance.connectionHealth}%
            </span>
          </div>
          <div class="perf-item">
            <span class="perf-label">리소스 사용률:</span>
            <span class="perf-value">${performance.resourceUsage}%</span>
          </div>
        </div>
        <div class="performance-chart">
          <h4>📈 실시간 성능 그래프</h4>
          <div class="chart-placeholder">
            [실시간 성능 데이터 차트가 여기에 표시됩니다]
          </div>
        </div>
      </div>
    `;
  }

  // 평균 지연시간 계산
  calculateAverageLatency() {
    const recentMessages = this.messageHistory.slice(0, 10);
    if (recentMessages.length === 0) return 0;

    const latencies = recentMessages
      .filter((msg) => msg.data.timestamp)
      .map((msg) => Date.now() - msg.data.timestamp);

    return latencies.length > 0
      ? (
          latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
        ).toFixed(0)
      : 0;
  }

  // 연결 상태 확인
  checkConnectionHealth() {
    const totalConnections = this.iframes.size + this.popups.size;
    const activeConnections =
      this.iframes.size +
      Array.from(this.popups.values()).filter((p) => !p.closed).length;

    return totalConnections > 0
      ? ((activeConnections / totalConnections) * 100).toFixed(0)
      : 100;
  }

  // 리소스 사용률 계산
  calculateResourceUsage() {
    const messageCount = this.messageHistory.length;
    const maxMessages = this.settings.maxHistorySize;
    return ((messageCount / maxMessages) * 100).toFixed(0);
  }

  // 실제 예제 로드 메서드들
  loadGameExample() {
    this.showNotification("🎮 게임 임베드 예제를 로드합니다...", "info");
    // 게임 예제 구현
  }

  loadPaymentExample() {
    this.showNotification("💳 결제 시스템 예제를 로드합니다...", "info");
    // 결제 예제 구현
  }

  loadWidgetExample() {
    this.showNotification("📊 위젯 통신 예제를 로드합니다...", "info");
    // 위젯 예제 구현
  }

  loadOAuthExample() {
    this.showNotification("🔐 OAuth 인증 예제를 로드합니다...", "info");
    // OAuth 예제 구현
  }

  // 키보드 이벤트 핸들러
  handleKeyboard(event) {
    const ctrl = event.ctrlKey || event.metaKey;

    if (ctrl) {
      switch (event.key) {
        case "1":
          event.preventDefault();
          this.switchTab("iframe");
          break;
        case "2":
          event.preventDefault();
          this.switchTab("popup");
          break;
        case "3":
          event.preventDefault();
          this.switchTab("cors");
          break;
        case "4":
          event.preventDefault();
          this.switchTab("messaging");
          break;
        case "5":
          event.preventDefault();
          this.switchTab("security");
          break;
      }
    }

    if (event.key === "Escape") {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("hidden");
      });
    }
  }

  // 설정 저장
  saveSettings() {
    this.settings = {
      enableEncryption: document.getElementById("enableEncryption").checked,
      validateOrigin: document.getElementById("validateOrigin").checked,
      logMessages: document.getElementById("logMessages").checked,
      autoReconnect: document.getElementById("autoReconnect").checked,
      messageTimeout: parseInt(document.getElementById("messageTimeout").value),
      maxHistorySize: parseInt(document.getElementById("maxHistorySize").value),
      filterExtensions: document.getElementById("filterExtensions").checked,
    };

    localStorage.setItem(
      "cross-origin-settings",
      JSON.stringify(this.settings)
    );
  }

  // 설정 로드
  loadSettings() {
    const saved = localStorage.getItem("cross-origin-settings");
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }

    // UI 업데이트
    document.getElementById("enableEncryption").checked =
      this.settings.enableEncryption;
    document.getElementById("validateOrigin").checked =
      this.settings.validateOrigin;
    document.getElementById("logMessages").checked = this.settings.logMessages;
    document.getElementById("autoReconnect").checked =
      this.settings.autoReconnect;
    document.getElementById("filterExtensions").checked =
      this.settings.filterExtensions;
    document.getElementById("messageTimeout").value =
      this.settings.messageTimeout;
    document.getElementById("timeoutValue").textContent =
      this.settings.messageTimeout;
    document.getElementById("maxHistorySize").value =
      this.settings.maxHistorySize;
    document.getElementById("historyValue").textContent =
      this.settings.maxHistorySize;

    // Origin 목록 업데이트
    this.updateOriginList();
  }

  // 정리
  cleanup() {
    // 모든 팝업 닫기
    this.closeAllPopups();

    // 모든 iFrame 제거
    this.removeIframe();
  }

  // 알림 표시
  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    const icon =
      {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌",
      }[type] || "ℹ️";

    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    `;

    // 닫기 버튼 이벤트
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    notifications.appendChild(notification);

    // 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  new CrossOriginCommunicationAPI();
});
