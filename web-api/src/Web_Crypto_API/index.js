import "./style.css";

class WebCryptoAPI {
  constructor() {
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.checkCryptoSupport();
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = `
      <div class="crypto-container">
        <header class="crypto-header">
          <h1>🔐 Web Crypto API 데모</h1>
          <p>브라우저 내장 암호화 기능을 활용한 보안 도구들</p>
          <div class="support-status" id="supportStatus">
            <span class="status-indicator" id="statusIndicator">⏳</span>
            <span id="statusText">지원 상태 확인 중...</span>
          </div>
        </header>

        <nav class="crypto-nav">
          <button class="nav-btn active" data-tab="encryption">🔒 암호화/복호화</button>
          <button class="nav-btn" data-tab="hashing">🔗 해시 생성</button>
          <button class="nav-btn" data-tab="signatures">✍️ 디지털 서명</button>
          <button class="nav-btn" data-tab="keys">🗝️ 키 관리</button>
          <button class="nav-btn" data-tab="password">🔑 패스워드 도구</button>
          <button class="nav-btn" data-tab="secure-storage">💾 보안 저장소</button>
        </nav>

        <main class="crypto-main">
          <!-- 암호화/복호화 탭 -->
          <section class="tab-content active" data-tab="encryption">
            <div class="section-header">
              <h2>🔒 대칭키 암호화/복호화</h2>
              <p>AES-GCM 알고리즘을 사용한 안전한 데이터 암호화</p>
            </div>

            <div class="encryption-controls">
              <div class="input-group">
                <label for="encryptionKey">암호화 키 (16글자 이상):</label>
                <div class="key-input-wrapper">
                  <input type="password" id="encryptionKey" placeholder="강력한 패스워드를 입력하세요" maxlength="256">
                  <button id="generateKey" class="btn-small">🎲 생성</button>
                  <button id="toggleKeyVisibility" class="btn-small">👁️</button>
                </div>
              </div>

              <div class="input-group">
                <label for="plaintextInput">암호화할 텍스트:</label>
                <textarea id="plaintextInput" placeholder="암호화하고 싶은 내용을 입력하세요..." rows="4"></textarea>
                <button id="encryptBtn" class="btn-primary">🔒 암호화</button>
              </div>

              <div class="input-group">
                <label for="ciphertextInput">복호화할 암호문:</label>
                <textarea id="ciphertextInput" placeholder="복호화하고 싶은 암호문을 붙여넣기하세요..." rows="4"></textarea>
                <button id="decryptBtn" class="btn-secondary">🔓 복호화</button>
              </div>

              <div class="result-area">
                <h3>결과:</h3>
                <div id="encryptionResult" class="result-box"></div>
                <div class="result-actions">
                  <button id="copyResult" class="btn-small">📋 복사</button>
                  <button id="clearResult" class="btn-small">🗑️지우기</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 해시 생성 탭 -->
          <section class="tab-content" data-tab="hashing">
            <div class="section-header">
              <h2>🔗 해시 함수</h2>
              <p>SHA-256, SHA-512 등을 사용한 데이터 무결성 검증</p>
            </div>

            <div class="hash-controls">
              <div class="input-group">
                <label for="hashInput">해시할 데이터:</label>
                <textarea id="hashInput" placeholder="해시를 생성할 텍스트나 데이터를 입력하세요..." rows="4"></textarea>
              </div>

              <div class="algorithm-selector">
                <label>해시 알고리즘:</label>
                <div class="radio-group">
                  <label><input type="radio" name="hashAlgo" value="SHA-256" checked> SHA-256</label>
                  <label><input type="radio" name="hashAlgo" value="SHA-384"> SHA-384</label>
                  <label><input type="radio" name="hashAlgo" value="SHA-512"> SHA-512</label>
                  <label><input type="radio" name="hashAlgo" value="SHA-1"> SHA-1 (비추천)</label>
                </div>
              </div>

              <button id="generateHash" class="btn-primary">🔗 해시 생성</button>

              <div class="hash-results">
                <div class="result-item">
                  <label>해시 결과 (Hex):</label>
                  <div class="hash-output" id="hashOutputHex"></div>
                  <button class="copy-btn" data-target="hashOutputHex">📋</button>
                </div>
                <div class="result-item">
                  <label>해시 결과 (Base64):</label>
                  <div class="hash-output" id="hashOutputBase64"></div>
                  <button class="copy-btn" data-target="hashOutputBase64">📋</button>
                </div>
              </div>

              <div class="hash-tools">
                <h3>🔍 해시 검증 도구</h3>
                <div class="input-group">
                  <label for="verifyHash">검증할 해시값:</label>
                  <input type="text" id="verifyHash" placeholder="비교하고 싶은 해시값을 입력하세요">
                  <button id="verifyHashBtn" class="btn-accent">✓ 검증</button>
                </div>
                <div id="verifyResult" class="verify-result"></div>
              </div>
            </div>
          </section>

          <!-- 디지털 서명 탭 -->
          <section class="tab-content" data-tab="signatures">
            <div class="section-header">
              <h2>✍️ 디지털 서명 및 검증</h2>
              <p>RSA-PSS와 ECDSA를 사용한 메시지 인증</p>
            </div>

            <div class="signature-controls">
              <div class="key-generation">
                <h3>🗝️ 키 쌍 생성</h3>
                <div class="algo-selector">
                  <label>서명 알고리즘:</label>
                  <select id="signatureAlgo">
                    <option value="RSA-PSS">RSA-PSS (2048비트)</option>
                    <option value="ECDSA">ECDSA (P-256)</option>
                  </select>
                  <button id="generateKeyPair" class="btn-primary">🔑 키 쌍 생성</button>
                </div>
                <div id="keyPairStatus" class="key-status"></div>
              </div>

              <div class="signing-section">
                <h3>📝 메시지 서명</h3>
                <div class="input-group">
                  <label for="messageToSign">서명할 메시지:</label>
                  <textarea id="messageToSign" placeholder="서명하고 싶은 메시지를 입력하세요..." rows="3"></textarea>
                  <button id="signMessage" class="btn-accent">✍️ 서명 생성</button>
                </div>
                <div class="result-item">
                  <label>생성된 서명:</label>
                  <div class="signature-output" id="signatureOutput"></div>
                  <button class="copy-btn" data-target="signatureOutput">📋</button>
                </div>
              </div>

              <div class="verification-section">
                <h3>✅ 서명 검증</h3>
                <div class="input-group">
                  <label for="messageToVerify">원본 메시지:</label>
                  <textarea id="messageToVerify" placeholder="검증할 원본 메시지를 입력하세요..." rows="3"></textarea>
                </div>
                <div class="input-group">
                  <label for="signatureToVerify">검증할 서명:</label>
                  <textarea id="signatureToVerify" placeholder="검증할 서명을 입력하세요..." rows="2"></textarea>
                  <button id="verifySignature" class="btn-secondary">✓ 서명 검증</button>
                </div>
                <div id="verificationResult" class="verification-result"></div>
              </div>
            </div>
          </section>

          <!-- 키 관리 탭 -->
          <section class="tab-content" data-tab="keys">
            <div class="section-header">
              <h2>🗝️ 암호화 키 관리</h2>
              <p>키 생성, 내보내기, 가져오기 및 키 정보 관리</p>
            </div>

            <div class="key-management">
              <div class="key-generator">
                <h3>🔑 새 키 생성</h3>
                <div class="key-options">
                  <div class="option-group">
                    <label>키 타입:</label>
                    <select id="keyType">
                      <option value="AES">AES (대칭키)</option>
                      <option value="RSA">RSA (비대칭키)</option>
                      <option value="ECDSA">ECDSA (타원곡선)</option>
                    </select>
                  </div>
                  <div class="option-group">
                    <label>키 크기:</label>
                    <select id="keySize">
                      <option value="256">256비트</option>
                      <option value="512">512비트</option>
                      <option value="1024">1024비트</option>
                      <option value="2048">2048비트</option>
                      <option value="4096">4096비트</option>
                    </select>
                  </div>
                  <button id="generateNewKey" class="btn-primary">🔑 생성</button>
                </div>
              </div>

              <div class="key-storage">
                <h3>💾 저장된 키 목록</h3>
                <div id="keyList" class="key-list"></div>
                <div class="storage-actions">
                  <button id="exportKeys" class="btn-secondary">📤 키 내보내기</button>
                  <button id="importKeys" class="btn-secondary">📥 키 가져오기</button>
                  <input type="file" id="keyFileInput" accept=".json" style="display: none;">
                </div>
              </div>
            </div>
          </section>

          <!-- 패스워드 도구 탭 -->
          <section class="tab-content" data-tab="password">
            <div class="section-header">
              <h2>🔑 패스워드 보안 도구</h2>
              <p>안전한 패스워드 생성, 해싱, 검증 도구</p>
            </div>

            <div class="password-tools">
              <div class="password-generator">
                <h3>🎲 강력한 패스워드 생성</h3>
                <div class="generator-options">
                  <div class="option-row">
                    <label>길이: <span id="passwordLengthValue">16</span></label>
                    <input type="range" id="passwordLength" min="8" max="128" value="16">
                  </div>
                  <div class="checkbox-group">
                    <label><input type="checkbox" id="includeUppercase" checked> 대문자 (A-Z)</label>
                    <label><input type="checkbox" id="includeLowercase" checked> 소문자 (a-z)</label>
                    <label><input type="checkbox" id="includeNumbers" checked> 숫자 (0-9)</label>
                    <label><input type="checkbox" id="includeSymbols" checked> 특수문자 (!@#$%)</label>
                    <label><input type="checkbox" id="excludeSimilar"> 유사문자 제외 (0oO1lI)</label>
                  </div>
                  <button id="generatePassword" class="btn-primary">🎲 패스워드 생성</button>
                </div>
                <div class="password-result">
                  <div class="generated-password" id="generatedPassword"></div>
                  <div class="password-strength" id="passwordStrength"></div>
                  <div class="password-actions">
                    <button id="copyPassword" class="btn-small">📋 복사</button>
                    <button id="regeneratePassword" class="btn-small">🔄 다시생성</button>
                  </div>
                </div>
              </div>

              <div class="password-hasher">
                <h3>🔒 패스워드 해싱 (PBKDF2)</h3>
                <div class="input-group">
                  <label for="passwordToHash">해시할 패스워드:</label>
                  <input type="password" id="passwordToHash" placeholder="해시화할 패스워드 입력">
                  <button id="togglePasswordVisibility" class="btn-small">👁️</button>
                </div>
                <div class="input-group">
                  <label for="salt">솔트 (선택사항):</label>
                  <div class="salt-wrapper">
                    <input type="text" id="salt" placeholder="솔트 값 (비워두면 자동 생성)">
                    <button id="generateSalt" class="btn-small">🧂 생성</button>
                  </div>
                </div>
                <div class="hash-options">
                  <label>반복 횟수: <span id="iterationsValue">100000</span></label>
                  <input type="range" id="iterations" min="1000" max="1000000" value="100000" step="1000">
                </div>
                <button id="hashPassword" class="btn-accent">🔒 해시 생성</button>
                <div class="hash-result" id="passwordHashResult"></div>
              </div>

              <div class="password-checker">
                <h3>🔍 패스워드 강도 분석</h3>
                <div class="input-group">
                  <label for="passwordToCheck">분석할 패스워드:</label>
                  <input type="password" id="passwordToCheck" placeholder="강도를 확인할 패스워드 입력">
                  <button id="toggleCheckVisibility" class="btn-small">👁️</button>
                </div>
                <button id="analyzePassword" class="btn-secondary">🔍 분석</button>
                <div id="passwordAnalysis" class="password-analysis"></div>
              </div>
            </div>
          </section>

          <!-- 보안 저장소 탭 -->
          <section class="tab-content" data-tab="secure-storage">
            <div class="section-header">
              <h2>💾 암호화된 보안 저장소</h2>
              <p>IndexedDB를 활용한 클라이언트 사이드 암호화 저장소</p>
            </div>

            <div class="secure-storage">
              <div class="storage-auth">
                <h3>🔐 저장소 인증</h3>
                <div class="auth-section" id="authSection">
                  <div class="input-group">
                    <label for="masterPassword">마스터 패스워드:</label>
                    <input type="password" id="masterPassword" placeholder="저장소 액세스용 마스터 패스워드">
                    <button id="unlockStorage" class="btn-primary">🔓 잠금해제</button>
                  </div>
                  <div class="auth-actions">
                    <button id="createNewVault" class="btn-accent">🆕 새 저장소 생성</button>
                    <button id="resetVault" class="btn-danger">🗑️ 저장소 초기화</button>
                  </div>
                </div>
                <div id="storageStatus" class="storage-status"></div>
              </div>

              <div class="data-management" id="dataManagement" style="display: none;">
                <div class="add-data">
                  <h3>➕ 새 데이터 추가</h3>
                  <div class="input-group">
                    <label for="dataKey">키:</label>
                    <input type="text" id="dataKey" placeholder="데이터 키 (예: username, api-key)">
                  </div>
                  <div class="input-group">
                    <label for="dataValue">값:</label>
                    <textarea id="dataValue" placeholder="저장할 값" rows="3"></textarea>
                  </div>
                  <div class="input-group">
                    <label for="dataCategory">카테고리:</label>
                    <select id="dataCategory">
                      <option value="credential">로그인 정보</option>
                      <option value="api">API 키</option>
                      <option value="note">보안 메모</option>
                      <option value="card">카드 정보</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                  <button id="addSecureData" class="btn-primary">💾 암호화 저장</button>
                </div>

                <div class="stored-data">
                  <h3>📋 저장된 데이터</h3>
                  <div class="data-filters">
                    <select id="categoryFilter">
                      <option value="all">모든 카테고리</option>
                      <option value="credential">로그인 정보</option>
                      <option value="api">API 키</option>
                      <option value="note">보안 메모</option>
                      <option value="card">카드 정보</option>
                      <option value="other">기타</option>
                    </select>
                    <input type="text" id="searchData" placeholder="🔍 검색...">
                  </div>
                  <div id="dataList" class="data-list"></div>
                </div>

                <div class="storage-actions">
                  <button id="exportVault" class="btn-secondary">📤 데이터 내보내기</button>
                  <button id="importVault" class="btn-secondary">📥 데이터 가져오기</button>
                  <button id="lockStorage" class="btn-accent">🔒 저장소 잠금</button>
                  <input type="file" id="vaultFileInput" accept=".json" style="display: none;">
                </div>
              </div>
            </div>
          </section>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>

        <!-- 모달들 -->
        <div id="keyInfoModal" class="modal hidden">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3>🔑 키 정보</h3>
            <div id="keyInfoContent"></div>
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

    // 암호화/복호화 이벤트
    document
      .getElementById("generateKey")
      .addEventListener("click", () => this.generateSecureKey());
    document
      .getElementById("toggleKeyVisibility")
      .addEventListener("click", () =>
        this.togglePasswordVisibility("encryptionKey")
      );
    document
      .getElementById("encryptBtn")
      .addEventListener("click", () => this.encryptText());
    document
      .getElementById("decryptBtn")
      .addEventListener("click", () => this.decryptText());
    document
      .getElementById("copyResult")
      .addEventListener("click", () =>
        this.copyToClipboard("encryptionResult")
      );
    document
      .getElementById("clearResult")
      .addEventListener("click", () => this.clearResult());

    // 해시 이벤트
    document
      .getElementById("generateHash")
      .addEventListener("click", () => this.generateHash());
    document
      .getElementById("verifyHashBtn")
      .addEventListener("click", () => this.verifyHash());
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.copyToClipboard(e.target.dataset.target)
      );
    });

    // 디지털 서명 이벤트
    document
      .getElementById("generateKeyPair")
      .addEventListener("click", () => this.generateSignatureKeyPair());
    document
      .getElementById("signMessage")
      .addEventListener("click", () => this.signMessage());
    document
      .getElementById("verifySignature")
      .addEventListener("click", () => this.verifySignature());

    // 키 관리 이벤트
    document
      .getElementById("generateNewKey")
      .addEventListener("click", () => this.generateNewKey());
    document
      .getElementById("exportKeys")
      .addEventListener("click", () => this.exportKeys());
    document
      .getElementById("importKeys")
      .addEventListener("click", () => this.importKeys());
    document
      .getElementById("keyFileInput")
      .addEventListener("change", (e) => this.handleKeyFileImport(e));

    // 패스워드 도구 이벤트
    document.getElementById("passwordLength").addEventListener("input", (e) => {
      document.getElementById("passwordLengthValue").textContent =
        e.target.value;
    });
    document
      .getElementById("generatePassword")
      .addEventListener("click", () => this.generateSecurePassword());
    document
      .getElementById("copyPassword")
      .addEventListener("click", () =>
        this.copyToClipboard("generatedPassword")
      );
    document
      .getElementById("regeneratePassword")
      .addEventListener("click", () => this.generateSecurePassword());
    document
      .getElementById("togglePasswordVisibility")
      .addEventListener("click", () =>
        this.togglePasswordVisibility("passwordToHash")
      );
    document
      .getElementById("generateSalt")
      .addEventListener("click", () => this.generateSalt());
    document.getElementById("iterations").addEventListener("input", (e) => {
      document.getElementById("iterationsValue").textContent = e.target.value;
    });
    document
      .getElementById("hashPassword")
      .addEventListener("click", () => this.hashPasswordPBKDF2());
    document
      .getElementById("toggleCheckVisibility")
      .addEventListener("click", () =>
        this.togglePasswordVisibility("passwordToCheck")
      );
    document
      .getElementById("analyzePassword")
      .addEventListener("click", () => this.analyzePasswordStrength());

    // 보안 저장소 이벤트
    document
      .getElementById("unlockStorage")
      .addEventListener("click", () => this.unlockSecureStorage());
    document
      .getElementById("createNewVault")
      .addEventListener("click", () => this.createNewVault());
    document
      .getElementById("resetVault")
      .addEventListener("click", () => this.resetVault());
    document
      .getElementById("addSecureData")
      .addEventListener("click", () => this.addSecureData());
    document
      .getElementById("categoryFilter")
      .addEventListener("change", () => this.filterStoredData());
    document
      .getElementById("searchData")
      .addEventListener("input", () => this.filterStoredData());
    document
      .getElementById("exportVault")
      .addEventListener("click", () => this.exportVault());
    document
      .getElementById("importVault")
      .addEventListener("click", () => this.importVault());
    document
      .getElementById("lockStorage")
      .addEventListener("click", () => this.lockStorage());
    document
      .getElementById("vaultFileInput")
      .addEventListener("change", (e) => this.handleVaultFileImport(e));

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
  }

  // 기본 기능들
  checkCryptoSupport() {
    const statusIndicator = document.getElementById("statusIndicator");
    const statusText = document.getElementById("statusText");

    if (!window.crypto || !window.crypto.subtle) {
      statusIndicator.textContent = "❌";
      statusIndicator.className = "status-indicator error";
      statusText.textContent =
        "Web Crypto API가 지원되지 않습니다. HTTPS 환경에서 실행해주세요.";
      this.showNotification("Web Crypto API를 사용할 수 없습니다.", "error");
      return false;
    }

    statusIndicator.textContent = "✅";
    statusIndicator.className = "status-indicator success";
    statusText.textContent = "Web Crypto API가 정상적으로 지원됩니다.";
    this.showNotification("Web Crypto API 지원 확인됨", "success");
    return true;
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

  // === 암호화/복호화 기능 ===
  generateSecureKey() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let key = "";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("encryptionKey").value = key;
    this.showNotification("보안 키가 생성되었습니다", "success");
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const type = input.type === "password" ? "text" : "password";
    input.type = type;
  }

  async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async encryptText() {
    try {
      const password = document.getElementById("encryptionKey").value;
      const plaintext = document.getElementById("plaintextInput").value;

      if (!password || password.length < 8) {
        this.showNotification(
          "암호화 키는 최소 8글자 이상이어야 합니다",
          "warning"
        );
        return;
      }

      if (!plaintext) {
        this.showNotification("암호화할 텍스트를 입력하세요", "warning");
        return;
      }

      // 솔트와 IV 생성
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // 키 유도
      const key = await this.deriveKey(password, salt);

      // 암호화
      const encoder = new TextEncoder();
      const encodedText = encoder.encode(plaintext);
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedText
      );

      // 결과를 Base64로 인코딩
      const encryptedArray = new Uint8Array(encrypted);
      const result = {
        encrypted: this.arrayBufferToBase64(encryptedArray),
        salt: this.arrayBufferToBase64(salt),
        iv: this.arrayBufferToBase64(iv),
      };

      const resultString = JSON.stringify(result, null, 2);
      document.getElementById("encryptionResult").innerHTML = `
        <div class="result-success">
          <h4>✅ 암호화 성공</h4>
          <pre>${resultString}</pre>
          <div class="result-info">
            <p><strong>알고리즘:</strong> AES-GCM</p>
            <p><strong>키 길이:</strong> 256비트</p>
            <p><strong>원본 크기:</strong> ${plaintext.length} 글자</p>
            <p><strong>암호문 크기:</strong> ${result.encrypted.length} 글자</p>
          </div>
        </div>
      `;

      document.getElementById("ciphertextInput").value = resultString;
      this.showNotification("텍스트가 성공적으로 암호화되었습니다", "success");
    } catch (error) {
      console.error("암호화 오류:", error);
      document.getElementById("encryptionResult").innerHTML = `
        <div class="result-error">
          <h4>❌ 암호화 실패</h4>
          <p>${error.message}</p>
        </div>
      `;
      this.showNotification("암호화 중 오류가 발생했습니다", "error");
    }
  }

  async decryptText() {
    try {
      const password = document.getElementById("encryptionKey").value;
      const ciphertextInput = document.getElementById("ciphertextInput").value;

      if (!password) {
        this.showNotification("복호화 키를 입력하세요", "warning");
        return;
      }

      if (!ciphertextInput) {
        this.showNotification("복호화할 암호문을 입력하세요", "warning");
        return;
      }

      // JSON 파싱
      const data = JSON.parse(ciphertextInput);
      const encrypted = this.base64ToArrayBuffer(data.encrypted);
      const salt = this.base64ToArrayBuffer(data.salt);
      const iv = this.base64ToArrayBuffer(data.iv);

      // 키 유도
      const key = await this.deriveKey(password, salt);

      // 복호화
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const plaintext = decoder.decode(decrypted);

      document.getElementById("encryptionResult").innerHTML = `
        <div class="result-success">
          <h4>🔓 복호화 성공</h4>
          <div class="decrypted-text">
            <h5>복호화된 텍스트:</h5>
            <pre>${plaintext}</pre>
          </div>
          <div class="result-info">
            <p><strong>복호화된 크기:</strong> ${plaintext.length} 글자</p>
          </div>
        </div>
      `;

      document.getElementById("plaintextInput").value = plaintext;
      this.showNotification("텍스트가 성공적으로 복호화되었습니다", "success");
    } catch (error) {
      console.error("복호화 오류:", error);
      document.getElementById("encryptionResult").innerHTML = `
        <div class="result-error">
          <h4>❌ 복호화 실패</h4>
          <p>잘못된 키이거나 손상된 암호문입니다.</p>
          <details>
            <summary>오류 상세</summary>
            <pre>${error.message}</pre>
          </details>
        </div>
      `;
      this.showNotification("복호화 중 오류가 발생했습니다", "error");
    }
  }

  // === 해시 기능 ===
  async generateHash() {
    try {
      const input = document.getElementById("hashInput").value;
      const algorithm = document.querySelector(
        'input[name="hashAlgo"]:checked'
      ).value;

      if (!input) {
        this.showNotification("해시할 데이터를 입력하세요", "warning");
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);

      const hashArray = new Uint8Array(hashBuffer);
      const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const hashBase64 = this.arrayBufferToBase64(hashArray);

      document.getElementById("hashOutputHex").textContent = hashHex;
      document.getElementById("hashOutputBase64").textContent = hashBase64;

      this.showNotification(`${algorithm} 해시가 생성되었습니다`, "success");
    } catch (error) {
      console.error("해시 생성 오류:", error);
      this.showNotification("해시 생성 중 오류가 발생했습니다", "error");
    }
  }

  async verifyHash() {
    try {
      const input = document.getElementById("hashInput").value;
      const verifyHash = document.getElementById("verifyHash").value;
      const algorithm = document.querySelector(
        'input[name="hashAlgo"]:checked'
      ).value;

      if (!input || !verifyHash) {
        this.showNotification(
          "원본 데이터와 검증할 해시를 모두 입력하세요",
          "warning"
        );
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = new Uint8Array(hashBuffer);
      const computedHash = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const isMatch = computedHash.toLowerCase() === verifyHash.toLowerCase();
      const resultDiv = document.getElementById("verifyResult");

      if (isMatch) {
        resultDiv.innerHTML = `
          <div class="verify-success">
            <h4>✅ 해시 검증 성공</h4>
            <p>입력된 데이터와 해시값이 일치합니다.</p>
          </div>
        `;
        this.showNotification("해시 검증에 성공했습니다", "success");
      } else {
        resultDiv.innerHTML = `
          <div class="verify-failure">
            <h4>❌ 해시 검증 실패</h4>
            <p>입력된 데이터와 해시값이 일치하지 않습니다.</p>
            <details>
              <summary>비교 결과</summary>
              <p><strong>계산된 해시:</strong> ${computedHash}</p>
              <p><strong>입력된 해시:</strong> ${verifyHash}</p>
            </details>
          </div>
        `;
        this.showNotification("해시 검증에 실패했습니다", "error");
      }
    } catch (error) {
      console.error("해시 검증 오류:", error);
      this.showNotification("해시 검증 중 오류가 발생했습니다", "error");
    }
  }

  // === 유틸리티 함수들 ===
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
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

  clearResult() {
    document.getElementById("encryptionResult").innerHTML = "";
    document.getElementById("plaintextInput").value = "";
    document.getElementById("ciphertextInput").value = "";
  }

  closeModal(modal) {
    modal.classList.add("hidden");
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "e":
          e.preventDefault();
          this.encryptText();
          break;
        case "d":
          e.preventDefault();
          this.decryptText();
          break;
        case "h":
          e.preventDefault();
          this.generateHash();
          break;
      }
    }
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new WebCryptoAPI();
});
