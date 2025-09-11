import "./style.css";

console.log("🔔 Notifications API 스크립트 시작!");

class NotificationsAPI {
  constructor() {
    this.permission = "default";
    this.notifications = [];
    this.notificationHistory = [];
    this.settings = {
      autoClose: true,
      closeDelay: 5000,
      sound: true,
      vibrate: true,
      showTimestamp: true,
      groupNotifications: false,
    };
    this.init();
  }

  init() {
    console.log("🔔 Notifications API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.checkPermission();
    this.loadSettings();
    console.log("✅ Notifications API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Notifications API 지원 여부 확인 중...");

    const support = {
      notification: typeof Notification !== "undefined",
      serviceWorker: "serviceWorker" in navigator,
      push: "PushManager" in window,
      vibrate: "vibrate" in navigator,
      permissions: "permissions" in navigator,
      getNotifications:
        "serviceWorker" in navigator &&
        "getNotifications" in window.ServiceWorkerRegistration.prototype,
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="notifications-container">
        <header class="notifications-header">
          <h1>🔔 Notifications API</h1>
          <p>브라우저 알림, 권한 관리, 커스텀 알림의 모든 기능을 체험하세요</p>
          
          <div style="margin: 1rem 0; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="quickNotificationTest" class="btn-primary">🚀 빠른 알림 테스트</button>
            <button id="requestPermission" class="btn-info">🔑 권한 요청</button>
            <button id="advancedNotificationTest" class="btn-success">⭐ 고급 알림 테스트</button>
          </div>

          <div class="api-support">
            <div class="support-badge ${
              support.notification ? "supported" : "unsupported"
            }">
              ${
                support.notification
                  ? "✅ Notification API"
                  : "❌ Notification API"
              }
            </div>
            <div class="support-badge ${
              support.serviceWorker ? "supported" : "unsupported"
            }">
              ${
                support.serviceWorker
                  ? "✅ Service Worker"
                  : "❌ Service Worker"
              }
            </div>
            <div class="support-badge ${
              support.push ? "supported" : "unsupported"
            }">
              ${support.push ? "✅ Push API" : "❌ Push API"}
            </div>
            <div class="support-badge ${
              support.vibrate ? "supported" : "unsupported"
            }">
              ${support.vibrate ? "✅ Vibration" : "❌ Vibration"}
            </div>
            <div class="support-badge ${
              support.permissions ? "supported" : "unsupported"
            }">
              ${support.permissions ? "✅ Permissions" : "❌ Permissions"}
            </div>
          </div>
        </header>

        <main class="notifications-main">
          <!-- 권한 상태 & 설정 -->
          <div class="panel-card primary">
            <h2>🔑 권한 상태 & 설정</h2>
            
            <div class="permission-section">
              <div class="permission-status">
                <div class="status-info">
                  <h3>현재 권한 상태</h3>
                  <div class="permission-badge" id="permissionStatus">
                    <span class="status-icon">❓</span>
                    <span class="status-text">확인 중...</span>
                  </div>
                  <p class="permission-description" id="permissionDescription">
                    권한 상태를 확인하고 있습니다.
                  </p>
                </div>
                <div class="permission-actions">
                  <button id="checkPermission" class="btn-info">🔍 권한 확인</button>
                  <button id="requestPermissionBtn" class="btn-primary">🔑 권한 요청</button>
                  <button id="openBrowserSettings" class="btn-secondary">⚙️ 브라우저 설정</button>
                </div>
              </div>

              <div class="notification-settings">
                <h3>알림 설정</h3>
                <div class="settings-grid">
                  <div class="setting-item">
                    <label>
                      <input type="checkbox" id="autoClose" checked>
                      <span>자동 닫기</span>
                    </label>
                    <div class="setting-detail">
                      <label for="closeDelay">지연 시간: <span id="closeDelayValue">5</span>초</label>
                      <input type="range" id="closeDelay" min="1" max="30" value="5" step="1">
                    </div>
                  </div>
                  <div class="setting-item">
                    <label>
                      <input type="checkbox" id="enableSound" checked>
                      <span>소리 알림</span>
                    </label>
                  </div>
                  <div class="setting-item">
                    <label>
                      <input type="checkbox" id="enableVibrate" checked>
                      <span>진동 알림</span>
                    </label>
                  </div>
                  <div class="setting-item">
                    <label>
                      <input type="checkbox" id="showTimestamp" checked>
                      <span>시간 표시</span>
                    </label>
                  </div>
                  <div class="setting-item">
                    <label>
                      <input type="checkbox" id="groupNotifications">
                      <span>알림 그룹화</span>
                    </label>
                  </div>
                </div>
                <div class="settings-actions">
                  <button id="saveSettings" class="btn-success">💾 설정 저장</button>
                  <button id="resetSettings" class="btn-warning">🔄 기본값 복원</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 생성 -->
          <div class="panel-card">
            <h2>🚀 알림 생성</h2>
            
            <div class="notification-creator">
              <div class="creator-tabs">
                <button class="creator-tab-btn active" data-tab="basic">📝 기본 알림</button>
                <button class="creator-tab-btn" data-tab="advanced">⭐ 고급 알림</button>
                <button class="creator-tab-btn" data-tab="interactive">🎮 인터랙티브</button>
                <button class="creator-tab-btn" data-tab="scheduled">⏰ 예약 알림</button>
              </div>

              <div class="creator-content">
                <!-- 기본 알림 -->
                <div class="creator-panel active" id="basic">
                  <h3>📝 기본 알림 만들기</h3>
                  <div class="form-group">
                    <label for="basicTitle">제목:</label>
                    <input type="text" id="basicTitle" placeholder="알림 제목을 입력하세요" value="테스트 알림">
                  </div>
                  <div class="form-group">
                    <label for="basicBody">내용:</label>
                    <textarea id="basicBody" placeholder="알림 내용을 입력하세요" rows="3">이것은 Notifications API 테스트 알림입니다!</textarea>
                  </div>
                  <div class="form-group">
                    <label for="basicIcon">아이콘 URL:</label>
                    <input type="url" id="basicIcon" placeholder="https://example.com/icon.png">
                  </div>
                  <div class="form-actions">
                    <button id="createBasicNotification" class="btn-primary">🔔 기본 알림 생성</button>
                    <button id="basicNotificationPreset1" class="btn-secondary">📨 이메일 스타일</button>
                    <button id="basicNotificationPreset2" class="btn-secondary">📱 앱 스타일</button>
                  </div>
                </div>

                <!-- 고급 알림 -->
                <div class="creator-panel" id="advanced">
                  <h3>⭐ 고급 알림 만들기</h3>
                  <div class="form-group">
                    <label for="advancedTitle">제목:</label>
                    <input type="text" id="advancedTitle" placeholder="고급 알림 제목" value="고급 알림">
                  </div>
                  <div class="form-group">
                    <label for="advancedBody">내용:</label>
                    <textarea id="advancedBody" placeholder="상세한 알림 내용" rows="3">이미지, 액션, 진동을 포함한 고급 알림입니다!</textarea>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="advancedIcon">아이콘:</label>
                      <input type="url" id="advancedIcon" placeholder="아이콘 URL">
                    </div>
                    <div class="form-group">
                      <label for="advancedImage">이미지:</label>
                      <input type="url" id="advancedImage" placeholder="이미지 URL">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="advancedBadge">배지:</label>
                      <input type="url" id="advancedBadge" placeholder="배지 URL">
                    </div>
                    <div class="form-group">
                      <label for="advancedTag">태그:</label>
                      <input type="text" id="advancedTag" placeholder="notification-tag">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>추가 옵션:</label>
                    <div class="checkbox-group">
                      <label><input type="checkbox" id="advancedRequireInteraction"> 사용자 상호작용 필요</label>
                      <label><input type="checkbox" id="advancedSilent"> 무음 모드</label>
                      <label><input type="checkbox" id="advancedRenotify"> 재알림</label>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="advancedVibrate">진동 패턴 (ms):</label>
                    <input type="text" id="advancedVibrate" placeholder="예: 200,100,200" value="200,100,200">
                  </div>
                  <div class="form-actions">
                    <button id="createAdvancedNotification" class="btn-primary">⭐ 고급 알림 생성</button>
                    <button id="testVibration" class="btn-info">📳 진동 테스트</button>
                  </div>
                </div>

                <!-- 인터랙티브 알림 -->
                <div class="creator-panel" id="interactive">
                  <h3>🎮 인터랙티브 알림</h3>
                  <div class="form-group">
                    <label for="interactiveTitle">제목:</label>
                    <input type="text" id="interactiveTitle" placeholder="인터랙티브 알림" value="액션이 포함된 알림">
                  </div>
                  <div class="form-group">
                    <label for="interactiveBody">내용:</label>
                    <textarea id="interactiveBody" placeholder="알림 내용" rows="2">버튼을 눌러 액션을 실행할 수 있습니다.</textarea>
                  </div>
                  <div class="actions-builder">
                    <h4>액션 버튼 설정</h4>
                    <div class="action-item">
                      <input type="text" placeholder="액션 1 제목" id="action1Title" value="승인">
                      <input type="text" placeholder="액션 1 ID" id="action1Action" value="approve">
                      <input type="url" placeholder="아이콘 URL (선택)" id="action1Icon">
                    </div>
                    <div class="action-item">
                      <input type="text" placeholder="액션 2 제목" id="action2Title" value="거부">
                      <input type="text" placeholder="액션 2 ID" id="action2Action" value="reject">
                      <input type="url" placeholder="아이콘 URL (선택)" id="action2Icon">
                    </div>
                  </div>
                  <div class="form-actions">
                    <button id="createInteractiveNotification" class="btn-primary">🎮 인터랙티브 알림 생성</button>
                  </div>
                </div>

                <!-- 예약 알림 -->
                <div class="creator-panel" id="scheduled">
                  <h3>⏰ 예약 알림</h3>
                  <div class="form-group">
                    <label for="scheduledTitle">제목:</label>
                    <input type="text" id="scheduledTitle" placeholder="예약 알림" value="예약된 알림">
                  </div>
                  <div class="form-group">
                    <label for="scheduledBody">내용:</label>
                    <textarea id="scheduledBody" placeholder="예약 알림 내용" rows="2">설정된 시간에 표시되는 알림입니다.</textarea>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label for="scheduledDelay">지연 시간 (초):</label>
                      <input type="number" id="scheduledDelay" value="5" min="1" max="3600">
                    </div>
                    <div class="form-group">
                      <label for="scheduledRepeat">반복 간격 (초):</label>
                      <input type="number" id="scheduledRepeat" value="0" min="0" max="3600" placeholder="0 = 반복 없음">
                    </div>
                  </div>
                  <div class="scheduled-status">
                    <div class="scheduled-info" id="scheduledInfo">
                      예약된 알림이 없습니다.
                    </div>
                  </div>
                  <div class="form-actions">
                    <button id="createScheduledNotification" class="btn-primary">⏰ 예약 알림 생성</button>
                    <button id="cancelScheduledNotifications" class="btn-danger">❌ 예약 취소</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 관리 -->
          <div class="panel-card">
            <h2>📋 알림 관리</h2>
            
            <div class="management-section">
              <div class="active-notifications">
                <h3>🔔 활성 알림</h3>
                <div class="notifications-list" id="activeNotificationsList">
                  <div class="notifications-placeholder">활성 알림이 없습니다</div>
                </div>
                <div class="bulk-actions">
                  <button id="closeAllNotifications" class="btn-warning">🗑️ 모든 알림 닫기</button>
                  <button id="refreshNotificationsList" class="btn-info">🔄 목록 새로고침</button>
                </div>
              </div>

              <div class="notification-history">
                <h3>📜 알림 기록</h3>
                <div class="history-controls">
                  <div class="filter-group">
                    <label for="historyFilter">필터:</label>
                    <select id="historyFilter">
                      <option value="all">모든 알림</option>
                      <option value="clicked">클릭됨</option>
                      <option value="closed">닫힌 알림</option>
                      <option value="error">오류 발생</option>
                    </select>
                  </div>
                  <div class="search-group">
                    <label for="historySearch">검색:</label>
                    <input type="text" id="historySearch" placeholder="제목이나 내용으로 검색">
                  </div>
                </div>
                <div class="history-list" id="notificationHistory">
                  <div class="history-placeholder">알림 기록이 없습니다</div>
                </div>
                <div class="history-actions">
                  <button id="clearHistory" class="btn-danger">🗑️ 기록 삭제</button>
                  <button id="exportHistory" class="btn-info">📤 기록 내보내기</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 통계 & 분석 -->
          <div class="panel-card">
            <h2>📊 알림 통계 & 분석</h2>
            
            <div class="stats-section">
              <div class="stats-cards">
                <div class="stat-card">
                  <div class="stat-icon">🔔</div>
                  <div class="stat-info">
                    <span class="stat-label">총 알림 수</span>
                    <span class="stat-value" id="totalNotifications">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">👆</div>
                  <div class="stat-info">
                    <span class="stat-label">클릭된 알림</span>
                    <span class="stat-value" id="clickedNotifications">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">❌</div>
                  <div class="stat-info">
                    <span class="stat-label">닫힌 알림</span>
                    <span class="stat-value" id="closedNotifications">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-info">
                    <span class="stat-label">활성 알림</span>
                    <span class="stat-value" id="activeNotifications">0</span>
                  </div>
                </div>
              </div>

              <div class="stats-charts">
                <div class="chart-container">
                  <h3>📈 시간별 알림 현황</h3>
                  <canvas id="notificationChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                  <h3>📊 알림 타입별 분포</h3>
                  <canvas id="typeChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- 예제 & 프리셋 -->
          <div class="panel-card">
            <h2>📚 알림 예제 & 프리셋</h2>
            
            <div class="examples-section">
              <div class="example-categories">
                <div class="category-tabs">
                  <button class="category-tab-btn active" data-category="demo">🎯 데모</button>
                  <button class="category-tab-btn" data-category="realworld">🌍 실제 사용례</button>
                  <button class="category-tab-btn" data-category="scenarios">🎭 시나리오</button>
                </div>

                <div class="category-content">
                  <!-- 데모 -->
                  <div class="category-panel active" id="demo">
                    <div class="example-grid">
                      <div class="example-card" data-example="simple">
                        <h4>📢 간단한 알림</h4>
                        <p>기본적인 제목과 내용만 있는 알림</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="rich">
                        <h4>🎨 리치 알림</h4>
                        <p>이미지, 아이콘, 배지가 포함된 알림</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="actions">
                        <h4>🎮 액션 알림</h4>
                        <p>사용자가 선택할 수 있는 버튼 포함</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="persistent">
                        <h4>📌 지속적 알림</h4>
                        <p>사용자가 직접 닫을 때까지 유지</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                    </div>
                  </div>

                  <!-- 실제 사용례 -->
                  <div class="category-panel" id="realworld">
                    <div class="example-grid">
                      <div class="example-card" data-example="email">
                        <h4>📧 이메일 알림</h4>
                        <p>새 이메일 도착 알림 시뮬레이션</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="message">
                        <h4>💬 메시지 알림</h4>
                        <p>채팅 메시지 알림 스타일</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="reminder">
                        <h4>⏰ 리마인더</h4>
                        <p>일정 및 할 일 알림</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="system">
                        <h4>⚙️ 시스템 알림</h4>
                        <p>업데이트, 오류 등 시스템 메시지</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                    </div>
                  </div>

                  <!-- 시나리오 -->
                  <div class="category-panel" id="scenarios">
                    <div class="example-grid">
                      <div class="example-card" data-example="workflow">
                        <h4>🔄 워크플로우</h4>
                        <p>순차적인 알림 시퀀스</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="batch">
                        <h4>📦 배치 알림</h4>
                        <p>여러 알림을 한 번에 표시</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="interactive-story">
                        <h4>📖 인터랙티브 스토리</h4>
                        <p>사용자 선택에 따른 알림 흐름</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                      <div class="example-card" data-example="stress-test">
                        <h4>💥 스트레스 테스트</h4>
                        <p>대량 알림 처리 테스트</p>
                        <button class="btn-small btn-primary">실행</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 영역 -->
          <div id="inPageNotifications" class="in-page-notifications"></div>
        </main>
      </div>
    `;

    console.log("✅ UI 설정 완료");
  }

  setupEventListeners() {
    // 빠른 테스트 버튼들
    document
      .getElementById("quickNotificationTest")
      ?.addEventListener("click", () => this.runQuickTest());
    document
      .getElementById("requestPermission")
      ?.addEventListener("click", () => this.requestPermission());
    document
      .getElementById("advancedNotificationTest")
      ?.addEventListener("click", () => this.runAdvancedTest());

    // 권한 관련
    document
      .getElementById("checkPermission")
      ?.addEventListener("click", () => this.checkPermission());
    document
      .getElementById("requestPermissionBtn")
      ?.addEventListener("click", () => this.requestPermission());
    document
      .getElementById("openBrowserSettings")
      ?.addEventListener("click", () => this.openBrowserSettings());

    // 설정
    document
      .querySelectorAll(
        "#autoClose, #enableSound, #enableVibrate, #showTimestamp, #groupNotifications"
      )
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () => this.updateSettings());
      });
    document
      .getElementById("closeDelay")
      ?.addEventListener("input", (e) =>
        this.updateCloseDelayDisplay(e.target.value)
      );
    document
      .getElementById("saveSettings")
      ?.addEventListener("click", () => this.saveSettings());
    document
      .getElementById("resetSettings")
      ?.addEventListener("click", () => this.resetSettings());

    // 크리에이터 탭
    document.querySelectorAll(".creator-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchCreatorTab(e.target.dataset.tab)
      );
    });

    // 기본 알림
    document
      .getElementById("createBasicNotification")
      ?.addEventListener("click", () => this.createBasicNotification());
    document
      .getElementById("basicNotificationPreset1")
      ?.addEventListener("click", () => this.createEmailStyleNotification());
    document
      .getElementById("basicNotificationPreset2")
      ?.addEventListener("click", () => this.createAppStyleNotification());

    // 고급 알림
    document
      .getElementById("createAdvancedNotification")
      ?.addEventListener("click", () => this.createAdvancedNotification());
    document
      .getElementById("testVibration")
      ?.addEventListener("click", () => this.testVibration());

    // 인터랙티브 알림
    document
      .getElementById("createInteractiveNotification")
      ?.addEventListener("click", () => this.createInteractiveNotification());

    // 예약 알림
    document
      .getElementById("createScheduledNotification")
      ?.addEventListener("click", () => this.createScheduledNotification());
    document
      .getElementById("cancelScheduledNotifications")
      ?.addEventListener("click", () => this.cancelScheduledNotifications());

    // 알림 관리
    document
      .getElementById("closeAllNotifications")
      ?.addEventListener("click", () => this.closeAllNotifications());
    document
      .getElementById("refreshNotificationsList")
      ?.addEventListener("click", () => this.refreshNotificationsList());
    document
      .getElementById("clearHistory")
      ?.addEventListener("click", () => this.clearHistory());
    document
      .getElementById("exportHistory")
      ?.addEventListener("click", () => this.exportHistory());

    // 필터링 및 검색
    document
      .getElementById("historyFilter")
      ?.addEventListener("change", () => this.filterHistory());
    document
      .getElementById("historySearch")
      ?.addEventListener("input", () => this.searchHistory());

    // 예제 카테고리 탭
    document.querySelectorAll(".category-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchCategoryTab(e.target.dataset.category)
      );
    });

    // 예제 카드 클릭
    document.querySelectorAll(".example-card").forEach((card) => {
      const button = card.querySelector("button");
      button?.addEventListener("click", () =>
        this.runExample(card.dataset.example)
      );
    });

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  // 권한 관리
  async checkPermission() {
    if (!this.apiSupport.notification) {
      this.showInPageNotification(
        "브라우저가 Notification API를 지원하지 않습니다",
        "error"
      );
      return;
    }

    this.permission = Notification.permission;
    this.updatePermissionDisplay();

    console.log("🔍 현재 권한 상태:", this.permission);
    return this.permission;
  }

  async requestPermission() {
    if (!this.apiSupport.notification) {
      this.showInPageNotification(
        "브라우저가 Notification API를 지원하지 않습니다",
        "error"
      );
      return "denied";
    }

    try {
      this.showInPageNotification("권한 요청 중...", "info");

      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.updatePermissionDisplay();

      console.log("🔑 권한 요청 결과:", permission);

      if (permission === "granted") {
        this.showInPageNotification("알림 권한이 허용되었습니다!", "success");

        // 권한 획득 축하 알림
        this.createNotification({
          title: "🎉 권한 허용 완료!",
          body: "이제 브라우저 알림을 받을 수 있습니다.",
          icon: "🔔",
        });
      } else if (permission === "denied") {
        this.showInPageNotification("알림 권한이 거부되었습니다", "error");
      } else {
        this.showInPageNotification("권한 요청이 무시되었습니다", "warning");
      }

      return permission;
    } catch (error) {
      console.error("권한 요청 오류:", error);
      this.showInPageNotification(`권한 요청 실패: ${error.message}`, "error");
      return "denied";
    }
  }

  updatePermissionDisplay() {
    const statusEl = document.getElementById("permissionStatus");
    const descEl = document.getElementById("permissionDescription");

    if (!statusEl || !descEl) return;

    const statusConfig = {
      granted: {
        icon: "✅",
        text: "허용됨",
        class: "granted",
        description: "브라우저 알림을 사용할 수 있습니다.",
      },
      denied: {
        icon: "❌",
        text: "거부됨",
        class: "denied",
        description: "브라우저 설정에서 알림 권한을 허용해주세요.",
      },
      default: {
        icon: "❓",
        text: "미정",
        class: "default",
        description: "알림 권한을 요청해주세요.",
      },
    };

    const config = statusConfig[this.permission] || statusConfig.default;

    statusEl.className = `permission-badge ${config.class}`;
    statusEl.innerHTML = `
      <span class="status-icon">${config.icon}</span>
      <span class="status-text">${config.text}</span>
    `;
    descEl.textContent = config.description;
  }

  openBrowserSettings() {
    this.showInPageNotification(
      "브라우저 설정에서 사이트별 알림 권한을 변경할 수 있습니다",
      "info"
    );

    // Chrome의 경우 설정 페이지로 이동 시도
    if (navigator.userAgent.includes("Chrome")) {
      window.open("chrome://settings/content/notifications", "_blank");
    } else {
      this.showInPageNotification(
        "브라우저 주소창에 'chrome://settings/notifications' 또는 해당 브라우저의 설정을 입력하세요",
        "info"
      );
    }
  }

  // 설정 관리
  updateSettings() {
    this.settings.autoClose = document.getElementById("autoClose").checked;
    this.settings.sound = document.getElementById("enableSound").checked;
    this.settings.vibrate = document.getElementById("enableVibrate").checked;
    this.settings.showTimestamp =
      document.getElementById("showTimestamp").checked;
    this.settings.groupNotifications =
      document.getElementById("groupNotifications").checked;
    this.settings.closeDelay =
      parseInt(document.getElementById("closeDelay").value) * 1000;
  }

  updateCloseDelayDisplay(value) {
    document.getElementById("closeDelayValue").textContent = value;
    this.settings.closeDelay = parseInt(value) * 1000;
  }

  saveSettings() {
    this.updateSettings();
    localStorage.setItem("notificationSettings", JSON.stringify(this.settings));
    this.showInPageNotification("설정이 저장되었습니다", "success");
  }

  loadSettings() {
    const saved = localStorage.getItem("notificationSettings");
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
      this.applySettings();
    }
  }

  applySettings() {
    document.getElementById("autoClose").checked = this.settings.autoClose;
    document.getElementById("enableSound").checked = this.settings.sound;
    document.getElementById("enableVibrate").checked = this.settings.vibrate;
    document.getElementById("showTimestamp").checked =
      this.settings.showTimestamp;
    document.getElementById("groupNotifications").checked =
      this.settings.groupNotifications;
    document.getElementById("closeDelay").value =
      this.settings.closeDelay / 1000;
    this.updateCloseDelayDisplay(this.settings.closeDelay / 1000);
  }

  resetSettings() {
    this.settings = {
      autoClose: true,
      closeDelay: 5000,
      sound: true,
      vibrate: true,
      showTimestamp: true,
      groupNotifications: false,
    };
    this.applySettings();
    this.showInPageNotification("설정이 기본값으로 복원되었습니다", "info");
  }

  // 알림 생성
  async createNotification(options) {
    if (this.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return null;
      }
    }

    try {
      const notificationOptions = {
        body: options.body || "",
        icon: options.icon || "",
        badge: options.badge || "",
        image: options.image || "",
        tag: options.tag || "",
        data: options.data || {},
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        renotify: options.renotify || false,
        actions: options.actions || [],
        vibrate:
          options.vibrate || (this.settings.vibrate ? [200, 100, 200] : []),
        timestamp: Date.now(),
      };

      const notification = new Notification(
        options.title || "알림",
        notificationOptions
      );

      const notificationData = {
        id: Date.now().toString(),
        title: options.title || "알림",
        options: notificationOptions,
        created: new Date(),
        status: "active",
        clicked: false,
        closed: false,
      };

      this.notifications.push(notificationData);
      this.notificationHistory.push(notificationData);

      // 이벤트 리스너 설정
      notification.onclick = () => {
        console.log("📱 알림 클릭됨:", notificationData.title);
        notificationData.clicked = true;
        notificationData.status = "clicked";
        this.updateStats();
        this.refreshNotificationsList();

        if (options.onClick) {
          options.onClick(notificationData);
        }
      };

      notification.onclose = () => {
        console.log("❌ 알림 닫힘:", notificationData.title);
        notificationData.closed = true;
        notificationData.status = "closed";
        this.notifications = this.notifications.filter(
          (n) => n.id !== notificationData.id
        );
        this.updateStats();
        this.refreshNotificationsList();

        if (options.onClose) {
          options.onClose(notificationData);
        }
      };

      notification.onerror = (error) => {
        console.error("🚨 알림 오류:", error);
        notificationData.status = "error";
        notificationData.error = error.message;
        this.updateStats();
        this.showInPageNotification(`알림 오류: ${error.message}`, "error");
      };

      // 자동 닫기
      if (this.settings.autoClose && !notificationOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, this.settings.closeDelay);
      }

      // 진동
      if (
        this.settings.vibrate &&
        navigator.vibrate &&
        notificationOptions.vibrate.length > 0
      ) {
        navigator.vibrate(notificationOptions.vibrate);
      }

      this.updateStats();
      this.refreshNotificationsList();

      console.log("🔔 알림 생성됨:", notificationData);
      return { notification, data: notificationData };
    } catch (error) {
      console.error("알림 생성 오류:", error);
      this.showInPageNotification(`알림 생성 실패: ${error.message}`, "error");
      return null;
    }
  }

  // 기본 알림 생성
  createBasicNotification() {
    const title = document.getElementById("basicTitle").value || "기본 알림";
    const body =
      document.getElementById("basicBody").value || "기본 알림 내용입니다.";
    const icon = document.getElementById("basicIcon").value;

    this.createNotification({
      title,
      body,
      icon,
      onClick: (data) => {
        this.showInPageNotification(`기본 알림 클릭됨: ${data.title}`, "info");
      },
    });
  }

  // 이메일 스타일 알림
  createEmailStyleNotification() {
    this.createNotification({
      title: "📧 새 이메일",
      body: "홍길동님으로부터 새 이메일이 도착했습니다.\n제목: 회의 일정 안내",
      icon: "📧",
      tag: "email",
      onClick: (data) => {
        this.showInPageNotification(
          "이메일 알림 클릭 - 받은편지함으로 이동",
          "info"
        );
      },
    });
  }

  // 앱 스타일 알림
  createAppStyleNotification() {
    this.createNotification({
      title: "📱 앱 업데이트",
      body: "새로운 기능이 추가되었습니다! 지금 업데이트하여 최신 기능을 사용해보세요.",
      icon: "📱",
      badge: "🔄",
      tag: "app-update",
      actions: [
        { action: "update", title: "업데이트" },
        { action: "later", title: "나중에" },
      ],
      onClick: (data) => {
        this.showInPageNotification("앱 업데이트 알림 클릭", "info");
      },
    });
  }

  // 고급 알림 생성
  createAdvancedNotification() {
    const title = document.getElementById("advancedTitle").value || "고급 알림";
    const body =
      document.getElementById("advancedBody").value || "고급 알림 내용입니다.";
    const icon = document.getElementById("advancedIcon").value;
    const image = document.getElementById("advancedImage").value;
    const badge = document.getElementById("advancedBadge").value;
    const tag = document.getElementById("advancedTag").value;
    const requireInteraction = document.getElementById(
      "advancedRequireInteraction"
    ).checked;
    const silent = document.getElementById("advancedSilent").checked;
    const renotify = document.getElementById("advancedRenotify").checked;
    const vibratePattern = document
      .getElementById("advancedVibrate")
      .value.split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

    this.createNotification({
      title,
      body,
      icon,
      image,
      badge,
      tag,
      requireInteraction,
      silent,
      renotify,
      vibrate: vibratePattern.length > 0 ? vibratePattern : undefined,
      onClick: (data) => {
        this.showInPageNotification(`고급 알림 클릭됨: ${data.title}`, "info");
      },
    });
  }

  // 인터랙티브 알림 생성
  createInteractiveNotification() {
    const title =
      document.getElementById("interactiveTitle").value || "인터랙티브 알림";
    const body =
      document.getElementById("interactiveBody").value || "액션을 선택하세요.";

    const actions = [];

    const action1Title = document.getElementById("action1Title").value;
    const action1Action = document.getElementById("action1Action").value;
    const action1Icon = document.getElementById("action1Icon").value;

    if (action1Title && action1Action) {
      actions.push({
        action: action1Action,
        title: action1Title,
        icon: action1Icon || undefined,
      });
    }

    const action2Title = document.getElementById("action2Title").value;
    const action2Action = document.getElementById("action2Action").value;
    const action2Icon = document.getElementById("action2Icon").value;

    if (action2Title && action2Action) {
      actions.push({
        action: action2Action,
        title: action2Title,
        icon: action2Icon || undefined,
      });
    }

    this.createNotification({
      title,
      body,
      actions,
      requireInteraction: true,
      onClick: (data) => {
        this.showInPageNotification(
          `인터랙티브 알림 클릭됨: ${data.title}`,
          "info"
        );
      },
    });
  }

  // 예약 알림
  createScheduledNotification() {
    const title =
      document.getElementById("scheduledTitle").value || "예약 알림";
    const body =
      document.getElementById("scheduledBody").value || "예약된 알림입니다.";
    const delay =
      parseInt(document.getElementById("scheduledDelay").value) * 1000;
    const repeat =
      parseInt(document.getElementById("scheduledRepeat").value) * 1000;

    const scheduleId = `scheduled-${Date.now()}`;

    this.showInPageNotification(
      `${delay / 1000}초 후에 알림이 표시됩니다`,
      "info"
    );

    const createNotificationFunc = () => {
      this.createNotification({
        title,
        body,
        tag: scheduleId,
        onClick: (data) => {
          this.showInPageNotification(
            `예약 알림 클릭됨: ${data.title}`,
            "info"
          );
        },
      });
    };

    // 첫 번째 알림
    const timeoutId = setTimeout(createNotificationFunc, delay);

    // 반복 알림
    let intervalId;
    if (repeat > 0) {
      intervalId = setInterval(createNotificationFunc, repeat);
    }

    // 예약 정보 저장
    if (!this.scheduledNotifications) {
      this.scheduledNotifications = [];
    }

    this.scheduledNotifications.push({
      id: scheduleId,
      timeoutId,
      intervalId,
      title,
      body,
      delay,
      repeat,
      created: new Date(),
    });

    this.updateScheduledInfo();
  }

  cancelScheduledNotifications() {
    if (this.scheduledNotifications) {
      this.scheduledNotifications.forEach((scheduled) => {
        if (scheduled.timeoutId) clearTimeout(scheduled.timeoutId);
        if (scheduled.intervalId) clearInterval(scheduled.intervalId);
      });
      this.scheduledNotifications = [];
      this.updateScheduledInfo();
      this.showInPageNotification("모든 예약 알림이 취소되었습니다", "info");
    }
  }

  updateScheduledInfo() {
    const infoEl = document.getElementById("scheduledInfo");
    if (!infoEl) return;

    if (
      !this.scheduledNotifications ||
      this.scheduledNotifications.length === 0
    ) {
      infoEl.textContent = "예약된 알림이 없습니다.";
      return;
    }

    const info = this.scheduledNotifications
      .map((s) => `"${s.title}" (${s.repeat > 0 ? "반복" : "일회성"})`)
      .join(", ");

    infoEl.textContent = `예약된 알림 ${this.scheduledNotifications.length}개: ${info}`;
  }

  // 진동 테스트
  testVibration() {
    if (!navigator.vibrate) {
      this.showInPageNotification(
        "이 기기는 진동을 지원하지 않습니다",
        "warning"
      );
      return;
    }

    const pattern = document
      .getElementById("advancedVibrate")
      .value.split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));

    if (pattern.length === 0) {
      this.showInPageNotification(
        "올바른 진동 패턴을 입력하세요 (예: 200,100,200)",
        "warning"
      );
      return;
    }

    navigator.vibrate(pattern);
    this.showInPageNotification(
      `진동 패턴 테스트: ${pattern.join(", ")}ms`,
      "info"
    );
  }

  // 빠른 테스트들
  async runQuickTest() {
    this.showInPageNotification("빠른 알림 테스트 시작!", "info");

    if (this.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return;
      }
    }

    this.createNotification({
      title: "🚀 빠른 테스트",
      body: "Notifications API가 정상적으로 작동합니다!",
      icon: "🔔",
      onClick: (data) => {
        this.showInPageNotification(
          "빠른 테스트 알림이 클릭되었습니다!",
          "success"
        );
      },
    });
  }

  async runAdvancedTest() {
    this.showInPageNotification("고급 알림 테스트 시작!", "info");

    if (this.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return;
      }
    }

    this.createNotification({
      title: "⭐ 고급 테스트",
      body: "이 알림은 이미지, 액션, 진동을 포함합니다!",
      icon: "⭐",
      badge: "🔔",
      actions: [
        { action: "like", title: "👍 좋아요" },
        { action: "share", title: "📤 공유" },
      ],
      vibrate: [200, 100, 200],
      requireInteraction: true,
      onClick: (data) => {
        this.showInPageNotification(
          "고급 테스트 알림이 클릭되었습니다!",
          "success"
        );
      },
    });
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
      .querySelectorAll(".category-panel")
      .forEach((panel) => panel.classList.remove("active"));
    document.getElementById(category).classList.add("active");
  }

  // 알림 관리
  refreshNotificationsList() {
    const container = document.getElementById("activeNotificationsList");
    if (!container) return;

    if (this.notifications.length === 0) {
      container.innerHTML =
        '<div class="notifications-placeholder">활성 알림이 없습니다</div>';
      return;
    }

    container.innerHTML = this.notifications
      .map(
        (notification) => `
      <div class="notification-item" data-id="${notification.id}">
        <div class="notification-header">
          <span class="notification-title">${notification.title}</span>
          <span class="notification-status ${notification.status}">${
          notification.status
        }</span>
        </div>
        <div class="notification-body">${notification.options.body || ""}</div>
        <div class="notification-meta">
          <span class="notification-time">${notification.created.toLocaleTimeString()}</span>
          <button onclick="window.notificationsAPI.closeNotification('${
            notification.id
          }')" class="btn-small btn-danger">닫기</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  closeNotification(id) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      // 실제 브라우저 알림은 직접 닫을 수 없지만, 우리 목록에서는 제거
      this.notifications = this.notifications.filter((n) => n.id !== id);
      notification.status = "manually_closed";
      this.updateStats();
      this.refreshNotificationsList();
      this.showInPageNotification("알림이 닫혔습니다", "info");
    }
  }

  closeAllNotifications() {
    this.notifications = [];
    this.updateStats();
    this.refreshNotificationsList();
    this.showInPageNotification("모든 활성 알림이 닫혔습니다", "info");
  }

  // 통계 업데이트
  updateStats() {
    const total = this.notificationHistory.length;
    const clicked = this.notificationHistory.filter((n) => n.clicked).length;
    const closed = this.notificationHistory.filter((n) => n.closed).length;
    const active = this.notifications.length;

    const totalEl = document.getElementById("totalNotifications");
    const clickedEl = document.getElementById("clickedNotifications");
    const closedEl = document.getElementById("closedNotifications");
    const activeEl = document.getElementById("activeNotifications");

    if (totalEl) totalEl.textContent = total;
    if (clickedEl) clickedEl.textContent = clicked;
    if (closedEl) closedEl.textContent = closed;
    if (activeEl) activeEl.textContent = active;
  }

  // 기록 관리
  filterHistory() {
    // 기록 필터링 구현
    const filter = document.getElementById("historyFilter").value;
    // 구현 생략
  }

  searchHistory() {
    // 기록 검색 구현
    const query = document.getElementById("historySearch").value;
    // 구현 생략
  }

  clearHistory() {
    this.notificationHistory = [];
    this.updateStats();
    this.showInPageNotification("알림 기록이 삭제되었습니다", "info");
  }

  exportHistory() {
    const data = JSON.stringify(this.notificationHistory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notification-history-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showInPageNotification("알림 기록이 내보내졌습니다", "success");
  }

  // 예제 실행
  runExample(example) {
    switch (example) {
      case "simple":
        this.runSimpleExample();
        break;
      case "rich":
        this.runRichExample();
        break;
      case "actions":
        this.runActionsExample();
        break;
      case "persistent":
        this.runPersistentExample();
        break;
      case "email":
        this.runEmailExample();
        break;
      case "message":
        this.runMessageExample();
        break;
      case "reminder":
        this.runReminderExample();
        break;
      case "system":
        this.runSystemExample();
        break;
      case "workflow":
        this.runWorkflowExample();
        break;
      case "batch":
        this.runBatchExample();
        break;
      case "interactive-story":
        this.runInteractiveStoryExample();
        break;
      case "stress-test":
        this.runStressTestExample();
        break;
      default:
        this.showInPageNotification(
          `예제 ${example}은 아직 구현되지 않았습니다`,
          "info"
        );
    }
  }

  runSimpleExample() {
    this.createNotification({
      title: "📢 간단한 알림",
      body: "가장 기본적인 알림입니다.",
    });
  }

  runRichExample() {
    this.createNotification({
      title: "🎨 리치 알림",
      body: "이미지와 아이콘이 포함된 멋진 알림입니다!",
      icon: "🎨",
      badge: "🔔",
    });
  }

  runActionsExample() {
    this.createNotification({
      title: "🎮 액션 알림",
      body: "버튼을 눌러 액션을 선택하세요.",
      actions: [
        { action: "yes", title: "예" },
        { action: "no", title: "아니오" },
      ],
      requireInteraction: true,
    });
  }

  runPersistentExample() {
    this.createNotification({
      title: "📌 지속적 알림",
      body: "이 알림은 직접 닫을 때까지 유지됩니다.",
      requireInteraction: true,
    });
  }

  runEmailExample() {
    this.createNotification({
      title: "📧 새 이메일 도착",
      body: "김철수님이 보낸 메일: 프로젝트 미팅 안내",
      icon: "📧",
      tag: "email-123",
      actions: [
        { action: "read", title: "읽기" },
        { action: "delete", title: "삭제" },
      ],
    });
  }

  runMessageExample() {
    this.createNotification({
      title: "💬 새 메시지",
      body: "이영희: 오늘 점심 같이 드실래요?",
      icon: "💬",
      actions: [
        { action: "reply", title: "답장" },
        { action: "mute", title: "음소거" },
      ],
    });
  }

  runReminderExample() {
    this.createNotification({
      title: "⏰ 리마인더",
      body: "오후 3시 회의가 10분 후 시작됩니다.",
      icon: "⏰",
      vibrate: [300, 200, 300],
      actions: [
        { action: "join", title: "참여" },
        { action: "snooze", title: "5분 연기" },
      ],
    });
  }

  runSystemExample() {
    this.createNotification({
      title: "⚙️ 시스템 업데이트",
      body: "보안 업데이트가 사용 가능합니다. 지금 설치하시겠습니까?",
      icon: "⚙️",
      badge: "🔄",
      actions: [
        { action: "install", title: "설치" },
        { action: "later", title: "나중에" },
      ],
    });
  }

  async runWorkflowExample() {
    this.showInPageNotification("워크플로우 시작: 순차적 알림", "info");

    const notifications = [
      { title: "1단계", body: "워크플로우가 시작되었습니다", delay: 0 },
      { title: "2단계", body: "데이터를 처리하고 있습니다...", delay: 2000 },
      { title: "3단계", body: "처리가 완료되었습니다", delay: 4000 },
      {
        title: "완료",
        body: "워크플로우가 성공적으로 완료되었습니다!",
        delay: 6000,
      },
    ];

    notifications.forEach((notif, index) => {
      setTimeout(() => {
        this.createNotification({
          title: `🔄 ${notif.title}`,
          body: notif.body,
          tag: `workflow-${index}`,
        });
      }, notif.delay);
    });
  }

  async runBatchExample() {
    this.showInPageNotification("배치 알림 생성 중...", "info");

    const batchNotifications = [
      { title: "📊 일일 리포트", body: "오늘의 판매 현황을 확인하세요" },
      { title: "📈 주간 분석", body: "이번 주 성과 분석이 완료되었습니다" },
      { title: "💰 수익 업데이트", body: "월간 수익이 목표를 달성했습니다" },
      { title: "👥 팀 업데이트", body: "새로운 팀원이 합류했습니다" },
      { title: "🎯 목표 달성", body: "분기 목표를 조기 달성했습니다!" },
    ];

    batchNotifications.forEach((notif, index) => {
      setTimeout(() => {
        this.createNotification({
          title: notif.title,
          body: notif.body,
          tag: `batch-${index}`,
        });
      }, index * 500);
    });
  }

  async runInteractiveStoryExample() {
    this.showInPageNotification("인터랙티브 스토리 시작!", "info");

    this.createNotification({
      title: "📖 모험의 시작",
      body: "숲에서 갈림길을 만났습니다. 어느 길로 가시겠습니까?",
      actions: [
        { action: "left", title: "왼쪽 길" },
        { action: "right", title: "오른쪽 길" },
      ],
      requireInteraction: true,
      onClick: () => {
        setTimeout(() => {
          this.createNotification({
            title: "🏰 발견",
            body: "신비로운 성을 발견했습니다!",
            actions: [
              { action: "enter", title: "들어가기" },
              { action: "explore", title: "주변 탐색" },
            ],
          });
        }, 1000);
      },
    });
  }

  async runStressTestExample() {
    this.showInPageNotification(
      "스트레스 테스트 시작 - 20개 알림 생성",
      "warning"
    );

    for (let i = 1; i <= 20; i++) {
      setTimeout(() => {
        this.createNotification({
          title: `💥 테스트 알림 #${i}`,
          body: `스트레스 테스트용 알림입니다 (${i}/20)`,
          tag: `stress-test-${i}`,
          silent: true,
        });
      }, i * 100);
    }
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
window.notificationsAPI = null;

// 초기화
function initNotificationsAPI() {
  console.log("🚀 Notifications API 초기화 함수 호출");
  window.notificationsAPI = new NotificationsAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initNotificationsAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initNotificationsAPI();
}

console.log(
  "📄 Notifications API 스크립트 로드 완료, readyState:",
  document.readyState
);
