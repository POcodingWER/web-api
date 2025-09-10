import "./style.css";

class WebStorageAPI {
  constructor() {
    this.storageData = {
      localStorage: new Map(),
      sessionStorage: new Map(),
    };
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.loadStorageData();
    this.checkStorageSupport();
    this.updateStorageStats();
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = `
      <div class="storage-container">
        <header class="storage-header">
          <h1>💾 Web Storage API 데모</h1>
          <p>LocalStorage와 SessionStorage를 활용한 클라이언트 사이드 데이터 저장</p>
          <div class="support-status" id="supportStatus">
            <div class="status-item">
              <span class="status-indicator" id="localStorageStatus">⏳</span>
              <span>LocalStorage</span>
            </div>
            <div class="status-item">
              <span class="status-indicator" id="sessionStorageStatus">⏳</span>
              <span>SessionStorage</span>
            </div>
          </div>
        </header>

        <nav class="storage-nav">
          <button class="nav-btn active" data-tab="basic">🔧 기본 작업</button>
          <button class="nav-btn" data-tab="manager">📋 데이터 관리</button>
          <button class="nav-btn" data-tab="comparison">⚖️ 저장소 비교</button>
          <button class="nav-btn" data-tab="analytics">📊 사용량 분석</button>
          <button class="nav-btn" data-tab="tools">🛠️ 개발 도구</button>
          <button class="nav-btn" data-tab="demo">🎮 데모 앱</button>
        </nav>

        <main class="storage-main">
          <!-- 기본 작업 탭 -->
          <section class="tab-content active" data-tab="basic">
            <div class="section-header">
              <h2>🔧 기본 저장소 작업</h2>
              <p>LocalStorage와 SessionStorage의 기본 CRUD 작업</p>
            </div>

            <div class="storage-operations">
              <div class="storage-type-selector">
                <label>저장소 유형:</label>
                <div class="radio-group">
                  <label><input type="radio" name="storageType" value="localStorage" checked> 💾 LocalStorage (영구)</label>
                  <label><input type="radio" name="storageType" value="sessionStorage"> 🔄 SessionStorage (임시)</label>
                </div>
              </div>

              <div class="operation-section">
                <h3>➕ 데이터 저장</h3>
                <div class="input-group">
                  <label for="saveKey">키 (Key):</label>
                  <input type="text" id="saveKey" placeholder="데이터의 고유 식별자">
                </div>
                <div class="input-group">
                  <label for="saveValue">값 (Value):</label>
                  <textarea id="saveValue" placeholder="저장할 데이터 (JSON, 텍스트 등)" rows="3"></textarea>
                </div>
                <div class="value-type-selector">
                  <label>데이터 타입:</label>
                  <select id="valueType">
                    <option value="string">문자열 (String)</option>
                    <option value="number">숫자 (Number)</option>
                    <option value="boolean">불린 (Boolean)</option>
                    <option value="object">객체 (Object/JSON)</option>
                    <option value="array">배열 (Array)</option>
                  </select>
                </div>
                <button id="saveData" class="btn-primary">💾 저장</button>
              </div>

              <div class="operation-section">
                <h3>🔍 데이터 읽기</h3>
                <div class="input-group">
                  <label for="readKey">키 (Key):</label>
                  <div class="key-input-wrapper">
                    <input type="text" id="readKey" placeholder="읽을 데이터의 키">
                    <button id="readData" class="btn-secondary">🔍 읽기</button>
                  </div>
                </div>
                <div class="result-area">
                  <label>읽기 결과:</label>
                  <div id="readResult" class="result-box"></div>
                  <div class="result-actions">
                    <button id="copyReadResult" class="btn-small">📋 복사</button>
                    <button id="clearReadResult" class="btn-small">🗑️ 지우기</button>
                  </div>
                </div>
              </div>

              <div class="operation-section">
                <h3>🗑️ 데이터 삭제</h3>
                <div class="input-group">
                  <label for="deleteKey">키 (Key):</label>
                  <div class="key-input-wrapper">
                    <input type="text" id="deleteKey" placeholder="삭제할 데이터의 키">
                    <button id="deleteData" class="btn-danger">🗑️ 삭제</button>
                  </div>
                </div>
                <div class="bulk-operations">
                  <button id="clearStorage" class="btn-warning">🧹 전체 삭제</button>
                  <button id="refreshData" class="btn-accent">🔄 새로고침</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 데이터 관리 탭 -->
          <section class="tab-content" data-tab="manager">
            <div class="section-header">
              <h2>📋 저장소 데이터 관리</h2>
              <p>저장된 모든 데이터를 한눈에 보고 관리하세요</p>
            </div>

            <div class="storage-manager">
              <div class="manager-controls">
                <div class="filter-section">
                  <select id="storageFilter">
                    <option value="all">모든 저장소</option>
                    <option value="localStorage">LocalStorage만</option>
                    <option value="sessionStorage">SessionStorage만</option>
                  </select>
                  <input type="text" id="searchFilter" placeholder="🔍 키 또는 값 검색...">
                  <select id="typeFilter">
                    <option value="all">모든 타입</option>
                    <option value="string">문자열</option>
                    <option value="number">숫자</option>
                    <option value="boolean">불린</option>
                    <option value="object">객체</option>
                    <option value="array">배열</option>
                  </select>
                </div>
                <div class="action-section">
                  <button id="exportData" class="btn-secondary">📤 데이터 내보내기</button>
                  <button id="importData" class="btn-secondary">📥 데이터 가져오기</button>
                  <button id="generateSampleData" class="btn-accent">🎲 샘플 데이터 생성</button>
                  <input type="file" id="importFileInput" accept=".json" style="display: none;">
                </div>
              </div>

              <div class="data-grid">
                <div class="grid-header">
                  <div class="grid-cell">저장소</div>
                  <div class="grid-cell">키</div>
                  <div class="grid-cell">값</div>
                  <div class="grid-cell">타입</div>
                  <div class="grid-cell">크기</div>
                  <div class="grid-cell">생성시간</div>
                  <div class="grid-cell">작업</div>
                </div>
                <div id="dataGridBody" class="grid-body"></div>
              </div>

              <div class="pagination-controls">
                <button id="prevPage" class="btn-small">◀ 이전</button>
                <span id="pageInfo">페이지 1 / 1</span>
                <button id="nextPage" class="btn-small">다음 ▶</button>
                <select id="pageSize">
                  <option value="10">10개씩</option>
                  <option value="25" selected>25개씩</option>
                  <option value="50">50개씩</option>
                  <option value="100">100개씩</option>
                </select>
              </div>
            </div>
          </section>

          <!-- 저장소 비교 탭 -->
          <section class="tab-content" data-tab="comparison">
            <div class="section-header">
              <h2>⚖️ LocalStorage vs SessionStorage</h2>
              <p>두 저장소의 특성과 차이점을 비교해보세요</p>
            </div>

            <div class="comparison-content">
              <div class="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>특성</th>
                      <th>💾 LocalStorage</th>
                      <th>🔄 SessionStorage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>지속성</strong></td>
                      <td>영구 저장 (수동 삭제 전까지)</td>
                      <td>세션 종료 시 삭제</td>
                    </tr>
                    <tr>
                      <td><strong>범위</strong></td>
                      <td>같은 오리진의 모든 탭/창</td>
                      <td>현재 탭/창만</td>
                    </tr>
                    <tr>
                      <td><strong>용량 제한</strong></td>
                      <td>약 5-10MB</td>
                      <td>약 5-10MB</td>
                    </tr>
                    <tr>
                      <td><strong>API</strong></td>
                      <td>동일한 API</td>
                      <td>동일한 API</td>
                    </tr>
                    <tr>
                      <td><strong>사용 사례</strong></td>
                      <td>설정, 캐시, 사용자 데이터</td>
                      <td>임시 데이터, 폼 상태</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="live-comparison">
                <h3>🔄 실시간 비교 테스트</h3>
                <div class="comparison-demo">
                  <div class="storage-demo">
                    <h4>💾 LocalStorage 테스트</h4>
                    <div class="demo-controls">
                      <input type="text" id="localTestKey" placeholder="키">
                      <input type="text" id="localTestValue" placeholder="값">
                      <button id="localTestSave" class="btn-primary">저장</button>
                      <button id="localTestRead" class="btn-secondary">읽기</button>
                      <button id="localTestDelete" class="btn-danger">삭제</button>
                    </div>
                    <div id="localTestResult" class="test-result"></div>
                  </div>

                  <div class="storage-demo">
                    <h4>🔄 SessionStorage 테스트</h4>
                    <div class="demo-controls">
                      <input type="text" id="sessionTestKey" placeholder="키">
                      <input type="text" id="sessionTestValue" placeholder="값">
                      <button id="sessionTestSave" class="btn-primary">저장</button>
                      <button id="sessionTestRead" class="btn-secondary">읽기</button>
                      <button id="sessionTestDelete" class="btn-danger">삭제</button>
                    </div>
                    <div id="sessionTestResult" class="test-result"></div>
                  </div>
                </div>

                <div class="persistence-test">
                  <h4>🧪 지속성 테스트</h4>
                  <p>새 탭에서 이 페이지를 열어보세요:</p>
                  <button id="openNewTab" class="btn-accent">🔗 새 탭에서 열기</button>
                  <div class="test-instructions">
                    <ul>
                      <li>LocalStorage 데이터는 새 탭에서도 보임</li>
                      <li>SessionStorage 데이터는 새 탭에서 안 보임</li>
                      <li>브라우저를 완전히 종료하고 다시 열면?</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 사용량 분석 탭 -->
          <section class="tab-content" data-tab="analytics">
            <div class="section-header">
              <h2>📊 저장소 사용량 분석</h2>
              <p>저장소 용량과 데이터 분포를 시각적으로 확인하세요</p>
            </div>

            <div class="analytics-content">
              <div class="storage-stats">
                <div class="stat-card">
                  <h3>💾 LocalStorage</h3>
                  <div class="stat-item">
                    <span class="stat-label">항목 수:</span>
                    <span id="localStorageCount" class="stat-value">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">사용 용량:</span>
                    <span id="localStorageSize" class="stat-value">0 B</span>
                  </div>
                  <div class="usage-bar">
                    <div id="localStorageUsage" class="usage-fill"></div>
                  </div>
                  <div class="usage-percentage" id="localStoragePercent">0%</div>
                </div>

                <div class="stat-card">
                  <h3>🔄 SessionStorage</h3>
                  <div class="stat-item">
                    <span class="stat-label">항목 수:</span>
                    <span id="sessionStorageCount" class="stat-value">0</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">사용 용량:</span>
                    <span id="sessionStorageSize" class="stat-value">0 B</span>
                  </div>
                  <div class="usage-bar">
                    <div id="sessionStorageUsage" class="usage-fill"></div>
                  </div>
                  <div class="usage-percentage" id="sessionStoragePercent">0%</div>
                </div>
              </div>

              <div class="data-distribution">
                <h3>📈 데이터 타입 분포</h3>
                <canvas id="distributionChart" width="400" height="200"></canvas>
              </div>

              <div class="size-analysis">
                <h3>📏 크기별 분석</h3>
                <div id="sizeAnalysisChart" class="size-chart"></div>
              </div>

              <div class="quota-info">
                <h3>💿 저장소 할당량 정보</h3>
                <div id="quotaInfo" class="quota-details">
                  <p>저장소 할당량 정보를 가져오는 중...</p>
                </div>
              </div>
            </div>
          </section>

          <!-- 개발 도구 탭 -->
          <section class="tab-content" data-tab="tools">
            <div class="section-header">
              <h2>🛠️ 개발자 도구</h2>
              <p>디버깅과 개발에 유용한 도구들</p>
            </div>

            <div class="dev-tools">
              <div class="tool-section">
                <h3>🔍 저장소 모니터링</h3>
                <div class="monitoring-controls">
                  <button id="startMonitoring" class="btn-primary">📡 모니터링 시작</button>
                  <button id="stopMonitoring" class="btn-secondary">⏹️ 중지</button>
                  <button id="clearLog" class="btn-accent">🧹 로그 지우기</button>
                </div>
                <div id="monitoringLog" class="monitoring-log">
                  <p>모니터링을 시작하면 저장소 변경 사항이 여기에 표시됩니다.</p>
                </div>
              </div>

              <div class="tool-section">
                <h3>🧪 배치 작업</h3>
                <div class="batch-operations">
                  <div class="batch-control">
                    <label for="batchCount">생성할 항목 수:</label>
                    <input type="number" id="batchCount" value="100" min="1" max="1000">
                    <button id="createBatchData" class="btn-primary">📦 배치 생성</button>
                  </div>
                  <div class="batch-control">
                    <label for="batchPrefix">키 접두사:</label>
                    <input type="text" id="batchPrefix" value="test_" placeholder="예: user_, data_">
                    <button id="deleteBatchData" class="btn-danger">🗑️ 배치 삭제</button>
                  </div>
                </div>
              </div>

              <div class="tool-section">
                <h3>⚡ 성능 테스트</h3>
                <div class="performance-test">
                  <div class="test-controls">
                    <label for="testDataSize">테스트 데이터 크기:</label>
                    <select id="testDataSize">
                      <option value="small">작음 (1KB)</option>
                      <option value="medium">중간 (10KB)</option>
                      <option value="large">큼 (100KB)</option>
                      <option value="huge">매우 큼 (1MB)</option>
                    </select>
                    <button id="runPerformanceTest" class="btn-accent">🚀 성능 테스트</button>
                  </div>
                  <div id="performanceResults" class="performance-results"></div>
                </div>
              </div>

              <div class="tool-section">
                <h3>🔧 유틸리티</h3>
                <div class="utilities">
                  <button id="validateData" class="btn-secondary">✅ 데이터 유효성 검사</button>
                  <button id="compactStorage" class="btn-secondary">🗜️ 저장소 압축</button>
                  <button id="backupStorage" class="btn-accent">💾 백업 생성</button>
                  <button id="restoreStorage" class="btn-accent">🔄 백업 복원</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 데모 앱 탭 -->
          <section class="tab-content" data-tab="demo">
            <div class="section-header">
              <h2>🎮 실제 활용 데모</h2>
              <p>Web Storage API를 활용한 실용적인 예제들</p>
            </div>

            <div class="demo-apps">
              <div class="demo-app">
                <h3>📝 메모장 앱</h3>
                <div class="notepad-app">
                  <div class="notepad-controls">
                    <input type="text" id="noteTitle" placeholder="메모 제목">
                    <button id="saveNote" class="btn-primary">💾 저장</button>
                    <button id="loadNote" class="btn-secondary">📂 불러오기</button>
                    <button id="deleteNote" class="btn-danger">🗑️ 삭제</button>
                  </div>
                  <textarea id="noteContent" placeholder="메모 내용을 입력하세요..." rows="10"></textarea>
                  <div class="note-list">
                    <h4>저장된 메모:</h4>
                    <div id="notesList"></div>
                  </div>
                </div>
              </div>

              <div class="demo-app">
                <h3>⚙️ 설정 관리</h3>
                <div class="settings-app">
                  <div class="setting-group">
                    <label>테마:</label>
                    <select id="themeSetting">
                      <option value="light">라이트</option>
                      <option value="dark">다크</option>
                      <option value="auto">자동</option>
                    </select>
                  </div>
                  <div class="setting-group">
                    <label>언어:</label>
                    <select id="languageSetting">
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                  <div class="setting-group">
                    <label>
                      <input type="checkbox" id="notificationSetting">
                      알림 활성화
                    </label>
                  </div>
                  <div class="setting-group">
                    <label>자동 저장 간격:</label>
                    <input type="range" id="autoSaveSetting" min="5" max="60" value="30">
                    <span id="autoSaveValue">30초</span>
                  </div>
                  <button id="saveSettings" class="btn-primary">💾 설정 저장</button>
                  <button id="resetSettings" class="btn-warning">🔄 기본값 복원</button>
                </div>
              </div>

              <div class="demo-app">
                <h3>🛒 장바구니</h3>
                <div class="cart-app">
                  <div class="product-section">
                    <h4>상품 목록:</h4>
                    <div class="product-grid" id="productGrid">
                      <!-- 상품 목록이 여기에 동적으로 생성됩니다 -->
                    </div>
                  </div>
                  <div class="cart-section">
                    <h4>🛒 장바구니:</h4>
                    <div id="cartItems" class="cart-items"></div>
                    <div class="cart-total">
                      <strong>총합: <span id="cartTotal">0원</span></strong>
                    </div>
                    <div class="cart-actions">
                      <button id="clearCart" class="btn-warning">🗑️ 장바구니 비우기</button>
                      <button id="checkout" class="btn-primary">💳 결제하기</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="demo-app">
                <h3>📊 사용자 통계</h3>
                <div class="stats-app">
                  <div class="stat-display">
                    <div class="stat-item">
                      <span class="stat-label">방문 횟수:</span>
                      <span id="visitCount" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">첫 방문:</span>
                      <span id="firstVisit" class="stat-value">-</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">마지막 방문:</span>
                      <span id="lastVisit" class="stat-value">-</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">총 사용 시간:</span>
                      <span id="totalTime" class="stat-value">0분</span>
                    </div>
                  </div>
                  <button id="resetStats" class="btn-warning">🔄 통계 초기화</button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>

        <!-- 모달들 -->
        <div id="editModal" class="modal hidden">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>✏️ 데이터 편집</h3>
            <div class="edit-form">
              <div class="input-group">
                <label for="editKey">키:</label>
                <input type="text" id="editKey" readonly>
              </div>
              <div class="input-group">
                <label for="editValue">값:</label>
                <textarea id="editValue" rows="5"></textarea>
              </div>
              <div class="input-group">
                <label for="editType">타입:</label>
                <select id="editType">
                  <option value="string">문자열</option>
                  <option value="number">숫자</option>
                  <option value="boolean">불린</option>
                  <option value="object">객체</option>
                  <option value="array">배열</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button id="saveEdit" class="btn-primary">💾 저장</button>
              <button id="cancelEdit" class="btn-secondary">❌ 취소</button>
            </div>
          </div>
        </div>

        <div id="confirmModal" class="modal hidden">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>⚠️ 확인</h3>
            <p id="confirmMessage"></p>
            <div class="modal-actions">
              <button id="confirmYes" class="btn-danger">예</button>
              <button id="confirmNo" class="btn-secondary">아니오</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // 탭 네비게이션
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTab(e.target.dataset.tab)
      );
    });

    // 기본 작업 이벤트
    document
      .getElementById("saveData")
      .addEventListener("click", () => this.saveData());
    document
      .getElementById("readData")
      .addEventListener("click", () => this.readData());
    document
      .getElementById("deleteData")
      .addEventListener("click", () => this.deleteData());
    document
      .getElementById("clearStorage")
      .addEventListener("click", () => this.clearStorage());
    document
      .getElementById("refreshData")
      .addEventListener("click", () => this.refreshData());

    // 결과 관련 이벤트
    document
      .getElementById("copyReadResult")
      .addEventListener("click", () => this.copyToClipboard("readResult"));
    document
      .getElementById("clearReadResult")
      .addEventListener("click", () => this.clearReadResult());

    // 데이터 관리 이벤트
    document
      .getElementById("storageFilter")
      .addEventListener("change", () => this.filterData());
    document
      .getElementById("searchFilter")
      .addEventListener("input", () => this.filterData());
    document
      .getElementById("typeFilter")
      .addEventListener("change", () => this.filterData());
    document
      .getElementById("exportData")
      .addEventListener("click", () => this.exportData());
    document
      .getElementById("importData")
      .addEventListener("click", () => this.importData());
    document
      .getElementById("generateSampleData")
      .addEventListener("click", () => this.generateSampleData());
    document
      .getElementById("importFileInput")
      .addEventListener("change", (e) => this.handleFileImport(e));

    // 페이지네이션 이벤트
    document
      .getElementById("prevPage")
      .addEventListener("click", () => this.changePage(-1));
    document
      .getElementById("nextPage")
      .addEventListener("click", () => this.changePage(1));
    document
      .getElementById("pageSize")
      .addEventListener("change", () => this.changePageSize());

    // 비교 테스트 이벤트
    this.setupComparisonEvents();

    // 개발 도구 이벤트
    this.setupDevToolsEvents();

    // 데모 앱 이벤트
    this.setupDemoAppEvents();

    // 모달 이벤트
    document.querySelectorAll(".modal-close").forEach((close) => {
      close.addEventListener("click", (e) =>
        this.closeModal(e.target.closest(".modal"))
      );
    });

    // 키보드 단축키
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );

    // 저장소 이벤트 리스너
    window.addEventListener("storage", (e) => this.handleStorageEvent(e));
  }

  // 기본 기능들
  checkStorageSupport() {
    const localStatus = document.getElementById("localStorageStatus");
    const sessionStatus = document.getElementById("sessionStorageStatus");

    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      localStatus.textContent = "✅";
      localStatus.className = "status-indicator success";
    } catch (e) {
      localStatus.textContent = "❌";
      localStatus.className = "status-indicator error";
      this.showNotification("LocalStorage를 사용할 수 없습니다", "error");
    }

    try {
      sessionStorage.setItem("test", "test");
      sessionStorage.removeItem("test");
      sessionStatus.textContent = "✅";
      sessionStatus.className = "status-indicator success";
    } catch (e) {
      sessionStatus.textContent = "❌";
      sessionStatus.className = "status-indicator error";
      this.showNotification("SessionStorage를 사용할 수 없습니다", "error");
    }
  }

  switchTab(tabName) {
    // 탭 버튼 활성화
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // 탭 컨텐츠 표시
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document
      .querySelector(`.tab-content[data-tab="${tabName}"]`)
      .classList.add("active");

    // 탭별 특별 처리
    if (tabName === "analytics") {
      this.updateStorageStats();
      this.drawDistributionChart();
    }
  }

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

  // === 저장소 기본 작업 ===
  getSelectedStorage() {
    const selectedType = document.querySelector(
      'input[name="storageType"]:checked'
    ).value;
    return selectedType === "localStorage" ? localStorage : sessionStorage;
  }

  saveData() {
    try {
      const key = document.getElementById("saveKey").value.trim();
      const value = document.getElementById("saveValue").value;
      const valueType = document.getElementById("valueType").value;

      if (!key) {
        this.showNotification("키를 입력하세요", "warning");
        return;
      }

      if (!value) {
        this.showNotification("값을 입력하세요", "warning");
        return;
      }

      const storage = this.getSelectedStorage();
      let processedValue = value;

      // 타입에 따른 값 처리
      try {
        switch (valueType) {
          case "number":
            processedValue = JSON.stringify(Number(value));
            break;
          case "boolean":
            processedValue = JSON.stringify(value.toLowerCase() === "true");
            break;
          case "object":
          case "array":
            JSON.parse(value); // 유효성 검사
            processedValue = value;
            break;
          default:
            processedValue = JSON.stringify(value);
        }
      } catch (e) {
        this.showNotification("잘못된 JSON 형식입니다", "error");
        return;
      }

      // 메타데이터와 함께 저장
      const dataWithMeta = {
        value: processedValue,
        type: valueType,
        timestamp: Date.now(),
        size: new Blob([processedValue]).size,
      };

      storage.setItem(key, JSON.stringify(dataWithMeta));

      this.showNotification(
        `${key} 데이터가 ${
          storage === localStorage ? "LocalStorage" : "SessionStorage"
        }에 저장되었습니다`,
        "success"
      );

      // 입력 필드 초기화
      document.getElementById("saveKey").value = "";
      document.getElementById("saveValue").value = "";

      this.loadStorageData();
      this.updateStorageStats();
    } catch (error) {
      console.error("저장 오류:", error);
      this.showNotification("데이터 저장 중 오류가 발생했습니다", "error");
    }
  }

  readData() {
    try {
      const key = document.getElementById("readKey").value.trim();

      if (!key) {
        this.showNotification("키를 입력하세요", "warning");
        return;
      }

      const storage = this.getSelectedStorage();
      const storedData = storage.getItem(key);

      if (storedData === null) {
        document.getElementById("readResult").innerHTML = `
          <div class="result-empty">
            <h4>❌ 데이터 없음</h4>
            <p>키 "${key}"에 해당하는 데이터를 찾을 수 없습니다.</p>
          </div>
        `;
        this.showNotification("해당 키의 데이터가 없습니다", "warning");
        return;
      }

      try {
        const parsedData = JSON.parse(storedData);
        const value = JSON.parse(parsedData.value);

        document.getElementById("readResult").innerHTML = `
          <div class="result-success">
            <h4>✅ 데이터 읽기 성공</h4>
            <div class="data-info">
              <p><strong>키:</strong> ${key}</p>
              <p><strong>타입:</strong> ${parsedData.type}</p>
              <p><strong>크기:</strong> ${this.formatBytes(parsedData.size)}</p>
              <p><strong>저장 시간:</strong> ${new Date(
                parsedData.timestamp
              ).toLocaleString()}</p>
            </div>
            <div class="data-value">
              <h5>값:</h5>
              <pre>${
                typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value
              }</pre>
            </div>
          </div>
        `;
      } catch (e) {
        // 레거시 데이터 (메타데이터 없음)
        document.getElementById("readResult").innerHTML = `
          <div class="result-success">
            <h4>✅ 데이터 읽기 성공</h4>
            <div class="data-info">
              <p><strong>키:</strong> ${key}</p>
              <p><strong>타입:</strong> 레거시 데이터</p>
            </div>
            <div class="data-value">
              <h5>값:</h5>
              <pre>${storedData}</pre>
            </div>
          </div>
        `;
      }

      this.showNotification("데이터를 성공적으로 읽었습니다", "success");
    } catch (error) {
      console.error("읽기 오류:", error);
      this.showNotification("데이터 읽기 중 오류가 발생했습니다", "error");
    }
  }

  deleteData() {
    try {
      const key = document.getElementById("deleteKey").value.trim();

      if (!key) {
        this.showNotification("키를 입력하세요", "warning");
        return;
      }

      const storage = this.getSelectedStorage();

      if (storage.getItem(key) === null) {
        this.showNotification("해당 키의 데이터가 없습니다", "warning");
        return;
      }

      storage.removeItem(key);

      this.showNotification(`${key} 데이터가 삭제되었습니다`, "success");

      document.getElementById("deleteKey").value = "";
      this.loadStorageData();
      this.updateStorageStats();
    } catch (error) {
      console.error("삭제 오류:", error);
      this.showNotification("데이터 삭제 중 오류가 발생했습니다", "error");
    }
  }

  clearStorage() {
    const storage = this.getSelectedStorage();
    const storageType =
      storage === localStorage ? "LocalStorage" : "SessionStorage";

    this.showConfirmModal(
      `정말로 ${storageType}의 모든 데이터를 삭제하시겠습니까?`,
      () => {
        storage.clear();
        this.showNotification(
          `${storageType}가 완전히 초기화되었습니다`,
          "success"
        );
        this.loadStorageData();
        this.updateStorageStats();
        this.clearReadResult();
      }
    );
  }

  refreshData() {
    this.loadStorageData();
    this.updateStorageStats();
    this.showNotification("데이터가 새로고침되었습니다", "info");
  }

  clearReadResult() {
    document.getElementById("readResult").innerHTML = "";
  }

  loadStorageData() {
    this.storageData.localStorage.clear();
    this.storageData.sessionStorage.clear();

    // LocalStorage 데이터 로드
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      this.storageData.localStorage.set(key, value);
    }

    // SessionStorage 데이터 로드
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      this.storageData.sessionStorage.set(key, value);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.value;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showNotification("클립보드에 복사되었습니다", "success");
      })
      .catch(() => {
        this.showNotification("클립보드 복사에 실패했습니다", "error");
      });
  }

  updateStorageStats() {
    // LocalStorage 통계
    let localCount = localStorage.length;
    let localSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      localSize += new Blob([key + value]).size;
    }

    // SessionStorage 통계
    let sessionCount = sessionStorage.length;
    let sessionSize = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      sessionSize += new Blob([key + value]).size;
    }

    // UI 업데이트
    document.getElementById("localStorageCount").textContent = localCount;
    document.getElementById("localStorageSize").textContent =
      this.formatBytes(localSize);
    document.getElementById("sessionStorageCount").textContent = sessionCount;
    document.getElementById("sessionStorageSize").textContent =
      this.formatBytes(sessionSize);

    // 사용률 계산 (예상 최대값 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const localPercent = Math.min((localSize / maxSize) * 100, 100);
    const sessionPercent = Math.min((sessionSize / maxSize) * 100, 100);

    document.getElementById("localStorageUsage").style.width =
      localPercent + "%";
    document.getElementById("localStoragePercent").textContent =
      localPercent.toFixed(1) + "%";
    document.getElementById("sessionStorageUsage").style.width =
      sessionPercent + "%";
    document.getElementById("sessionStoragePercent").textContent =
      sessionPercent.toFixed(1) + "%";
  }

  showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    document.getElementById("confirmMessage").textContent = message;

    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    // 기존 이벤트 리스너 제거
    yesBtn.replaceWith(yesBtn.cloneNode(true));
    noBtn.replaceWith(noBtn.cloneNode(true));

    // 새 이벤트 리스너 추가
    document.getElementById("confirmYes").addEventListener("click", () => {
      onConfirm();
      this.closeModal(modal);
    });

    document.getElementById("confirmNo").addEventListener("click", () => {
      this.closeModal(modal);
    });

    modal.classList.remove("hidden");
  }

  closeModal(modal) {
    modal.classList.add("hidden");
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "s":
          e.preventDefault();
          this.saveData();
          break;
        case "r":
          e.preventDefault();
          this.readData();
          break;
        case "d":
          e.preventDefault();
          this.deleteData();
          break;
      }
    }
  }

  handleStorageEvent(e) {
    console.log("Storage event:", e);
    this.showNotification(`외부에서 저장소가 변경됨: ${e.key}`, "info");
    this.loadStorageData();
    this.updateStorageStats();
  }

  // 추가 메서드들 (비교, 개발도구, 데모앱 등)은 다음에 계속...
  setupComparisonEvents() {
    // 비교 테스트 이벤트 설정
  }

  setupDevToolsEvents() {
    // 개발 도구 이벤트 설정
  }

  setupDemoAppEvents() {
    // 데모 앱 이벤트 설정
  }

  filterData() {
    // 데이터 필터링
  }

  exportData() {
    // 데이터 내보내기
  }

  importData() {
    // 데이터 가져오기
  }

  generateSampleData() {
    // 샘플 데이터 생성
  }

  handleFileImport(e) {
    // 파일 가져오기 처리
  }

  changePage(direction) {
    // 페이지 변경
  }

  changePageSize() {
    // 페이지 크기 변경
  }

  drawDistributionChart() {
    // 분포 차트 그리기
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new WebStorageAPI();
});
