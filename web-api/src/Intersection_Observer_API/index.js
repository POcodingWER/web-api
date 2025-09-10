import "./style.css";

console.log("👁️ Intersection Observer API 스크립트 시작!");

class IntersectionObserverAPI {
  constructor() {
    this.observers = new Map();
    this.observedElements = new Map();
    this.statistics = {
      totalObservers: 0,
      totalElements: 0,
      visibleElements: 0,
      intersectionEvents: 0,
    };
    this.lazyImages = [];
    this.infiniteScrollItems = [];
    this.animatedElements = [];
    this.init();
  }

  init() {
    console.log("👁️ Intersection Observer API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.createDemoElements();
    this.setupObservers();
    console.log("✅ Intersection Observer API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Intersection Observer API 지원 여부 확인 중...");

    const support = {
      IntersectionObserver: !!window.IntersectionObserver,
      IntersectionObserverEntry: !!window.IntersectionObserverEntry,
      isIntersecting:
        window.IntersectionObserverEntry &&
        "isIntersecting" in window.IntersectionObserverEntry.prototype,
      boundingClientRect: !!document.createElement("div").getBoundingClientRect,
    };

    console.log("Intersection Observer API 지원 상태:", support);

    if (!support.IntersectionObserver) {
      this.showNotification(
        "이 브라우저는 Intersection Observer API를 지원하지 않습니다",
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
      <div class="intersection-observer-container">
        <header class="intersection-observer-header">
          <h1>👁️ Intersection Observer API</h1>
          <p>요소의 교차 상태를 효율적으로 관찰</p>
          <div class="api-support">
            <div class="support-badge ${
              support.IntersectionObserver ? "supported" : "unsupported"
            }">
              ${
                support.IntersectionObserver
                  ? "✅ IntersectionObserver"
                  : "❌ IntersectionObserver"
              }
            </div>
            <div class="support-badge ${
              support.IntersectionObserverEntry ? "supported" : "unsupported"
            }">
              ${
                support.IntersectionObserverEntry
                  ? "✅ ObserverEntry"
                  : "❌ ObserverEntry"
              }
            </div>
            <div class="support-badge ${
              support.isIntersecting ? "supported" : "unsupported"
            }">
              ${
                support.isIntersecting
                  ? "✅ isIntersecting"
                  : "❌ isIntersecting"
              }
            </div>
            <div class="support-badge ${
              support.boundingClientRect ? "supported" : "unsupported"
            }">
              ${
                support.boundingClientRect
                  ? "✅ BoundingRect"
                  : "❌ BoundingRect"
              }
            </div>
          </div>
        </header>

        <main class="intersection-observer-main">
          <div class="control-section">
            <div class="observer-card primary">
              <h2>🎛️ Observer 제어</h2>
              
              <div class="observer-controls">
                <div class="control-group">
                  <label for="observerThreshold">Threshold (임계점):</label>
                  <div class="threshold-controls">
                    <input 
                      type="range" 
                      id="observerThreshold" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value="0.1"
                    >
                    <span class="threshold-value" id="thresholdValue">0.1</span>
                  </div>
                </div>

                <div class="control-group">
                  <label for="rootMargin">Root Margin:</label>
                  <div class="margin-controls">
                    <input 
                      type="text" 
                      id="rootMargin" 
                      value="0px 0px 0px 0px"
                      placeholder="top right bottom left"
                    >
                    <button id="applyMargin" class="btn-accent">적용</button>
                  </div>
                </div>

                <div class="control-group">
                  <label>Multiple Thresholds:</label>
                  <div class="threshold-presets">
                    <button id="thresholdSingle" class="btn-secondary active">Single (0.1)</button>
                    <button id="thresholdMultiple" class="btn-secondary">Multiple</button>
                    <button id="thresholdDetailed" class="btn-secondary">Detailed</button>
                  </div>
                </div>

                <div class="observer-status">
                  <div class="status-item">
                    <span class="status-label">활성 Observer:</span>
                    <span class="status-value" id="activeObservers">0</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">관찰 중인 요소:</span>
                    <span class="status-value" id="observedElementsCount">0</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">현재 보이는 요소:</span>
                    <span class="status-value" id="visibleElementsCount">0</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="observer-card">
              <h2>📊 실시간 통계</h2>
              
              <div class="statistics-grid">
                <div class="stat-item">
                  <div class="stat-label">총 교차 이벤트</div>
                  <div class="stat-value" id="intersectionEvents">0</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">평균 가시성 비율</div>
                  <div class="stat-value" id="averageRatio">0%</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">성능 점수</div>
                  <div class="stat-value" id="performanceScore">100</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">메모리 사용량</div>
                  <div class="stat-value" id="memoryUsage">-</div>
                </div>
              </div>

              <div class="performance-chart" id="performanceChart">
                <div class="chart-placeholder">
                  성능 데이터 수집 중...
                </div>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <div class="observer-card">
              <h2>🎮 Interactive 데모</h2>
              
              <div class="demo-controls">
                <button id="startBasicDemo" class="btn-primary">
                  👁️ 기본 관찰 시작
                </button>
                <button id="startLazyLoading" class="btn-accent">
                  🖼️ 레이지 로딩 데모
                </button>
                <button id="startInfiniteScroll" class="btn-warning">
                  📜 무한 스크롤 데모
                </button>
                <button id="startAnimationDemo" class="btn-success">
                  ✨ 스크롤 애니메이션
                </button>
                <button id="resetDemos" class="btn-danger">
                  🔄 모든 데모 리셋
                </button>
              </div>

              <div class="demo-status" id="demoStatus">
                데모를 선택하여 Intersection Observer의 다양한 기능을 체험해보세요
              </div>
            </div>

            <div class="observer-card">
              <h2>📋 요소 목록</h2>
              
              <div class="element-filters">
                <button id="filterAll" class="filter-btn active">All</button>
                <button id="filterVisible" class="filter-btn">Visible</button>
                <button id="filterHidden" class="filter-btn">Hidden</button>
                <button id="filterAnimated" class="filter-btn">Animated</button>
              </div>

              <div class="element-list" id="elementList">
                <div class="list-placeholder">
                  관찰할 요소가 없습니다
                </div>
              </div>
            </div>
          </div>

          <div class="content-section">
            <div class="observer-card full-width">
              <h2>🎯 관찰 대상 영역</h2>
              
              <div class="observation-area" id="observationArea">
                <!-- 동적으로 생성되는 관찰 대상 요소들 -->
              </div>
            </div>
          </div>

          <div class="examples-section">
            <div class="observer-card">
              <h2>💡 사용 예제</h2>
              
              <div class="example-tabs">
                <button class="tab-btn active" data-tab="basic">기본 사용법</button>
                <button class="tab-btn" data-tab="lazy">레이지 로딩</button>
                <button class="tab-btn" data-tab="infinite">무한 스크롤</button>
                <button class="tab-btn" data-tab="animation">애니메이션</button>
              </div>

              <div class="example-content">
                <div class="tab-content active" id="tab-basic">
                  <h3>기본 Intersection Observer</h3>
                  <pre><code>// 기본 Observer 생성
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('요소가 보입니다:', entry.target);
      // 요소 처리 로직
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

// 요소 관찰 시작
const target = document.querySelector('.target');
observer.observe(target);</code></pre>
                </div>

                <div class="tab-content" id="tab-lazy">
                  <h3>이미지 레이지 로딩</h3>
                  <pre><code>// 레이지 로딩 Observer
const lazyImageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      lazyImageObserver.unobserve(img);
    }
  });
});

// 모든 lazy 이미지 관찰
document.querySelectorAll('img[data-src]').forEach(img => {
  lazyImageObserver.observe(img);
});</code></pre>
                </div>

                <div class="tab-content" id="tab-infinite">
                  <h3>무한 스크롤</h3>
                  <pre><code>// 무한 스크롤 Observer
const infiniteScrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 새로운 콘텐츠 로드
      loadMoreContent();
    }
  });
}, {
  rootMargin: '100px'
});

// 센티넬 요소 관찰
const sentinel = document.querySelector('.scroll-sentinel');
infiniteScrollObserver.observe(sentinel);</code></pre>
                </div>

                <div class="tab-content" id="tab-animation">
                  <h3>스크롤 애니메이션</h3>
                  <pre><code>// 애니메이션 Observer
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    } else {
      entry.target.classList.remove('animate-in');
    }
  });
}, {
  threshold: 0.3
});

// 애니메이션 요소들 관찰
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  animationObserver.observe(el);
});</code></pre>
                </div>
              </div>
            </div>

            <div class="observer-card">
              <h2>🌟 활용 사례</h2>
              
              <div class="use-cases">
                <div class="use-case-item">
                  <div class="use-case-icon">🖼️</div>
                  <div class="use-case-content">
                    <h3>이미지 레이지 로딩</h3>
                    <p>화면에 보이는 이미지만 로드하여 초기 로딩 시간 단축</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">📜</div>
                  <div class="use-case-content">
                    <h3>무한 스크롤</h3>
                    <p>사용자가 페이지 끝에 도달하면 자동으로 새 콘텐츠 로드</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">✨</div>
                  <div class="use-case-content">
                    <h3>스크롤 애니메이션</h3>
                    <p>요소가 뷰포트에 나타날 때 애니메이션 효과 적용</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">📊</div>
                  <div class="use-case-content">
                    <h3>가시성 추적</h3>
                    <p>광고 노출, 콘텐츠 조회 등 사용자 행동 분석</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">⚡</div>
                  <div class="use-case-content">
                    <h3>성능 최적화</h3>
                    <p>불필요한 계산 방지로 스크롤 성능 향상</p>
                  </div>
                </div>

                <div class="use-case-item">
                  <div class="use-case-icon">🎮</div>
                  <div class="use-case-content">
                    <h3>게임 요소</h3>
                    <p>스크롤 기반 인터랙션 및 게임 메커니즘</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="browser-support-section">
            <div class="observer-card">
              <h2>🌐 브라우저 지원</h2>
              
              <div class="browser-grid">
                <div class="browser-item">
                  <div class="browser-icon">🌐</div>
                  <div class="browser-name">Chrome</div>
                  <div class="browser-version supported">51+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">🦊</div>
                  <div class="browser-name">Firefox</div>
                  <div class="browser-version supported">55+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">🧭</div>
                  <div class="browser-name">Safari</div>
                  <div class="browser-version supported">12.1+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">📱</div>
                  <div class="browser-name">iOS Safari</div>
                  <div class="browser-version supported">12.2+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">🤖</div>
                  <div class="browser-name">Android</div>
                  <div class="browser-version supported">51+ ✅</div>
                </div>
                <div class="browser-item">
                  <div class="browser-icon">⚡</div>
                  <div class="browser-name">Edge</div>
                  <div class="browser-version supported">15+ ✅</div>
                </div>
              </div>

              <div class="polyfill-info">
                <h3>📦 Polyfill</h3>
                <p>구버전 브라우저 지원을 위한 polyfill 사용 가능:</p>
                <pre><code>&lt;script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"&gt;&lt;/script&gt;</code></pre>
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

    // Threshold 슬라이더
    const thresholdSlider = document.getElementById("observerThreshold");
    if (thresholdSlider) {
      thresholdSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById("thresholdValue").textContent = value;
        this.updateObserverThreshold(value);
      });
    }

    // Root Margin 적용
    const applyMarginBtn = document.getElementById("applyMargin");
    if (applyMarginBtn) {
      applyMarginBtn.addEventListener("click", () => {
        const margin = document.getElementById("rootMargin").value;
        this.updateRootMargin(margin);
      });
    }

    // Threshold 프리셋
    const thresholdBtns = document.querySelectorAll(
      ".threshold-presets button"
    );
    thresholdBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        thresholdBtns.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.applyThresholdPreset(e.target.id);
      });
    });

    // 데모 버튼들
    const startBasicBtn = document.getElementById("startBasicDemo");
    if (startBasicBtn) {
      startBasicBtn.addEventListener("click", () => this.startBasicDemo());
    }

    const startLazyBtn = document.getElementById("startLazyLoading");
    if (startLazyBtn) {
      startLazyBtn.addEventListener("click", () => this.startLazyLoadingDemo());
    }

    const startInfiniteBtn = document.getElementById("startInfiniteScroll");
    if (startInfiniteBtn) {
      startInfiniteBtn.addEventListener("click", () =>
        this.startInfiniteScrollDemo()
      );
    }

    const startAnimationBtn = document.getElementById("startAnimationDemo");
    if (startAnimationBtn) {
      startAnimationBtn.addEventListener("click", () =>
        this.startAnimationDemo()
      );
    }

    const resetBtn = document.getElementById("resetDemos");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetAllDemos());
    }

    // 필터 버튼들
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.filterElements(e.target.id.replace("filter", "").toLowerCase());
      });
    });

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

  createDemoElements() {
    const observationArea = document.getElementById("observationArea");
    if (!observationArea) return;

    // 기본 관찰 요소들 생성
    for (let i = 1; i <= 20; i++) {
      const element = document.createElement("div");
      element.className = "observation-target";
      element.dataset.id = `target-${i}`;
      element.innerHTML = `
        <div class="target-header">
          <span class="target-id">Target ${i}</span>
          <span class="target-status">대기 중</span>
        </div>
        <div class="target-content">
          <div class="visibility-indicator"></div>
          <div class="intersection-ratio">0%</div>
        </div>
      `;
      observationArea.appendChild(element);
    }

    // 레이지 로딩용 이미지 플레이스홀더들
    for (let i = 1; i <= 10; i++) {
      const imgContainer = document.createElement("div");
      imgContainer.className = "lazy-image-container hidden";
      imgContainer.innerHTML = `
        <img 
          class="lazy-image" 
          data-src="https://picsum.photos/300/200?random=${i}"
          alt="Lazy Image ${i}"
          data-id="lazy-${i}"
        >
        <div class="image-placeholder">
          <span>📷</span>
          <span>이미지 ${i} 로딩 대기 중...</span>
        </div>
      `;
      observationArea.appendChild(imgContainer);
    }

    // 무한 스크롤용 콘텐츠
    const infiniteContainer = document.createElement("div");
    infiniteContainer.className = "infinite-scroll-container hidden";
    infiniteContainer.innerHTML = `
      <div class="infinite-content" id="infiniteContent">
        <!-- 동적으로 추가되는 콘텐츠 -->
      </div>
      <div class="scroll-sentinel" id="scrollSentinel">
        <div class="loading-spinner">⏳ 더 많은 콘텐츠 로딩 중...</div>
      </div>
    `;
    observationArea.appendChild(infiniteContainer);

    // 애니메이션용 요소들
    for (let i = 1; i <= 15; i++) {
      const animElement = document.createElement("div");
      animElement.className = "animation-target hidden";
      animElement.dataset.animation = this.getRandomAnimation();
      animElement.innerHTML = `
        <div class="anim-content">
          <h3>애니메이션 요소 ${i}</h3>
          <p>스크롤하면 ${animElement.dataset.animation} 애니메이션이 실행됩니다</p>
        </div>
      `;
      observationArea.appendChild(animElement);
    }

    console.log("✅ 데모 요소들 생성 완료");
  }

  setupObservers() {
    if (!window.IntersectionObserver) {
      this.showNotification(
        "IntersectionObserver를 지원하지 않습니다",
        "error"
      );
      return;
    }

    // 기본 Observer 설정
    this.createBasicObserver();

    console.log("✅ 기본 Observer 설정 완료");
  }

  createBasicObserver() {
    const basicObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.handleBasicIntersection(entry);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    this.observers.set("basic", basicObserver);

    // 기본 타겟 요소들 관찰 시작
    const targets = document.querySelectorAll(".observation-target");
    targets.forEach((target) => {
      basicObserver.observe(target);
      this.observedElements.set(target, {
        observer: "basic",
        isVisible: false,
        ratio: 0,
        element: target,
      });
    });

    this.updateStatistics();
  }

  handleBasicIntersection(entry) {
    const element = entry.target;
    const isIntersecting = entry.isIntersecting;
    const ratio = entry.intersectionRatio;

    // 상태 업데이트
    if (this.observedElements.has(element)) {
      const data = this.observedElements.get(element);
      data.isVisible = isIntersecting;
      data.ratio = ratio;
    }

    // UI 업데이트
    const statusElement = element.querySelector(".target-status");
    const ratioElement = element.querySelector(".intersection-ratio");
    const indicator = element.querySelector(".visibility-indicator");

    if (statusElement) {
      statusElement.textContent = isIntersecting ? "보임" : "숨김";
      statusElement.className = `target-status ${
        isIntersecting ? "visible" : "hidden"
      }`;
    }

    if (ratioElement) {
      ratioElement.textContent = `${Math.round(ratio * 100)}%`;
    }

    if (indicator) {
      indicator.className = `visibility-indicator ${
        isIntersecting ? "visible" : "hidden"
      }`;
    }

    // 애니메이션 효과
    if (isIntersecting) {
      element.classList.add("intersecting");
    } else {
      element.classList.remove("intersecting");
    }

    this.statistics.intersectionEvents++;
    this.updateStatistics();
    this.updateElementList();
  }

  // 데모 메서드들
  startBasicDemo() {
    this.showAllElements(".observation-target");
    this.hideAllElements(
      ".lazy-image-container, .infinite-scroll-container, .animation-target"
    );

    this.updateDemoStatus(
      "기본 교차 관찰 데모가 시작되었습니다. 스크롤하여 요소들의 상태 변화를 확인하세요."
    );
    this.showNotification("기본 데모가 시작되었습니다", "success");
  }

  startLazyLoadingDemo() {
    this.hideAllElements(
      ".observation-target, .infinite-scroll-container, .animation-target"
    );
    this.showAllElements(".lazy-image-container");

    this.setupLazyLoading();
    this.updateDemoStatus(
      "레이지 로딩 데모가 시작되었습니다. 스크롤하면 이미지가 동적으로 로드됩니다."
    );
    this.showNotification("레이지 로딩 데모가 시작되었습니다", "success");
  }

  startInfiniteScrollDemo() {
    this.hideAllElements(
      ".observation-target, .lazy-image-container, .animation-target"
    );
    this.showAllElements(".infinite-scroll-container");

    this.setupInfiniteScroll();
    this.updateDemoStatus(
      "무한 스크롤 데모가 시작되었습니다. 아래로 스크롤하면 새로운 콘텐츠가 로드됩니다."
    );
    this.showNotification("무한 스크롤 데모가 시작되었습니다", "success");
  }

  startAnimationDemo() {
    this.hideAllElements(
      ".observation-target, .lazy-image-container, .infinite-scroll-container"
    );
    this.showAllElements(".animation-target");

    this.setupScrollAnimations();
    this.updateDemoStatus(
      "스크롤 애니메이션 데모가 시작되었습니다. 스크롤하면 다양한 애니메이션 효과를 볼 수 있습니다."
    );
    this.showNotification("애니메이션 데모가 시작되었습니다", "success");
  }

  setupLazyLoading() {
    // 기존 레이지 로딩 Observer 제거
    if (this.observers.has("lazy")) {
      this.observers.get("lazy").disconnect();
    }

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadLazyImage(entry.target);
            lazyObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    this.observers.set("lazy", lazyObserver);

    // 모든 레이지 이미지 관찰
    const lazyImages = document.querySelectorAll(".lazy-image");
    lazyImages.forEach((img) => {
      // 이미지 초기화
      img.src = "";
      img.classList.add("loading");
      lazyObserver.observe(img);
    });
  }

  loadLazyImage(img) {
    const placeholder = img.nextElementSibling;

    img.onload = () => {
      img.classList.remove("loading");
      img.classList.add("loaded");
      if (placeholder) {
        placeholder.style.display = "none";
      }
      this.showNotification(`이미지 ${img.dataset.id} 로드 완료`, "success");
    };

    img.onerror = () => {
      img.classList.remove("loading");
      img.classList.add("error");
      if (placeholder) {
        placeholder.innerHTML = `
          <span>❌</span>
          <span>이미지 로드 실패</span>
        `;
      }
    };

    img.src = img.dataset.src;
  }

  setupInfiniteScroll() {
    // 기존 무한 스크롤 Observer 제거
    if (this.observers.has("infinite")) {
      this.observers.get("infinite").disconnect();
    }

    const infiniteObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadMoreContent();
          }
        });
      },
      {
        rootMargin: "100px",
      }
    );

    this.observers.set("infinite", infiniteObserver);

    // 센티넬 요소 관찰
    const sentinel = document.getElementById("scrollSentinel");
    if (sentinel) {
      infiniteObserver.observe(sentinel);
    }

    // 초기 콘텐츠 로드
    this.loadInitialContent();
  }

  loadInitialContent() {
    const container = document.getElementById("infiniteContent");
    if (!container) return;

    container.innerHTML = "";
    this.infiniteScrollItems = [];

    for (let i = 1; i <= 10; i++) {
      this.addInfiniteScrollItem(i);
    }
  }

  loadMoreContent() {
    const container = document.getElementById("infiniteContent");
    if (!container) return;

    const startIndex = this.infiniteScrollItems.length + 1;

    // 로딩 시뮬레이션
    setTimeout(() => {
      for (let i = startIndex; i < startIndex + 5; i++) {
        this.addInfiniteScrollItem(i);
      }
      this.showNotification(
        `${startIndex}-${startIndex + 4}번 아이템 로드됨`,
        "info"
      );
    }, 500);
  }

  addInfiniteScrollItem(index) {
    const container = document.getElementById("infiniteContent");
    if (!container) return;

    const item = document.createElement("div");
    item.className = "infinite-scroll-item";
    item.innerHTML = `
      <div class="item-header">
        <h3>아이템 #${index}</h3>
        <span class="item-badge">새로 로드됨</span>
      </div>
      <div class="item-content">
        <p>이것은 무한 스크롤로 동적으로 로드된 콘텐츠입니다. 아이템 번호: ${index}</p>
        <div class="item-meta">
          <span>로드 시간: ${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    `;

    container.appendChild(item);
    this.infiniteScrollItems.push(item);

    // 애니메이션 효과
    setTimeout(() => {
      item.classList.add("loaded");
    }, 100);
  }

  setupScrollAnimations() {
    // 기존 애니메이션 Observer 제거
    if (this.observers.has("animation")) {
      this.observers.get("animation").disconnect();
    }

    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const animation = element.dataset.animation;

          if (entry.isIntersecting) {
            element.classList.add("animate-in", animation);
            element.classList.remove("animate-out");
          } else {
            element.classList.remove("animate-in", animation);
            element.classList.add("animate-out");
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-10%",
      }
    );

    this.observers.set("animation", animationObserver);

    // 모든 애니메이션 요소 관찰
    const animElements = document.querySelectorAll(".animation-target");
    animElements.forEach((element) => {
      animationObserver.observe(element);
    });
  }

  resetAllDemos() {
    // 모든 Observer 정리
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    // 요소들 초기화
    this.hideAllElements(
      ".lazy-image-container, .infinite-scroll-container, .animation-target"
    );
    this.showAllElements(".observation-target");

    // 기본 Observer 재설정
    this.createBasicObserver();

    this.updateDemoStatus(
      "모든 데모가 리셋되었습니다. 새로운 데모를 선택해주세요."
    );
    this.showNotification("모든 데모가 리셋되었습니다", "info");
  }

  // Observer 설정 메서드들
  updateObserverThreshold(threshold) {
    if (this.observers.has("basic")) {
      const observer = this.observers.get("basic");
      observer.disconnect();

      const newObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => this.handleBasicIntersection(entry));
        },
        {
          threshold,
          rootMargin: document.getElementById("rootMargin").value || "0px",
        }
      );

      this.observers.set("basic", newObserver);

      // 기본 타겟들 다시 관찰
      const targets = document.querySelectorAll(".observation-target");
      targets.forEach((target) => newObserver.observe(target));

      this.showNotification(`Threshold를 ${threshold}로 변경했습니다`, "info");
    }
  }

  updateRootMargin(margin) {
    if (this.observers.has("basic")) {
      const observer = this.observers.get("basic");
      observer.disconnect();

      const threshold = parseFloat(
        document.getElementById("observerThreshold").value
      );

      const newObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => this.handleBasicIntersection(entry));
        },
        {
          threshold,
          rootMargin: margin,
        }
      );

      this.observers.set("basic", newObserver);

      // 기본 타겟들 다시 관찰
      const targets = document.querySelectorAll(".observation-target");
      targets.forEach((target) => newObserver.observe(target));

      this.showNotification(`Root Margin을 ${margin}으로 변경했습니다`, "info");
    }
  }

  applyThresholdPreset(presetId) {
    let thresholds;

    switch (presetId) {
      case "thresholdSingle":
        thresholds = [0.1];
        break;
      case "thresholdMultiple":
        thresholds = [0, 0.25, 0.5, 0.75, 1.0];
        break;
      case "thresholdDetailed":
        thresholds = Array.from({ length: 11 }, (_, i) => i / 10);
        break;
      default:
        thresholds = [0.1];
    }

    if (this.observers.has("basic")) {
      const observer = this.observers.get("basic");
      observer.disconnect();

      const newObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => this.handleBasicIntersection(entry));
        },
        {
          threshold: thresholds,
          rootMargin: document.getElementById("rootMargin").value || "0px",
        }
      );

      this.observers.set("basic", newObserver);

      // 기본 타겟들 다시 관찰
      const targets = document.querySelectorAll(".observation-target");
      targets.forEach((target) => newObserver.observe(target));

      this.showNotification(
        `Threshold 프리셋 적용: ${thresholds.length}개 지점`,
        "info"
      );
    }
  }

  // UI 업데이트 메서드들
  updateStatistics() {
    const visibleCount = Array.from(this.observedElements.values()).filter(
      (data) => data.isVisible
    ).length;

    const averageRatio =
      Array.from(this.observedElements.values()).reduce(
        (sum, data) => sum + data.ratio,
        0
      ) / this.observedElements.size;

    document.getElementById("activeObservers").textContent =
      this.observers.size;
    document.getElementById("observedElementsCount").textContent =
      this.observedElements.size;
    document.getElementById("visibleElementsCount").textContent = visibleCount;
    document.getElementById("intersectionEvents").textContent =
      this.statistics.intersectionEvents;
    document.getElementById("averageRatio").textContent = `${Math.round(
      averageRatio * 100
    )}%`;

    // 성능 점수 계산 (간단한 휴리스틱)
    const performanceScore = Math.max(
      0,
      100 - this.statistics.intersectionEvents / 10
    );
    document.getElementById("performanceScore").textContent =
      Math.round(performanceScore);

    // 메모리 사용량 (추정)
    if (performance.memory) {
      const memoryMB = Math.round(
        performance.memory.usedJSHeapSize / 1024 / 1024
      );
      document.getElementById("memoryUsage").textContent = `${memoryMB}MB`;
    }
  }

  updateElementList() {
    const elementList = document.getElementById("elementList");
    if (!elementList) return;

    const elements = Array.from(this.observedElements.entries());

    if (elements.length === 0) {
      elementList.innerHTML =
        '<div class="list-placeholder">관찰할 요소가 없습니다</div>';
      return;
    }

    elementList.innerHTML = elements
      .map(([element, data]) => {
        const id = element.dataset.id || "unknown";
        const status = data.isVisible ? "visible" : "hidden";
        const ratio = Math.round(data.ratio * 100);

        return `
          <div class="element-item ${status}">
            <div class="element-id">${id}</div>
            <div class="element-status ${status}">${
          data.isVisible ? "보임" : "숨김"
        }</div>
            <div class="element-ratio">${ratio}%</div>
          </div>
        `;
      })
      .join("");
  }

  updateDemoStatus(message) {
    const demoStatus = document.getElementById("demoStatus");
    if (demoStatus) {
      demoStatus.textContent = message;
    }
  }

  filterElements(filter) {
    const elements = document.querySelectorAll(".element-item");

    elements.forEach((element) => {
      let show = false;

      switch (filter) {
        case "all":
          show = true;
          break;
        case "visible":
          show = element.classList.contains("visible");
          break;
        case "hidden":
          show = element.classList.contains("hidden");
          break;
        case "animated":
          show = element.dataset.animated === "true";
          break;
      }

      element.style.display = show ? "flex" : "none";
    });
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

  // 유틸리티 메서드들
  showAllElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.classList.remove("hidden");
    });
  }

  hideAllElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.classList.add("hidden");
    });
  }

  getRandomAnimation() {
    const animations = [
      "fadeIn",
      "slideInLeft",
      "slideInRight",
      "slideInUp",
      "slideInDown",
      "zoomIn",
      "rotateIn",
      "flipInX",
      "bounceIn",
    ];
    return animations[Math.floor(Math.random() * animations.length)];
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
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.observedElements.clear();
  }
}

// 전역 접근을 위한 설정
window.intersectionObserverAPI = null;

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  if (window.intersectionObserverAPI) {
    window.intersectionObserverAPI.cleanup();
  }
});

// 초기화
function initIntersectionObserverAPI() {
  console.log("🚀 Intersection Observer API 초기화 함수 호출");
  window.intersectionObserverAPI = new IntersectionObserverAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initIntersectionObserverAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initIntersectionObserverAPI();
}

console.log(
  "📄 Intersection Observer API 스크립트 로드 완료, readyState:",
  document.readyState
);
