import "./style.css";

// Media Recorder API 테스트 및 데모
class MediaRecorderDemo {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.recordingType = "audio"; // 'audio', 'video', 'screen'
    this.stream = null;
    this.recordingStartTime = null;
    this.recordingTimer = null;
    this.recordingDuration = 0;

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      statusElement.innerHTML = `
        <span class="status-error">❌ 브라우저가 Media Recorder API를 지원하지 않습니다.</span>
      `;
      this.disableButtons();
      return false;
    }

    statusElement.innerHTML = `
      <span class="status-success">✅ Media Recorder API 지원됨</span>
    `;
    return true;
  }

  disableButtons() {
    document.querySelectorAll(".record-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="media-recorder">
        <h1>🎙️ Media Recorder API 테스트</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <div class="recording-type-section">
          <h3>📊 녹화 타입 선택</h3>
          <div class="type-buttons">
            <button id="audioType" class="type-btn active" data-type="audio">
              🎤 오디오 녹화
            </button>
            <button id="videoType" class="type-btn" data-type="video">
              📹 비디오 녹화
            </button>
            <button id="screenType" class="type-btn" data-type="screen">
              🖥️ 화면 녹화
            </button>
          </div>
        </div>

        <div class="control-section">
          <div class="record-controls">
            <button id="startRecord" class="record-btn start-btn">
              ⏺️ 녹화 시작
            </button>
            <button id="pauseRecord" class="record-btn pause-btn" disabled>
              ⏸️ 일시정지
            </button>
            <button id="resumeRecord" class="record-btn resume-btn" disabled>
              ▶️ 재개
            </button>
            <button id="stopRecord" class="record-btn stop-btn" disabled>
              ⏹️ 녹화 중지
            </button>
          </div>
        </div>

        <div class="status-section">
          <p id="status">녹화 타입을 선택하고 녹화를 시작해보세요!</p>
          
          <div class="recording-indicator" id="recordingIndicator" style="display: none;">
            <span class="recording-dot"></span>
            <span id="recordingStatus">녹화 중...</span>
            <span id="recordingTime">00:00</span>
          </div>
          
          <div class="recording-info" id="recordingInfo" style="display: none;">
            <p><strong>녹화 형식:</strong> <span id="recordingFormat">-</span></p>
            <p><strong>코덱:</strong> <span id="recordingCodec">-</span></p>
            <p><strong>비트레이트:</strong> <span id="recordingBitrate">-</span></p>
          </div>
        </div>

        <div class="preview-section">
          <div class="live-preview" id="livePreview" style="display: none;">
            <h3>📺 실시간 미리보기</h3>
            <div class="media-container">
              <video id="liveVideo" autoplay muted playsinline style="display: none;"></video>
              <div id="audioVisualizer" style="display: none;">
                <canvas id="audioCanvas" width="400" height="100"></canvas>
                <p>🎵 오디오 레벨 시각화</p>
              </div>
            </div>
          </div>
          
          <div class="recorded-content" id="recordedContent" style="display: none;">
            <h3>📥 녹화된 콘텐츠</h3>
            <div id="mediaPlayback"></div>
            <div class="media-info" id="mediaInfo"></div>
            <div class="download-section">
              <button id="downloadBtn" class="download-btn">
                💾 다운로드
              </button>
              <button id="playBtn" class="play-btn">
                ▶️ 재생
              </button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>⚙️ 녹화 설정</h3>
          <div class="settings-grid">
            <div class="setting-group">
              <h4>비디오 설정</h4>
              <div class="setting-item">
                <label for="videoQuality">해상도:</label>
                <select id="videoQuality">
                  <option value="1080p">1080p (1920x1080)</option>
                  <option value="720p" selected>720p (1280x720)</option>
                  <option value="480p">480p (854x480)</option>
                  <option value="360p">360p (640x360)</option>
                </select>
              </div>
              <div class="setting-item">
                <label for="videoFrameRate">프레임률:</label>
                <select id="videoFrameRate">
                  <option value="60">60 FPS</option>
                  <option value="30" selected>30 FPS</option>
                  <option value="24">24 FPS</option>
                  <option value="15">15 FPS</option>
                </select>
              </div>
              <div class="setting-item">
                <label for="videoBitrate">비트레이트:</label>
                <select id="videoBitrate">
                  <option value="8000000">8 Mbps</option>
                  <option value="4000000" selected>4 Mbps</option>
                  <option value="2000000">2 Mbps</option>
                  <option value="1000000">1 Mbps</option>
                </select>
              </div>
            </div>
            
            <div class="setting-group">
              <h4>오디오 설정</h4>
              <div class="setting-item">
                <label for="audioSampleRate">샘플레이트:</label>
                <select id="audioSampleRate">
                  <option value="48000" selected>48 kHz</option>
                  <option value="44100">44.1 kHz</option>
                  <option value="22050">22.05 kHz</option>
                  <option value="16000">16 kHz</option>
                </select>
              </div>
              <div class="setting-item">
                <label for="audioBitrate">비트레이트:</label>
                <select id="audioBitrate">
                  <option value="320000">320 kbps</option>
                  <option value="256000">256 kbps</option>
                  <option value="192000" selected>192 kbps</option>
                  <option value="128000">128 kbps</option>
                  <option value="96000">96 kbps</option>
                </select>
              </div>
              <div class="setting-item">
                <label for="audioChannels">채널:</label>
                <select id="audioChannels">
                  <option value="2" selected>스테레오</option>
                  <option value="1">모노</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="supported-formats">
          <h3>📋 지원되는 포맷</h3>
          <div id="supportedFormats">포맷 확인 중...</div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Media Recorder API 정보</h3>
          <ul>
            <li><strong>오디오 녹화:</strong> 마이크로폰으로부터 오디오를 녹화합니다</li>
            <li><strong>비디오 녹화:</strong> 웹캠으로부터 비디오를 녹화합니다</li>
            <li><strong>화면 녹화:</strong> 화면 공유를 통해 화면을 녹화합니다</li>
            <li><strong>일시정지/재개:</strong> 녹화 중 일시정지하고 다시 재개할 수 있습니다</li>
            <li><strong>실시간 미리보기:</strong> 녹화되는 내용을 실시간으로 확인할 수 있습니다</li>
          </ul>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 녹화 타입 선택
    document.querySelectorAll(".type-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".type-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.recordingType = btn.dataset.type;
        this.updateStatus(`${this.getTypeText()} 녹화 모드가 선택되었습니다.`);
      });
    });

    // 녹화 컨트롤
    document
      .getElementById("startRecord")
      .addEventListener("click", () => this.startRecording());
    document
      .getElementById("pauseRecord")
      .addEventListener("click", () => this.pauseRecording());
    document
      .getElementById("resumeRecord")
      .addEventListener("click", () => this.resumeRecording());
    document
      .getElementById("stopRecord")
      .addEventListener("click", () => this.stopRecording());

    // 다운로드 및 재생
    document
      .getElementById("downloadBtn")
      .addEventListener("click", () => this.downloadRecording());
    document
      .getElementById("playBtn")
      .addEventListener("click", () => this.playRecording());
  }

  getTypeText() {
    const types = {
      audio: "🎤 오디오",
      video: "📹 비디오",
      screen: "🖥️ 화면",
    };
    return types[this.recordingType];
  }

  async startRecording() {
    try {
      this.updateStatus("녹화를 시작하는 중...");

      // 스트림 획득
      this.stream = await this.getMediaStream();

      // 지원되는 MIME 타입 확인
      const mimeType = this.getSupportedMimeType();

      // MediaRecorder 옵션 설정
      const options = this.getRecorderOptions(mimeType);

      // MediaRecorder 생성
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.recordedChunks = [];

      // 이벤트 리스너 설정
      this.setupRecorderEvents();

      // 미리보기 표시
      this.showLivePreview();

      // 녹화 시작
      this.mediaRecorder.start();
      this.isRecording = true;
      this.updateRecordingUI();
      this.startTimer();

      // 녹화 정보 표시
      this.showRecordingInfo(mimeType, options);

      this.updateStatus(`${this.getTypeText()} 녹화가 시작되었습니다!`);
    } catch (error) {
      console.error("녹화 시작 오류:", error);
      this.updateStatus(`녹화 시작에 실패했습니다: ${error.message}`);
    }
  }

  async getMediaStream() {
    const constraints = this.getStreamConstraints();

    switch (this.recordingType) {
      case "audio":
        return await navigator.mediaDevices.getUserMedia({
          audio: constraints.audio,
        });
      case "video":
        return await navigator.mediaDevices.getUserMedia(constraints);
      case "screen":
        const screenStream = await navigator.mediaDevices.getDisplayMedia(
          constraints
        );
        // 오디오가 필요한 경우 마이크 오디오 추가
        if (constraints.audio) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
              audio: constraints.audio,
            });
            const audioTrack = audioStream.getAudioTracks()[0];
            screenStream.addTrack(audioTrack);
          } catch (e) {
            console.warn("마이크 오디오 추가 실패:", e);
          }
        }
        return screenStream;
      default:
        throw new Error("지원하지 않는 녹화 타입입니다.");
    }
  }

  getStreamConstraints() {
    const videoQuality = document.getElementById("videoQuality").value;
    const frameRate = parseInt(document.getElementById("videoFrameRate").value);
    const sampleRate = parseInt(
      document.getElementById("audioSampleRate").value
    );
    const channelCount = parseInt(
      document.getElementById("audioChannels").value
    );

    const resolutions = {
      "1080p": { width: 1920, height: 1080 },
      "720p": { width: 1280, height: 720 },
      "480p": { width: 854, height: 480 },
      "360p": { width: 640, height: 360 },
    };

    return {
      video:
        this.recordingType !== "audio"
          ? {
              ...resolutions[videoQuality],
              frameRate: frameRate,
            }
          : false,
      audio: {
        sampleRate: sampleRate,
        channelCount: channelCount,
        echoCancellation: true,
        noiseSuppression: true,
      },
    };
  }

  getSupportedMimeType() {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "audio/webm;codecs=opus",
      "audio/webm",
      "video/mp4",
      "audio/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  }

  getRecorderOptions(mimeType) {
    const videoBitrate = parseInt(
      document.getElementById("videoBitrate").value
    );
    const audioBitrate = parseInt(
      document.getElementById("audioBitrate").value
    );

    return {
      mimeType: mimeType,
      videoBitsPerSecond:
        this.recordingType !== "audio" ? videoBitrate : undefined,
      audioBitsPerSecond: audioBitrate,
    };
  }

  setupRecorderEvents() {
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    });

    this.mediaRecorder.addEventListener("stop", () => {
      this.handleRecordingComplete();
    });

    this.mediaRecorder.addEventListener("pause", () => {
      document.getElementById("recordingStatus").textContent = "일시정지됨";
    });

    this.mediaRecorder.addEventListener("resume", () => {
      document.getElementById("recordingStatus").textContent = "녹화 중...";
    });
  }

  showLivePreview() {
    const livePreview = document.getElementById("livePreview");
    const liveVideo = document.getElementById("liveVideo");
    const audioVisualizer = document.getElementById("audioVisualizer");

    if (this.recordingType === "audio") {
      // 오디오 시각화
      liveVideo.style.display = "none";
      audioVisualizer.style.display = "block";
      this.setupAudioVisualizer();
    } else {
      // 비디오 미리보기
      liveVideo.srcObject = this.stream;
      liveVideo.style.display = "block";
      audioVisualizer.style.display = "none";
    }

    livePreview.style.display = "block";
  }

  setupAudioVisualizer() {
    const canvas = document.getElementById("audioCanvas");
    const ctx = canvas.getContext("2d");
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(this.stream);

    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.isRecording) return;

      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#242424";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const r = barHeight + 25;
        const g = 250;
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }

  showRecordingInfo(mimeType, options) {
    const recordingInfo = document.getElementById("recordingInfo");
    const format = mimeType.split(";")[0];
    const codec = mimeType.includes("codecs=")
      ? mimeType.split("codecs=")[1]
      : "기본값";
    const bitrate =
      this.recordingType !== "audio"
        ? `Video: ${(options.videoBitsPerSecond / 1000000).toFixed(
            1
          )}Mbps, Audio: ${(options.audioBitsPerSecond / 1000).toFixed(0)}kbps`
        : `${(options.audioBitsPerSecond / 1000).toFixed(0)}kbps`;

    document.getElementById("recordingFormat").textContent = format;
    document.getElementById("recordingCodec").textContent = codec;
    document.getElementById("recordingBitrate").textContent = bitrate;

    recordingInfo.style.display = "block";
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
      this.updateRecordingUI();
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
      this.updateRecordingUI();
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopTimer();
      this.updateRecordingUI();

      // 스트림 정리
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      this.hideLivePreview();
      this.updateStatus("녹화가 완료되었습니다!");
    }
  }

  handleRecordingComplete() {
    const blob = new Blob(this.recordedChunks, {
      type: this.mediaRecorder.mimeType,
    });

    this.currentBlob = blob;
    this.currentFileName = this.generateFileName();

    this.showRecordedContent(blob);
  }

  generateFileName() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const extension = this.getFileExtension();
    return `${this.recordingType}-recording-${timestamp}.${extension}`;
  }

  getFileExtension() {
    if (this.mediaRecorder.mimeType.includes("webm")) return "webm";
    if (this.mediaRecorder.mimeType.includes("mp4")) return "mp4";
    return "webm";
  }

  showRecordedContent(blob) {
    const recordedContent = document.getElementById("recordedContent");
    const mediaPlayback = document.getElementById("mediaPlayback");
    const mediaInfo = document.getElementById("mediaInfo");

    const url = URL.createObjectURL(blob);

    if (this.recordingType === "audio") {
      mediaPlayback.innerHTML = `
        <audio controls style="width: 100%;">
          <source src="${url}" type="${this.mediaRecorder.mimeType}">
        </audio>
      `;
    } else {
      mediaPlayback.innerHTML = `
        <video controls style="width: 100%; max-width: 600px;">
          <source src="${url}" type="${this.mediaRecorder.mimeType}">
        </video>
      `;
    }

    mediaInfo.innerHTML = `
      <p><strong>파일 크기:</strong> ${this.formatFileSize(blob.size)}</p>
      <p><strong>녹화 시간:</strong> ${this.formatDuration(
        this.recordingDuration
      )}</p>
      <p><strong>MIME 타입:</strong> ${this.mediaRecorder.mimeType}</p>
    `;

    recordedContent.style.display = "block";
  }

  hideLivePreview() {
    document.getElementById("livePreview").style.display = "none";
    document.getElementById("recordingInfo").style.display = "none";
  }

  updateRecordingUI() {
    const startBtn = document.getElementById("startRecord");
    const pauseBtn = document.getElementById("pauseRecord");
    const resumeBtn = document.getElementById("resumeRecord");
    const stopBtn = document.getElementById("stopRecord");
    const indicator = document.getElementById("recordingIndicator");

    if (this.isRecording) {
      if (this.mediaRecorder.state === "recording") {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
        stopBtn.disabled = false;
      } else if (this.mediaRecorder.state === "paused") {
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
        stopBtn.disabled = false;
      }
      indicator.style.display = "flex";
    } else {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      stopBtn.disabled = true;
      indicator.style.display = "none";
    }
  }

  startTimer() {
    this.recordingStartTime = Date.now();
    this.recordingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      document.getElementById("recordingTime").textContent =
        this.formatDuration(elapsed);
    }, 1000);
  }

  stopTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingDuration = Math.floor(
        (Date.now() - this.recordingStartTime) / 1000
      );
    }
  }

  downloadRecording() {
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

  playRecording() {
    const media = document.querySelector(
      "#mediaPlayback audio, #mediaPlayback video"
    );
    if (media) {
      media.currentTime = 0;
      media.play();
    }
  }

  updateStatus(message) {
    document.getElementById("status").textContent = message;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}

// 지원되는 포맷 확인 함수
function checkSupportedFormats() {
  const formats = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/webm",
    "audio/webm;codecs=opus",
    "audio/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
    "audio/mp4;codecs=aac",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  const supportedFormats = formats.filter((format) =>
    MediaRecorder.isTypeSupported(format)
  );

  const formatsList = document.getElementById("supportedFormats");
  if (supportedFormats.length > 0) {
    formatsList.innerHTML = `
      <div class="formats-list">
        ${supportedFormats
          .map((format) => `<span class="format-tag">${format}</span>`)
          .join("")}
      </div>
    `;
  } else {
    formatsList.innerHTML =
      '<p class="no-formats">지원되는 포맷이 없습니다.</p>';
  }
}

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new MediaRecorderDemo();
  setTimeout(checkSupportedFormats, 100);
});
