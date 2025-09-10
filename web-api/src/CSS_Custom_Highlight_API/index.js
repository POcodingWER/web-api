import "./style.css";

console.log("🎨 CSS Custom Highlight API 스크립트 시작!");

class CSSCustomHighlightAPI {
  constructor() {
    this.highlights = new Map();
    this.currentTheme = "default";
    this.searchResults = [];
    this.annotations = new Map();
    this.collaborativeHighlights = new Map();
    this.undoStack = [];
    this.redoStack = [];
    this.isSelectionMode = false;
    this.init();
  }

  init() {
    console.log("🎨 CSS Custom Highlight API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.registerHighlightStyles();
    this.loadSampleContent();
    console.log("✅ CSS Custom Highlight API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 CSS Custom Highlight API 지원 여부 확인 중...");

    const support = {
      CSS: !!window.CSS,
      highlights: !!(window.CSS && window.CSS.highlights),
      Highlight: !!window.Highlight,
      Range: !!window.Range,
      Selection: !!window.getSelection,
    };

    console.log("CSS Custom Highlight API 지원 상태:", support);

    if (!support.highlights) {
      this.showNotification(
        "이 브라우저는 CSS Custom Highlight API를 지원하지 않습니다",
        "warning"
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
      <div class="css-highlight-container">
        <header class="css-highlight-header">
          <h1>🎨 CSS Custom Highlight API</h1>
          <p>브라우저 네이티브 텍스트 하이라이팅</p>
          <div class="api-support">
            <div class="support-badge ${
              support.CSS ? "supported" : "unsupported"
            }">
              ${support.CSS ? "✅ CSS API" : "❌ CSS API"}
            </div>
            <div class="support-badge ${
              support.highlights ? "supported" : "unsupported"
            }">
              ${support.highlights ? "✅ CSS.highlights" : "❌ CSS.highlights"}
            </div>
            <div class="support-badge ${
              support.Highlight ? "supported" : "unsupported"
            }">
              ${support.Highlight ? "✅ Highlight" : "❌ Highlight"}
            </div>
            <div class="support-badge ${
              support.Range ? "supported" : "unsupported"
            }">
              ${support.Range ? "✅ Range" : "❌ Range"}
            </div>
          </div>
        </header>

        <main class="css-highlight-main">
          <div class="control-section">
            <div class="highlight-card primary">
              <h2>🎯 하이라이트 제어</h2>
              
              <div class="highlight-controls">
                <div class="control-group">
                  <label for="highlightTheme">하이라이트 테마:</label>
                  <select id="highlightTheme">
                    <option value="default">기본 (노란색)</option>
                    <option value="important">중요 (빨간색)</option>
                    <option value="note">노트 (파란색)</option>
                    <option value="question">질문 (보라색)</option>
                    <option value="success">성공 (초록색)</option>
                    <option value="warning">경고 (주황색)</option>
                  </select>
                </div>

                <div class="control-buttons">
                  <button id="enableSelection" class="btn-primary">
                    ✋ 선택 모드 활성화
                  </button>
                  <button id="clearAllHighlights" class="btn-danger">
                    🗑️ 모든 하이라이트 제거
                  </button>
                  <button id="undoHighlight" class="btn-secondary">
                    ↶ 실행 취소
                  </button>
                  <button id="redoHighlight" class="btn-secondary">
                    ↷ 다시 실행
                  </button>
                </div>
              </div>

              <div class="selection-info" id="selectionInfo">
                텍스트를 선택하여 하이라이트를 추가하세요
              </div>
            </div>

            <div class="highlight-card">
              <h2>🔍 검색 하이라이트</h2>
              
              <div class="search-controls">
                <div class="search-input-group">
                  <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="검색할 텍스트를 입력하세요..."
                  >
                  <button id="searchHighlight" class="btn-accent">
                    🔍 검색
                  </button>
                </div>

                <div class="search-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="caseSensitive">
                    <span class="checkmark"></span>
                    대소문자 구분
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="wholeWord">
                    <span class="checkmark"></span>
                    전체 단어만
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="useRegex">
                    <span class="checkmark"></span>
                    정규식 사용
                  </label>
                </div>

                <div class="search-results" id="searchResults">
                  검색 결과: 0개
                </div>
              </div>
            </div>
          </div>

          <div class="content-section">
            <div class="highlight-card">
              <h2>📄 편집 가능한 콘텐츠</h2>
              
              <div class="content-toolbar">
                <button id="loadSample1" class="btn-accent">
                  📖 소설 샘플
                </button>
                <button id="loadSample2" class="btn-accent">
                  📰 뉴스 샘플
                </button>
                <button id="loadSample3" class="btn-accent">
                  💻 코드 샘플
                </button>
                <button id="clearContent" class="btn-secondary">
                  🗑️ 내용 지우기
                </button>
              </div>

              <div 
                id="editableContent" 
                class="editable-content" 
                contenteditable="true"
                spellcheck="false"
              >
                <!-- 샘플 콘텐츠가 여기에 로드됩니다 -->
              </div>
            </div>

            <div class="highlight-card">
              <h2>📝 주석 시스템</h2>
              
              <div class="annotation-controls">
                <div class="annotation-input-group">
                  <textarea 
                    id="annotationText" 
                    placeholder="선택한 텍스트에 대한 주석을 입력하세요..."
                    rows="3"
                  ></textarea>
                  <button id="addAnnotation" class="btn-primary" disabled>
                    📌 주석 추가
                  </button>
                </div>

                <div class="annotation-list" id="annotationList">
                  <div class="annotation-placeholder">
                    주석이 있는 텍스트를 선택하면 여기에 표시됩니다
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="management-section">
            <div class="highlight-card">
              <h2>📊 하이라이트 관리</h2>
              
              <div class="highlight-stats">
                <div class="stat-item">
                  <div class="stat-label">총 하이라이트</div>
                  <div class="stat-value" id="totalHighlights">0</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">검색 결과</div>
                  <div class="stat-value" id="searchCount">0</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">주석</div>
                  <div class="stat-value" id="annotationCount">0</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">활성 테마</div>
                  <div class="stat-value" id="activeTheme">기본</div>
                </div>
              </div>

              <div class="highlight-list" id="highlightList">
                <div class="list-placeholder">
                  하이라이트가 생성되면 여기에 목록이 표시됩니다
                </div>
              </div>
            </div>

            <div class="highlight-card">
              <h2>💾 데이터 관리</h2>
              
              <div class="data-controls">
                <div class="export-controls">
                  <button id="exportHighlights" class="btn-accent">
                    📤 하이라이트 내보내기
                  </button>
                  <button id="importHighlights" class="btn-accent">
                    📥 하이라이트 가져오기
                  </button>
                  <input 
                    type="file" 
                    id="importFile" 
                    accept=".json"
                    style="display: none;"
                  >
                </div>

                <div class="storage-info">
                  <div class="storage-item">
                    <span class="storage-label">저장된 하이라이트:</span>
                    <span class="storage-value" id="storedCount">0</span>
                  </div>
                  <div class="storage-item">
                    <span class="storage-label">마지막 저장:</span>
                    <span class="storage-value" id="lastSaved">없음</span>
                  </div>
                </div>

                <div class="auto-save-toggle">
                  <label class="checkbox-label">
                    <input type="checkbox" id="autoSave" checked>
                    <span class="checkmark"></span>
                    자동 저장
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <div class="highlight-card">
              <h2>🎮 실시간 데모</h2>
              
              <div class="demo-controls">
                <button id="demoBasic" class="btn-primary">
                  🎯 기본 하이라이팅 데모
                </button>
                <button id="demoSearch" class="btn-accent">
                  🔍 검색 하이라이팅 데모
                </button>
                <button id="demoThemes" class="btn-warning">
                  🎨 테마 변경 데모
                </button>
                <button id="demoCollaboration" class="btn-success">
                  👥 협업 하이라이팅 데모
                </button>
              </div>

              <div class="demo-status" id="demoStatus">
                데모를 선택하여 CSS Custom Highlight API 기능을 체험해보세요
              </div>
            </div>

            <div class="highlight-card">
              <h2>💡 활용 예시</h2>
              
              <div class="usage-content">
                <div class="code-example">
                  <h3>기본 사용법:</h3>
                  <pre><code>// Range 생성
const range = new Range();
range.setStart(textNode, startOffset);
range.setEnd(textNode, endOffset);

// Highlight 생성
const highlight = new Highlight(range);

// CSS.highlights에 등록
CSS.highlights.set('my-highlight', highlight);

// CSS로 스타일링
::highlight(my-highlight) {
  background-color: yellow;
  color: black;
}</code></pre>
                </div>

                <div class="use-cases">
                  <h3>🎯 주요 사용 사례:</h3>
                  <ul class="use-case-list">
                    <li><strong>텍스트 에디터:</strong> 구문 강조 및 편집 기능</li>
                    <li><strong>검색 결과:</strong> 검색어 하이라이팅</li>
                    <li><strong>주석 시스템:</strong> 문서 내 주석 및 메모</li>
                    <li><strong>협업 도구:</strong> 실시간 공동 편집</li>
                    <li><strong>학습 도구:</strong> 중요 내용 표시</li>
                    <li><strong>코드 리뷰:</strong> 변경사항 하이라이팅</li>
                  </ul>
                </div>

                <div class="browser-support">
                  <h3>🌐 브라우저 지원:</h3>
                  <div class="support-grid">
                    <div class="support-item">
                      <span class="browser-name">Chrome</span>
                      <span class="support-status supported">105+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Firefox</span>
                      <span class="support-status partial">플래그 필요 ⚠️</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Safari</span>
                      <span class="support-status unsupported">미지원 ❌</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Edge</span>
                      <span class="support-status supported">105+ ✅</span>
                    </div>
                  </div>
                </div>
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

    // 테마 변경
    const themeSelect = document.getElementById("highlightTheme");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.currentTheme = e.target.value;
        this.updateActiveTheme();
      });
    }

    // 선택 모드 토글
    const enableSelectionBtn = document.getElementById("enableSelection");
    if (enableSelectionBtn) {
      enableSelectionBtn.addEventListener("click", () =>
        this.toggleSelectionMode()
      );
    }

    // 하이라이트 제거
    const clearAllBtn = document.getElementById("clearAllHighlights");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => this.clearAllHighlights());
    }

    // 실행 취소/다시 실행
    const undoBtn = document.getElementById("undoHighlight");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => this.undoHighlight());
    }

    const redoBtn = document.getElementById("redoHighlight");
    if (redoBtn) {
      redoBtn.addEventListener("click", () => this.redoHighlight());
    }

    // 검색
    const searchBtn = document.getElementById("searchHighlight");
    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.performSearch());
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch();
        }
      });
    }

    // 샘플 콘텐츠 로드
    const loadSample1Btn = document.getElementById("loadSample1");
    if (loadSample1Btn) {
      loadSample1Btn.addEventListener("click", () =>
        this.loadSampleContent("novel")
      );
    }

    const loadSample2Btn = document.getElementById("loadSample2");
    if (loadSample2Btn) {
      loadSample2Btn.addEventListener("click", () =>
        this.loadSampleContent("news")
      );
    }

    const loadSample3Btn = document.getElementById("loadSample3");
    if (loadSample3Btn) {
      loadSample3Btn.addEventListener("click", () =>
        this.loadSampleContent("code")
      );
    }

    const clearContentBtn = document.getElementById("clearContent");
    if (clearContentBtn) {
      clearContentBtn.addEventListener("click", () => this.clearContent());
    }

    // 주석 추가
    const addAnnotationBtn = document.getElementById("addAnnotation");
    if (addAnnotationBtn) {
      addAnnotationBtn.addEventListener("click", () => this.addAnnotation());
    }

    // 데이터 관리
    const exportBtn = document.getElementById("exportHighlights");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportHighlights());
    }

    const importBtn = document.getElementById("importHighlights");
    if (importBtn) {
      importBtn.addEventListener("click", () => this.importHighlights());
    }

    const importFile = document.getElementById("importFile");
    if (importFile) {
      importFile.addEventListener("change", (e) => this.handleFileImport(e));
    }

    // 데모 버튼들
    const demoBasicBtn = document.getElementById("demoBasic");
    if (demoBasicBtn) {
      demoBasicBtn.addEventListener("click", () => this.runBasicDemo());
    }

    const demoSearchBtn = document.getElementById("demoSearch");
    if (demoSearchBtn) {
      demoSearchBtn.addEventListener("click", () => this.runSearchDemo());
    }

    const demoThemesBtn = document.getElementById("demoThemes");
    if (demoThemesBtn) {
      demoThemesBtn.addEventListener("click", () => this.runThemesDemo());
    }

    const demoCollabBtn = document.getElementById("demoCollaboration");
    if (demoCollabBtn) {
      demoCollabBtn.addEventListener("click", () =>
        this.runCollaborationDemo()
      );
    }

    // 텍스트 선택 이벤트
    document.addEventListener("selectionchange", () =>
      this.handleSelectionChange()
    );

    // 자동 저장
    const autoSaveCheckbox = document.getElementById("autoSave");
    if (autoSaveCheckbox) {
      autoSaveCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.enableAutoSave();
        } else {
          this.disableAutoSave();
        }
      });
    }

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  registerHighlightStyles() {
    if (!CSS.highlights) {
      console.warn("CSS.highlights를 지원하지 않습니다");
      return;
    }

    // 기본 하이라이트 스타일은 CSS에서 정의
    console.log("✅ 하이라이트 스타일 등록 완료");
  }

  loadSampleContent(type = "default") {
    const contentDiv = document.getElementById("editableContent");
    if (!contentDiv) return;

    let content = "";

    switch (type) {
      case "novel":
        content = `
          <h3>🌟 어린 왕자 (Le Petit Prince)</h3>
          <p>옛날 어느 책에서 원시림에 관한 이야기를 읽은 적이 있다. 그 책에는 보아뱀이 짐승을 통째로 삼켜 버린다고 쓰여 있었다.</p>
          
          <p>나는 그 글을 읽고 깊이 생각해 보았다. 그리고 색연필로 내 생애 첫 그림을 그렸다. 내 첫 번째 작품은 이런 것이었다.</p>
          
          <p>나는 이 걸작을 어른들에게 보여 주며 무서운지 물어보았다. 그러자 어른들은 "모자가 왜 무섭다는 거니?"라고 대답했다.</p>
          
          <p>내 그림은 모자가 아니었다. 코끼리를 삼킨 보아뱀이었다. 그래서 나는 어른들이 이해할 수 있도록 보아뱀의 속을 그려 보였다.</p>
          
          <p>어른들은 언제나 설명을 필요로 한다. 나는 이 두 번째 그림도 보여 주었다. 그러자 어른들은 보아뱀이고 뭐고 집어치우고 지리나 역사, 산수, 문법 공부나 하라고 충고했다.</p>
          
          <p>이렇게 해서 여섯 살 때 화가가 되려던 내 꿈은 포기하게 되었다. 첫 번째와 두 번째 그림의 실패로 낙담한 것이다.</p>
        `;
        break;

      case "news":
        content = `
          <h3>📰 기술 뉴스: 웹 표준의 새로운 발전</h3>
          <p><strong>2024년 3월 15일</strong> - 웹 브라우저 개발진들이 새로운 웹 표준 API 개발에 박차를 가하고 있다.</p>
          
          <p>특히 <strong>CSS Custom Highlight API</strong>는 웹 개발자들에게 새로운 가능성을 제시하고 있다. 이 API는 개발자가 임의의 텍스트 범위를 선택하여 하이라이트할 수 있게 해준다.</p>
          
          <p>Google Chrome 팀의 개발자에 따르면, "이 API는 기존의 DOM 조작 없이도 텍스트 하이라이팅이 가능하다"고 설명했다. 이는 <strong>성능 향상</strong>과 <strong>사용자 경험 개선</strong>에 크게 기여할 것으로 예상된다.</p>
          
          <p>현재 Chrome 105+ 버전에서 지원되고 있으며, Firefox는 실험적 플래그를 통해 테스트할 수 있다. Safari는 아직 구현 계획을 발표하지 않았다.</p>
          
          <p>웹 개발 커뮤니티에서는 이 기능이 <em>텍스트 에디터</em>, <em>검색 기능</em>, <em>주석 시스템</em> 등에 활용될 것으로 기대하고 있다.</p>
        `;
        break;

      case "code":
        content = `
          <h3>💻 JavaScript 코드 예제</h3>
          <pre><code>// CSS Custom Highlight API 사용 예제
function highlightText(startNode, startOffset, endNode, endOffset, highlightName) {
  // Range 객체 생성
  const range = new Range();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  
  // Highlight 객체 생성
  const highlight = new Highlight(range);
  
  // CSS.highlights 레지스트리에 등록
  CSS.highlights.set(highlightName, highlight);
  
  console.log(\`하이라이트 '\${highlightName}' 생성됨\`);
}

// 사용 예제
const textNode = document.querySelector('p').firstChild;
highlightText(textNode, 0, textNode, 10, 'example-highlight');

// CSS에서 스타일링
/*
::highlight(example-highlight) {
  background-color: yellow;
  color: black;
}
*/</code></pre>
          
          <p>위 코드는 CSS Custom Highlight API의 기본적인 사용법을 보여준다. <strong>Range</strong> 객체로 텍스트 범위를 정의하고, <strong>Highlight</strong> 객체로 하이라이트를 생성한 후, <strong>CSS.highlights</strong>에 등록하는 과정이다.</p>
          
          <p>주요 장점:</p>
          <ul>
            <li><strong>DOM 변경 없음</strong>: 기존 HTML 구조를 수정하지 않음</li>
            <li><strong>성능 최적화</strong>: 브라우저 네이티브 구현으로 빠른 렌더링</li>
            <li><strong>CSS 제어</strong>: 순수 CSS로 스타일링 가능</li>
            <li><strong>동적 관리</strong>: JavaScript로 실시간 추가/제거 가능</li>
          </ul>
        `;
        break;

      default:
        content = `
          <h3>📝 CSS Custom Highlight API 테스트</h3>
          <p>이 텍스트는 <strong>CSS Custom Highlight API</strong>를 테스트하기 위한 샘플 콘텐츠입니다.</p>
          
          <p>원하는 텍스트를 마우스로 선택한 후 하이라이트를 추가해보세요. 다양한 <em>테마</em>와 <em>색상</em>을 사용할 수 있습니다.</p>
          
          <p>검색 기능을 사용하여 특정 단어나 구문을 찾아 하이라이트할 수도 있습니다. 정규식도 지원합니다!</p>
          
          <blockquote>
            "CSS Custom Highlight API는 웹에서 텍스트 하이라이팅의 새로운 표준을 제시합니다."
          </blockquote>
          
          <p>자유롭게 텍스트를 편집하고 다양한 기능을 실험해보세요.</p>
        `;
    }

    contentDiv.innerHTML = content;
    this.clearAllHighlights();
    this.updateStats();
    this.showNotification(
      `${this.getContentTypeName(type)} 콘텐츠가 로드되었습니다`,
      "success"
    );
  }

  getContentTypeName(type) {
    const names = {
      novel: "소설",
      news: "뉴스",
      code: "코드",
      default: "기본",
    };
    return names[type] || "기본";
  }

  clearContent() {
    const contentDiv = document.getElementById("editableContent");
    if (contentDiv) {
      contentDiv.innerHTML = "<p>새로운 내용을 입력하세요...</p>";
      this.clearAllHighlights();
      this.showNotification("콘텐츠가 지워졌습니다", "info");
    }
  }

  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    const btn = document.getElementById("enableSelection");

    if (btn) {
      if (this.isSelectionMode) {
        btn.textContent = "🚫 선택 모드 비활성화";
        btn.className = "btn-danger";
      } else {
        btn.textContent = "✋ 선택 모드 활성화";
        btn.className = "btn-primary";
      }
    }

    this.updateSelectionInfo();
    this.showNotification(
      this.isSelectionMode
        ? "선택 모드가 활성화되었습니다"
        : "선택 모드가 비활성화되었습니다",
      "info"
    );
  }

  handleSelectionChange() {
    const selection = window.getSelection();

    if (!selection.rangeCount || selection.isCollapsed) {
      this.updateSelectionInfo();
      this.updateAnnotationButton(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText.length > 0) {
      this.updateSelectionInfo(selectedText);
      this.updateAnnotationButton(true);

      // 선택 모드가 활성화되어 있으면 자동으로 하이라이트 추가
      if (this.isSelectionMode) {
        this.addHighlightFromSelection();
      }
    } else {
      this.updateSelectionInfo();
      this.updateAnnotationButton(false);
    }
  }

  addHighlightFromSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0).cloneRange();
    const selectedText = range.toString();

    if (selectedText.trim().length === 0) return;

    // 하이라이트 생성
    const highlightId = `highlight-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      this.addHighlight(highlightId, range, selectedText);
      this.saveToUndoStack();
      this.updateStats();
      this.updateHighlightList();

      // 선택 해제
      selection.removeAllRanges();

      this.showNotification(
        `"${this.truncateText(selectedText, 30)}" 하이라이트가 추가되었습니다`,
        "success"
      );
    } catch (error) {
      console.error("하이라이트 추가 실패:", error);
      this.showNotification("하이라이트 추가에 실패했습니다", "error");
    }
  }

  addHighlight(id, range, text) {
    if (!CSS.highlights) {
      this.showNotification(
        "CSS Custom Highlight API를 지원하지 않습니다",
        "error"
      );
      return;
    }

    // Highlight 객체 생성
    const highlight = new Highlight(range);

    // CSS.highlights에 등록
    CSS.highlights.set(id, highlight);

    // 내부 관리용 데이터 저장
    this.highlights.set(id, {
      highlight,
      range: range.cloneRange(),
      text,
      theme: this.currentTheme,
      timestamp: Date.now(),
      annotation: null,
    });

    console.log(`하이라이트 추가: ${id}`);
  }

  performSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      this.showNotification("검색어를 입력하세요", "warning");
      return;
    }

    // 이전 검색 결과 제거
    this.clearSearchHighlights();

    const caseSensitive =
      document.getElementById("caseSensitive")?.checked || false;
    const wholeWord = document.getElementById("wholeWord")?.checked || false;
    const useRegex = document.getElementById("useRegex")?.checked || false;

    try {
      let pattern;
      if (useRegex) {
        pattern = new RegExp(searchTerm, caseSensitive ? "g" : "gi");
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordBoundary = wholeWord ? "\\b" : "";
        pattern = new RegExp(
          `${wordBoundary}${escapedTerm}${wordBoundary}`,
          caseSensitive ? "g" : "gi"
        );
      }

      const contentDiv = document.getElementById("editableContent");
      if (!contentDiv) return;

      const walker = document.createTreeWalker(
        contentDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let textNode;
      let matchCount = 0;

      while ((textNode = walker.nextNode())) {
        const text = textNode.textContent;
        let match;

        // 정규식을 초기화
        pattern.lastIndex = 0;

        while ((match = pattern.exec(text)) !== null) {
          const range = new Range();
          range.setStart(textNode, match.index);
          range.setEnd(textNode, match.index + match[0].length);

          const searchId = `search-${matchCount}`;
          this.addSearchHighlight(searchId, range, match[0]);
          matchCount++;

          // 무한 루프 방지
          if (!pattern.global) break;
        }
      }

      this.updateSearchResults(matchCount);
      this.showNotification(
        `${matchCount}개의 검색 결과를 찾았습니다`,
        "success"
      );
    } catch (error) {
      console.error("검색 실패:", error);
      this.showNotification("검색 중 오류가 발생했습니다", "error");
    }
  }

  addSearchHighlight(id, range, text) {
    if (!CSS.highlights) return;

    const highlight = new Highlight(range);
    CSS.highlights.set(id, highlight);

    this.searchResults.push({
      id,
      highlight,
      range: range.cloneRange(),
      text,
    });
  }

  clearSearchHighlights() {
    this.searchResults.forEach((result) => {
      CSS.highlights.delete(result.id);
    });
    this.searchResults = [];
    this.updateSearchResults(0);
  }

  clearAllHighlights() {
    // 일반 하이라이트 제거
    this.highlights.forEach((_, id) => {
      CSS.highlights.delete(id);
    });
    this.highlights.clear();

    // 검색 하이라이트 제거
    this.clearSearchHighlights();

    // 주석 제거
    this.annotations.clear();

    this.updateStats();
    this.updateHighlightList();
    this.updateAnnotationList();
    this.showNotification("모든 하이라이트가 제거되었습니다", "info");
  }

  undoHighlight() {
    if (this.undoStack.length === 0) {
      this.showNotification("실행 취소할 작업이 없습니다", "warning");
      return;
    }

    const action = this.undoStack.pop();
    this.redoStack.push(action);

    this.applyAction(action, true);
    this.updateStats();
    this.updateHighlightList();
  }

  redoHighlight() {
    if (this.redoStack.length === 0) {
      this.showNotification("다시 실행할 작업이 없습니다", "warning");
      return;
    }

    const action = this.redoStack.pop();
    this.undoStack.push(action);

    this.applyAction(action, false);
    this.updateStats();
    this.updateHighlightList();
  }

  saveToUndoStack() {
    // 현재 상태를 저장
    const action = {
      type: "highlight",
      highlights: new Map(this.highlights),
      timestamp: Date.now(),
    };

    this.undoStack.push(action);
    this.redoStack = []; // 새 작업 시 redo 스택 초기화

    // 스택 크기 제한
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  applyAction(action, isUndo) {
    // 현재 하이라이트 제거
    this.highlights.forEach((_, id) => {
      CSS.highlights.delete(id);
    });

    // 액션의 하이라이트 복원
    this.highlights = new Map(action.highlights);
    this.highlights.forEach((data, id) => {
      CSS.highlights.set(id, data.highlight);
    });
  }

  addAnnotation() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      this.showNotification("텍스트를 선택해주세요", "warning");
      return;
    }

    const annotationTextarea = document.getElementById("annotationText");
    if (!annotationTextarea) return;

    const annotationText = annotationTextarea.value.trim();
    if (!annotationText) {
      this.showNotification("주석 내용을 입력해주세요", "warning");
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    const selectedText = range.toString();

    // 주석 하이라이트 추가
    const annotationId = `annotation-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      this.addHighlight(annotationId, range, selectedText);

      // 주석 데이터 추가
      this.annotations.set(annotationId, {
        text: annotationText,
        selectedText,
        timestamp: Date.now(),
      });

      // 하이라이트 데이터에 주석 연결
      if (this.highlights.has(annotationId)) {
        this.highlights.get(annotationId).annotation = annotationText;
      }

      this.saveToUndoStack();
      this.updateStats();
      this.updateHighlightList();
      this.updateAnnotationList();

      // 입력 필드 초기화
      annotationTextarea.value = "";
      selection.removeAllRanges();

      this.showNotification("주석이 추가되었습니다", "success");
    } catch (error) {
      console.error("주석 추가 실패:", error);
      this.showNotification("주석 추가에 실패했습니다", "error");
    }
  }

  exportHighlights() {
    const data = {
      highlights: Array.from(this.highlights.entries()).map(([id, data]) => ({
        id,
        text: data.text,
        theme: data.theme,
        timestamp: data.timestamp,
        annotation: data.annotation,
        // Range는 직렬화할 수 없으므로 텍스트 정보만 저장
        startContainer: this.getNodePath(data.range.startContainer),
        startOffset: data.range.startOffset,
        endContainer: this.getNodePath(data.range.endContainer),
        endOffset: data.range.endOffset,
      })),
      annotations: Array.from(this.annotations.entries()),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `highlights-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    this.showNotification("하이라이트가 내보내졌습니다", "success");
  }

  importHighlights() {
    const fileInput = document.getElementById("importFile");
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.loadHighlightsFromData(data);
        this.showNotification("하이라이트가 가져와졌습니다", "success");
      } catch (error) {
        console.error("파일 읽기 실패:", error);
        this.showNotification("파일을 읽을 수 없습니다", "error");
      }
    };
    reader.readAsText(file);
  }

  loadHighlightsFromData(data) {
    // 기존 하이라이트 제거
    this.clearAllHighlights();

    // 주석 복원
    if (data.annotations) {
      this.annotations = new Map(data.annotations);
    }

    // 하이라이트 복원 (간단한 텍스트 매칭으로)
    if (data.highlights) {
      data.highlights.forEach((item) => {
        this.findAndHighlightText(
          item.text,
          item.theme,
          item.id,
          item.annotation
        );
      });
    }

    this.updateStats();
    this.updateHighlightList();
    this.updateAnnotationList();
  }

  findAndHighlightText(searchText, theme, id, annotation) {
    const contentDiv = document.getElementById("editableContent");
    if (!contentDiv) return;

    const walker = document.createTreeWalker(
      contentDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      const text = textNode.textContent;
      const index = text.indexOf(searchText);

      if (index !== -1) {
        const range = new Range();
        range.setStart(textNode, index);
        range.setEnd(textNode, index + searchText.length);

        // Highlight 객체 생성
        const highlight = new Highlight(range);
        CSS.highlights.set(id, highlight);

        // 내부 데이터 저장
        this.highlights.set(id, {
          highlight,
          range: range.cloneRange(),
          text: searchText,
          theme: theme || "default",
          timestamp: Date.now(),
          annotation,
        });

        break; // 첫 번째 일치만 처리
      }
    }
  }

  getNodePath(node) {
    // DOM 노드의 경로를 문자열로 반환 (간단한 구현)
    const path = [];
    let current = node;

    while (current && current !== document.getElementById("editableContent")) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        path.unshift(current.tagName.toLowerCase());
      }
      current = current.parentNode;
    }

    return path.join(" > ");
  }

  // 데모 함수들
  runBasicDemo() {
    this.loadSampleContent();

    setTimeout(() => {
      // 첫 번째 단락의 일부 하이라이트
      const firstP = document.querySelector("#editableContent p");
      if (firstP && firstP.firstChild) {
        const range = new Range();
        range.setStart(firstP.firstChild, 0);
        range.setEnd(firstP.firstChild, 20);

        this.addHighlight(
          "demo-basic-1",
          range,
          firstP.firstChild.textContent.substring(0, 20)
        );
      }

      this.updateStats();
      this.updateHighlightList();
      this.showNotification("기본 하이라이팅 데모가 실행되었습니다", "success");
    }, 500);
  }

  runSearchDemo() {
    this.loadSampleContent();

    setTimeout(() => {
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = "텍스트";
        this.performSearch();
      }
      this.showNotification("검색 하이라이팅 데모가 실행되었습니다", "success");
    }, 500);
  }

  runThemesDemo() {
    this.loadSampleContent();

    const themes = ["default", "important", "note", "question", "success"];
    let themeIndex = 0;

    const demoInterval = setInterval(() => {
      if (themeIndex >= themes.length) {
        clearInterval(demoInterval);
        this.showNotification("테마 변경 데모가 완료되었습니다", "success");
        return;
      }

      this.currentTheme = themes[themeIndex];
      const themeSelect = document.getElementById("highlightTheme");
      if (themeSelect) {
        themeSelect.value = this.currentTheme;
      }
      this.updateActiveTheme();

      // 샘플 하이라이트 추가
      const contentDiv = document.getElementById("editableContent");
      const paragraphs = contentDiv?.querySelectorAll("p");

      if (paragraphs && paragraphs[themeIndex]) {
        const p = paragraphs[themeIndex];
        if (p.firstChild) {
          const range = new Range();
          range.setStart(p.firstChild, 0);
          range.setEnd(
            p.firstChild,
            Math.min(15, p.firstChild.textContent.length)
          );

          this.addHighlight(
            `demo-theme-${themeIndex}`,
            range,
            p.firstChild.textContent.substring(0, 15)
          );
        }
      }

      themeIndex++;
    }, 1000);
  }

  runCollaborationDemo() {
    this.showNotification("협업 하이라이팅 데모를 시작합니다", "info");

    // 시뮬레이션된 협업 하이라이트
    const collaborators = [
      { name: "사용자A", theme: "important" },
      { name: "사용자B", theme: "note" },
      { name: "사용자C", theme: "question" },
    ];

    let collabIndex = 0;

    const collabInterval = setInterval(() => {
      if (collabIndex >= collaborators.length) {
        clearInterval(collabInterval);
        this.showNotification(
          "협업 하이라이팅 데모가 완료되었습니다",
          "success"
        );
        return;
      }

      const collaborator = collaborators[collabIndex];
      const contentDiv = document.getElementById("editableContent");
      const paragraphs = contentDiv?.querySelectorAll("p");

      if (paragraphs && paragraphs[collabIndex]) {
        const p = paragraphs[collabIndex];
        if (p.firstChild) {
          const range = new Range();
          const start = collabIndex * 10;
          const end = start + 20;

          range.setStart(
            p.firstChild,
            Math.min(start, p.firstChild.textContent.length)
          );
          range.setEnd(
            p.firstChild,
            Math.min(end, p.firstChild.textContent.length)
          );

          const oldTheme = this.currentTheme;
          this.currentTheme = collaborator.theme;

          this.addHighlight(
            `collab-${collabIndex}`,
            range,
            p.firstChild.textContent.substring(start, end)
          );

          this.currentTheme = oldTheme;

          this.showNotification(
            `${collaborator.name}이(가) 하이라이트를 추가했습니다`,
            "info"
          );
        }
      }

      collabIndex++;
    }, 1500);
  }

  // UI 업데이트 함수들
  updateActiveTheme() {
    const activeThemeElement = document.getElementById("activeTheme");
    if (activeThemeElement) {
      const themeNames = {
        default: "기본",
        important: "중요",
        note: "노트",
        question: "질문",
        success: "성공",
        warning: "경고",
      };
      activeThemeElement.textContent = themeNames[this.currentTheme] || "기본";
    }
  }

  updateSelectionInfo(selectedText = null) {
    const selectionInfo = document.getElementById("selectionInfo");
    if (!selectionInfo) return;

    if (selectedText) {
      selectionInfo.innerHTML = `
        <strong>선택된 텍스트:</strong> "${this.truncateText(
          selectedText,
          50
        )}"<br>
        <strong>테마:</strong> ${this.currentTheme}<br>
        <strong>모드:</strong> ${
          this.isSelectionMode ? "자동 하이라이트" : "수동 선택"
        }
      `;
    } else {
      selectionInfo.textContent = this.isSelectionMode
        ? "텍스트를 선택하면 자동으로 하이라이트됩니다"
        : "텍스트를 선택하여 하이라이트를 추가하세요";
    }
  }

  updateAnnotationButton(hasSelection) {
    const addAnnotationBtn = document.getElementById("addAnnotation");
    if (addAnnotationBtn) {
      addAnnotationBtn.disabled = !hasSelection;
    }
  }

  updateSearchResults(count) {
    const searchResults = document.getElementById("searchResults");
    if (searchResults) {
      searchResults.textContent = `검색 결과: ${count}개`;
    }

    const searchCountElement = document.getElementById("searchCount");
    if (searchCountElement) {
      searchCountElement.textContent = count;
    }
  }

  updateStats() {
    const totalHighlights = document.getElementById("totalHighlights");
    if (totalHighlights) {
      totalHighlights.textContent = this.highlights.size;
    }

    const annotationCount = document.getElementById("annotationCount");
    if (annotationCount) {
      annotationCount.textContent = this.annotations.size;
    }

    // 로컬 스토리지 정보 업데이트
    this.updateStorageInfo();
  }

  updateHighlightList() {
    const highlightList = document.getElementById("highlightList");
    if (!highlightList) return;

    if (this.highlights.size === 0) {
      highlightList.innerHTML =
        '<div class="list-placeholder">하이라이트가 생성되면 여기에 목록이 표시됩니다</div>';
      return;
    }

    const highlightArray = Array.from(this.highlights.entries());
    highlightList.innerHTML = highlightArray
      .map(
        ([id, data]) => `
      <div class="highlight-item" data-id="${id}">
        <div class="highlight-text">"${this.truncateText(data.text, 40)}"</div>
        <div class="highlight-meta">
          <span class="highlight-theme">${data.theme}</span>
          <span class="highlight-time">${new Date(
            data.timestamp
          ).toLocaleTimeString()}</span>
          ${
            data.annotation
              ? '<span class="highlight-annotation">📝</span>'
              : ""
          }
        </div>
        <button class="highlight-remove" onclick="window.cssHighlightAPI.removeHighlight('${id}')">×</button>
      </div>
    `
      )
      .join("");
  }

  updateAnnotationList() {
    const annotationList = document.getElementById("annotationList");
    if (!annotationList) return;

    if (this.annotations.size === 0) {
      annotationList.innerHTML =
        '<div class="annotation-placeholder">주석이 있는 텍스트를 선택하면 여기에 표시됩니다</div>';
      return;
    }

    const annotationArray = Array.from(this.annotations.entries());
    annotationList.innerHTML = annotationArray
      .map(
        ([id, data]) => `
      <div class="annotation-item" data-id="${id}">
        <div class="annotation-text">"${this.truncateText(
          data.selectedText,
          30
        )}"</div>
        <div class="annotation-content">${data.text}</div>
        <div class="annotation-time">${new Date(
          data.timestamp
        ).toLocaleString()}</div>
        <button class="annotation-remove" onclick="window.cssHighlightAPI.removeAnnotation('${id}')">×</button>
      </div>
    `
      )
      .join("");
  }

  updateStorageInfo() {
    const storedCount = document.getElementById("storedCount");
    const lastSaved = document.getElementById("lastSaved");

    if (storedCount) {
      storedCount.textContent = this.highlights.size;
    }

    if (lastSaved) {
      const now = new Date();
      lastSaved.textContent = now.toLocaleTimeString();
    }
  }

  removeHighlight(id) {
    if (this.highlights.has(id)) {
      CSS.highlights.delete(id);
      this.highlights.delete(id);

      // 주석도 함께 제거
      if (this.annotations.has(id)) {
        this.annotations.delete(id);
      }

      this.updateStats();
      this.updateHighlightList();
      this.updateAnnotationList();
      this.showNotification("하이라이트가 제거되었습니다", "info");
    }
  }

  removeAnnotation(id) {
    if (this.annotations.has(id)) {
      this.annotations.delete(id);

      // 하이라이트의 주석 정보도 제거
      if (this.highlights.has(id)) {
        this.highlights.get(id).annotation = null;
      }

      this.updateStats();
      this.updateAnnotationList();
      this.updateHighlightList();
      this.showNotification("주석이 제거되었습니다", "info");
    }
  }

  enableAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveToLocalStorage();
    }, 5000); // 5초마다 자동 저장

    this.showNotification("자동 저장이 활성화되었습니다", "info");
  }

  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    this.showNotification("자동 저장이 비활성화되었습니다", "info");
  }

  saveToLocalStorage() {
    try {
      const data = {
        highlights: Array.from(this.highlights.entries()),
        annotations: Array.from(this.annotations.entries()),
        timestamp: Date.now(),
      };

      localStorage.setItem("cssHighlightAPI_data", JSON.stringify(data));
      this.updateStorageInfo();
    } catch (error) {
      console.error("로컬 저장 실패:", error);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem("cssHighlightAPI_data");
      if (data) {
        const parsed = JSON.parse(data);
        this.loadHighlightsFromData({
          highlights:
            parsed.highlights?.map(([id, data]) => ({
              id,
              text: data.text,
              theme: data.theme,
              timestamp: data.timestamp,
              annotation: data.annotation,
            })) || [],
          annotations: parsed.annotations || [],
        });
      }
    } catch (error) {
      console.error("로컬 데이터 로드 실패:", error);
    }
  }

  // 유틸리티 함수들
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // 모든 하이라이트 제거
    this.clearAllHighlights();
  }
}

// 전역 접근을 위한 설정
window.cssHighlightAPI = null;

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  if (window.cssHighlightAPI) {
    window.cssHighlightAPI.cleanup();
  }
});

// 초기화
function initCSSHighlightAPI() {
  console.log("🚀 CSS Custom Highlight API 초기화 함수 호출");
  window.cssHighlightAPI = new CSSCustomHighlightAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initCSSHighlightAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initCSSHighlightAPI();
}

console.log(
  "📄 CSS Custom Highlight API 스크립트 로드 완료, readyState:",
  document.readyState
);
