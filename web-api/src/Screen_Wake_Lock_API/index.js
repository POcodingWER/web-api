import "./style.css";

console.log("💡 Screen Wake Lock API 스크립트 시작!");

class ScreenWakeLockAPI {
  constructor() {
    this.wakeLock = null;
    this.isLocked = false;
    this.lockStartTime = null;
    this.lockDuration = 0;
    this.autoReleaseTimer = null;
    this.batteryInfo = null;
    this.visibilityHandler = null;
    this.presentationMode = false;
    this.sessionStats = {
      totalLocks: 0,
      totalDuration: 0,
      longestSession: 0,
    };
    this.init();
  }

  init() {
    console.log("💡 Screen Wake Lock API 초기화 시작");
    this.checkWakeLockSupport();
    this.setupUI();
    this.setupEventListeners();
    this.initBatteryMonitoring();
    this.setupVisibilityHandling();
    console.log("✅ Screen Wake Lock API 초기화 완료");
  }

  checkWakeLockSupport() {
    console.log("🔍 Wake Lock 지원 여부 확인 중...");

    if (!("wakeLock" in navigator)) {
      console.warn("⚠️ Screen Wake Lock API 지원 안됨");
      this.showNotification(
        "이 브라우저는 Screen Wake Lock API를 지원하지 않습니다",
        "warning"
      );
    } else {
      console.log("✅ Screen Wake Lock API 지원됨");
    }
  }

  async initBatteryMonitoring() {
    try {
      if ("getBattery" in navigator) {
        this.batteryInfo = await navigator.getBattery();
        this.updateBatteryDisplay();

        // 배터리 상태 변화 감지
        this.batteryInfo.addEventListener("chargingchange", () =>
          this.updateBatteryDisplay()
        );
        this.batteryInfo.addEventListener("levelchange", () =>
          this.updateBatteryDisplay()
        );
      }
    } catch (error) {
      console.warn("배터리 정보 조회 실패:", error);
    }
  }

  setupVisibilityHandling() {
    this.visibilityHandler = () => {
      if (document.hidden && this.isLocked) {
        // 페이지가 숨겨질 때 Wake Lock 다시 요청
        this.reacquireWakeLock();
      }
    };

    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }

    appDiv.innerHTML = `
      <div class="wake-lock-container">
        <header class="wake-lock-header">
          <h1>💡 Screen Wake Lock API 데모</h1>
          <p>화면 꺼짐 방지 및 절전 모드 제어</p>
          <div class="api-support">
            <div class="support-badge ${
              navigator.wakeLock ? "supported" : "unsupported"
            }">
              ${navigator.wakeLock ? "✅ 완전 지원" : "❌ 미지원"}
            </div>
          </div>
        </header>

        <main class="wake-lock-main">
          <div class="control-section">
            <div class="wake-lock-card primary">
              <h2>🔒 Wake Lock 제어</h2>
              <div class="lock-status">
                <div class="status-indicator" id="lockStatus">
                  <span class="status-icon">🔓</span>
                  <span class="status-text">잠금 해제됨</span>
                </div>
                <div class="lock-info">
                  <div class="info-item">
                    <span class="info-label">활성 시간:</span>
                    <span class="info-value" id="lockDuration">00:00:00</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">시작 시간:</span>
                    <span class="info-value" id="lockStartTime">-</span>
                  </div>
                </div>
              </div>

              <div class="lock-controls">
                <button id="requestWakeLock" class="btn-primary">
                  🔒 화면 잠금 활성화
                </button>
                <button id="releaseWakeLock" class="btn-secondary" disabled>
                  🔓 화면 잠금 해제
                </button>
              </div>

              <div class="auto-controls">
                <h3>⏰ 자동 해제 설정</h3>
                <div class="timer-controls">
                  <select id="autoReleaseTime" class="time-select">
                    <option value="0">자동 해제 안함</option>
                    <option value="300">5분 후</option>
                    <option value="600">10분 후</option>
                    <option value="1800">30분 후</option>
                    <option value="3600">1시간 후</option>
                  </select>
                  <button id="setAutoRelease" class="btn-accent">설정</button>
                </div>
                <div class="timer-status" id="autoReleaseStatus">
                  자동 해제가 설정되지 않았습니다
                </div>
              </div>
            </div>

            <div class="wake-lock-card">
              <h2>🔋 배터리 모니터링</h2>
              <div class="battery-info" id="batteryInfo">
                <div class="battery-item">
                  <span class="battery-label">배터리 레벨:</span>
                  <span class="battery-value" id="batteryLevel">-</span>
                </div>
                <div class="battery-item">
                  <span class="battery-label">충전 상태:</span>
                  <span class="battery-value" id="chargingStatus">-</span>
                </div>
                <div class="battery-item">
                  <span class="battery-label">남은 시간:</span>
                  <span class="battery-value" id="batteryTime">-</span>
                </div>
              </div>
              
              <div class="battery-warning" id="batteryWarning" style="display: none;">
                ⚠️ 배터리가 부족합니다. Wake Lock 사용을 자제하세요.
              </div>
            </div>
          </div>

          <div class="usage-section">
            <div class="wake-lock-card">
              <h2>📊 사용 통계</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-number" id="totalLocks">0</span>
                  <span class="stat-label">총 잠금 횟수</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number" id="totalDuration">00:00:00</span>
                  <span class="stat-label">총 사용 시간</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number" id="longestSession">00:00:00</span>
                  <span class="stat-label">최장 세션</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number" id="currentStreak">0</span>
                  <span class="stat-label">현재 연속 사용</span>
                </div>
              </div>
              <button id="resetStats" class="btn-danger">📊 통계 초기화</button>
            </div>

            <div class="wake-lock-card">
              <h2>🎯 사용 시나리오</h2>
              <div class="scenario-grid">
                <div class="scenario-item" data-scenario="reading">
                  <div class="scenario-icon">📖</div>
                  <div class="scenario-title">독서 모드</div>
                  <div class="scenario-desc">긴 글 읽기 시 화면 유지</div>
                </div>
                <div class="scenario-item" data-scenario="presentation">
                  <div class="scenario-icon">📺</div>
                  <div class="scenario-title">프레젠테이션</div>
                  <div class="scenario-desc">발표 중 화면 꺼짐 방지</div>
                </div>
                <div class="scenario-item" data-scenario="video">
                  <div class="scenario-icon">🎬</div>
                  <div class="scenario-title">동영상 시청</div>
                  <div class="scenario-desc">영상 재생 중 화면 유지</div>
                </div>
                <div class="scenario-item" data-scenario="navigation">
                  <div class="scenario-icon">🗺️</div>
                  <div class="scenario-title">내비게이션</div>
                  <div class="scenario-desc">지도 사용 시 화면 활성화</div>
                </div>
                <div class="scenario-item" data-scenario="cooking">
                  <div class="scenario-icon">👨‍🍳</div>
                  <div class="scenario-title">요리 레시피</div>
                  <div class="scenario-desc">레시피 확인 중 화면 유지</div>
                </div>
                <div class="scenario-item" data-scenario="workout">
                  <div class="scenario-icon">💪</div>
                  <div class="scenario-title">운동 타이머</div>
                  <div class="scenario-desc">운동 중 타이머 화면 유지</div>
                </div>
              </div>
            </div>
          </div>

          <div class="demo-section">
            <div class="wake-lock-card">
              <h2>🎮 인터랙티브 데모</h2>
              <div class="demo-controls">
                <button id="demoReading" class="demo-btn">📖 독서 시뮬레이션 (10초)</button>
                <button id="demoPresentation" class="demo-btn">📺 프레젠테이션 모드</button>
                <button id="demoVideo" class="demo-btn">🎬 동영상 재생 (30초)</button>
              </div>
              
              <div class="demo-content" id="demoContent">
                <div class="demo-placeholder">
                  위 버튼을 클릭하여 다양한 시나리오를 체험해보세요
                </div>
              </div>

              <div class="demo-timer" id="demoTimer" style="display: none;">
                <div class="timer-display">
                  <span class="timer-label">데모 진행 시간:</span>
                  <span class="timer-value" id="demoTimeValue">00:00</span>
                </div>
                <div class="timer-progress">
                  <div class="progress-bar" id="demoProgress"></div>
                </div>
              </div>
            </div>

            <div class="wake-lock-card">
              <h2>💡 Screen Wake Lock API 활용법</h2>
              <div class="usage-content">
                <div class="code-example">
                  <h3>기본 사용법:</h3>
                  <pre><code>// Wake Lock 요청
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock 활성화됨');
    
    // Wake Lock 해제 감지
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock 해제됨');
    });
  } catch (err) {
    console.error('Wake Lock 요청 실패:', err);
  }
}

// Wake Lock 해제
async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

// 페이지 숨김 시 재활성화
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    wakeLock = await navigator.wakeLock.request('screen');
  }
});</code></pre>
                </div>

                <div class="tips-section">
                  <h3>🚀 실사용 팁:</h3>
                  <ul class="tips-list">
                    <li><strong>배터리 고려:</strong> 배터리 부족 시 자동 해제 고려</li>
                    <li><strong>사용자 제어:</strong> 사용자가 쉽게 해제할 수 있도록 UI 제공</li>
                    <li><strong>시나리오별 적용:</strong> 콘텐츠 유형에 따른 적절한 사용</li>
                    <li><strong>자동 해제:</strong> 일정 시간 후 자동 해제 설정</li>
                    <li><strong>상태 표시:</strong> 현재 Wake Lock 상태 명확히 표시</li>
                  </ul>
                </div>

                <div class="browser-support">
                  <h3>🌐 브라우저 지원:</h3>
                  <div class="support-grid">
                    <div class="support-item">
                      <span class="browser-name">Chrome</span>
                      <span class="support-status supported">84+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Edge</span>
                      <span class="support-status supported">84+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Firefox</span>
                      <span class="support-status experimental">실험적 ⚠️</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Safari</span>
                      <span class="support-status partial">부분 지원 📱</span>
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

    this.updateLockStatus();
    this.updateStats();
    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // Wake Lock 제어 버튼들
    const requestBtn = document.getElementById("requestWakeLock");
    if (requestBtn) {
      requestBtn.addEventListener("click", () => this.requestWakeLock());
    }

    const releaseBtn = document.getElementById("releaseWakeLock");
    if (releaseBtn) {
      releaseBtn.addEventListener("click", () => this.releaseWakeLock());
    }

    // 자동 해제 설정
    const setAutoBtn = document.getElementById("setAutoRelease");
    if (setAutoBtn) {
      setAutoBtn.addEventListener("click", () => this.setAutoRelease());
    }

    // 통계 초기화
    const resetStatsBtn = document.getElementById("resetStats");
    if (resetStatsBtn) {
      resetStatsBtn.addEventListener("click", () => this.resetStats());
    }

    // 시나리오 클릭
    document.querySelectorAll(".scenario-item").forEach((item) => {
      item.addEventListener("click", () => {
        const scenario = item.dataset.scenario;
        this.activateScenario(scenario);
      });
    });

    // 데모 버튼들
    const demoReadingBtn = document.getElementById("demoReading");
    if (demoReadingBtn) {
      demoReadingBtn.addEventListener("click", () => this.startReadingDemo());
    }

    const demoPresentationBtn = document.getElementById("demoPresentation");
    if (demoPresentationBtn) {
      demoPresentationBtn.addEventListener("click", () =>
        this.togglePresentationMode()
      );
    }

    const demoVideoBtn = document.getElementById("demoVideo");
    if (demoVideoBtn) {
      demoVideoBtn.addEventListener("click", () => this.startVideoDemo());
    }

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  async requestWakeLock() {
    if (!("wakeLock" in navigator)) {
      this.showNotification(
        "이 브라우저는 Wake Lock을 지원하지 않습니다",
        "error"
      );
      return;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request("screen");
      this.isLocked = true;
      this.lockStartTime = new Date();
      this.sessionStats.totalLocks++;

      // Wake Lock 해제 이벤트 리스너
      this.wakeLock.addEventListener("release", () => {
        console.log("Wake Lock이 해제되었습니다");
        this.handleWakeLockRelease();
      });

      this.updateLockStatus();
      this.updateStats();
      this.startDurationTimer();

      this.showNotification("화면 잠금이 활성화되었습니다", "success");
      console.log("Wake Lock 활성화됨");
    } catch (err) {
      console.error("Wake Lock 요청 실패:", err);
      this.showNotification(`Wake Lock 요청 실패: ${err.message}`, "error");
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.error("Wake Lock 해제 실패:", err);
      }
    }

    this.handleWakeLockRelease();
  }

  handleWakeLockRelease() {
    if (this.isLocked) {
      const duration = Date.now() - this.lockStartTime.getTime();
      this.sessionStats.totalDuration += duration;
      this.sessionStats.longestSession = Math.max(
        this.sessionStats.longestSession,
        duration
      );
    }

    this.isLocked = false;
    this.lockStartTime = null;
    this.lockDuration = 0;
    this.clearAutoReleaseTimer();
    this.stopDurationTimer();

    this.updateLockStatus();
    this.updateStats();

    this.showNotification("화면 잠금이 해제되었습니다", "info");
  }

  async reacquireWakeLock() {
    if (this.isLocked && !this.wakeLock) {
      try {
        this.wakeLock = await navigator.wakeLock.request("screen");
        console.log("Wake Lock 재활성화됨");
      } catch (err) {
        console.error("Wake Lock 재활성화 실패:", err);
      }
    }
  }

  setAutoRelease() {
    const timeSelect = document.getElementById("autoReleaseTime");
    const seconds = parseInt(timeSelect.value);

    if (seconds === 0) {
      this.clearAutoReleaseTimer();
      this.updateAutoReleaseStatus("자동 해제가 해제되었습니다");
      this.showNotification("자동 해제가 해제되었습니다", "info");
      return;
    }

    this.clearAutoReleaseTimer();

    this.autoReleaseTimer = setTimeout(() => {
      this.releaseWakeLock();
      this.showNotification(
        "설정된 시간이 지나 자동으로 해제되었습니다",
        "info"
      );
    }, seconds * 1000);

    const minutes = Math.floor(seconds / 60);
    const timeText = minutes > 0 ? `${minutes}분` : `${seconds}초`;
    this.updateAutoReleaseStatus(`${timeText} 후 자동 해제 예정`);
    this.showNotification(`${timeText} 후 자동 해제됩니다`, "success");
  }

  clearAutoReleaseTimer() {
    if (this.autoReleaseTimer) {
      clearTimeout(this.autoReleaseTimer);
      this.autoReleaseTimer = null;
    }
  }

  startDurationTimer() {
    this.durationTimer = setInterval(() => {
      if (this.isLocked && this.lockStartTime) {
        this.lockDuration = Date.now() - this.lockStartTime.getTime();
        this.updateLockDuration();
      }
    }, 1000);
  }

  stopDurationTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  }

  updateLockStatus() {
    const statusEl = document.getElementById("lockStatus");
    const requestBtn = document.getElementById("requestWakeLock");
    const releaseBtn = document.getElementById("releaseWakeLock");

    if (statusEl) {
      const icon = statusEl.querySelector(".status-icon");
      const text = statusEl.querySelector(".status-text");

      if (this.isLocked) {
        if (icon) icon.textContent = "🔒";
        if (text) text.textContent = "잠금 활성화됨";
        statusEl.className = "status-indicator active";
      } else {
        if (icon) icon.textContent = "🔓";
        if (text) text.textContent = "잠금 해제됨";
        statusEl.className = "status-indicator";
      }
    }

    if (requestBtn) {
      requestBtn.disabled = this.isLocked;
    }

    if (releaseBtn) {
      releaseBtn.disabled = !this.isLocked;
    }

    this.updateLockDuration();
  }

  updateLockDuration() {
    const durationEl = document.getElementById("lockDuration");
    const startTimeEl = document.getElementById("lockStartTime");

    if (durationEl) {
      durationEl.textContent = this.formatDuration(this.lockDuration);
    }

    if (startTimeEl) {
      startTimeEl.textContent = this.lockStartTime
        ? this.lockStartTime.toLocaleTimeString()
        : "-";
    }
  }

  updateAutoReleaseStatus(message) {
    const statusEl = document.getElementById("autoReleaseStatus");
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  updateStats() {
    const totalLocksEl = document.getElementById("totalLocks");
    const totalDurationEl = document.getElementById("totalDuration");
    const longestSessionEl = document.getElementById("longestSession");
    const currentStreakEl = document.getElementById("currentStreak");

    if (totalLocksEl) {
      totalLocksEl.textContent = this.sessionStats.totalLocks.toString();
    }

    if (totalDurationEl) {
      totalDurationEl.textContent = this.formatDuration(
        this.sessionStats.totalDuration
      );
    }

    if (longestSessionEl) {
      longestSessionEl.textContent = this.formatDuration(
        this.sessionStats.longestSession
      );
    }

    if (currentStreakEl) {
      currentStreakEl.textContent = this.isLocked
        ? this.formatDuration(this.lockDuration)
        : "00:00:00";
    }
  }

  resetStats() {
    this.sessionStats = {
      totalLocks: 0,
      totalDuration: 0,
      longestSession: 0,
    };
    this.updateStats();
    this.showNotification("사용 통계가 초기화되었습니다", "success");
  }

  updateBatteryDisplay() {
    if (!this.batteryInfo) return;

    const levelEl = document.getElementById("batteryLevel");
    const chargingEl = document.getElementById("chargingStatus");
    const timeEl = document.getElementById("batteryTime");
    const warningEl = document.getElementById("batteryWarning");

    if (levelEl) {
      const level = Math.round(this.batteryInfo.level * 100);
      levelEl.textContent = `${level}%`;
    }

    if (chargingEl) {
      chargingEl.textContent = this.batteryInfo.charging
        ? "🔌 충전 중"
        : "🔋 방전 중";
    }

    if (timeEl) {
      const time = this.batteryInfo.charging
        ? this.batteryInfo.chargingTime
        : this.batteryInfo.dischargingTime;

      if (time === Infinity) {
        timeEl.textContent = "알 수 없음";
      } else {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        timeEl.textContent = `${hours}시간 ${minutes}분`;
      }
    }

    // 배터리 경고 표시
    if (warningEl) {
      const showWarning =
        this.batteryInfo.level < 0.2 && !this.batteryInfo.charging;
      warningEl.style.display = showWarning ? "block" : "none";
    }
  }

  activateScenario(scenario) {
    const scenarios = {
      reading: { name: "독서 모드", duration: 1800 }, // 30분
      presentation: { name: "프레젠테이션", duration: 3600 }, // 1시간
      video: { name: "동영상 시청", duration: 7200 }, // 2시간
      navigation: { name: "내비게이션", duration: 1800 }, // 30분
      cooking: { name: "요리 레시피", duration: 1200 }, // 20분
      workout: { name: "운동 타이머", duration: 2700 }, // 45분
    };

    const config = scenarios[scenario];
    if (!config) return;

    this.requestWakeLock().then(() => {
      // 자동 해제 시간 설정
      this.clearAutoReleaseTimer();
      this.autoReleaseTimer = setTimeout(() => {
        this.releaseWakeLock();
        this.showNotification(
          `${config.name} 시간이 종료되어 자동으로 해제되었습니다`,
          "info"
        );
      }, config.duration * 1000);

      const minutes = Math.floor(config.duration / 60);
      this.updateAutoReleaseStatus(
        `${config.name} - ${minutes}분 후 자동 해제 예정`
      );
      this.showNotification(
        `${config.name}이 활성화되었습니다 (${minutes}분간)`,
        "success"
      );
    });
  }

  async startReadingDemo() {
    await this.requestWakeLock();
    this.startDemo("독서", 10); // 10초 데모

    const contentEl = document.getElementById("demoContent");
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="reading-demo">
          <h3>📖 긴 글 읽기 데모</h3>
          <p>이것은 긴 글을 읽는 상황을 시뮬레이션합니다. 
          일반적으로 사용자가 화면을 터치하지 않고 오랫동안 
          콘텐츠를 읽을 때 화면이 꺼지는 것을 방지하기 위해 
          Wake Lock을 사용합니다.</p>
          <p>독서 앱, 뉴스 앱, 블로그 등에서 유용하게 
          사용할 수 있는 기능입니다.</p>
        </div>
      `;
    }
  }

  togglePresentationMode() {
    if (this.presentationMode) {
      this.releaseWakeLock();
      this.presentationMode = false;

      const contentEl = document.getElementById("demoContent");
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="demo-placeholder">
            위 버튼을 클릭하여 다양한 시나리오를 체험해보세요
          </div>
        `;
      }

      this.showNotification("프레젠테이션 모드가 종료되었습니다", "info");
    } else {
      this.requestWakeLock().then(() => {
        this.presentationMode = true;

        const contentEl = document.getElementById("demoContent");
        if (contentEl) {
          contentEl.innerHTML = `
            <div class="presentation-demo">
              <h3>📺 프레젠테이션 모드 활성화</h3>
              <div class="presentation-slide">
                <h4>Wake Lock API의 활용</h4>
                <ul>
                  <li>발표 중 화면 꺼짐 방지</li>
                  <li>중요한 정보 표시 유지</li>
                  <li>사용자 경험 향상</li>
                </ul>
              </div>
              <p>💡 프레젠테이션 모드에서는 화면이 자동으로 꺼지지 않습니다.</p>
            </div>
          `;
        }

        this.showNotification(
          "프레젠테이션 모드가 활성화되었습니다",
          "success"
        );
      });
    }
  }

  async startVideoDemo() {
    await this.requestWakeLock();
    this.startDemo("동영상", 30); // 30초 데모

    const contentEl = document.getElementById("demoContent");
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="video-demo">
          <h3>🎬 동영상 재생 데모</h3>
          <div class="video-player">
            <div class="video-screen">
              <div class="play-icon">▶️</div>
              <div class="video-title">Wake Lock API 설명 영상</div>
            </div>
            <div class="video-controls">
              <span class="time">00:00</span>
              <div class="progress-bar">
                <div class="progress" id="videoProgress"></div>
              </div>
              <span class="duration">00:30</span>
            </div>
          </div>
          <p>💡 동영상 재생 중에는 화면이 꺼지지 않습니다.</p>
        </div>
      `;
    }
  }

  startDemo(type, duration) {
    const timerEl = document.getElementById("demoTimer");
    const timeValueEl = document.getElementById("demoTimeValue");
    const progressEl = document.getElementById("demoProgress");

    if (timerEl) timerEl.style.display = "block";

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed++;

      if (timeValueEl) {
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timeValueEl.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }

      if (progressEl) {
        const progress = (elapsed / duration) * 100;
        progressEl.style.width = `${progress}%`;
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        this.endDemo();
      }
    }, 1000);
  }

  endDemo() {
    const timerEl = document.getElementById("demoTimer");
    const contentEl = document.getElementById("demoContent");

    if (timerEl) timerEl.style.display = "none";

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="demo-placeholder">
          데모가 완료되었습니다. 다른 시나리오를 체험해보세요!
        </div>
      `;
    }

    this.releaseWakeLock();
    this.showNotification("데모가 완료되었습니다", "success");
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // 정리
  cleanup() {
    if (this.wakeLock) {
      this.wakeLock.release();
    }

    this.clearAutoReleaseTimer();
    this.stopDurationTimer();

    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    }
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

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  if (window.wakeLockAPI) {
    window.wakeLockAPI.cleanup();
  }
});

// 초기화
function initScreenWakeLockAPI() {
  console.log("🚀 Screen Wake Lock API 초기화 함수 호출");
  window.wakeLockAPI = new ScreenWakeLockAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initScreenWakeLockAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initScreenWakeLockAPI();
}

console.log(
  "📄 Screen Wake Lock API 스크립트 로드 완료, readyState:",
  document.readyState
);
