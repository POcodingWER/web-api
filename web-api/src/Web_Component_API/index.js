import "./style.css";

console.log("🎨 Web Component API 스크립트 시작!");

// Custom Button Component
class CustomButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.setupComponent();
  }

  setupComponent() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          background: var(--button-bg, linear-gradient(45deg, #667eea, #764ba2));
          color: var(--button-color, white);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .icon {
          margin-right: 8px;
        }
      </style>
      <button>
        <span class="icon"></span>
        <span class="text"><slot>버튼</slot></span>
      </button>
    `;

    this.button = this.shadowRoot.querySelector("button");
    this.iconSpan = this.shadowRoot.querySelector(".icon");
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.button.addEventListener("click", (e) => {
      this.dispatchEvent(
        new CustomEvent("custom-click", {
          detail: { timestamp: Date.now(), element: this },
          bubbles: true,
        })
      );
    });
  }

  static get observedAttributes() {
    return ["disabled", "icon", "variant"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.button) return;

    switch (name) {
      case "disabled":
        this.button.disabled = newValue !== null;
        break;
      case "icon":
        this.iconSpan.textContent = newValue || "";
        this.iconSpan.style.display = newValue ? "inline" : "none";
        break;
      case "variant":
        this.updateVariant(newValue);
        break;
    }
  }

  updateVariant(variant) {
    const variants = {
      primary: "linear-gradient(45deg, #667eea, #764ba2)",
      success: "linear-gradient(45deg, #4caf50, #45a049)",
      warning: "linear-gradient(45deg, #ff9800, #f57c00)",
      danger: "linear-gradient(45deg, #f44336, #d32f2f)",
    };

    this.style.setProperty(
      "--button-bg",
      variants[variant] || variants.primary
    );
  }
}

// Shadow DOM 데모 컴포넌트
class ShadowDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.setupComponent();
  }

  setupComponent() {
    this.shadowRoot.innerHTML = `
      <style>
        .shadow-container {
          background: linear-gradient(45deg, #667eea, #764ba2);
          padding: 20px;
          border-radius: 10px;
          color: white;
          margin: 10px 0;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .shadow-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .shadow-content {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
        }
        
        .shadow-button {
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .shadow-button:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        .status {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          display: inline-block;
          margin: 5px 0;
        }
        
        /* 이 스타일들은 Shadow DOM 외부에 영향을 주지 않습니다! */
        p { 
          color: #ffeb3b !important; 
          font-size: 16px !important;
        }
        
        h3 { 
          color: #ff4081 !important; 
        }
      </style>
      
      <div class="shadow-container">
        <div class="shadow-title">🛡️ Shadow DOM 내부</div>
        <div class="status">✅ 스타일 격리됨</div>
        
        <div class="shadow-content">
          <h3>이 제목은 분홍색입니다</h3>
          <p>이 텍스트는 노란색입니다</p>
          <p>외부 CSS가 이 영역에 영향을 주지 못합니다!</p>
          
          <button class="shadow-button" id="shadowTestBtn">
            Shadow DOM 버튼 테스트
          </button>
        </div>
        
        <div class="shadow-content">
          <slot name="title">기본 제목</slot>
          <slot>기본 컨텐츠</slot>
        </div>
      </div>
    `;

    // Shadow DOM 내부 이벤트
    this.shadowRoot
      .querySelector("#shadowTestBtn")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("shadow-test", {
            detail: { message: "Shadow DOM에서 발생한 이벤트!" },
            bubbles: true,
          })
        );
      });
  }
}

// 일반 DOM 비교용 컴포넌트 (Shadow DOM 없음)
class RegularDemoComponent extends HTMLElement {
  constructor() {
    super();
    this.setupComponent();
  }

  setupComponent() {
    this.innerHTML = `
      <div class="regular-container">
        <div class="regular-title">📄 일반 DOM</div>
        <div class="status">⚠️ 스타일 노출됨</div>
        
        <div class="regular-content">
          <h3>이 제목은 일반 CSS 영향받음</h3>
          <p>이 텍스트도 외부 CSS 영향받음</p>
          <p>외부에서 이 요소들에 접근 가능!</p>
          
          <button class="regular-button" id="regularTestBtn">
            일반 DOM 버튼 테스트
          </button>
        </div>
      </div>
    `;

    // 일반 DOM 이벤트
    this.querySelector("#regularTestBtn").addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("regular-test", {
          detail: { message: "일반 DOM에서 발생한 이벤트!" },
          bubbles: true,
        })
      );
    });
  }
}

// Rating Component
class RatingComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.value = 0;
    this.max = 5;
    this.setupComponent();
  }

  setupComponent() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        
        .star {
          font-size: var(--star-size, 24px);
          color: var(--star-empty, #ddd);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        
        .star.filled {
          color: var(--star-filled, #ffd700);
        }
        
        .star:hover {
          transform: scale(1.1);
        }
        
        .rating-text {
          margin-left: 10px;
          font-size: 14px;
          color: #666;
        }
      </style>
      <div class="stars"></div>
      <span class="rating-text"></span>
    `;

    this.starsContainer = this.shadowRoot.querySelector(".stars");
    this.ratingText = this.shadowRoot.querySelector(".rating-text");
    this.createStars();
    this.updateRating();
  }

  createStars() {
    this.starsContainer.innerHTML = "";
    for (let i = 1; i <= this.max; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "★";
      star.dataset.value = i;
      star.addEventListener("click", () => this.setRating(i));
      star.addEventListener("mouseenter", () => this.previewRating(i));
      star.addEventListener("mouseleave", () => this.updateRating());
      this.starsContainer.appendChild(star);
    }
  }

  setRating(value) {
    this.value = value;
    this.updateRating();
    this.dispatchEvent(
      new CustomEvent("rating-change", {
        detail: { value: this.value, max: this.max },
        bubbles: true,
      })
    );
  }

  previewRating(value) {
    const stars = this.shadowRoot.querySelectorAll(".star");
    stars.forEach((star, index) => {
      star.classList.toggle("filled", index < value);
    });
  }

  updateRating() {
    const stars = this.shadowRoot.querySelectorAll(".star");
    stars.forEach((star, index) => {
      star.classList.toggle("filled", index < this.value);
    });
    this.ratingText.textContent = `${this.value}/${this.max}`;
  }

  static get observedAttributes() {
    return ["value", "max"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value") {
      this.value = parseInt(newValue) || 0;
      this.updateRating();
    } else if (name === "max") {
      this.max = parseInt(newValue) || 5;
      this.createStars();
      this.updateRating();
    }
  }
}

// Main Web Component API Demo
class WebComponentAPI {
  constructor() {
    this.init();
  }

  init() {
    console.log("🎨 Web Component API 초기화 시작");
    this.registerComponents();
    this.setupUI();
    this.setupEventListeners();
    console.log("✅ Web Component API 초기화 완료");
  }

  registerComponents() {
    console.log("🧩 커스텀 컴포넌트 등록 중...");

    // Custom Elements 등록
    if (!customElements.get("custom-button")) {
      customElements.define("custom-button", CustomButton);
      console.log("✅ custom-button 등록됨");
    }
    if (!customElements.get("rating-component")) {
      customElements.define("rating-component", RatingComponent);
      console.log("✅ rating-component 등록됨");
    }
    if (!customElements.get("shadow-demo")) {
      customElements.define("shadow-demo", ShadowDemoComponent);
      console.log("✅ shadow-demo 등록됨");
    }
    if (!customElements.get("regular-demo")) {
      customElements.define("regular-demo", RegularDemoComponent);
      console.log("✅ regular-demo 등록됨");
    }

    this.showNotification("커스텀 컴포넌트가 등록되었습니다!", "success");
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }
    console.log("✅ #app 요소 발견, HTML 삽입 중...");

    appDiv.innerHTML = `
      <div class="webcomp-container">
        <header class="webcomp-header">
          <h1>🎨 Web Component API 데모</h1>
          <p>재사용 가능한 커스텀 HTML 요소를 만들어보세요</p>
          <div class="api-status">
            <div class="status-item">
              <span class="status-indicator ${
                this.checkSupport() ? "success" : "error"
              }">
                ${this.checkSupport() ? "✅" : "❌"}
              </span>
              <span>Custom Elements</span>
            </div>
            <div class="status-item">
              <span class="status-indicator ${
                this.checkShadowDOM() ? "success" : "error"
              }">
                ${this.checkShadowDOM() ? "✅" : "❌"}
              </span>
              <span>Shadow DOM</span>
            </div>
          </div>
        </header>

        <main class="webcomp-main">
          <div class="demo-section">
            <div class="component-demo">
              <h2>🔘 커스텀 버튼 컴포넌트</h2>
              <div class="demo-content">
                <div class="button-examples">
                  <custom-button variant="primary" icon="🚀">Primary Button</custom-button>
                  <custom-button variant="success" icon="✅">Success Button</custom-button>
                  <custom-button variant="warning" icon="⚠️">Warning Button</custom-button>
                  <custom-button variant="danger" icon="❌">Danger Button</custom-button>
                  <custom-button disabled icon="🔒">Disabled Button</custom-button>
                </div>
                <div class="controls">
                  <button id="addButton" class="control-btn">➕ 버튼 추가</button>
                  <button id="toggleButtons" class="control-btn">🔄 버튼 토글</button>
                </div>
              </div>
            </div>

            <div class="component-demo">
              <h2>🛡️ Shadow DOM vs 일반 DOM 비교</h2>
              <div class="demo-content">
                <div class="shadow-comparison">
                  <div class="comparison-item">
                    <h3>Shadow DOM (격리됨)</h3>
                    <shadow-demo>
                      <span slot="title">🎯 슬롯으로 삽입된 제목</span>
                      <p>이 컨텐츠는 슬롯을 통해 삽입되었습니다!</p>
                    </shadow-demo>
                  </div>
                  
                  <div class="comparison-item">
                    <h3>일반 DOM (노출됨)</h3>
                    <regular-demo></regular-demo>
                  </div>
                </div>
                
                <div class="shadow-info">
                  <h4>🔍 개발자 도구로 확인해보세요:</h4>
                  <ul>
                    <li><strong>Shadow DOM</strong>: #shadow-root 안에 격리된 DOM 구조</li>
                    <li><strong>일반 DOM</strong>: 직접 접근 가능한 DOM 구조</li>
                    <li><strong>스타일 격리</strong>: Shadow DOM 내부 스타일이 외부에 영향 없음</li>
                  </ul>
                </div>
                
                <div class="test-buttons">
                  <button id="testShadowAccess" class="control-btn">🛡️ Shadow DOM 접근 테스트</button>
                  <button id="testRegularAccess" class="control-btn">📄 일반 DOM 접근 테스트</button>
                </div>
              </div>
            </div>

            <div class="component-demo">
              <h2>⭐ 레이팅 컴포넌트</h2>
              <div class="demo-content">
                <div class="rating-examples">
                  <div class="rating-item">
                    <label>제품 품질:</label>
                    <rating-component value="4" max="5"></rating-component>
                  </div>
                  <div class="rating-item">
                    <label>서비스:</label>
                    <rating-component value="3" max="5"></rating-component>
                  </div>
                  <div class="rating-item">
                    <label>전체 만족도:</label>
                    <rating-component value="0" max="10"></rating-component>
                  </div>
                </div>
                <div class="rating-result">
                  <p>평균 평점: <span id="averageRating">0.0</span></p>
                </div>
              </div>
            </div>

            <div class="component-demo">
              <h2>💡 Web Component 특징</h2>
              <div class="feature-list">
                <div class="feature-item">
                  <h3>🧩 Custom Elements</h3>
                  <p>자신만의 HTML 태그를 정의하고 사용할 수 있습니다</p>
                </div>
                <div class="feature-item">
                  <h3>🛡️ Shadow DOM</h3>
                  <p>스타일과 DOM이 캡슐화되어 다른 요소와 격리됩니다</p>
                </div>
                <div class="feature-item">
                  <h3>🔄 Lifecycle Callbacks</h3>
                  <p>컴포넌트의 생성, 연결, 속성 변경을 감지할 수 있습니다</p>
                </div>
              </div>
            </div>

            <div class="usage-guide">
              <h2>🚀 사용법</h2>
              <div class="code-example">
                <h3>기본 컴포넌트 정의:</h3>
                <pre><code>class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = \`
      &lt;style&gt;p { color: blue; }&lt;/style&gt;
      &lt;p&gt;&lt;slot&gt;기본 텍스트&lt;/slot&gt;&lt;/p&gt;
    \`;
  }
}

customElements.define('my-component', MyComponent);</code></pre>
              </div>

              <div class="code-example">
                <h3>HTML에서 사용:</h3>
                <pre><code>&lt;my-component&gt;커스텀 텍스트&lt;/my-component&gt;</code></pre>
              </div>
            </div>
          </div>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>
      </div>
    `;

    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 커스텀 버튼 이벤트
    document.addEventListener("custom-click", (e) => {
      this.showNotification(`커스텀 버튼이 클릭되었습니다!`, "info");
    });

    // 레이팅 이벤트
    document.addEventListener("rating-change", (e) => {
      this.updateAverageRating();
      this.showNotification(
        `평점이 ${e.detail.value}/${e.detail.max}로 변경되었습니다`,
        "success"
      );
    });

    // Shadow DOM 테스트 이벤트
    document.addEventListener("shadow-test", (e) => {
      this.showNotification(`${e.detail.message}`, "info");
    });

    document.addEventListener("regular-test", (e) => {
      this.showNotification(`${e.detail.message}`, "info");
    });

    // 컨트롤 버튼들
    document
      .getElementById("addButton")
      ?.addEventListener("click", () => this.addRandomButton());
    document
      .getElementById("toggleButtons")
      ?.addEventListener("click", () => this.toggleAllButtons());

    // Shadow DOM 접근 테스트 버튼들
    document
      .getElementById("testShadowAccess")
      ?.addEventListener("click", () => this.testShadowDOMAccess());
    document
      .getElementById("testRegularAccess")
      ?.addEventListener("click", () => this.testRegularDOMAccess());

    this.updateAverageRating();
    console.log("✅ 이벤트 리스너 설정 완료");
  }

  // 지원 여부 확인
  checkSupport() {
    return "customElements" in window;
  }

  checkShadowDOM() {
    return "attachShadow" in Element.prototype;
  }

  // 버튼 관련 메서드
  addRandomButton() {
    const variants = ["primary", "success", "warning", "danger"];
    const icons = ["🎯", "🎨", "🎪", "🎭", "🎸", "🎹"];
    const texts = ["새 버튼", "임의 버튼", "동적 버튼", "테스트 버튼"];

    const button = document.createElement("custom-button");
    button.setAttribute(
      "variant",
      variants[Math.floor(Math.random() * variants.length)]
    );
    button.setAttribute(
      "icon",
      icons[Math.floor(Math.random() * icons.length)]
    );
    button.textContent = texts[Math.floor(Math.random() * texts.length)];

    document.querySelector(".button-examples")?.appendChild(button);
    this.showNotification("새로운 버튼이 추가되었습니다!", "success");
  }

  toggleAllButtons() {
    const buttons = document.querySelectorAll("custom-button");
    buttons.forEach((button) => {
      const isDisabled = button.hasAttribute("disabled");
      if (isDisabled) {
        button.removeAttribute("disabled");
      } else {
        button.setAttribute("disabled", "");
      }
    });
    this.showNotification("모든 버튼 상태가 토글되었습니다!", "info");
  }

  // Shadow DOM 테스트 메서드
  testShadowDOMAccess() {
    const shadowDemo = document.querySelector("shadow-demo");

    try {
      // Shadow DOM 내부 요소에 직접 접근 시도
      const shadowButton = shadowDemo.querySelector("#shadowTestBtn");

      if (shadowButton) {
        this.showNotification(
          "❌ 이상하다... Shadow DOM 내부에 접근되었습니다!",
          "error"
        );
      } else {
        this.showNotification(
          "✅ 정상! Shadow DOM 내부에 직접 접근할 수 없습니다",
          "success"
        );
      }

      // Shadow Root 접근
      if (shadowDemo.shadowRoot) {
        const shadowBtn = shadowDemo.shadowRoot.querySelector("#shadowTestBtn");
        this.showNotification(
          `🛡️ shadowRoot를 통해서는 접근 가능: ${shadowBtn ? "성공" : "실패"}`,
          "info"
        );
      }
    } catch (error) {
      this.showNotification(
        `🛡️ Shadow DOM 접근 시도 중 에러: ${error.message}`,
        "warning"
      );
    }
  }

  testRegularDOMAccess() {
    const regularDemo = document.querySelector("regular-demo");

    try {
      // 일반 DOM 내부 요소에 직접 접근 시도
      const regularButton = regularDemo.querySelector("#regularTestBtn");

      if (regularButton) {
        this.showNotification(
          "✅ 성공! 일반 DOM 내부에 직접 접근 가능합니다",
          "success"
        );

        // 스타일 직접 변경 테스트
        regularButton.style.background = "red";
        regularButton.style.color = "white";

        setTimeout(() => {
          regularButton.style.background = "";
          regularButton.style.color = "";
        }, 2000);

        this.showNotification(
          "🎨 일반 DOM 요소의 스타일을 외부에서 변경했습니다!",
          "info"
        );
      } else {
        this.showNotification(
          "❌ 이상하다... 일반 DOM 내부에 접근할 수 없습니다",
          "error"
        );
      }
    } catch (error) {
      this.showNotification(
        `📄 일반 DOM 접근 시도 중 에러: ${error.message}`,
        "warning"
      );
    }
  }

  // 레이팅 관련 메서드
  updateAverageRating() {
    const ratings = document.querySelectorAll("rating-component");
    let total = 0;
    let count = 0;

    ratings.forEach((rating) => {
      const value = parseInt(rating.getAttribute("value")) || 0;
      const max = parseInt(rating.getAttribute("max")) || 5;
      total += (value / max) * 5; // 5점 만점으로 정규화
      count++;
    });

    const average = count > 0 ? (total / count).toFixed(1) : 0;
    document.getElementById("averageRating").textContent = average;
  }

  // 유틸리티 메서드
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
      notification.remove();
    }, 5000);
  }
}

// 초기화
function initWebComponentAPI() {
  console.log("🚀 Web Component API 초기화 함수 호출");
  new WebComponentAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initWebComponentAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initWebComponentAPI();
}

console.log(
  "📄 Web Component API 스크립트 로드 완료, readyState:",
  document.readyState
);
