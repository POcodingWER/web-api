import "./style.css";

// 파일 압축 및 다운로드 기능
class FileCompressor {
  constructor() {
    this.selectedFile = null;
    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="file-compressor">
        <h1>파일 압축 다운로드</h1>
        
        <div class="upload-section">
          <input type="file" id="fileInput" class="file-input">
          <label for="fileInput" class="file-label">
            📁 파일 선택하기
          </label>
        </div>

        <div class="status-section">
          <p id="status">파일을 선택해주세요.</p>
        </div>

        <div class="action-section">
          <button id="compressAndDownloadBtn" disabled class="compress-btn">
            💾 압축 후 다운로드
          </button>
        </div>

        <div class="info-section">
          <div class="file-info" id="fileInfo" style="display: none;">
            <h3>파일 정보</h3>
            <p><strong>파일명:</strong> <span id="fileName"></span></p>
            <p><strong>원본 크기:</strong> <span id="originalSize"></span></p>
            <p><strong>압축 크기:</strong> <span id="compressedSize"></span></p>
            <p><strong>압축률:</strong> <span id="compressionRatio"></span></p>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const fileInput = document.getElementById("fileInput");
    const compressAndDownloadBtn = document.getElementById(
      "compressAndDownloadBtn"
    );
    const statusText = document.getElementById("status");

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (file) {
        this.selectedFile = file;
        compressAndDownloadBtn.disabled = false;
        statusText.textContent = `선택됨: ${file.name} (${this.formatFileSize(
          file.size
        )} Bytes)`;
        this.updateFileInfo(file);
      } else {
        this.selectedFile = null;
        compressAndDownloadBtn.disabled = true;
        statusText.textContent = "파일을 선택해주세요.";
        this.hideFileInfo();
      }
    });

    compressAndDownloadBtn.addEventListener("click", () => {
      if (this.selectedFile) {
        this.compressAndDownload(this.selectedFile);
      }
    });
  }

  async compressAndDownload(file) {
    try {
      const statusText = document.getElementById("status");
      statusText.textContent = "압축 중...";

      // 파일을 압축
      const compressedData = await this.compressFile(file);

      // 압축된 파일 다운로드
      this.downloadFile(compressedData, `${file.name}.gz`);

      // 압축 정보 업데이트
      this.updateCompressionInfo(file.size, compressedData.byteLength);

      statusText.textContent = "압축 완료! 다운로드가 시작됩니다.";
    } catch (error) {
      console.error("압축 중 오류 발생:", error);
      document.getElementById("status").textContent =
        "압축 중 오류가 발생했습니다.";
    }
  }

  async compressFile(file) {
    // CompressionStream API를 사용한 gzip 압축
    const readable = new ReadableStream({
      start(controller) {
        const reader = new FileReader();
        reader.onload = () => {
          controller.enqueue(new Uint8Array(reader.result));
          controller.close();
        };
        reader.readAsArrayBuffer(file);
      },
    });

    const compressionStream = new CompressionStream("gzip");
    const compressedStream = readable.pipeThrough(compressionStream);

    const response = new Response(compressedStream);
    const compressedArrayBuffer = await response.arrayBuffer();

    return compressedArrayBuffer;
  }

  downloadFile(data, filename) {
    const blob = new Blob([data], { type: "application/gzip" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(url);
  }

  updateFileInfo(file) {
    document.getElementById("fileName").textContent = file.name;
    document.getElementById("originalSize").textContent = this.formatFileSize(
      file.size
    );
    document.getElementById("fileInfo").style.display = "block";
  }

  updateCompressionInfo(originalSize, compressedSize) {
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    document.getElementById("compressedSize").textContent =
      this.formatFileSize(compressedSize);
    document.getElementById("compressionRatio").textContent = `${ratio}% 절약`;
  }

  hideFileInfo() {
    document.getElementById("fileInfo").style.display = "none";
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new FileCompressor();
});
