import "./style.css";

/**
 * Full Screen API 데모 클래스
 * 전체화면 진입/종료, 상태 감지, 키보드 단축키, 요소별 전체화면 등을 구현
 */
class FullScreenAPI {
  constructor() {
    this.isFullScreen = false;
    this.currentFullScreenElement = null;
    this.fullScreenHistory = [];
    this.settings = {
      autoHideControls: true,
      exitOnEscape: true,
      showNotifications: true,
      enableKeyboardShortcuts: true,
      animationDuration: 300,
    };

    this.init();
  }

  init() {
    this.createHTML();
    this.setupEventListeners();
    this.loadSettings();
    this.updateUI();
    this.startStatusMonitoring();
    console.log("🖥️ Full Screen API initialized!");
  }

  createHTML() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="fullscreen-container">
        <!-- 헤더 -->
        <header class="header">
          <h1>🖥️ Full Screen API</h1>
          <p>전체화면 제어, 요소별 전체화면, 키보드 단축키 지원</p>
        </header>

        <!-- 상태 표시 -->
        <div class="status-panel">
          <div class="status-item">
            <span class="status-label">현재 상태:</span>
            <span id="currentStatus" class="status-value">일반 모드</span>
          </div>
          <div class="status-item">
            <span class="status-label">지원 여부:</span>
            <span id="supportStatus" class="status-value">확인 중...</span>
          </div>
          <div class="status-item">
            <span class="status-label">활성 요소:</span>
            <span id="activeElement" class="status-value">없음</span>
          </div>
        </div>

        <!-- 메인 컨트롤 -->
        <div class="main-controls">
          <button id="toggleFullScreen" class="btn btn-primary">
            🖥️ 전체화면 전환
          </button>
          <button id="exitFullScreen" class="btn btn-secondary" disabled>
            ↩️ 전체화면 종료
          </button>
        </div>

        <!-- 요소별 전체화면 -->
        <div class="element-fullscreen">
          <h2>📱 요소별 전체화면</h2>
          <div class="demo-elements">
            <!-- 이미지 전체화면 -->
            <div class="demo-card">
              <h3>🖼️ 이미지 전체화면</h3>
              <div class="image-container">
                <img id="demoImage" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmY2YjZiIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzRlY2RjNCIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNDVkMTcyIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudCkiIC8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7stZzrqbTsnbTsp4A8L3RleHQ+Cjwvc3ZnPgo=" alt="데모 이미지" />
              </div>
              <button id="imageFullScreen" class="btn btn-accent">
                🔍 이미지 전체화면
              </button>
            </div>

            <!-- 비디오 전체화면 -->
            <div class="demo-card">
              <h3>🎥 비디오 전체화면</h3>
              <div class="video-container">
                <video id="demoVideo" controls muted>
                  <source src="data:video/mp4;base64," type="video/mp4">
                  <!-- 실제 프로젝트에서는 실제 비디오 파일을 사용하세요 -->
                </video>
                <div class="video-placeholder">
                  <div class="play-icon">▶️</div>
                  <p>데모 비디오 영역</p>
                </div>
              </div>
              <button id="videoFullScreen" class="btn btn-accent">
                📺 비디오 전체화면
              </button>
            </div>

            <!-- 커스텀 콘텐츠 전체화면 -->
            <div class="demo-card">
              <h3>🎨 커스텀 콘텐츠</h3>
              <div id="customContent" class="custom-content">
                <div class="content-header">
                  <h4>🌟 멋진 콘텐츠</h4>
                </div>
                <div class="content-body">
                  <div class="color-box" style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4);"></div>
                  <div class="color-box" style="background: linear-gradient(45deg, #45b7d1, #96ceb4);"></div>
                  <div class="color-box" style="background: linear-gradient(45deg, #f093fb, #f5576c);"></div>
                  <div class="color-box" style="background: linear-gradient(45deg, #4facfe, #00f2fe);"></div>
                </div>
                <div class="content-footer">
                  <p>전체화면에서 더 생생하게 보세요!</p>
                </div>
              </div>
              <button id="customFullScreen" class="btn btn-accent">
                🎨 콘텐츠 전체화면
              </button>
            </div>
          </div>
        </div>

        <!-- 미니 게임 -->
        <div class="mini-game">
          <h2>🎮 전체화면 미니 게임</h2>
          <div id="gameArea" class="game-area">
            <div class="game-info">
              <div class="score">점수: <span id="score">0</span></div>
              <div class="time">시간: <span id="timeLeft">30</span>초</div>
            </div>
            <div class="game-board" id="gameBoard">
              <div class="target" id="target">🎯</div>
            </div>
            <div class="game-controls">
              <button id="startGame" class="btn btn-game">🎮 게임 시작</button>
              <button id="gameFullScreen" class="btn btn-accent">🖥️ 전체화면 게임</button>
            </div>
          </div>
        </div>

        <!-- 키보드 단축키 안내 -->
        <div class="keyboard-shortcuts">
          <h2>⌨️ 키보드 단축키</h2>
          <div class="shortcuts-grid">
            <div class="shortcut-item">
              <kbd>F11</kbd>
              <span>전체화면 전환</span>
            </div>
            <div class="shortcut-item">
              <kbd>Esc</kbd>
              <span>전체화면 종료</span>
            </div>
            <div class="shortcut-item">
              <kbd>F</kbd>
              <span>페이지 전체화면</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl + F</kbd>
              <span>현재 요소 전체화면</span>
            </div>
          </div>
        </div>

        <!-- 설정 패널 -->
        <div class="settings-panel">
          <h2>⚙️ 전체화면 설정</h2>
          <div class="settings-grid">
            <label class="setting-item">
              <input type="checkbox" id="autoHideControls" checked>
              <span>전체화면에서 컨트롤 자동 숨김</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="exitOnEscape" checked>
              <span>ESC 키로 종료 허용</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="showNotifications" checked>
              <span>상태 변경 알림 표시</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="enableKeyboardShortcuts" checked>
              <span>키보드 단축키 활성화</span>
            </label>
          </div>
          <div class="setting-item">
            <label for="animationDuration">애니메이션 속도: <span id="animationValue">300</span>ms</label>
            <input type="range" id="animationDuration" min="0" max="1000" value="300" step="50">
          </div>
        </div>

        <!-- 전체화면 히스토리 -->
        <div class="history-panel">
          <h2>📋 전체화면 히스토리</h2>
          <div id="historyList" class="history-list">
            <p class="no-history">아직 전체화면 기록이 없습니다.</p>
          </div>
          <button id="clearHistory" class="btn btn-secondary">🗑️ 히스토리 삭제</button>
        </div>

        <!-- 브라우저 정보 -->
        <div class="browser-info">
          <h2>🌐 브라우저 정보</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Screen API:</span>
              <span id="fullscreenSupport" class="info-value">확인 중...</span>
            </div>
            <div class="info-item">
              <span class="info-label">키보드 접근:</span>
              <span id="keyboardSupport" class="info-value">확인 중...</span>
            </div>
            <div class="info-item">
              <span class="info-label">현재 해상도:</span>
              <span id="screenResolution" class="info-value">-</span>
            </div>
            <div class="info-item">
              <span class="info-label">뷰포트 크기:</span>
              <span id="viewportSize" class="info-value">-</span>
            </div>
          </div>
        </div>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>

        <!-- 전체화면 오버레이 -->
        <div id="fullscreenOverlay" class="fullscreen-overlay hidden">
          <div class="overlay-controls">
            <div class="overlay-info">
              <h3>🖥️ 전체화면 모드</h3>
              <p>ESC 키를 눌러 종료하거나 아래 버튼을 클릭하세요</p>
            </div>
            <button id="overlayExit" class="btn btn-overlay">❌ 종료</button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // 전체화면 상태 변경 이벤트
    document.addEventListener("fullscreenchange", () =>
      this.handleFullScreenChange()
    );
    document.addEventListener("webkitfullscreenchange", () =>
      this.handleFullScreenChange()
    );
    document.addEventListener("mozfullscreenchange", () =>
      this.handleFullScreenChange()
    );
    document.addEventListener("MSFullscreenChange", () =>
      this.handleFullScreenChange()
    );

    // 전체화면 오류 이벤트
    document.addEventListener("fullscreenerror", (e) =>
      this.handleFullScreenError(e)
    );
    document.addEventListener("webkitfullscreenerror", (e) =>
      this.handleFullScreenError(e)
    );
    document.addEventListener("mozfullscreenerror", (e) =>
      this.handleFullScreenError(e)
    );
    document.addEventListener("MSFullscreenError", (e) =>
      this.handleFullScreenError(e)
    );

    // 메인 컨트롤
    document
      .getElementById("toggleFullScreen")
      .addEventListener("click", () => this.toggleFullScreen());
    document
      .getElementById("exitFullScreen")
      .addEventListener("click", () => this.exitFullScreen());

    // 요소별 전체화면
    document
      .getElementById("imageFullScreen")
      .addEventListener("click", () =>
        this.requestElementFullScreen("demoImage")
      );
    document
      .getElementById("videoFullScreen")
      .addEventListener("click", () =>
        this.requestElementFullScreen("demoVideo")
      );
    document
      .getElementById("customFullScreen")
      .addEventListener("click", () =>
        this.requestElementFullScreen("customContent")
      );

    // 게임 관련
    document
      .getElementById("startGame")
      .addEventListener("click", () => this.startGame());
    document
      .getElementById("gameFullScreen")
      .addEventListener("click", () =>
        this.requestElementFullScreen("gameArea")
      );
    document
      .getElementById("target")
      .addEventListener("click", () => this.hitTarget());

    // 설정 관련
    document
      .getElementById("autoHideControls")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("exitOnEscape")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("showNotifications")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("enableKeyboardShortcuts")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("animationDuration")
      .addEventListener("input", (e) => {
        document.getElementById("animationValue").textContent = e.target.value;
        this.saveSettings();
      });

    // 히스토리 관련
    document
      .getElementById("clearHistory")
      .addEventListener("click", () => this.clearHistory());

    // 오버레이 관련
    document
      .getElementById("overlayExit")
      .addEventListener("click", () => this.exitFullScreen());

    // 키보드 이벤트
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // 윈도우 리사이즈
    window.addEventListener("resize", () => this.updateBrowserInfo());
  }

  // 전체화면 지원 여부 확인
  isFullScreenSupported() {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }

  // 현재 전체화면 요소 가져오기
  getFullScreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  // 전체화면 요청
  async requestFullScreen(element = document.documentElement) {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        throw new Error("Full Screen API not supported");
      }
    } catch (error) {
      this.showNotification(`전체화면 요청 실패: ${error.message}`, "error");
      console.error("Full screen request failed:", error);
    }
  }

  // 전체화면 종료
  async exitFullScreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      this.showNotification(`전체화면 종료 실패: ${error.message}`, "error");
      console.error("Exit full screen failed:", error);
    }
  }

  // 전체화면 토글
  async toggleFullScreen() {
    if (this.getFullScreenElement()) {
      await this.exitFullScreen();
    } else {
      await this.requestFullScreen();
    }
  }

  // 특정 요소 전체화면
  async requestElementFullScreen(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      this.showNotification("요소를 찾을 수 없습니다.", "error");
      return;
    }

    await this.requestFullScreen(element);
  }

  // 전체화면 상태 변경 핸들러
  handleFullScreenChange() {
    const fullScreenElement = this.getFullScreenElement();
    this.isFullScreen = !!fullScreenElement;
    this.currentFullScreenElement = fullScreenElement;

    // 히스토리 추가
    this.addToHistory(
      this.isFullScreen ? "진입" : "종료",
      fullScreenElement?.id || "document"
    );

    // UI 업데이트
    this.updateUI();

    // 알림 표시
    if (this.settings.showNotifications) {
      const message = this.isFullScreen
        ? `전체화면 모드 진입${
            fullScreenElement?.id ? ` (${fullScreenElement.id})` : ""
          }`
        : "전체화면 모드 종료";
      this.showNotification(message, "info");
    }

    // 오버레이 표시/숨김
    this.updateOverlay();
  }

  // 전체화면 오류 핸들러
  handleFullScreenError(event) {
    console.error("Full screen error:", event);
    this.showNotification("전체화면 오류가 발생했습니다.", "error");
  }

  // 키보드 이벤트 핸들러
  handleKeyboard(event) {
    if (!this.settings.enableKeyboardShortcuts) return;

    switch (event.code) {
      case "F11":
        event.preventDefault();
        this.toggleFullScreen();
        break;
      case "Escape":
        if (this.isFullScreen && this.settings.exitOnEscape) {
          this.exitFullScreen();
        }
        break;
      case "KeyF":
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.toggleFullScreen();
        }
        break;
      case "KeyF":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          // 현재 포커스된 요소가 있으면 해당 요소를, 없으면 body를 전체화면으로
          const focusedElement = document.activeElement;
          if (focusedElement && focusedElement !== document.body) {
            this.requestFullScreen(focusedElement);
          } else {
            this.requestFullScreen();
          }
        }
        break;
    }
  }

  // UI 업데이트
  updateUI() {
    // 상태 업데이트
    const statusElement = document.getElementById("currentStatus");
    const activeElement = document.getElementById("activeElement");

    if (this.isFullScreen) {
      statusElement.textContent = "전체화면 모드";
      statusElement.className = "status-value status-active";
      activeElement.textContent =
        this.currentFullScreenElement?.id || "document";
    } else {
      statusElement.textContent = "일반 모드";
      statusElement.className = "status-value";
      activeElement.textContent = "없음";
    }

    // 버튼 상태 업데이트
    const toggleBtn = document.getElementById("toggleFullScreen");
    const exitBtn = document.getElementById("exitFullScreen");

    if (this.isFullScreen) {
      toggleBtn.textContent = "🔙 일반 모드로";
      exitBtn.disabled = false;
    } else {
      toggleBtn.textContent = "🖥️ 전체화면 전환";
      exitBtn.disabled = true;
    }

    // 브라우저 정보 업데이트
    this.updateBrowserInfo();
  }

  // 브라우저 정보 업데이트
  updateBrowserInfo() {
    // 지원 여부
    document.getElementById("fullscreenSupport").textContent =
      this.isFullScreenSupported() ? "✅ 지원" : "❌ 미지원";

    document.getElementById("keyboardSupport").textContent =
      document.fullscreenEnabled ? "✅ 허용" : "⚠️ 제한";

    // 해상도 정보
    document.getElementById(
      "screenResolution"
    ).textContent = `${screen.width} × ${screen.height}`;

    document.getElementById(
      "viewportSize"
    ).textContent = `${window.innerWidth} × ${window.innerHeight}`;

    // 지원 상태
    const supportStatus = document.getElementById("supportStatus");
    if (this.isFullScreenSupported()) {
      supportStatus.textContent = "✅ 완전 지원";
      supportStatus.className = "status-value status-supported";
    } else {
      supportStatus.textContent = "❌ 미지원";
      supportStatus.className = "status-value status-unsupported";
    }
  }

  // 상태 모니터링 시작
  startStatusMonitoring() {
    setInterval(() => {
      this.updateBrowserInfo();
    }, 1000);
  }

  // 오버레이 업데이트
  updateOverlay() {
    const overlay = document.getElementById("fullscreenOverlay");

    if (this.isFullScreen && this.settings.autoHideControls) {
      overlay.classList.remove("hidden");

      // 자동 숨김 타이머
      if (this.overlayTimer) {
        clearTimeout(this.overlayTimer);
      }

      this.overlayTimer = setTimeout(() => {
        overlay.classList.add("auto-hide");
      }, 3000);

      // 마우스 움직임 시 다시 표시
      document.addEventListener(
        "mousemove",
        () => {
          overlay.classList.remove("auto-hide");
          clearTimeout(this.overlayTimer);
          this.overlayTimer = setTimeout(() => {
            overlay.classList.add("auto-hide");
          }, 3000);
        },
        { once: true }
      );
    } else {
      overlay.classList.add("hidden");
    }
  }

  // 히스토리에 추가
  addToHistory(action, element) {
    const timestamp = new Date().toLocaleString();
    this.fullScreenHistory.unshift({
      action,
      element,
      timestamp,
    });

    // 최대 10개까지만 유지
    if (this.fullScreenHistory.length > 10) {
      this.fullScreenHistory = this.fullScreenHistory.slice(0, 10);
    }

    this.updateHistoryDisplay();
  }

  // 히스토리 표시 업데이트
  updateHistoryDisplay() {
    const historyList = document.getElementById("historyList");

    if (this.fullScreenHistory.length === 0) {
      historyList.innerHTML =
        '<p class="no-history">아직 전체화면 기록이 없습니다.</p>';
      return;
    }

    historyList.innerHTML = this.fullScreenHistory
      .map(
        (item) => `
      <div class="history-item">
        <div class="history-action ${
          item.action === "진입" ? "enter" : "exit"
        }">
          ${item.action === "진입" ? "📥" : "📤"} ${item.action}
        </div>
        <div class="history-element">${item.element}</div>
        <div class="history-time">${item.timestamp}</div>
      </div>
    `
      )
      .join("");
  }

  // 히스토리 삭제
  clearHistory() {
    this.fullScreenHistory = [];
    this.updateHistoryDisplay();
    this.showNotification("히스토리가 삭제되었습니다.", "info");
  }

  // 게임 시작
  startGame() {
    this.gameScore = 0;
    this.gameTimeLeft = 30;
    this.gameActive = true;

    document.getElementById("score").textContent = this.gameScore;
    document.getElementById("timeLeft").textContent = this.gameTimeLeft;
    document.getElementById("startGame").disabled = true;

    // 타겟 위치 랜덤 변경
    this.moveTarget();
    this.gameInterval = setInterval(() => this.moveTarget(), 1500);

    // 타이머
    this.gameTimer = setInterval(() => {
      this.gameTimeLeft--;
      document.getElementById("timeLeft").textContent = this.gameTimeLeft;

      if (this.gameTimeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    this.showNotification("게임이 시작되었습니다! 타겟을 클릭하세요!", "info");
  }

  // 타겟 이동
  moveTarget() {
    if (!this.gameActive) return;

    const gameBoard = document.getElementById("gameBoard");
    const target = document.getElementById("target");
    const boardRect = gameBoard.getBoundingClientRect();

    const maxX = boardRect.width - 50;
    const maxY = boardRect.height - 50;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
  }

  // 타겟 히트
  hitTarget() {
    if (!this.gameActive) return;

    this.gameScore += 10;
    document.getElementById("score").textContent = this.gameScore;

    // 즉시 다음 위치로 이동
    this.moveTarget();

    this.showNotification("+10점!", "success");
  }

  // 게임 종료
  endGame() {
    this.gameActive = false;
    clearInterval(this.gameInterval);
    clearInterval(this.gameTimer);

    document.getElementById("startGame").disabled = false;

    this.showNotification(`게임 종료! 최종 점수: ${this.gameScore}점`, "info");
  }

  // 설정 저장
  saveSettings() {
    this.settings = {
      autoHideControls: document.getElementById("autoHideControls").checked,
      exitOnEscape: document.getElementById("exitOnEscape").checked,
      showNotifications: document.getElementById("showNotifications").checked,
      enableKeyboardShortcuts: document.getElementById(
        "enableKeyboardShortcuts"
      ).checked,
      animationDuration: parseInt(
        document.getElementById("animationDuration").value
      ),
    };

    localStorage.setItem("fullscreen-settings", JSON.stringify(this.settings));

    // CSS 변수 업데이트
    document.documentElement.style.setProperty(
      "--animation-duration",
      `${this.settings.animationDuration}ms`
    );
  }

  // 설정 로드
  loadSettings() {
    const saved = localStorage.getItem("fullscreen-settings");
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }

    // UI 업데이트
    document.getElementById("autoHideControls").checked =
      this.settings.autoHideControls;
    document.getElementById("exitOnEscape").checked =
      this.settings.exitOnEscape;
    document.getElementById("showNotifications").checked =
      this.settings.showNotifications;
    document.getElementById("enableKeyboardShortcuts").checked =
      this.settings.enableKeyboardShortcuts;
    document.getElementById("animationDuration").value =
      this.settings.animationDuration;
    document.getElementById("animationValue").textContent =
      this.settings.animationDuration;

    // CSS 변수 적용
    document.documentElement.style.setProperty(
      "--animation-duration",
      `${this.settings.animationDuration}ms`
    );
  }

  // 알림 표시
  showNotification(message, type = "info") {
    if (!this.settings.showNotifications) return;

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
  new FullScreenAPI();
});
