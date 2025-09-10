import "./style.css";

// 화면 캡처 및 녹화 기능
class ScreenCapture {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.mediaStream = null;
    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      statusElement.innerHTML = `
        <span class="status-error">❌ 브라우저가 Screen Capture API를 지원하지 않습니다.</span>
      `;
      this.disableButtons();
      return false;
    }

    statusElement.innerHTML = `
      <span class="status-success">✅ Screen Capture API 지원됨</span>
    `;
    return true;
  }

  disableButtons() {
    document.getElementById("startCaptureBtn").disabled = true;
    document.getElementById("startRecordBtn").disabled = true;
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="screen-capture">
        <h1>🎥 화면 캡처 & 녹화</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <div class="control-section">
          <div class="button-group">
            <button id="startCaptureBtn" class="capture-btn">
              📸 화면 캡처하기
            </button>
            <button id="startRecordBtn" class="record-btn">
              🎬 화면 녹화 시작
            </button>
            <button id="stopRecordBtn" class="stop-btn" disabled>
              ⏹️ 녹화 중지
            </button>
          </div>
        </div>

        <div class="status-section">
          <p id="status">화면 캡처 또는 녹화를 시작해보세요!</p>
          <div class="recording-indicator" id="recordingIndicator" style="display: none;">
            <span class="recording-dot"></span>
            <span>녹화 중...</span>
            <span id="recordingTime">00:00</span>
          </div>
        </div>

        <div class="preview-section">
          <div class="video-container" id="videoContainer" style="display: none;">
            <h3>📺 라이브 미리보기</h3>
            <video id="liveVideo" autoplay muted playsinline></video>
          </div>
          
          <div class="captured-content" id="capturedContent" style="display: none;">
            <h3>📥 캡처된 콘텐츠</h3>
            <div id="mediaPreview"></div>
            <div class="download-section" id="downloadSection">
              <button id="downloadBtn" class="download-btn">
                💾 다운로드
              </button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>⚙️ 캡처 설정</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label for="videoQuality">비디오 품질:</label>
              <select id="videoQuality">
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p" selected>720p (HD)</option>
                <option value="480p">480p (SD)</option>
              </select>
            </div>
            <div class="setting-item">
              <label for="frameRate">프레임률:</label>
              <select id="frameRate">
                <option value="60">60 FPS</option>
                <option value="30" selected>30 FPS</option>
                <option value="15">15 FPS</option>
              </select>
            </div>
            <div class="setting-item">
              <label for="captureAudio">오디오 포함:</label>
              <input type="checkbox" id="captureAudio" checked>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ 사용 방법</h3>
          <ul>
            <li><strong>화면 캡처:</strong> 현재 화면의 스크린샷을 PNG 형태로 저장</li>
            <li><strong>화면 녹화:</strong> 화면 활동을 비디오로 녹화하여 WebM 형태로 저장</li>
            <li><strong>소스 선택:</strong> 전체 화면, 특정 창, 또는 브라우저 탭 선택 가능</li>
            <li><strong>품질 설정:</strong> 용도에 맞게 해상도와 프레임률 조정</li>
          </ul>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById("startCaptureBtn").addEventListener("click", () => {
      this.captureScreen();
    });

    document.getElementById("startRecordBtn").addEventListener("click", () => {
      this.startRecording();
    });

    document.getElementById("stopRecordBtn").addEventListener("click", () => {
      this.stopRecording();
    });

    document.getElementById("downloadBtn").addEventListener("click", () => {
      this.downloadCapturedContent();
    });
  }

  async captureScreen() {
    try {
      this.updateStatus("화면 캡처를 준비하는 중...");

      const constraints = this.getDisplayConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // 비디오 트랙에서 첫 번째 프레임 캡처
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        // 캡처된 이미지를 미리보기로 표시
        canvas.toBlob((blob) => {
          this.showCapturedImage(blob, canvas.toDataURL());
          this.currentBlob = blob;
          this.currentFileName = `screen-capture-${this.getTimestamp()}.png`;
        }, "image/png");

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
        this.updateStatus("화면 캡처 완료! 다운로드 버튼을 클릭하세요.");
      });
    } catch (error) {
      console.error("화면 캡처 오류:", error);
      this.updateStatus("화면 캡처에 실패했습니다. 권한을 확인해주세요.");
    }
  }

  async startRecording() {
    try {
      this.updateStatus("화면 녹화를 시작하는 중...");

      const constraints = this.getDisplayConstraints();
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia(
        constraints
      );

      // 라이브 미리보기 표시
      this.showLivePreview(this.mediaStream);

      // MediaRecorder 설정
      const options = { mimeType: "video/webm" };
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
      this.recordedChunks = [];

      this.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      });

      this.mediaRecorder.addEventListener("stop", () => {
        this.handleRecordingStop();
      });

      // 녹화 시작
      this.mediaRecorder.start();
      this.isRecording = true;
      this.updateRecordingUI();
      this.startRecordingTimer();

      this.updateStatus("화면 녹화가 시작되었습니다!");
    } catch (error) {
      console.error("화면 녹화 오류:", error);
      this.updateStatus("화면 녹화에 실패했습니다. 권한을 확인해주세요.");
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // 스트림 정리
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      }

      this.updateRecordingUI();
      this.stopRecordingTimer();
      this.hideLivePreview();

      this.updateStatus("녹화가 완료되었습니다!");
    }
  }

  handleRecordingStop() {
    const blob = new Blob(this.recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    this.showCapturedVideo(blob, url);
    this.currentBlob = blob;
    this.currentFileName = `screen-recording-${this.getTimestamp()}.webm`;
  }

  getDisplayConstraints() {
    const videoQuality = document.getElementById("videoQuality").value;
    const frameRate = parseInt(document.getElementById("frameRate").value);
    const captureAudio = document.getElementById("captureAudio").checked;

    const resolutions = {
      "1080p": { width: 1920, height: 1080 },
      "720p": { width: 1280, height: 720 },
      "480p": { width: 854, height: 480 },
    };

    return {
      video: {
        ...resolutions[videoQuality],
        frameRate: frameRate,
      },
      audio: captureAudio,
    };
  }

  showLivePreview(stream) {
    const videoContainer = document.getElementById("videoContainer");
    const liveVideo = document.getElementById("liveVideo");

    liveVideo.srcObject = stream;
    videoContainer.style.display = "block";
  }

  hideLivePreview() {
    const videoContainer = document.getElementById("videoContainer");
    videoContainer.style.display = "none";
  }

  showCapturedImage(blob, dataUrl) {
    const capturedContent = document.getElementById("capturedContent");
    const mediaPreview = document.getElementById("mediaPreview");

    mediaPreview.innerHTML = `
      <div class="image-preview">
        <img src="${dataUrl}" alt="캡처된 화면" />
        <p>크기: ${this.formatFileSize(blob.size)}</p>
      </div>
    `;

    capturedContent.style.display = "block";
  }

  showCapturedVideo(blob, url) {
    const capturedContent = document.getElementById("capturedContent");
    const mediaPreview = document.getElementById("mediaPreview");

    mediaPreview.innerHTML = `
      <div class="video-preview">
        <video src="${url}" controls></video>
        <p>크기: ${this.formatFileSize(blob.size)}</p>
        <p>길이: ${this.recordingDuration}초</p>
      </div>
    `;

    capturedContent.style.display = "block";
  }

  updateRecordingUI() {
    const startRecordBtn = document.getElementById("startRecordBtn");
    const stopRecordBtn = document.getElementById("stopRecordBtn");
    const recordingIndicator = document.getElementById("recordingIndicator");

    if (this.isRecording) {
      startRecordBtn.disabled = true;
      stopRecordBtn.disabled = false;
      recordingIndicator.style.display = "flex";
    } else {
      startRecordBtn.disabled = false;
      stopRecordBtn.disabled = true;
      recordingIndicator.style.display = "none";
    }
  }

  startRecordingTimer() {
    this.recordingStartTime = Date.now();
    this.recordingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (elapsed % 60).toString().padStart(2, "0");

      document.getElementById(
        "recordingTime"
      ).textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingDuration = Math.floor(
        (Date.now() - this.recordingStartTime) / 1000
      );
    }
  }

  downloadCapturedContent() {
    if (this.currentBlob && this.currentFileName) {
      const url = URL.createObjectURL(this.currentBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this.currentFileName;
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      this.updateStatus("파일이 다운로드되었습니다!");
    }
  }

  updateStatus(message) {
    document.getElementById("status").textContent = message;
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
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
  new ScreenCapture();
});
