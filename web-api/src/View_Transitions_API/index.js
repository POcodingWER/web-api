import "./style.css";

console.log("🎬 View Transitions API 스크립트 시작!");

class ViewTransitionsAPI {
  constructor() {
    this.currentView = "home";
    this.transitionHistory = [];
    this.animationCounter = 0;
    this.isTransitioning = false;
    this.performance = {
      transitions: 0,
      averageDuration: 0,
      successRate: 100,
    };
    this.galleryItems = [];
    this.selectedGalleryItem = null;
    this.themeMode = "light";
    this.init();
  }

  init() {
    console.log("🎬 View Transitions API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.setupInitialData();
    this.setupPerformanceMonitoring();
    console.log("✅ View Transitions API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 View Transitions API 지원 여부 확인 중...");

    const support = {
      viewTransitions: !!document.startViewTransition,
      cssViewTransitions: CSS.supports("view-transition-name", "none"),
      animationsAPI: !!document.getAnimations,
      intersectionObserver: !!window.IntersectionObserver,
    };

    console.log("View Transitions API 지원 상태:", support);

    if (!support.viewTransitions) {
      this.showNotification(
        "이 브라우저는 View Transitions API를 지원하지 않습니다",
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
      <div class="view-transitions-container">
        <header class="view-transitions-header">
          <h1>🎬 View Transitions API</h1>
          <p>부드럽고 자연스러운 화면 전환 애니메이션</p>
          <div class="api-support">
            <div class="support-badge ${
              support.viewTransitions ? "supported" : "unsupported"
            }">
              ${
                support.viewTransitions
                  ? "✅ View Transitions"
                  : "❌ View Transitions"
              }
            </div>
            <div class="support-badge ${
              support.cssViewTransitions ? "supported" : "unsupported"
            }">
              ${
                support.cssViewTransitions
                  ? "✅ CSS Transitions"
                  : "❌ CSS Transitions"
              }
            </div>
            <div class="support-badge ${
              support.animationsAPI ? "supported" : "unsupported"
            }">
              ${
                support.animationsAPI
                  ? "✅ Animations API"
                  : "❌ Animations API"
              }
            </div>
          </div>
        </header>

        <main class="view-transitions-main">
          <!-- Navigation -->
          <nav class="view-nav">
            <button class="nav-btn active" data-view="home">🏠 홈</button>
            <button class="nav-btn" data-view="gallery">🖼️ 갤러리</button>
            <button class="nav-btn" data-view="list">📋 리스트</button>
            <button class="nav-btn" data-view="cards">🃏 카드</button>
            <button class="nav-btn" data-view="settings">⚙️ 설정</button>
          </nav>

          <!-- Control Panel -->
          <div class="control-panel">
            <div class="control-group">
              <h3>🎛️ 전환 컨트롤</h3>
              <div class="control-buttons">
                <button id="basicTransition" class="btn-primary">
                  🔄 기본 전환
                </button>
                <button id="morphTransition" class="btn-accent">
                  🎭 모프 전환
                </button>
                <button id="slideTransition" class="btn-warning">
                  ➡️ 슬라이드 전환
                </button>
                <button id="fadeTransition" class="btn-secondary">
                  🌅 페이드 전환
                </button>
                <button id="zoomTransition" class="btn-success">
                  🔍 줌 전환
                </button>
                <button id="flipTransition" class="btn-danger">
                  🔄 플립 전환
                </button>
              </div>
            </div>

            <div class="control-group">
              <h3>⚙️ 전환 설정</h3>
              <div class="control-options">
                <label class="option-label">
                  <span>전환 시간:</span>
                  <input type="range" id="transitionDuration" min="200" max="2000" value="600" step="100">
                  <span id="durationValue">600ms</span>
                </label>
                <label class="option-label">
                  <span>이징 함수:</span>
                  <select id="easingFunction">
                    <option value="ease">ease</option>
                    <option value="ease-in">ease-in</option>
                    <option value="ease-out">ease-out</option>
                    <option value="ease-in-out">ease-in-out</option>
                    <option value="linear">linear</option>
                    <option value="cubic-bezier(0.25, 0.46, 0.45, 0.94)">custom</option>
                  </select>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="reduceMotion">
                  <span class="checkmark"></span>
                  애니메이션 감소
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="enableSounds">
                  <span class="checkmark"></span>
                  사운드 효과
                </label>
              </div>
            </div>

            <div class="control-group">
              <h3>📊 성능 모니터링</h3>
              <div class="performance-stats">
                <div class="stat-item">
                  <span class="stat-label">총 전환 수:</span>
                  <span class="stat-value" id="totalTransitions">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">평균 시간:</span>
                  <span class="stat-value" id="averageDuration">0ms</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">성공률:</span>
                  <span class="stat-value" id="successRate">100%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">진행 중:</span>
                  <span class="stat-value" id="isTransitioning">아니오</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="content-area" id="contentArea">
            <!-- Home View -->
            <div class="view-content active" id="homeView">
              <div class="hero-section">
                <h2>🌟 View Transitions API에 오신 것을 환영합니다!</h2>
                <p>부드럽고 자연스러운 화면 전환을 경험해보세요</p>
                
                <div class="feature-grid">
                  <div class="feature-card" data-transition="slide">
                    <div class="feature-icon">🎭</div>
                    <h3>모프 전환</h3>
                    <p>요소가 자연스럽게 변형되는 애니메이션</p>
                  </div>
                  <div class="feature-card" data-transition="fade">
                    <div class="feature-icon">🌅</div>
                    <h3>페이드 전환</h3>
                    <p>부드러운 투명도 변화로 전환</p>
                  </div>
                  <div class="feature-card" data-transition="zoom">
                    <div class="feature-icon">🔍</div>
                    <h3>줌 전환</h3>
                    <p>확대/축소 효과로 역동적 전환</p>
                  </div>
                  <div class="feature-card" data-transition="flip">
                    <div class="feature-icon">🔄</div>
                    <h3>플립 전환</h3>
                    <p>카드 뒤집기 같은 3D 효과</p>
                  </div>
                </div>

                <div class="demo-actions">
                  <button class="demo-btn" data-demo="theme">
                    🎨 테마 전환 데모
                  </button>
                  <button class="demo-btn" data-demo="layout">
                    📐 레이아웃 전환 데모
                  </button>
                  <button class="demo-btn" data-demo="sequence">
                    🎬 시퀀스 애니메이션 데모
                  </button>
                </div>
              </div>
            </div>

            <!-- Gallery View -->
            <div class="view-content" id="galleryView">
              <div class="gallery-header">
                <h2>🖼️ 이미지 갤러리</h2>
                <p>이미지 클릭 시 부드러운 전환 효과</p>
              </div>
              
              <div class="gallery-grid" id="galleryGrid">
                <!-- 갤러리 아이템들이 동적으로 생성됩니다 -->
              </div>

              <div class="gallery-modal hidden" id="galleryModal">
                <div class="modal-backdrop" id="modalBackdrop"></div>
                <div class="modal-content">
                  <button class="modal-close" id="modalClose">&times;</button>
                  <img class="modal-image" id="modalImage" src="" alt="">
                  <div class="modal-info">
                    <h3 id="modalTitle"></h3>
                    <p id="modalDescription"></p>
                  </div>
                  <div class="modal-navigation">
                    <button class="modal-nav-btn" id="prevImage">‹ 이전</button>
                    <button class="modal-nav-btn" id="nextImage">다음 ›</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div class="view-content" id="listView">
              <div class="list-header">
                <h2>📋 애니메이션 리스트</h2>
                <div class="list-controls">
                  <button id="addListItem" class="btn-primary">➕ 항목 추가</button>
                  <button id="shuffleList" class="btn-accent">🔀 섞기</button>
                  <button id="sortList" class="btn-secondary">📊 정렬</button>
                  <button id="clearList" class="btn-danger">🗑️ 전체 삭제</button>
                </div>
              </div>
              
              <div class="list-container" id="listContainer">
                <!-- 리스트 아이템들이 동적으로 생성됩니다 -->
              </div>
            </div>

            <!-- Cards View -->
            <div class="view-content" id="cardsView">
              <div class="cards-header">
                <h2>🃏 카드 전환 데모</h2>
                <div class="cards-controls">
                  <button id="shuffleCards" class="btn-primary">🔀 카드 섞기</button>
                  <button id="flipAllCards" class="btn-accent">🔄 전체 뒤집기</button>
                  <button id="dealCards" class="btn-warning">🎯 카드 배분</button>
                  <button id="collectCards" class="btn-secondary">📥 카드 수집</button>
                </div>
              </div>
              
              <div class="cards-area">
                <div class="card-deck" id="cardDeck">
                  <!-- 카드들이 동적으로 생성됩니다 -->
                </div>
                <div class="card-hands" id="cardHands">
                  <div class="player-hand" data-player="1">
                    <h3>플레이어 1</h3>
                    <div class="hand-cards"></div>
                  </div>
                  <div class="player-hand" data-player="2">
                    <h3>플레이어 2</h3>
                    <div class="hand-cards"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settings View -->
            <div class="view-content" id="settingsView">
              <div class="settings-header">
                <h2>⚙️ 설정 및 커스터마이제이션</h2>
              </div>
              
              <div class="settings-grid">
                <div class="settings-section">
                  <h3>🎨 테마 설정</h3>
                  <div class="theme-options">
                    <button class="theme-btn active" data-theme="light">☀️ 라이트</button>
                    <button class="theme-btn" data-theme="dark">🌙 다크</button>
                    <button class="theme-btn" data-theme="auto">🔄 자동</button>
                  </div>
                  <div class="color-picker">
                    <label for="accentColor">액센트 색상:</label>
                    <input type="color" id="accentColor" value="#667eea">
                  </div>
                </div>

                <div class="settings-section">
                  <h3>🎬 애니메이션 설정</h3>
                  <div class="animation-presets">
                    <button class="preset-btn" data-preset="smooth">🌊 부드러움</button>
                    <button class="preset-btn" data-preset="snappy">⚡ 빠름</button>
                    <button class="preset-btn" data-preset="bouncy">🏀 바운스</button>
                    <button class="preset-btn" data-preset="dramatic">🎭 드라마틱</button>
                  </div>
                  <div class="custom-timing">
                    <label for="customDuration">커스텀 시간 (ms):</label>
                    <input type="number" id="customDuration" min="100" max="3000" value="600">
                  </div>
                </div>

                <div class="settings-section">
                  <h3>📊 디버그 모드</h3>
                  <div class="debug-options">
                    <label class="checkbox-label">
                      <input type="checkbox" id="showTransitionBounds">
                      <span class="checkmark"></span>
                      전환 경계 표시
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" id="logTransitions">
                      <span class="checkmark"></span>
                      전환 로그 출력
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" id="showPerformance">
                      <span class="checkmark"></span>
                      성능 오버레이
                    </label>
                  </div>
                </div>

                <div class="settings-section">
                  <h3>💾 데이터 관리</h3>
                  <div class="data-actions">
                    <button id="exportSettings" class="btn-secondary">📤 설정 내보내기</button>
                    <button id="importSettings" class="btn-secondary">📥 설정 가져오기</button>
                    <button id="resetSettings" class="btn-danger">🔄 기본값 복원</button>
                  </div>
                  <input type="file" id="settingsFile" accept=".json" style="display: none;">
                </div>
              </div>
            </div>
          </div>

          <!-- Transition History -->
          <div class="transition-history">
            <h3>📜 전환 히스토리</h3>
            <div class="history-list" id="historyList">
              <div class="history-placeholder">전환 히스토리가 여기에 표시됩니다</div>
            </div>
            <div class="history-controls">
              <button id="clearHistory" class="btn-secondary">🗑️ 히스토리 삭제</button>
              <button id="replayLastTransition" class="btn-accent">🔄 마지막 전환 재생</button>
            </div>
          </div>
        </main>

        <!-- Examples Section -->
        <section class="examples-section">
          <h2>💡 사용 예제</h2>
          
          <div class="example-tabs">
            <button class="tab-btn active" data-tab="basic">기본 사용법</button>
            <button class="tab-btn" data-tab="advanced">고급 기법</button>
            <button class="tab-btn" data-tab="css">CSS 활용</button>
            <button class="tab-btn" data-tab="performance">성능 최적화</button>
          </div>

          <div class="example-content">
            <div class="tab-content active" id="tab-basic">
              <h3>기본 View Transition</h3>
              <pre><code>// 기본 View Transition 사용
function updateContent() {
  if (!document.startViewTransition) {
    // Fallback for unsupported browsers
    updateDOM();
    return;
  }

  const transition = document.startViewTransition(() => {
    updateDOM();
  });

  // 전환 완료 후 처리
  transition.finished.then(() => {
    console.log('전환 완료!');
  });
}

function updateDOM() {
  document.querySelector('#content').innerHTML = '새로운 콘텐츠';
}

// 사용법
updateContent();</code></pre>
            </div>

            <div class="tab-content" id="tab-advanced">
              <h3>고급 View Transition 기법</h3>
              <pre><code>// 커스텀 전환 이름 사용
function advancedTransition() {
  const transition = document.startViewTransition(() => {
    // DOM 업데이트 전에 view-transition-name 설정
    document.querySelector('#hero').style.viewTransitionName = 'hero-transition';
    updateDOM();
  });

  // 전환 준비 완료 후 처리
  transition.ready.then(() => {
    console.log('전환 준비 완료');
    // 추가 애니메이션 설정 가능
  });

  // 전환 업데이트 완료 후 처리
  transition.updateCallbackDone.then(() => {
    console.log('DOM 업데이트 완료');
  });

  return transition;
}

// 조건부 전환
function conditionalTransition() {
  if (shouldAnimate() && document.startViewTransition) {
    return document.startViewTransition(updateDOM);
  } else {
    updateDOM();
    return Promise.resolve();
  }
}</code></pre>
            </div>

            <div class="tab-content" id="tab-css">
              <h3>CSS View Transitions</h3>
              <pre><code>/* 기본 전환 애니메이션 커스터마이징 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}

/* 슬라이드 전환 */
::view-transition-old(slide) {
  transform: translateX(-100%);
}

::view-transition-new(slide) {
  transform: translateX(100%);
}

/* 페이드 전환 */
::view-transition-old(fade) {
  opacity: 0;
}

::view-transition-new(fade) {
  opacity: 1;
}

/* 확대/축소 전환 */
::view-transition-old(zoom) {
  transform: scale(0.8);
  opacity: 0;
}

::view-transition-new(zoom) {
  transform: scale(1.1);
}

/* 특정 요소에 transition name 설정 */
.hero-element {
  view-transition-name: hero;
}

.card-element {
  view-transition-name: card;
}

/* 모바일에서 애니메이션 감소 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.1s;
  }
}</code></pre>
            </div>

            <div class="tab-content" id="tab-performance">
              <h3>성능 최적화 및 모범 사례</h3>
              <pre><code>// 성능 최적화된 View Transition
class OptimizedTransitions {
  constructor() {
    this.isTransitioning = false;
    this.transitionQueue = [];
  }

  async performTransition(updateCallback) {
    // 이미 전환 중인 경우 대기열에 추가
    if (this.isTransitioning) {
      return new Promise((resolve) => {
        this.transitionQueue.push({ updateCallback, resolve });
      });
    }

    this.isTransitioning = true;

    try {
      // 성능 측정 시작
      const startTime = performance.now();

      const transition = document.startViewTransition?.(updateCallback);
      
      if (transition) {
        await transition.finished;
      } else {
        updateCallback();
      }

      // 성능 측정 종료
      const duration = performance.now() - startTime;
      console.log(\`전환 시간: \${duration.toFixed(2)}ms\`);

    } catch (error) {
      console.error('전환 중 오류:', error);
    } finally {
      this.isTransitioning = false;
      this.processQueue();
    }
  }

  processQueue() {
    if (this.transitionQueue.length > 0) {
      const { updateCallback, resolve } = this.transitionQueue.shift();
      this.performTransition(updateCallback).then(resolve);
    }
  }
}

// 사용법
const transitions = new OptimizedTransitions();
transitions.performTransition(() => updateDOM());</code></pre>
            </div>
          </div>
        </section>

        <!-- Browser Support -->
        <section class="browser-support">
          <h2>🌐 브라우저 지원</h2>
          
          <div class="browser-grid">
            <div class="browser-item">
              <div class="browser-icon">🌐</div>
              <div class="browser-name">Chrome</div>
              <div class="browser-version supported">111+ ✅</div>
            </div>
            <div class="browser-item">
              <div class="browser-icon">🦊</div>
              <div class="browser-name">Firefox</div>
              <div class="browser-version unsupported">❌</div>
            </div>
            <div class="browser-item">
              <div class="browser-icon">🧭</div>
              <div class="browser-name">Safari</div>
              <div class="browser-version unsupported">❌</div>
            </div>
            <div class="browser-item">
              <div class="browser-icon">⚡</div>
              <div class="browser-name">Edge</div>
              <div class="browser-version supported">111+ ✅</div>
            </div>
          </div>

          <div class="compatibility-notes">
            <h3>📝 호환성 참고사항</h3>
            <ul>
              <li><strong>Chrome:</strong> 111버전부터 완전 지원</li>
              <li><strong>Edge:</strong> 111버전부터 Chromium 기반으로 지원</li>
              <li><strong>Firefox:</strong> 아직 지원하지 않음 (개발 중)</li>
              <li><strong>Safari:</strong> 아직 지원하지 않음 (계획 없음)</li>
              <li><strong>Polyfill:</strong> 제한적인 polyfill 사용 가능</li>
            </ul>
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

    // Navigation 버튼들
    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const view = e.target.dataset.view;
        this.navigateToView(view);
      });
    });

    // 전환 컨트롤 버튼들
    const transitionBtns = [
      "basicTransition",
      "morphTransition",
      "slideTransition",
      "fadeTransition",
      "zoomTransition",
      "flipTransition",
    ];

    transitionBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const transitionType = btnId.replace("Transition", "");
          this.performDemoTransition(transitionType);
        });
      }
    });

    // 전환 설정 컨트롤들
    const durationSlider = document.getElementById("transitionDuration");
    if (durationSlider) {
      durationSlider.addEventListener("input", (e) => {
        const value = e.target.value;
        document.getElementById("durationValue").textContent = `${value}ms`;
        this.updateTransitionDuration(value);
      });
    }

    const easingSelect = document.getElementById("easingFunction");
    if (easingSelect) {
      easingSelect.addEventListener("change", (e) => {
        this.updateEasingFunction(e.target.value);
      });
    }

    // Feature cards 클릭 이벤트
    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const transitionType = e.currentTarget.dataset.transition;
        this.performDemoTransition(transitionType);
      });
    });

    // Demo 버튼들
    const demoBtns = document.querySelectorAll(".demo-btn");
    demoBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const demoType = e.target.dataset.demo;
        this.runDemo(demoType);
      });
    });

    // 리스트 컨트롤들
    const listControls = [
      "addListItem",
      "shuffleList",
      "sortList",
      "clearList",
    ];
    listControls.forEach((controlId) => {
      const control = document.getElementById(controlId);
      if (control) {
        control.addEventListener("click", () => {
          const action = controlId.replace("List", "").replace("add", "add");
          this.handleListAction(action);
        });
      }
    });

    // 카드 컨트롤들
    const cardControls = [
      "shuffleCards",
      "flipAllCards",
      "dealCards",
      "collectCards",
    ];
    cardControls.forEach((controlId) => {
      const control = document.getElementById(controlId);
      if (control) {
        control.addEventListener("click", () => {
          const action = controlId.replace("Cards", "").replace("Card", "");
          this.handleCardAction(action);
        });
      }
    });

    // 테마 버튼들
    const themeBtns = document.querySelectorAll(".theme-btn");
    themeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const theme = e.target.dataset.theme;
        this.switchTheme(theme);
      });
    });

    // 프리셋 버튼들
    const presetBtns = document.querySelectorAll(".preset-btn");
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const preset = e.target.dataset.preset;
        this.applyAnimationPreset(preset);
      });
    });

    // 설정 버튼들
    const settingsBtns = ["exportSettings", "importSettings", "resetSettings"];
    settingsBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId.replace("Settings", "");
          this.handleSettingsAction(action);
        });
      }
    });

    // 히스토리 컨트롤들
    const historyBtns = ["clearHistory", "replayLastTransition"];
    historyBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId
            .replace("History", "")
            .replace("LastTransition", "Last");
          this.handleHistoryAction(action);
        });
      }
    });

    // 탭 버튼들
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabId = e.target.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // 갤러리 모달 이벤트들
    this.setupGalleryEvents();

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  setupInitialData() {
    this.generateGalleryItems();
    this.generateListItems();
    this.generateCards();
    this.updatePerformanceStats();
  }

  setupPerformanceMonitoring() {
    // 성능 통계 업데이트 타이머
    setInterval(() => {
      this.updatePerformanceStats();
    }, 1000);
  }

  // View Navigation 메서드들
  async navigateToView(viewName) {
    if (this.isTransitioning || this.currentView === viewName) return;

    const startTime = performance.now();

    try {
      if (document.startViewTransition) {
        await this.performViewTransition(() => {
          this.updateActiveView(viewName);
        });
      } else {
        this.updateActiveView(viewName);
      }

      const duration = performance.now() - startTime;
      this.recordTransition("view-navigation", duration, true);
      this.showNotification(`${viewName} 페이지로 이동했습니다`, "success");
    } catch (error) {
      console.error("네비게이션 오류:", error);
      this.recordTransition("view-navigation", 0, false);
      this.showNotification("페이지 이동 중 오류가 발생했습니다", "error");
    }
  }

  async performViewTransition(updateCallback) {
    this.isTransitioning = true;

    try {
      const transition = document.startViewTransition(updateCallback);
      await transition.finished;
    } finally {
      this.isTransitioning = false;
    }
  }

  updateActiveView(viewName) {
    // Navigation 버튼 업데이트
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.view === viewName) {
        btn.classList.add("active");
      }
    });

    // View 콘텐츠 업데이트
    document.querySelectorAll(".view-content").forEach((view) => {
      view.classList.remove("active");
    });

    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
      targetView.classList.add("active");
    }

    this.currentView = viewName;
  }

  // Demo Transitions
  async performDemoTransition(transitionType) {
    if (this.isTransitioning) return;

    const startTime = performance.now();

    try {
      switch (transitionType) {
        case "basic":
          await this.basicTransitionDemo();
          break;
        case "morph":
          await this.morphTransitionDemo();
          break;
        case "slide":
          await this.slideTransitionDemo();
          break;
        case "fade":
          await this.fadeTransitionDemo();
          break;
        case "zoom":
          await this.zoomTransitionDemo();
          break;
        case "flip":
          await this.flipTransitionDemo();
          break;
      }

      const duration = performance.now() - startTime;
      this.recordTransition(transitionType, duration, true);
      this.showNotification(
        `${transitionType} 전환이 완료되었습니다`,
        "success"
      );
    } catch (error) {
      console.error(`${transitionType} 전환 오류:`, error);
      this.recordTransition(transitionType, 0, false);
      this.showNotification(
        `${transitionType} 전환 중 오류가 발생했습니다`,
        "error"
      );
    }
  }

  async basicTransitionDemo() {
    if (!document.startViewTransition) {
      this.showNotification(
        "이 브라우저는 View Transitions를 지원하지 않습니다",
        "warning"
      );
      return;
    }

    await this.performViewTransition(() => {
      const contentArea = document.getElementById("contentArea");
      contentArea.style.background = this.getRandomGradient();

      // 임시 메시지 표시
      const message = document.createElement("div");
      message.className = "transition-message";
      message.textContent = "🎬 기본 전환 애니메이션이 실행되었습니다!";
      contentArea.appendChild(message);

      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
        contentArea.style.background = "";
      }, 2000);
    });
  }

  async morphTransitionDemo() {
    if (!document.startViewTransition) {
      this.showNotification(
        "이 브라우저는 View Transitions를 지원하지 않습니다",
        "warning"
      );
      return;
    }

    const featureCards = document.querySelectorAll(".feature-card");

    await this.performViewTransition(() => {
      featureCards.forEach((card, index) => {
        card.style.viewTransitionName = `morph-card-${index}`;
        card.style.transform = `rotate(${Math.random() * 360}deg) scale(${
          0.8 + Math.random() * 0.4
        })`;
        card.style.background = this.getRandomGradient();
      });

      setTimeout(() => {
        featureCards.forEach((card) => {
          card.style.transform = "";
          card.style.background = "";
          card.style.viewTransitionName = "";
        });
      }, 1000);
    });
  }

  async slideTransitionDemo() {
    if (!document.startViewTransition) {
      this.showNotification(
        "이 브라우저는 View Transitions를 지원하지 않습니다",
        "warning"
      );
      return;
    }

    const activeView = document.querySelector(".view-content.active");
    if (!activeView) return;

    await this.performViewTransition(() => {
      activeView.style.viewTransitionName = "slide-demo";
      activeView.style.transform = "translateX(-100%)";

      setTimeout(() => {
        activeView.style.transform = "translateX(100%)";

        setTimeout(() => {
          activeView.style.transform = "";
          activeView.style.viewTransitionName = "";
        }, 300);
      }, 300);
    });
  }

  async fadeTransitionDemo() {
    if (!document.startViewTransition) {
      this.showNotification(
        "이 브라우저는 View Transitions를 지원하지 않습니다",
        "warning"
      );
      return;
    }

    const contentArea = document.getElementById("contentArea");

    await this.performViewTransition(() => {
      contentArea.style.viewTransitionName = "fade-demo";
      contentArea.style.opacity = "0";

      setTimeout(() => {
        contentArea.style.opacity = "1";
        contentArea.style.viewTransitionName = "";
      }, 300);
    });
  }

  async zoomTransitionDemo() {
    if (!document.startViewTransition) {
      this.showNotification(
        "이 브라우저는 View Transitions를 지원하지 않습니다",
        "warning"
      );
      return;
    }

    const featureCards = document.querySelectorAll(".feature-card");

    await this.performViewTransition(() => {
      featureCards.forEach((card, index) => {
        card.style.viewTransitionName = `zoom-card-${index}`;
        card.style.transform = "scale(0.1)";
      });

      setTimeout(() => {
        featureCards.forEach((card) => {
          card.style.transform = "scale(1.2)";

          setTimeout(() => {
            card.style.transform = "";
            card.style.viewTransitionName = "";
          }, 200);
        });
      }, 200);
    });
  }

  async flipTransitionDemo() {
    if (!document.startViewTransition) {
      this.showNotification(
        "이 브라우저는 View Transitions를 지원하지 않습니다",
        "warning"
      );
      return;
    }

    const featureCards = document.querySelectorAll(".feature-card");

    await this.performViewTransition(() => {
      featureCards.forEach((card, index) => {
        card.style.viewTransitionName = `flip-card-${index}`;
        card.style.transform = "rotateY(180deg)";

        setTimeout(() => {
          card.style.transform = "rotateY(0deg)";
          card.style.viewTransitionName = "";
        }, 600);
      });
    });
  }

  // Gallery 메서드들
  generateGalleryItems() {
    const galleryGrid = document.getElementById("galleryGrid");
    if (!galleryGrid) return;

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
      "#00D2D3",
      "#FF9F43",
      "#10AC84",
      "#EE5A24",
      "#0984E3",
      "#6C5CE7",
      "#A29BFE",
    ];

    galleryGrid.innerHTML = "";
    this.galleryItems = [];

    for (let i = 0; i < 12; i++) {
      const item = {
        id: i,
        title: `이미지 ${i + 1}`,
        description: `아름다운 View Transition 데모 이미지 #${i + 1}`,
        color: colors[i % colors.length],
      };

      this.galleryItems.push(item);

      const galleryItem = document.createElement("div");
      galleryItem.className = "gallery-item";
      galleryItem.dataset.id = i;
      galleryItem.style.background = `linear-gradient(135deg, ${
        item.color
      }, ${this.lightenColor(item.color, 20)})`;
      galleryItem.innerHTML = `
        <div class="gallery-item-content">
          <div class="gallery-item-icon">🖼️</div>
          <div class="gallery-item-title">${item.title}</div>
        </div>
      `;

      galleryItem.addEventListener("click", () => {
        this.openGalleryModal(i);
      });

      galleryGrid.appendChild(galleryItem);
    }
  }

  setupGalleryEvents() {
    const modalBackdrop = document.getElementById("modalBackdrop");
    const modalClose = document.getElementById("modalClose");
    const prevImage = document.getElementById("prevImage");
    const nextImage = document.getElementById("nextImage");

    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", () => {
        this.closeGalleryModal();
      });
    }

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        this.closeGalleryModal();
      });
    }

    if (prevImage) {
      prevImage.addEventListener("click", () => {
        this.navigateGallery(-1);
      });
    }

    if (nextImage) {
      nextImage.addEventListener("click", () => {
        this.navigateGallery(1);
      });
    }

    // 키보드 네비게이션
    document.addEventListener("keydown", (e) => {
      if (this.selectedGalleryItem !== null) {
        switch (e.key) {
          case "Escape":
            this.closeGalleryModal();
            break;
          case "ArrowLeft":
            this.navigateGallery(-1);
            break;
          case "ArrowRight":
            this.navigateGallery(1);
            break;
        }
      }
    });
  }

  async openGalleryModal(index) {
    if (this.isTransitioning) return;

    this.selectedGalleryItem = index;
    const item = this.galleryItems[index];

    const modal = document.getElementById("galleryModal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        modal.classList.remove("hidden");
        modalImage.style.background = `linear-gradient(135deg, ${
          item.color
        }, ${this.lightenColor(item.color, 20)})`;
        modalTitle.textContent = item.title;
        modalDescription.textContent = item.description;
      });
    } else {
      modal.classList.remove("hidden");
      modalImage.style.background = `linear-gradient(135deg, ${
        item.color
      }, ${this.lightenColor(item.color, 20)})`;
      modalTitle.textContent = item.title;
      modalDescription.textContent = item.description;
    }
  }

  async closeGalleryModal() {
    if (this.isTransitioning) return;

    const modal = document.getElementById("galleryModal");

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        modal.classList.add("hidden");
      });
    } else {
      modal.classList.add("hidden");
    }

    this.selectedGalleryItem = null;
  }

  async navigateGallery(direction) {
    if (this.selectedGalleryItem === null || this.isTransitioning) return;

    const newIndex =
      (this.selectedGalleryItem + direction + this.galleryItems.length) %
      this.galleryItems.length;

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        this.updateGalleryModal(newIndex);
      });
    } else {
      this.updateGalleryModal(newIndex);
    }
  }

  updateGalleryModal(index) {
    this.selectedGalleryItem = index;
    const item = this.galleryItems[index];

    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");

    modalImage.style.background = `linear-gradient(135deg, ${
      item.color
    }, ${this.lightenColor(item.color, 20)})`;
    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description;
  }

  // List 메서드들
  generateListItems() {
    const listContainer = document.getElementById("listContainer");
    if (!listContainer) return;

    const items = [
      "🎬 View Transitions API 데모",
      "🎨 CSS 애니메이션 효과",
      "🔄 부드러운 화면 전환",
      "⚡ 고성능 애니메이션",
      "🎯 사용자 경험 개선",
      "🌟 모던 웹 기술",
      "📱 반응형 디자인",
      "🎪 인터랙티브 요소",
    ];

    listContainer.innerHTML = "";

    items.forEach((text, index) => {
      const listItem = document.createElement("div");
      listItem.className = "list-item";
      listItem.dataset.index = index;
      listItem.innerHTML = `
        <div class="list-item-content">
          <span class="list-item-text">${text}</span>
          <button class="list-item-delete" onclick="window.viewTransitionsAPI.removeListItem(${index})">🗑️</button>
        </div>
      `;
      listContainer.appendChild(listItem);
    });
  }

  async handleListAction(action) {
    const listContainer = document.getElementById("listContainer");
    if (!listContainer) return;

    switch (action) {
      case "addItem":
        await this.addListItem();
        break;
      case "shuffle":
        await this.shuffleList();
        break;
      case "sort":
        await this.sortList();
        break;
      case "clear":
        await this.clearList();
        break;
    }
  }

  async addListItem() {
    const listContainer = document.getElementById("listContainer");
    const newTexts = [
      "🎊 새로운 아이템",
      "✨ 추가된 요소",
      "🎁 서프라이즈 항목",
      "🌈 무지개 효과",
      "🎪 재미있는 기능",
    ];

    const randomText = newTexts[Math.floor(Math.random() * newTexts.length)];
    const newIndex = listContainer.children.length;

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        const listItem = document.createElement("div");
        listItem.className = "list-item new-item";
        listItem.dataset.index = newIndex;
        listItem.innerHTML = `
          <div class="list-item-content">
            <span class="list-item-text">${randomText}</span>
            <button class="list-item-delete" onclick="window.viewTransitionsAPI.removeListItem(${newIndex})">🗑️</button>
          </div>
        `;
        listContainer.appendChild(listItem);

        setTimeout(() => {
          listItem.classList.remove("new-item");
        }, 500);
      });
    } else {
      const listItem = document.createElement("div");
      listItem.className = "list-item";
      listItem.dataset.index = newIndex;
      listItem.innerHTML = `
        <div class="list-item-content">
          <span class="list-item-text">${randomText}</span>
          <button class="list-item-delete" onclick="window.viewTransitionsAPI.removeListItem(${newIndex})">🗑️</button>
        </div>
      `;
      listContainer.appendChild(listItem);
    }
  }

  async removeListItem(index) {
    const listItem = document.querySelector(`[data-index="${index}"]`);
    if (!listItem) return;

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        listItem.remove();
      });
    } else {
      listItem.remove();
    }
  }

  async shuffleList() {
    const listContainer = document.getElementById("listContainer");
    const items = Array.from(listContainer.children);

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        const shuffled = this.shuffleArray([...items]);
        listContainer.innerHTML = "";
        shuffled.forEach((item) => listContainer.appendChild(item));
      });
    } else {
      const shuffled = this.shuffleArray([...items]);
      listContainer.innerHTML = "";
      shuffled.forEach((item) => listContainer.appendChild(item));
    }
  }

  async sortList() {
    const listContainer = document.getElementById("listContainer");
    const items = Array.from(listContainer.children);

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        const sorted = items.sort((a, b) => {
          const textA = a.querySelector(".list-item-text").textContent;
          const textB = b.querySelector(".list-item-text").textContent;
          return textA.localeCompare(textB);
        });
        listContainer.innerHTML = "";
        sorted.forEach((item) => listContainer.appendChild(item));
      });
    } else {
      const sorted = items.sort((a, b) => {
        const textA = a.querySelector(".list-item-text").textContent;
        const textB = b.querySelector(".list-item-text").textContent;
        return textA.localeCompare(textB);
      });
      listContainer.innerHTML = "";
      sorted.forEach((item) => listContainer.appendChild(item));
    }
  }

  async clearList() {
    const listContainer = document.getElementById("listContainer");

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        listContainer.innerHTML =
          '<div class="list-placeholder">리스트가 비어있습니다</div>';
      });
    } else {
      listContainer.innerHTML =
        '<div class="list-placeholder">리스트가 비어있습니다</div>';
    }
  }

  // Cards 메서드들
  generateCards() {
    const cardDeck = document.getElementById("cardDeck");
    if (!cardDeck) return;

    const suits = ["♠️", "♥️", "♦️", "♣️"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    cardDeck.innerHTML = "";

    for (let i = 0; i < 12; i++) {
      const suit = suits[Math.floor(i / 3)];
      const value = values[i % 13];

      const card = document.createElement("div");
      card.className = "playing-card";
      card.dataset.suit = suit;
      card.dataset.value = value;
      card.innerHTML = `
        <div class="card-front">
          <div class="card-value">${value}</div>
          <div class="card-suit">${suit}</div>
        </div>
        <div class="card-back">🎴</div>
      `;

      card.addEventListener("click", () => {
        this.flipCard(card);
      });

      cardDeck.appendChild(card);
    }
  }

  async handleCardAction(action) {
    switch (action) {
      case "shuffle":
        await this.shuffleCards();
        break;
      case "flipAll":
        await this.flipAllCards();
        break;
      case "deal":
        await this.dealCards();
        break;
      case "collect":
        await this.collectCards();
        break;
    }
  }

  async shuffleCards() {
    const cardDeck = document.getElementById("cardDeck");
    const cards = Array.from(cardDeck.children);

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        const shuffled = this.shuffleArray([...cards]);
        cardDeck.innerHTML = "";
        shuffled.forEach((card) => cardDeck.appendChild(card));
      });
    } else {
      const shuffled = this.shuffleArray([...cards]);
      cardDeck.innerHTML = "";
      shuffled.forEach((card) => cardDeck.appendChild(card));
    }
  }

  async flipCard(card) {
    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        card.classList.toggle("flipped");
      });
    } else {
      card.classList.toggle("flipped");
    }
  }

  async flipAllCards() {
    const cards = document.querySelectorAll(".playing-card");

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        cards.forEach((card) => {
          card.classList.toggle("flipped");
        });
      });
    } else {
      cards.forEach((card) => {
        card.classList.toggle("flipped");
      });
    }
  }

  async dealCards() {
    const cardDeck = document.getElementById("cardDeck");
    const cards = Array.from(cardDeck.children);
    const playerHands = document.querySelectorAll(".hand-cards");

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        cards.forEach((card, index) => {
          if (index < 6) {
            const playerIndex = index % 2;
            playerHands[playerIndex].appendChild(card);
          }
        });
      });
    } else {
      cards.forEach((card, index) => {
        if (index < 6) {
          const playerIndex = index % 2;
          playerHands[playerIndex].appendChild(card);
        }
      });
    }
  }

  async collectCards() {
    const cardDeck = document.getElementById("cardDeck");
    const playerHands = document.querySelectorAll(".hand-cards");

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        playerHands.forEach((hand) => {
          Array.from(hand.children).forEach((card) => {
            cardDeck.appendChild(card);
          });
        });
      });
    } else {
      playerHands.forEach((hand) => {
        Array.from(hand.children).forEach((card) => {
          cardDeck.appendChild(card);
        });
      });
    }
  }

  // Demo 메서드들
  async runDemo(demoType) {
    switch (demoType) {
      case "theme":
        await this.runThemeDemo();
        break;
      case "layout":
        await this.runLayoutDemo();
        break;
      case "sequence":
        await this.runSequenceDemo();
        break;
    }
  }

  async runThemeDemo() {
    const themes = ["light", "dark", "auto"];
    let currentIndex = 0;

    for (let i = 0; i < 6; i++) {
      await this.switchTheme(themes[currentIndex]);
      currentIndex = (currentIndex + 1) % themes.length;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.showNotification("테마 전환 데모가 완료되었습니다", "success");
  }

  async runLayoutDemo() {
    const contentArea = document.getElementById("contentArea");
    const originalLayout = contentArea.style.gridTemplateColumns;

    const layouts = [
      "1fr",
      "1fr 1fr",
      "1fr 2fr 1fr",
      "repeat(4, 1fr)",
      originalLayout || "1fr",
    ];

    for (const layout of layouts) {
      if (document.startViewTransition) {
        await this.performViewTransition(() => {
          contentArea.style.gridTemplateColumns = layout;
        });
      } else {
        contentArea.style.gridTemplateColumns = layout;
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    this.showNotification("레이아웃 전환 데모가 완료되었습니다", "success");
  }

  async runSequenceDemo() {
    const featureCards = document.querySelectorAll(".feature-card");

    for (let i = 0; i < featureCards.length; i++) {
      if (document.startViewTransition) {
        await this.performViewTransition(() => {
          featureCards[i].style.viewTransitionName = `sequence-${i}`;
          featureCards[i].style.transform = "scale(1.2) rotate(5deg)";
          featureCards[i].style.background = this.getRandomGradient();
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (document.startViewTransition) {
        await this.performViewTransition(() => {
          featureCards[i].style.transform = "";
          featureCards[i].style.background = "";
          featureCards[i].style.viewTransitionName = "";
        });
      }
    }

    this.showNotification("시퀀스 애니메이션 데모가 완료되었습니다", "success");
  }

  // Theme 메서드들
  async switchTheme(theme) {
    if (this.themeMode === theme) return;

    const themeBtns = document.querySelectorAll(".theme-btn");
    themeBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.theme === theme) {
        btn.classList.add("active");
      }
    });

    if (document.startViewTransition) {
      await this.performViewTransition(() => {
        document.documentElement.setAttribute("data-theme", theme);
        this.themeMode = theme;
      });
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      this.themeMode = theme;
    }
  }

  // Settings 메서드들
  applyAnimationPreset(preset) {
    const presets = {
      smooth: { duration: 600, easing: "ease-out" },
      snappy: { duration: 200, easing: "ease-in" },
      bouncy: {
        duration: 800,
        easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      dramatic: { duration: 1200, easing: "ease-in-out" },
    };

    const config = presets[preset];
    if (config) {
      document.getElementById("transitionDuration").value = config.duration;
      document.getElementById(
        "durationValue"
      ).textContent = `${config.duration}ms`;
      document.getElementById("easingFunction").value = config.easing;

      this.updateTransitionDuration(config.duration);
      this.updateEasingFunction(config.easing);
    }

    // 프리셋 버튼 활성화
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.preset === preset) {
        btn.classList.add("active");
      }
    });

    this.showNotification(`${preset} 프리셋이 적용되었습니다`, "success");
  }

  handleSettingsAction(action) {
    switch (action) {
      case "export":
        this.exportSettings();
        break;
      case "import":
        document.getElementById("settingsFile").click();
        break;
      case "reset":
        this.resetSettings();
        break;
    }
  }

  exportSettings() {
    const settings = {
      theme: this.themeMode,
      duration: document.getElementById("transitionDuration").value,
      easing: document.getElementById("easingFunction").value,
      reduceMotion: document.getElementById("reduceMotion").checked,
      enableSounds: document.getElementById("enableSounds").checked,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `view-transitions-settings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    this.showNotification("설정이 내보내졌습니다", "success");
  }

  resetSettings() {
    document.getElementById("transitionDuration").value = 600;
    document.getElementById("durationValue").textContent = "600ms";
    document.getElementById("easingFunction").value = "ease";
    document.getElementById("reduceMotion").checked = false;
    document.getElementById("enableSounds").checked = false;

    this.switchTheme("light");
    this.showNotification("설정이 기본값으로 복원되었습니다", "success");
  }

  // History 메서드들
  handleHistoryAction(action) {
    switch (action) {
      case "clear":
        this.clearTransitionHistory();
        break;
      case "replayLast":
        this.replayLastTransition();
        break;
    }
  }

  clearTransitionHistory() {
    this.transitionHistory = [];
    this.updateHistoryDisplay();
    this.showNotification("히스토리가 삭제되었습니다", "info");
  }

  async replayLastTransition() {
    if (this.transitionHistory.length === 0) {
      this.showNotification("재생할 전환이 없습니다", "warning");
      return;
    }

    const lastTransition =
      this.transitionHistory[this.transitionHistory.length - 1];
    await this.performDemoTransition(lastTransition.type);
  }

  recordTransition(type, duration, success) {
    const transition = {
      id: this.animationCounter++,
      type,
      duration,
      success,
      timestamp: new Date(),
    };

    this.transitionHistory.push(transition);
    this.performance.transitions++;

    if (success) {
      this.performance.averageDuration =
        (this.performance.averageDuration * (this.performance.transitions - 1) +
          duration) /
        this.performance.transitions;
    } else {
      this.performance.successRate =
        (this.transitionHistory.filter((t) => t.success).length /
          this.transitionHistory.length) *
        100;
    }

    this.updateHistoryDisplay();
    this.updatePerformanceStats();
  }

  updateHistoryDisplay() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    if (this.transitionHistory.length === 0) {
      historyList.innerHTML =
        '<div class="history-placeholder">전환 히스토리가 여기에 표시됩니다</div>';
      return;
    }

    const recentHistory = this.transitionHistory.slice(-10).reverse();
    historyList.innerHTML = recentHistory
      .map(
        (transition) => `
      <div class="history-item ${transition.success ? "success" : "error"}">
        <div class="history-info">
          <span class="history-type">${transition.type}</span>
          <span class="history-duration">${transition.duration.toFixed(
            1
          )}ms</span>
          <span class="history-status">${
            transition.success ? "✅" : "❌"
          }</span>
        </div>
        <div class="history-time">${transition.timestamp.toLocaleTimeString()}</div>
      </div>
    `
      )
      .join("");
  }

  // Performance 메서드들
  updatePerformanceStats() {
    document.getElementById("totalTransitions").textContent =
      this.performance.transitions;
    document.getElementById(
      "averageDuration"
    ).textContent = `${this.performance.averageDuration.toFixed(1)}ms`;
    document.getElementById(
      "successRate"
    ).textContent = `${this.performance.successRate.toFixed(1)}%`;
    document.getElementById("isTransitioning").textContent = this
      .isTransitioning
      ? "예"
      : "아니오";
  }

  updateTransitionDuration(duration) {
    document.documentElement.style.setProperty(
      "--transition-duration",
      `${duration}ms`
    );
  }

  updateEasingFunction(easing) {
    document.documentElement.style.setProperty("--transition-easing", easing);
  }

  // Tab 메서드들
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

  // Utility 메서드들
  getRandomGradient() {
    const colors = [
      ["#FF6B6B", "#4ECDC4"],
      ["#45B7D1", "#96CEB4"],
      ["#FECA57", "#FF9FF3"],
      ["#54A0FF", "#5F27CD"],
      ["#00D2D3", "#FF9F43"],
      ["#10AC84", "#EE5A24"],
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(135deg, ${randomColor[0]}, ${randomColor[1]})`;
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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
}

// 전역 접근을 위한 설정
window.viewTransitionsAPI = null;

// 초기화
function initViewTransitionsAPI() {
  console.log("🚀 View Transitions API 초기화 함수 호출");
  window.viewTransitionsAPI = new ViewTransitionsAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initViewTransitionsAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initViewTransitionsAPI();
}

console.log(
  "📄 View Transitions API 스크립트 로드 완료, readyState:",
  document.readyState
);
