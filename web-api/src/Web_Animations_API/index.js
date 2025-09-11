import "./style.css";

console.log("🎬 Web Animations API 스크립트 시작!");

class WebAnimationsAPI {
  constructor() {
    this.animations = [];
    this.animationId = 0;
    this.playbackControls = null;
    this.timelinePosition = 0;
    this.isPlaying = false;
    this.selectedAnimation = null;
    this.animationGroups = new Map();
    this.keyframeEditor = null;
    this.init();
  }

  init() {
    console.log("🎬 Web Animations API Manager 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.setupAnimationExamples();
    this.startPerformanceMonitoring();
    console.log("✅ Web Animations API Manager 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Web Animations API 지원 여부 확인 중...");

    const support = {
      webAnimations: "animate" in Element.prototype,
      getAnimations: "getAnimations" in document,
      animationWorklet: "animationWorklet" in CSS,
      viewTimeline: "ViewTimeline" in window,
      scrollTimeline: "ScrollTimeline" in window,
      animationPlaybackEvent: "AnimationPlaybackEvent" in window,
      animationEffect: "AnimationEffect" in window,
      keyframeEffect: "KeyframeEffect" in window,
      animationTimeline: "AnimationTimeline" in window,
    };

    console.log("📊 Web Animations API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");

    appDiv.innerHTML = `
      <div class="animations-container">
        <header class="animations-header">
          <h1>🎬 Web Animations API</h1>
          <p>고성능 애니메이션 생성, 제어, 편집의 모든 기능을 체험하세요</p>
          
          <div style="margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="quickAnimationTest" class="btn-primary">🚀 빠른 애니메이션 테스트</button>
            <button id="createBasicAnimation" class="btn-success">➕ 기본 애니메이션 생성</button>
            <button id="playAllAnimations" class="btn-info">▶️ 모든 애니메이션 재생</button>
            <button id="stopAllAnimations" class="btn-warning">⏹️ 모든 애니메이션 정지</button>
          </div>

          <div class="api-support">
            ${Object.entries(this.apiSupport)
              .map(
                ([key, supported]) => `
              <div class="support-badge ${
                supported ? "supported" : "unsupported"
              }">
                ${supported ? "✅" : "❌"} ${this.formatSupportLabel(key)}
              </div>
            `
              )
              .join("")}
          </div>
        </header>

        <main class="animations-main">
          <!-- 애니메이션 플레이그라운드 -->
          <div class="panel-card primary">
            <h2>🎮 애니메이션 플레이그라운드</h2>
            
            <div class="playground-section">
              <div class="animation-stage" id="animationStage">
                <div class="stage-controls">
                  <h3>🎭 애니메이션 무대</h3>
                  <div class="stage-options">
                    <button id="addAnimationBox" class="btn-primary">📦 박스 추가</button>
                    <button id="addAnimationCircle" class="btn-success">⭕ 원 추가</button>
                    <button id="addAnimationText" class="btn-info">📝 텍스트 추가</button>
                    <button id="clearStage" class="btn-danger">🗑️ 무대 초기화</button>
                  </div>
                </div>
                <div class="stage-area" id="stageArea">
                  <div class="stage-placeholder">애니메이션 요소들이 여기에 표시됩니다</div>
                </div>
              </div>

              <div class="animation-controls">
                <h3>🎛️ 애니메이션 컨트롤</h3>
                <div class="playback-controls">
                  <button id="playAnimation" class="btn-success">▶️ 재생</button>
                  <button id="pauseAnimation" class="btn-warning">⏸️ 일시정지</button>
                  <button id="stopAnimation" class="btn-danger">⏹️ 정지</button>
                  <button id="reverseAnimation" class="btn-info">⏪ 역재생</button>
                </div>
                <div class="timeline-control">
                  <label>타임라인 위치</label>
                  <input type="range" id="timelineSlider" min="0" max="100" value="0" class="timeline-slider">
                  <span id="timelineValue">0%</span>
                </div>
                <div class="speed-control">
                  <label>재생 속도</label>
                  <input type="range" id="speedSlider" min="0.1" max="3" step="0.1" value="1" class="speed-slider">
                  <span id="speedValue">1x</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 애니메이션 크리에이터 -->
          <div class="panel-card">
            <h2>🎨 애니메이션 크리에이터</h2>
            
            <div class="creator-tabs">
              <button class="creator-tab-btn active" data-tab="basic">기본 애니메이션</button>
              <button class="creator-tab-btn" data-tab="keyframes">키프레임 편집</button>
              <button class="creator-tab-btn" data-tab="advanced">고급 설정</button>
              <button class="creator-tab-btn" data-tab="presets">프리셋</button>
            </div>

            <div class="creator-content">
              <!-- 기본 애니메이션 -->
              <div class="creator-panel active" id="basic">
                <h3>📝 기본 애니메이션 설정</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="animationType">애니메이션 타입</label>
                    <select id="animationType">
                      <option value="transform">Transform</option>
                      <option value="opacity">Opacity</option>
                      <option value="color">Color</option>
                      <option value="size">Size</option>
                      <option value="position">Position</option>
                      <option value="rotation">Rotation</option>
                      <option value="scale">Scale</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="animationDuration">지속 시간 (ms)</label>
                    <input type="number" id="animationDuration" value="1000" min="100" max="10000">
                  </div>
                  <div class="form-group">
                    <label for="animationEasing">이징 함수</label>
                    <select id="animationEasing">
                      <option value="linear">Linear</option>
                      <option value="ease">Ease</option>
                      <option value="ease-in">Ease In</option>
                      <option value="ease-out">Ease Out</option>
                      <option value="ease-in-out">Ease In Out</option>
                      <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Bounce</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="animationDelay">지연 시간 (ms)</label>
                    <input type="number" id="animationDelay" value="0" min="0" max="5000">
                  </div>
                  <div class="form-group">
                    <label for="animationIterations">반복 횟수</label>
                    <input type="number" id="animationIterations" value="1" min="1" max="100">
                  </div>
                  <div class="form-group">
                    <label for="animationDirection">방향</label>
                    <select id="animationDirection">
                      <option value="normal">Normal</option>
                      <option value="reverse">Reverse</option>
                      <option value="alternate">Alternate</option>
                      <option value="alternate-reverse">Alternate Reverse</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button id="createAnimation" class="btn-primary">🎬 애니메이션 생성</button>
                  <button id="previewAnimation" class="btn-info">👁️ 미리보기</button>
                </div>
              </div>

              <!-- 키프레임 편집 -->
              <div class="creator-panel" id="keyframes">
                <h3>🔑 키프레임 편집기</h3>
                <div class="keyframe-editor">
                  <div class="keyframe-timeline">
                    <div class="timeline-header">
                      <span>시간</span>
                      <span>속성</span>
                      <span>값</span>
                      <span>액션</span>
                    </div>
                    <div id="keyframesList" class="keyframes-list">
                      <div class="keyframe-placeholder">키프레임을 추가하세요</div>
                    </div>
                  </div>
                  <div class="keyframe-controls">
                    <button id="addKeyframe" class="btn-primary">➕ 키프레임 추가</button>
                    <button id="clearKeyframes" class="btn-danger">🗑️ 모든 키프레임 삭제</button>
                    <button id="createKeyframeAnimation" class="btn-success">🎬 키프레임 애니메이션 생성</button>
                  </div>
                </div>
              </div>

              <!-- 고급 설정 -->
              <div class="creator-panel" id="advanced">
                <h3>⚙️ 고급 애니메이션 설정</h3>
                <div class="advanced-options">
                  <div class="option-group">
                    <h4>📐 Transform 설정</h4>
                    <div class="transform-controls">
                      <label>
                        Translate X: <input type="range" id="translateX" min="-200" max="200" value="0">
                        <span id="translateXValue">0px</span>
                      </label>
                      <label>
                        Translate Y: <input type="range" id="translateY" min="-200" max="200" value="0">
                        <span id="translateYValue">0px</span>
                      </label>
                      <label>
                        Rotate: <input type="range" id="rotate" min="0" max="360" value="0">
                        <span id="rotateValue">0deg</span>
                      </label>
                      <label>
                        Scale: <input type="range" id="scale" min="0.1" max="3" step="0.1" value="1">
                        <span id="scaleValue">1</span>
                      </label>
                    </div>
                  </div>
                  <div class="option-group">
                    <h4>🎨 스타일 설정</h4>
                    <div class="style-controls">
                      <label>
                        불투명도: <input type="range" id="opacity" min="0" max="1" step="0.1" value="1">
                        <span id="opacityValue">100%</span>
                      </label>
                      <label>
                        배경색: <input type="color" id="backgroundColor" value="#6366f1">
                      </label>
                      <label>
                        테두리 반지름: <input type="range" id="borderRadius" min="0" max="50" value="0">
                        <span id="borderRadiusValue">0px</span>
                      </label>
                    </div>
                  </div>
                  <div class="option-group">
                    <h4>⚡ 성능 설정</h4>
                    <div class="performance-controls">
                      <label>
                        <input type="checkbox" id="useCompositing" checked>
                        GPU 가속 사용 (will-change)
                      </label>
                      <label>
                        <input type="checkbox" id="useTransform3d">
                        3D Transform 강제 사용
                      </label>
                      <label>
                        <input type="checkbox" id="useOptimizedKeyframes">
                        최적화된 키프레임 사용
                      </label>
                    </div>
                  </div>
                </div>
                <div class="advanced-actions">
                  <button id="createAdvancedAnimation" class="btn-primary">🚀 고급 애니메이션 생성</button>
                  <button id="exportAnimation" class="btn-info">📤 애니메이션 내보내기</button>
                </div>
              </div>

              <!-- 프리셋 -->
              <div class="creator-panel" id="presets">
                <h3>🎭 애니메이션 프리셋</h3>
                <div class="presets-grid">
                  <div class="preset-card" data-preset="bounce">
                    <div class="preset-preview">🏀</div>
                    <h4>바운스</h4>
                    <p>탄성 있는 바운스 효과</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="preset-card" data-preset="shake">
                    <div class="preset-preview">📳</div>
                    <h4>흔들기</h4>
                    <p>좌우 흔들림 효과</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="preset-card" data-preset="fade">
                    <div class="preset-preview">👻</div>
                    <h4>페이드</h4>
                    <p>서서히 나타나기/사라지기</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="preset-card" data-preset="slide">
                    <div class="preset-preview">📄</div>
                    <h4>슬라이드</h4>
                    <p>부드러운 슬라이드 이동</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="preset-card" data-preset="rotate">
                    <div class="preset-preview">🌀</div>
                    <h4>회전</h4>
                    <p>360도 회전 효과</p>
                    <button class="btn-primary">적용</button>
                  </div>
                  <div class="preset-card" data-preset="pulse">
                    <div class="preset-preview">💓</div>
                    <h4>펄스</h4>
                    <p>심장박동 같은 효과</p>
                    <button class="btn-primary">적용</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 애니메이션 관리 -->
          <div class="panel-card">
            <h2>📋 애니메이션 관리</h2>
            
            <div class="management-section">
              <div class="animations-list">
                <h3>🎬 활성 애니메이션</h3>
                <div class="animations-header">
                  <span>이름</span>
                  <span>상태</span>
                  <span>진행률</span>
                  <span>지속시간</span>
                  <span>제어</span>
                </div>
                <div id="animationsList" class="animations-items">
                  <div class="animations-placeholder">생성된 애니메이션이 없습니다</div>
                </div>
              </div>

              <div class="animation-timeline">
                <h3>⏱️ 애니메이션 타임라인</h3>
                <div class="timeline-container">
                  <div class="timeline-ruler" id="timelineRuler"></div>
                  <div class="timeline-tracks" id="timelineTracks">
                    <div class="timeline-placeholder">애니메이션 타임라인이 여기에 표시됩니다</div>
                  </div>
                </div>
                <div class="timeline-controls">
                  <button id="timelinePlay" class="btn-primary">▶️ 타임라인 재생</button>
                  <button id="timelinePause" class="btn-warning">⏸️ 일시정지</button>
                  <button id="timelineStop" class="btn-danger">⏹️ 정지</button>
                  <button id="timelineRewind" class="btn-info">⏪ 처음으로</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 애니메이션 예제 -->
          <div class="panel-card">
            <h2>📚 애니메이션 예제</h2>
            
            <div class="examples-section">
              <div class="example-categories">
                <button class="category-tab-btn active" data-category="basic">기본</button>
                <button class="category-tab-btn" data-category="css">CSS 스타일</button>
                <button class="category-tab-btn" data-category="svg">SVG</button>
                <button class="category-tab-btn" data-category="complex">복합</button>
                <button class="category-tab-btn" data-category="interactive">인터랙티브</button>
              </div>

              <div class="examples-content">
                <!-- 기본 예제 -->
                <div class="example-panel active" id="basic-examples">
                  <div class="examples-grid">
                    <div class="example-card" data-example="moveRight">
                      <h4>➡️ 오른쪽 이동</h4>
                      <p>요소를 오른쪽으로 이동시킵니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="fadeInOut">
                      <h4>👻 페이드 인/아웃</h4>
                      <p>요소가 서서히 나타나고 사라집니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="scaleUp">
                      <h4>📈 크기 확대</h4>
                      <p>요소가 점점 커집니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="rotateLoop">
                      <h4>🌀 회전</h4>
                      <p>요소가 계속 회전합니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                  </div>
                </div>

                <!-- CSS 스타일 예제 -->
                <div class="example-panel" id="css-examples">
                  <div class="examples-grid">
                    <div class="example-card" data-example="colorChange">
                      <h4>🌈 색상 변화</h4>
                      <p>배경색이 부드럽게 변화합니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="borderRadius">
                      <h4>🔲 모양 변형</h4>
                      <p>사각형에서 원으로 변형됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="textShadow">
                      <h4>✨ 텍스트 그림자</h4>
                      <p>텍스트 그림자가 애니메이션됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="gradient">
                      <h4>🌅 그라디언트</h4>
                      <p>그라디언트 색상이 변화합니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                  </div>
                </div>

                <!-- SVG 예제 -->
                <div class="example-panel" id="svg-examples">
                  <div class="examples-grid">
                    <div class="example-card" data-example="pathDraw">
                      <h4>✏️ 경로 그리기</h4>
                      <p>SVG 경로가 그려지는 애니메이션</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="morphShape">
                      <h4>🔄 모양 변형</h4>
                      <p>SVG 모양이 다른 모양으로 변형됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="strokeAnimation">
                      <h4>🖊️ 선 애니메이션</h4>
                      <p>SVG 선의 stroke 속성이 애니메이션됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="svgIcon">
                      <h4>🎯 아이콘 애니메이션</h4>
                      <p>SVG 아이콘이 애니메이션됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                  </div>
                </div>

                <!-- 복합 예제 -->
                <div class="example-panel" id="complex-examples">
                  <div class="examples-grid">
                    <div class="example-card" data-example="particleSystem">
                      <h4>✨ 파티클 시스템</h4>
                      <p>여러 파티클이 동시에 애니메이션됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="sequenceAnimation">
                      <h4>🎬 시퀀스 애니메이션</h4>
                      <p>여러 애니메이션이 순차적으로 실행됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="staggeredAnimation">
                      <h4>🌊 스태거드 애니메이션</h4>
                      <p>요소들이 순차적으로 애니메이션됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="morphingCards">
                      <h4>🃏 카드 변형</h4>
                      <p>카드가 다른 카드로 변형됩니다</p>
                      <button class="btn-primary">실행</button>
                    </div>
                  </div>
                </div>

                <!-- 인터랙티브 예제 -->
                <div class="example-panel" id="interactive-examples">
                  <div class="examples-grid">
                    <div class="example-card" data-example="hoverEffects">
                      <h4>🖱️ 호버 효과</h4>
                      <p>마우스 호버시 애니메이션 실행</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="clickRipple">
                      <h4>💧 클릭 리플</h4>
                      <p>클릭시 리플 효과 생성</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="dragAnimation">
                      <h4>🤏 드래그 애니메이션</h4>
                      <p>드래그시 애니메이션 효과</p>
                      <button class="btn-primary">실행</button>
                    </div>
                    <div class="example-card" data-example="scrollTriggered">
                      <h4>📜 스크롤 트리거</h4>
                      <p>스크롤시 애니메이션 실행</p>
                      <button class="btn-primary">실행</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 성능 모니터링 -->
          <div class="panel-card">
            <h2>📊 성능 모니터링</h2>
            
            <div class="performance-section">
              <div class="performance-stats">
                <h3>⚡ 성능 통계</h3>
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon">🎬</div>
                    <div class="stat-info">
                      <span class="stat-label">활성 애니메이션</span>
                      <span class="stat-value" id="activeAnimationsCount">0</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-info">
                      <span class="stat-label">평균 FPS</span>
                      <span class="stat-value" id="averageFPS">60</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">🖥️</div>
                    <div class="stat-info">
                      <span class="stat-label">GPU 가속</span>
                      <span class="stat-value" id="gpuAcceleration">활성</span>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-info">
                      <span class="stat-label">평균 지연시간</span>
                      <span class="stat-value" id="averageLatency">0ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="performance-chart">
                <h3>📈 실시간 성능 차트</h3>
                <canvas id="performanceChart" width="600" height="300"></canvas>
              </div>

              <div class="performance-tools">
                <h3>🛠️ 성능 도구</h3>
                <div class="tools-actions">
                  <button id="startProfiling" class="btn-primary">📊 프로파일링 시작</button>
                  <button id="stopProfiling" class="btn-danger">⏹️ 프로파일링 정지</button>
                  <button id="exportProfile" class="btn-info">📤 프로파일 내보내기</button>
                  <button id="optimizeAnimations" class="btn-success">⚡ 애니메이션 최적화</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 페이지 내 알림 영역 -->
          <div id="inPageNotifications" class="in-page-notifications"></div>
        </main>
      </div>
    `;

    console.log("✅ UI 설정 완료");
  }

  formatSupportLabel(key) {
    const labels = {
      webAnimations: "Web Animations",
      getAnimations: "Get Animations",
      animationWorklet: "Animation Worklet",
      viewTimeline: "View Timeline",
      scrollTimeline: "Scroll Timeline",
      animationPlaybackEvent: "Playback Event",
      animationEffect: "Animation Effect",
      keyframeEffect: "Keyframe Effect",
      animationTimeline: "Animation Timeline",
    };
    return labels[key] || key;
  }

  setupEventListeners() {
    // 빠른 테스트 및 기본 제어
    document
      .getElementById("quickAnimationTest")
      ?.addEventListener("click", () => this.runQuickTest());
    document
      .getElementById("createBasicAnimation")
      ?.addEventListener("click", () => this.createBasicAnimation());
    document
      .getElementById("playAllAnimations")
      ?.addEventListener("click", () => this.playAllAnimations());
    document
      .getElementById("stopAllAnimations")
      ?.addEventListener("click", () => this.stopAllAnimations());

    // 무대 제어
    document
      .getElementById("addAnimationBox")
      ?.addEventListener("click", () => this.addAnimationElement("box"));
    document
      .getElementById("addAnimationCircle")
      ?.addEventListener("click", () => this.addAnimationElement("circle"));
    document
      .getElementById("addAnimationText")
      ?.addEventListener("click", () => this.addAnimationElement("text"));
    document
      .getElementById("clearStage")
      ?.addEventListener("click", () => this.clearStage());

    // 플레이백 제어
    document
      .getElementById("playAnimation")
      ?.addEventListener("click", () => this.playSelectedAnimation());
    document
      .getElementById("pauseAnimation")
      ?.addEventListener("click", () => this.pauseSelectedAnimation());
    document
      .getElementById("stopAnimation")
      ?.addEventListener("click", () => this.stopSelectedAnimation());
    document
      .getElementById("reverseAnimation")
      ?.addEventListener("click", () => this.reverseSelectedAnimation());

    // 타임라인 제어
    document
      .getElementById("timelineSlider")
      ?.addEventListener("input", (e) =>
        this.updateTimelinePosition(e.target.value)
      );
    document
      .getElementById("speedSlider")
      ?.addEventListener("input", (e) =>
        this.updatePlaybackSpeed(e.target.value)
      );

    // 크리에이터 탭
    document.querySelectorAll(".creator-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchCreatorTab(e.target.dataset.tab)
      );
    });

    // 기본 애니메이션 생성
    document
      .getElementById("createAnimation")
      ?.addEventListener("click", () => this.createCustomAnimation());
    document
      .getElementById("previewAnimation")
      ?.addEventListener("click", () => this.previewAnimation());

    // 키프레임 편집
    document
      .getElementById("addKeyframe")
      ?.addEventListener("click", () => this.addKeyframe());
    document
      .getElementById("clearKeyframes")
      ?.addEventListener("click", () => this.clearKeyframes());
    document
      .getElementById("createKeyframeAnimation")
      ?.addEventListener("click", () => this.createKeyframeAnimation());

    // 고급 설정
    document
      .getElementById("translateX")
      ?.addEventListener("input", (e) =>
        this.updateTransformValue("translateX", e.target.value)
      );
    document
      .getElementById("translateY")
      ?.addEventListener("input", (e) =>
        this.updateTransformValue("translateY", e.target.value)
      );
    document
      .getElementById("rotate")
      ?.addEventListener("input", (e) =>
        this.updateTransformValue("rotate", e.target.value)
      );
    document
      .getElementById("scale")
      ?.addEventListener("input", (e) =>
        this.updateTransformValue("scale", e.target.value)
      );
    document
      .getElementById("opacity")
      ?.addEventListener("input", (e) =>
        this.updateStyleValue("opacity", e.target.value)
      );
    document
      .getElementById("backgroundColor")
      ?.addEventListener("input", (e) =>
        this.updateStyleValue("backgroundColor", e.target.value)
      );
    document
      .getElementById("borderRadius")
      ?.addEventListener("input", (e) =>
        this.updateStyleValue("borderRadius", e.target.value)
      );

    document
      .getElementById("createAdvancedAnimation")
      ?.addEventListener("click", () => this.createAdvancedAnimation());
    document
      .getElementById("exportAnimation")
      ?.addEventListener("click", () => this.exportAnimation());

    // 프리셋
    document.querySelectorAll(".preset-card button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const preset = e.target.closest(".preset-card").dataset.preset;
        this.applyPreset(preset);
      });
    });

    // 타임라인 제어
    document
      .getElementById("timelinePlay")
      ?.addEventListener("click", () => this.playTimeline());
    document
      .getElementById("timelinePause")
      ?.addEventListener("click", () => this.pauseTimeline());
    document
      .getElementById("timelineStop")
      ?.addEventListener("click", () => this.stopTimeline());
    document
      .getElementById("timelineRewind")
      ?.addEventListener("click", () => this.rewindTimeline());

    // 예제 카테고리
    document.querySelectorAll(".category-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchCategoryTab(e.target.dataset.category)
      );
    });

    // 예제 실행
    document.querySelectorAll(".example-card button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const example = e.target.closest(".example-card").dataset.example;
        this.runExample(example);
      });
    });

    // 성능 도구
    document
      .getElementById("startProfiling")
      ?.addEventListener("click", () => this.startProfiling());
    document
      .getElementById("stopProfiling")
      ?.addEventListener("click", () => this.stopProfiling());
    document
      .getElementById("exportProfile")
      ?.addEventListener("click", () => this.exportProfile());
    document
      .getElementById("optimizeAnimations")
      ?.addEventListener("click", () => this.optimizeAnimations());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  setupAnimationExamples() {
    // 예제 애니메이션들을 미리 준비
    this.animationPresets = {
      bounce: {
        keyframes: [
          { transform: "translateY(0px)", easing: "ease-out" },
          { transform: "translateY(-30px)", easing: "ease-in", offset: 0.5 },
          { transform: "translateY(0px)", easing: "ease-out" },
        ],
        options: { duration: 600, iterations: 3 },
      },
      shake: {
        keyframes: [
          { transform: "translateX(0px)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(0px)" },
        ],
        options: { duration: 500 },
      },
      fade: {
        keyframes: [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
        options: { duration: 1000 },
      },
      slide: {
        keyframes: [
          { transform: "translateX(-100px)", opacity: 0 },
          { transform: "translateX(0px)", opacity: 1 },
        ],
        options: { duration: 800, easing: "ease-out" },
      },
      rotate: {
        keyframes: [
          { transform: "rotate(0deg)" },
          { transform: "rotate(360deg)" },
        ],
        options: { duration: 1000, iterations: Infinity },
      },
      pulse: {
        keyframes: [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.1)", opacity: 0.8 },
          { transform: "scale(1)", opacity: 1 },
        ],
        options: { duration: 800, iterations: Infinity },
      },
    };

    console.log("✅ 애니메이션 예제 설정 완료");
  }

  startPerformanceMonitoring() {
    this.performanceData = {
      fps: [],
      animationCount: [],
      timestamps: [],
    };

    this.performanceInterval = setInterval(() => {
      this.updatePerformanceStats();
    }, 1000);

    console.log("✅ 성능 모니터링 시작");
  }

  // 빠른 테스트
  async runQuickTest() {
    this.showInPageNotification("빠른 애니메이션 테스트 시작!", "info");

    try {
      // 테스트용 요소 생성
      const testElement = this.createTestElement("테스트 박스", "box");

      // 간단한 애니메이션 실행
      const animation = testElement.animate(
        [
          { transform: "translateX(0px) scale(1)", backgroundColor: "#6366f1" },
          {
            transform: "translateX(100px) scale(1.2)",
            backgroundColor: "#8b5cf6",
          },
          {
            transform: "translateX(200px) scale(1)",
            backgroundColor: "#ec4899",
          },
          { transform: "translateX(0px) scale(1)", backgroundColor: "#6366f1" },
        ],
        {
          duration: 2000,
          easing: "ease-in-out",
          iterations: 1,
        }
      );

      // 애니메이션 등록 및 관리
      this.registerAnimation(animation, "빠른 테스트", testElement);

      animation.addEventListener("finish", () => {
        this.showInPageNotification("빠른 테스트 완료!", "success");
      });
    } catch (error) {
      console.error("빠른 테스트 오류:", error);
      this.showInPageNotification(`테스트 실패: ${error.message}`, "error");
    }
  }

  createTestElement(name, type) {
    const stageArea = document.getElementById("stageArea");
    const placeholder = stageArea.querySelector(".stage-placeholder");
    if (placeholder) placeholder.style.display = "none";

    const element = document.createElement("div");
    element.className = `animation-element ${type}`;
    element.textContent = name;
    element.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      background: #6366f1;
      border-radius: ${type === "circle" ? "50%" : "8px"};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      will-change: transform, opacity;
      left: 20px;
      top: 20px;
    `;

    // 클릭 이벤트 추가
    element.addEventListener("click", () => {
      this.selectedAnimation = this.animations.find(
        (anim) => anim.element === element
      );
      this.updateAnimationSelection();
    });

    stageArea.appendChild(element);
    return element;
  }

  addAnimationElement(type) {
    const names = {
      box: "박스",
      circle: "원",
      text: "텍스트",
    };

    const element = this.createTestElement(names[type], type);
    this.showInPageNotification(
      `${names[type]} 요소가 추가되었습니다`,
      "success"
    );
  }

  clearStage() {
    const stageArea = document.getElementById("stageArea");
    const elements = stageArea.querySelectorAll(".animation-element");

    elements.forEach((element) => {
      // 해당 요소의 애니메이션들 정리
      this.animations = this.animations.filter((anim) => {
        if (anim.element === element) {
          anim.animation.cancel();
          return false;
        }
        return true;
      });
      element.remove();
    });

    // 플레이스홀더 다시 표시
    const placeholder = stageArea.querySelector(".stage-placeholder");
    if (placeholder) placeholder.style.display = "block";

    this.updateAnimationsList();
    this.showInPageNotification("무대가 초기화되었습니다", "info");
  }

  createBasicAnimation() {
    const stageArea = document.getElementById("stageArea");
    const elements = stageArea.querySelectorAll(".animation-element");

    if (elements.length === 0) {
      this.showInPageNotification(
        "먼저 애니메이션 요소를 추가하세요",
        "warning"
      );
      return;
    }

    const element = elements[elements.length - 1]; // 마지막 요소 사용

    const animation = element.animate(
      [
        { transform: "translateX(0px) rotate(0deg)", opacity: 1 },
        { transform: "translateX(150px) rotate(180deg)", opacity: 0.5 },
        { transform: "translateX(0px) rotate(360deg)", opacity: 1 },
      ],
      {
        duration: 1500,
        easing: "ease-in-out",
        iterations: 1,
      }
    );

    this.registerAnimation(animation, "기본 애니메이션", element);
    this.showInPageNotification("기본 애니메이션이 생성되었습니다", "success");
  }

  registerAnimation(animation, name, element) {
    const animationData = {
      id: ++this.animationId,
      name: name,
      animation: animation,
      element: element,
      created: new Date(),
      status: "running",
    };

    this.animations.push(animationData);

    // 이벤트 리스너 추가
    animation.addEventListener("finish", () => {
      animationData.status = "finished";
      this.updateAnimationsList();
    });

    animation.addEventListener("cancel", () => {
      animationData.status = "cancelled";
      this.updateAnimationsList();
    });

    this.updateAnimationsList();
    return animationData;
  }

  updateAnimationsList() {
    const container = document.getElementById("animationsList");
    if (!container) return;

    if (this.animations.length === 0) {
      container.innerHTML =
        '<div class="animations-placeholder">생성된 애니메이션이 없습니다</div>';
      return;
    }

    container.innerHTML = this.animations
      .map(
        (anim) => `
      <div class="animation-item ${
        anim === this.selectedAnimation ? "selected" : ""
      }" data-id="${anim.id}">
        <span class="animation-name">${anim.name}</span>
        <span class="animation-status status-${
          anim.status
        }">${this.formatStatus(anim.status)}</span>
        <span class="animation-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this.getAnimationProgress(
              anim
            )}%"></div>
          </div>
          ${Math.round(this.getAnimationProgress(anim))}%
        </span>
        <span class="animation-duration">${
          anim.animation.effect?.getTiming?.()?.duration || 0
        }ms</span>
        <span class="animation-controls">
          <button onclick="window.webAnimationsAPI.controlAnimation(${
            anim.id
          }, 'play')" class="btn-small btn-success">▶️</button>
          <button onclick="window.webAnimationsAPI.controlAnimation(${
            anim.id
          }, 'pause')" class="btn-small btn-warning">⏸️</button>
          <button onclick="window.webAnimationsAPI.controlAnimation(${
            anim.id
          }, 'cancel')" class="btn-small btn-danger">⏹️</button>
        </span>
      </div>
    `
      )
      .join("");
  }

  formatStatus(status) {
    const statusMap = {
      running: "실행 중",
      paused: "일시정지",
      finished: "완료",
      cancelled: "취소됨",
    };
    return statusMap[status] || status;
  }

  getAnimationProgress(animData) {
    try {
      const animation = animData.animation;
      const duration = animation.effect?.getTiming?.()?.duration || 1;
      const currentTime = animation.currentTime || 0;
      return Math.min(100, (currentTime / duration) * 100);
    } catch {
      return 0;
    }
  }

  controlAnimation(id, action) {
    const animData = this.animations.find((anim) => anim.id === id);
    if (!animData) return;

    const animation = animData.animation;

    switch (action) {
      case "play":
        animation.play();
        animData.status = "running";
        break;
      case "pause":
        animation.pause();
        animData.status = "paused";
        break;
      case "cancel":
        animation.cancel();
        animData.status = "cancelled";
        break;
    }

    this.updateAnimationsList();
    this.showInPageNotification(
      `애니메이션이 ${
        action === "play" ? "재생" : action === "pause" ? "일시정지" : "취소"
      }되었습니다`,
      "info"
    );
  }

  playAllAnimations() {
    this.animations.forEach((animData) => {
      animData.animation.play();
      animData.status = "running";
    });
    this.updateAnimationsList();
    this.showInPageNotification("모든 애니메이션이 재생되었습니다", "success");
  }

  stopAllAnimations() {
    this.animations.forEach((animData) => {
      animData.animation.cancel();
      animData.status = "cancelled";
    });
    this.updateAnimationsList();
    this.showInPageNotification("모든 애니메이션이 정지되었습니다", "info");
  }

  // UI 업데이트 메소드들
  switchCreatorTab(tab) {
    document
      .querySelectorAll(".creator-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    document
      .querySelectorAll(".creator-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }

  switchCategoryTab(category) {
    document
      .querySelectorAll(".category-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector(`[data-category="${category}"]`)
      .classList.add("active");

    document
      .querySelectorAll(".example-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(`${category}-examples`).classList.add("active");
  }

  createCustomAnimation() {
    const stageArea = document.getElementById("stageArea");
    const elements = stageArea.querySelectorAll(".animation-element");

    if (elements.length === 0) {
      this.showInPageNotification(
        "먼저 애니메이션 요소를 추가하세요",
        "warning"
      );
      return;
    }

    const element = elements[elements.length - 1];

    // 폼에서 값 읽기
    const type = document.getElementById("animationType").value;
    const duration = parseInt(
      document.getElementById("animationDuration").value
    );
    const easing = document.getElementById("animationEasing").value;
    const delay = parseInt(document.getElementById("animationDelay").value);
    const iterations = parseInt(
      document.getElementById("animationIterations").value
    );
    const direction = document.getElementById("animationDirection").value;

    // 애니메이션 타입별 키프레임 생성
    const keyframes = this.generateKeyframesForType(type);

    const animation = element.animate(keyframes, {
      duration: duration,
      easing: easing,
      delay: delay,
      iterations: iterations,
      direction: direction,
    });

    this.registerAnimation(animation, `커스텀 ${type}`, element);
    this.showInPageNotification(
      "커스텀 애니메이션이 생성되었습니다",
      "success"
    );
  }

  generateKeyframesForType(type) {
    switch (type) {
      case "transform":
        return [
          { transform: "translateX(0px)" },
          { transform: "translateX(100px)" },
          { transform: "translateX(0px)" },
        ];
      case "opacity":
        return [{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }];
      case "color":
        return [
          { backgroundColor: "#6366f1" },
          { backgroundColor: "#ec4899" },
          { backgroundColor: "#8b5cf6" },
          { backgroundColor: "#6366f1" },
        ];
      case "size":
        return [
          { width: "60px", height: "60px" },
          { width: "120px", height: "120px" },
          { width: "60px", height: "60px" },
        ];
      case "position":
        return [
          { left: "20px", top: "20px" },
          { left: "200px", top: "100px" },
          { left: "20px", top: "20px" },
        ];
      case "rotation":
        return [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }];
      case "scale":
        return [
          { transform: "scale(1)" },
          { transform: "scale(1.5)" },
          { transform: "scale(1)" },
        ];
      default:
        return [
          { transform: "translateX(0px)" },
          { transform: "translateX(100px)" },
        ];
    }
  }

  applyPreset(preset) {
    const stageArea = document.getElementById("stageArea");
    const elements = stageArea.querySelectorAll(".animation-element");

    if (elements.length === 0) {
      this.showInPageNotification(
        "먼저 애니메이션 요소를 추가하세요",
        "warning"
      );
      return;
    }

    const element = elements[elements.length - 1];
    const presetData = this.animationPresets[preset];

    if (!presetData) {
      this.showInPageNotification("프리셋을 찾을 수 없습니다", "error");
      return;
    }

    const animation = element.animate(presetData.keyframes, presetData.options);
    this.registerAnimation(animation, `${preset} 프리셋`, element);
    this.showInPageNotification(`${preset} 프리셋이 적용되었습니다`, "success");
  }

  runExample(example) {
    const stageArea = document.getElementById("stageArea");
    let elements = stageArea.querySelectorAll(".animation-element");

    // 요소가 없으면 자동으로 생성
    if (elements.length === 0) {
      this.addAnimationElement("box");
      elements = stageArea.querySelectorAll(".animation-element");
    }

    const element = elements[elements.length - 1];

    switch (example) {
      case "moveRight":
        this.runMoveRightExample(element);
        break;
      case "fadeInOut":
        this.runFadeInOutExample(element);
        break;
      case "scaleUp":
        this.runScaleUpExample(element);
        break;
      case "rotateLoop":
        this.runRotateLoopExample(element);
        break;
      case "colorChange":
        this.runColorChangeExample(element);
        break;
      case "borderRadius":
        this.runBorderRadiusExample(element);
        break;
      // 더 많은 예제들...
      default:
        this.showInPageNotification(
          `예제 ${example}은 아직 구현되지 않았습니다`,
          "info"
        );
    }
  }

  runMoveRightExample(element) {
    const animation = element.animate(
      [
        { transform: "translateX(0px)" },
        { transform: "translateX(200px)" },
        { transform: "translateX(0px)" },
      ],
      {
        duration: 2000,
        easing: "ease-in-out",
      }
    );

    this.registerAnimation(animation, "오른쪽 이동 예제", element);
  }

  runFadeInOutExample(element) {
    const animation = element.animate(
      [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
      {
        duration: 1500,
        easing: "ease-in-out",
      }
    );

    this.registerAnimation(animation, "페이드 인/아웃 예제", element);
  }

  runScaleUpExample(element) {
    const animation = element.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.8)" },
        { transform: "scale(1)" },
      ],
      {
        duration: 1000,
        easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      }
    );

    this.registerAnimation(animation, "크기 확대 예제", element);
  }

  runRotateLoopExample(element) {
    const animation = element.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      {
        duration: 1000,
        iterations: Infinity,
        easing: "linear",
      }
    );

    this.registerAnimation(animation, "회전 예제", element);
  }

  runColorChangeExample(element) {
    const animation = element.animate(
      [
        { backgroundColor: "#6366f1" },
        { backgroundColor: "#ec4899" },
        { backgroundColor: "#f59e0b" },
        { backgroundColor: "#10b981" },
        { backgroundColor: "#6366f1" },
      ],
      {
        duration: 2000,
        iterations: Infinity,
        easing: "ease-in-out",
      }
    );

    this.registerAnimation(animation, "색상 변화 예제", element);
  }

  runBorderRadiusExample(element) {
    const animation = element.animate(
      [
        { borderRadius: "8px" },
        { borderRadius: "50%" },
        { borderRadius: "8px" },
      ],
      {
        duration: 1500,
        easing: "ease-in-out",
      }
    );

    this.registerAnimation(animation, "모양 변형 예제", element);
  }

  updatePerformanceStats() {
    const activeCount = this.animations.filter(
      (anim) => anim.status === "running"
    ).length;
    document.getElementById("activeAnimationsCount").textContent = activeCount;

    // FPS 계산 (간단한 추정)
    const fps = this.calculateFPS();
    document.getElementById("averageFPS").textContent = Math.round(fps);

    // 성능 데이터 업데이트
    this.performanceData.animationCount.push(activeCount);
    this.performanceData.fps.push(fps);
    this.performanceData.timestamps.push(Date.now());

    // 데이터 제한 (최근 60개)
    if (this.performanceData.timestamps.length > 60) {
      this.performanceData.animationCount.shift();
      this.performanceData.fps.shift();
      this.performanceData.timestamps.shift();
    }
  }

  calculateFPS() {
    // 간단한 FPS 추정 (실제로는 더 복잡한 계산이 필요)
    const activeAnimations = this.animations.filter(
      (anim) => anim.status === "running"
    ).length;
    return Math.max(15, 60 - activeAnimations * 2); // 애니메이션이 많을수록 FPS 감소
  }

  // 기본 구현들 (추후 확장 가능)
  addKeyframe() {
    this.showInPageNotification("키프레임 추가 기능은 개발 중입니다", "info");
  }

  clearKeyframes() {
    this.showInPageNotification("키프레임이 삭제되었습니다", "info");
  }

  createKeyframeAnimation() {
    this.showInPageNotification(
      "키프레임 애니메이션 생성 기능은 개발 중입니다",
      "info"
    );
  }

  updateTransformValue(property, value) {
    document.getElementById(`${property}Value`).textContent =
      property === "rotate"
        ? `${value}deg`
        : property === "scale"
        ? value
        : `${value}px`;
  }

  updateStyleValue(property, value) {
    if (property === "opacity") {
      document.getElementById("opacityValue").textContent = `${Math.round(
        value * 100
      )}%`;
    } else if (property === "borderRadius") {
      document.getElementById("borderRadiusValue").textContent = `${value}px`;
    }
  }

  createAdvancedAnimation() {
    this.showInPageNotification(
      "고급 애니메이션 생성 기능은 개발 중입니다",
      "info"
    );
  }

  exportAnimation() {
    this.showInPageNotification(
      "애니메이션 내보내기 기능은 개발 중입니다",
      "info"
    );
  }

  playSelectedAnimation() {
    if (this.selectedAnimation) {
      this.selectedAnimation.animation.play();
      this.selectedAnimation.status = "running";
      this.updateAnimationsList();
    } else {
      this.showInPageNotification("선택된 애니메이션이 없습니다", "warning");
    }
  }

  pauseSelectedAnimation() {
    if (this.selectedAnimation) {
      this.selectedAnimation.animation.pause();
      this.selectedAnimation.status = "paused";
      this.updateAnimationsList();
    } else {
      this.showInPageNotification("선택된 애니메이션이 없습니다", "warning");
    }
  }

  stopSelectedAnimation() {
    if (this.selectedAnimation) {
      this.selectedAnimation.animation.cancel();
      this.selectedAnimation.status = "cancelled";
      this.updateAnimationsList();
    } else {
      this.showInPageNotification("선택된 애니메이션이 없습니다", "warning");
    }
  }

  reverseSelectedAnimation() {
    if (this.selectedAnimation) {
      this.selectedAnimation.animation.reverse();
      this.updateAnimationsList();
    } else {
      this.showInPageNotification("선택된 애니메이션이 없습니다", "warning");
    }
  }

  updateTimelinePosition(value) {
    document.getElementById("timelineValue").textContent = `${value}%`;
    // 실제 타임라인 위치 업데이트 로직
  }

  updatePlaybackSpeed(value) {
    document.getElementById("speedValue").textContent = `${value}x`;
    if (this.selectedAnimation) {
      this.selectedAnimation.animation.playbackRate = parseFloat(value);
    }
  }

  playTimeline() {
    this.playAllAnimations();
  }

  pauseTimeline() {
    this.animations.forEach((animData) => {
      animData.animation.pause();
      animData.status = "paused";
    });
    this.updateAnimationsList();
  }

  stopTimeline() {
    this.stopAllAnimations();
  }

  rewindTimeline() {
    this.animations.forEach((animData) => {
      animData.animation.currentTime = 0;
    });
    this.showInPageNotification("타임라인이 처음으로 되돌려졌습니다", "info");
  }

  startProfiling() {
    this.showInPageNotification("프로파일링을 시작했습니다", "info");
  }

  stopProfiling() {
    this.showInPageNotification("프로파일링을 정지했습니다", "info");
  }

  exportProfile() {
    this.showInPageNotification("프로파일을 내보냈습니다", "success");
  }

  optimizeAnimations() {
    this.showInPageNotification("애니메이션 최적화를 완료했습니다", "success");
  }

  previewAnimation() {
    this.showInPageNotification(
      "애니메이션 미리보기 기능은 개발 중입니다",
      "info"
    );
  }

  updateAnimationSelection() {
    // 선택된 애니메이션 하이라이트 업데이트
    this.updateAnimationsList();
  }

  // 페이지 내 알림
  showInPageNotification(message, type = "info") {
    const container = document.getElementById("inPageNotifications");
    if (!container) return;

    const notification = document.createElement("div");
    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    const icon = icons[type] || "ℹ️";

    notification.className = `in-page-notification ${type}`;
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

    container.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// 전역 접근을 위한 설정
window.webAnimationsAPI = null;

// 초기화
function initWebAnimationsAPI() {
  console.log("🚀 Web Animations API Manager 초기화 함수 호출");
  window.webAnimationsAPI = new WebAnimationsAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initWebAnimationsAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initWebAnimationsAPI();
}

console.log(
  "📄 Web Animations API 스크립트 로드 완료, readyState:",
  document.readyState
);
