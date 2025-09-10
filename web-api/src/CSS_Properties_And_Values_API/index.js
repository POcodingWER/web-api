import "./style.css";

console.log("🎨 CSS Properties And Values API 스크립트 시작!");

class CSSPropertiesAndValuesAPI {
  constructor() {
    this.registeredProperties = new Map();
    this.propertyHistory = [];
    this.animationInstances = new Map();
    this.isAnimating = false;
    this.editorMode = "visual";
    this.init();
  }

  init() {
    console.log("🎨 CSS Properties And Values API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.registerDefaultProperties();
    this.setupLiveEditor();
    console.log("✅ CSS Properties And Values API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 CSS Properties And Values API 지원 여부 확인 중...");

    const support = {
      registerProperty: !!(CSS && CSS.registerProperty),
      customProperties: CSS.supports("--custom-property", "value"),
      animateCustomProperties: CSS.supports("animation", "custom-property 1s"),
      cssHoudini: !!(CSS && CSS.paintWorklet),
      cssTypedOM: !!(CSS && CSS.number),
    };

    console.log("CSS Properties And Values API 지원 상태:", support);

    if (!support.registerProperty) {
      this.showNotification(
        "이 브라우저는 CSS.registerProperty()를 지원하지 않습니다",
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
      <div class="css-properties-container">
        <header class="css-properties-header">
          <h1>🎨 CSS Properties And Values API</h1>
          <p>커스텀 CSS 속성 등록 및 타입 안전성 보장</p>
          <div class="api-support">
            <div class="support-badge ${
              support.registerProperty ? "supported" : "unsupported"
            }">
              ${
                support.registerProperty
                  ? "✅ CSS.registerProperty"
                  : "❌ CSS.registerProperty"
              }
            </div>
            <div class="support-badge ${
              support.customProperties ? "supported" : "unsupported"
            }">
              ${
                support.customProperties
                  ? "✅ Custom Properties"
                  : "❌ Custom Properties"
              }
            </div>
            <div class="support-badge ${
              support.animateCustomProperties ? "supported" : "unsupported"
            }">
              ${
                support.animateCustomProperties
                  ? "✅ Animate Properties"
                  : "❌ Animate Properties"
              }
            </div>
            <div class="support-badge ${
              support.cssHoudini ? "supported" : "unsupported"
            }">
              ${support.cssHoudini ? "✅ CSS Houdini" : "❌ CSS Houdini"}
            </div>
          </div>
        </header>

        <main class="css-properties-main">
          <!-- Property Registration Panel -->
          <div class="registration-panel">
            <div class="panel-card primary">
              <h2>🔧 속성 등록</h2>
              
              <div class="property-form">
                <div class="form-group">
                  <label for="propertyName">속성 이름:</label>
                  <input 
                    type="text" 
                    id="propertyName" 
                    placeholder="--my-property"
                    value="--my-color"
                  >
                </div>

                <div class="form-group">
                  <label for="propertyType">속성 타입:</label>
                  <select id="propertyType">
                    <option value="<color>">색상 (&lt;color&gt;)</option>
                    <option value="<length>">길이 (&lt;length&gt;)</option>
                    <option value="<percentage>">백분율 (&lt;percentage&gt;)</option>
                    <option value="<number>">숫자 (&lt;number&gt;)</option>
                    <option value="<angle>">각도 (&lt;angle&gt;)</option>
                    <option value="<time>">시간 (&lt;time&gt;)</option>
                    <option value="<integer>">정수 (&lt;integer&gt;)</option>
                    <option value="<length-percentage>">길이-백분율</option>
                    <option value="*">모든 타입 (*)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="initialValue">초기값:</label>
                  <input 
                    type="text" 
                    id="initialValue" 
                    placeholder="예: #ff0000, 100px, 0.5"
                    value="#667eea"
                  >
                </div>

                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="inherits" checked>
                    <span class="checkmark"></span>
                    상속 가능 (inherits)
                  </label>
                </div>

                <div class="form-actions">
                  <button id="registerProperty" class="btn-primary">
                    ➕ 속성 등록
                  </button>
                  <button id="unregisterProperty" class="btn-danger">
                    ➖ 속성 해제
                  </button>
                  <button id="validateProperty" class="btn-secondary">
                    ✅ 유효성 검사
                  </button>
                  <button id="clearForm" class="btn-accent">
                    🗑️ 폼 초기화
                  </button>
                </div>
              </div>
            </div>

            <div class="panel-card">
              <h2>📋 등록된 속성 목록</h2>
              
              <div class="properties-list" id="propertiesList">
                <div class="list-placeholder">
                  등록된 속성이 없습니다
                </div>
              </div>

              <div class="list-actions">
                <button id="exportProperties" class="btn-secondary">
                  📤 속성 내보내기
                </button>
                <button id="importProperties" class="btn-secondary">
                  📥 속성 가져오기
                </button>
                <button id="clearAllProperties" class="btn-danger">
                  🗑️ 전체 삭제
                </button>
              </div>
              <input type="file" id="propertiesFile" accept=".json" style="display: none;">
            </div>
          </div>

          <!-- Live Demo Section -->
          <div class="demo-section">
            <div class="panel-card full-width">
              <h2>🎬 실시간 데모</h2>
              
              <div class="demo-tabs">
                <button class="demo-tab-btn active" data-demo="color">🎨 색상 애니메이션</button>
                <button class="demo-tab-btn" data-demo="size">📏 크기 애니메이션</button>
                <button class="demo-tab-btn" data-demo="number">🔢 숫자 애니메이션</button>
                <button class="demo-tab-btn" data-demo="complex">🌟 복합 애니메이션</button>
              </div>

              <div class="demo-content">
                <!-- Color Demo -->
                <div class="demo-panel active" id="colorDemo">
                  <div class="demo-controls">
                    <h3>🎨 색상 속성 데모</h3>
                    <div class="color-controls">
                      <div class="control-group">
                        <label for="startColor">시작 색상:</label>
                        <input type="color" id="startColor" value="#667eea">
                      </div>
                      <div class="control-group">
                        <label for="endColor">끝 색상:</label>
                        <input type="color" id="endColor" value="#764ba2">
                      </div>
                      <div class="control-group">
                        <label for="colorDuration">애니메이션 시간:</label>
                        <input type="range" id="colorDuration" min="500" max="5000" value="2000" step="100">
                        <span id="colorDurationValue">2000ms</span>
                      </div>
                      <button id="animateColor" class="btn-primary">🎨 색상 애니메이션 시작</button>
                    </div>
                  </div>
                  
                  <div class="demo-preview">
                    <div class="color-demo-box" id="colorDemoBox">
                      <div class="demo-label">색상 변화를 관찰하세요</div>
                    </div>
                  </div>
                </div>

                <!-- Size Demo -->
                <div class="demo-panel" id="sizeDemo">
                  <div class="demo-controls">
                    <h3>📏 크기 속성 데모</h3>
                    <div class="size-controls">
                      <div class="control-group">
                        <label for="startSize">시작 크기:</label>
                        <input type="range" id="startSize" min="50" max="300" value="100">
                        <span id="startSizeValue">100px</span>
                      </div>
                      <div class="control-group">
                        <label for="endSize">끝 크기:</label>
                        <input type="range" id="endSize" min="50" max="300" value="200">
                        <span id="endSizeValue">200px</span>
                      </div>
                      <div class="control-group">
                        <label for="sizeDuration">애니메이션 시간:</label>
                        <input type="range" id="sizeDuration" min="500" max="5000" value="1500" step="100">
                        <span id="sizeDurationValue">1500ms</span>
                      </div>
                      <button id="animateSize" class="btn-accent">📏 크기 애니메이션 시작</button>
                    </div>
                  </div>
                  
                  <div class="demo-preview">
                    <div class="size-demo-box" id="sizeDemoBox">
                      <div class="demo-label">크기 변화를 관찰하세요</div>
                    </div>
                  </div>
                </div>

                <!-- Number Demo -->
                <div class="demo-panel" id="numberDemo">
                  <div class="demo-controls">
                    <h3>🔢 숫자 속성 데모</h3>
                    <div class="number-controls">
                      <div class="control-group">
                        <label for="startNumber">시작 숫자:</label>
                        <input type="number" id="startNumber" value="0" min="0" max="100">
                      </div>
                      <div class="control-group">
                        <label for="endNumber">끝 숫자:</label>
                        <input type="number" id="endNumber" value="100" min="0" max="100">
                      </div>
                      <div class="control-group">
                        <label for="numberDuration">애니메이션 시간:</label>
                        <input type="range" id="numberDuration" min="1000" max="5000" value="3000" step="100">
                        <span id="numberDurationValue">3000ms</span>
                      </div>
                      <button id="animateNumber" class="btn-warning">🔢 숫자 애니메이션 시작</button>
                    </div>
                  </div>
                  
                  <div class="demo-preview">
                    <div class="number-demo-box" id="numberDemoBox">
                      <div class="demo-counter" id="demoCounter">0</div>
                      <div class="demo-label">숫자 카운팅 애니메이션</div>
                      <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Complex Demo -->
                <div class="demo-panel" id="complexDemo">
                  <div class="demo-controls">
                    <h3>🌟 복합 애니메이션 데모</h3>
                    <div class="complex-controls">
                      <button id="waveAnimation" class="btn-success">🌊 웨이브 효과</button>
                      <button id="pulseAnimation" class="btn-danger">💓 펄스 효과</button>
                      <button id="rainbowAnimation" class="btn-accent">🌈 무지개 효과</button>
                      <button id="morphAnimation" class="btn-warning">🎭 변형 효과</button>
                      <button id="stopAllAnimations" class="btn-secondary">⏹️ 모든 애니메이션 정지</button>
                    </div>
                  </div>
                  
                  <div class="demo-preview">
                    <div class="complex-demo-area">
                      <div class="wave-box" id="waveBox">WAVE</div>
                      <div class="pulse-box" id="pulseBox">PULSE</div>
                      <div class="rainbow-box" id="rainbowBox">RAINBOW</div>
                      <div class="morph-box" id="morphBox">MORPH</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Editor Section -->
          <div class="editor-section">
            <div class="panel-card full-width">
              <h2>⚡ 실시간 CSS 속성 에디터</h2>
              
              <div class="editor-tabs">
                <button class="editor-tab-btn active" data-editor="visual">🎨 비주얼 에디터</button>
                <button class="editor-tab-btn" data-editor="code">💻 코드 에디터</button>
                <button class="editor-tab-btn" data-editor="inspector">🔍 속성 인스펙터</button>
              </div>

              <div class="editor-content">
                <!-- Visual Editor -->
                <div class="editor-panel active" id="visualEditor">
                  <div class="visual-controls">
                    <div class="property-builder">
                      <h3>🛠️ 속성 빌더</h3>
                      <div class="builder-grid">
                        <div class="builder-section">
                          <h4>기본 설정</h4>
                          <div class="builder-controls">
                            <input type="text" id="builderName" placeholder="--property-name">
                            <select id="builderSyntax">
                              <option value="<color>">색상</option>
                              <option value="<length>">길이</option>
                              <option value="<number>">숫자</option>
                              <option value="<percentage>">백분율</option>
                              <option value="<angle>">각도</option>
                            </select>
                            <input type="text" id="builderInitial" placeholder="초기값">
                            <label class="checkbox-label">
                              <input type="checkbox" id="builderInherits">
                              <span class="checkmark"></span>
                              상속
                            </label>
                          </div>
                        </div>

                        <div class="builder-section">
                          <h4>애니메이션 설정</h4>
                          <div class="animation-controls">
                            <input type="text" id="animationTarget" placeholder="CSS 선택자" value=".demo-target">
                            <input type="text" id="animationStart" placeholder="시작값">
                            <input type="text" id="animationEnd" placeholder="끝값">
                            <input type="range" id="animationDuration" min="500" max="5000" value="2000">
                            <span id="animationDurationValue">2000ms</span>
                          </div>
                        </div>

                        <div class="builder-section">
                          <h4>미리보기</h4>
                          <div class="builder-preview">
                            <div class="demo-target" id="demoTarget">
                              데모 요소
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="builder-actions">
                        <button id="registerBuilderProperty" class="btn-primary">
                          ➕ 속성 등록 & 적용
                        </button>
                        <button id="previewAnimation" class="btn-accent">
                          👁️ 애니메이션 미리보기
                        </button>
                        <button id="generateCode" class="btn-secondary">
                          💻 코드 생성
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Code Editor -->
                <div class="editor-panel" id="codeEditor">
                  <div class="code-controls">
                    <h3>💻 CSS 코드 에디터</h3>
                    <div class="editor-toolbar">
                      <button id="executeCode" class="btn-primary">▶️ 실행</button>
                      <button id="formatCode" class="btn-secondary">🎨 포맷</button>
                      <button id="clearCode" class="btn-danger">🗑️ 초기화</button>
                      <button id="loadExample" class="btn-accent">📖 예제 로드</button>
                    </div>
                  </div>
                  
                  <div class="code-editor-area">
                    <textarea id="cssCodeEditor" placeholder="/* CSS 코드를 입력하세요... */">
/* 예제: 커스텀 색상 속성 등록 */
CSS.registerProperty({
  name: '--demo-color',
  syntax: '<color>',
  initialValue: '#667eea',
  inherits: false
});

/* CSS에서 사용 */
.demo-element {
  background: var(--demo-color);
  transition: --demo-color 1s ease;
}

.demo-element:hover {
  --demo-color: #764ba2;
}</textarea>
                  </div>
                  
                  <div class="code-preview" id="codePreview">
                    <div class="preview-label">코드 미리보기 결과:</div>
                    <div class="demo-element" id="codeDemo">
                      코드 에디터 데모 요소
                    </div>
                  </div>
                </div>

                <!-- Inspector -->
                <div class="editor-panel" id="inspector">
                  <div class="inspector-controls">
                    <h3>🔍 속성 인스펙터</h3>
                    <div class="inspector-filters">
                      <select id="inspectorFilter">
                        <option value="all">모든 속성</option>
                        <option value="registered">등록된 속성</option>
                        <option value="animated">애니메이션 중</option>
                        <option value="color">색상 속성</option>
                        <option value="length">길이 속성</option>
                        <option value="number">숫자 속성</option>
                      </select>
                      <button id="refreshInspector" class="btn-secondary">🔄 새로고침</button>
                    </div>
                  </div>
                  
                  <div class="inspector-content" id="inspectorContent">
                    <!-- 속성 인스펙터 내용이 동적으로 생성됩니다 -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Presets Section -->
          <div class="presets-section">
            <div class="panel-card">
              <h2>🎯 프리셋 갤러리</h2>
              
              <div class="preset-categories">
                <button class="category-btn active" data-category="color">🎨 색상</button>
                <button class="category-btn" data-category="layout">📐 레이아웃</button>
                <button class="category-btn" data-category="animation">🎬 애니메이션</button>
                <button class="category-btn" data-category="interactive">🖱️ 인터랙티브</button>
              </div>

              <div class="presets-grid" id="presetsGrid">
                <!-- 프리셋들이 동적으로 생성됩니다 -->
              </div>
            </div>

            <div class="panel-card">
              <h2>📊 성능 분석</h2>
              
              <div class="performance-metrics">
                <div class="metric-group">
                  <div class="metric-item">
                    <span class="metric-label">등록된 속성:</span>
                    <span class="metric-value" id="registeredCount">0</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">활성 애니메이션:</span>
                    <span class="metric-value" id="activeAnimations">0</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">메모리 사용량:</span>
                    <span class="metric-value" id="memoryUsage">-</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">성능 점수:</span>
                    <span class="metric-value" id="performanceScore">100</span>
                  </div>
                </div>

                <div class="performance-chart">
                  <canvas id="performanceChart" width="300" height="150"></canvas>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Examples Section -->
        <section class="examples-section">
          <h2>💡 사용 예제</h2>
          
          <div class="example-tabs">
            <button class="tab-btn active" data-tab="basic">기본 사용법</button>
            <button class="tab-btn" data-tab="advanced">고급 기법</button>
            <button class="tab-btn" data-tab="animation">애니메이션</button>
            <button class="tab-btn" data-tab="houdini">Houdini 연동</button>
          </div>

          <div class="example-content">
            <div class="tab-content active" id="tab-basic">
              <h3>기본 속성 등록</h3>
              <pre><code>// 색상 속성 등록
CSS.registerProperty({
  name: '--my-color',
  syntax: '<color>',
  initialValue: '#000000',
  inherits: false
});

// CSS에서 사용
.element {
  background: var(--my-color);
  transition: --my-color 0.5s ease;
}

.element:hover {
  --my-color: #ff0000;
}

// JavaScript에서 동적 변경
element.style.setProperty('--my-color', '#00ff00');</code></pre>
            </div>

            <div class="tab-content" id="tab-advanced">
              <h3>고급 속성 관리</h3>
              <pre><code>// 복합 속성 등록
CSS.registerProperty({
  name: '--gradient-position',
  syntax: '<percentage>',
  initialValue: '0%',
  inherits: false
});

CSS.registerProperty({
  name: '--rotation-angle',
  syntax: '<angle>', 
  initialValue: '0deg',
  inherits: false
});

// 조건부 속성 등록
function registerConditionalProperty(name, syntax, initial) {
  try {
    CSS.registerProperty({
      name: name,
      syntax: syntax,
      initialValue: initial,
      inherits: false
    });
    console.log(\`속성 \${name} 등록 성공\`);
  } catch (error) {
    console.warn(\`속성 \${name} 등록 실패:\`, error);
  }
}

// 속성 존재 확인
function isPropertyRegistered(propertyName) {
  try {
    CSS.registerProperty({
      name: propertyName,
      syntax: '*',
      initialValue: '',
      inherits: false
    });
    return false; // 등록되지 않음
  } catch (error) {
    return true; // 이미 등록됨
  }
}</code></pre>
            </div>

            <div class="tab-content" id="tab-animation">
              <h3>애니메이션 활용</h3>
              <pre><code>// 길이 속성으로 크기 애니메이션
CSS.registerProperty({
  name: '--box-size',
  syntax: '<length>',
  initialValue: '100px',
  inherits: false
});

.animated-box {
  width: var(--box-size);
  height: var(--box-size);
  animation: grow 2s ease-in-out infinite alternate;
}

@keyframes grow {
  from { --box-size: 100px; }
  to { --box-size: 200px; }
}

// 숫자 속성으로 카운터 애니메이션
CSS.registerProperty({
  name: '--counter',
  syntax: '<integer>',
  initialValue: '0',
  inherits: false
});

.counter::before {
  content: counter(--counter);
  animation: count-up 3s ease-out;
}

@keyframes count-up {
  from { --counter: 0; }
  to { --counter: 100; }
}

// 각도 속성으로 회전 애니메이션
CSS.registerProperty({
  name: '--rotate-angle',
  syntax: '<angle>',
  initialValue: '0deg',
  inherits: false
});

.rotating-element {
  transform: rotate(var(--rotate-angle));
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { --rotate-angle: 0deg; }
  to { --rotate-angle: 360deg; }
}</code></pre>
            </div>

            <div class="tab-content" id="tab-houdini">
              <h3>CSS Houdini 연동</h3>
              <pre><code>// Paint Worklet과 연동
CSS.registerProperty({
  name: '--gradient-angle',
  syntax: '<angle>',
  initialValue: '0deg',
  inherits: false
});

// Paint Worklet 등록 (별도 파일)
CSS.paintWorklet.addModule('gradient-worklet.js');

.houdini-element {
  background: paint(gradient-paint, var(--gradient-angle));
  animation: rotate-gradient 4s linear infinite;
}

@keyframes rotate-gradient {
  from { --gradient-angle: 0deg; }
  to { --gradient-angle: 360deg; }
}

// Animation Worklet과 연동
CSS.animationWorklet.addModule('scroll-animation.js');

CSS.registerProperty({
  name: '--scroll-progress',
  syntax: '<number>',
  initialValue: '0',
  inherits: false
});

.scroll-driven {
  animation: scroll-timeline;
  animation-timeline: scroll();
}

// Layout Worklet 예제
CSS.layoutWorklet.addModule('masonry-layout.js');

CSS.registerProperty({
  name: '--column-count',
  syntax: '<integer>',
  initialValue: '3',
  inherits: false
});

.masonry-container {
  display: layout(masonry);
  --column-count: 4;
}</code></pre>
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
              <div class="browser-version supported">78+ ✅</div>
            </div>
            <div class="browser-item">
              <div class="browser-icon">🦊</div>
              <div class="browser-name">Firefox</div>
              <div class="browser-version unsupported">❌</div>
            </div>
            <div class="browser-item">
              <div class="browser-icon">🧭</div>
              <div class="browser-name">Safari</div>
              <div class="browser-version partial">16.4+ ⚠️</div>
            </div>
            <div class="browser-item">
              <div class="browser-icon">⚡</div>
              <div class="browser-name">Edge</div>
              <div class="browser-version supported">79+ ✅</div>
            </div>
          </div>

          <div class="compatibility-info">
            <h3>📝 호환성 정보</h3>
            <div class="compatibility-details">
              <div class="compatibility-item">
                <h4>✅ 완전 지원</h4>
                <ul>
                  <li>Chrome 78+ (2019년 10월)</li>
                  <li>Edge 79+ (Chromium 기반)</li>
                  <li>Opera 65+ (Chromium 기반)</li>
                </ul>
              </div>
              <div class="compatibility-item">
                <h4>⚠️ 부분 지원</h4>
                <ul>
                  <li>Safari 16.4+ (일부 syntax만 지원)</li>
                  <li>iOS Safari 16.4+</li>
                </ul>
              </div>
              <div class="compatibility-item">
                <h4>❌ 미지원</h4>
                <ul>
                  <li>Firefox (아직 구현되지 않음)</li>
                  <li>Internet Explorer</li>
                  <li>이전 버전 브라우저들</li>
                </ul>
              </div>
            </div>
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

    // 속성 등록 관련
    const registerBtn = document.getElementById("registerProperty");
    if (registerBtn) {
      registerBtn.addEventListener("click", () => this.registerProperty());
    }

    const unregisterBtn = document.getElementById("unregisterProperty");
    if (unregisterBtn) {
      unregisterBtn.addEventListener("click", () => this.unregisterProperty());
    }

    const validateBtn = document.getElementById("validateProperty");
    if (validateBtn) {
      validateBtn.addEventListener("click", () => this.validateProperty());
    }

    const clearFormBtn = document.getElementById("clearForm");
    if (clearFormBtn) {
      clearFormBtn.addEventListener("click", () => this.clearForm());
    }

    // 데모 탭 버튼들
    const demoTabBtns = document.querySelectorAll(".demo-tab-btn");
    demoTabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const demo = e.target.dataset.demo;
        this.switchDemoTab(demo);
      });
    });

    // 애니메이션 버튼들
    const animationBtns = [
      "animateColor",
      "animateSize",
      "animateNumber",
      "waveAnimation",
      "pulseAnimation",
      "rainbowAnimation",
      "morphAnimation",
      "stopAllAnimations",
    ];

    animationBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId
            .replace("Animation", "")
            .replace("animate", "")
            .toLowerCase();
          this.handleAnimation(action);
        });
      }
    });

    // 슬라이더 이벤트들
    const sliders = [
      { id: "colorDuration", target: "colorDurationValue", suffix: "ms" },
      { id: "sizeDuration", target: "sizeDurationValue", suffix: "ms" },
      { id: "numberDuration", target: "numberDurationValue", suffix: "ms" },
      { id: "startSize", target: "startSizeValue", suffix: "px" },
      { id: "endSize", target: "endSizeValue", suffix: "px" },
      {
        id: "animationDuration",
        target: "animationDurationValue",
        suffix: "ms",
      },
    ];

    sliders.forEach(({ id, target, suffix }) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener("input", (e) => {
          const valueDisplay = document.getElementById(target);
          if (valueDisplay) {
            valueDisplay.textContent = `${e.target.value}${suffix}`;
          }
        });
      }
    });

    // 에디터 탭 버튼들
    const editorTabBtns = document.querySelectorAll(".editor-tab-btn");
    editorTabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const editor = e.target.dataset.editor;
        this.switchEditorTab(editor);
      });
    });

    // 빌더 버튼들
    const builderBtns = [
      "registerBuilderProperty",
      "previewAnimation",
      "generateCode",
    ];
    builderBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId.replace("Builder", "").replace("Property", "");
          this.handleBuilderAction(action);
        });
      }
    });

    // 코드 에디터 버튼들
    const codeEditorBtns = [
      "executeCode",
      "formatCode",
      "clearCode",
      "loadExample",
    ];
    codeEditorBtns.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId.replace("Code", "");
          this.handleCodeEditorAction(action);
        });
      }
    });

    // 프리셋 카테고리 버튼들
    const categoryBtns = document.querySelectorAll(".category-btn");
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.target.dataset.category;
        this.switchPresetCategory(category);
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

    // 데이터 관리 버튼들
    const dataButtons = [
      "exportProperties",
      "importProperties",
      "clearAllProperties",
    ];
    dataButtons.forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          const action = btnId.replace("Properties", "");
          this.handleDataAction(action);
        });
      }
    });

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  registerDefaultProperties() {
    console.log("🔧 기본 속성들 등록 중...");

    const defaultProperties = [
      {
        name: "--demo-color",
        syntax: "<color>",
        initialValue: "#667eea",
        inherits: false,
      },
      {
        name: "--demo-size",
        syntax: "<length>",
        initialValue: "100px",
        inherits: false,
      },
      {
        name: "--demo-number",
        syntax: "<number>",
        initialValue: "0",
        inherits: false,
      },
      {
        name: "--demo-angle",
        syntax: "<angle>",
        initialValue: "0deg",
        inherits: false,
      },
      {
        name: "--demo-percentage",
        syntax: "<percentage>",
        initialValue: "50%",
        inherits: false,
      },
    ];

    defaultProperties.forEach((prop) => {
      this.registerCSSProperty(
        prop.name,
        prop.syntax,
        prop.initialValue,
        prop.inherits
      );
    });

    this.updatePropertiesList();
    console.log("✅ 기본 속성 등록 완료");
  }

  registerProperty() {
    const name = document.getElementById("propertyName").value.trim();
    const syntax = document.getElementById("propertyType").value;
    const initialValue = document.getElementById("initialValue").value.trim();
    const inherits = document.getElementById("inherits").checked;

    if (!name) {
      this.showNotification("속성 이름을 입력해주세요", "warning");
      return;
    }

    if (!name.startsWith("--")) {
      this.showNotification("속성 이름은 '--'로 시작해야 합니다", "warning");
      return;
    }

    if (!initialValue) {
      this.showNotification("초기값을 입력해주세요", "warning");
      return;
    }

    this.registerCSSProperty(name, syntax, initialValue, inherits);
  }

  registerCSSProperty(name, syntax, initialValue, inherits) {
    if (!CSS || !CSS.registerProperty) {
      this.showNotification(
        "이 브라우저는 CSS.registerProperty()를 지원하지 않습니다",
        "error"
      );
      return false;
    }

    try {
      CSS.registerProperty({
        name: name,
        syntax: syntax,
        initialValue: initialValue,
        inherits: inherits,
      });

      const property = {
        name,
        syntax,
        initialValue,
        inherits,
        registered: Date.now(),
        animated: false,
      };

      this.registeredProperties.set(name, property);
      this.propertyHistory.push({
        action: "register",
        property: property,
        timestamp: Date.now(),
      });

      this.updatePropertiesList();
      this.updateMetrics();
      this.showNotification(`속성 '${name}'이 등록되었습니다`, "success");

      console.log("속성 등록 성공:", property);
      return true;
    } catch (error) {
      this.showNotification(`속성 등록 실패: ${error.message}`, "error");
      console.error("속성 등록 오류:", error);
      return false;
    }
  }

  unregisterProperty() {
    const name = document.getElementById("propertyName").value.trim();

    if (!name) {
      this.showNotification("해제할 속성 이름을 입력해주세요", "warning");
      return;
    }

    if (this.registeredProperties.has(name)) {
      this.registeredProperties.delete(name);
      this.propertyHistory.push({
        action: "unregister",
        property: { name },
        timestamp: Date.now(),
      });

      this.updatePropertiesList();
      this.updateMetrics();
      this.showNotification(`속성 '${name}'이 해제되었습니다`, "info");
    } else {
      this.showNotification("등록되지 않은 속성입니다", "warning");
    }
  }

  validateProperty() {
    const name = document.getElementById("propertyName").value.trim();
    const syntax = document.getElementById("propertyType").value;
    const initialValue = document.getElementById("initialValue").value.trim();

    if (!name || !initialValue) {
      this.showNotification("모든 필드를 입력해주세요", "warning");
      return;
    }

    // 기본 유효성 검사
    const validations = [
      {
        condition: !name.startsWith("--"),
        message: "속성 이름은 '--'로 시작해야 합니다",
      },
      {
        condition: name.length < 3,
        message: "속성 이름이 너무 짧습니다",
      },
      {
        condition: /[A-Z]/.test(name),
        message: "속성 이름에 대문자를 사용할 수 없습니다",
      },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        this.showNotification(validation.message, "error");
        return;
      }
    }

    // 타입별 초기값 검증
    if (this.validateInitialValue(syntax, initialValue)) {
      this.showNotification("속성이 유효합니다! ✅", "success");
    } else {
      this.showNotification(
        "초기값이 지정된 타입과 일치하지 않습니다",
        "error"
      );
    }
  }

  validateInitialValue(syntax, value) {
    switch (syntax) {
      case "<color>":
        return (
          /^#[0-9A-Fa-f]{6}$/.test(value) ||
          /^rgb\(/.test(value) ||
          /^hsl\(/.test(value)
        );
      case "<length>":
        return /^\d+(\.\d+)?(px|em|rem|vh|vw|%)$/.test(value);
      case "<percentage>":
        return /^\d+(\.\d+)?%$/.test(value);
      case "<number>":
        return /^-?\d+(\.\d+)?$/.test(value);
      case "<angle>":
        return /^\d+(\.\d+)?(deg|rad|grad|turn)$/.test(value);
      case "<time>":
        return /^\d+(\.\d+)?(s|ms)$/.test(value);
      case "<integer>":
        return /^-?\d+$/.test(value);
      default:
        return true; // "*" 타입이나 기타 경우
    }
  }

  clearForm() {
    document.getElementById("propertyName").value = "";
    document.getElementById("propertyType").value = "<color>";
    document.getElementById("initialValue").value = "";
    document.getElementById("inherits").checked = false;
  }

  // Demo Animation Methods
  handleAnimation(action) {
    switch (action) {
      case "color":
        this.animateColorProperty();
        break;
      case "size":
        this.animateSizeProperty();
        break;
      case "number":
        this.animateNumberProperty();
        break;
      case "wave":
        this.animateWaveEffect();
        break;
      case "pulse":
        this.animatePulseEffect();
        break;
      case "rainbow":
        this.animateRainbowEffect();
        break;
      case "morph":
        this.animateMorphEffect();
        break;
      case "stopall":
        this.stopAllAnimations();
        break;
    }
  }

  async animateColorProperty() {
    const startColor = document.getElementById("startColor").value;
    const endColor = document.getElementById("endColor").value;
    const duration = document.getElementById("colorDuration").value;

    // 임시 색상 속성 등록
    const propertyName = "--demo-color-animation";
    this.registerCSSProperty(propertyName, "<color>", startColor, false);

    const demoBox = document.getElementById("colorDemoBox");
    demoBox.style.setProperty(propertyName, startColor);
    demoBox.style.background = `var(${propertyName})`;
    demoBox.style.transition = `${propertyName} ${duration}ms ease-in-out`;

    // 애니메이션 시작
    setTimeout(() => {
      demoBox.style.setProperty(propertyName, endColor);
    }, 100);

    // 애니메이션 완료 후 초기화
    setTimeout(() => {
      demoBox.style.setProperty(propertyName, startColor);
    }, parseInt(duration) + 500);

    this.showNotification("색상 애니메이션이 시작되었습니다", "success");
  }

  async animateSizeProperty() {
    const startSize = document.getElementById("startSize").value;
    const endSize = document.getElementById("endSize").value;
    const duration = document.getElementById("sizeDuration").value;

    // 임시 크기 속성 등록
    const propertyName = "--demo-size-animation";
    this.registerCSSProperty(propertyName, "<length>", `${startSize}px`, false);

    const demoBox = document.getElementById("sizeDemoBox");
    demoBox.style.setProperty(propertyName, `${startSize}px`);
    demoBox.style.width = `var(${propertyName})`;
    demoBox.style.height = `var(${propertyName})`;
    demoBox.style.transition = `${propertyName} ${duration}ms ease-in-out`;

    // 애니메이션 시작
    setTimeout(() => {
      demoBox.style.setProperty(propertyName, `${endSize}px`);
    }, 100);

    // 애니메이션 완료 후 초기화
    setTimeout(() => {
      demoBox.style.setProperty(propertyName, `${startSize}px`);
    }, parseInt(duration) + 500);

    this.showNotification("크기 애니메이션이 시작되었습니다", "success");
  }

  async animateNumberProperty() {
    const startNumber = document.getElementById("startNumber").value;
    const endNumber = document.getElementById("endNumber").value;
    const duration = document.getElementById("numberDuration").value;

    // 숫자 속성 등록 및 애니메이션
    const propertyName = "--demo-counter-value";
    this.registerCSSProperty(propertyName, "<number>", startNumber, false);

    const counter = document.getElementById("demoCounter");
    const progressFill = document.getElementById("progressFill");

    // 초기 설정
    counter.textContent = startNumber;
    progressFill.style.width = "0%";
    progressFill.style.transition = `width ${duration}ms ease-out`;

    // 숫자 카운팅 애니메이션
    let currentNumber = parseInt(startNumber);
    const targetNumber = parseInt(endNumber);
    const totalSteps = Math.ceil(parseInt(duration) / 16); // 60fps 기준
    const increment = (targetNumber - currentNumber) / totalSteps;
    let step = 0;

    const countingInterval = setInterval(() => {
      step++;

      if (step >= totalSteps) {
        currentNumber = targetNumber;
        counter.textContent = targetNumber;
        progressFill.style.width = "100%";
        clearInterval(countingInterval);
      } else {
        currentNumber += increment;
        const displayNumber = Math.round(currentNumber);
        const progressPercent = Math.min(
          100,
          Math.max(0, (step / totalSteps) * 100)
        );

        counter.textContent = displayNumber;
        progressFill.style.width = `${progressPercent}%`;
      }
    }, 16); // ~60fps

    // CSS 속성도 함께 애니메이션
    counter.style.setProperty(propertyName, startNumber);
    counter.style.transition = `${propertyName} ${duration}ms ease-out`;

    setTimeout(() => {
      counter.style.setProperty(propertyName, endNumber);
    }, 50);

    this.showNotification("숫자 애니메이션이 시작되었습니다", "success");
  }

  animateWaveEffect() {
    this.registerCSSProperty("--wave-offset", "<percentage>", "0%", false);

    const waveBox = document.getElementById("waveBox");
    waveBox.style.animation = "wave-animation 2s ease-in-out infinite";

    this.animationInstances.set("wave", { element: waveBox, type: "wave" });
    this.showNotification("웨이브 애니메이션이 시작되었습니다", "success");
  }

  animatePulseEffect() {
    this.registerCSSProperty("--pulse-scale", "<number>", "1", false);

    const pulseBox = document.getElementById("pulseBox");
    pulseBox.style.animation = "pulse-animation 1.5s ease-in-out infinite";

    this.animationInstances.set("pulse", { element: pulseBox, type: "pulse" });
    this.showNotification("펄스 애니메이션이 시작되었습니다", "success");
  }

  animateRainbowEffect() {
    this.registerCSSProperty("--rainbow-hue", "<angle>", "0deg", false);

    const rainbowBox = document.getElementById("rainbowBox");
    rainbowBox.style.animation = "rainbow-animation 3s linear infinite";

    this.animationInstances.set("rainbow", {
      element: rainbowBox,
      type: "rainbow",
    });
    this.showNotification("무지개 애니메이션이 시작되었습니다", "success");
  }

  animateMorphEffect() {
    this.registerCSSProperty("--morph-radius", "<percentage>", "0%", false);
    this.registerCSSProperty("--morph-skew", "<angle>", "0deg", false);

    const morphBox = document.getElementById("morphBox");
    morphBox.style.animation = "morph-animation 4s ease-in-out infinite";

    this.animationInstances.set("morph", { element: morphBox, type: "morph" });
    this.showNotification("변형 애니메이션이 시작되었습니다", "success");
  }

  stopAllAnimations() {
    this.animationInstances.forEach((instance) => {
      instance.element.style.animation = "";
    });
    this.animationInstances.clear();
    this.showNotification("모든 애니메이션이 정지되었습니다", "info");
  }

  // Demo Tab Methods
  switchDemoTab(demo) {
    // 탭 버튼 업데이트
    document.querySelectorAll(".demo-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.demo === demo) {
        btn.classList.add("active");
      }
    });

    // 패널 업데이트
    document.querySelectorAll(".demo-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    const targetPanel = document.getElementById(`${demo}Demo`);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  }

  // Editor Methods
  setupLiveEditor() {
    this.generatePresets();
    this.updateInspector();
  }

  switchEditorTab(editor) {
    // 탭 버튼 업데이트
    document.querySelectorAll(".editor-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.editor === editor) {
        btn.classList.add("active");
      }
    });

    // 패널 업데이트
    document.querySelectorAll(".editor-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    const targetPanel = document.getElementById(`${editor}Editor`);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }

    this.editorMode = editor;

    if (editor === "inspector") {
      this.updateInspector();
    }
  }

  handleBuilderAction(action) {
    switch (action) {
      case "register":
        this.registerFromBuilder();
        break;
      case "previewAnimation":
        this.previewBuilderAnimation();
        break;
      case "generate":
        this.generateBuilderCode();
        break;
    }
  }

  registerFromBuilder() {
    const name = document.getElementById("builderName").value.trim();
    const syntax = document.getElementById("builderSyntax").value;
    const initialValue = document.getElementById("builderInitial").value.trim();
    const inherits = document.getElementById("builderInherits").checked;

    if (!name || !initialValue) {
      this.showNotification("속성 이름과 초기값을 입력해주세요", "warning");
      return;
    }

    if (this.registerCSSProperty(name, syntax, initialValue, inherits)) {
      // 데모 타겟에 적용
      const target = document.getElementById("demoTarget");
      if (target) {
        target.style.setProperty(name, initialValue);
        target.style.background = syntax === "<color>" ? `var(${name})` : "";
        target.style.width = syntax === "<length>" ? `var(${name})` : "";
        target.style.height = syntax === "<length>" ? `var(${name})` : "";
      }
    }
  }

  previewBuilderAnimation() {
    const name = document.getElementById("builderName").value.trim();
    const startValue = document.getElementById("animationStart").value.trim();
    const endValue = document.getElementById("animationEnd").value.trim();
    const duration = document.getElementById("animationDuration").value;

    if (!name || !startValue || !endValue) {
      this.showNotification("애니메이션 설정을 완성해주세요", "warning");
      return;
    }

    const target = document.getElementById("demoTarget");
    if (!target) return;

    // 애니메이션 적용
    target.style.setProperty(name, startValue);
    target.style.transition = `${name} ${duration}ms ease-in-out`;

    setTimeout(() => {
      target.style.setProperty(name, endValue);
    }, 100);

    setTimeout(() => {
      target.style.setProperty(name, startValue);
    }, parseInt(duration) + 500);

    this.showNotification("애니메이션 미리보기가 실행되었습니다", "success");
  }

  generateBuilderCode() {
    const name = document.getElementById("builderName").value.trim();
    const syntax = document.getElementById("builderSyntax").value;
    const initialValue = document.getElementById("builderInitial").value.trim();
    const inherits = document.getElementById("builderInherits").checked;
    const target = document.getElementById("animationTarget").value.trim();
    const startValue = document.getElementById("animationStart").value.trim();
    const endValue = document.getElementById("animationEnd").value.trim();
    const duration = document.getElementById("animationDuration").value;

    const code = `
// 속성 등록
CSS.registerProperty({
  name: '${name}',
  syntax: '${syntax}',
  initialValue: '${initialValue}',
  inherits: ${inherits}
});

/* CSS 사용법 */
${target} {
  ${name}: ${startValue};
  transition: ${name} ${duration}ms ease-in-out;
}

${target}:hover {
  ${name}: ${endValue};
}

/* 또는 애니메이션으로 */
@keyframes ${name.replace("--", "").replace("-", "")}Animation {
  from { ${name}: ${startValue}; }
  to { ${name}: ${endValue}; }
}

${target} {
  animation: ${name
    .replace("--", "")
    .replace("-", "")}Animation ${duration}ms ease-in-out infinite alternate;
}
    `.trim();

    // 코드를 클립보드에 복사
    navigator.clipboard
      .writeText(code)
      .then(() => {
        this.showNotification(
          "생성된 코드가 클립보드에 복사되었습니다",
          "success"
        );
      })
      .catch(() => {
        console.log("생성된 코드:", code);
        this.showNotification("코드가 콘솔에 출력되었습니다", "info");
      });
  }

  // Code Editor Methods
  handleCodeEditorAction(action) {
    switch (action) {
      case "execute":
        this.executeCustomCode();
        break;
      case "format":
        this.formatCode();
        break;
      case "clear":
        this.clearCodeEditor();
        break;
      case "loadExample":
        this.loadCodeExample();
        break;
    }
  }

  executeCustomCode() {
    const code = document.getElementById("cssCodeEditor").value;

    try {
      // JavaScript 코드 실행 (CSS.registerProperty 호출 등)
      const jsMatches = code.match(
        /CSS\.registerProperty\s*\(\s*{[^}]+}\s*\);?/g
      );
      if (jsMatches) {
        jsMatches.forEach((match) => {
          eval(match);
        });
      }

      // CSS 스타일 적용
      const cssMatches = code.match(/\/\*[^*]*\*\/\s*([^{]+\s*{[^}]+})/g);
      if (cssMatches) {
        const style = document.createElement("style");
        style.textContent = cssMatches.join("\n");
        document.head.appendChild(style);

        // 5초 후 제거
        setTimeout(() => {
          document.head.removeChild(style);
        }, 5000);
      }

      this.showNotification("코드가 실행되었습니다", "success");
    } catch (error) {
      this.showNotification(`코드 실행 오류: ${error.message}`, "error");
    }
  }

  formatCode() {
    const codeEditor = document.getElementById("cssCodeEditor");
    let code = codeEditor.value;

    // 간단한 코드 포맷팅
    code = code
      .replace(/;/g, ";\n  ")
      .replace(/{/g, " {\n  ")
      .replace(/}/g, "\n}\n")
      .replace(/,/g, ",\n  ")
      .replace(/\n\s*\n/g, "\n");

    codeEditor.value = code;
    this.showNotification("코드가 포맷되었습니다", "info");
  }

  clearCodeEditor() {
    document.getElementById("cssCodeEditor").value = "";
    this.showNotification("코드 에디터가 초기화되었습니다", "info");
  }

  loadCodeExample() {
    const examples = [
      `/* 색상 그라디언트 애니메이션 */
CSS.registerProperty({
  name: '--gradient-start',
  syntax: '<color>',
  initialValue: '#ff6b6b',
  inherits: false
});

CSS.registerProperty({
  name: '--gradient-end', 
  syntax: '<color>',
  initialValue: '#4ecdc4',
  inherits: false
});

.gradient-box {
  background: linear-gradient(45deg, var(--gradient-start), var(--gradient-end));
  animation: gradient-shift 3s ease-in-out infinite alternate;
}

@keyframes gradient-shift {
  from { 
    --gradient-start: #ff6b6b; 
    --gradient-end: #4ecdc4; 
  }
  to { 
    --gradient-start: #667eea; 
    --gradient-end: #764ba2; 
  }
}`,
      `/* 동적 테두리 반지름 */
CSS.registerProperty({
  name: '--border-radius',
  syntax: '<percentage>',
  initialValue: '0%',
  inherits: false
});

.morphing-shape {
  --border-radius: 0%;
  border-radius: var(--border-radius);
  animation: morph-shape 4s ease-in-out infinite;
}

@keyframes morph-shape {
  0% { --border-radius: 0%; }
  25% { --border-radius: 50%; }
  50% { --border-radius: 25% 75%; }
  75% { --border-radius: 75% 25% 50% 50%; }
  100% { --border-radius: 0%; }
}`,
      `/* 회전각 애니메이션 */
CSS.registerProperty({
  name: '--rotation',
  syntax: '<angle>',
  initialValue: '0deg',
  inherits: false
});

.rotating-element {
  transform: rotate(var(--rotation));
  animation: spin-smooth 3s linear infinite;
}

@keyframes spin-smooth {
  from { --rotation: 0deg; }
  to { --rotation: 360deg; }
}`,
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById("cssCodeEditor").value = randomExample;
    this.showNotification("예제 코드가 로드되었습니다", "success");
  }

  // Presets Methods
  generatePresets() {
    const presetsGrid = document.getElementById("presetsGrid");
    if (!presetsGrid) return;

    const presets = {
      color: [
        {
          name: "그라디언트 시프트",
          description: "배경 그라디언트가 부드럽게 변화",
          properties: ["--gradient-start", "--gradient-end"],
          preview: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
        },
        {
          name: "색상 파도",
          description: "색상이 파도처럼 변화",
          properties: ["--wave-color"],
          preview: "linear-gradient(90deg, #667eea, #764ba2)",
        },
        {
          name: "네온 글로우",
          description: "네온 사인 효과",
          properties: ["--glow-color", "--glow-intensity"],
          preview: "radial-gradient(circle, #00ff88, #0066ff)",
        },
      ],
      layout: [
        {
          name: "유동적 간격",
          description: "요소 간격이 동적으로 변화",
          properties: ["--spacing"],
          preview:
            "repeating-linear-gradient(45deg, #667eea, #667eea 20px, #764ba2 20px, #764ba2 40px)",
        },
        {
          name: "반응형 크기",
          description: "화면 크기에 따른 적응형 크기",
          properties: ["--responsive-size"],
          preview: "linear-gradient(135deg, #4ecdc4, #45b7d1)",
        },
      ],
      animation: [
        {
          name: "페이드 펄스",
          description: "투명도가 리듬감 있게 변화",
          properties: ["--fade-opacity"],
          preview:
            "linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.8))",
        },
        {
          name: "회전 모션",
          description: "부드러운 회전 애니메이션",
          properties: ["--rotation-degree"],
          preview: "conic-gradient(from 0deg, #667eea, #764ba2, #667eea)",
        },
      ],
      interactive: [
        {
          name: "호버 변형",
          description: "마우스 호버 시 변형",
          properties: ["--hover-transform"],
          preview: "linear-gradient(45deg, #ff9a9e, #fecfef)",
        },
        {
          name: "클릭 리플",
          description: "클릭 시 리플 효과",
          properties: ["--ripple-scale"],
          preview: "radial-gradient(circle, #667eea, transparent 70%)",
        },
      ],
    };

    this.presets = presets;
    this.updatePresetsGrid("color");
  }

  switchPresetCategory(category) {
    // 카테고리 버튼 업데이트
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.category === category) {
        btn.classList.add("active");
      }
    });

    this.updatePresetsGrid(category);
  }

  updatePresetsGrid(category) {
    const presetsGrid = document.getElementById("presetsGrid");
    if (!presetsGrid || !this.presets) return;

    const categoryPresets = this.presets[category] || [];

    presetsGrid.innerHTML = categoryPresets
      .map(
        (preset, index) => `
      <div class="preset-card" data-category="${category}" data-index="${index}">
        <div class="preset-preview" style="background: ${preset.preview}"></div>
        <div class="preset-info">
          <h4>${preset.name}</h4>
          <p>${preset.description}</p>
          <div class="preset-properties">
            ${preset.properties
              .map((prop) => `<span class="property-tag">${prop}</span>`)
              .join("")}
          </div>
          <button class="preset-apply" onclick="window.cssPropertiesAPI.applyPreset('${category}', ${index})">
            적용하기
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  applyPreset(category, index) {
    const preset = this.presets[category][index];
    if (!preset) return;

    // 프리셋 속성들 등록
    preset.properties.forEach((propName) => {
      const syntax = this.inferSyntaxFromName(propName);
      const initialValue = this.getDefaultValueForSyntax(syntax);
      this.registerCSSProperty(propName, syntax, initialValue, false);
    });

    this.showNotification(
      `'${preset.name}' 프리셋이 적용되었습니다`,
      "success"
    );
  }

  inferSyntaxFromName(name) {
    if (name.includes("color")) return "<color>";
    if (
      name.includes("size") ||
      name.includes("width") ||
      name.includes("height")
    )
      return "<length>";
    if (name.includes("opacity") || name.includes("intensity"))
      return "<number>";
    if (
      name.includes("angle") ||
      name.includes("rotation") ||
      name.includes("degree")
    )
      return "<angle>";
    return "*";
  }

  getDefaultValueForSyntax(syntax) {
    switch (syntax) {
      case "<color>":
        return "#667eea";
      case "<length>":
        return "100px";
      case "<percentage>":
        return "50%";
      case "<number>":
        return "1";
      case "<angle>":
        return "0deg";
      case "<time>":
        return "1s";
      case "<integer>":
        return "1";
      default:
        return "initial";
    }
  }

  // Inspector Methods
  updateInspector() {
    const inspectorContent = document.getElementById("inspectorContent");
    if (!inspectorContent) return;

    const filter = document.getElementById("inspectorFilter")?.value || "all";

    let properties = Array.from(this.registeredProperties.entries());

    // 필터 적용
    if (filter !== "all") {
      properties = properties.filter(([name, prop]) => {
        switch (filter) {
          case "registered":
            return true;
          case "animated":
            return prop.animated;
          case "color":
            return prop.syntax === "<color>";
          case "length":
            return prop.syntax === "<length>";
          case "number":
            return prop.syntax === "<number>";
          default:
            return true;
        }
      });
    }

    if (properties.length === 0) {
      inspectorContent.innerHTML =
        '<div class="inspector-placeholder">표시할 속성이 없습니다</div>';
      return;
    }

    inspectorContent.innerHTML = properties
      .map(
        ([name, prop]) => `
      <div class="inspector-item">
        <div class="inspector-header">
          <div class="property-name">${name}</div>
          <div class="property-actions">
            <button class="inspect-btn" onclick="window.cssPropertiesAPI.inspectProperty('${name}')">🔍</button>
            <button class="test-btn" onclick="window.cssPropertiesAPI.testProperty('${name}')">🧪</button>
            <button class="delete-btn" onclick="window.cssPropertiesAPI.deleteProperty('${name}')">🗑️</button>
          </div>
        </div>
        <div class="inspector-details">
          <div class="detail-item">
            <span class="detail-label">문법:</span>
            <span class="detail-value syntax-${prop.syntax
              .replace("<", "")
              .replace(">", "")}">${prop.syntax}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">초기값:</span>
            <span class="detail-value">${prop.initialValue}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">상속:</span>
            <span class="detail-value">${prop.inherits ? "예" : "아니오"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">등록 시간:</span>
            <span class="detail-value">${new Date(
              prop.registered
            ).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  inspectProperty(name) {
    const property = this.registeredProperties.get(name);
    if (!property) return;

    // 속성 상세 정보 표시
    const detailsHTML = `
      <div class="property-details-modal">
        <h3>🔍 속성 상세 정보: ${name}</h3>
        <div class="details-grid">
          <div class="detail-section">
            <h4>기본 정보</h4>
            <ul>
              <li><strong>이름:</strong> ${property.name}</li>
              <li><strong>문법:</strong> ${property.syntax}</li>
              <li><strong>초기값:</strong> ${property.initialValue}</li>
              <li><strong>상속:</strong> ${
                property.inherits ? "예" : "아니오"
              }</li>
            </ul>
          </div>
          <div class="detail-section">
            <h4>현재 상태</h4>
            <ul>
              <li><strong>등록 시간:</strong> ${new Date(
                property.registered
              ).toLocaleString()}</li>
              <li><strong>애니메이션 중:</strong> ${
                property.animated ? "예" : "아니오"
              }</li>
              <li><strong>사용 횟수:</strong> ${this.countPropertyUsage(
                name
              )}</li>
            </ul>
          </div>
        </div>
        <button onclick="this.parentElement.remove()" class="btn-secondary">닫기</button>
      </div>
    `;

    const modal = document.createElement("div");
    modal.className = "property-modal";
    modal.innerHTML = detailsHTML;
    document.body.appendChild(modal);

    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 10000);
  }

  testProperty(name) {
    const property = this.registeredProperties.get(name);
    if (!property) return;

    // 테스트 요소 생성
    const testElement = document.createElement("div");
    testElement.className = "property-test-element";
    testElement.textContent = `Testing ${name}`;

    // 속성 적용
    switch (property.syntax) {
      case "<color>":
        testElement.style.setProperty(name, "#ff0000");
        testElement.style.background = `var(${name})`;
        break;
      case "<length>":
        testElement.style.setProperty(name, "150px");
        testElement.style.width = `var(${name})`;
        testElement.style.height = `var(${name})`;
        break;
      case "<number>":
        testElement.style.setProperty(name, "0.5");
        testElement.style.opacity = `var(${name})`;
        break;
      case "<angle>":
        testElement.style.setProperty(name, "45deg");
        testElement.style.transform = `rotate(var(${name}))`;
        break;
    }

    document.body.appendChild(testElement);

    // 3초 후 제거
    setTimeout(() => {
      if (testElement.parentNode) {
        testElement.remove();
      }
    }, 3000);

    this.showNotification(`속성 '${name}' 테스트가 실행되었습니다`, "success");
  }

  deleteProperty(name) {
    if (this.registeredProperties.has(name)) {
      this.registeredProperties.delete(name);
      this.updatePropertiesList();
      this.updateInspector();
      this.updateMetrics();
      this.showNotification(`속성 '${name}'이 삭제되었습니다`, "info");
    }
  }

  countPropertyUsage(name) {
    // 간단한 사용 횟수 계산 (실제로는 더 복잡한 로직 필요)
    return this.propertyHistory.filter(
      (entry) => entry.property && entry.property.name === name
    ).length;
  }

  // Data Management Methods
  handleDataAction(action) {
    switch (action) {
      case "export":
        this.exportPropertiesData();
        break;
      case "import":
        document.getElementById("propertiesFile").click();
        break;
      case "clearAll":
        this.clearAllProperties();
        break;
    }
  }

  exportPropertiesData() {
    const data = {
      properties: Array.from(this.registeredProperties.entries()).map(
        ([name, prop]) => ({
          name,
          syntax: prop.syntax,
          initialValue: prop.initialValue,
          inherits: prop.inherits,
        })
      ),
      history: this.propertyHistory,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `css-properties-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    this.showNotification("속성 데이터가 내보내졌습니다", "success");
  }

  clearAllProperties() {
    this.registeredProperties.clear();
    this.propertyHistory = [];
    this.updatePropertiesList();
    this.updateInspector();
    this.updateMetrics();
    this.showNotification("모든 속성이 삭제되었습니다", "info");
  }

  // UI Update Methods
  updatePropertiesList() {
    const propertiesList = document.getElementById("propertiesList");
    if (!propertiesList) return;

    if (this.registeredProperties.size === 0) {
      propertiesList.innerHTML =
        '<div class="list-placeholder">등록된 속성이 없습니다</div>';
      return;
    }

    const properties = Array.from(this.registeredProperties.entries());
    propertiesList.innerHTML = properties
      .map(
        ([name, prop]) => `
      <div class="property-item">
        <div class="property-header">
          <div class="property-name">${name}</div>
          <div class="property-syntax syntax-${prop.syntax
            .replace("<", "")
            .replace(">", "")}">${prop.syntax}</div>
        </div>
        <div class="property-details">
          <span class="property-initial">초기값: ${prop.initialValue}</span>
          <span class="property-inherits">${
            prop.inherits ? "상속" : "비상속"
          }</span>
          <span class="property-time">${new Date(
            prop.registered
          ).toLocaleTimeString()}</span>
        </div>
        <div class="property-actions">
          <button class="action-btn test" onclick="window.cssPropertiesAPI.testProperty('${name}')">테스트</button>
          <button class="action-btn delete" onclick="window.cssPropertiesAPI.deleteProperty('${name}')">삭제</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  updateMetrics() {
    document.getElementById("registeredCount").textContent =
      this.registeredProperties.size;
    document.getElementById("activeAnimations").textContent =
      this.animationInstances.size;

    // 메모리 사용량 (추정)
    if (performance.memory) {
      const memoryMB = Math.round(
        performance.memory.usedJSHeapSize / 1024 / 1024
      );
      document.getElementById("memoryUsage").textContent = `${memoryMB}MB`;
    }

    // 성능 점수 계산
    const score = Math.max(
      0,
      100 -
        this.registeredProperties.size * 2 -
        this.animationInstances.size * 5
    );
    document.getElementById("performanceScore").textContent = score;
  }

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
window.cssPropertiesAPI = null;

// 초기화
function initCSSPropertiesAPI() {
  console.log("🚀 CSS Properties And Values API 초기화 함수 호출");
  window.cssPropertiesAPI = new CSSPropertiesAndValuesAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initCSSPropertiesAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initCSSPropertiesAPI();
}

console.log(
  "📄 CSS Properties And Values API 스크립트 로드 완료, readyState:",
  document.readyState
);
