import "./style.css";

console.log("🌐 URL API 스크립트 시작!");

class URLAPI {
  constructor() {
    this.urlHistory = [];
    this.bookmarks = [];
    this.urlTemplates = new Map();
    this.validationRules = new Map();
    this.currentUrl = null;
    this.init();
  }

  init() {
    console.log("🌐 URL API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.loadSampleUrls();
    this.loadBookmarks();
    console.log("✅ URL API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 URL API 지원 여부 확인 중...");

    const support = {
      url: typeof URL !== "undefined",
      urlSearchParams: typeof URLSearchParams !== "undefined",
      base64: typeof btoa !== "undefined" && typeof atob !== "undefined",
      encodeURI: typeof encodeURIComponent !== "undefined",
      location: typeof window.location !== "undefined",
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="url-container">
        <header class="url-header">
          <h1>🌐 URL API</h1>
          <p>URL 파싱, 조작, 검증, 단축 및 분석의 모든 기능을 체험하세요</p>
          <div class="api-support">
            <div class="support-badge ${support.url ? "supported" : "unsupported"}">
              ${support.url ? "✅ URL" : "❌ URL"}
            </div>
            <div class="support-badge ${support.urlSearchParams ? "supported" : "unsupported"}">
              ${support.urlSearchParams ? "✅ URLSearchParams" : "❌ URLSearchParams"}
            </div>
            <div class="support-badge ${support.base64 ? "supported" : "unsupported"}">
              ${support.base64 ? "✅ Base64" : "❌ Base64"}
            </div>
            <div class="support-badge ${support.encodeURI ? "supported" : "unsupported"}">
              ${support.encodeURI ? "✅ EncodeURI" : "❌ EncodeURI"}
            </div>
            <div class="support-badge ${support.location ? "supported" : "unsupported"}">
              ${support.location ? "✅ Location" : "❌ Location"}
            </div>
          </div>
        </header>

        <main class="url-main">
          <!-- URL 파서 -->
          <div class="panel-card primary">
            <h2>🔍 URL 파서 & 분석기</h2>
            
            <div class="url-input-section">
              <div class="input-group">
                <label for="urlInput">URL 입력:</label>
                <div class="url-input-wrapper">
                  <input type="url" id="urlInput" placeholder="https://example.com/path?query=value#hash" 
                         value="https://developer.mozilla.org/ko/docs/Web/API/URL?tab=syntax&section=constructor#examples">
                  <button id="parseUrl" class="btn-primary">🔍 분석</button>
                  <button id="clearUrl" class="btn-secondary">🗑️ 지우기</button>
                </div>
              </div>
              
              <div class="url-samples">
                <h3>📚 샘플 URL:</h3>
                <div class="sample-buttons">
                  <button class="sample-btn" data-url="https://www.google.com/search?q=javascript&hl=ko&gl=kr">Google 검색</button>
                  <button class="sample-btn" data-url="https://github.com/user/repo/issues?state=open&sort=updated#issue-123">GitHub 이슈</button>
                  <button class="sample-btn" data-url="https://api.example.com/v1/users/123?fields=name,email&format=json">REST API</button>
                  <button class="sample-btn" data-url="ftp://files.example.com:21/documents/file.pdf">FTP 파일</button>
                  <button class="sample-btn" data-url="mailto:user@example.com?subject=Hello&body=How are you?">이메일</button>
                  <button class="sample-btn" data-url="tel:+82-10-1234-5678">전화번호</button>
                </div>
              </div>
            </div>

            <div class="url-result" id="urlResult">
              <div class="result-placeholder">URL을 입력하고 분석 버튼을 클릭하세요</div>
            </div>
          </div>

          <!-- URL 조작기 -->
          <div class="panel-card">
            <h2>🛠️ URL 조작기</h2>
            
            <div class="url-manipulator">
              <div class="manipulation-tabs">
                <button class="manipulation-tab-btn active" data-tab="components">🧩 컴포넌트</button>
                <button class="manipulation-tab-btn" data-tab="params">🔗 매개변수</button>
                <button class="manipulation-tab-btn" data-tab="builder">🏗️ 빌더</button>
                <button class="manipulation-tab-btn" data-tab="converter">🔄 변환기</button>
              </div>

              <div class="manipulation-content">
                <!-- 컴포넌트 조작 -->
                <div class="manipulation-panel active" id="components">
                  <h3>🧩 URL 컴포넌트 수정</h3>
                  <div class="component-grid">
                    <div class="component-item">
                      <label for="protocol">프로토콜:</label>
                      <select id="protocol">
                        <option value="https:">https:</option>
                        <option value="http:">http:</option>
                        <option value="ftp:">ftp:</option>
                        <option value="mailto:">mailto:</option>
                        <option value="tel:">tel:</option>
                      </select>
                    </div>
                    <div class="component-item">
                      <label for="hostname">호스트명:</label>
                      <input type="text" id="hostname" placeholder="example.com">
                    </div>
                    <div class="component-item">
                      <label for="port">포트:</label>
                      <input type="number" id="port" placeholder="80">
                    </div>
                    <div class="component-item">
                      <label for="pathname">경로:</label>
                      <input type="text" id="pathname" placeholder="/path/to/resource">
                    </div>
                    <div class="component-item">
                      <label for="search">쿼리:</label>
                      <input type="text" id="search" placeholder="?param=value">
                    </div>
                    <div class="component-item">
                      <label for="hash">해시:</label>
                      <input type="text" id="hash" placeholder="#section">
                    </div>
                  </div>
                  <div class="component-actions">
                    <button id="updateComponents" class="btn-primary">🔄 URL 업데이트</button>
                    <button id="resetComponents" class="btn-warning">↩️ 원래대로</button>
                  </div>
                </div>

                <!-- 매개변수 조작 -->
                <div class="manipulation-panel" id="params">
                  <h3>🔗 URL 매개변수 관리</h3>
                  <div class="params-controls">
                    <div class="param-input-group">
                      <input type="text" id="paramKey" placeholder="키">
                      <input type="text" id="paramValue" placeholder="값">
                      <button id="addParam" class="btn-success">➕ 추가</button>
                    </div>
                    <div class="params-actions">
                      <button id="clearAllParams" class="btn-danger">🗑️ 모든 매개변수 삭제</button>
                      <button id="sortParams" class="btn-info">🔤 정렬</button>
                      <button id="encodeParams" class="btn-secondary">🔐 인코딩</button>
                    </div>
                  </div>
                  <div class="params-list" id="paramsList">
                    <div class="params-placeholder">매개변수가 없습니다</div>
                  </div>
                </div>

                <!-- URL 빌더 -->
                <div class="manipulation-panel" id="builder">
                  <h3>🏗️ URL 빌더</h3>
                  <div class="builder-templates">
                    <h4>템플릿:</h4>
                    <div class="template-buttons">
                      <button class="template-btn" data-template="api">🔌 REST API</button>
                      <button class="template-btn" data-template="search">🔍 검색 URL</button>
                      <button class="template-btn" data-template="social">📱 소셜 공유</button>
                      <button class="template-btn" data-template="email">📧 이메일</button>
                      <button class="template-btn" data-template="download">💾 다운로드</button>
                    </div>
                  </div>
                  <div class="builder-form">
                    <div class="form-row">
                      <label for="baseUrl">기본 URL:</label>
                      <input type="text" id="baseUrl" placeholder="https://api.example.com">
                    </div>
                    <div class="form-row">
                      <label for="endpoint">엔드포인트:</label>
                      <input type="text" id="endpoint" placeholder="/v1/users">
                    </div>
                    <div class="form-row">
                      <label for="dynamicParams">동적 매개변수:</label>
                      <div class="dynamic-params" id="dynamicParams">
                        <button id="addDynamicParam" class="btn-info">➕ 매개변수 추가</button>
                      </div>
                    </div>
                    <div class="builder-actions">
                      <button id="buildUrl" class="btn-primary">🏗️ URL 생성</button>
                      <button id="testUrl" class="btn-success">🧪 테스트</button>
                    </div>
                  </div>
                </div>

                <!-- URL 변환기 -->
                <div class="manipulation-panel" id="converter">
                  <h3>🔄 URL 변환 & 인코딩</h3>
                  <div class="converter-sections">
                    <div class="converter-section">
                      <h4>🔐 URL 인코딩/디코딩</h4>
                      <div class="converter-controls">
                        <textarea id="encodeInput" placeholder="인코딩할 URL을 입력하세요..."></textarea>
                        <div class="converter-buttons">
                          <button id="encodeUrl" class="btn-primary">🔐 인코딩</button>
                          <button id="decodeUrl" class="btn-secondary">🔓 디코딩</button>
                          <button id="base64Encode" class="btn-info">📦 Base64 인코딩</button>
                          <button id="base64Decode" class="btn-warning">📂 Base64 디코딩</button>
                        </div>
                        <textarea id="encodeOutput" placeholder="결과가 여기에 표시됩니다..." readonly></textarea>
                      </div>
                    </div>

                    <div class="converter-section">
                      <h4>🔗 URL 단축</h4>
                      <div class="shortener-controls">
                        <div class="shortener-input">
                          <input type="url" id="longUrl" placeholder="단축할 긴 URL을 입력하세요...">
                          <button id="shortenUrl" class="btn-success">✂️ 단축</button>
                        </div>
                        <div class="shortener-options">
                          <label>
                            <input type="checkbox" id="customAlias"> 커스텀 별칭 사용
                          </label>
                          <input type="text" id="aliasInput" placeholder="별칭 (선택)" disabled>
                        </div>
                        <div class="shortened-result" id="shortenedResult"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="manipulation-result">
                <h3>🎯 조작된 URL:</h3>
                <div class="result-url" id="manipulatedUrl">
                  <input type="text" readonly placeholder="조작된 URL이 여기에 표시됩니다...">
                  <button id="copyManipulated" class="btn-info">📋 복사</button>
                  <button id="saveBookmark" class="btn-success">⭐ 북마크</button>
                </div>
              </div>
            </div>
          </div>

          <!-- URL 검증기 -->
          <div class="panel-card">
            <h2>✅ URL 검증기 & 분석</h2>
            
            <div class="validator-section">
              <div class="validation-input">
                <input type="text" id="validateInput" placeholder="검증할 URL을 입력하세요...">
                <button id="validateUrl" class="btn-primary">✅ 검증</button>
                <button id="analyzeUrl" class="btn-info">📊 심화 분석</button>
              </div>
              
              <div class="validation-options">
                <h3>검증 옵션:</h3>
                <div class="validation-checkboxes">
                  <label><input type="checkbox" id="checkSyntax" checked> 문법 검사</label>
                  <label><input type="checkbox" id="checkReachable"> 접근 가능성</label>
                  <label><input type="checkbox" id="checkSecurity"> 보안 검사</label>
                  <label><input type="checkbox" id="checkRedirects"> 리다이렉트 추적</label>
                  <label><input type="checkbox" id="checkCertificate"> SSL 인증서</label>
                </div>
              </div>

              <div class="validation-results" id="validationResults">
                <div class="results-placeholder">URL을 입력하고 검증 버튼을 클릭하세요</div>
              </div>
            </div>
          </div>

          <!-- URL 북마크 & 히스토리 -->
          <div class="panel-card">
            <h2>📚 북마크 & 히스토리</h2>
            
            <div class="bookmark-section">
              <div class="bookmark-tabs">
                <button class="bookmark-tab-btn active" data-tab="bookmarks">⭐ 북마크</button>
                <button class="bookmark-tab-btn" data-tab="history">📜 히스토리</button>
                <button class="bookmark-tab-btn" data-tab="collections">📁 컬렉션</button>
              </div>

              <div class="bookmark-content">
                <!-- 북마크 -->
                <div class="bookmark-panel active" id="bookmarks">
                  <div class="bookmark-controls">
                    <div class="bookmark-add">
                      <input type="url" id="bookmarkUrl" placeholder="북마크할 URL">
                      <input type="text" id="bookmarkTitle" placeholder="제목">
                      <select id="bookmarkCategory">
                        <option value="general">일반</option>
                        <option value="work">업무</option>
                        <option value="dev">개발</option>
                        <option value="social">소셜</option>
                        <option value="news">뉴스</option>
                      </select>
                      <button id="addBookmark" class="btn-success">⭐ 북마크 추가</button>
                    </div>
                    <div class="bookmark-actions">
                      <button id="exportBookmarks" class="btn-info">📤 내보내기</button>
                      <button id="importBookmarks" class="btn-secondary">📥 가져오기</button>
                      <button id="clearBookmarks" class="btn-danger">🗑️ 모두 삭제</button>
                    </div>
                  </div>
                  <div class="bookmark-list" id="bookmarkList">
                    <div class="bookmarks-placeholder">북마크가 없습니다</div>
                  </div>
                </div>

                <!-- 히스토리 -->
                <div class="bookmark-panel" id="history">
                  <div class="history-controls">
                    <div class="history-filters">
                      <select id="historyFilter">
                        <option value="all">전체</option>
                        <option value="today">오늘</option>
                        <option value="week">이번 주</option>
                        <option value="month">이번 달</option>
                      </select>
                      <input type="text" id="historySearch" placeholder="히스토리 검색...">
                      <button id="clearHistory" class="btn-danger">🗑️ 기록 삭제</button>
                    </div>
                  </div>
                  <div class="history-list" id="historyList">
                    <div class="history-placeholder">히스토리가 없습니다</div>
                  </div>
                </div>

                <!-- 컬렉션 -->
                <div class="bookmark-panel" id="collections">
                  <div class="collection-controls">
                    <div class="collection-create">
                      <input type="text" id="collectionName" placeholder="컬렉션 이름">
                      <button id="createCollection" class="btn-primary">📁 컬렉션 생성</button>
                    </div>
                  </div>
                  <div class="collection-list" id="collectionList">
                    <div class="collections-placeholder">컬렉션이 없습니다</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- URL 통계 & 분석 -->
          <div class="panel-card">
            <h2>📊 URL 통계 & 분석</h2>
            
            <div class="analytics-section">
              <div class="analytics-stats">
                <div class="stat-card">
                  <div class="stat-icon">🔗</div>
                  <div class="stat-info">
                    <span class="stat-label">총 URL 수</span>
                    <span class="stat-value" id="totalUrls">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⭐</div>
                  <div class="stat-info">
                    <span class="stat-label">북마크 수</span>
                    <span class="stat-value" id="totalBookmarks">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">📜</div>
                  <div class="stat-info">
                    <span class="stat-label">히스토리 수</span>
                    <span class="stat-value" id="totalHistory">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🌐</div>
                  <div class="stat-info">
                    <span class="stat-label">도메인 수</span>
                    <span class="stat-value" id="uniqueDomains">0</span>
                  </div>
                </div>
              </div>

              <div class="analytics-charts">
                <div class="chart-container">
                  <h3>📈 도메인별 분포</h3>
                  <div class="domain-chart" id="domainChart">
                    <div class="chart-placeholder">데이터가 없습니다</div>
                  </div>
                </div>
                <div class="chart-container">
                  <h3>🏷️ 카테고리별 분포</h3>
                  <div class="category-chart" id="categoryChart">
                    <div class="chart-placeholder">데이터가 없습니다</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 영역 -->
          <div id="notifications" class="notifications-container"></div>
        </main>
      </div>
    `;

    console.log("✅ UI 설정 완료");
  }

  setupEventListeners() {
    // URL 파서
    document.getElementById("parseUrl")?.addEventListener("click", () => this.parseUrl());
    document.getElementById("clearUrl")?.addEventListener("click", () => this.clearUrl());
    document.getElementById("urlInput")?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.parseUrl();
    });

    // 샘플 URL 버튼
    document.querySelectorAll(".sample-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.getElementById("urlInput").value = e.target.dataset.url;
        this.parseUrl();
      });
    });

    // 조작 탭
    document.querySelectorAll(".manipulation-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchManipulationTab(e.target.dataset.tab);
      });
    });

    // 컴포넌트 조작
    document.getElementById("updateComponents")?.addEventListener("click", () => this.updateComponents());
    document.getElementById("resetComponents")?.addEventListener("click", () => this.resetComponents());

    // 매개변수 조작
    document.getElementById("addParam")?.addEventListener("click", () => this.addParam());
    document.getElementById("clearAllParams")?.addEventListener("click", () => this.clearAllParams());
    document.getElementById("sortParams")?.addEventListener("click", () => this.sortParams());
    document.getElementById("encodeParams")?.addEventListener("click", () => this.encodeParams());

    // URL 빌더
    document.querySelectorAll(".template-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.loadTemplate(e.target.dataset.template));
    });
    document.getElementById("addDynamicParam")?.addEventListener("click", () => this.addDynamicParam());
    document.getElementById("buildUrl")?.addEventListener("click", () => this.buildUrl());
    document.getElementById("testUrl")?.addEventListener("click", () => this.testUrl());

    // 변환기
    document.getElementById("encodeUrl")?.addEventListener("click", () => this.encodeUrl());
    document.getElementById("decodeUrl")?.addEventListener("click", () => this.decodeUrl());
    document.getElementById("base64Encode")?.addEventListener("click", () => this.base64Encode());
    document.getElementById("base64Decode")?.addEventListener("click", () => this.base64Decode());
    document.getElementById("shortenUrl")?.addEventListener("click", () => this.shortenUrl());
    document.getElementById("customAlias")?.addEventListener("change", (e) => {
      document.getElementById("aliasInput").disabled = !e.target.checked;
    });

    // 조작된 URL 관련
    document.getElementById("copyManipulated")?.addEventListener("click", () => this.copyManipulatedUrl());
    document.getElementById("saveBookmark")?.addEventListener("click", () => this.saveCurrentUrlAsBookmark());

    // 검증기
    document.getElementById("validateUrl")?.addEventListener("click", () => this.validateUrl());
    document.getElementById("analyzeUrl")?.addEventListener("click", () => this.analyzeUrl());

    // 북마크 탭
    document.querySelectorAll(".bookmark-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchBookmarkTab(e.target.dataset.tab);
      });
    });

    // 북마크 관련
    document.getElementById("addBookmark")?.addEventListener("click", () => this.addBookmark());
    document.getElementById("exportBookmarks")?.addEventListener("click", () => this.exportBookmarks());
    document.getElementById("importBookmarks")?.addEventListener("click", () => this.importBookmarks());
    document.getElementById("clearBookmarks")?.addEventListener("click", () => this.clearBookmarks());

    // 히스토리 관련
    document.getElementById("historyFilter")?.addEventListener("change", () => this.filterHistory());
    document.getElementById("historySearch")?.addEventListener("input", () => this.searchHistory());
    document.getElementById("clearHistory")?.addEventListener("click", () => this.clearHistory());

    // 컬렉션 관련
    document.getElementById("createCollection")?.addEventListener("click", () => this.createCollection());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  parseUrl() {
    const urlInput = document.getElementById("urlInput");
    const urlString = urlInput.value.trim();

    if (!urlString) {
      this.showNotification("URL을 입력하세요", "warning");
      return;
    }

    try {
      const url = new URL(urlString);
      this.currentUrl = url;
      this.addToHistory(urlString);
      this.displayUrlResult(url);
      this.updateStats();
      this.showNotification("URL 분석 완료", "success");
    } catch (error) {
      this.showNotification(`유효하지 않은 URL입니다: ${error.message}`, "error");
      this.displayUrlError(error.message);
    }
  }

  displayUrlResult(url) {
    const resultDiv = document.getElementById("urlResult");
    
    resultDiv.innerHTML = `
      <div class="url-analysis">
        <div class="url-overview">
          <h3>🌐 URL 개요</h3>
          <div class="url-full">
            <label>전체 URL:</label>
            <div class="url-value">${this.escapeHtml(url.href)}</div>
          </div>
        </div>

        <div class="url-components">
          <h3>🧩 URL 구성 요소</h3>
          <div class="components-grid">
            <div class="component-row">
              <span class="component-label">프로토콜:</span>
              <span class="component-value protocol">${url.protocol}</span>
            </div>
            <div class="component-row">
              <span class="component-label">호스트:</span>
              <span class="component-value host">${url.host}</span>
            </div>
            <div class="component-row">
              <span class="component-label">호스트명:</span>
              <span class="component-value hostname">${url.hostname}</span>
            </div>
            <div class="component-row">
              <span class="component-label">포트:</span>
              <span class="component-value port">${url.port || '기본값'}</span>
            </div>
            <div class="component-row">
              <span class="component-label">경로:</span>
              <span class="component-value pathname">${url.pathname || '/'}</span>
            </div>
            <div class="component-row">
              <span class="component-label">쿼리:</span>
              <span class="component-value search">${url.search || '없음'}</span>
            </div>
            <div class="component-row">
              <span class="component-label">해시:</span>
              <span class="component-value hash">${url.hash || '없음'}</span>
            </div>
            <div class="component-row">
              <span class="component-label">Origin:</span>
              <span class="component-value origin">${url.origin}</span>
            </div>
          </div>
        </div>

        ${url.search ? this.renderSearchParams(url.searchParams) : ''}
        
        <div class="url-info">
          <h3>📊 추가 정보</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">도메인 길이:</span>
              <span class="info-value">${url.hostname.length}자</span>
            </div>
            <div class="info-item">
              <span class="info-label">전체 길이:</span>
              <span class="info-value">${url.href.length}자</span>
            </div>
            <div class="info-item">
              <span class="info-label">TLD:</span>
              <span class="info-value">${this.extractTLD(url.hostname)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">서브도메인:</span>
              <span class="info-value">${this.extractSubdomain(url.hostname)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">경로 깊이:</span>
              <span class="info-value">${url.pathname.split('/').length - 1}</span>
            </div>
            <div class="info-item">
              <span class="info-label">매개변수 수:</span>
              <span class="info-value">${url.searchParams ? Array.from(url.searchParams).length : 0}개</span>
            </div>
          </div>
        </div>

        <div class="url-actions">
          <button onclick="window.urlAPI.copyToClipboard('${url.href}')" class="btn-info">📋 복사</button>
          <button onclick="window.urlAPI.openUrl('${url.href}')" class="btn-success">🔗 열기</button>
          <button onclick="window.urlAPI.addBookmarkFromCurrent()" class="btn-primary">⭐ 북마크</button>
          <button onclick="window.urlAPI.shareUrl('${url.href}')" class="btn-secondary">📤 공유</button>
        </div>
      </div>
    `;

    // 컴포넌트 필드 업데이트
    this.updateComponentFields(url);
  }

  renderSearchParams(searchParams) {
    const params = Array.from(searchParams.entries());
    if (params.length === 0) return '';

    return `
      <div class="url-params">
        <h3>🔗 쿼리 매개변수</h3>
        <div class="params-table">
          <div class="params-header">
            <span>키</span>
            <span>값</span>
            <span>인코딩된 값</span>
          </div>
          ${params.map(([key, value]) => `
            <div class="params-row">
              <span class="param-key">${this.escapeHtml(key)}</span>
              <span class="param-value">${this.escapeHtml(value)}</span>
              <span class="param-encoded">${encodeURIComponent(value)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  updateComponentFields(url) {
    document.getElementById("protocol").value = url.protocol;
    document.getElementById("hostname").value = url.hostname;
    document.getElementById("port").value = url.port;
    document.getElementById("pathname").value = url.pathname;
    document.getElementById("search").value = url.search;
    document.getElementById("hash").value = url.hash;
    
    this.updateParamsList(url.searchParams);
    this.updateManipulatedUrl();
  }

  updateParamsList(searchParams) {
    const container = document.getElementById("paramsList");
    const params = Array.from(searchParams.entries());

    if (params.length === 0) {
      container.innerHTML = '<div class="params-placeholder">매개변수가 없습니다</div>';
      return;
    }

    container.innerHTML = params.map(([key, value], index) => `
      <div class="param-item">
        <div class="param-content">
          <span class="param-key">${this.escapeHtml(key)}</span>
          <span class="param-equals">=</span>
          <span class="param-value">${this.escapeHtml(value)}</span>
        </div>
        <div class="param-actions">
          <button onclick="window.urlAPI.editParam('${key}', '${value}')" class="btn-small btn-info">✏️</button>
          <button onclick="window.urlAPI.deleteParam('${key}')" class="btn-small btn-danger">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  switchManipulationTab(tab) {
    document.querySelectorAll(".manipulation-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    document.querySelectorAll(".manipulation-panel").forEach(panel => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }

  updateComponents() {
    if (!this.currentUrl) {
      this.showNotification("먼저 URL을 분석하세요", "warning");
      return;
    }

    try {
      const newUrl = new URL(this.currentUrl.href);
      
      newUrl.protocol = document.getElementById("protocol").value;
      newUrl.hostname = document.getElementById("hostname").value;
      newUrl.port = document.getElementById("port").value;
      newUrl.pathname = document.getElementById("pathname").value;
      newUrl.search = document.getElementById("search").value;
      newUrl.hash = document.getElementById("hash").value;

      this.currentUrl = newUrl;
      this.updateManipulatedUrl();
      this.showNotification("URL 컴포넌트가 업데이트되었습니다", "success");
    } catch (error) {
      this.showNotification(`URL 업데이트 실패: ${error.message}`, "error");
    }
  }

  resetComponents() {
    if (!this.currentUrl) return;
    
    const originalUrl = document.getElementById("urlInput").value;
    try {
      const url = new URL(originalUrl);
      this.updateComponentFields(url);
      this.showNotification("컴포넌트가 원래대로 복원되었습니다", "info");
    } catch (error) {
      this.showNotification("원본 URL이 유효하지 않습니다", "error");
    }
  }

  addParam() {
    const key = document.getElementById("paramKey").value.trim();
    const value = document.getElementById("paramValue").value.trim();

    if (!key) {
      this.showNotification("매개변수 키를 입력하세요", "warning");
      return;
    }

    if (!this.currentUrl) {
      this.showNotification("먼저 URL을 분석하세요", "warning");
      return;
    }

    this.currentUrl.searchParams.set(key, value);
    this.updateParamsList(this.currentUrl.searchParams);
    this.updateManipulatedUrl();
    
    // 입력 필드 초기화
    document.getElementById("paramKey").value = "";
    document.getElementById("paramValue").value = "";
    
    this.showNotification(`매개변수 '${key}' 추가됨`, "success");
  }

  deleteParam(key) {
    if (!this.currentUrl) return;
    
    this.currentUrl.searchParams.delete(key);
    this.updateParamsList(this.currentUrl.searchParams);
    this.updateManipulatedUrl();
    this.showNotification(`매개변수 '${key}' 삭제됨`, "info");
  }

  clearAllParams() {
    if (!this.currentUrl) return;
    
    // 모든 매개변수 삭제
    const keys = Array.from(this.currentUrl.searchParams.keys());
    keys.forEach(key => this.currentUrl.searchParams.delete(key));
    
    this.updateParamsList(this.currentUrl.searchParams);
    this.updateManipulatedUrl();
    this.showNotification("모든 매개변수가 삭제되었습니다", "info");
  }

  sortParams() {
    if (!this.currentUrl) return;
    
    const params = Array.from(this.currentUrl.searchParams.entries());
    params.sort(([a], [b]) => a.localeCompare(b));
    
    // 기존 매개변수 모두 삭제
    const keys = Array.from(this.currentUrl.searchParams.keys());
    keys.forEach(key => this.currentUrl.searchParams.delete(key));
    
    // 정렬된 순서로 다시 추가
    params.forEach(([key, value]) => {
      this.currentUrl.searchParams.set(key, value);
    });
    
    this.updateParamsList(this.currentUrl.searchParams);
    this.updateManipulatedUrl();
    this.showNotification("매개변수가 정렬되었습니다", "success");
  }

  updateManipulatedUrl() {
    const input = document.querySelector("#manipulatedUrl input");
    if (this.currentUrl && input) {
      input.value = this.currentUrl.href;
    }
  }

  loadTemplate(template) {
    const templates = {
      api: {
        baseUrl: "https://api.example.com",
        endpoint: "/v1/users",
        params: [
          { key: "page", value: "1" },
          { key: "limit", value: "10" },
          { key: "sort", value: "created_at" }
        ]
      },
      search: {
        baseUrl: "https://www.google.com",
        endpoint: "/search",
        params: [
          { key: "q", value: "javascript" },
          { key: "hl", value: "ko" },
          { key: "gl", value: "kr" }
        ]
      },
      social: {
        baseUrl: "https://twitter.com",
        endpoint: "/intent/tweet",
        params: [
          { key: "text", value: "Check this out!" },
          { key: "url", value: "https://example.com" },
          { key: "hashtags", value: "javascript,webdev" }
        ]
      },
      email: {
        baseUrl: "mailto:user@example.com",
        endpoint: "",
        params: [
          { key: "subject", value: "Hello" },
          { key: "body", value: "How are you?" }
        ]
      },
      download: {
        baseUrl: "https://files.example.com",
        endpoint: "/download",
        params: [
          { key: "file", value: "document.pdf" },
          { key: "token", value: "abc123" }
        ]
      }
    };

    const tmpl = templates[template];
    if (tmpl) {
      document.getElementById("baseUrl").value = tmpl.baseUrl;
      document.getElementById("endpoint").value = tmpl.endpoint;
      
      // 동적 매개변수 추가
      const container = document.getElementById("dynamicParams");
      container.innerHTML = '<button id="addDynamicParam" class="btn-info">➕ 매개변수 추가</button>';
      
      tmpl.params.forEach(param => {
        this.addDynamicParamWithValues(param.key, param.value);
      });
      
      this.showNotification(`${template} 템플릿이 로드되었습니다`, "success");
    }
  }

  addDynamicParam() {
    this.addDynamicParamWithValues("", "");
  }

  addDynamicParamWithValues(key = "", value = "") {
    const container = document.getElementById("dynamicParams");
    const paramDiv = document.createElement("div");
    paramDiv.className = "dynamic-param-item";
    
    paramDiv.innerHTML = `
      <input type="text" placeholder="키" value="${key}">
      <input type="text" placeholder="값" value="${value}">
      <button type="button" onclick="this.parentElement.remove()" class="btn-small btn-danger">🗑️</button>
    `;
    
    container.insertBefore(paramDiv, container.lastElementChild);
  }

  buildUrl() {
    const baseUrl = document.getElementById("baseUrl").value.trim();
    const endpoint = document.getElementById("endpoint").value.trim();
    
    if (!baseUrl) {
      this.showNotification("기본 URL을 입력하세요", "warning");
      return;
    }

    try {
      const url = new URL(endpoint || "", baseUrl);
      
      // 동적 매개변수 추가
      const paramItems = document.querySelectorAll(".dynamic-param-item");
      paramItems.forEach(item => {
        const inputs = item.querySelectorAll("input");
        const key = inputs[0].value.trim();
        const value = inputs[1].value.trim();
        
        if (key) {
          url.searchParams.set(key, value);
        }
      });
      
      this.currentUrl = url;
      this.updateManipulatedUrl();
      document.getElementById("urlInput").value = url.href;
      this.displayUrlResult(url);
      
      this.showNotification("URL이 성공적으로 생성되었습니다", "success");
    } catch (error) {
      this.showNotification(`URL 생성 실패: ${error.message}`, "error");
    }
  }

  testUrl() {
    const manipulatedInput = document.querySelector("#manipulatedUrl input");
    const url = manipulatedInput.value;
    
    if (!url) {
      this.showNotification("테스트할 URL이 없습니다", "warning");
      return;
    }
    
    // 새 탭에서 URL 열기
    window.open(url, "_blank");
    this.showNotification("새 탭에서 URL을 열었습니다", "info");
  }

  encodeUrl() {
    const input = document.getElementById("encodeInput").value;
    if (!input) {
      this.showNotification("인코딩할 텍스트를 입력하세요", "warning");
      return;
    }
    
    const encoded = encodeURIComponent(input);
    document.getElementById("encodeOutput").value = encoded;
    this.showNotification("URL 인코딩 완료", "success");
  }

  decodeUrl() {
    const input = document.getElementById("encodeInput").value;
    if (!input) {
      this.showNotification("디코딩할 텍스트를 입력하세요", "warning");
      return;
    }
    
    try {
      const decoded = decodeURIComponent(input);
      document.getElementById("encodeOutput").value = decoded;
      this.showNotification("URL 디코딩 완료", "success");
    } catch (error) {
      this.showNotification("디코딩 실패: 유효하지 않은 형식", "error");
    }
  }

  base64Encode() {
    const input = document.getElementById("encodeInput").value;
    if (!input) {
      this.showNotification("인코딩할 텍스트를 입력하세요", "warning");
      return;
    }
    
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      document.getElementById("encodeOutput").value = encoded;
      this.showNotification("Base64 인코딩 완료", "success");
    } catch (error) {
      this.showNotification("Base64 인코딩 실패", "error");
    }
  }

  base64Decode() {
    const input = document.getElementById("encodeInput").value;
    if (!input) {
      this.showNotification("디코딩할 텍스트를 입력하세요", "warning");
      return;
    }
    
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      document.getElementById("encodeOutput").value = decoded;
      this.showNotification("Base64 디코딩 완료", "success");
    } catch (error) {
      this.showNotification("Base64 디코딩 실패: 유효하지 않은 형식", "error");
    }
  }

  shortenUrl() {
    const longUrl = document.getElementById("longUrl").value.trim();
    const customAlias = document.getElementById("customAlias").checked;
    const alias = document.getElementById("aliasInput").value.trim();
    
    if (!longUrl) {
      this.showNotification("단축할 URL을 입력하세요", "warning");
      return;
    }
    
    try {
      new URL(longUrl); // URL 유효성 검사
      
      // 시뮬레이션된 단축 URL 생성
      const shortCode = customAlias && alias ? alias : this.generateShortCode();
      const shortUrl = `https://short.ly/${shortCode}`;
      
      const resultDiv = document.getElementById("shortenedResult");
      resultDiv.innerHTML = `
        <div class="shortened-success">
          <h4>✅ URL 단축 완료</h4>
          <div class="url-result-item">
            <label>원본 URL:</label>
            <div class="url-display">${this.escapeHtml(longUrl)}</div>
          </div>
          <div class="url-result-item">
            <label>단축 URL:</label>
            <div class="url-display">
              <span>${shortUrl}</span>
              <button onclick="window.urlAPI.copyToClipboard('${shortUrl}')" class="btn-small btn-info">📋</button>
            </div>
          </div>
          <div class="url-stats">
            <span>클릭 수: 0</span>
            <span>생성일: ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
      `;
      
      this.showNotification("URL이 단축되었습니다", "success");
    } catch (error) {
      this.showNotification("유효하지 않은 URL입니다", "error");
    }
  }

  generateShortCode() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  validateUrl() {
    const input = document.getElementById("validateInput").value.trim();
    if (!input) {
      this.showNotification("검증할 URL을 입력하세요", "warning");
      return;
    }

    const checkSyntax = document.getElementById("checkSyntax").checked;
    const checkReachable = document.getElementById("checkReachable").checked;
    const checkSecurity = document.getElementById("checkSecurity").checked;
    const checkRedirects = document.getElementById("checkRedirects").checked;
    const checkCertificate = document.getElementById("checkCertificate").checked;

    const results = {
      syntax: checkSyntax ? this.validateSyntax(input) : null,
      reachable: checkReachable ? this.checkReachability(input) : null,
      security: checkSecurity ? this.checkSecurity(input) : null,
      redirects: checkRedirects ? this.checkRedirects(input) : null,
      certificate: checkCertificate ? this.checkCertificate(input) : null,
    };

    this.displayValidationResults(results);
  }

  validateSyntax(urlString) {
    try {
      const url = new URL(urlString);
      return {
        valid: true,
        message: "문법이 올바릅니다",
        details: {
          protocol: url.protocol,
          hostname: url.hostname,
          isSecure: url.protocol === "https:",
        }
      };
    } catch (error) {
      return {
        valid: false,
        message: `문법 오류: ${error.message}`,
        details: null
      };
    }
  }

  checkReachability(urlString) {
    // 실제로는 fetch 요청으로 확인하지만, 여기서는 시뮬레이션
    return {
      valid: Math.random() > 0.3,
      message: Math.random() > 0.3 ? "접근 가능" : "접근 불가능",
      details: {
        statusCode: Math.random() > 0.3 ? 200 : 404,
        responseTime: Math.floor(Math.random() * 1000) + "ms"
      }
    };
  }

  checkSecurity(urlString) {
    const url = new URL(urlString);
    const isSecure = url.protocol === "https:";
    const suspiciousDomains = ["phishing.com", "malware.net", "spam.org"];
    const isSuspicious = suspiciousDomains.some(domain => url.hostname.includes(domain));
    
    return {
      valid: isSecure && !isSuspicious,
      message: isSecure && !isSuspicious ? "안전함" : "보안 위험 감지",
      details: {
        https: isSecure,
        suspicious: isSuspicious,
        malwareCheck: !isSuspicious
      }
    };
  }

  checkRedirects(urlString) {
    // 시뮬레이션된 리다이렉트 체크
    const redirectCount = Math.floor(Math.random() * 4);
    return {
      valid: redirectCount < 3,
      message: redirectCount === 0 ? "리다이렉트 없음" : `${redirectCount}번 리다이렉트`,
      details: {
        redirectCount,
        finalUrl: redirectCount > 0 ? "https://final-destination.com" : urlString
      }
    };
  }

  checkCertificate(urlString) {
    const url = new URL(urlString);
    if (url.protocol !== "https:") {
      return {
        valid: false,
        message: "HTTPS 아님",
        details: null
      };
    }
    
    const isValid = Math.random() > 0.2;
    return {
      valid: isValid,
      message: isValid ? "인증서 유효" : "인증서 문제",
      details: {
        issuer: isValid ? "Let's Encrypt" : "Unknown",
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        valid: isValid
      }
    };
  }

  displayValidationResults(results) {
    const container = document.getElementById("validationResults");
    
    const resultsHtml = Object.entries(results)
      .filter(([key, result]) => result !== null)
      .map(([key, result]) => `
        <div class="validation-result ${result.valid ? 'valid' : 'invalid'}">
          <div class="result-header">
            <span class="result-icon">${result.valid ? '✅' : '❌'}</span>
            <span class="result-title">${this.getValidationTitle(key)}</span>
            <span class="result-status ${result.valid ? 'success' : 'error'}">${result.message}</span>
          </div>
          ${result.details ? `
            <div class="result-details">
              ${Object.entries(result.details).map(([detailKey, detailValue]) => `
                <div class="detail-item">
                  <span class="detail-key">${detailKey}:</span>
                  <span class="detail-value">${detailValue}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    
    container.innerHTML = `
      <div class="validation-summary">
        <h3>🔍 검증 결과</h3>
        ${resultsHtml || '<div class="no-results">검증 옵션을 선택하고 다시 시도하세요</div>'}
      </div>
    `;
  }

  getValidationTitle(key) {
    const titles = {
      syntax: "문법 검사",
      reachable: "접근 가능성",
      security: "보안 검사",
      redirects: "리다이렉트",
      certificate: "SSL 인증서"
    };
    return titles[key] || key;
  }

  switchBookmarkTab(tab) {
    document.querySelectorAll(".bookmark-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    document.querySelectorAll(".bookmark-panel").forEach(panel => panel.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }

  addBookmark() {
    const url = document.getElementById("bookmarkUrl").value.trim();
    const title = document.getElementById("bookmarkTitle").value.trim();
    const category = document.getElementById("bookmarkCategory").value;

    if (!url) {
      this.showNotification("북마크할 URL을 입력하세요", "warning");
      return;
    }

    try {
      new URL(url); // URL 유효성 검사
      
      const bookmark = {
        id: Date.now(),
        url,
        title: title || this.extractTitle(url),
        category,
        dateAdded: new Date().toISOString(),
        clicks: 0
      };

      this.bookmarks.push(bookmark);
      this.saveBookmarks();
      this.displayBookmarks();
      this.updateStats();

      // 입력 필드 초기화
      document.getElementById("bookmarkUrl").value = "";
      document.getElementById("bookmarkTitle").value = "";

      this.showNotification("북마크가 추가되었습니다", "success");
    } catch (error) {
      this.showNotification("유효하지 않은 URL입니다", "error");
    }
  }

  displayBookmarks() {
    const container = document.getElementById("bookmarkList");
    
    if (this.bookmarks.length === 0) {
      container.innerHTML = '<div class="bookmarks-placeholder">북마크가 없습니다</div>';
      return;
    }

    const groupedBookmarks = this.groupBy(this.bookmarks, 'category');
    
    container.innerHTML = Object.entries(groupedBookmarks).map(([category, bookmarks]) => `
      <div class="bookmark-category">
        <h4 class="category-header">
          <span class="category-icon">${this.getCategoryIcon(category)}</span>
          <span class="category-name">${this.getCategoryName(category)}</span>
          <span class="category-count">(${bookmarks.length})</span>
        </h4>
        <div class="bookmark-items">
          ${bookmarks.map(bookmark => `
            <div class="bookmark-item">
              <div class="bookmark-icon">🔗</div>
              <div class="bookmark-content">
                <div class="bookmark-title">${this.escapeHtml(bookmark.title)}</div>
                <div class="bookmark-url">${this.escapeHtml(bookmark.url)}</div>
                <div class="bookmark-meta">
                  <span class="bookmark-date">${new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                  <span class="bookmark-clicks">${bookmark.clicks} 클릭</span>
                </div>
              </div>
              <div class="bookmark-actions">
                <button onclick="window.urlAPI.openBookmark(${bookmark.id})" class="btn-small btn-success">🔗</button>
                <button onclick="window.urlAPI.editBookmark(${bookmark.id})" class="btn-small btn-info">✏️</button>
                <button onclick="window.urlAPI.deleteBookmark(${bookmark.id})" class="btn-small btn-danger">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  addToHistory(url) {
    const historyItem = {
      id: Date.now(),
      url,
      title: this.extractTitle(url),
      visitDate: new Date().toISOString(),
      domain: this.extractDomain(url)
    };

    // 중복 제거 (같은 URL은 최신 것만 유지)
    this.urlHistory = this.urlHistory.filter(item => item.url !== url);
    this.urlHistory.unshift(historyItem);

    // 최대 1000개까지만 유지
    if (this.urlHistory.length > 1000) {
      this.urlHistory = this.urlHistory.slice(0, 1000);
    }

    this.saveHistory();
    this.displayHistory();
  }

  displayHistory() {
    const container = document.getElementById("historyList");
    const filter = document.getElementById("historyFilter")?.value || "all";
    const searchTerm = document.getElementById("historySearch")?.value?.toLowerCase() || "";

    let filteredHistory = this.urlHistory;

    // 날짜 필터 적용
    if (filter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filteredHistory = filteredHistory.filter(item => 
        new Date(item.visitDate) >= filterDate
      );
    }

    // 검색 필터 적용
    if (searchTerm) {
      filteredHistory = filteredHistory.filter(item =>
        item.url.toLowerCase().includes(searchTerm) ||
        item.title.toLowerCase().includes(searchTerm) ||
        item.domain.toLowerCase().includes(searchTerm)
      );
    }

    if (filteredHistory.length === 0) {
      container.innerHTML = '<div class="history-placeholder">히스토리가 없습니다</div>';
      return;
    }

    container.innerHTML = filteredHistory.map(item => `
      <div class="history-item">
        <div class="history-icon">🌐</div>
        <div class="history-content">
          <div class="history-title">${this.escapeHtml(item.title)}</div>
          <div class="history-url">${this.escapeHtml(item.url)}</div>
          <div class="history-meta">
            <span class="history-domain">${item.domain}</span>
            <span class="history-date">${new Date(item.visitDate).toLocaleString()}</span>
          </div>
        </div>
        <div class="history-actions">
          <button onclick="window.urlAPI.visitHistoryItem('${item.url}')" class="btn-small btn-success">🔗</button>
          <button onclick="window.urlAPI.bookmarkFromHistory('${item.url}', '${item.title}')" class="btn-small btn-info">⭐</button>
          <button onclick="window.urlAPI.deleteHistoryItem(${item.id})" class="btn-small btn-danger">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  updateStats() {
    document.getElementById("totalUrls").textContent = this.urlHistory.length;
    document.getElementById("totalBookmarks").textContent = this.bookmarks.length;
    document.getElementById("totalHistory").textContent = this.urlHistory.length;
    
    const uniqueDomains = new Set(this.urlHistory.map(item => item.domain));
    document.getElementById("uniqueDomains").textContent = uniqueDomains.size;

    this.updateCharts();
  }

  updateCharts() {
    this.updateDomainChart();
    this.updateCategoryChart();
  }

  updateDomainChart() {
    const container = document.getElementById("domainChart");
    const domains = {};

    this.urlHistory.forEach(item => {
      domains[item.domain] = (domains[item.domain] || 0) + 1;
    });

    const sortedDomains = Object.entries(domains)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    if (sortedDomains.length === 0) {
      container.innerHTML = '<div class="chart-placeholder">데이터가 없습니다</div>';
      return;
    }

    const maxCount = Math.max(...sortedDomains.map(([,count]) => count));

    container.innerHTML = sortedDomains.map(([domain, count]) => `
      <div class="chart-bar">
        <div class="chart-label">${domain}</div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
          <span class="chart-value">${count}</span>
        </div>
      </div>
    `).join('');
  }

  updateCategoryChart() {
    const container = document.getElementById("categoryChart");
    const categories = {};

    this.bookmarks.forEach(bookmark => {
      categories[bookmark.category] = (categories[bookmark.category] || 0) + 1;
    });

    const sortedCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a);

    if (sortedCategories.length === 0) {
      container.innerHTML = '<div class="chart-placeholder">데이터가 없습니다</div>';
      return;
    }

    const maxCount = Math.max(...sortedCategories.map(([,count]) => count));

    container.innerHTML = sortedCategories.map(([category, count]) => `
      <div class="chart-bar">
        <div class="chart-label">
          <span class="category-icon">${this.getCategoryIcon(category)}</span>
          ${this.getCategoryName(category)}
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
          <span class="chart-value">${count}</span>
        </div>
      </div>
    `).join('');
  }

  // 유틸리티 메소드들
  extractTLD(hostname) {
    const parts = hostname.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  extractSubdomain(hostname) {
    const parts = hostname.split('.');
    return parts.length > 2 ? parts.slice(0, -2).join('.') : '';
  }

  extractTitle(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'mailto:') return `Email to ${urlObj.pathname}`;
      if (urlObj.protocol === 'tel:') return `Call ${urlObj.pathname}`;
      return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
    } catch {
      return url;
    }
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  getCategoryIcon(category) {
    const icons = {
      general: '📁',
      work: '💼',
      dev: '💻',
      social: '📱',
      news: '📰'
    };
    return icons[category] || '📁';
  }

  getCategoryName(category) {
    const names = {
      general: '일반',
      work: '업무',
      dev: '개발',
      social: '소셜',
      news: '뉴스'
    };
    return names[category] || category;
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification("클립보드에 복사되었습니다", "success");
    }).catch(() => {
      this.showNotification("복사 실패", "error");
    });
  }

  openUrl(url) {
    window.open(url, '_blank');
  }

  shareUrl(url) {
    if (navigator.share) {
      navigator.share({
        title: 'URL 공유',
        url: url
      });
    } else {
      this.copyToClipboard(url);
    }
  }

  loadSampleUrls() {
    // 샘플 URL들이 이미 HTML에 포함되어 있음
  }

  saveBookmarks() {
    localStorage.setItem('urlapi_bookmarks', JSON.stringify(this.bookmarks));
  }

  loadBookmarks() {
    const saved = localStorage.getItem('urlapi_bookmarks');
    if (saved) {
      this.bookmarks = JSON.parse(saved);
      this.displayBookmarks();
    }
  }

  saveHistory() {
    localStorage.setItem('urlapi_history', JSON.stringify(this.urlHistory));
  }

  clearUrl() {
    document.getElementById("urlInput").value = "";
    document.getElementById("urlResult").innerHTML = '<div class="result-placeholder">URL을 입력하고 분석 버튼을 클릭하세요</div>';
    this.currentUrl = null;
    this.updateManipulatedUrl();
  }

  displayUrlError(message) {
    const resultDiv = document.getElementById("urlResult");
    resultDiv.innerHTML = `
      <div class="url-error">
        <div class="error-icon">❌</div>
        <div class="error-message">
          <h3>URL 분석 실패</h3>
          <p>${this.escapeHtml(message)}</p>
          <div class="error-help">
            <h4>올바른 URL 형식:</h4>
            <ul>
              <li>https://example.com</li>
              <li>http://subdomain.example.com:8080/path</li>
              <li>mailto:user@example.com</li>
              <li>tel:+82-10-1234-5678</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notification = document.createElement("div");
    
    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌"
    };
    
    const icon = icons[type] || "ℹ️";
    
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    notification.querySelector(".notification-close").addEventListener("click", () => {
      notification.remove();
    });

    notifications.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// 전역 접근을 위한 설정
window.urlAPI = null;

// 초기화
function initURLAPI() {
  console.log("🚀 URL API 초기화 함수 호출");
  window.urlAPI = new URLAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initURLAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initURLAPI();
}

console.log(
  "📄 URL API 스크립트 로드 완료, readyState:",
  document.readyState
);
