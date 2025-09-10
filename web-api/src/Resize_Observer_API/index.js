import "./style.css";

class ResizeObserverAPI {
  constructor() {
    this.observer = null;
    this.observedElement = null;
    this.changeCount = 0;
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.checkSupport();
    this.createDemoElement();
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = `
      <div class="resize-container">
        <header class="resize-header">
          <h1>📏 Resize Observer API 데모</h1>
          <p>요소의 크기 변화를 실시간으로 감지해보세요</p>
          <div class="support-status" id="supportStatus">
            <div class="status-item">
              <span class="status-indicator" id="resizeObserverStatus">⏳</span>
              <span>Resize Observer API</span>
            </div>
          </div>
        </header>

        <main class="resize-main">
          <div class="demo-section">
            <div class="demo-controls">
              <h2>🔧 크기 변화 관찰</h2>
              <div class="control-buttons">
                <button id="startObserving" class="btn-primary">👁️ 관찰 시작</button>
                <button id="stopObserving" class="btn-secondary">⏹️ 관찰 중지</button>
                <button id="resetDemo" class="btn-accent">🔄 리셋</button>
              </div>
            </div>

            <div class="demo-area">
              <div class="demo-box-container">
                <div class="resize-demo-box" id="demoBox">
                  <div class="box-content">
                    <h3>🎯 Resize Me!</h3>
                    <p>오른쪽 하단 핸들을 드래그하여 크기를 변경하세요</p>
                    <div class="resize-handles">
                      <div class="resize-handle bottom-right"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="size-info">
                <h3>📊 실시간 크기 정보</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>넓이:</label>
                    <span id="currentWidth">300px</span>
                  </div>
                  <div class="info-item">
                    <label>높이:</label>
                    <span id="currentHeight">200px</span>
                  </div>
                  <div class="info-item">
                    <label>비율:</label>
                    <span id="aspectRatio">1.50:1</span>
                  </div>
                  <div class="info-item">
                    <label>변화 횟수:</label>
                    <span id="changeCount">0</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="resize-log">
              <div class="log-header">
                <h3>📋 크기 변화 로그</h3>
                <div class="log-controls">
                  <button id="clearLog" class="btn-small">🧹 로그 지우기</button>
                  <button id="exportLog" class="btn-small">📤 로그 내보내기</button>
                  <label>
                    <input type="checkbox" id="autoScroll" checked>
                    자동 스크롤
                  </label>
                </div>
              </div>
              <div id="resizeLog" class="log-display">
                <div class="log-entry initial">
                  <span class="log-time">${new Date().toLocaleTimeString()}</span>
                  <span class="log-action">시작</span>
                  <span class="log-element">demo-box</span>
                  <span class="log-data">준비 완료</span>
                </div>
              </div>
            </div>
          </div>

          <div class="usage-section">
            <h2>💡 사용법 및 예제</h2>
            <div class="usage-content">
              <div class="code-example">
                <h3>🔍 기본 사용법</h3>
                <pre><code>// Resize Observer 생성
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const { width, height } = entry.contentRect;
    console.log('크기 변화:', width + 'x' + height);
  });
});

// 요소 관찰 시작
observer.observe(element);

// 관찰 중지
observer.disconnect();</code></pre>
              </div>

              <div class="features-list">
                <h3>✨ 주요 기능</h3>
                <ul>
                  <li><strong>실시간 크기 감지:</strong> 요소 크기가 변할 때마다 즉시 콜백 실행</li>
                  <li><strong>정확한 측정:</strong> contentRect를 통한 정확한 콘텐츠 영역 크기</li>
                  <li><strong>성능 최적화:</strong> requestAnimationFrame 기반으로 최적화됨</li>
                  <li><strong>브라우저 지원:</strong> 모든 모던 브라우저에서 지원</li>
                </ul>
              </div>

              <div class="use-cases">
                <h3>🎯 활용 사례</h3>
                <ul>
                  <li><strong>반응형 컴포넌트:</strong> 컨테이너 크기에 따라 레이아웃 변경</li>
                  <li><strong>차트 라이브러리:</strong> 차트 크기를 컨테이너에 맞게 조절</li>
                  <li><strong>가상 스크롤:</strong> 스크롤 컨테이너 크기 변화 감지</li>
                  <li><strong>텍스트 에디터:</strong> 에디터 크기에 따른 툴바 조절</li>
                  <li><strong>미디어 쿼리 대체:</strong> JavaScript 기반 반응형 로직</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>
      </div>
    `;
  }

  setupEventListeners() {
    // 기본 컨트롤 이벤트
    document
      .getElementById("startObserving")
      .addEventListener("click", () => this.startObserving());
    document
      .getElementById("stopObserving")
      .addEventListener("click", () => this.stopObserving());
    document
      .getElementById("resetDemo")
      .addEventListener("click", () => this.resetDemo());

    // 로그 관련 이벤트
    document
      .getElementById("clearLog")
      .addEventListener("click", () => this.clearLog());
    document
      .getElementById("exportLog")
      .addEventListener("click", () => this.exportLog());
  }

  checkSupport() {
    const status = document.getElementById("resizeObserverStatus");

    if (typeof ResizeObserver !== "undefined") {
      status.textContent = "✅";
      status.className = "status-indicator success";
      this.showNotification("Resize Observer API가 지원됩니다!", "success");
    } else {
      status.textContent = "❌";
      status.className = "status-indicator error";
      this.showNotification("Resize Observer API가 지원되지 않습니다", "error");
    }
  }

  createDemoElement() {
    const demoBox = document.getElementById("demoBox");
    this.makeDraggable(demoBox);

    // 초기 크기 표시
    this.updateSizeInfo(300, 200);
  }

  startObserving() {
    const element = document.getElementById("demoBox");

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new ResizeObserver((entries) => {
      this.handleResize(entries);
    });

    this.observer.observe(element);
    this.observedElement = element;

    this.showNotification("크기 변화 관찰을 시작했습니다", "success");
    this.logResize("관찰 시작", element);
  }

  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.observedElement = null;
      this.showNotification("크기 변화 관찰을 중지했습니다", "info");
      this.logResize("관찰 중지", null);
    }
  }

  resetDemo() {
    this.stopObserving();

    const demoBox = document.getElementById("demoBox");
    demoBox.style.width = "300px";
    demoBox.style.height = "200px";

    this.changeCount = 0;
    this.updateSizeInfo(300, 200);
    this.clearLog();

    this.showNotification("데모가 초기화되었습니다", "info");
  }

  handleResize(entries) {
    entries.forEach((entry) => {
      const { width, height } = entry.contentRect;
      this.changeCount++;

      this.updateSizeInfo(width, height);
      this.logResize("크기 변화", entry.target, { width, height });
    });
  }

  updateSizeInfo(width, height) {
    const aspectRatio = (width / height).toFixed(2);

    document.getElementById("currentWidth").textContent =
      width.toFixed(1) + "px";
    document.getElementById("currentHeight").textContent =
      height.toFixed(1) + "px";
    document.getElementById("aspectRatio").textContent = aspectRatio + ":1";
    document.getElementById("changeCount").textContent = this.changeCount;
  }

  logResize(action, element, data = {}) {
    const log = document.getElementById("resizeLog");
    const timestamp = new Date().toLocaleTimeString();

    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";

    let elementInfo = "";
    if (element) {
      elementInfo =
        element.tagName.toLowerCase() + (element.id ? "#" + element.id : "");
    }

    const dataString =
      Object.keys(data).length > 0 ? JSON.stringify(data) : "-";

    logEntry.innerHTML =
      '<span class="log-time">' +
      timestamp +
      "</span>" +
      '<span class="log-action">' +
      action +
      "</span>" +
      '<span class="log-element">' +
      elementInfo +
      "</span>" +
      '<span class="log-data">' +
      dataString +
      "</span>";

    log.appendChild(logEntry);

    // 자동 스크롤
    if (document.getElementById("autoScroll").checked) {
      log.scrollTop = log.scrollHeight;
    }

    // 로그 항목이 너무 많으면 오래된 것 제거
    const entries = log.querySelectorAll(".log-entry");
    if (entries.length > 100) {
      entries[0].remove();
    }
  }

  clearLog() {
    const log = document.getElementById("resizeLog");
    const timestamp = new Date().toLocaleTimeString();

    log.innerHTML =
      '<div class="log-entry initial">' +
      '<span class="log-time">' +
      timestamp +
      "</span>" +
      '<span class="log-action">로그 지움</span>' +
      '<span class="log-element">-</span>' +
      '<span class="log-data">준비 완료</span>' +
      "</div>";

    this.changeCount = 0;
    document.getElementById("changeCount").textContent = "0";
    this.showNotification("로그가 지워졌습니다", "info");
  }

  exportLog() {
    const log = document.getElementById("resizeLog");
    const entries = Array.from(log.children).map((entry) => entry.textContent);
    const logData =
      "Resize Observer Log - " +
      new Date().toLocaleString() +
      "\n\n" +
      entries.join("\n");

    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resize-observer-log-" + Date.now() + ".txt";
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification("로그가 내보내졌습니다", "success");
  }

  makeDraggable(element) {
    let isResizing = false;
    const handle = element.querySelector(".resize-handle");

    if (handle) {
      handle.addEventListener("mousedown", (e) => {
        isResizing = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(window.getComputedStyle(element).width);
        const startHeight = parseInt(window.getComputedStyle(element).height);

        const handleMouseMove = (e) => {
          if (!isResizing) return;

          const newWidth = startWidth + (e.clientX - startX);
          const newHeight = startHeight + (e.clientY - startY);

          element.style.width = Math.max(200, Math.min(800, newWidth)) + "px";
          element.style.height = Math.max(150, Math.min(600, newHeight)) + "px";
        };

        const handleMouseUp = () => {
          isResizing = false;
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      });
    }
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    const notification = document.createElement("div");
    notification.className = "notification notification-" + type;

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };
    const icon = icons[type] || "ℹ️";

    notification.innerHTML =
      '<span class="notification-icon">' +
      icon +
      "</span>" +
      '<span class="notification-message">' +
      message +
      "</span>" +
      '<span class="notification-close">&times;</span>';

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    notifications.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new ResizeObserverAPI();
});
