import "./style.css";

// Drag And Drop Multi Files/Folders API 테스트 및 데모
class DragAndDropDemo {
  constructor() {
    this.uploadedFiles = [];
    this.folderStructure = new Map();
    this.dragCounter = 0;
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
    this.allowedFileTypes = [];
    this.uploadQueue = [];
    this.isUploading = false;
    this.uploadProgress = new Map();
    this.totalUploadSize = 0;
    this.uploadedSize = 0;
    this.previewCache = new Map();
    this.sortBy = "name";
    this.sortOrder = "asc";
    this.viewMode = "grid";
    this.selectedFiles = new Set();
    this.clipboardFiles = [];
    this.currentPath = "";
    this.searchQuery = "";
    this.filters = {
      images: true,
      documents: true,
      videos: true,
      audio: true,
      archives: true,
      others: true,
    };

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
    this.setupDropZones();
    this.loadSettings();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    const dragDropSupport = "ondragstart" in window && "ondrop" in window;
    const fileReaderSupport = "FileReader" in window;
    const dataTransferSupport = "DataTransfer" in window;

    let statusHTML = "";

    if (dragDropSupport && fileReaderSupport && dataTransferSupport) {
      statusHTML = `<span class="status-success">✅ Drag And Drop API 완전 지원됨</span>`;
    } else {
      statusHTML = `<span class="status-error">❌ 일부 기능이 지원되지 않습니다</span>`;
      this.disableFeatures();
    }

    statusElement.innerHTML = statusHTML;
    return dragDropSupport && fileReaderSupport && dataTransferSupport;
  }

  disableFeatures() {
    document.querySelectorAll(".upload-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="drag-drop-demo">
        <h1>📁 Drag And Drop Multi Files/Folders</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <!-- 업로드 영역 섹션 -->
        <div class="demo-section upload-section">
          <h2>📤 파일 업로드 영역</h2>
          
          <div class="upload-area" id="uploadArea">
            <div class="upload-content">
              <div class="upload-icon">📁</div>
              <div class="upload-text">
                <h3>파일이나 폴더를 드래그해서 업로드</h3>
                <p>또는 클릭해서 파일 선택</p>
                <p class="upload-hint">여러 파일/폴더 동시 선택 가능</p>
              </div>
              <input type="file" id="fileInput" multiple webkitdirectory hidden>
              <input type="file" id="fileInputSingle" multiple hidden>
            </div>
            <div class="drag-overlay" id="dragOverlay">
              <div class="overlay-content">
                <div class="overlay-icon">⬇️</div>
                <div class="overlay-text">파일을 여기에 놓으세요</div>
              </div>
            </div>
          </div>
          
          <div class="upload-controls">
            <div class="control-group">
              <label>파일 크기 제한:</label>
              <select id="maxFileSize">
                <option value="10485760">10MB</option>
                <option value="52428800">50MB</option>
                <option value="104857600" selected>100MB</option>
                <option value="524288000">500MB</option>
                <option value="1073741824">1GB</option>
              </select>
            </div>
            
            <div class="control-group">
              <label>허용 파일 타입:</label>
              <div class="file-type-filters">
                <label><input type="checkbox" value="image/*" checked> 🖼️ 이미지</label>
                <label><input type="checkbox" value="application/pdf" checked> 📄 PDF</label>
                <label><input type="checkbox" value="text/*" checked> 📝 텍스트</label>
                <label><input type="checkbox" value="video/*" checked> 🎥 비디오</label>
                <label><input type="checkbox" value="audio/*" checked> 🎵 오디오</label>
                <label><input type="checkbox" value="*" checked> 📦 모든 파일</label>
              </div>
            </div>
            
            <div class="control-group">
              <button id="selectFiles" class="upload-btn primary-btn">
                📁 파일 선택
              </button>
              <button id="selectFolder" class="upload-btn secondary-btn">
                📂 폴더 선택
              </button>
              <button id="clearAll" class="upload-btn danger-btn">
                🗑️ 모두 지우기
              </button>
            </div>
          </div>
        </div>

        <!-- 업로드 진행상황 섹션 -->
        <div class="demo-section progress-section" id="progressSection" style="display: none;">
          <h2>📊 업로드 진행상황</h2>
          
          <div class="overall-progress">
            <div class="progress-info">
              <span class="progress-text">전체 진행률</span>
              <span class="progress-percentage" id="overallPercentage">0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" id="overallProgress"></div>
            </div>
            <div class="progress-details">
              <span id="uploadedSize">0 B</span> / <span id="totalSize">0 B</span>
              <span class="progress-speed" id="uploadSpeed">0 KB/s</span>
            </div>
          </div>
          
          <div class="file-progress-list" id="fileProgressList"></div>
          
          <div class="progress-actions">
            <button id="pauseUpload" class="upload-btn warning-btn">
              ⏸️ 일시정지
            </button>
            <button id="resumeUpload" class="upload-btn success-btn">
              ▶️ 재개
            </button>
            <button id="cancelUpload" class="upload-btn danger-btn">
              ❌ 취소
            </button>
          </div>
        </div>

        <!-- 파일 관리 섹션 -->
        <div class="demo-section file-manager-section">
          <h2>📋 파일 관리자</h2>
          
          <div class="manager-toolbar">
            <div class="toolbar-left">
              <div class="path-breadcrumb" id="pathBreadcrumb">
                <span class="path-item active">📂 루트</span>
              </div>
            </div>
            
            <div class="toolbar-center">
              <div class="search-box">
                <input type="text" id="searchInput" placeholder="파일 검색...">
                <button id="searchBtn" class="search-button">🔍</button>
              </div>
            </div>
            
            <div class="toolbar-right">
              <div class="view-controls">
                <button id="gridView" class="view-btn active" title="그리드 보기">⊞</button>
                <button id="listView" class="view-btn" title="리스트 보기">☰</button>
              </div>
              
              <div class="sort-controls">
                <select id="sortBy">
                  <option value="name">이름순</option>
                  <option value="size">크기순</option>
                  <option value="type">타입순</option>
                  <option value="date">날짜순</option>
                </select>
                <button id="sortOrder" class="sort-btn" title="정렬 순서">↕️</button>
              </div>
            </div>
          </div>
          
          <div class="filter-bar">
            <span class="filter-label">필터:</span>
            <label class="filter-item">
              <input type="checkbox" id="filterImages" checked>
              <span>🖼️ 이미지 (${this.getFilterCount("images")})</span>
            </label>
            <label class="filter-item">
              <input type="checkbox" id="filterDocuments" checked>
              <span>📄 문서 (${this.getFilterCount("documents")})</span>
            </label>
            <label class="filter-item">
              <input type="checkbox" id="filterVideos" checked>
              <span>🎥 비디오 (${this.getFilterCount("videos")})</span>
            </label>
            <label class="filter-item">
              <input type="checkbox" id="filterAudio" checked>
              <span>🎵 오디오 (${this.getFilterCount("audio")})</span>
            </label>
            <label class="filter-item">
              <input type="checkbox" id="filterArchives" checked>
              <span>📦 압축 (${this.getFilterCount("archives")})</span>
            </label>
            <label class="filter-item">
              <input type="checkbox" id="filterOthers" checked>
              <span>📋 기타 (${this.getFilterCount("others")})</span>
            </label>
          </div>
          
          <div class="selection-bar" id="selectionBar" style="display: none;">
            <span class="selection-info" id="selectionInfo">0개 파일 선택됨</span>
            <div class="selection-actions">
              <button id="selectAll" class="selection-btn">전체 선택</button>
              <button id="selectNone" class="selection-btn">선택 해제</button>
              <button id="downloadSelected" class="selection-btn">💾 다운로드</button>
              <button id="deleteSelected" class="selection-btn danger">🗑️ 삭제</button>
              <button id="copySelected" class="selection-btn">📋 복사</button>
              <button id="cutSelected" class="selection-btn">✂️ 잘라내기</button>
              <button id="pasteFiles" class="selection-btn">📌 붙여넣기</button>
            </div>
          </div>
          
          <div class="file-grid" id="fileGrid">
            <div class="empty-state">
              <div class="empty-icon">📂</div>
              <h3>업로드된 파일이 없습니다</h3>
              <p>파일이나 폴더를 드래그해서 업로드해보세요</p>
            </div>
          </div>
        </div>

        <!-- 폴더 구조 섹션 -->
        <div class="demo-section folder-structure-section">
          <h2>🌳 폴더 구조</h2>
          
          <div class="structure-controls">
            <button id="expandAll" class="structure-btn">🔽 모두 열기</button>
            <button id="collapseAll" class="structure-btn">🔼 모두 접기</button>
            <button id="exportStructure" class="structure-btn">📤 구조 내보내기</button>
          </div>
          
          <div class="folder-tree" id="folderTree">
            <div class="tree-placeholder">
              <p>폴더가 업로드되면 구조가 여기에 표시됩니다</p>
            </div>
          </div>
        </div>

        <!-- 파일 미리보기 섹션 -->
        <div class="demo-section preview-section">
          <h2>👁️ 파일 미리보기</h2>
          
          <div class="preview-container" id="previewContainer">
            <div class="preview-placeholder">
              <div class="placeholder-icon">👁️</div>
              <h3>파일을 선택하면 미리보기가 표시됩니다</h3>
              <p>이미지, 텍스트, PDF 등 다양한 형식을 지원합니다</p>
            </div>
          </div>
          
          <div class="preview-controls" id="previewControls" style="display: none;">
            <button id="downloadFile" class="preview-btn">💾 다운로드</button>
            <button id="shareFile" class="preview-btn">🔗 공유</button>
            <button id="deleteFile" class="preview-btn danger">🗑️ 삭제</button>
            <button id="renameFile" class="preview-btn">✏️ 이름 변경</button>
          </div>
        </div>

        <!-- 통계 섹션 -->
        <div class="demo-section stats-section">
          <h2>📊 업로드 통계</h2>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📁</div>
              <div class="stat-content">
                <h4>총 파일 수</h4>
                <div class="stat-value" id="totalFiles">0</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📂</div>
              <div class="stat-content">
                <h4>총 폴더 수</h4>
                <div class="stat-value" id="totalFolders">0</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💾</div>
              <div class="stat-content">
                <h4>총 크기</h4>
                <div class="stat-value" id="totalStorageSize">0 B</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <h4>업로드 세션</h4>
                <div class="stat-value" id="uploadSessions">0</div>
              </div>
            </div>
          </div>
          
          <div class="file-type-chart">
            <h4>📊 파일 타입별 분포</h4>
            <div class="chart-container">
              <canvas id="fileTypeChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        <!-- 고급 기능 섹션 -->
        <div class="demo-section advanced-section">
          <h2>⚙️ 고급 기능</h2>
          
          <div class="advanced-controls">
            <div class="feature-group">
              <h4>🔧 파일 처리 옵션</h4>
              <label>
                <input type="checkbox" id="generateThumbnails" checked>
                이미지 썸네일 자동 생성
              </label>
              <label>
                <input type="checkbox" id="extractMetadata" checked>
                파일 메타데이터 추출
              </label>
              <label>
                <input type="checkbox" id="virusCheck">
                바이러스 검사 시뮬레이션
              </label>
              <label>
                <input type="checkbox" id="compressImages">
                이미지 자동 압축
              </label>
            </div>
            
            <div class="feature-group">
              <h4>📁 폴더 처리 옵션</h4>
              <label>
                <input type="checkbox" id="preserveStructure" checked>
                폴더 구조 유지
              </label>
              <label>
                <input type="checkbox" id="flattenFolders">
                폴더 평면화
              </label>
              <label>
                <input type="checkbox" id="ignoreDotFiles" checked>
                숨김 파일 무시 (.으로 시작하는 파일)
              </label>
            </div>
            
            <div class="feature-group">
              <h4>🚀 성능 옵션</h4>
              <label>
                병렬 업로드 수:
                <select id="parallelUploads">
                  <option value="1">1개</option>
                  <option value="3" selected>3개</option>
                  <option value="5">5개</option>
                  <option value="10">10개</option>
                </select>
              </label>
              <label>
                청크 크기:
                <select id="chunkSize">
                  <option value="262144">256KB</option>
                  <option value="524288">512KB</option>
                  <option value="1048576" selected>1MB</option>
                  <option value="2097152">2MB</option>
                </select>
              </label>
            </div>
          </div>
          
          <div class="test-actions">
            <button id="simulateUpload" class="test-btn">🧪 업로드 시뮬레이션</button>
            <button id="stressTest" class="test-btn">💪 스트레스 테스트</button>
            <button id="generateSampleFiles" class="test-btn">📄 샘플 파일 생성</button>
            <button id="exportData" class="test-btn">📤 데이터 내보내기</button>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Drag And Drop API 정보</h3>
          <div class="info-grid">
            <div class="info-card">
              <h4>📁 드래그 앤 드롭</h4>
              <ul>
                <li>파일/폴더 드래그 앤 드롭 지원</li>
                <li>여러 파일 동시 업로드</li>
                <li>폴더 구조 유지</li>
                <li>실시간 진행률 표시</li>
                <li>드래그 오버 시각적 피드백</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🔧 주요 이벤트</h4>
              <ul>
                <li><strong>dragover:</strong> 드래그 중 영역 위</li>
                <li><strong>dragenter:</strong> 영역 진입</li>
                <li><strong>dragleave:</strong> 영역 이탈</li>
                <li><strong>drop:</strong> 파일 드롭</li>
                <li><strong>dragend:</strong> 드래그 종료</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>📦 지원 기능</h4>
              <ul>
                <li><strong>파일 타입:</strong> 모든 형식 지원</li>
                <li><strong>폴더:</strong> 중첩 구조 지원</li>
                <li><strong>미리보기:</strong> 이미지, 텍스트, PDF</li>
                <li><strong>메타데이터:</strong> 크기, 타입, 수정일</li>
                <li><strong>검색:</strong> 파일명 기반 검색</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>💼 실무 활용</h4>
              <ul>
                <li>파일 업로드 인터페이스</li>
                <li>폴더 기반 프로젝트 관리</li>
                <li>이미지 갤러리 업로드</li>
                <li>문서 관리 시스템</li>
                <li>미디어 콘텐츠 관리</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 드래그 앤 드롭 이벤트
    this.setupDropZones();

    // 파일 선택 버튼
    document.getElementById("selectFiles").addEventListener("click", () => {
      document.getElementById("fileInputSingle").click();
    });

    document.getElementById("selectFolder").addEventListener("click", () => {
      document.getElementById("fileInput").click();
    });

    // 파일 입력 이벤트
    document
      .getElementById("fileInput")
      .addEventListener("change", (e) => this.handleFileSelect(e));
    document
      .getElementById("fileInputSingle")
      .addEventListener("change", (e) => this.handleFileSelect(e));

    // 설정 변경 이벤트
    document.getElementById("maxFileSize").addEventListener("change", (e) => {
      this.maxFileSize = parseInt(e.target.value);
      this.saveSettings();
    });

    // 파일 타입 필터
    document
      .querySelectorAll('.file-type-filters input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () => this.updateFileTypeFilters());
      });

    // 업로드 제어
    document
      .getElementById("clearAll")
      .addEventListener("click", () => this.clearAllFiles());
    document
      .getElementById("pauseUpload")
      .addEventListener("click", () => this.pauseUpload());
    document
      .getElementById("resumeUpload")
      .addEventListener("click", () => this.resumeUpload());
    document
      .getElementById("cancelUpload")
      .addEventListener("click", () => this.cancelUpload());

    // 파일 관리자 제어
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.updateFileDisplay();
    });

    document
      .getElementById("searchBtn")
      .addEventListener("click", () => this.performSearch());

    document
      .getElementById("gridView")
      .addEventListener("click", () => this.setViewMode("grid"));
    document
      .getElementById("listView")
      .addEventListener("click", () => this.setViewMode("list"));

    document.getElementById("sortBy").addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.updateFileDisplay();
    });

    document.getElementById("sortOrder").addEventListener("click", () => {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      this.updateFileDisplay();
    });

    // 필터 이벤트
    ["Images", "Documents", "Videos", "Audio", "Archives", "Others"].forEach(
      (type) => {
        document
          .getElementById(`filter${type}`)
          .addEventListener("change", (e) => {
            this.filters[type.toLowerCase()] = e.target.checked;
            this.updateFileDisplay();
          });
      }
    );

    // 선택 관련 이벤트
    document
      .getElementById("selectAll")
      .addEventListener("click", () => this.selectAll());
    document
      .getElementById("selectNone")
      .addEventListener("click", () => this.selectNone());
    document
      .getElementById("downloadSelected")
      .addEventListener("click", () => this.downloadSelected());
    document
      .getElementById("deleteSelected")
      .addEventListener("click", () => this.deleteSelected());
    document
      .getElementById("copySelected")
      .addEventListener("click", () => this.copySelected());
    document
      .getElementById("cutSelected")
      .addEventListener("click", () => this.cutSelected());
    document
      .getElementById("pasteFiles")
      .addEventListener("click", () => this.pasteFiles());

    // 폴더 구조 제어
    document
      .getElementById("expandAll")
      .addEventListener("click", () => this.expandAllFolders());
    document
      .getElementById("collapseAll")
      .addEventListener("click", () => this.collapseAllFolders());
    document
      .getElementById("exportStructure")
      .addEventListener("click", () => this.exportFolderStructure());

    // 미리보기 제어
    document
      .getElementById("downloadFile")
      .addEventListener("click", () => this.downloadCurrentFile());
    document
      .getElementById("shareFile")
      .addEventListener("click", () => this.shareCurrentFile());
    document
      .getElementById("deleteFile")
      .addEventListener("click", () => this.deleteCurrentFile());
    document
      .getElementById("renameFile")
      .addEventListener("click", () => this.renameCurrentFile());

    // 고급 기능
    document
      .getElementById("simulateUpload")
      .addEventListener("click", () => this.simulateUpload());
    document
      .getElementById("stressTest")
      .addEventListener("click", () => this.stressTest());
    document
      .getElementById("generateSampleFiles")
      .addEventListener("click", () => this.generateSampleFiles());
    document
      .getElementById("exportData")
      .addEventListener("click", () => this.exportAllData());

    // 키보드 단축키
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );

    // 설정 변경 감지
    document
      .querySelectorAll(
        "#generateThumbnails, #extractMetadata, #virusCheck, #compressImages, #preserveStructure, #flattenFolders, #ignoreDotFiles"
      )
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () => this.saveSettings());
      });
  }

  setupDropZones() {
    const uploadArea = document.getElementById("uploadArea");
    const dragOverlay = document.getElementById("dragOverlay");

    // 전체 문서에 대한 기본 드래그 이벤트 방지
    document.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "none";
    });
    document.addEventListener("drop", (e) => {
      e.preventDefault();
    });

    // 업로드 영역 드래그 이벤트
    uploadArea.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dragCounter++;
      uploadArea.classList.add("drag-over");
      dragOverlay.style.display = "flex";
    });

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    });

    uploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dragCounter--;
      if (this.dragCounter === 0) {
        uploadArea.classList.remove("drag-over");
        dragOverlay.style.display = "none";
      }
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dragCounter = 0;
      uploadArea.classList.remove("drag-over");
      dragOverlay.style.display = "none";

      this.handleDrop(e);
    });

    // 업로드 영역 클릭 이벤트
    uploadArea.addEventListener("click", () => {
      document.getElementById("fileInputSingle").click();
    });
  }

  async handleDrop(event) {
    console.log("🚀 Drop event triggered!", event);
    const items = event.dataTransfer.items;
    const files = [];

    console.log("📦 DataTransfer items:", items ? items.length : 0);
    console.log("📁 DataTransfer files:", event.dataTransfer.files.length);

    if (items && typeof items[0]?.webkitGetAsEntry === "function") {
      // DataTransferItemList를 사용하여 폴더 지원 (Chrome/Edge)
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(this.processEntry(entry, files));
          }
        }
      }

      // 모든 파일/폴더 처리가 완료될 때까지 기다림
      if (promises.length > 0) {
        console.log("⏳ Processing", promises.length, "entries...");
        await Promise.all(promises);
        console.log("✅ Processing complete! Files found:", files.length);
        this.processFiles(files);
      }
    } else {
      // 폴백: DataTransfer.files 사용 (Firefox, Safari 등)
      console.log("🔄 Using fallback DataTransfer.files");
      const fileList = Array.from(event.dataTransfer.files);

      // 파일에 상대 경로 정보가 있으면 사용
      fileList.forEach((file) => {
        if (file.webkitRelativePath) {
          Object.defineProperty(file, "_relativePath", {
            value: file.webkitRelativePath,
            writable: true,
            enumerable: false,
          });
        }
      });

      console.log("📋 Files to process:", fileList.length);
      this.processFiles(fileList);
    }
  }

  async processEntry(entry, files, path = "") {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          // webkitRelativePath는 읽기 전용이므로 새로운 속성으로 경로 저장
          Object.defineProperty(file, "_relativePath", {
            value: path + file.name,
            writable: true,
            enumerable: false,
          });
          files.push(file);
          resolve();
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        reader.readEntries((entries) => {
          const promises = entries.map((childEntry) =>
            this.processEntry(childEntry, files, path + entry.name + "/")
          );
          Promise.all(promises).then(resolve);
        });
      }
    });
  }

  handleFileSelect(event) {
    const files = Array.from(event.target.files);
    this.processFiles(files);
  }

  processFiles(files) {
    if (files.length === 0) return;

    this.showNotification(`${files.length}개 파일 처리 중...`, "info");

    // 파일 유효성 검사
    const validFiles = this.validateFiles(files);

    if (validFiles.length === 0) {
      this.showNotification("유효한 파일이 없습니다.", "error");
      return;
    }

    // 폴더 구조 분석
    this.analyzeFolderStructure(validFiles);

    // 파일 정보 추출 및 저장
    this.extractFileInfo(validFiles);

    // UI 업데이트
    this.updateFileDisplay();
    this.updateFolderTree();
    this.updateStats();

    // 업로드 시뮬레이션 시작
    if (document.getElementById("simulateUpload").checked !== false) {
      this.startUploadSimulation(validFiles);
    }

    this.showNotification(
      `${validFiles.length}개 파일이 성공적으로 처리되었습니다.`,
      "success"
    );
  }

  validateFiles(files) {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // 파일 크기 검사
      if (file.size > this.maxFileSize) {
        errors.push(
          `${file.name}: 파일 크기가 너무 큽니다 (${this.formatFileSize(
            file.size
          )})`
        );
        continue;
      }

      // 파일 타입 검사
      if (!this.isAllowedFileType(file)) {
        errors.push(`${file.name}: 허용되지 않는 파일 타입입니다`);
        continue;
      }

      // 중복 파일 검사
      if (
        this.uploadedFiles.find(
          (f) =>
            f.name === file.name &&
            f.webkitRelativePath ===
              (file._relativePath || file.webkitRelativePath || "")
        )
      ) {
        errors.push(`${file.name}: 이미 업로드된 파일입니다`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      console.warn("파일 검증 오류:", errors);
      this.showNotification(`${errors.length}개 파일에서 오류 발생`, "warning");
    }

    return validFiles;
  }

  isAllowedFileType(file) {
    if (
      this.allowedFileTypes.length === 0 ||
      this.allowedFileTypes.includes("*")
    ) {
      return true;
    }

    return this.allowedFileTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  }

  analyzeFolderStructure(files) {
    this.folderStructure.clear();

    for (const file of files) {
      const path = file._relativePath || file.webkitRelativePath || file.name;
      const pathParts = path.split("/");

      if (pathParts.length > 1) {
        // 폴더가 있는 경우
        let currentPath = "";
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folderName = pathParts[i];
          const parentPath = currentPath;
          currentPath = currentPath
            ? `${currentPath}/${folderName}`
            : folderName;

          if (!this.folderStructure.has(currentPath)) {
            this.folderStructure.set(currentPath, {
              name: folderName,
              path: currentPath,
              parentPath: parentPath,
              files: [],
              subfolders: [],
              expanded: false,
            });
          }

          // 부모 폴더에 하위 폴더 추가
          if (parentPath && this.folderStructure.has(parentPath)) {
            const parentFolder = this.folderStructure.get(parentPath);
            if (!parentFolder.subfolders.includes(currentPath)) {
              parentFolder.subfolders.push(currentPath);
            }
          }
        }

        // 파일을 해당 폴더에 추가
        if (this.folderStructure.has(currentPath)) {
          this.folderStructure.get(currentPath).files.push(file);
        }
      }
    }
  }

  extractFileInfo(files) {
    for (const file of files) {
      const fileInfo = {
        id: this.generateFileId(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        webkitRelativePath: file._relativePath || file.webkitRelativePath || "",
        category: this.getFileCategory(file),
        thumbnail: null,
        metadata: {},
        uploadProgress: 0,
        uploadStatus: "pending", // pending, uploading, completed, error
        selected: false,
      };

      // 메타데이터 추출
      if (document.getElementById("extractMetadata").checked) {
        this.extractMetadata(fileInfo);
      }

      // 썸네일 생성
      if (
        document.getElementById("generateThumbnails").checked &&
        this.isImageFile(file)
      ) {
        this.generateThumbnail(fileInfo);
      }

      this.uploadedFiles.push(fileInfo);
    }
  }

  generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getFileCategory(file) {
    const type = file.type.toLowerCase();

    if (type.startsWith("image/")) return "images";
    if (type.startsWith("video/")) return "videos";
    if (type.startsWith("audio/")) return "audio";
    if (
      type.includes("pdf") ||
      type.includes("document") ||
      type.includes("text")
    )
      return "documents";
    if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
      return "archives";

    return "others";
  }

  isImageFile(file) {
    return file.type.startsWith("image/");
  }

  extractMetadata(fileInfo) {
    const file = fileInfo.file;

    fileInfo.metadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: new Date(file.lastModified),
      path: file._relativePath || file.webkitRelativePath || file.name,
    };

    // 이미지 파일의 경우 추가 메타데이터
    if (this.isImageFile(file)) {
      const img = new Image();
      img.onload = () => {
        fileInfo.metadata.width = img.width;
        fileInfo.metadata.height = img.height;
        fileInfo.metadata.dimensions = `${img.width} x ${img.height}`;
      };
      img.src = URL.createObjectURL(file);
    }
  }

  generateThumbnail(fileInfo) {
    const file = fileInfo.file;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const maxSize = 150;
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      fileInfo.thumbnail = canvas.toDataURL("image/jpeg", 0.8);
      this.updateFileDisplay();
    };

    img.src = URL.createObjectURL(file);
  }

  updateFileDisplay() {
    const fileGrid = document.getElementById("fileGrid");
    const filteredFiles = this.getFilteredFiles();

    if (filteredFiles.length === 0) {
      fileGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>표시할 파일이 없습니다</h3>
          <p>필터를 조정하거나 파일을 업로드해보세요</p>
        </div>
      `;
      return;
    }

    const sortedFiles = this.sortFiles(filteredFiles);
    const html = sortedFiles
      .map((fileInfo) => this.createFileCard(fileInfo))
      .join("");

    fileGrid.innerHTML = html;
    fileGrid.className = `file-grid ${this.viewMode}-view`;

    // 파일 카드 이벤트 바인딩
    this.bindFileCardEvents();

    // 선택 바 업데이트
    this.updateSelectionBar();
  }

  getFilteredFiles() {
    let files = this.uploadedFiles;

    // 카테고리 필터
    files = files.filter((fileInfo) => this.filters[fileInfo.category]);

    // 검색 필터
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      files = files.filter(
        (fileInfo) =>
          fileInfo.name.toLowerCase().includes(query) ||
          (fileInfo.webkitRelativePath || "").toLowerCase().includes(query)
      );
    }

    // 경로 필터 (현재 경로에 있는 파일만)
    if (this.currentPath) {
      files = files.filter((fileInfo) => {
        const filePath = fileInfo.webkitRelativePath || "";
        const pathDir = filePath.substring(0, filePath.lastIndexOf("/"));
        return pathDir === this.currentPath;
      });
    } else {
      // 루트 레벨 파일만 (폴더가 없는 파일)
      files = files.filter((fileInfo) => {
        const filePath = fileInfo.webkitRelativePath || "";
        return !filePath.includes("/");
      });
    }

    return files;
  }

  sortFiles(files) {
    return files.sort((a, b) => {
      let aValue, bValue;

      switch (this.sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "date":
          aValue = a.lastModified;
          bValue = b.lastModified;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  createFileCard(fileInfo) {
    const isSelected = fileInfo.selected;
    const thumbnail = fileInfo.thumbnail || this.getFileIcon(fileInfo.type);
    const uploadStatus = fileInfo.uploadStatus;
    const uploadProgress = fileInfo.uploadProgress;

    return `
      <div class="file-card ${isSelected ? "selected" : ""}" data-file-id="${
      fileInfo.id
    }">
        <div class="file-thumbnail">
          ${
            fileInfo.thumbnail
              ? `<img src="${thumbnail}" alt="${fileInfo.name}" loading="lazy">`
              : `<div class="file-icon">${thumbnail}</div>`
          }
          <div class="file-checkbox">
            <input type="checkbox" ${isSelected ? "checked" : ""}>
          </div>
          ${
            uploadStatus !== "completed"
              ? `
            <div class="upload-overlay">
              <div class="upload-progress" style="width: ${uploadProgress}%"></div>
              <div class="upload-status">${this.getUploadStatusText(
                uploadStatus
              )}</div>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="file-info">
          <div class="file-name" title="${fileInfo.name}">${fileInfo.name}</div>
          <div class="file-details">
            <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
            <span class="file-type">${this.getFileTypeText(
              fileInfo.type
            )}</span>
          </div>
          ${
            fileInfo.webkitRelativePath
              ? `
            <div class="file-path" title="${fileInfo.webkitRelativePath}">
              📁 ${fileInfo.webkitRelativePath}
            </div>
          `
              : ""
          }
        </div>
        
        <div class="file-actions">
          <button class="action-btn preview-btn" title="미리보기">👁️</button>
          <button class="action-btn download-btn" title="다운로드">💾</button>
          <button class="action-btn delete-btn" title="삭제">🗑️</button>
        </div>
      </div>
    `;
  }

  getFileIcon(mimeType) {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("text")) return "📝";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
    if (mimeType.includes("document") || mimeType.includes("word")) return "📄";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "📈";
    return "📄";
  }

  getUploadStatusText(status) {
    switch (status) {
      case "pending":
        return "대기 중";
      case "uploading":
        return "업로드 중";
      case "completed":
        return "완료";
      case "error":
        return "오류";
      default:
        return status;
    }
  }

  getFileTypeText(mimeType) {
    if (!mimeType) return "알 수 없음";

    const type = mimeType.split("/")[1];
    return type.toUpperCase();
  }

  bindFileCardEvents() {
    // 파일 카드 클릭 이벤트
    document.querySelectorAll(".file-card").forEach((card) => {
      const fileId = card.dataset.fileId;
      const checkbox = card.querySelector('input[type="checkbox"]');

      // 체크박스 이벤트
      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        this.toggleFileSelection(fileId, e.target.checked);
      });

      // 카드 클릭 이벤트 (미리보기)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".file-actions") || e.target.type === "checkbox")
          return;
        this.previewFile(fileId);
      });

      // 액션 버튼 이벤트
      card.querySelector(".preview-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        this.previewFile(fileId);
      });

      card.querySelector(".download-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        this.downloadFile(fileId);
      });

      card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteFile(fileId);
      });
    });
  }

  toggleFileSelection(fileId, selected) {
    const fileInfo = this.uploadedFiles.find((f) => f.id === fileId);
    if (fileInfo) {
      fileInfo.selected = selected;

      if (selected) {
        this.selectedFiles.add(fileId);
      } else {
        this.selectedFiles.delete(fileId);
      }

      this.updateSelectionBar();
    }
  }

  updateSelectionBar() {
    const selectionBar = document.getElementById("selectionBar");
    const selectionInfo = document.getElementById("selectionInfo");
    const selectedCount = this.selectedFiles.size;

    if (selectedCount > 0) {
      selectionBar.style.display = "flex";
      selectionInfo.textContent = `${selectedCount}개 파일 선택됨`;
    } else {
      selectionBar.style.display = "none";
    }

    // 붙여넣기 버튼 상태
    const pasteBtn = document.getElementById("pasteFiles");
    pasteBtn.disabled = this.clipboardFiles.length === 0;
  }

  previewFile(fileId) {
    const fileInfo = this.uploadedFiles.find((f) => f.id === fileId);
    if (!fileInfo) return;

    this.currentPreviewFile = fileInfo;
    const previewContainer = document.getElementById("previewContainer");
    const previewControls = document.getElementById("previewControls");

    let previewHTML = "";

    if (this.isImageFile(fileInfo.file)) {
      previewHTML = `
        <div class="image-preview">
          <img src="${URL.createObjectURL(fileInfo.file)}" alt="${
        fileInfo.name
      }">
          <div class="image-info">
            <h4>${fileInfo.name}</h4>
            <p>크기: ${this.formatFileSize(fileInfo.size)}</p>
            ${
              fileInfo.metadata.dimensions
                ? `<p>해상도: ${fileInfo.metadata.dimensions}</p>`
                : ""
            }
          </div>
        </div>
      `;
    } else if (fileInfo.type.startsWith("text/")) {
      this.previewTextFile(fileInfo, previewContainer);
      return;
    } else if (fileInfo.type === "application/pdf") {
      previewHTML = `
        <div class="pdf-preview">
          <iframe src="${URL.createObjectURL(fileInfo.file)}" title="${
        fileInfo.name
      }"></iframe>
          <div class="pdf-info">
            <h4>${fileInfo.name}</h4>
            <p>크기: ${this.formatFileSize(fileInfo.size)}</p>
          </div>
        </div>
      `;
    } else {
      previewHTML = `
        <div class="file-preview">
          <div class="file-icon-large">${this.getFileIcon(fileInfo.type)}</div>
          <h4>${fileInfo.name}</h4>
          <p>타입: ${fileInfo.type || "알 수 없음"}</p>
          <p>크기: ${this.formatFileSize(fileInfo.size)}</p>
          <p>이 파일 형식은 미리보기를 지원하지 않습니다.</p>
        </div>
      `;
    }

    previewContainer.innerHTML = previewHTML;
    previewControls.style.display = "flex";
  }

  async previewTextFile(fileInfo, container) {
    try {
      const text = await fileInfo.file.text();
      const previewHTML = `
        <div class="text-preview">
          <div class="text-header">
            <h4>${fileInfo.name}</h4>
            <p>크기: ${this.formatFileSize(fileInfo.size)}</p>
          </div>
          <div class="text-content">
            <pre><code>${this.escapeHtml(text.substring(0, 10000))}</code></pre>
            ${text.length > 10000 ? "<p>... (일부만 표시됨)</p>" : ""}
          </div>
        </div>
      `;
      container.innerHTML = previewHTML;
    } catch (error) {
      container.innerHTML = `
        <div class="preview-error">
          <h4>텍스트 파일 읽기 오류</h4>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  downloadFile(fileId) {
    const fileInfo = this.uploadedFiles.find((f) => f.id === fileId);
    if (!fileInfo) return;

    this.downloadFileBlob(fileInfo.file, fileInfo.name);
    this.showNotification(`${fileInfo.name} 다운로드를 시작합니다.`, "info");
  }

  deleteFile(fileId) {
    if (confirm("정말 이 파일을 삭제하시겠습니까?")) {
      const index = this.uploadedFiles.findIndex((f) => f.id === fileId);
      if (index !== -1) {
        const fileInfo = this.uploadedFiles[index];
        this.uploadedFiles.splice(index, 1);
        this.selectedFiles.delete(fileId);

        this.updateFileDisplay();
        this.updateStats();
        this.showNotification(`${fileInfo.name}이 삭제되었습니다.`, "success");
      }
    }
  }

  // 파일 관리 기능들
  selectAll() {
    this.selectedFiles.clear();
    this.uploadedFiles.forEach((fileInfo) => {
      fileInfo.selected = true;
      this.selectedFiles.add(fileInfo.id);
    });
    this.updateFileDisplay();
  }

  selectNone() {
    this.selectedFiles.clear();
    this.uploadedFiles.forEach((fileInfo) => {
      fileInfo.selected = false;
    });
    this.updateFileDisplay();
  }

  downloadSelected() {
    const selectedFileInfos = this.uploadedFiles.filter((f) =>
      this.selectedFiles.has(f.id)
    );

    if (selectedFileInfos.length === 0) {
      this.showNotification("선택된 파일이 없습니다.", "warning");
      return;
    }

    if (selectedFileInfos.length === 1) {
      this.downloadFile(selectedFileInfos[0].id);
    } else {
      this.downloadMultipleFiles(selectedFileInfos);
    }
  }

  async downloadMultipleFiles(fileInfos) {
    this.showNotification("ZIP 파일 생성 중...", "info");

    // 실제 구현에서는 JSZip 등의 라이브러리를 사용할 수 있습니다
    // 여기서는 시뮬레이션만 합니다
    setTimeout(() => {
      this.showNotification(
        `${fileInfos.length}개 파일 다운로드가 시작됩니다.`,
        "success"
      );

      // 개별 파일 다운로드
      fileInfos.forEach((fileInfo, index) => {
        setTimeout(() => {
          this.downloadFileBlob(fileInfo.file, fileInfo.name);
        }, index * 100);
      });
    }, 1000);
  }

  deleteSelected() {
    const selectedCount = this.selectedFiles.size;

    if (selectedCount === 0) {
      this.showNotification("선택된 파일이 없습니다.", "warning");
      return;
    }

    if (confirm(`선택된 ${selectedCount}개 파일을 정말 삭제하시겠습니까?`)) {
      const selectedIds = Array.from(this.selectedFiles);

      selectedIds.forEach((fileId) => {
        const index = this.uploadedFiles.findIndex((f) => f.id === fileId);
        if (index !== -1) {
          this.uploadedFiles.splice(index, 1);
        }
      });

      this.selectedFiles.clear();
      this.updateFileDisplay();
      this.updateStats();
      this.showNotification(
        `${selectedCount}개 파일이 삭제되었습니다.`,
        "success"
      );
    }
  }

  copySelected() {
    const selectedFileInfos = this.uploadedFiles.filter((f) =>
      this.selectedFiles.has(f.id)
    );

    if (selectedFileInfos.length === 0) {
      this.showNotification("선택된 파일이 없습니다.", "warning");
      return;
    }

    this.clipboardFiles = selectedFileInfos.map((f) => ({
      ...f,
      operation: "copy",
    }));
    this.updateSelectionBar();
    this.showNotification(
      `${selectedFileInfos.length}개 파일이 복사되었습니다.`,
      "info"
    );
  }

  cutSelected() {
    const selectedFileInfos = this.uploadedFiles.filter((f) =>
      this.selectedFiles.has(f.id)
    );

    if (selectedFileInfos.length === 0) {
      this.showNotification("선택된 파일이 없습니다.", "warning");
      return;
    }

    this.clipboardFiles = selectedFileInfos.map((f) => ({
      ...f,
      operation: "cut",
    }));
    this.updateSelectionBar();
    this.showNotification(
      `${selectedFileInfos.length}개 파일이 잘라내기되었습니다.`,
      "info"
    );
  }

  pasteFiles() {
    if (this.clipboardFiles.length === 0) {
      this.showNotification("붙여넣을 파일이 없습니다.", "warning");
      return;
    }

    this.clipboardFiles.forEach((clipboardFile) => {
      if (clipboardFile.operation === "copy") {
        // 파일 복사 (새 ID로 복제)
        const newFileInfo = {
          ...clipboardFile,
          id: this.generateFileId(),
          selected: false,
          operation: undefined,
        };
        this.uploadedFiles.push(newFileInfo);
      } else if (clipboardFile.operation === "cut") {
        // 파일 이동 (현재 경로로)
        const fileInfo = this.uploadedFiles.find(
          (f) => f.id === clipboardFile.id
        );
        if (fileInfo) {
          fileInfo.webkitRelativePath = this.currentPath
            ? `${this.currentPath}/${fileInfo.name}`
            : fileInfo.name;
        }
      }
    });

    this.clipboardFiles = [];
    this.updateFileDisplay();
    this.updateSelectionBar();
    this.updateStats();
    this.showNotification("파일이 붙여넣기되었습니다.", "success");
  }

  // 폴더 트리 업데이트
  updateFolderTree() {
    const folderTree = document.getElementById("folderTree");

    if (this.folderStructure.size === 0) {
      folderTree.innerHTML = `
        <div class="tree-placeholder">
          <p>폴더가 업로드되면 구조가 여기에 표시됩니다</p>
        </div>
      `;
      return;
    }

    const rootFolders = Array.from(this.folderStructure.values()).filter(
      (folder) => !folder.parentPath
    );

    let treeHTML = '<div class="folder-tree-content">';
    rootFolders.forEach((folder) => {
      treeHTML += this.createFolderTreeNode(folder, 0);
    });
    treeHTML += "</div>";

    folderTree.innerHTML = treeHTML;
    this.bindFolderTreeEvents();
  }

  createFolderTreeNode(folder, level) {
    const indent = level * 20;
    const hasSubfolders = folder.subfolders.length > 0;
    const expandIcon = hasSubfolders ? (folder.expanded ? "📂" : "📁") : "📄";

    let html = `
      <div class="folder-node" style="margin-left: ${indent}px" data-path="${
      folder.path
    }">
        <div class="folder-header" data-path="${folder.path}">
          ${
            hasSubfolders
              ? `<button class="expand-btn">${
                  folder.expanded ? "▼" : "▶"
                }</button>`
              : ""
          }
          <span class="folder-icon">${expandIcon}</span>
          <span class="folder-name">${folder.name}</span>
          <span class="folder-count">(${folder.files.length}개 파일)</span>
        </div>
    `;

    if (folder.expanded && hasSubfolders) {
      html += '<div class="folder-children">';
      folder.subfolders.forEach((subfolderPath) => {
        const subfolder = this.folderStructure.get(subfolderPath);
        if (subfolder) {
          html += this.createFolderTreeNode(subfolder, level + 1);
        }
      });
      html += "</div>";
    }

    html += "</div>";
    return html;
  }

  bindFolderTreeEvents() {
    document.querySelectorAll(".folder-header").forEach((header) => {
      header.addEventListener("click", (e) => {
        const path = e.currentTarget.dataset.path;
        const folder = this.folderStructure.get(path);

        if (folder && folder.subfolders.length > 0) {
          folder.expanded = !folder.expanded;
          this.updateFolderTree();
        }

        // 폴더 내용 표시
        this.currentPath = path;
        this.updateFileDisplay();
        this.updatePathBreadcrumb();
      });
    });
  }

  updatePathBreadcrumb() {
    const breadcrumb = document.getElementById("pathBreadcrumb");

    if (!this.currentPath) {
      breadcrumb.innerHTML = '<span class="path-item active">📂 루트</span>';
      return;
    }

    const pathParts = this.currentPath.split("/");
    let html = '<span class="path-item" data-path="">📂 루트</span>';

    let currentPath = "";
    pathParts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = index === pathParts.length - 1;
      html += ` <span class="path-separator">›</span> `;
      html += `<span class="path-item ${
        isLast ? "active" : ""
      }" data-path="${currentPath}">📁 ${part}</span>`;
    });

    breadcrumb.innerHTML = html;

    // 경로 클릭 이벤트
    breadcrumb.querySelectorAll(".path-item").forEach((item) => {
      item.addEventListener("click", () => {
        this.currentPath = item.dataset.path;
        this.updateFileDisplay();
        this.updatePathBreadcrumb();
      });
    });
  }

  // 통계 업데이트
  updateStats() {
    const totalFiles = this.uploadedFiles.length;
    const totalFolders = this.folderStructure.size;
    const totalSize = this.uploadedFiles.reduce(
      (sum, file) => sum + file.size,
      0
    );

    document.getElementById("totalFiles").textContent = totalFiles;
    document.getElementById("totalFolders").textContent = totalFolders;
    document.getElementById("totalStorageSize").textContent =
      this.formatFileSize(totalSize);

    // 파일 타입별 차트 업데이트
    this.updateFileTypeChart();

    // 필터 카운트 업데이트
    this.updateFilterCounts();
  }

  updateFilterCounts() {
    Object.keys(this.filters).forEach((category) => {
      const count = this.uploadedFiles.filter(
        (f) => f.category === category
      ).length;
      const filterElement = document.querySelector(
        `#filter${category.charAt(0).toUpperCase() + category.slice(1)} + span`
      );
      if (filterElement) {
        const text = filterElement.textContent;
        const newText = text.replace(/\(\d+\)/, `(${count})`);
        filterElement.textContent = newText;
      }
    });
  }

  getFilterCount(category) {
    return this.uploadedFiles.filter((f) => f.category === category).length;
  }

  updateFileTypeChart() {
    const canvas = document.getElementById("fileTypeChart");
    const ctx = canvas.getContext("2d");

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.uploadedFiles.length === 0) return;

    // 카테고리별 파일 수 계산
    const categoryCounts = {};
    Object.keys(this.filters).forEach((category) => {
      categoryCounts[category] = this.uploadedFiles.filter(
        (f) => f.category === category
      ).length;
    });

    // 차트 그리기
    const colors = {
      images: "#ff6b6b",
      documents: "#4ecdc4",
      videos: "#45b7d1",
      audio: "#96ceb4",
      archives: "#ffeaa7",
      others: "#dda0dd",
    };

    const total = Object.values(categoryCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    if (total === 0) return;

    let currentAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count === 0) return;

      const sliceAngle = (count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = colors[category];
      ctx.fill();
      ctx.stroke();

      // 레이블
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${category} (${count})`, labelX, labelY);

      currentAngle += sliceAngle;
    });
  }

  // 뷰 모드 및 정렬
  setViewMode(mode) {
    this.viewMode = mode;

    document
      .querySelectorAll(".view-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`${mode}View`).classList.add("active");

    this.updateFileDisplay();
    this.saveSettings();
  }

  // 업로드 시뮬레이션
  startUploadSimulation(files) {
    if (this.isUploading) return;

    this.isUploading = true;
    this.uploadQueue = [...files];
    this.totalUploadSize = files.reduce((sum, file) => sum + file.size, 0);
    this.uploadedSize = 0;

    const progressSection = document.getElementById("progressSection");
    progressSection.style.display = "block";

    this.processUploadQueue();
  }

  async processUploadQueue() {
    const parallelUploads = parseInt(
      document.getElementById("parallelUploads").value
    );
    const chunkSize = parseInt(document.getElementById("chunkSize").value);

    while (this.uploadQueue.length > 0 && this.isUploading) {
      const batch = this.uploadQueue.splice(0, parallelUploads);
      const uploadPromises = batch.map((file) =>
        this.simulateFileUpload(file, chunkSize)
      );

      await Promise.all(uploadPromises);
    }

    if (this.uploadQueue.length === 0) {
      this.completeUpload();
    }
  }

  async simulateFileUpload(file, chunkSize) {
    const fileInfo = this.uploadedFiles.find((f) => f.file === file);
    if (!fileInfo) return;

    fileInfo.uploadStatus = "uploading";

    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      if (!this.isUploading) break;

      await new Promise((resolve) => setTimeout(resolve, 50)); // 업로드 지연 시뮬레이션

      const progress = ((i + 1) / totalChunks) * 100;
      fileInfo.uploadProgress = progress;

      this.updateUploadProgress();
    }

    fileInfo.uploadStatus = "completed";
    fileInfo.uploadProgress = 100;
    this.updateUploadProgress();
  }

  updateUploadProgress() {
    const completedFiles = this.uploadedFiles.filter(
      (f) => f.uploadStatus === "completed"
    );
    const uploadingFiles = this.uploadedFiles.filter(
      (f) => f.uploadStatus === "uploading"
    );

    // 전체 진행률 계산
    let totalProgress = 0;

    completedFiles.forEach((file) => {
      totalProgress += file.size;
    });

    uploadingFiles.forEach((file) => {
      totalProgress += (file.size * file.uploadProgress) / 100;
    });

    const overallPercentage =
      this.totalUploadSize > 0
        ? (totalProgress / this.totalUploadSize) * 100
        : 0;

    // UI 업데이트
    document.getElementById(
      "overallProgress"
    ).style.width = `${overallPercentage}%`;
    document.getElementById("overallPercentage").textContent = `${Math.round(
      overallPercentage
    )}%`;
    document.getElementById("uploadedSize").textContent =
      this.formatFileSize(totalProgress);
    document.getElementById("totalSize").textContent = this.formatFileSize(
      this.totalUploadSize
    );

    // 업로드 속도 계산 (시뮬레이션)
    const speed = Math.random() * 1000 + 500; // 500KB/s ~ 1.5MB/s
    document.getElementById("uploadSpeed").textContent = `${this.formatFileSize(
      speed
    )}/s`;

    // 개별 파일 진행률 업데이트
    this.updateFileProgressList();
    this.updateFileDisplay();
  }

  updateFileProgressList() {
    const progressList = document.getElementById("fileProgressList");
    const uploadingFiles = this.uploadedFiles.filter(
      (f) => f.uploadStatus !== "pending"
    );

    let html = "";
    uploadingFiles.forEach((file) => {
      const statusClass =
        file.uploadStatus === "completed"
          ? "completed"
          : file.uploadStatus === "error"
          ? "error"
          : "uploading";

      html += `
        <div class="file-progress-item ${statusClass}">
          <div class="progress-file-info">
            <span class="progress-file-name">${file.name}</span>
            <span class="progress-file-size">${this.formatFileSize(
              file.size
            )}</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${
                file.uploadProgress
              }%"></div>
            </div>
            <span class="progress-percentage">${Math.round(
              file.uploadProgress
            )}%</span>
          </div>
        </div>
      `;
    });

    progressList.innerHTML = html;
  }

  completeUpload() {
    this.isUploading = false;

    setTimeout(() => {
      document.getElementById("progressSection").style.display = "none";
      this.showNotification("모든 파일 업로드가 완료되었습니다!", "success");

      // 업로드 세션 카운트 증가
      const sessions =
        parseInt(document.getElementById("uploadSessions").textContent) + 1;
      document.getElementById("uploadSessions").textContent = sessions;
    }, 1000);
  }

  pauseUpload() {
    this.isUploading = false;
    this.showNotification("업로드가 일시정지되었습니다.", "info");
  }

  resumeUpload() {
    if (this.uploadQueue.length > 0) {
      this.isUploading = true;
      this.processUploadQueue();
      this.showNotification("업로드가 재개되었습니다.", "info");
    }
  }

  cancelUpload() {
    this.isUploading = false;
    this.uploadQueue = [];

    // 업로드 중인 파일들 상태 초기화
    this.uploadedFiles.forEach((file) => {
      if (file.uploadStatus === "uploading") {
        file.uploadStatus = "pending";
        file.uploadProgress = 0;
      }
    });

    document.getElementById("progressSection").style.display = "none";
    this.updateFileDisplay();
    this.showNotification("업로드가 취소되었습니다.", "warning");
  }

  // 기타 기능들
  clearAllFiles() {
    if (this.uploadedFiles.length === 0) {
      this.showNotification("삭제할 파일이 없습니다.", "info");
      return;
    }

    if (confirm("모든 파일을 삭제하시겠습니까?")) {
      this.uploadedFiles = [];
      this.folderStructure.clear();
      this.selectedFiles.clear();
      this.clipboardFiles = [];
      this.currentPath = "";

      this.updateFileDisplay();
      this.updateFolderTree();
      this.updateStats();
      this.updatePathBreadcrumb();

      this.showNotification("모든 파일이 삭제되었습니다.", "success");
    }
  }

  updateFileTypeFilters() {
    this.allowedFileTypes = [];

    document
      .querySelectorAll('.file-type-filters input[type="checkbox"]:checked')
      .forEach((checkbox) => {
        this.allowedFileTypes.push(checkbox.value);
      });

    this.saveSettings();
  }

  performSearch() {
    this.updateFileDisplay();

    if (this.searchQuery) {
      this.showNotification(
        `"${this.searchQuery}" 검색 결과를 표시합니다.`,
        "info"
      );
    }
  }

  expandAllFolders() {
    this.folderStructure.forEach((folder) => {
      folder.expanded = true;
    });
    this.updateFolderTree();
  }

  collapseAllFolders() {
    this.folderStructure.forEach((folder) => {
      folder.expanded = false;
    });
    this.updateFolderTree();
  }

  exportFolderStructure() {
    const structure = {};

    this.folderStructure.forEach((folder, path) => {
      structure[path] = {
        name: folder.name,
        parentPath: folder.parentPath,
        fileCount: folder.files.length,
        subfolderCount: folder.subfolders.length,
      };
    });

    this.downloadJSON(
      structure,
      `folder-structure-${this.getTimestamp()}.json`
    );
    this.showNotification("폴더 구조가 내보내졌습니다.", "success");
  }

  downloadCurrentFile() {
    if (this.currentPreviewFile) {
      this.downloadFile(this.currentPreviewFile.id);
    }
  }

  shareCurrentFile() {
    if (this.currentPreviewFile) {
      // 실제 구현에서는 Web Share API나 URL 생성 등을 사용
      const shareData = {
        title: this.currentPreviewFile.name,
        text: `파일 공유: ${this.currentPreviewFile.name}`,
        url: URL.createObjectURL(this.currentPreviewFile.file),
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // 폴백: 클립보드에 복사
        navigator.clipboard.writeText(shareData.url);
        this.showNotification("공유 URL이 클립보드에 복사되었습니다.", "info");
      }
    }
  }

  deleteCurrentFile() {
    if (this.currentPreviewFile) {
      this.deleteFile(this.currentPreviewFile.id);
      this.currentPreviewFile = null;

      const previewContainer = document.getElementById("previewContainer");
      const previewControls = document.getElementById("previewControls");

      previewContainer.innerHTML = `
        <div class="preview-placeholder">
          <div class="placeholder-icon">👁️</div>
          <h3>파일을 선택하면 미리보기가 표시됩니다</h3>
          <p>이미지, 텍스트, PDF 등 다양한 형식을 지원합니다</p>
        </div>
      `;
      previewControls.style.display = "none";
    }
  }

  renameCurrentFile() {
    if (this.currentPreviewFile) {
      const newName = prompt(
        "새 파일 이름을 입력하세요:",
        this.currentPreviewFile.name
      );

      if (newName && newName !== this.currentPreviewFile.name) {
        this.currentPreviewFile.name = newName;
        this.updateFileDisplay();
        this.showNotification("파일 이름이 변경되었습니다.", "success");
      }
    }
  }

  // 테스트 기능들
  simulateUpload() {
    if (this.uploadedFiles.length === 0) {
      this.showNotification("업로드할 파일이 없습니다.", "warning");
      return;
    }

    this.startUploadSimulation(this.uploadedFiles.map((f) => f.file));
  }

  stressTest() {
    this.showNotification("스트레스 테스트를 시작합니다...", "info");

    // 1000개의 가상 파일 생성
    for (let i = 0; i < 1000; i++) {
      const fakeFile = new File([`가상 파일 내용 ${i}`], `test-file-${i}.txt`, {
        type: "text/plain",
        lastModified: Date.now(),
      });

      const fileInfo = {
        id: this.generateFileId(),
        file: fakeFile,
        name: fakeFile.name,
        size: fakeFile.size,
        type: fakeFile.type,
        lastModified: fakeFile.lastModified,
        webkitRelativePath: "",
        category: "documents",
        thumbnail: null,
        metadata: {},
        uploadProgress: 0,
        uploadStatus: "pending",
        selected: false,
      };

      this.uploadedFiles.push(fileInfo);
    }

    this.updateFileDisplay();
    this.updateStats();
    this.showNotification("1000개 테스트 파일이 생성되었습니다.", "success");
  }

  generateSampleFiles() {
    const sampleFiles = [
      { name: "sample-image.jpg", type: "image/jpeg", size: 1024 * 1024 },
      {
        name: "sample-document.pdf",
        type: "application/pdf",
        size: 512 * 1024,
      },
      { name: "sample-text.txt", type: "text/plain", size: 2048 },
      { name: "sample-video.mp4", type: "video/mp4", size: 10 * 1024 * 1024 },
      { name: "sample-audio.mp3", type: "audio/mpeg", size: 3 * 1024 * 1024 },
    ];

    sampleFiles.forEach((sample) => {
      const fakeFile = new File([`샘플 파일 내용`], sample.name, {
        type: sample.type,
        lastModified: Date.now(),
      });

      // 실제 크기 시뮬레이션을 위해 size 속성 오버라이드
      Object.defineProperty(fakeFile, "size", {
        value: sample.size,
        writable: false,
      });

      const fileInfo = {
        id: this.generateFileId(),
        file: fakeFile,
        name: fakeFile.name,
        size: fakeFile.size,
        type: fakeFile.type,
        lastModified: fakeFile.lastModified,
        webkitRelativePath: "",
        category: this.getFileCategory(fakeFile),
        thumbnail: null,
        metadata: {},
        uploadProgress: 0,
        uploadStatus: "pending",
        selected: false,
      };

      this.uploadedFiles.push(fileInfo);
    });

    this.updateFileDisplay();
    this.updateStats();
    this.showNotification("샘플 파일들이 생성되었습니다.", "success");
  }

  exportAllData() {
    const exportData = {
      files: this.uploadedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
        webkitRelativePath: f.webkitRelativePath,
        category: f.category,
        metadata: f.metadata,
      })),
      folders: Array.from(this.folderStructure.entries()).map(
        ([path, folder]) => ({
          path,
          name: folder.name,
          parentPath: folder.parentPath,
          fileCount: folder.files.length,
          subfolderCount: folder.subfolders.length,
        })
      ),
      settings: {
        maxFileSize: this.maxFileSize,
        allowedFileTypes: this.allowedFileTypes,
        viewMode: this.viewMode,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        filters: this.filters,
      },
      exportTime: Date.now(),
    };

    this.downloadJSON(exportData, `drag-drop-data-${this.getTimestamp()}.json`);
    this.showNotification("모든 데이터가 내보내졌습니다.", "success");
  }

  // 키보드 단축키
  handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "a":
          event.preventDefault();
          this.selectAll();
          break;
        case "d":
          event.preventDefault();
          this.selectNone();
          break;
        case "c":
          if (this.selectedFiles.size > 0) {
            event.preventDefault();
            this.copySelected();
          }
          break;
        case "x":
          if (this.selectedFiles.size > 0) {
            event.preventDefault();
            this.cutSelected();
          }
          break;
        case "v":
          if (this.clipboardFiles.length > 0) {
            event.preventDefault();
            this.pasteFiles();
          }
          break;
      }
    }

    if (event.key === "Delete" && this.selectedFiles.size > 0) {
      this.deleteSelected();
    }
  }

  // 설정 저장/로드
  saveSettings() {
    const settings = {
      maxFileSize: this.maxFileSize,
      allowedFileTypes: this.allowedFileTypes,
      viewMode: this.viewMode,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      filters: this.filters,
    };

    localStorage.setItem("dragDropSettings", JSON.stringify(settings));
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem("dragDropSettings");
      if (saved) {
        const settings = JSON.parse(saved);

        this.maxFileSize = settings.maxFileSize || this.maxFileSize;
        this.allowedFileTypes =
          settings.allowedFileTypes || this.allowedFileTypes;
        this.viewMode = settings.viewMode || this.viewMode;
        this.sortBy = settings.sortBy || this.sortBy;
        this.sortOrder = settings.sortOrder || this.sortOrder;
        this.filters = { ...this.filters, ...settings.filters };

        // UI 반영
        if (document.getElementById("maxFileSize")) {
          document.getElementById("maxFileSize").value = this.maxFileSize;
        }
      }
    } catch (error) {
      console.warn("설정 로드 실패:", error);
    }
  }

  // 유틸리티 함수들
  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  downloadFileBlob(file, filename) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    this.downloadFileBlob(dataBlob, filename);
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  }

  showNotification(message, type) {
    // 기존 알림 제거
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    // 새 알림 생성
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 애니메이션 후 제거
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new DragAndDropDemo();
});
