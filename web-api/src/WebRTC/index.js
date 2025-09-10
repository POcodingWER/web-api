import "./style.css";

console.log("🎥 WebRTC 스크립트 시작!");

class WebRTCAPI {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.dataChannel = null;
    this.isConnected = false;
    this.isCameraOn = false;
    this.isMicOn = false;
    this.isScreenSharing = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.constraints = {
      video: { width: 640, height: 480, frameRate: 30 },
      audio: true,
    };
    this.init();
  }

  init() {
    console.log("🎥 WebRTC 초기화 시작");
    this.checkWebRTCSupport();
    this.setupUI();
    this.setupEventListeners();
    this.setupPeerConnection();
    console.log("✅ WebRTC 초기화 완료");
  }

  checkWebRTCSupport() {
    console.log("🔍 WebRTC 지원 여부 확인 중...");

    const support = {
      getUserMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      getDisplayMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
      ),
      RTCPeerConnection: !!window.RTCPeerConnection,
      MediaRecorder: !!window.MediaRecorder,
    };

    console.log("WebRTC 지원 상태:", support);

    if (!support.getUserMedia) {
      this.showNotification(
        "이 브라우저는 getUserMedia를 지원하지 않습니다",
        "error"
      );
    }

    return support;
  }

  setupUI() {
    console.log("🖼️ UI 설정 시작");
    const appDiv = document.getElementById("app");
    if (!appDiv) {
      console.error("❌ #app 요소를 찾을 수 없습니다!");
      return;
    }

    const support = this.checkWebRTCSupport();

    appDiv.innerHTML = `
      <div class="webrtc-container">
        <header class="webrtc-header">
          <h1>🎥 WebRTC 데모</h1>
          <p>실시간 비디오, 오디오 및 데이터 통신</p>
          <div class="api-support">
            <div class="support-badge ${
              support.getUserMedia ? "supported" : "unsupported"
            }">
              ${support.getUserMedia ? "✅ getUserMedia" : "❌ getUserMedia"}
            </div>
            <div class="support-badge ${
              support.getDisplayMedia ? "supported" : "unsupported"
            }">
              ${support.getDisplayMedia ? "✅ Screen Share" : "❌ Screen Share"}
            </div>
            <div class="support-badge ${
              support.RTCPeerConnection ? "supported" : "unsupported"
            }">
              ${
                support.RTCPeerConnection
                  ? "✅ Peer Connection"
                  : "❌ Peer Connection"
              }
            </div>
            <div class="support-badge ${
              support.MediaRecorder ? "supported" : "unsupported"
            }">
              ${
                support.MediaRecorder
                  ? "✅ Media Recorder"
                  : "❌ Media Recorder"
              }
            </div>
          </div>
        </header>

        <main class="webrtc-main">
          <div class="video-section">
            <div class="webrtc-card primary">
              <h2>📹 로컬 비디오</h2>
              <div class="video-container">
                <video id="localVideo" class="video-element" autoplay muted playsinline>
                  <div class="video-placeholder">
                    <span class="placeholder-icon">📹</span>
                    <span class="placeholder-text">카메라를 시작하세요</span>
                  </div>
                </video>
                <div class="video-overlay">
                  <div class="video-status" id="localVideoStatus">대기 중</div>
                  <div class="video-info" id="localVideoInfo"></div>
                </div>
              </div>

              <div class="media-controls">
                <button id="startCamera" class="btn-primary">
                  📹 카메라 시작
                </button>
                <button id="stopCamera" class="btn-secondary" disabled>
                  🔴 카메라 중지
                </button>
                <button id="toggleMic" class="btn-accent" disabled>
                  🎤 마이크 토글
                </button>
                <button id="startScreenShare" class="btn-warning">
                  🖥️ 화면 공유
                </button>
              </div>
            </div>

            <div class="webrtc-card">
              <h2>📺 원격 비디오</h2>
              <div class="video-container">
                <video id="remoteVideo" class="video-element" autoplay playsinline>
                  <div class="video-placeholder">
                    <span class="placeholder-icon">📺</span>
                    <span class="placeholder-text">연결을 기다리는 중</span>
                  </div>
                </video>
                <div class="video-overlay">
                  <div class="video-status" id="remoteVideoStatus">연결 안됨</div>
                  <div class="video-info" id="remoteVideoInfo"></div>
                </div>
              </div>

              <div class="connection-status">
                <div class="status-item">
                  <span class="status-label">연결 상태:</span>
                  <span class="status-value" id="connectionStatus">disconnected</span>
                </div>
                <div class="status-item">
                  <span class="status-label">ICE 상태:</span>
                  <span class="status-value" id="iceConnectionStatus">new</span>
                </div>
              </div>
            </div>
          </div>

          <div class="controls-section">
            <div class="webrtc-card">
              <h2>🎛️ 미디어 설정</h2>
              <div class="media-settings">
                <div class="setting-group">
                  <label for="videoResolution">비디오 해상도:</label>
                  <select id="videoResolution">
                    <option value="320x240">320x240 (QVGA)</option>
                    <option value="640x480" selected>640x480 (VGA)</option>
                    <option value="1280x720">1280x720 (HD)</option>
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                  </select>
                </div>

                <div class="setting-group">
                  <label for="frameRate">프레임레이트:</label>
                  <select id="frameRate">
                    <option value="15">15 FPS</option>
                    <option value="24">24 FPS</option>
                    <option value="30" selected>30 FPS</option>
                    <option value="60">60 FPS</option>
                  </select>
                </div>

                <div class="setting-group">
                  <label for="audioDevice">오디오 장치:</label>
                  <select id="audioDevice">
                    <option value="">기본 마이크</option>
                  </select>
                </div>

                <div class="setting-group">
                  <label for="videoDevice">비디오 장치:</label>
                  <select id="videoDevice">
                    <option value="">기본 카메라</option>
                  </select>
                </div>
              </div>

              <button id="applySettings" class="btn-primary">⚙️ 설정 적용</button>
            </div>

            <div class="webrtc-card">
              <h2>🎬 녹화 기능</h2>
              <div class="recording-controls">
                <div class="recording-status">
                  <div class="status-indicator" id="recordingStatus">
                    <span class="status-icon">⚫</span>
                    <span class="status-text">녹화 대기</span>
                  </div>
                  <div class="recording-time" id="recordingTime">00:00</div>
                </div>

                <div class="recording-buttons">
                  <button id="startRecording" class="btn-danger">
                    🔴 녹화 시작
                  </button>
                  <button id="stopRecording" class="btn-secondary" disabled>
                    ⏹️ 녹화 중지
                  </button>
                  <button id="downloadRecording" class="btn-accent" disabled>
                    💾 다운로드
                  </button>
                </div>

                <div class="recording-info" id="recordingInfo">
                  녹화를 시작하려면 먼저 카메라를 켜세요
                </div>
              </div>
            </div>
          </div>

          <div class="communication-section">
            <div class="webrtc-card">
              <h2>🤝 P2P 연결 데모</h2>
              <div class="peer-connection-demo">
                <div class="connection-info">
                  <p>실제 P2P 연결을 위해서는 시그널링 서버가 필요합니다.</p>
                  <p>여기서는 로컬 데모를 통해 WebRTC의 기본 기능을 체험할 수 있습니다.</p>
                </div>

                <div class="demo-controls">
                  <button id="createOffer" class="btn-primary">
                    📤 Offer 생성
                  </button>
                  <button id="createAnswer" class="btn-accent">
                    📥 Answer 생성
                  </button>
                  <button id="addIceCandidate" class="btn-warning">
                    🧊 ICE Candidate 추가
                  </button>
                </div>

                <div class="sdp-section">
                  <h3>📋 SDP (Session Description Protocol)</h3>
                  <textarea id="sdpOutput" class="sdp-textarea" readonly 
                    placeholder="SDP 정보가 여기에 표시됩니다"></textarea>
                </div>
              </div>
            </div>

            <div class="webrtc-card">
              <h2>💬 데이터 채널</h2>
              <div class="data-channel-demo">
                <div class="channel-status">
                  <div class="status-item">
                    <span class="status-label">채널 상태:</span>
                    <span class="status-value" id="dataChannelStatus">closed</span>
                  </div>
                </div>

                <div class="channel-controls">
                  <button id="openDataChannel" class="btn-primary">
                    📡 데이터 채널 열기
                  </button>
                  <button id="closeDataChannel" class="btn-secondary" disabled>
                    ❌ 채널 닫기
                  </button>
                </div>

                <div class="message-section">
                  <div class="message-input-group">
                    <input 
                      type="text" 
                      id="messageInput" 
                      placeholder="메시지를 입력하세요..."
                      disabled
                    >
                    <button id="sendMessage" class="btn-accent" disabled>
                      📤 전송
                    </button>
                  </div>

                  <div class="message-log" id="messageLog">
                    <div class="log-placeholder">메시지가 여기에 표시됩니다</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="webrtc-card">
              <h2>📊 실시간 통계</h2>
              <div class="stats-container" id="statsContainer">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-label">비디오 해상도</div>
                    <div class="stat-value" id="videoResolutionStat">-</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">비디오 FPS</div>
                    <div class="stat-value" id="videoFpsStat">-</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">비트레이트</div>
                    <div class="stat-value" id="bitrateStat">-</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">지연시간</div>
                    <div class="stat-value" id="latencyStat">-</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="webrtc-card">
              <h2>💡 WebRTC 활용법</h2>
              <div class="usage-content">
                <div class="code-example">
                  <h3>기본 사용법:</h3>
                  <pre><code>// 카메라 접근
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// 화면 공유
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true
});

// Peer Connection 생성
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// 로컬 스트림 추가
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});

// 원격 스트림 받기
pc.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

// 데이터 채널 생성
const dataChannel = pc.createDataChannel('chat');
dataChannel.onmessage = (event) => {
  console.log('받은 메시지:', event.data);
};</code></pre>
                </div>

                <div class="use-cases">
                  <h3>🎯 주요 사용 사례:</h3>
                  <ul class="use-case-list">
                    <li><strong>화상 회의:</strong> Zoom, Google Meet 같은 실시간 화상 통화</li>
                    <li><strong>라이브 스트리밍:</strong> Twitch, YouTube Live 방송</li>
                    <li><strong>온라인 게임:</strong> 실시간 멀티플레이어 게임</li>
                    <li><strong>파일 공유:</strong> P2P 파일 전송 시스템</li>
                    <li><strong>IoT 통신:</strong> 장치 간 직접 통신</li>
                    <li><strong>원격 제어:</strong> 화면 공유 및 원격 데스크톱</li>
                  </ul>
                </div>

                <div class="browser-support">
                  <h3>🌐 브라우저 지원:</h3>
                  <div class="support-grid">
                    <div class="support-item">
                      <span class="browser-name">Chrome</span>
                      <span class="support-status supported">23+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Firefox</span>
                      <span class="support-status supported">22+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Safari</span>
                      <span class="support-status supported">11+ ✅</span>
                    </div>
                    <div class="support-item">
                      <span class="browser-name">Edge</span>
                      <span class="support-status supported">12+ ✅</span>
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

    this.populateDeviceOptions();
    console.log("✅ HTML 삽입 완료");
  }

  setupEventListeners() {
    console.log("🎧 이벤트 리스너 설정 중...");

    // 카메라 제어
    const startCameraBtn = document.getElementById("startCamera");
    if (startCameraBtn) {
      startCameraBtn.addEventListener("click", () => this.startCamera());
    }

    const stopCameraBtn = document.getElementById("stopCamera");
    if (stopCameraBtn) {
      stopCameraBtn.addEventListener("click", () => this.stopCamera());
    }

    // 마이크 토글
    const toggleMicBtn = document.getElementById("toggleMic");
    if (toggleMicBtn) {
      toggleMicBtn.addEventListener("click", () => this.toggleMicrophone());
    }

    // 화면 공유
    const startScreenShareBtn = document.getElementById("startScreenShare");
    if (startScreenShareBtn) {
      startScreenShareBtn.addEventListener("click", () =>
        this.startScreenShare()
      );
    }

    // 설정 적용
    const applySettingsBtn = document.getElementById("applySettings");
    if (applySettingsBtn) {
      applySettingsBtn.addEventListener("click", () =>
        this.applyMediaSettings()
      );
    }

    // 녹화 제어
    const startRecordingBtn = document.getElementById("startRecording");
    if (startRecordingBtn) {
      startRecordingBtn.addEventListener("click", () => this.startRecording());
    }

    const stopRecordingBtn = document.getElementById("stopRecording");
    if (stopRecordingBtn) {
      stopRecordingBtn.addEventListener("click", () => this.stopRecording());
    }

    const downloadRecordingBtn = document.getElementById("downloadRecording");
    if (downloadRecordingBtn) {
      downloadRecordingBtn.addEventListener("click", () =>
        this.downloadRecording()
      );
    }

    // P2P 연결 데모
    const createOfferBtn = document.getElementById("createOffer");
    if (createOfferBtn) {
      createOfferBtn.addEventListener("click", () => this.createOffer());
    }

    const createAnswerBtn = document.getElementById("createAnswer");
    if (createAnswerBtn) {
      createAnswerBtn.addEventListener("click", () => this.createAnswer());
    }

    // 데이터 채널
    const openDataChannelBtn = document.getElementById("openDataChannel");
    if (openDataChannelBtn) {
      openDataChannelBtn.addEventListener("click", () =>
        this.openDataChannel()
      );
    }

    const closeDataChannelBtn = document.getElementById("closeDataChannel");
    if (closeDataChannelBtn) {
      closeDataChannelBtn.addEventListener("click", () =>
        this.closeDataChannel()
      );
    }

    const sendMessageBtn = document.getElementById("sendMessage");
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener("click", () => this.sendMessage());
    }

    // 메시지 입력 엔터키
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage();
        }
      });
    }

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  setupPeerConnection() {
    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);

    // ICE candidate 이벤트
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE Candidate:", event.candidate);
      }
    };

    // 원격 스트림 수신
    this.peerConnection.ontrack = (event) => {
      console.log("원격 스트림 수신:", event.streams);
      const remoteVideo = document.getElementById("remoteVideo");
      if (remoteVideo && event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
        this.remoteStream = event.streams[0];
        this.updateVideoStatus("remoteVideoStatus", "연결됨");
      }
    };

    // 연결 상태 변경
    this.peerConnection.onconnectionstatechange = () => {
      this.updateConnectionStatus();
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.updateConnectionStatus();
    };
  }

  async populateDeviceOptions() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioSelect = document.getElementById("audioDevice");
      const videoSelect = document.getElementById("videoDevice");

      if (audioSelect) {
        audioSelect.innerHTML = '<option value="">기본 마이크</option>';
        devices
          .filter((device) => device.kind === "audioinput")
          .forEach((device) => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.textContent =
              device.label || `마이크 ${audioSelect.children.length}`;
            audioSelect.appendChild(option);
          });
      }

      if (videoSelect) {
        videoSelect.innerHTML = '<option value="">기본 카메라</option>';
        devices
          .filter((device) => device.kind === "videoinput")
          .forEach((device) => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.textContent =
              device.label || `카메라 ${videoSelect.children.length}`;
            videoSelect.appendChild(option);
          });
      }
    } catch (error) {
      console.warn("장치 목록 조회 실패:", error);
    }
  }

  async startCamera() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(
        this.constraints
      );

      const localVideo = document.getElementById("localVideo");
      if (localVideo) {
        localVideo.srcObject = this.localStream;
      }

      this.isCameraOn = true;
      this.updateCameraControls();
      this.updateVideoStatus("localVideoStatus", "카메라 활성화");
      this.updateVideoInfo();

      // Peer Connection에 스트림 추가
      if (this.peerConnection) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      this.showNotification("카메라가 시작되었습니다", "success");

      // 통계 업데이트 시작
      this.startStatsUpdate();
    } catch (error) {
      console.error("카메라 시작 실패:", error);
      this.showNotification(`카메라 시작 실패: ${error.message}`, "error");
    }
  }

  stopCamera() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    const localVideo = document.getElementById("localVideo");
    if (localVideo) {
      localVideo.srcObject = null;
    }

    this.isCameraOn = false;
    this.updateCameraControls();
    this.updateVideoStatus("localVideoStatus", "카메라 중지됨");

    this.showNotification("카메라가 중지되었습니다", "info");
  }

  toggleMicrophone() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMicOn = audioTrack.enabled;

        const toggleMicBtn = document.getElementById("toggleMic");
        if (toggleMicBtn) {
          toggleMicBtn.textContent = this.isMicOn
            ? "🎤 마이크 켜짐"
            : "🔇 마이크 꺼짐";
        }

        this.showNotification(
          this.isMicOn ? "마이크가 켜졌습니다" : "마이크가 꺼졌습니다",
          "info"
        );
      }
    }
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const localVideo = document.getElementById("localVideo");
      if (localVideo) {
        localVideo.srcObject = screenStream;
      }

      // 기존 스트림 정리
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }

      this.localStream = screenStream;
      this.isScreenSharing = true;
      this.updateVideoStatus("localVideoStatus", "화면 공유 중");

      // 화면 공유 종료 감지
      screenStream.getVideoTracks()[0].onended = () => {
        this.isScreenSharing = false;
        this.updateVideoStatus("localVideoStatus", "화면 공유 종료됨");
        this.showNotification("화면 공유가 종료되었습니다", "info");
      };

      this.showNotification("화면 공유가 시작되었습니다", "success");
    } catch (error) {
      console.error("화면 공유 실패:", error);
      this.showNotification(`화면 공유 실패: ${error.message}`, "error");
    }
  }

  applyMediaSettings() {
    const resolutionSelect = document.getElementById("videoResolution");
    const frameRateSelect = document.getElementById("frameRate");
    const audioSelect = document.getElementById("audioDevice");
    const videoSelect = document.getElementById("videoDevice");

    if (resolutionSelect) {
      const [width, height] = resolutionSelect.value.split("x").map(Number);
      this.constraints.video.width = width;
      this.constraints.video.height = height;
    }

    if (frameRateSelect) {
      this.constraints.video.frameRate = parseInt(frameRateSelect.value);
    }

    if (audioSelect && audioSelect.value) {
      this.constraints.audio = { deviceId: audioSelect.value };
    }

    if (videoSelect && videoSelect.value) {
      this.constraints.video.deviceId = videoSelect.value;
    }

    this.showNotification("미디어 설정이 적용되었습니다", "success");

    // 카메라가 켜져있다면 재시작
    if (this.isCameraOn) {
      this.stopCamera();
      setTimeout(() => this.startCamera(), 500);
    }
  }

  async startRecording() {
    if (!this.localStream) {
      this.showNotification("먼저 카메라를 시작하세요", "warning");
      return;
    }

    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.localStream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "video/webm" });
        this.recordedBlob = blob;
        this.updateRecordingControls(false);
      };

      this.mediaRecorder.start();
      this.updateRecordingControls(true);
      this.startRecordingTimer();

      this.showNotification("녹화가 시작되었습니다", "success");
    } catch (error) {
      console.error("녹화 시작 실패:", error);
      this.showNotification(`녹화 시작 실패: ${error.message}`, "error");
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.stopRecordingTimer();
      this.showNotification("녹화가 중지되었습니다", "info");
    }
  }

  downloadRecording() {
    if (this.recordedBlob) {
      const url = URL.createObjectURL(this.recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification("녹화 파일이 다운로드되었습니다", "success");
    }
  }

  async createOffer() {
    if (!this.peerConnection) {
      this.showNotification("Peer Connection이 없습니다", "error");
      return;
    }

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const sdpOutput = document.getElementById("sdpOutput");
      if (sdpOutput) {
        sdpOutput.value = JSON.stringify(offer, null, 2);
      }

      this.showNotification("Offer가 생성되었습니다", "success");
    } catch (error) {
      console.error("Offer 생성 실패:", error);
      this.showNotification(`Offer 생성 실패: ${error.message}`, "error");
    }
  }

  async createAnswer() {
    if (!this.peerConnection) {
      this.showNotification("Peer Connection이 없습니다", "error");
      return;
    }

    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      const sdpOutput = document.getElementById("sdpOutput");
      if (sdpOutput) {
        sdpOutput.value = JSON.stringify(answer, null, 2);
      }

      this.showNotification("Answer가 생성되었습니다", "success");
    } catch (error) {
      console.error("Answer 생성 실패:", error);
      this.showNotification(`Answer 생성 실패: ${error.message}`, "error");
    }
  }

  openDataChannel() {
    if (!this.peerConnection) {
      this.showNotification("Peer Connection이 없습니다", "error");
      return;
    }

    try {
      this.dataChannel = this.peerConnection.createDataChannel("chat", {
        ordered: true,
      });

      this.dataChannel.onopen = () => {
        this.updateDataChannelStatus("open");
        this.showNotification("데이터 채널이 열렸습니다", "success");
      };

      this.dataChannel.onclose = () => {
        this.updateDataChannelStatus("closed");
        this.showNotification("데이터 채널이 닫혔습니다", "info");
      };

      this.dataChannel.onmessage = (event) => {
        this.addMessageToLog("받음", event.data);
      };

      this.dataChannel.onerror = (error) => {
        console.error("데이터 채널 에러:", error);
        this.showNotification("데이터 채널 오류가 발생했습니다", "error");
      };

      // 시뮬레이션을 위해 즉시 열림 상태로 설정
      setTimeout(() => {
        this.updateDataChannelStatus("open");
      }, 500);
    } catch (error) {
      console.error("데이터 채널 생성 실패:", error);
      this.showNotification(`데이터 채널 생성 실패: ${error.message}`, "error");
    }
  }

  closeDataChannel() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
      this.updateDataChannelStatus("closed");
    }
  }

  sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!message) return;

    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(message);
      this.addMessageToLog("보냄", message);
      messageInput.value = "";
    } else {
      // 시뮬레이션을 위해 로컬에서 메시지 표시
      this.addMessageToLog("보냄", message);
      messageInput.value = "";

      // 에코 메시지 시뮬레이션
      setTimeout(() => {
        this.addMessageToLog("받음", `Echo: ${message}`);
      }, 500);
    }
  }

  // UI 업데이트 메서드들
  updateCameraControls() {
    const startBtn = document.getElementById("startCamera");
    const stopBtn = document.getElementById("stopCamera");
    const toggleMicBtn = document.getElementById("toggleMic");

    if (startBtn) startBtn.disabled = this.isCameraOn;
    if (stopBtn) stopBtn.disabled = !this.isCameraOn;
    if (toggleMicBtn) toggleMicBtn.disabled = !this.isCameraOn;
  }

  updateVideoStatus(elementId, status) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = status;
    }
  }

  updateVideoInfo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const infoElement = document.getElementById("localVideoInfo");
        if (infoElement) {
          infoElement.textContent = `${settings.width}x${settings.height} @ ${settings.frameRate}fps`;
        }
      }
    }
  }

  updateConnectionStatus() {
    const connectionStatus = document.getElementById("connectionStatus");
    const iceConnectionStatus = document.getElementById("iceConnectionStatus");

    if (connectionStatus && this.peerConnection) {
      connectionStatus.textContent = this.peerConnection.connectionState;
    }

    if (iceConnectionStatus && this.peerConnection) {
      iceConnectionStatus.textContent = this.peerConnection.iceConnectionState;
    }
  }

  updateRecordingControls(isRecording) {
    const startBtn = document.getElementById("startRecording");
    const stopBtn = document.getElementById("stopRecording");
    const downloadBtn = document.getElementById("downloadRecording");
    const status = document.getElementById("recordingStatus");

    if (startBtn) startBtn.disabled = isRecording;
    if (stopBtn) stopBtn.disabled = !isRecording;
    if (downloadBtn) downloadBtn.disabled = isRecording || !this.recordedBlob;

    if (status) {
      const icon = status.querySelector(".status-icon");
      const text = status.querySelector(".status-text");

      if (icon) icon.textContent = isRecording ? "🔴" : "⚫";
      if (text) text.textContent = isRecording ? "녹화 중" : "녹화 대기";
    }
  }

  startRecordingTimer() {
    this.recordingStartTime = Date.now();
    this.recordingTimer = setInterval(() => {
      const elapsed = Date.now() - this.recordingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      const timeElement = document.getElementById("recordingTime");
      if (timeElement) {
        timeElement.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    }, 1000);
  }

  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  updateDataChannelStatus(status) {
    const statusElement = document.getElementById("dataChannelStatus");
    const openBtn = document.getElementById("openDataChannel");
    const closeBtn = document.getElementById("closeDataChannel");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendMessage");

    if (statusElement) {
      statusElement.textContent = status;
    }

    const isOpen = status === "open";
    if (openBtn) openBtn.disabled = isOpen;
    if (closeBtn) closeBtn.disabled = !isOpen;
    if (messageInput) messageInput.disabled = !isOpen;
    if (sendBtn) sendBtn.disabled = !isOpen;
  }

  addMessageToLog(type, message) {
    const messageLog = document.getElementById("messageLog");
    if (!messageLog) return;

    // 플레이스홀더 제거
    const placeholder = messageLog.querySelector(".log-placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    const messageEntry = document.createElement("div");
    messageEntry.className = `message-entry ${
      type === "보냄" ? "sent" : "received"
    }`;
    messageEntry.innerHTML = `
      <div class="message-header">
        <span class="message-type">${type}</span>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${message}</div>
    `;

    messageLog.appendChild(messageEntry);
    messageLog.scrollTop = messageLog.scrollHeight;

    // 최대 50개 메시지만 유지
    const messages = messageLog.querySelectorAll(".message-entry");
    if (messages.length > 50) {
      messages[0].remove();
    }
  }

  startStatsUpdate() {
    this.statsInterval = setInterval(() => {
      this.updateStats();
    }, 1000);
  }

  updateStats() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();

        const resolutionStat = document.getElementById("videoResolutionStat");
        const fpsStat = document.getElementById("videoFpsStat");

        if (resolutionStat) {
          resolutionStat.textContent = `${settings.width}x${settings.height}`;
        }

        if (fpsStat) {
          fpsStat.textContent = `${settings.frameRate || 30} FPS`;
        }
      }
    }

    // 시뮬레이션 데이터
    const bitrateStat = document.getElementById("bitrateStat");
    const latencyStat = document.getElementById("latencyStat");

    if (bitrateStat) {
      bitrateStat.textContent = `${Math.floor(
        Math.random() * 1000 + 500
      )} kbps`;
    }

    if (latencyStat) {
      latencyStat.textContent = `${Math.floor(Math.random() * 50 + 10)} ms`;
    }
  }

  // 정리
  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    if (this.dataChannel) {
      this.dataChannel.close();
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
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
  if (window.webrtcAPI) {
    window.webrtcAPI.cleanup();
  }
});

// 초기화
function initWebRTCAPI() {
  console.log("🚀 WebRTC API 초기화 함수 호출");
  window.webrtcAPI = new WebRTCAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initWebRTCAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initWebRTCAPI();
}

console.log("📄 WebRTC 스크립트 로드 완료, readyState:", document.readyState);
