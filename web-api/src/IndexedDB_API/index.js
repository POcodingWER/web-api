import "./style.css";

console.log("🗃️ IndexedDB API 스크립트 시작!");

class IndexedDBAPI {
  constructor() {
    this.db = null;
    this.dbName = "WebAPIDatabase";
    this.dbVersion = 1;
    this.stores = {
      todos: "todos",
      notes: "notes",
      files: "files",
      settings: "settings",
    };
    this.currentStore = "todos";
    this.isConnected = false;
    this.init();
  }

  init() {
    console.log("🗃️ IndexedDB API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.initDatabase();
    console.log("✅ IndexedDB API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 IndexedDB API 지원 여부 확인 중...");

    const support = {
      indexedDB: "indexedDB" in window,
      webkitIndexedDB: "webkitIndexedDB" in window,
      mozIndexedDB: "mozIndexedDB" in window,
      msIndexedDB: "msIndexedDB" in window,
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="indexeddb-container">
        <header class="indexeddb-header">
          <h1>🗃️ IndexedDB API</h1>
          <p>브라우저 내장 NoSQL 데이터베이스로 구조화된 데이터를 저장하고 관리하세요</p>
          <div class="api-support">
            <div class="support-badge ${
              support.indexedDB ? "supported" : "unsupported"
            }">
              ${support.indexedDB ? "✅ IndexedDB" : "❌ IndexedDB"}
            </div>
            <div class="support-badge ${
              support.webkitIndexedDB ? "supported" : "unsupported"
            }">
              ${support.webkitIndexedDB ? "✅ WebKit" : "❌ WebKit"}
            </div>
            <div class="connection-status ${
              this.isConnected ? "connected" : "disconnected"
            }">
              <span class="status-indicator"></span>
              <span id="connectionStatus">연결 중...</span>
            </div>
          </div>
        </header>

        <main class="indexeddb-main">
          <!-- 데이터베이스 제어 패널 -->
          <div class="database-panel">
            <div class="panel-card primary">
              <h2>🎛️ 데이터베이스 제어</h2>
              
              <div class="database-info">
                <div class="info-item">
                  <span class="info-label">데이터베이스:</span>
                  <span class="info-value" id="dbNameDisplay">${
                    this.dbName
                  }</span>
                </div>
                <div class="info-item">
                  <span class="info-label">버전:</span>
                  <span class="info-value" id="dbVersionDisplay">${
                    this.dbVersion
                  }</span>
                </div>
                <div class="info-item">
                  <span class="info-label">상태:</span>
                  <span class="info-value status" id="dbStatusDisplay">초기화 중</span>
                </div>
              </div>

              <div class="database-controls">
                <div class="control-group">
                  <label for="newDbName">데이터베이스 이름:</label>
                  <input type="text" id="newDbName" value="${
                    this.dbName
                  }" placeholder="데이터베이스 이름">
                  <button id="createDatabase" class="btn-primary">🏗️ 새 DB 생성</button>
                </div>
                
                <div class="control-group">
                  <button id="exportData" class="btn-info">📤 데이터 내보내기</button>
                  <input type="file" id="importFile" accept=".json" style="display: none;">
                  <button id="importData" class="btn-success">📥 데이터 가져오기</button>
                  <button id="clearDatabase" class="btn-danger">🗑️ DB 초기화</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 오브젝트 스토어 관리 -->
          <div class="store-panel">
            <div class="panel-card full-width">
              <h2>📁 오브젝트 스토어 관리</h2>
              
              <div class="store-tabs">
                <button class="store-tab-btn active" data-store="todos">📋 할일 목록</button>
                <button class="store-tab-btn" data-store="notes">📝 메모장</button>
                <button class="store-tab-btn" data-store="files">📁 파일 관리</button>
                <button class="store-tab-btn" data-store="settings">⚙️ 설정</button>
              </div>

              <div class="store-content">
                <!-- 할일 목록 스토어 -->
                <div class="store-section active" id="todosStore">
                  <div class="store-controls">
                    <h3>📋 할일 목록 관리</h3>
                    <div class="add-form">
                      <input type="text" id="todoTitle" placeholder="할일 제목" maxlength="100">
                      <input type="text" id="todoDescription" placeholder="할일 설명">
                      <select id="todoPriority">
                        <option value="low">낮음</option>
                        <option value="medium" selected>보통</option>
                        <option value="high">높음</option>
                      </select>
                      <button id="addTodo" class="btn-primary">➕ 추가</button>
                    </div>
                    
                    <div class="filter-controls">
                      <select id="todoFilter">
                        <option value="all">모든 할일</option>
                        <option value="completed">완료된 할일</option>
                        <option value="pending">미완료 할일</option>
                        <option value="high">높은 우선순위</option>
                      </select>
                      <button id="clearCompleted" class="btn-warning">✅ 완료 항목 삭제</button>
                      <button id="exportTodos" class="btn-info">📤 내보내기</button>
                    </div>
                  </div>
                  
                  <div class="data-display">
                    <div class="stats-bar">
                      <span>총 <span id="totalTodos">0</span>개</span>
                      <span>완료 <span id="completedTodos">0</span>개</span>
                      <span>남은 <span id="pendingTodos">0</span>개</span>
                    </div>
                    <div class="items-list" id="todosList">
                      <div class="empty-state">할일을 추가해보세요</div>
                    </div>
                  </div>
                </div>

                <!-- 메모장 스토어 -->
                <div class="store-section" id="notesStore">
                  <div class="store-controls">
                    <h3>📝 메모장 관리</h3>
                    <div class="add-form">
                      <input type="text" id="noteTitle" placeholder="메모 제목" maxlength="50">
                      <textarea id="noteContent" placeholder="메모 내용" rows="3" maxlength="1000"></textarea>
                      <select id="noteCategory">
                        <option value="personal">개인</option>
                        <option value="work">업무</option>
                        <option value="study">공부</option>
                        <option value="ideas">아이디어</option>
                      </select>
                      <button id="addNote" class="btn-primary">➕ 메모 추가</button>
                    </div>
                    
                    <div class="filter-controls">
                      <input type="text" id="noteSearch" placeholder="메모 검색...">
                      <select id="noteCategory">
                        <option value="all">모든 카테고리</option>
                        <option value="personal">개인</option>
                        <option value="work">업무</option>
                        <option value="study">공부</option>
                        <option value="ideas">아이디어</option>
                      </select>
                      <button id="exportNotes" class="btn-info">📤 내보내기</button>
                    </div>
                  </div>
                  
                  <div class="data-display">
                    <div class="stats-bar">
                      <span>총 <span id="totalNotes">0</span>개</span>
                      <span>오늘 <span id="todayNotes">0</span>개</span>
                    </div>
                    <div class="items-list" id="notesList">
                      <div class="empty-state">메모를 추가해보세요</div>
                    </div>
                  </div>
                </div>

                <!-- 파일 관리 스토어 -->
                <div class="store-section" id="filesStore">
                  <div class="store-controls">
                    <h3>📁 파일 관리</h3>
                    <div class="add-form">
                      <input type="file" id="fileInput" multiple accept="image/*,text/*,.pdf,.doc,.docx">
                      <button id="uploadFiles" class="btn-primary">📤 파일 업로드</button>
                      <button id="clearFiles" class="btn-danger">🗑️ 모든 파일 삭제</button>
                    </div>
                    
                    <div class="filter-controls">
                      <select id="fileTypeFilter">
                        <option value="all">모든 파일</option>
                        <option value="image">이미지</option>
                        <option value="text">텍스트</option>
                        <option value="document">문서</option>
                      </select>
                      <select id="fileSizeFilter">
                        <option value="all">모든 크기</option>
                        <option value="small">1MB 미만</option>
                        <option value="medium">1-5MB</option>
                        <option value="large">5MB 이상</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="data-display">
                    <div class="stats-bar">
                      <span>총 <span id="totalFiles">0</span>개</span>
                      <span>크기 <span id="totalSize">0</span></span>
                    </div>
                    <div class="items-list" id="filesList">
                      <div class="empty-state">파일을 업로드해보세요</div>
                    </div>
                  </div>
                </div>

                <!-- 설정 스토어 -->
                <div class="store-section" id="settingsStore">
                  <div class="store-controls">
                    <h3>⚙️ 설정 관리</h3>
                    <div class="settings-form">
                      <div class="setting-group">
                        <label class="checkbox-label">
                          <input type="checkbox" id="autoBackup" checked>
                          <span class="checkmark"></span>
                          자동 백업
                        </label>
                      </div>
                      
                      <div class="setting-group">
                        <label class="checkbox-label">
                          <input type="checkbox" id="notifications" checked>
                          <span class="checkmark"></span>
                          알림 허용
                        </label>
                      </div>
                      
                      <div class="setting-group">
                        <label for="theme">테마:</label>
                        <select id="theme">
                          <option value="light">라이트</option>
                          <option value="dark">다크</option>
                          <option value="auto">자동</option>
                        </select>
                      </div>
                      
                      <div class="setting-group">
                        <label for="language">언어:</label>
                        <select id="language">
                          <option value="ko" selected>한국어</option>
                          <option value="en">English</option>
                          <option value="ja">日本語</option>
                        </select>
                      </div>
                      
                      <div class="setting-group">
                        <label for="maxItems">최대 저장 항목:</label>
                        <input type="number" id="maxItems" value="1000" min="100" max="10000" step="100">
                      </div>
                      
                      <button id="saveSettings" class="btn-success">💾 설정 저장</button>
                      <button id="resetSettings" class="btn-warning">🔄 기본값 복원</button>
                    </div>
                  </div>
                  
                  <div class="data-display">
                    <div class="settings-preview" id="settingsPreview">
                      <h4>현재 설정</h4>
                      <div class="settings-list">
                        <div class="empty-state">설정을 로드하는 중...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 고급 기능 -->
          <div class="advanced-panel">
            <div class="panel-card full-width">
              <h2>🔧 고급 기능</h2>
              
              <div class="advanced-tabs">
                <button class="advanced-tab-btn active" data-feature="transactions">💳 트랜잭션</button>
                <button class="advanced-tab-btn" data-feature="indexes">📇 인덱스</button>
                <button class="advanced-tab-btn" data-feature="cursor">🎯 커서</button>
                <button class="advanced-tab-btn" data-feature="migration">🔄 마이그레이션</button>
              </div>

              <div class="advanced-content">
                <!-- 트랜잭션 기능 -->
                <div class="advanced-section active" id="transactionsSection">
                  <h3>💳 트랜잭션 관리</h3>
                  <p>여러 작업을 원자적으로 처리합니다</p>
                  
                  <div class="transaction-controls">
                    <button id="startTransaction" class="btn-primary">🚀 트랜잭션 시작</button>
                    <button id="batchInsert" class="btn-success">📦 일괄 추가</button>
                    <button id="batchUpdate" class="btn-warning">🔄 일괄 수정</button>
                    <button id="batchDelete" class="btn-danger">🗑️ 일괄 삭제</button>
                  </div>
                  
                  <div class="transaction-log" id="transactionLog">
                    <h4>트랜잭션 로그</h4>
                    <div class="log-content">
                      <div class="empty-state">트랜잭션 작업을 실행해보세요</div>
                    </div>
                  </div>
                </div>

                <!-- 인덱스 기능 -->
                <div class="advanced-section" id="indexesSection">
                  <h3>📇 인덱스 관리</h3>
                  <p>빠른 검색을 위한 인덱스를 생성하고 관리합니다</p>
                  
                  <div class="index-controls">
                    <div class="index-form">
                      <select id="indexStore">
                        <option value="todos">할일 목록</option>
                        <option value="notes">메모장</option>
                        <option value="files">파일</option>
                      </select>
                      <input type="text" id="indexName" placeholder="인덱스 이름">
                      <input type="text" id="indexKey" placeholder="인덱스 키">
                      <label class="checkbox-label">
                        <input type="checkbox" id="indexUnique">
                        <span class="checkmark"></span>
                        유니크
                      </label>
                      <button id="createIndex" class="btn-primary">📇 인덱스 생성</button>
                    </div>
                    
                    <button id="listIndexes" class="btn-info">📋 인덱스 목록</button>
                    <button id="testIndexSearch" class="btn-success">🔍 인덱스 검색 테스트</button>
                  </div>
                  
                  <div class="index-list" id="indexList">
                    <h4>기존 인덱스</h4>
                    <div class="list-content">
                      <div class="empty-state">인덱스를 조회해보세요</div>
                    </div>
                  </div>
                </div>

                <!-- 커서 기능 -->
                <div class="advanced-section" id="cursorSection">
                  <h3>🎯 커서 탐색</h3>
                  <p>큰 데이터셋을 효율적으로 순회합니다</p>
                  
                  <div class="cursor-controls">
                    <select id="cursorStore">
                      <option value="todos">할일 목록</option>
                      <option value="notes">메모장</option>
                      <option value="files">파일</option>
                    </select>
                    <select id="cursorDirection">
                      <option value="next">순방향</option>
                      <option value="prev">역방향</option>
                    </select>
                    <input type="number" id="cursorLimit" value="10" min="1" max="100">
                    <button id="startCursor" class="btn-primary">🎯 커서 시작</button>
                    <button id="continueCursor" class="btn-success">▶️ 계속</button>
                  </div>
                  
                  <div class="cursor-results" id="cursorResults">
                    <h4>커서 결과</h4>
                    <div class="results-content">
                      <div class="empty-state">커서 탐색을 시작해보세요</div>
                    </div>
                  </div>
                </div>

                <!-- 마이그레이션 기능 -->
                <div class="advanced-section" id="migrationSection">
                  <h3>🔄 데이터베이스 마이그레이션</h3>
                  <p>스키마 변경 및 데이터 마이그레이션을 관리합니다</p>
                  
                  <div class="migration-controls">
                    <div class="version-control">
                      <span>현재 버전: <strong id="currentVersion">${
                        this.dbVersion
                      }</strong></span>
                      <input type="number" id="targetVersion" value="${
                        this.dbVersion + 1
                      }" min="1" max="99">
                      <button id="upgradeDatabase" class="btn-primary">⬆️ 업그레이드</button>
                    </div>
                    
                    <div class="migration-actions">
                      <button id="addMockData" class="btn-success">🎭 샘플 데이터 추가</button>
                      <button id="analyzeData" class="btn-info">📊 데이터 분석</button>
                      <button id="optimizeDatabase" class="btn-warning">⚡ DB 최적화</button>
                    </div>
                  </div>
                  
                  <div class="migration-log" id="migrationLog">
                    <h4>마이그레이션 로그</h4>
                    <div class="log-content">
                      <div class="empty-state">마이그레이션 작업을 실행해보세요</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 실시간 모니터링 -->
          <div class="monitoring-panel">
            <div class="panel-card full-width">
              <h2>📊 실시간 모니터링</h2>
              
              <div class="monitoring-stats">
                <div class="stat-card">
                  <div class="stat-icon">🗄️</div>
                  <div class="stat-info">
                    <span class="stat-label">총 레코드</span>
                    <span class="stat-value" id="totalRecords">0</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">💾</div>
                  <div class="stat-info">
                    <span class="stat-label">사용 용량</span>
                    <span class="stat-value" id="usedStorage">0 KB</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-info">
                    <span class="stat-label">평균 응답시간</span>
                    <span class="stat-value" id="avgResponseTime">0 ms</span>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">🔄</div>
                  <div class="stat-info">
                    <span class="stat-label">총 트랜잭션</span>
                    <span class="stat-value" id="totalTransactions">0</span>
                  </div>
                </div>
              </div>
              
              <div class="monitoring-chart">
                <h3>📈 성능 차트</h3>
                <div class="chart-container" id="performanceChart">
                  <div class="chart-placeholder">데이터 수집 중...</div>
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
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 데이터베이스 제어
    document
      .getElementById("createDatabase")
      ?.addEventListener("click", () => this.createNewDatabase());
    document
      .getElementById("exportData")
      ?.addEventListener("click", () => this.exportAllData());
    document
      .getElementById("importData")
      ?.addEventListener("click", () =>
        document.getElementById("importFile").click()
      );
    document
      .getElementById("importFile")
      ?.addEventListener("change", (e) => this.importData(e));
    document
      .getElementById("clearDatabase")
      ?.addEventListener("click", () => this.clearDatabase());

    // 스토어 탭 전환
    document.querySelectorAll(".store-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchStore(e.target.dataset.store);
      });
    });

    // 할일 목록 관련
    document
      .getElementById("addTodo")
      ?.addEventListener("click", () => this.addTodo());
    document
      .getElementById("todoFilter")
      ?.addEventListener("change", () => this.filterTodos());
    document
      .getElementById("clearCompleted")
      ?.addEventListener("click", () => this.clearCompletedTodos());
    document
      .getElementById("exportTodos")
      ?.addEventListener("click", () => this.exportStoreData("todos"));

    // 메모장 관련
    document
      .getElementById("addNote")
      ?.addEventListener("click", () => this.addNote());
    document
      .getElementById("noteSearch")
      ?.addEventListener("input", () => this.searchNotes());
    document
      .getElementById("exportNotes")
      ?.addEventListener("click", () => this.exportStoreData("notes"));

    // 파일 관리 관련
    document
      .getElementById("uploadFiles")
      ?.addEventListener("click", () => this.uploadFiles());
    document
      .getElementById("clearFiles")
      ?.addEventListener("click", () => this.clearStore("files"));
    document
      .getElementById("fileTypeFilter")
      ?.addEventListener("change", () => this.filterFiles());
    document
      .getElementById("fileSizeFilter")
      ?.addEventListener("change", () => this.filterFiles());

    // 설정 관련
    document
      .getElementById("saveSettings")
      ?.addEventListener("click", () => this.saveSettings());
    document
      .getElementById("resetSettings")
      ?.addEventListener("click", () => this.resetSettings());

    // 고급 기능 탭
    document.querySelectorAll(".advanced-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchAdvancedFeature(e.target.dataset.feature);
      });
    });

    // 트랜잭션 관련
    document
      .getElementById("startTransaction")
      ?.addEventListener("click", () => this.demonstrateTransaction());
    document
      .getElementById("batchInsert")
      ?.addEventListener("click", () => this.batchInsert());
    document
      .getElementById("batchUpdate")
      ?.addEventListener("click", () => this.batchUpdate());
    document
      .getElementById("batchDelete")
      ?.addEventListener("click", () => this.batchDelete());

    // 인덱스 관련
    document
      .getElementById("createIndex")
      ?.addEventListener("click", () => this.createIndex());
    document
      .getElementById("listIndexes")
      ?.addEventListener("click", () => this.listIndexes());
    document
      .getElementById("testIndexSearch")
      ?.addEventListener("click", () => this.testIndexSearch());

    // 커서 관련
    document
      .getElementById("startCursor")
      ?.addEventListener("click", () => this.startCursor());
    document
      .getElementById("continueCursor")
      ?.addEventListener("click", () => this.continueCursor());

    // 마이그레이션 관련
    document
      .getElementById("upgradeDatabase")
      ?.addEventListener("click", () => this.upgradeDatabase());
    document
      .getElementById("addMockData")
      ?.addEventListener("click", () => this.addMockData());
    document
      .getElementById("analyzeData")
      ?.addEventListener("click", () => this.analyzeData());
    document
      .getElementById("optimizeDatabase")
      ?.addEventListener("click", () => this.optimizeDatabase());

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  async initDatabase() {
    if (!this.apiSupport.indexedDB) {
      this.showNotification("IndexedDB가 지원되지 않습니다", "error");
      return;
    }

    try {
      this.db = await this.openDatabase();
      this.isConnected = true;
      this.updateConnectionStatus("연결됨", true);
      this.showNotification("데이터베이스 연결 성공", "success");

      // 초기 데이터 로드
      await this.loadAllData();
      this.startMonitoring();
    } catch (error) {
      console.error("데이터베이스 초기화 실패:", error);
      this.updateConnectionStatus("연결 실패", false);
      this.showNotification("데이터베이스 연결 실패", "error");
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log("데이터베이스 업그레이드 중...");

        // 할일 목록 스토어
        if (!db.objectStoreNames.contains(this.stores.todos)) {
          const todoStore = db.createObjectStore(this.stores.todos, {
            keyPath: "id",
            autoIncrement: true,
          });
          todoStore.createIndex("priority", "priority", { unique: false });
          todoStore.createIndex("completed", "completed", { unique: false });
          todoStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // 메모장 스토어
        if (!db.objectStoreNames.contains(this.stores.notes)) {
          const noteStore = db.createObjectStore(this.stores.notes, {
            keyPath: "id",
            autoIncrement: true,
          });
          noteStore.createIndex("category", "category", { unique: false });
          noteStore.createIndex("title", "title", { unique: false });
          noteStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // 파일 스토어
        if (!db.objectStoreNames.contains(this.stores.files)) {
          const fileStore = db.createObjectStore(this.stores.files, {
            keyPath: "id",
            autoIncrement: true,
          });
          fileStore.createIndex("name", "name", { unique: false });
          fileStore.createIndex("type", "type", { unique: false });
          fileStore.createIndex("size", "size", { unique: false });
        }

        // 설정 스토어
        if (!db.objectStoreNames.contains(this.stores.settings)) {
          const settingStore = db.createObjectStore(this.stores.settings, {
            keyPath: "key",
          });
        }
      };
    });
  }

  updateConnectionStatus(status, connected) {
    const statusElement = document.getElementById("connectionStatus");
    const connectionDiv = statusElement?.parentElement;

    if (statusElement) {
      statusElement.textContent = status;
    }

    if (connectionDiv) {
      connectionDiv.className = `connection-status ${
        connected ? "connected" : "disconnected"
      }`;
    }

    const dbStatusElement = document.getElementById("dbStatusDisplay");
    if (dbStatusElement) {
      dbStatusElement.textContent = status;
      dbStatusElement.className = `info-value status ${
        connected ? "connected" : "disconnected"
      }`;
    }
  }

  // 할일 목록 관련 메소드
  async addTodo() {
    const title = document.getElementById("todoTitle")?.value?.trim();
    const description = document
      .getElementById("todoDescription")
      ?.value?.trim();
    const priority = document.getElementById("todoPriority")?.value;

    if (!title) {
      this.showNotification("할일 제목을 입력하세요", "warning");
      return;
    }

    const todo = {
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const id = await this.addData(this.stores.todos, todo);
      this.showNotification("할일이 추가되었습니다", "success");

      // 입력 필드 초기화
      document.getElementById("todoTitle").value = "";
      document.getElementById("todoDescription").value = "";

      await this.loadTodos();
    } catch (error) {
      console.error("할일 추가 실패:", error);
      this.showNotification("할일 추가 실패", "error");
    }
  }

  async loadTodos() {
    try {
      const todos = await this.getAllData(this.stores.todos);
      this.displayTodos(todos);
      this.updateTodoStats(todos);
    } catch (error) {
      console.error("할일 로드 실패:", error);
    }
  }

  displayTodos(todos) {
    const container = document.getElementById("todosList");

    if (todos.length === 0) {
      container.innerHTML =
        '<div class="empty-state">할일을 추가해보세요</div>';
      return;
    }

    container.innerHTML = todos
      .map(
        (todo) => `
      <div class="item-card todo-item ${
        todo.completed ? "completed" : ""
      }" data-id="${todo.id}">
        <div class="item-content">
          <div class="item-header">
            <h4 class="item-title">${this.escapeHtml(todo.title)}</h4>
            <span class="priority-badge ${
              todo.priority
            }">${this.getPriorityText(todo.priority)}</span>
          </div>
          <p class="item-description">${this.escapeHtml(
            todo.description || ""
          )}</p>
          <div class="item-meta">
            <span class="created-date">${this.formatDate(todo.createdAt)}</span>
            <span class="status ${todo.completed ? "completed" : "pending"}">
              ${todo.completed ? "완료" : "미완료"}
            </span>
          </div>
        </div>
        <div class="item-actions">
          <button onclick="window.indexedDBAPI.toggleTodo(${
            todo.id
          })" class="btn-small ${
          todo.completed ? "btn-warning" : "btn-success"
        }">
            ${todo.completed ? "↩️ 되돌리기" : "✅ 완료"}
          </button>
          <button onclick="window.indexedDBAPI.editTodo(${
            todo.id
          })" class="btn-small btn-info">
            ✏️ 수정
          </button>
          <button onclick="window.indexedDBAPI.deleteTodo(${
            todo.id
          })" class="btn-small btn-danger">
            🗑️ 삭제
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  updateTodoStats(todos) {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;

    document.getElementById("totalTodos").textContent = total;
    document.getElementById("completedTodos").textContent = completed;
    document.getElementById("pendingTodos").textContent = pending;
  }

  async toggleTodo(id) {
    try {
      const todo = await this.getData(this.stores.todos, id);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date();
        await this.updateData(this.stores.todos, todo);
        await this.loadTodos();
        this.showNotification(
          `할일이 ${todo.completed ? "완료" : "미완료"}로 변경되었습니다`,
          "success"
        );
      }
    } catch (error) {
      console.error("할일 상태 변경 실패:", error);
      this.showNotification("할일 상태 변경 실패", "error");
    }
  }

  async deleteTodo(id) {
    if (!confirm("이 할일을 삭제하시겠습니까?")) return;

    try {
      await this.deleteData(this.stores.todos, id);
      await this.loadTodos();
      this.showNotification("할일이 삭제되었습니다", "success");
    } catch (error) {
      console.error("할일 삭제 실패:", error);
      this.showNotification("할일 삭제 실패", "error");
    }
  }

  async editTodo(id) {
    try {
      const todo = await this.getData(this.stores.todos, id);
      if (todo) {
        const newTitle = prompt("할일 제목:", todo.title);
        if (newTitle && newTitle.trim()) {
          todo.title = newTitle.trim();
          todo.updatedAt = new Date();
          await this.updateData(this.stores.todos, todo);
          await this.loadTodos();
          this.showNotification("할일이 수정되었습니다", "success");
        }
      }
    } catch (error) {
      console.error("할일 수정 실패:", error);
      this.showNotification("할일 수정 실패", "error");
    }
  }

  // 메모장 관련 메소드
  async addNote() {
    const title = document.getElementById("noteTitle")?.value?.trim();
    const content = document.getElementById("noteContent")?.value?.trim();
    const category = document.getElementById("noteCategory")?.value;

    if (!title || !content) {
      this.showNotification("제목과 내용을 모두 입력하세요", "warning");
      return;
    }

    const note = {
      title,
      content,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await this.addData(this.stores.notes, note);
      this.showNotification("메모가 추가되었습니다", "success");

      // 입력 필드 초기화
      document.getElementById("noteTitle").value = "";
      document.getElementById("noteContent").value = "";

      await this.loadNotes();
    } catch (error) {
      console.error("메모 추가 실패:", error);
      this.showNotification("메모 추가 실패", "error");
    }
  }

  async loadNotes() {
    try {
      const notes = await this.getAllData(this.stores.notes);
      this.displayNotes(notes);
      this.updateNotesStats(notes);
    } catch (error) {
      console.error("메모 로드 실패:", error);
    }
  }

  displayNotes(notes) {
    const container = document.getElementById("notesList");

    if (notes.length === 0) {
      container.innerHTML =
        '<div class="empty-state">메모를 추가해보세요</div>';
      return;
    }

    container.innerHTML = notes
      .map(
        (note) => `
      <div class="item-card note-item" data-id="${note.id}">
        <div class="item-content">
          <div class="item-header">
            <h4 class="item-title">${this.escapeHtml(note.title)}</h4>
            <span class="category-badge ${
              note.category
            }">${this.getCategoryText(note.category)}</span>
          </div>
          <p class="item-description">${this.escapeHtml(
            note.content.substring(0, 100)
          )}${note.content.length > 100 ? "..." : ""}</p>
          <div class="item-meta">
            <span class="created-date">${this.formatDate(note.createdAt)}</span>
            <span class="word-count">${note.content.length}자</span>
          </div>
        </div>
        <div class="item-actions">
          <button onclick="window.indexedDBAPI.viewNote(${
            note.id
          })" class="btn-small btn-info">
            👁️ 보기
          </button>
          <button onclick="window.indexedDBAPI.editNote(${
            note.id
          })" class="btn-small btn-warning">
            ✏️ 수정
          </button>
          <button onclick="window.indexedDBAPI.deleteNote(${
            note.id
          })" class="btn-small btn-danger">
            🗑️ 삭제
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  updateNotesStats(notes) {
    const total = notes.length;
    const today = new Date().toDateString();
    const todayNotes = notes.filter(
      (n) => new Date(n.createdAt).toDateString() === today
    ).length;

    document.getElementById("totalNotes").textContent = total;
    document.getElementById("todayNotes").textContent = todayNotes;
  }

  async viewNote(id) {
    try {
      const note = await this.getData(this.stores.notes, id);
      if (note) {
        alert(`제목: ${note.title}\n\n내용:\n${note.content}`);
      }
    } catch (error) {
      console.error("메모 보기 실패:", error);
    }
  }

  async editNote(id) {
    try {
      const note = await this.getData(this.stores.notes, id);
      if (note) {
        const newContent = prompt("메모 내용:", note.content);
        if (newContent !== null) {
          note.content = newContent;
          note.updatedAt = new Date();
          await this.updateData(this.stores.notes, note);
          await this.loadNotes();
          this.showNotification("메모가 수정되었습니다", "success");
        }
      }
    } catch (error) {
      console.error("메모 수정 실패:", error);
      this.showNotification("메모 수정 실패", "error");
    }
  }

  async deleteNote(id) {
    if (!confirm("이 메모를 삭제하시겠습니까?")) return;

    try {
      await this.deleteData(this.stores.notes, id);
      await this.loadNotes();
      this.showNotification("메모가 삭제되었습니다", "success");
    } catch (error) {
      console.error("메모 삭제 실패:", error);
      this.showNotification("메모 삭제 실패", "error");
    }
  }

  // 파일 관리 관련 메소드
  async uploadFiles() {
    const fileInput = document.getElementById("fileInput");
    const files = Array.from(fileInput.files);

    if (files.length === 0) {
      this.showNotification("파일을 선택하세요", "warning");
      return;
    }

    try {
      for (const file of files) {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: await this.fileToArrayBuffer(file),
          uploadedAt: new Date(),
        };

        await this.addData(this.stores.files, fileData);
      }

      this.showNotification(
        `${files.length}개 파일이 업로드되었습니다`,
        "success"
      );
      fileInput.value = "";
      await this.loadFiles();
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      this.showNotification("파일 업로드 실패", "error");
    }
  }

  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async loadFiles() {
    try {
      const files = await this.getAllData(this.stores.files);
      this.displayFiles(files);
      this.updateFilesStats(files);
    } catch (error) {
      console.error("파일 로드 실패:", error);
    }
  }

  displayFiles(files) {
    const container = document.getElementById("filesList");

    if (files.length === 0) {
      container.innerHTML =
        '<div class="empty-state">파일을 업로드해보세요</div>';
      return;
    }

    container.innerHTML = files
      .map(
        (file) => `
      <div class="item-card file-item" data-id="${file.id}">
        <div class="item-content">
          <div class="item-header">
            <h4 class="item-title">${this.escapeHtml(file.name)}</h4>
            <span class="file-type-badge">${this.getFileTypeIcon(
              file.type
            )}</span>
          </div>
          <div class="file-info">
            <span class="file-size">${this.formatFileSize(file.size)}</span>
            <span class="file-type">${file.type || "unknown"}</span>
          </div>
          <div class="item-meta">
            <span class="upload-date">${this.formatDate(file.uploadedAt)}</span>
          </div>
        </div>
        <div class="item-actions">
          <button onclick="window.indexedDBAPI.downloadFile(${
            file.id
          })" class="btn-small btn-success">
            💾 다운로드
          </button>
          <button onclick="window.indexedDBAPI.viewFile(${
            file.id
          })" class="btn-small btn-info">
            👁️ 미리보기
          </button>
          <button onclick="window.indexedDBAPI.deleteFile(${
            file.id
          })" class="btn-small btn-danger">
            🗑️ 삭제
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  updateFilesStats(files) {
    const total = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    document.getElementById("totalFiles").textContent = total;
    document.getElementById("totalSize").textContent =
      this.formatFileSize(totalSize);
  }

  async downloadFile(id) {
    try {
      const file = await this.getData(this.stores.files, id);
      if (file) {
        const blob = new Blob([file.data], { type: file.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      this.showNotification("파일 다운로드 실패", "error");
    }
  }

  async viewFile(id) {
    try {
      const file = await this.getData(this.stores.files, id);
      if (file) {
        if (file.type.startsWith("image/")) {
          const blob = new Blob([file.data], { type: file.type });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        } else if (file.type.startsWith("text/")) {
          const text = new TextDecoder().decode(file.data);
          alert(
            `파일 내용:\n\n${text.substring(0, 500)}${
              text.length > 500 ? "\n\n..." : ""
            }`
          );
        } else {
          this.showNotification(
            "이 파일 형식은 미리보기를 지원하지 않습니다",
            "warning"
          );
        }
      }
    } catch (error) {
      console.error("파일 미리보기 실패:", error);
      this.showNotification("파일 미리보기 실패", "error");
    }
  }

  async deleteFile(id) {
    if (!confirm("이 파일을 삭제하시겠습니까?")) return;

    try {
      await this.deleteData(this.stores.files, id);
      await this.loadFiles();
      this.showNotification("파일이 삭제되었습니다", "success");
    } catch (error) {
      console.error("파일 삭제 실패:", error);
      this.showNotification("파일 삭제 실패", "error");
    }
  }

  // 설정 관련 메소드
  async saveSettings() {
    const settings = {
      autoBackup: document.getElementById("autoBackup")?.checked,
      notifications: document.getElementById("notifications")?.checked,
      theme: document.getElementById("theme")?.value,
      language: document.getElementById("language")?.value,
      maxItems: parseInt(document.getElementById("maxItems")?.value) || 1000,
      updatedAt: new Date(),
    };

    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.updateData(this.stores.settings, { key, value });
      }

      this.showNotification("설정이 저장되었습니다", "success");
      await this.loadSettings();
    } catch (error) {
      console.error("설정 저장 실패:", error);
      this.showNotification("설정 저장 실패", "error");
    }
  }

  async resetSettings() {
    try {
      await this.clearStore("settings");

      // 기본값으로 재설정
      document.getElementById("autoBackup").checked = true;
      document.getElementById("notifications").checked = true;
      document.getElementById("theme").value = "light";
      document.getElementById("language").value = "ko";
      document.getElementById("maxItems").value = 1000;

      await this.saveSettings();
      this.showNotification("설정이 기본값으로 복원되었습니다", "success");
    } catch (error) {
      console.error("설정 초기화 실패:", error);
      this.showNotification("설정 초기화 실패", "error");
    }
  }

  async filterTodos() {
    const filter = document.getElementById("todoFilter")?.value;
    const todos = await this.getAllData(this.stores.todos);

    let filteredTodos = todos;

    switch (filter) {
      case "completed":
        filteredTodos = todos.filter((todo) => todo.completed);
        break;
      case "pending":
        filteredTodos = todos.filter((todo) => !todo.completed);
        break;
      case "high":
        filteredTodos = todos.filter((todo) => todo.priority === "high");
        break;
      default:
        filteredTodos = todos;
    }

    this.displayTodos(filteredTodos);
    this.updateTodoStats(todos);
  }

  async clearCompletedTodos() {
    if (!confirm("완료된 할일을 모두 삭제하시겠습니까?")) return;

    try {
      const todos = await this.getAllData(this.stores.todos);
      const completedTodos = todos.filter((todo) => todo.completed);

      for (const todo of completedTodos) {
        await this.deleteData(this.stores.todos, todo.id);
      }

      this.showNotification(
        `${completedTodos.length}개의 완료된 할일이 삭제되었습니다`,
        "success"
      );
      await this.loadTodos();
    } catch (error) {
      console.error("완료된 할일 삭제 실패:", error);
      this.showNotification("완료된 할일 삭제 실패", "error");
    }
  }

  async exportStoreData(storeName) {
    try {
      const data = await this.getAllData(this.stores[storeName]);
      const exportData = {
        store: storeName,
        data: data,
        exportedAt: new Date().toISOString(),
        count: data.length,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${storeName}_${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification(
        `${storeName} 데이터가 내보내기되었습니다`,
        "success"
      );
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      this.showNotification("데이터 내보내기 실패", "error");
    }
  }

  async searchNotes() {
    const searchTerm = document
      .getElementById("noteSearch")
      ?.value?.toLowerCase();
    const categoryFilter = document.getElementById("noteCategory")?.value;

    const notes = await this.getAllData(this.stores.notes);

    let filteredNotes = notes;

    if (searchTerm) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm)
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      filteredNotes = filteredNotes.filter(
        (note) => note.category === categoryFilter
      );
    }

    this.displayNotes(filteredNotes);
    this.updateNotesStats(notes);
  }

  async filterFiles() {
    const typeFilter = document.getElementById("fileTypeFilter")?.value;
    const sizeFilter = document.getElementById("fileSizeFilter")?.value;

    const files = await this.getAllData(this.stores.files);

    let filteredFiles = files;

    if (typeFilter && typeFilter !== "all") {
      switch (typeFilter) {
        case "image":
          filteredFiles = filteredFiles.filter((file) =>
            file.type.startsWith("image/")
          );
          break;
        case "text":
          filteredFiles = filteredFiles.filter((file) =>
            file.type.startsWith("text/")
          );
          break;
        case "document":
          filteredFiles = filteredFiles.filter(
            (file) =>
              file.type.includes("pdf") ||
              file.type.includes("word") ||
              file.type.includes("document")
          );
          break;
      }
    }

    if (sizeFilter && sizeFilter !== "all") {
      switch (sizeFilter) {
        case "small":
          filteredFiles = filteredFiles.filter(
            (file) => file.size < 1024 * 1024
          );
          break;
        case "medium":
          filteredFiles = filteredFiles.filter(
            (file) => file.size >= 1024 * 1024 && file.size < 5 * 1024 * 1024
          );
          break;
        case "large":
          filteredFiles = filteredFiles.filter(
            (file) => file.size >= 5 * 1024 * 1024
          );
          break;
      }
    }

    this.displayFiles(filteredFiles);
    this.updateFilesStats(files);
  }

  async loadSettings() {
    try {
      const settingsData = await this.getAllData(this.stores.settings);
      const settings = {};

      settingsData.forEach((item) => {
        settings[item.key] = item.value;
      });

      // UI에 설정 값 반영
      if (settings.autoBackup !== undefined) {
        document.getElementById("autoBackup").checked = settings.autoBackup;
      }
      if (settings.notifications !== undefined) {
        document.getElementById("notifications").checked =
          settings.notifications;
      }
      if (settings.theme) {
        document.getElementById("theme").value = settings.theme;
      }
      if (settings.language) {
        document.getElementById("language").value = settings.language;
      }
      if (settings.maxItems) {
        document.getElementById("maxItems").value = settings.maxItems;
      }

      this.displaySettingsPreview(settings);
    } catch (error) {
      console.error("설정 로드 실패:", error);
    }
  }

  displaySettingsPreview(settings) {
    const container = document
      .getElementById("settingsPreview")
      ?.querySelector(".settings-list");

    if (!container) return;

    const settingsHtml = Object.entries(settings)
      .map(
        ([key, value]) => `
        <div class="setting-item">
          <span class="setting-key">${this.getSettingLabel(key)}</span>
          <span class="setting-value">${this.formatSettingValue(value)}</span>
        </div>
      `
      )
      .join("");

    container.innerHTML =
      settingsHtml || '<div class="empty-state">설정이 없습니다</div>';
  }

  // 기본 CRUD 메소드
  addData(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  getData(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  getAllData(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  updateData(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  deleteData(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearStore(storeName) {
    if (!confirm(`${storeName} 스토어의 모든 데이터를 삭제하시겠습니까?`))
      return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(request.result);
        this.showNotification(
          `${storeName} 스토어가 초기화되었습니다`,
          "success"
        );
        this.loadAllData();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 고급 기능들
  async demonstrateTransaction() {
    try {
      const transaction = this.db.transaction(
        [this.stores.todos, this.stores.notes],
        "readwrite"
      );
      const todoStore = transaction.objectStore(this.stores.todos);
      const noteStore = transaction.objectStore(this.stores.notes);

      // 트랜잭션 내에서 여러 작업 수행
      const todo = {
        title: "트랜잭션 테스트 할일",
        description: "이 할일은 트랜잭션으로 생성되었습니다",
        priority: "medium",
        completed: false,
        createdAt: new Date(),
      };

      const note = {
        title: "트랜잭션 테스트 메모",
        content: "이 메모는 할일과 함께 트랜잭션으로 생성되었습니다",
        category: "work",
        createdAt: new Date(),
      };

      todoStore.add(todo);
      noteStore.add(note);

      transaction.oncomplete = () => {
        this.showNotification(
          "트랜잭션이 성공적으로 완료되었습니다",
          "success"
        );
        this.loadAllData();
        this.logTransaction("다중 스토어 트랜잭션", "성공");
      };

      transaction.onerror = () => {
        this.showNotification("트랜잭션이 실패했습니다", "error");
        this.logTransaction("다중 스토어 트랜잭션", "실패");
      };
    } catch (error) {
      console.error("트랜잭션 실행 실패:", error);
      this.showNotification("트랜잭션 실행 실패", "error");
    }
  }

  async batchInsert() {
    try {
      const transaction = this.db.transaction([this.stores.todos], "readwrite");
      const store = transaction.objectStore(this.stores.todos);

      const todos = Array.from({ length: 10 }, (_, i) => ({
        title: `일괄 추가 할일 ${i + 1}`,
        description: `${i + 1}번째 일괄 추가된 할일입니다`,
        priority: ["low", "medium", "high"][i % 3],
        completed: false,
        createdAt: new Date(),
      }));

      todos.forEach((todo) => store.add(todo));

      transaction.oncomplete = () => {
        this.showNotification("10개 할일이 일괄 추가되었습니다", "success");
        this.loadTodos();
        this.logTransaction("일괄 추가", "성공");
      };

      transaction.onerror = () => {
        this.showNotification("일괄 추가가 실패했습니다", "error");
        this.logTransaction("일괄 추가", "실패");
      };
    } catch (error) {
      console.error("일괄 추가 실패:", error);
    }
  }

  async batchUpdate() {
    try {
      const todos = await this.getAllData(this.stores.todos);
      const transaction = this.db.transaction([this.stores.todos], "readwrite");
      const store = transaction.objectStore(this.stores.todos);

      // 처음 5개 할일의 우선순위를 'high'로 변경
      const todosToUpdate = todos.slice(0, 5);

      todosToUpdate.forEach((todo) => {
        todo.priority = "high";
        todo.updatedAt = new Date();
        store.put(todo);
      });

      transaction.oncomplete = () => {
        this.showNotification(
          `${todosToUpdate.length}개 할일이 일괄 수정되었습니다`,
          "success"
        );
        this.loadTodos();
        this.logTransaction("일괄 수정", "성공");
      };

      transaction.onerror = () => {
        this.showNotification("일괄 수정이 실패했습니다", "error");
        this.logTransaction("일괄 수정", "실패");
      };
    } catch (error) {
      console.error("일괄 수정 실패:", error);
    }
  }

  async batchDelete() {
    try {
      const todos = await this.getAllData(this.stores.todos);
      const completedTodos = todos.filter((todo) => todo.completed);

      if (completedTodos.length === 0) {
        this.showNotification("삭제할 완료된 할일이 없습니다", "warning");
        return;
      }

      const transaction = this.db.transaction([this.stores.todos], "readwrite");
      const store = transaction.objectStore(this.stores.todos);

      completedTodos.forEach((todo) => {
        store.delete(todo.id);
      });

      transaction.oncomplete = () => {
        this.showNotification(
          `${completedTodos.length}개 완료된 할일이 일괄 삭제되었습니다`,
          "success"
        );
        this.loadTodos();
        this.logTransaction("일괄 삭제", "성공");
      };

      transaction.onerror = () => {
        this.showNotification("일괄 삭제가 실패했습니다", "error");
        this.logTransaction("일괄 삭제", "실패");
      };
    } catch (error) {
      console.error("일괄 삭제 실패:", error);
    }
  }

  logTransaction(type, status) {
    const logContainer = document
      .getElementById("transactionLog")
      ?.querySelector(".log-content");
    if (!logContainer) return;

    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${status === "성공" ? "success" : "error"}`;
    logEntry.innerHTML = `
      <span class="log-time">${new Date().toLocaleTimeString()}</span>
      <span class="log-type">${type}</span>
      <span class="log-status ${
        status === "성공" ? "success" : "error"
      }">${status}</span>
    `;

    if (logContainer.querySelector(".empty-state")) {
      logContainer.innerHTML = "";
    }

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // 인덱스 관련 메소드
  async createIndex() {
    const storeName = document.getElementById("indexStore")?.value;
    const indexName = document.getElementById("indexName")?.value?.trim();
    const indexKey = document.getElementById("indexKey")?.value?.trim();
    const unique = document.getElementById("indexUnique")?.checked;

    if (!indexName || !indexKey) {
      this.showNotification("인덱스 이름과 키를 입력하세요", "warning");
      return;
    }

    try {
      // 새 버전으로 데이터베이스 업그레이드
      this.db.close();
      this.dbVersion += 1;

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const store = event.target.transaction.objectStore(storeName);

        try {
          store.createIndex(indexName, indexKey, { unique });
          this.showNotification(
            `인덱스 '${indexName}'가 생성되었습니다`,
            "success"
          );
        } catch (error) {
          this.showNotification(`인덱스 생성 실패: ${error.message}`, "error");
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.updateConnectionStatus("연결됨", true);

        // 입력 필드 초기화
        document.getElementById("indexName").value = "";
        document.getElementById("indexKey").value = "";
        document.getElementById("indexUnique").checked = false;
      };
    } catch (error) {
      console.error("인덱스 생성 실패:", error);
      this.showNotification("인덱스 생성 실패", "error");
    }
  }

  async listIndexes() {
    try {
      const storeName = document.getElementById("indexStore")?.value;
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      const indexes = [];
      for (const indexName of store.indexNames) {
        const index = store.index(indexName);
        indexes.push({
          name: indexName,
          keyPath: index.keyPath,
          unique: index.unique,
          multiEntry: index.multiEntry,
        });
      }

      const container = document
        .getElementById("indexList")
        ?.querySelector(".list-content");
      if (!container) return;

      if (indexes.length === 0) {
        container.innerHTML =
          '<div class="empty-state">인덱스가 없습니다</div>';
        return;
      }

      container.innerHTML = indexes
        .map(
          (index) => `
        <div class="index-item">
          <h4>${index.name}</h4>
          <p>키: ${index.keyPath}</p>
          <p>유니크: ${index.unique ? "예" : "아니오"}</p>
          <p>다중 엔트리: ${index.multiEntry ? "예" : "아니오"}</p>
        </div>
      `
        )
        .join("");

      this.showNotification(
        `${indexes.length}개의 인덱스를 찾았습니다`,
        "success"
      );
    } catch (error) {
      console.error("인덱스 목록 조회 실패:", error);
      this.showNotification("인덱스 목록 조회 실패", "error");
    }
  }

  async testIndexSearch() {
    try {
      const storeName = document.getElementById("indexStore")?.value;
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      // priority 인덱스로 검색 테스트 (할일 목록의 경우)
      if (storeName === "todos" && store.indexNames.contains("priority")) {
        const index = store.index("priority");
        const request = index.getAll("high");

        request.onsuccess = () => {
          const results = request.result;
          this.showNotification(
            `높은 우선순위 할일 ${results.length}개를 찾았습니다`,
            "success"
          );
        };
      } else {
        this.showNotification("테스트할 인덱스가 없습니다", "warning");
      }
    } catch (error) {
      console.error("인덱스 검색 테스트 실패:", error);
      this.showNotification("인덱스 검색 테스트 실패", "error");
    }
  }

  // 커서 관련 메소드
  async startCursor() {
    const storeName = document.getElementById("cursorStore")?.value;
    const direction = document.getElementById("cursorDirection")?.value;
    const limit = parseInt(document.getElementById("cursorLimit")?.value) || 10;

    try {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      const results = [];
      const request = store.openCursor(null, direction);
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor && count < limit) {
          results.push({
            key: cursor.key,
            value: cursor.value,
          });
          count++;
          cursor.continue();
        } else {
          this.displayCursorResults(results, count, limit);
        }
      };

      request.onerror = () => {
        this.showNotification("커서 탐색 실패", "error");
      };
    } catch (error) {
      console.error("커서 시작 실패:", error);
      this.showNotification("커서 시작 실패", "error");
    }
  }

  displayCursorResults(results, count, limit) {
    const container = document
      .getElementById("cursorResults")
      ?.querySelector(".results-content");
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = '<div class="empty-state">결과가 없습니다</div>';
      return;
    }

    container.innerHTML = `
      <div class="cursor-summary">
        <p>${count}개 항목 중 ${Math.min(limit, count)}개 표시</p>
      </div>
      ${results
        .map(
          (item, index) => `
        <div class="cursor-item">
          <strong>키 ${item.key}:</strong>
          <pre>${JSON.stringify(item.value, null, 2)}</pre>
        </div>
      `
        )
        .join("")}
    `;

    this.showNotification(
      `커서로 ${results.length}개 항목을 로드했습니다`,
      "success"
    );
  }

  async continueCursor() {
    this.showNotification(
      "커서 계속하기 기능은 더 복잡한 구현이 필요합니다",
      "info"
    );
  }

  // 마이그레이션 관련 메소드
  async upgradeDatabase() {
    const targetVersion = parseInt(
      document.getElementById("targetVersion")?.value
    );

    if (targetVersion <= this.dbVersion) {
      this.showNotification(
        "목표 버전이 현재 버전보다 높아야 합니다",
        "warning"
      );
      return;
    }

    try {
      this.db.close();
      const request = indexedDB.open(this.dbName, targetVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.logMigration(
          `데이터베이스를 v${this.dbVersion}에서 v${targetVersion}로 업그레이드`,
          "진행중"
        );

        // 새로운 스토어나 인덱스 추가 예시
        if (!db.objectStoreNames.contains("logs")) {
          const logStore = db.createObjectStore("logs", {
            keyPath: "id",
            autoIncrement: true,
          });
          logStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.dbVersion = targetVersion;
        this.updateConnectionStatus("연결됨", true);

        // UI 업데이트
        document.getElementById("currentVersion").textContent = targetVersion;
        document.getElementById("targetVersion").value = targetVersion + 1;

        this.showNotification(
          `데이터베이스가 v${targetVersion}로 업그레이드되었습니다`,
          "success"
        );
        this.logMigration(`데이터베이스 업그레이드 완료`, "성공");
      };

      request.onerror = () => {
        this.showNotification("데이터베이스 업그레이드 실패", "error");
        this.logMigration(`데이터베이스 업그레이드 실패`, "실패");
      };
    } catch (error) {
      console.error("데이터베이스 업그레이드 실패:", error);
      this.showNotification("데이터베이스 업그레이드 실패", "error");
    }
  }

  async addMockData() {
    try {
      const mockTodos = Array.from({ length: 20 }, (_, i) => ({
        title: `모의 데이터 할일 ${i + 1}`,
        description: `${i + 1}번째 모의 데이터입니다`,
        priority: ["low", "medium", "high"][i % 3],
        completed: Math.random() > 0.7,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      }));

      const mockNotes = Array.from({ length: 15 }, (_, i) => ({
        title: `모의 메모 ${i + 1}`,
        content: `이것은 ${
          i + 1
        }번째 모의 메모 내용입니다. 테스트용 데이터입니다.`,
        category: ["personal", "work", "study", "ideas"][i % 4],
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      }));

      const transaction = this.db.transaction(
        [this.stores.todos, this.stores.notes],
        "readwrite"
      );
      const todoStore = transaction.objectStore(this.stores.todos);
      const noteStore = transaction.objectStore(this.stores.notes);

      mockTodos.forEach((todo) => todoStore.add(todo));
      mockNotes.forEach((note) => noteStore.add(note));

      transaction.oncomplete = () => {
        this.showNotification("모의 데이터가 추가되었습니다", "success");
        this.loadAllData();
        this.logMigration("모의 데이터 추가", "성공");
      };

      transaction.onerror = () => {
        this.showNotification("모의 데이터 추가 실패", "error");
        this.logMigration("모의 데이터 추가", "실패");
      };
    } catch (error) {
      console.error("모의 데이터 추가 실패:", error);
      this.showNotification("모의 데이터 추가 실패", "error");
    }
  }

  async analyzeData() {
    try {
      const [todos, notes, files, settings] = await Promise.all([
        this.getAllData(this.stores.todos),
        this.getAllData(this.stores.notes),
        this.getAllData(this.stores.files),
        this.getAllData(this.stores.settings),
      ]);

      const analysis = {
        총_레코드: todos.length + notes.length + files.length + settings.length,
        할일_통계: {
          총개수: todos.length,
          완료: todos.filter((t) => t.completed).length,
          높은_우선순위: todos.filter((t) => t.priority === "high").length,
        },
        메모_통계: {
          총개수: notes.length,
          카테고리별: notes.reduce((acc, note) => {
            acc[note.category] = (acc[note.category] || 0) + 1;
            return acc;
          }, {}),
        },
        파일_통계: {
          총개수: files.length,
          총크기: files.reduce((sum, file) => sum + file.size, 0),
          타입별: files.reduce((acc, file) => {
            const type = file.type.split("/")[0];
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
        },
        설정_수: settings.length,
      };

      alert(`데이터 분석 결과:\n\n${JSON.stringify(analysis, null, 2)}`);
      this.logMigration("데이터 분석 완료", "성공");
    } catch (error) {
      console.error("데이터 분석 실패:", error);
      this.showNotification("데이터 분석 실패", "error");
    }
  }

  async optimizeDatabase() {
    try {
      // 완료된 할일 중 30일 이전 것들 삭제
      const todos = await this.getAllData(this.stores.todos);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oldCompletedTodos = todos.filter(
        (todo) => todo.completed && new Date(todo.createdAt) < thirtyDaysAgo
      );

      if (oldCompletedTodos.length > 0) {
        const transaction = this.db.transaction(
          [this.stores.todos],
          "readwrite"
        );
        const store = transaction.objectStore(this.stores.todos);

        oldCompletedTodos.forEach((todo) => store.delete(todo.id));

        transaction.oncomplete = () => {
          this.showNotification(
            `${oldCompletedTodos.length}개의 오래된 완료 할일이 정리되었습니다`,
            "success"
          );
          this.loadTodos();
          this.logMigration("데이터베이스 최적화", "성공");
        };
      } else {
        this.showNotification("정리할 데이터가 없습니다", "info");
        this.logMigration("데이터베이스 최적화 - 정리할 데이터 없음", "완료");
      }
    } catch (error) {
      console.error("데이터베이스 최적화 실패:", error);
      this.showNotification("데이터베이스 최적화 실패", "error");
    }
  }

  logMigration(action, status) {
    const logContainer = document
      .getElementById("migrationLog")
      ?.querySelector(".log-content");
    if (!logContainer) return;

    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${
      status === "성공" || status === "완료" ? "success" : "error"
    }`;
    logEntry.innerHTML = `
      <span class="log-time">${new Date().toLocaleTimeString()}</span>
      <span class="log-type">${action}</span>
      <span class="log-status ${
        status === "성공" || status === "완료" ? "success" : "error"
      }">${status}</span>
    `;

    if (logContainer.querySelector(".empty-state")) {
      logContainer.innerHTML = "";
    }

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // UI 유틸리티 메소드
  switchStore(storeName) {
    // 탭 활성화
    document.querySelectorAll(".store-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document
      .querySelector(`[data-store="${storeName}"]`)
      ?.classList.add("active");

    // 섹션 표시
    document.querySelectorAll(".store-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${storeName}Store`)?.classList.add("active");

    this.currentStore = storeName;

    // 해당 스토어 데이터 로드
    this.loadStoreData(storeName);
  }

  switchAdvancedFeature(feature) {
    // 탭 활성화
    document.querySelectorAll(".advanced-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document
      .querySelector(`[data-feature="${feature}"]`)
      ?.classList.add("active");

    // 섹션 표시
    document.querySelectorAll(".advanced-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${feature}Section`)?.classList.add("active");
  }

  async loadStoreData(storeName) {
    switch (storeName) {
      case "todos":
        await this.loadTodos();
        break;
      case "notes":
        await this.loadNotes();
        break;
      case "files":
        await this.loadFiles();
        break;
      case "settings":
        await this.loadSettings();
        break;
    }
  }

  async loadAllData() {
    await Promise.all([
      this.loadTodos(),
      this.loadNotes(),
      this.loadFiles(),
      this.loadSettings(),
    ]);
    this.updateMonitoringStats();
  }

  async updateMonitoringStats() {
    try {
      const [todos, notes, files, settings] = await Promise.all([
        this.getAllData(this.stores.todos),
        this.getAllData(this.stores.notes),
        this.getAllData(this.stores.files),
        this.getAllData(this.stores.settings),
      ]);

      const totalRecords =
        todos.length + notes.length + files.length + settings.length;
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

      document.getElementById("totalRecords").textContent = totalRecords;
      document.getElementById("usedStorage").textContent =
        this.formatFileSize(totalSize);
    } catch (error) {
      console.error("모니터링 통계 업데이트 실패:", error);
    }
  }

  startMonitoring() {
    // 5초마다 통계 업데이트
    setInterval(() => {
      this.updateMonitoringStats();
    }, 5000);
  }

  // 데이터베이스 관련 추가 메소드
  async createNewDatabase() {
    const newName = document.getElementById("newDbName")?.value?.trim();

    if (!newName) {
      this.showNotification("데이터베이스 이름을 입력하세요", "warning");
      return;
    }

    if (newName === this.dbName) {
      this.showNotification("현재 데이터베이스와 같은 이름입니다", "warning");
      return;
    }

    try {
      // 현재 DB 닫기
      if (this.db) {
        this.db.close();
      }

      // 새 DB 생성
      this.dbName = newName;
      this.dbVersion = 1;

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 기본 스토어들 생성
        Object.values(this.stores).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: "id",
              autoIncrement: true,
            });

            // 기본 인덱스 생성
            if (storeName === "todos") {
              store.createIndex("priority", "priority", { unique: false });
              store.createIndex("completed", "completed", { unique: false });
              store.createIndex("createdAt", "createdAt", { unique: false });
            } else if (storeName === "notes") {
              store.createIndex("category", "category", { unique: false });
              store.createIndex("title", "title", { unique: false });
              store.createIndex("createdAt", "createdAt", { unique: false });
            } else if (storeName === "files") {
              store.createIndex("name", "name", { unique: false });
              store.createIndex("type", "type", { unique: false });
              store.createIndex("size", "size", { unique: false });
            }
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isConnected = true;
        this.updateConnectionStatus("연결됨", true);

        // UI 업데이트
        document.getElementById("dbNameDisplay").textContent = this.dbName;
        document.getElementById("dbVersionDisplay").textContent =
          this.dbVersion;
        document.getElementById("currentVersion").textContent = this.dbVersion;
        document.getElementById("targetVersion").value = this.dbVersion + 1;

        this.showNotification(
          `새 데이터베이스 '${this.dbName}'가 생성되었습니다`,
          "success"
        );
        this.loadAllData();
      };

      request.onerror = () => {
        this.showNotification("데이터베이스 생성 실패", "error");
        this.updateConnectionStatus("연결 실패", false);
      };
    } catch (error) {
      console.error("데이터베이스 생성 실패:", error);
      this.showNotification("데이터베이스 생성 실패", "error");
    }
  }

  async exportAllData() {
    try {
      const [todos, notes, files, settings] = await Promise.all([
        this.getAllData(this.stores.todos),
        this.getAllData(this.stores.notes),
        this.getAllData(this.stores.files),
        this.getAllData(this.stores.settings),
      ]);

      const exportData = {
        database: this.dbName,
        version: this.dbVersion,
        exportedAt: new Date().toISOString(),
        data: {
          todos,
          notes,
          files: files.map((file) => ({
            ...file,
            data: Array.from(new Uint8Array(file.data)), // ArrayBuffer를 배열로 변환
          })),
          settings,
        },
        metadata: {
          totalRecords:
            todos.length + notes.length + files.length + settings.length,
          stores: Object.keys(this.stores),
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.dbName}_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification("전체 데이터가 내보내기되었습니다", "success");
    } catch (error) {
      console.error("전체 데이터 내보내기 실패:", error);
      this.showNotification("전체 데이터 내보내기 실패", "error");
    }
  }

  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data) {
        this.showNotification("올바르지 않은 백업 파일 형식입니다", "error");
        return;
      }

      const transaction = this.db.transaction(
        Object.values(this.stores),
        "readwrite"
      );

      // 각 스토어에 데이터 추가
      for (const [storeName, storeData] of Object.entries(importData.data)) {
        if (this.stores[storeName] && Array.isArray(storeData)) {
          const store = transaction.objectStore(this.stores[storeName]);

          for (const item of storeData) {
            // 파일 데이터의 경우 ArrayBuffer로 복원
            if (
              storeName === "files" &&
              item.data &&
              Array.isArray(item.data)
            ) {
              item.data = new Uint8Array(item.data).buffer;
            }

            // ID 제거하고 새로 추가 (자동 증가)
            const { id, ...itemWithoutId } = item;
            store.add(itemWithoutId);
          }
        }
      }

      transaction.oncomplete = () => {
        this.showNotification("데이터 가져오기가 완료되었습니다", "success");
        this.loadAllData();
      };

      transaction.onerror = () => {
        this.showNotification("데이터 가져오기 실패", "error");
      };
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
      this.showNotification("데이터 가져오기 실패", "error");
    }
  }

  async clearDatabase() {
    if (
      !confirm(
        "전체 데이터베이스를 초기화하시겠습니까? 모든 데이터가 삭제됩니다."
      )
    )
      return;

    try {
      const transaction = this.db.transaction(
        Object.values(this.stores),
        "readwrite"
      );

      Object.values(this.stores).forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        store.clear();
      });

      transaction.oncomplete = () => {
        this.showNotification("데이터베이스가 초기화되었습니다", "success");
        this.loadAllData();
      };

      transaction.onerror = () => {
        this.showNotification("데이터베이스 초기화 실패", "error");
      };
    } catch (error) {
      console.error("데이터베이스 초기화 실패:", error);
      this.showNotification("데이터베이스 초기화 실패", "error");
    }
  }

  // 유틸리티 메소드
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(date) {
    return new Date(date).toLocaleString("ko-KR");
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getPriorityText(priority) {
    const priorities = { low: "낮음", medium: "보통", high: "높음" };
    return priorities[priority] || priority;
  }

  getCategoryText(category) {
    const categories = {
      personal: "개인",
      work: "업무",
      study: "공부",
      ideas: "아이디어",
    };
    return categories[category] || category;
  }

  getFileTypeIcon(type) {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("text/")) return "📄";
    if (type.includes("pdf")) return "📑";
    if (type.includes("word")) return "📝";
    return "📁";
  }

  getSettingLabel(key) {
    const labels = {
      autoBackup: "자동 백업",
      notifications: "알림",
      theme: "테마",
      language: "언어",
      maxItems: "최대 항목",
      updatedAt: "수정 시간",
    };
    return labels[key] || key;
  }

  formatSettingValue(value) {
    if (typeof value === "boolean") return value ? "사용" : "미사용";
    if (value instanceof Date) return this.formatDate(value);
    return String(value);
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notification = document.createElement("div");

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    const icon = icons[type] || "ℹ️";

    notification.className = `notification ${type}`;
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
window.indexedDBAPI = null;

// 초기화
function initIndexedDBAPI() {
  console.log("🚀 IndexedDB API 초기화 함수 호출");
  window.indexedDBAPI = new IndexedDBAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initIndexedDBAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initIndexedDBAPI();
}

console.log(
  "📄 IndexedDB API 스크립트 로드 완료, readyState:",
  document.readyState
);
