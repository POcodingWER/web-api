import "./style.css";

class OPFSAPI {
  constructor() {
    this.rootDirectory = null;
    this.currentFiles = new Map();
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.checkSupport();
    this.initializeOPFS();
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = `
      <div class="opfs-container">
        <header class="opfs-header">
          <h1>💾 OPFS API 데모</h1>
          <p>Origin Private File System으로 브라우저에서 파일을 직접 관리해보세요</p>
          <div class="support-status" id="supportStatus">
            <div class="status-item">
              <span class="status-indicator" id="opfsStatus">⏳</span>
              <span>OPFS API</span>
            </div>
          </div>
        </header>

        <main class="opfs-main">
          <div class="file-operations">
            <div class="operation-section">
              <h2>📝 파일 작업</h2>
              <div class="file-controls">
                <div class="input-group">
                  <label for="fileName">파일명:</label>
                  <input type="text" id="fileName" placeholder="example.txt" value="test.txt">
                </div>
                <div class="input-group">
                  <label for="fileContent">내용:</label>
                  <textarea id="fileContent" placeholder="파일 내용을 입력하세요..." rows="4">안녕하세요! OPFS 테스트입니다.</textarea>
                </div>
                <div class="button-group">
                  <button id="createFile" class="btn-primary">📄 파일 생성</button>
                  <button id="readFile" class="btn-secondary">📖 파일 읽기</button>
                  <button id="updateFile" class="btn-accent">✏️ 파일 수정</button>
                  <button id="deleteFile" class="btn-danger">🗑️ 파일 삭제</button>
                </div>
              </div>
            </div>

            <div class="operation-section">
              <h2>📁 파일 관리</h2>
              <div class="manager-controls">
                <button id="listFiles" class="btn-accent">📋 파일 목록</button>
                <button id="clearAll" class="btn-warning">🧹 전체 삭제</button>
                <button id="calculateSize" class="btn-secondary">📊 용량 계산</button>
                <button id="exportFiles" class="btn-primary">📤 내보내기</button>
              </div>
              <div class="storage-info">
                <div class="info-item">
                  <label>파일 개수:</label>
                  <span id="fileCount">0</span>
                </div>
                <div class="info-item">
                  <label>사용 용량:</label>
                  <span id="storageSize">0 B</span>
                </div>
              </div>
            </div>
          </div>

          <div class="file-manager">
            <div class="manager-header">
              <h3>📂 파일 탐색기</h3>
              <button id="refreshList" class="btn-small">🔄 새로고침</button>
            </div>
            <div id="fileList" class="file-list">
              <div class="empty-state">
                파일이 없습니다. 새 파일을 생성해보세요!
              </div>
            </div>
          </div>

          <div class="file-viewer">
            <div class="viewer-header">
              <h3>👁️ 파일 뷰어</h3>
              <div class="viewer-info">
                <span id="viewerFileName">파일을 선택하세요</span>
              </div>
            </div>
            <div id="fileViewer" class="viewer-content">
              <div class="viewer-placeholder">
                📄 파일을 클릭하면 내용이 여기에 표시됩니다
              </div>
            </div>
          </div>

          <div class="usage-guide">
            <h2>💡 OPFS API 사용법</h2>
            <div class="guide-content">
              <div class="code-example">
                <h3>🔍 기본 사용법</h3>
                <pre><code>// OPFS 루트 디렉토리 가져오기
const rootDirectory = await navigator.storage.getDirectory();

// 파일 생성
const fileHandle = await rootDirectory.getFileHandle('test.txt', {
  create: true
});

// 파일에 쓰기
const writable = await fileHandle.createWritable();
await writable.write('Hello OPFS!');
await writable.close();

// 파일 읽기
const file = await fileHandle.getFile();
const content = await file.text();
console.log(content);</code></pre>
              </div>

              <div class="features-info">
                <h3>✨ 주요 특징</h3>
                <ul>
                  <li><strong>비공개 저장소:</strong> 다른 사이트에서 접근 불가</li>
                  <li><strong>대용량 지원:</strong> 브라우저 용량 제한까지 사용 가능</li>
                  <li><strong>빠른 성능:</strong> 메모리 기반 파일 시스템</li>
                  <li><strong>완전한 파일 API:</strong> 생성, 읽기, 수정, 삭제 모두 지원</li>
                  <li><strong>지속성:</strong> 브라우저를 닫아도 데이터 유지</li>
                </ul>
              </div>

              <div class="use-cases">
                <h3>🎯 활용 사례</h3>
                <ul>
                  <li><strong>오프라인 앱:</strong> 네트워크 없이도 파일 작업</li>
                  <li><strong>대용량 데이터:</strong> 이미지, 비디오 등 큰 파일 저장</li>
                  <li><strong>임시 파일:</strong> 작업 중인 파일 임시 저장</li>
                  <li><strong>캐시 시스템:</strong> 다운로드한 리소스 캐싱</li>
                  <li><strong>데이터베이스:</strong> 로컬 SQLite 파일 저장</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <!-- 알림 영역 -->
        <div id="notifications" class="notifications"></div>
      </div>
    `;
  }

  setupEventListeners() {
    // 파일 작업 이벤트
    document
      .getElementById("createFile")
      .addEventListener("click", () => this.createFile());
    document
      .getElementById("readFile")
      .addEventListener("click", () => this.readFile());
    document
      .getElementById("updateFile")
      .addEventListener("click", () => this.updateFile());
    document
      .getElementById("deleteFile")
      .addEventListener("click", () => this.deleteFile());

    // 파일 관리 이벤트
    document
      .getElementById("listFiles")
      .addEventListener("click", () => this.listFiles());
    document
      .getElementById("clearAll")
      .addEventListener("click", () => this.clearAll());
    document
      .getElementById("calculateSize")
      .addEventListener("click", () => this.calculateSize());
    document
      .getElementById("exportFiles")
      .addEventListener("click", () => this.exportFiles());
    document
      .getElementById("refreshList")
      .addEventListener("click", () => this.refreshFileList());
  }

  async checkSupport() {
    const status = document.getElementById("opfsStatus");

    try {
      if (
        "storage" in navigator &&
        "getDirectory" in navigator.storage &&
        typeof navigator.storage.getDirectory === "function"
      ) {
        status.textContent = "✅";
        status.className = "status-indicator success";
        this.showNotification("OPFS API가 지원됩니다!", "success");
        return true;
      } else {
        throw new Error("OPFS API not supported");
      }
    } catch (error) {
      status.textContent = "❌";
      status.className = "status-indicator error";
      this.showNotification(
        "OPFS API가 지원되지 않습니다. Chrome 86+ 또는 최신 브라우저를 사용하세요.",
        "error"
      );
      return false;
    }
  }

  async initializeOPFS() {
    try {
      this.rootDirectory = await navigator.storage.getDirectory();
      this.showNotification("OPFS 초기화 완료", "success");
      this.refreshFileList();
      this.calculateSize();
    } catch (error) {
      console.error("OPFS 초기화 실패:", error);
      this.showNotification("OPFS 초기화에 실패했습니다", "error");
    }
  }

  async createFile() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    try {
      const fileName = document.getElementById("fileName").value.trim();
      const content = document.getElementById("fileContent").value;

      if (!fileName) {
        this.showNotification("파일명을 입력하세요", "warning");
        return;
      }

      const fileHandle = await this.rootDirectory.getFileHandle(fileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      this.showNotification(`파일 "${fileName}"이 생성되었습니다`, "success");
      this.refreshFileList();
      this.calculateSize();
    } catch (error) {
      console.error("파일 생성 실패:", error);
      this.showNotification("파일 생성에 실패했습니다", "error");
    }
  }

  async readFile() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    try {
      const fileName = document.getElementById("fileName").value.trim();

      if (!fileName) {
        this.showNotification("파일명을 입력하세요", "warning");
        return;
      }

      const fileHandle = await this.rootDirectory.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();

      document.getElementById("fileContent").value = content;
      this.showFileInViewer(fileName, content);
      this.showNotification(`파일 "${fileName}"을 읽었습니다`, "success");
    } catch (error) {
      console.error("파일 읽기 실패:", error);
      this.showNotification(
        "파일을 찾을 수 없거나 읽기에 실패했습니다",
        "error"
      );
    }
  }

  async updateFile() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    try {
      const fileName = document.getElementById("fileName").value.trim();
      const content = document.getElementById("fileContent").value;

      if (!fileName) {
        this.showNotification("파일명을 입력하세요", "warning");
        return;
      }

      // 파일이 존재하는지 확인
      const fileHandle = await this.rootDirectory.getFileHandle(fileName);
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      this.showNotification(`파일 "${fileName}"이 수정되었습니다`, "success");
      this.refreshFileList();
      this.calculateSize();
    } catch (error) {
      console.error("파일 수정 실패:", error);
      this.showNotification(
        "파일을 찾을 수 없거나 수정에 실패했습니다",
        "error"
      );
    }
  }

  async deleteFile() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    try {
      const fileName = document.getElementById("fileName").value.trim();

      if (!fileName) {
        this.showNotification("파일명을 입력하세요", "warning");
        return;
      }

      await this.rootDirectory.removeEntry(fileName);
      this.showNotification(`파일 "${fileName}"이 삭제되었습니다`, "success");
      this.refreshFileList();
      this.calculateSize();

      // 뷰어 초기화
      this.clearViewer();
    } catch (error) {
      console.error("파일 삭제 실패:", error);
      this.showNotification(
        "파일을 찾을 수 없거나 삭제에 실패했습니다",
        "error"
      );
    }
  }

  async listFiles() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    try {
      const files = [];
      for await (const [name, handle] of this.rootDirectory.entries()) {
        if (handle.kind === "file") {
          const file = await handle.getFile();
          files.push({
            name: name,
            size: file.size,
            lastModified: new Date(file.lastModified),
          });
        }
      }

      console.log("OPFS 파일 목록:", files);
      this.showNotification(`${files.length}개의 파일을 찾았습니다`, "info");
      return files;
    } catch (error) {
      console.error("파일 목록 조회 실패:", error);
      this.showNotification("파일 목록 조회에 실패했습니다", "error");
      return [];
    }
  }

  async clearAll() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    if (!confirm("정말로 모든 파일을 삭제하시겠습니까?")) {
      return;
    }

    try {
      let deletedCount = 0;
      for await (const [name, handle] of this.rootDirectory.entries()) {
        if (handle.kind === "file") {
          await this.rootDirectory.removeEntry(name);
          deletedCount++;
        }
      }

      this.showNotification(
        `${deletedCount}개의 파일이 삭제되었습니다`,
        "success"
      );
      this.refreshFileList();
      this.calculateSize();
      this.clearViewer();
    } catch (error) {
      console.error("전체 삭제 실패:", error);
      this.showNotification("파일 삭제 중 오류가 발생했습니다", "error");
    }
  }

  async calculateSize() {
    if (!this.rootDirectory) return;

    try {
      let totalSize = 0;
      let fileCount = 0;

      for await (const [name, handle] of this.rootDirectory.entries()) {
        if (handle.kind === "file") {
          const file = await handle.getFile();
          totalSize += file.size;
          fileCount++;
        }
      }

      document.getElementById("fileCount").textContent = fileCount;
      document.getElementById("storageSize").textContent =
        this.formatBytes(totalSize);
    } catch (error) {
      console.error("용량 계산 실패:", error);
    }
  }

  async exportFiles() {
    if (!this.rootDirectory) {
      this.showNotification("OPFS가 초기화되지 않았습니다", "error");
      return;
    }

    try {
      const exportData = {};
      let fileCount = 0;

      for await (const [name, handle] of this.rootDirectory.entries()) {
        if (handle.kind === "file") {
          const file = await handle.getFile();
          const content = await file.text();
          exportData[name] = {
            content: content,
            size: file.size,
            lastModified: file.lastModified,
          };
          fileCount++;
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `opfs-export-${Date.now()}.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.showNotification(`${fileCount}개 파일이 내보내졌습니다`, "success");
    } catch (error) {
      console.error("파일 내보내기 실패:", error);
      this.showNotification("파일 내보내기에 실패했습니다", "error");
    }
  }

  async refreshFileList() {
    if (!this.rootDirectory) return;

    try {
      const fileList = document.getElementById("fileList");
      const files = [];

      for await (const [name, handle] of this.rootDirectory.entries()) {
        if (handle.kind === "file") {
          const file = await handle.getFile();
          files.push({
            name: name,
            size: file.size,
            lastModified: new Date(file.lastModified),
          });
        }
      }

      if (files.length === 0) {
        fileList.innerHTML = `
          <div class="empty-state">
            파일이 없습니다. 새 파일을 생성해보세요!
          </div>
        `;
        return;
      }

      // 파일명으로 정렬
      files.sort((a, b) => a.name.localeCompare(b.name));

      fileList.innerHTML = files
        .map(
          (file) => `
          <div class="file-item" data-filename="${file.name}">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <div class="file-name">${file.name}</div>
              <div class="file-meta">
                ${this.formatBytes(
                  file.size
                )} • ${file.lastModified.toLocaleString()}
              </div>
            </div>
            <div class="file-actions">
              <button class="file-action-btn view-btn" data-action="view" data-filename="${
                file.name
              }">👁️</button>
              <button class="file-action-btn edit-btn" data-action="edit" data-filename="${
                file.name
              }">✏️</button>
              <button class="file-action-btn delete-btn" data-action="delete" data-filename="${
                file.name
              }">🗑️</button>
            </div>
          </div>
        `
        )
        .join("");

      // 파일 아이템 클릭 이벤트
      fileList.addEventListener("click", (e) => {
        if (e.target.classList.contains("file-action-btn")) {
          const action = e.target.dataset.action;
          const filename = e.target.dataset.filename;
          this.handleFileAction(action, filename);
        } else if (e.target.closest(".file-item")) {
          const filename = e.target.closest(".file-item").dataset.filename;
          this.handleFileAction("view", filename);
        }
      });
    } catch (error) {
      console.error("파일 목록 새로고침 실패:", error);
    }
  }

  async handleFileAction(action, filename) {
    switch (action) {
      case "view":
        await this.viewFile(filename);
        break;
      case "edit":
        await this.editFile(filename);
        break;
      case "delete":
        document.getElementById("fileName").value = filename;
        await this.deleteFile();
        break;
    }
  }

  async viewFile(filename) {
    try {
      const fileHandle = await this.rootDirectory.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const content = await file.text();
      this.showFileInViewer(filename, content);
    } catch (error) {
      console.error("파일 보기 실패:", error);
      this.showNotification("파일을 볼 수 없습니다", "error");
    }
  }

  async editFile(filename) {
    try {
      const fileHandle = await this.rootDirectory.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const content = await file.text();

      document.getElementById("fileName").value = filename;
      document.getElementById("fileContent").value = content;
      this.showNotification(`"${filename}" 편집 준비 완료`, "info");
    } catch (error) {
      console.error("파일 편집 준비 실패:", error);
      this.showNotification("파일을 편집할 수 없습니다", "error");
    }
  }

  showFileInViewer(filename, content) {
    const viewer = document.getElementById("fileViewer");
    const fileNameSpan = document.getElementById("viewerFileName");

    fileNameSpan.textContent = filename;
    viewer.innerHTML = `
      <div class="file-content">
        <pre>${this.escapeHtml(content)}</pre>
      </div>
    `;
  }

  clearViewer() {
    const viewer = document.getElementById("fileViewer");
    const fileNameSpan = document.getElementById("viewerFileName");

    fileNameSpan.textContent = "파일을 선택하세요";
    viewer.innerHTML = `
      <div class="viewer-placeholder">
        📄 파일을 클릭하면 내용이 여기에 표시됩니다
      </div>
    `;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    const notification = document.createElement("div");
    notification.className = "notification notification-" + type;

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };
    const icon = icons[type] || "ℹ️";

    notification.innerHTML =
      '<span class="notification-icon">' +
      icon +
      "</span>" +
      '<span class="notification-message">' +
      message +
      "</span>" +
      '<span class="notification-close">&times;</span>';

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

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new OPFSAPI();
});
