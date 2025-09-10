import "./style.css";

/**
 * File System Access API 데모 클래스
 * 파일/디렉토리 읽기, 쓰기, 생성, 수정 등의 파일 시스템 접근 기능을 구현
 */
class FileSystemAccessAPI {
  constructor() {
    this.currentFileHandle = null;
    this.currentDirectoryHandle = null;
    this.fileHistory = [];
    this.recentFiles = [];
    this.settings = {
      autoSave: false,
      showHiddenFiles: false,
      confirmBeforeExit: true,
      syntaxHighlighting: true,
      autoBackup: true,
      maxRecentFiles: 10,
    };

    this.init();
  }

  init() {
    this.createHTML();
    this.setupEventListeners();
    this.loadSettings();
    this.updateUI();
    this.checkSupport();
    console.log("📁 File System Access API initialized!");
  }

  createHTML() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="file-system-container">
        <!-- 헤더 -->
        <header class="header">
          <h1>📁 File System Access API</h1>
          <p>로컬 파일 시스템에 직접 접근하여 파일 읽기/쓰기</p>
        </header>

        <!-- 지원 상태 -->
        <div class="support-status" id="supportStatus">
          <div class="status-icon">🔍</div>
          <div class="status-text">API 지원 여부 확인 중...</div>
        </div>

        <!-- 메인 툴바 -->
        <div class="main-toolbar">
          <div class="toolbar-group">
            <button id="openFile" class="btn btn-primary">
              📄 파일 열기
            </button>
            <button id="openDirectory" class="btn btn-primary">
              📁 폴더 열기
            </button>
            <button id="newFile" class="btn btn-accent">
              ➕ 새 파일
            </button>
            <button id="saveFile" class="btn btn-success" disabled>
              💾 저장
            </button>
            <button id="saveAsFile" class="btn btn-secondary" disabled>
              📝 다른 이름으로 저장
            </button>
          </div>
          <div class="toolbar-group">
            <button id="downloadFile" class="btn btn-info" disabled>
              ⬇️ 다운로드
            </button>
            <button id="shareFile" class="btn btn-accent" disabled>
              🔗 공유
            </button>
          </div>
        </div>

        <!-- 메인 컨텐츠 영역 -->
        <div class="main-content">
          <!-- 사이드바: 디렉토리 트리 -->
          <div class="sidebar">
            <div class="sidebar-header">
              <h3>📂 파일 탐색기</h3>
              <button id="refreshDirectory" class="btn-icon" title="새로고침">
                🔄
              </button>
            </div>
            <div id="directoryTree" class="directory-tree">
              <div class="empty-state">
                <p>📁 폴더를 열어보세요</p>
              </div>
            </div>
          </div>

          <!-- 메인 에디터 -->
          <div class="editor-area">
            <div class="editor-header">
              <div class="file-tabs" id="fileTabs">
                <!-- 열린 파일 탭들 -->
              </div>
              <div class="editor-controls">
                <button id="formatCode" class="btn-small" disabled>
                  🎨 포맷
                </button>
                <button id="findReplace" class="btn-small" disabled>
                  🔍 찾기
                </button>
                <select id="languageSelect" disabled>
                  <option value="text">텍스트</option>
                  <option value="javascript">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
            </div>
            
            <div class="editor-content">
              <textarea id="fileEditor" placeholder="파일을 열거나 새 파일을 만들어보세요..."></textarea>
              <div id="previewArea" class="preview-area hidden">
                <!-- 이미지/미디어 미리보기 -->
              </div>
            </div>

            <div class="editor-status">
              <div class="status-left">
                <span id="currentFile">파일 없음</span>
                <span id="fileSize">0 bytes</span>
                <span id="lastModified">-</span>
              </div>
              <div class="status-right">
                <span id="cursorPosition">Line 1, Col 1</span>
                <span id="charCount">0 chars</span>
                <span id="wordCount">0 words</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 최근 파일 -->
        <div class="recent-files">
          <h2>📋 최근 파일</h2>
          <div id="recentFilesList" class="recent-files-list">
            <div class="empty-state">
              <p>최근 열었던 파일이 없습니다</p>
            </div>
          </div>
          <button id="clearRecentFiles" class="btn btn-secondary">
            🗑️ 기록 삭제
          </button>
        </div>

        <!-- 파일 정보 패널 -->
        <div class="file-info-panel">
          <h2>📊 파일 정보</h2>
          <div id="fileInfoContent" class="file-info-content">
            <div class="info-item">
              <span class="info-label">파일명:</span>
              <span id="infoFileName">-</span>
            </div>
            <div class="info-item">
              <span class="info-label">크기:</span>
              <span id="infoFileSize">-</span>
            </div>
            <div class="info-item">
              <span class="info-label">타입:</span>
              <span id="infoFileType">-</span>
            </div>
            <div class="info-item">
              <span class="info-label">수정일:</span>
              <span id="infoLastModified">-</span>
            </div>
            <div class="info-item">
              <span class="info-label">권한:</span>
              <span id="infoPermissions">-</span>
            </div>
          </div>
        </div>

        <!-- 설정 패널 -->
        <div class="settings-panel">
          <h2>⚙️ 설정</h2>
          <div class="settings-grid">
            <label class="setting-item">
              <input type="checkbox" id="autoSave">
              <span>자동 저장</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="showHiddenFiles">
              <span>숨김 파일 표시</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="confirmBeforeExit">
              <span>종료 전 확인</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="syntaxHighlighting">
              <span>구문 강조</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="autoBackup">
              <span>자동 백업</span>
            </label>
          </div>
          <div class="setting-item">
            <label for="maxRecentFiles">최근 파일 개수: <span id="maxRecentValue">10</span></label>
            <input type="range" id="maxRecentFiles" min="5" max="50" value="10" step="5">
          </div>
        </div>

        <!-- 권한 관리 -->
        <div class="permissions-panel">
          <h2>🔐 권한 관리</h2>
          <div class="permissions-list" id="permissionsList">
            <div class="permission-item">
              <div class="permission-info">
                <h4>파일 시스템 접근</h4>
                <p>로컬 파일을 읽고 쓸 수 있는 권한</p>
              </div>
              <div class="permission-status" id="fileSystemPermission">
                확인 중...
              </div>
            </div>
          </div>
          <button id="requestPermissions" class="btn btn-primary">
            🔓 권한 요청
          </button>
        </div>

        <!-- 파일 작업 히스토리 -->
        <div class="history-panel">
          <h2>📝 작업 히스토리</h2>
          <div id="historyList" class="history-list">
            <div class="empty-state">
              <p>아직 작업 기록이 없습니다</p>
            </div>
          </div>
          <button id="clearHistory" class="btn btn-secondary">
            🗑️ 히스토리 삭제
          </button>
        </div>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>

        <!-- 찾기/바꾸기 모달 -->
        <div id="findReplaceModal" class="modal hidden">
          <div class="modal-content">
            <div class="modal-header">
              <h3>🔍 찾기 및 바꾸기</h3>
              <button class="modal-close" id="closeFindReplace">×</button>
            </div>
            <div class="modal-body">
              <div class="find-replace-form">
                <div class="form-group">
                  <label for="findText">찾을 텍스트:</label>
                  <input type="text" id="findText" placeholder="찾을 내용을 입력하세요">
                </div>
                <div class="form-group">
                  <label for="replaceText">바꿀 텍스트:</label>
                  <input type="text" id="replaceText" placeholder="바꿀 내용을 입력하세요">
                </div>
                <div class="form-options">
                  <label>
                    <input type="checkbox" id="caseSensitive">
                    대소문자 구분
                  </label>
                  <label>
                    <input type="checkbox" id="wholeWords">
                    단어 단위
                  </label>
                  <label>
                    <input type="checkbox" id="useRegex">
                    정규식 사용
                  </label>
                </div>
                <div class="form-actions">
                  <button id="findNext" class="btn btn-primary">다음 찾기</button>
                  <button id="findPrevious" class="btn btn-secondary">이전 찾기</button>
                  <button id="replaceOne" class="btn btn-accent">바꾸기</button>
                  <button id="replaceAll" class="btn btn-warning">모두 바꾸기</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 로딩 오버레이 -->
        <div id="loadingOverlay" class="loading-overlay hidden">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>파일을 처리하는 중...</p>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // 파일 작업
    document
      .getElementById("openFile")
      .addEventListener("click", () => this.openFile());
    document
      .getElementById("openDirectory")
      .addEventListener("click", () => this.openDirectory());
    document
      .getElementById("newFile")
      .addEventListener("click", () => this.newFile());
    document
      .getElementById("saveFile")
      .addEventListener("click", () => this.saveFile());
    document
      .getElementById("saveAsFile")
      .addEventListener("click", () => this.saveAsFile());
    document
      .getElementById("downloadFile")
      .addEventListener("click", () => this.downloadFile());
    document
      .getElementById("shareFile")
      .addEventListener("click", () => this.shareFile());

    // 에디터 관련
    const editor = document.getElementById("fileEditor");
    editor.addEventListener("input", () => this.handleEditorChange());
    editor.addEventListener("selectionchange", () =>
      this.updateCursorPosition()
    );
    editor.addEventListener("scroll", () => this.updateCursorPosition());

    // 툴바
    document
      .getElementById("formatCode")
      .addEventListener("click", () => this.formatCode());
    document
      .getElementById("findReplace")
      .addEventListener("click", () => this.showFindReplace());
    document
      .getElementById("languageSelect")
      .addEventListener("change", (e) => this.changeLanguage(e.target.value));

    // 디렉토리 관련
    document
      .getElementById("refreshDirectory")
      .addEventListener("click", () => this.refreshDirectory());

    // 설정
    document
      .getElementById("autoSave")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("showHiddenFiles")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("confirmBeforeExit")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("syntaxHighlighting")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("autoBackup")
      .addEventListener("change", () => this.saveSettings());
    document.getElementById("maxRecentFiles").addEventListener("input", (e) => {
      document.getElementById("maxRecentValue").textContent = e.target.value;
      this.saveSettings();
    });

    // 권한 관련
    document
      .getElementById("requestPermissions")
      .addEventListener("click", () => this.requestPermissions());

    // 히스토리
    document
      .getElementById("clearHistory")
      .addEventListener("click", () => this.clearHistory());
    document
      .getElementById("clearRecentFiles")
      .addEventListener("click", () => this.clearRecentFiles());

    // 찾기/바꾸기
    document
      .getElementById("closeFindReplace")
      .addEventListener("click", () => this.hideFindReplace());
    document
      .getElementById("findNext")
      .addEventListener("click", () => this.findNext());
    document
      .getElementById("findPrevious")
      .addEventListener("click", () => this.findPrevious());
    document
      .getElementById("replaceOne")
      .addEventListener("click", () => this.replaceOne());
    document
      .getElementById("replaceAll")
      .addEventListener("click", () => this.replaceAll());

    // 키보드 단축키
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // 파일 드래그 앤 드롭
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => this.handleDrop(e));

    // 페이지 종료 전 확인
    window.addEventListener("beforeunload", (e) => this.handleBeforeUnload(e));
  }

  // API 지원 여부 확인
  checkSupport() {
    const supported =
      "showOpenFilePicker" in window &&
      "showSaveFilePicker" in window &&
      "showDirectoryPicker" in window;
    const statusElement = document.getElementById("supportStatus");

    if (supported) {
      statusElement.innerHTML = `
        <div class="status-icon">✅</div>
        <div class="status-text">File System Access API 완전 지원</div>
      `;
      statusElement.className = "support-status supported";
    } else {
      statusElement.innerHTML = `
        <div class="status-icon">⚠️</div>
        <div class="status-text">File System Access API 미지원 (폴백 기능 사용)</div>
      `;
      statusElement.className = "support-status not-supported";
    }

    return supported;
  }

  // 파일 열기
  async openFile() {
    try {
      this.showLoading("파일을 여는 중...");

      if ("showOpenFilePicker" in window) {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: "All files",
              accept: {
                "*/*": [],
              },
            },
          ],
          multiple: false,
        });

        const file = await fileHandle.getFile();
        await this.loadFile(file, fileHandle);
      } else {
        // 폴백: 기존 input file 방식
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = async (e) => {
          if (e.target.files[0]) {
            await this.loadFile(e.target.files[0]);
          }
        };
        input.click();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error opening file:", error);
        this.showNotification(`파일 열기 실패: ${error.message}`, "error");
      }
    } finally {
      this.hideLoading();
    }
  }

  // 디렉토리 열기
  async openDirectory() {
    try {
      this.showLoading("폴더를 여는 중...");

      if ("showDirectoryPicker" in window) {
        const directoryHandle = await window.showDirectoryPicker();
        this.currentDirectoryHandle = directoryHandle;
        await this.loadDirectoryTree(directoryHandle);
      } else {
        this.showNotification(
          "디렉토리 선택은 File System Access API가 필요합니다.",
          "warning"
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error opening directory:", error);
        this.showNotification(`폴더 열기 실패: ${error.message}`, "error");
      }
    } finally {
      this.hideLoading();
    }
  }

  // 파일 로드
  async loadFile(file, fileHandle = null) {
    try {
      this.currentFileHandle = fileHandle;

      // 파일 내용 읽기
      const content = await this.readFileContent(file);

      // 에디터에 내용 로드
      document.getElementById("fileEditor").value = content;

      // 파일 정보 업데이트
      this.updateFileInfo(file);

      // 언어 감지 및 설정
      this.detectAndSetLanguage(file.name);

      // 최근 파일에 추가
      this.addToRecentFiles(file, fileHandle);

      // 히스토리에 추가
      this.addToHistory("열기", file.name);

      // UI 업데이트
      this.updateUI();

      this.showNotification(`파일 "${file.name}"을(를) 열었습니다.`, "success");
    } catch (error) {
      console.error("Error loading file:", error);
      this.showNotification(`파일 로드 실패: ${error.message}`, "error");
    }
  }

  // 파일 내용 읽기
  async readFileContent(file) {
    if (file.type.startsWith("image/")) {
      return this.loadImagePreview(file);
    } else if (
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/")
    ) {
      return this.loadMediaPreview(file);
    } else {
      return await file.text();
    }
  }

  // 이미지 미리보기
  async loadImagePreview(file) {
    const url = URL.createObjectURL(file);
    const previewArea = document.getElementById("previewArea");
    const editor = document.getElementById("fileEditor");

    previewArea.innerHTML = `
      <div class="image-preview">
        <img src="${url}" alt="${
      file.name
    }" onload="URL.revokeObjectURL(this.src)">
        <div class="image-info">
          <p><strong>파일명:</strong> ${file.name}</p>
          <p><strong>크기:</strong> ${this.formatFileSize(file.size)}</p>
          <p><strong>타입:</strong> ${file.type}</p>
        </div>
      </div>
    `;

    previewArea.classList.remove("hidden");
    editor.classList.add("hidden");

    return `이미지 파일: ${file.name}\n크기: ${this.formatFileSize(
      file.size
    )}\n타입: ${file.type}`;
  }

  // 미디어 미리보기
  async loadMediaPreview(file) {
    const url = URL.createObjectURL(file);
    const previewArea = document.getElementById("previewArea");
    const editor = document.getElementById("fileEditor");

    const mediaTag = file.type.startsWith("video/") ? "video" : "audio";

    previewArea.innerHTML = `
      <div class="media-preview">
        <${mediaTag} src="${url}" controls onloadeddata="URL.revokeObjectURL(this.src)">
          Your browser does not support the ${mediaTag} element.
        </${mediaTag}>
        <div class="media-info">
          <p><strong>파일명:</strong> ${file.name}</p>
          <p><strong>크기:</strong> ${this.formatFileSize(file.size)}</p>
          <p><strong>타입:</strong> ${file.type}</p>
        </div>
      </div>
    `;

    previewArea.classList.remove("hidden");
    editor.classList.add("hidden");

    return `미디어 파일: ${file.name}\n크기: ${this.formatFileSize(
      file.size
    )}\n타입: ${file.type}`;
  }

  // 새 파일
  newFile() {
    document.getElementById("fileEditor").value = "";
    document.getElementById("previewArea").classList.add("hidden");
    document.getElementById("fileEditor").classList.remove("hidden");

    this.currentFileHandle = null;
    this.updateFileInfo(null);
    this.updateUI();

    this.showNotification("새 파일을 만들었습니다.", "info");
  }

  // 파일 저장
  async saveFile() {
    if (!this.currentFileHandle) {
      return this.saveAsFile();
    }

    try {
      this.showLoading("파일을 저장하는 중...");

      const content = document.getElementById("fileEditor").value;
      const writable = await this.currentFileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      this.addToHistory("저장", this.currentFileHandle.name);
      this.showNotification("파일이 저장되었습니다.", "success");
    } catch (error) {
      console.error("Error saving file:", error);
      this.showNotification(`파일 저장 실패: ${error.message}`, "error");
    } finally {
      this.hideLoading();
    }
  }

  // 다른 이름으로 저장
  async saveAsFile() {
    try {
      this.showLoading("파일을 저장하는 중...");

      if ("showSaveFilePicker" in window) {
        const fileHandle = await window.showSaveFilePicker({
          types: [
            {
              description: "Text files",
              accept: {
                "text/plain": [".txt"],
                "text/javascript": [".js"],
                "text/css": [".css"],
                "text/html": [".html"],
                "application/json": [".json"],
              },
            },
          ],
        });

        const content = document.getElementById("fileEditor").value;
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();

        this.currentFileHandle = fileHandle;
        this.addToHistory("저장", fileHandle.name);
        this.updateUI();

        this.showNotification(
          `파일 "${fileHandle.name}"이(가) 저장되었습니다.`,
          "success"
        );
      } else {
        // 폴백: 다운로드 방식
        this.downloadFile();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error saving file:", error);
        this.showNotification(`파일 저장 실패: ${error.message}`, "error");
      }
    } finally {
      this.hideLoading();
    }
  }

  // 파일 다운로드
  downloadFile() {
    const content = document.getElementById("fileEditor").value;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = this.currentFileHandle?.name || "untitled.txt";
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification("파일이 다운로드되었습니다.", "success");
  }

  // 파일 공유
  async shareFile() {
    if (!navigator.share) {
      this.showNotification("공유 기능이 지원되지 않습니다.", "warning");
      return;
    }

    try {
      const content = document.getElementById("fileEditor").value;
      const blob = new Blob([content], { type: "text/plain" });
      const file = new File(
        [blob],
        this.currentFileHandle?.name || "shared-file.txt",
        { type: "text/plain" }
      );

      await navigator.share({
        title: "파일 공유",
        text: "파일을 공유합니다.",
        files: [file],
      });

      this.showNotification("파일이 공유되었습니다.", "success");
    } catch (error) {
      console.error("Error sharing file:", error);
      this.showNotification(`공유 실패: ${error.message}`, "error");
    }
  }

  // 디렉토리 트리 로드
  async loadDirectoryTree(directoryHandle) {
    const treeContainer = document.getElementById("directoryTree");
    treeContainer.innerHTML = "";

    const tree = await this.buildDirectoryTree(directoryHandle);
    treeContainer.appendChild(tree);
  }

  // 디렉토리 트리 구축
  async buildDirectoryTree(directoryHandle, level = 0) {
    const container = document.createElement("div");
    container.className = "directory-node";
    container.style.paddingLeft = `${level * 20}px`;

    const header = document.createElement("div");
    header.className = "directory-header";
    header.innerHTML = `
      <span class="directory-icon">📁</span>
      <span class="directory-name">${directoryHandle.name}</span>
      <button class="expand-btn">▼</button>
    `;

    const content = document.createElement("div");
    content.className = "directory-content";
    content.style.display = level === 0 ? "block" : "none";

    try {
      for await (const [name, handle] of directoryHandle.entries()) {
        if (handle.kind === "directory") {
          if (this.settings.showHiddenFiles || !name.startsWith(".")) {
            const subTree = await this.buildDirectoryTree(handle, level + 1);
            content.appendChild(subTree);
          }
        } else {
          if (this.settings.showHiddenFiles || !name.startsWith(".")) {
            const fileNode = this.createFileNode(name, handle, level + 1);
            content.appendChild(fileNode);
          }
        }
      }
    } catch (error) {
      console.error("Error reading directory:", error);
    }

    // 토글 기능
    header.querySelector(".expand-btn").addEventListener("click", () => {
      const isExpanded = content.style.display === "block";
      content.style.display = isExpanded ? "none" : "block";
      header.querySelector(".expand-btn").textContent = isExpanded ? "▶" : "▼";
    });

    container.appendChild(header);
    container.appendChild(content);

    return container;
  }

  // 파일 노드 생성
  createFileNode(name, fileHandle, level) {
    const node = document.createElement("div");
    node.className = "file-node";
    node.style.paddingLeft = `${level * 20}px`;

    const icon = this.getFileIcon(name);
    node.innerHTML = `
      <span class="file-icon">${icon}</span>
      <span class="file-name">${name}</span>
    `;

    node.addEventListener("click", async () => {
      try {
        const file = await fileHandle.getFile();
        await this.loadFile(file, fileHandle);
      } catch (error) {
        console.error("Error opening file from tree:", error);
        this.showNotification(`파일 열기 실패: ${error.message}`, "error");
      }
    });

    return node;
  }

  // 파일 아이콘 가져오기
  getFileIcon(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    const iconMap = {
      js: "📜",
      css: "🎨",
      html: "🌐",
      json: "📋",
      md: "📝",
      txt: "📄",
      pdf: "📕",
      img: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      svg: "🖼️",
      mp4: "🎬",
      mp3: "🎵",
      wav: "🎵",
      zip: "🗜️",
      rar: "🗜️",
    };

    return iconMap[ext] || "📄";
  }

  // 언어 감지 및 설정
  detectAndSetLanguage(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap = {
      js: "javascript",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
    };

    const language = languageMap[ext] || "text";
    document.getElementById("languageSelect").value = language;
    this.changeLanguage(language);
  }

  // 언어 변경
  changeLanguage(language) {
    const editor = document.getElementById("fileEditor");
    editor.className = `language-${language}`;

    if (this.settings.syntaxHighlighting) {
      // 간단한 구문 강조 (실제 프로젝트에서는 CodeMirror, Monaco Editor 등 사용)
      this.applySyntaxHighlighting(language);
    }
  }

  // 간단한 구문 강조
  applySyntaxHighlighting(language) {
    // 실제 구현에서는 더 정교한 구문 강조 라이브러리를 사용하세요
    console.log(`Syntax highlighting applied for ${language}`);
  }

  // 에디터 변경 핸들러
  handleEditorChange() {
    this.updateWordCount();
    this.updateCharCount();

    if (this.settings.autoSave && this.currentFileHandle) {
      // 디바운스된 자동 저장
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => this.saveFile(), 2000);
    }
  }

  // 커서 위치 업데이트
  updateCursorPosition() {
    const editor = document.getElementById("fileEditor");
    const text = editor.value;
    const position = editor.selectionStart;

    const lines = text.substring(0, position).split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    document.getElementById(
      "cursorPosition"
    ).textContent = `Line ${line}, Col ${col}`;
  }

  // 단어 수 업데이트
  updateWordCount() {
    const text = document.getElementById("fileEditor").value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById("wordCount").textContent = `${words} words`;
  }

  // 문자 수 업데이트
  updateCharCount() {
    const text = document.getElementById("fileEditor").value;
    document.getElementById("charCount").textContent = `${text.length} chars`;
  }

  // 파일 정보 업데이트
  updateFileInfo(file) {
    if (file) {
      document.getElementById("currentFile").textContent = file.name;
      document.getElementById("fileSize").textContent = this.formatFileSize(
        file.size
      );
      document.getElementById("lastModified").textContent = new Date(
        file.lastModified
      ).toLocaleString();

      // 상세 정보
      document.getElementById("infoFileName").textContent = file.name;
      document.getElementById("infoFileSize").textContent = this.formatFileSize(
        file.size
      );
      document.getElementById("infoFileType").textContent =
        file.type || "Unknown";
      document.getElementById("infoLastModified").textContent = new Date(
        file.lastModified
      ).toLocaleString();
      document.getElementById("infoPermissions").textContent = this
        .currentFileHandle
        ? "Read/Write"
        : "Read Only";
    } else {
      document.getElementById("currentFile").textContent = "파일 없음";
      document.getElementById("fileSize").textContent = "0 bytes";
      document.getElementById("lastModified").textContent = "-";

      // 상세 정보 초기화
      document.getElementById("infoFileName").textContent = "-";
      document.getElementById("infoFileSize").textContent = "-";
      document.getElementById("infoFileType").textContent = "-";
      document.getElementById("infoLastModified").textContent = "-";
      document.getElementById("infoPermissions").textContent = "-";
    }
  }

  // 파일 크기 포맷
  formatFileSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // 최근 파일에 추가
  addToRecentFiles(file, fileHandle) {
    const recentFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      handle: fileHandle,
      timestamp: Date.now(),
    };

    // 중복 제거
    this.recentFiles = this.recentFiles.filter((f) => f.name !== file.name);
    this.recentFiles.unshift(recentFile);

    // 최대 개수 제한
    if (this.recentFiles.length > this.settings.maxRecentFiles) {
      this.recentFiles = this.recentFiles.slice(
        0,
        this.settings.maxRecentFiles
      );
    }

    this.updateRecentFilesList();
    this.saveRecentFiles();
  }

  // 최근 파일 목록 업데이트
  updateRecentFilesList() {
    const container = document.getElementById("recentFilesList");

    if (this.recentFiles.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><p>최근 열었던 파일이 없습니다</p></div>';
      return;
    }

    container.innerHTML = this.recentFiles
      .map(
        (file) => `
      <div class="recent-file-item" data-file-name="${file.name}">
        <div class="recent-file-icon">${this.getFileIcon(file.name)}</div>
        <div class="recent-file-info">
          <div class="recent-file-name">${file.name}</div>
          <div class="recent-file-details">
            ${this.formatFileSize(file.size)} • ${new Date(
          file.lastModified
        ).toLocaleDateString()}
          </div>
        </div>
        <div class="recent-file-actions">
          <button class="btn-small open-recent" data-file-name="${
            file.name
          }">열기</button>
          <button class="btn-small remove-recent" data-file-name="${
            file.name
          }">×</button>
        </div>
      </div>
    `
      )
      .join("");

    // 이벤트 리스너 추가
    container.querySelectorAll(".open-recent").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const fileName = e.target.getAttribute("data-file-name");
        this.openRecentFile(fileName);
      });
    });

    container.querySelectorAll(".remove-recent").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const fileName = e.target.getAttribute("data-file-name");
        this.removeRecentFile(fileName);
      });
    });
  }

  // 최근 파일 열기
  async openRecentFile(fileName) {
    const recentFile = this.recentFiles.find((f) => f.name === fileName);
    if (!recentFile) return;

    if (recentFile.handle) {
      try {
        const file = await recentFile.handle.getFile();
        await this.loadFile(file, recentFile.handle);
      } catch (error) {
        console.error("Error opening recent file:", error);
        this.showNotification(
          `파일을 열 수 없습니다: ${error.message}`,
          "error"
        );
        this.removeRecentFile(fileName);
      }
    } else {
      this.showNotification("파일 핸들이 없어 열 수 없습니다.", "warning");
    }
  }

  // 최근 파일 제거
  removeRecentFile(fileName) {
    this.recentFiles = this.recentFiles.filter((f) => f.name !== fileName);
    this.updateRecentFilesList();
    this.saveRecentFiles();
  }

  // 최근 파일 기록 삭제
  clearRecentFiles() {
    this.recentFiles = [];
    this.updateRecentFilesList();
    this.saveRecentFiles();
    this.showNotification("최근 파일 기록이 삭제되었습니다.", "info");
  }

  // 히스토리에 추가
  addToHistory(action, fileName) {
    const historyItem = {
      action,
      fileName,
      timestamp: new Date().toLocaleString(),
    };

    this.fileHistory.unshift(historyItem);

    // 최대 50개까지 유지
    if (this.fileHistory.length > 50) {
      this.fileHistory = this.fileHistory.slice(0, 50);
    }

    this.updateHistoryDisplay();
  }

  // 히스토리 표시 업데이트
  updateHistoryDisplay() {
    const container = document.getElementById("historyList");

    if (this.fileHistory.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><p>아직 작업 기록이 없습니다</p></div>';
      return;
    }

    container.innerHTML = this.fileHistory
      .map(
        (item) => `
      <div class="history-item">
        <div class="history-action ${
          item.action === "열기" ? "open" : "save"
        }">${item.action}</div>
        <div class="history-file">${item.fileName}</div>
        <div class="history-time">${item.timestamp}</div>
      </div>
    `
      )
      .join("");
  }

  // 히스토리 삭제
  clearHistory() {
    this.fileHistory = [];
    this.updateHistoryDisplay();
    this.showNotification("작업 히스토리가 삭제되었습니다.", "info");
  }

  // 권한 요청
  async requestPermissions() {
    if ("showOpenFilePicker" in window) {
      this.showNotification(
        "File System Access API가 지원됩니다. 파일 작업을 통해 자동으로 권한이 요청됩니다.",
        "info"
      );
    } else {
      this.showNotification(
        "이 브라우저는 File System Access API를 지원하지 않습니다.",
        "warning"
      );
    }
  }

  // 찾기/바꾸기 표시
  showFindReplace() {
    document.getElementById("findReplaceModal").classList.remove("hidden");
    document.getElementById("findText").focus();
  }

  // 찾기/바꾸기 숨김
  hideFindReplace() {
    document.getElementById("findReplaceModal").classList.add("hidden");
  }

  // 다음 찾기
  findNext() {
    const findText = document.getElementById("findText").value;
    if (!findText) return;

    const editor = document.getElementById("fileEditor");
    const text = editor.value;
    const startPos = editor.selectionEnd;

    let searchText = findText;
    let searchFlags = "g";

    if (!document.getElementById("caseSensitive").checked) {
      searchFlags += "i";
    }

    if (document.getElementById("useRegex").checked) {
      try {
        const regex = new RegExp(searchText, searchFlags);
        const match = regex.exec(text.substring(startPos));
        if (match) {
          const foundPos = startPos + match.index;
          editor.setSelectionRange(foundPos, foundPos + match[0].length);
          editor.focus();
        } else {
          // 처음부터 다시 검색
          const firstMatch = new RegExp(searchText, searchFlags).exec(text);
          if (firstMatch) {
            editor.setSelectionRange(
              firstMatch.index,
              firstMatch.index + firstMatch[0].length
            );
            editor.focus();
          } else {
            this.showNotification("찾는 텍스트가 없습니다.", "info");
          }
        }
      } catch (error) {
        this.showNotification("정규식 오류: " + error.message, "error");
      }
    } else {
      if (document.getElementById("wholeWords").checked) {
        searchText = `\\b${searchText}\\b`;
      }

      const regex = new RegExp(searchText, searchFlags);
      const match = regex.exec(text.substring(startPos));
      if (match) {
        const foundPos = startPos + match.index;
        editor.setSelectionRange(foundPos, foundPos + match[0].length);
        editor.focus();
      } else {
        // 처음부터 다시 검색
        const firstMatch = regex.exec(text);
        if (firstMatch) {
          editor.setSelectionRange(
            firstMatch.index,
            firstMatch.index + firstMatch[0].length
          );
          editor.focus();
        } else {
          this.showNotification("찾는 텍스트가 없습니다.", "info");
        }
      }
    }
  }

  // 이전 찾기
  findPrevious() {
    const findText = document.getElementById("findText").value;
    if (!findText) return;

    const editor = document.getElementById("fileEditor");
    const text = editor.value;
    const startPos = editor.selectionStart;

    // 뒤에서부터 검색하는 로직 구현
    // 간단한 구현 예시
    const beforeText = text.substring(0, startPos);
    const lastIndex = beforeText.lastIndexOf(findText);

    if (lastIndex !== -1) {
      editor.setSelectionRange(lastIndex, lastIndex + findText.length);
      editor.focus();
    } else {
      this.showNotification("더 이상 찾는 텍스트가 없습니다.", "info");
    }
  }

  // 하나 바꾸기
  replaceOne() {
    const editor = document.getElementById("fileEditor");
    const findText = document.getElementById("findText").value;
    const replaceText = document.getElementById("replaceText").value;

    if (!findText || editor.selectionStart === editor.selectionEnd) {
      this.findNext();
      return;
    }

    const selectedText = editor.value.substring(
      editor.selectionStart,
      editor.selectionEnd
    );
    if (
      selectedText === findText ||
      (!document.getElementById("caseSensitive").checked &&
        selectedText.toLowerCase() === findText.toLowerCase())
    ) {
      const newValue =
        editor.value.substring(0, editor.selectionStart) +
        replaceText +
        editor.value.substring(editor.selectionEnd);

      editor.value = newValue;
      editor.setSelectionRange(
        editor.selectionStart,
        editor.selectionStart + replaceText.length
      );

      this.handleEditorChange();
      this.showNotification("텍스트가 바뀌었습니다.", "success");
    }

    this.findNext();
  }

  // 모두 바꾸기
  replaceAll() {
    const findText = document.getElementById("findText").value;
    const replaceText = document.getElementById("replaceText").value;

    if (!findText) return;

    const editor = document.getElementById("fileEditor");
    let searchText = findText;
    let flags = "g";

    if (!document.getElementById("caseSensitive").checked) {
      flags += "i";
    }

    if (
      document.getElementById("wholeWords").checked &&
      !document.getElementById("useRegex").checked
    ) {
      searchText = `\\b${searchText}\\b`;
    }

    try {
      const regex = new RegExp(searchText, flags);
      const newValue = editor.value.replace(regex, replaceText);
      const replacedCount = (editor.value.match(regex) || []).length;

      editor.value = newValue;
      this.handleEditorChange();

      this.showNotification(
        `${replacedCount}개의 텍스트가 바뀌었습니다.`,
        "success"
      );
    } catch (error) {
      this.showNotification("정규식 오류: " + error.message, "error");
    }
  }

  // 코드 포맷
  formatCode() {
    const editor = document.getElementById("fileEditor");
    const language = document.getElementById("languageSelect").value;

    try {
      let formatted = editor.value;

      // 간단한 포맷팅 (실제로는 prettier 등의 라이브러리 사용)
      switch (language) {
        case "json":
          formatted = JSON.stringify(JSON.parse(formatted), null, 2);
          break;
        case "javascript":
        case "css":
        case "html":
          // 기본적인 들여쓰기 정리
          formatted = this.basicFormatting(formatted);
          break;
      }

      editor.value = formatted;
      this.handleEditorChange();
      this.showNotification("코드가 포맷되었습니다.", "success");
    } catch (error) {
      this.showNotification("포맷 오류: " + error.message, "error");
    }
  }

  // 기본 포맷팅
  basicFormatting(code) {
    // 매우 간단한 들여쓰기 정리
    const lines = code.split("\n");
    let indent = 0;
    const indentSize = 2;

    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.includes("}") && !trimmed.includes("{")) {
          indent = Math.max(0, indent - indentSize);
        }

        const formatted = " ".repeat(indent) + trimmed;

        if (trimmed.includes("{") && !trimmed.includes("}")) {
          indent += indentSize;
        }

        return formatted;
      })
      .join("\n");
  }

  // 키보드 이벤트 핸들러
  handleKeyboard(event) {
    const ctrl = event.ctrlKey || event.metaKey;

    if (ctrl) {
      switch (event.key) {
        case "o":
          event.preventDefault();
          this.openFile();
          break;
        case "s":
          event.preventDefault();
          if (event.shiftKey) {
            this.saveAsFile();
          } else {
            this.saveFile();
          }
          break;
        case "n":
          event.preventDefault();
          this.newFile();
          break;
        case "f":
          event.preventDefault();
          this.showFindReplace();
          break;
        case "d":
          event.preventDefault();
          this.downloadFile();
          break;
      }
    }

    if (event.key === "Escape") {
      this.hideFindReplace();
    }
  }

  // 드래그 앤 드롭 핸들러
  async handleDrop(event) {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await this.loadFile(files[0]);
    }
  }

  // 페이지 종료 전 확인
  handleBeforeUnload(event) {
    if (this.settings.confirmBeforeExit && this.currentFileHandle) {
      event.preventDefault();
      event.returnValue = "";
      return "";
    }
  }

  // 디렉토리 새로고침
  async refreshDirectory() {
    if (this.currentDirectoryHandle) {
      await this.loadDirectoryTree(this.currentDirectoryHandle);
      this.showNotification("디렉토리가 새로고침되었습니다.", "info");
    }
  }

  // UI 업데이트
  updateUI() {
    const hasFile = !!this.currentFileHandle;
    const hasContent = document.getElementById("fileEditor").value.length > 0;

    document.getElementById("saveFile").disabled = !hasFile;
    document.getElementById("saveAsFile").disabled = !hasContent;
    document.getElementById("downloadFile").disabled = !hasContent;
    document.getElementById("shareFile").disabled = !hasContent;
    document.getElementById("formatCode").disabled = !hasContent;
    document.getElementById("findReplace").disabled = !hasContent;
    document.getElementById("languageSelect").disabled = !hasContent;

    this.updateWordCount();
    this.updateCharCount();
    this.updateCursorPosition();
  }

  // 설정 저장
  saveSettings() {
    this.settings = {
      autoSave: document.getElementById("autoSave").checked,
      showHiddenFiles: document.getElementById("showHiddenFiles").checked,
      confirmBeforeExit: document.getElementById("confirmBeforeExit").checked,
      syntaxHighlighting: document.getElementById("syntaxHighlighting").checked,
      autoBackup: document.getElementById("autoBackup").checked,
      maxRecentFiles: parseInt(document.getElementById("maxRecentFiles").value),
    };

    localStorage.setItem("file-system-settings", JSON.stringify(this.settings));

    // 설정에 따라 UI 업데이트
    if (this.currentDirectoryHandle) {
      this.loadDirectoryTree(this.currentDirectoryHandle);
    }
  }

  // 설정 로드
  loadSettings() {
    const saved = localStorage.getItem("file-system-settings");
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }

    // UI 업데이트
    document.getElementById("autoSave").checked = this.settings.autoSave;
    document.getElementById("showHiddenFiles").checked =
      this.settings.showHiddenFiles;
    document.getElementById("confirmBeforeExit").checked =
      this.settings.confirmBeforeExit;
    document.getElementById("syntaxHighlighting").checked =
      this.settings.syntaxHighlighting;
    document.getElementById("autoBackup").checked = this.settings.autoBackup;
    document.getElementById("maxRecentFiles").value =
      this.settings.maxRecentFiles;
    document.getElementById("maxRecentValue").textContent =
      this.settings.maxRecentFiles;

    // 최근 파일 로드
    this.loadRecentFiles();
  }

  // 최근 파일 저장
  saveRecentFiles() {
    const toSave = this.recentFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      timestamp: file.timestamp,
      // handle은 직렬화할 수 없으므로 제외
    }));

    localStorage.setItem("file-system-recent", JSON.stringify(toSave));
  }

  // 최근 파일 로드
  loadRecentFiles() {
    const saved = localStorage.getItem("file-system-recent");
    if (saved) {
      this.recentFiles = JSON.parse(saved);
      this.updateRecentFilesList();
    }
  }

  // 로딩 표시
  showLoading(message = "처리 중...") {
    const overlay = document.getElementById("loadingOverlay");
    overlay.querySelector("p").textContent = message;
    overlay.classList.remove("hidden");
  }

  // 로딩 숨김
  hideLoading() {
    document.getElementById("loadingOverlay").classList.add("hidden");
  }

  // 알림 표시
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
      <button class="notification-close">×</button>
    `;

    // 닫기 버튼 이벤트
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    notifications.appendChild(notification);

    // 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  new FileSystemAccessAPI();
});
