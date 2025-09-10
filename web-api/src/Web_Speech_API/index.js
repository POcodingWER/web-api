import "./style.css";

// Web Speech API 테스트 및 데모
class WebSpeechDemo {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isTranscribing = false;
    this.voices = [];
    this.currentUtterance = null;
    this.recognitionResults = [];

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
    this.loadVoices();
    this.setupSpeechRecognition();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");
    const speechRecognitionSupport =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    const speechSynthesisSupport = "speechSynthesis" in window;

    let statusHTML = "";

    if (speechRecognitionSupport && speechSynthesisSupport) {
      statusHTML = `<span class="status-success">✅ Web Speech API 완전 지원됨</span>`;
    } else if (speechRecognitionSupport) {
      statusHTML = `<span class="status-warning">⚠️ 음성 인식만 지원됨 (음성 합성 미지원)</span>`;
    } else if (speechSynthesisSupport) {
      statusHTML = `<span class="status-warning">⚠️ 음성 합성만 지원됨 (음성 인식 미지원)</span>`;
    } else {
      statusHTML = `<span class="status-error">❌ Web Speech API가 지원되지 않습니다</span>`;
      this.disableButtons();
    }

    statusElement.innerHTML = statusHTML;
    return speechRecognitionSupport || speechSynthesisSupport;
  }

  disableButtons() {
    document.querySelectorAll(".speech-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="web-speech">
        <h1>🗣️ Web Speech API 테스트</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <!-- 음성 인식 섹션 -->
        <div class="speech-section recognition-section">
          <h2>🎤 음성 인식 (Speech Recognition)</h2>
          
          <div class="recognition-controls">
            <div class="control-group">
              <button id="startRecognition" class="speech-btn recognition-btn">
                🎙️ 음성 인식 시작
              </button>
              <button id="stopRecognition" class="speech-btn stop-btn" disabled>
                ⏹️ 인식 중지
              </button>
              <button id="clearResults" class="speech-btn clear-btn">
                🗑️ 결과 지우기
              </button>
            </div>
            
            <div class="recognition-status" id="recognitionStatus">
              <span class="status-text">음성 인식을 시작해보세요</span>
              <div class="listening-indicator" id="listeningIndicator" style="display: none;">
                <span class="listening-dot"></span>
                <span>듣고 있습니다...</span>
              </div>
            </div>
          </div>

          <div class="recognition-settings">
            <h4>🔧 인식 설정</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <label for="recognitionLang">언어:</label>
                <select id="recognitionLang">
                  <option value="ko-KR" selected>한국어</option>
                  <option value="en-US">English (US)</option>
                  <option value="ja-JP">日本語</option>
                  <option value="zh-CN">中文 (普通话)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                </select>
              </div>
              <div class="setting-item">
                <label for="continuousMode">연속 인식:</label>
                <input type="checkbox" id="continuousMode" checked>
              </div>
              <div class="setting-item">
                <label for="interimResults">중간 결과:</label>
                <input type="checkbox" id="interimResults" checked>
              </div>
              <div class="setting-item">
                <label for="maxAlternatives">대안 개수:</label>
                <select id="maxAlternatives">
                  <option value="1" selected>1개</option>
                  <option value="3">3개</option>
                  <option value="5">5개</option>
                </select>
              </div>
            </div>
          </div>

          <div class="recognition-results">
            <h4>📝 인식 결과</h4>
            <div class="results-container">
              <div id="interimResult" class="interim-result"></div>
              <div id="finalResults" class="final-results"></div>
            </div>
            <div class="results-stats" id="resultsStats" style="display: none;">
              <p><strong>총 인식 횟수:</strong> <span id="totalRecognitions">0</span></p>
              <p><strong>평균 신뢰도:</strong> <span id="averageConfidence">0%</span></p>
            </div>
          </div>
        </div>

        <!-- 음성 합성 섹션 -->
        <div class="speech-section synthesis-section">
          <h2>🔊 음성 합성 (Speech Synthesis)</h2>
          
          <div class="synthesis-controls">
            <div class="text-input-area">
              <label for="textToSpeak">읽을 텍스트:</label>
              <textarea id="textToSpeak" placeholder="여기에 읽을 텍스트를 입력하세요...">안녕하세요! Web Speech API를 테스트하고 있습니다. 이 텍스트가 음성으로 변환됩니다.</textarea>
            </div>
            
            <div class="control-group">
              <button id="speakText" class="speech-btn speak-btn">
                🗣️ 텍스트 읽기
              </button>
              <button id="pauseSpeech" class="speech-btn pause-btn" disabled>
                ⏸️ 일시정지
              </button>
              <button id="resumeSpeech" class="speech-btn resume-btn" disabled>
                ▶️ 재개
              </button>
              <button id="stopSpeech" class="speech-btn stop-btn" disabled>
                ⏹️ 중지
              </button>
            </div>
            
            <div class="synthesis-status" id="synthesisStatus">
              <span class="status-text">텍스트를 입력하고 읽기 버튼을 클릭하세요</span>
              <div class="speaking-indicator" id="speakingIndicator" style="display: none;">
                <span class="speaking-waves"></span>
                <span>읽는 중...</span>
              </div>
            </div>
          </div>

          <div class="synthesis-settings">
            <h4>🎛️ 음성 설정</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <label for="voiceSelect">음성:</label>
                <select id="voiceSelect">
                  <option value="">기본 음성</option>
                </select>
              </div>
              <div class="setting-item">
                <label for="speechRate">속도: <span id="rateValue">1.0</span></label>
                <input type="range" id="speechRate" min="0.1" max="3.0" step="0.1" value="1.0">
              </div>
              <div class="setting-item">
                <label for="speechPitch">음조: <span id="pitchValue">1.0</span></label>
                <input type="range" id="speechPitch" min="0" max="2" step="0.1" value="1.0">
              </div>
              <div class="setting-item">
                <label for="speechVolume">음량: <span id="volumeValue">1.0</span></label>
                <input type="range" id="speechVolume" min="0" max="1" step="0.1" value="1.0">
              </div>
            </div>
          </div>

          <div class="preset-texts">
            <h4>📚 샘플 텍스트</h4>
            <div class="preset-buttons">
              <button class="preset-btn" data-text="안녕하세요! 웹 스피치 API 테스트입니다.">
                한국어 인사
              </button>
              <button class="preset-btn" data-text="Hello! This is a Web Speech API test.">
                English Greeting
              </button>
              <button class="preset-btn" data-text="오늘 날씨가 정말 좋네요. 산책하기 딱 좋은 날씨입니다.">
                날씨 이야기
              </button>
              <button class="preset-btn" data-text="웹 개발은 정말 흥미로운 분야입니다. 새로운 기술들이 계속 등장하고 있어요.">
                기술 이야기
              </button>
              <button class="preset-btn" data-text="The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.">
                영어 문장
              </button>
            </div>
          </div>
        </div>

        <!-- 실시간 대화 섹션 -->
        <div class="speech-section conversation-section">
          <h2>💬 실시간 음성 대화</h2>
          
          <div class="conversation-controls">
            <button id="startConversation" class="speech-btn conversation-btn">
              🤖 대화 모드 시작
            </button>
            <button id="stopConversation" class="speech-btn stop-btn" disabled>
              🔚 대화 종료
            </button>
          </div>
          
          <div class="conversation-log" id="conversationLog">
            <div class="log-header">대화 기록</div>
            <div class="log-content" id="logContent">
              <p class="system-message">대화 모드를 시작하면 음성 인식과 자동 응답이 시작됩니다.</p>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Web Speech API 정보</h3>
          <div class="info-grid">
            <div class="info-card">
              <h4>🎤 Speech Recognition</h4>
              <ul>
                <li>실시간 음성 인식</li>
                <li>다국어 지원</li>
                <li>연속/단발 인식 모드</li>
                <li>신뢰도 점수 제공</li>
                <li>대안 결과 제공</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🔊 Speech Synthesis</h4>
              <ul>
                <li>텍스트를 음성으로 변환</li>
                <li>다양한 음성 선택</li>
                <li>속도/음조/음량 조절</li>
                <li>일시정지/재개 기능</li>
                <li>이벤트 기반 제어</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🌐 브라우저 지원</h4>
              <ul>
                <li><strong>Chrome:</strong> 완전 지원</li>
                <li><strong>Edge:</strong> 완전 지원</li>
                <li><strong>Safari:</strong> 부분 지원</li>
                <li><strong>Firefox:</strong> 부분 지원</li>
                <li><strong>모바일:</strong> 제한적 지원</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 음성 인식 이벤트
    document
      .getElementById("startRecognition")
      .addEventListener("click", () => this.startRecognition());
    document
      .getElementById("stopRecognition")
      .addEventListener("click", () => this.stopRecognition());
    document
      .getElementById("clearResults")
      .addEventListener("click", () => this.clearResults());

    // 음성 합성 이벤트
    document
      .getElementById("speakText")
      .addEventListener("click", () => this.speakText());
    document
      .getElementById("pauseSpeech")
      .addEventListener("click", () => this.pauseSpeech());
    document
      .getElementById("resumeSpeech")
      .addEventListener("click", () => this.resumeSpeech());
    document
      .getElementById("stopSpeech")
      .addEventListener("click", () => this.stopSpeech());

    // 실시간 대화 이벤트
    document
      .getElementById("startConversation")
      .addEventListener("click", () => this.startConversation());
    document
      .getElementById("stopConversation")
      .addEventListener("click", () => this.stopConversation());

    // 설정 변경 이벤트
    document.getElementById("speechRate").addEventListener("input", (e) => {
      document.getElementById("rateValue").textContent = e.target.value;
    });

    document.getElementById("speechPitch").addEventListener("input", (e) => {
      document.getElementById("pitchValue").textContent = e.target.value;
    });

    document.getElementById("speechVolume").addEventListener("input", (e) => {
      document.getElementById("volumeValue").textContent = e.target.value;
    });

    // 음성 선택 변경
    document
      .getElementById("voiceSelect")
      .addEventListener("change", () => this.updateVoiceInfo());

    // 프리셋 텍스트 버튼
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.getElementById("textToSpeak").value = e.target.dataset.text;
      });
    });
  }

  setupSpeechRecognition() {
    if ("webkitSpeechRecognition" in window) {
      this.recognition = new webkitSpeechRecognition();
    } else if ("SpeechRecognition" in window) {
      this.recognition = new SpeechRecognition();
    } else {
      return;
    }

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "ko-KR";

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateRecognitionUI();
      this.updateStatus("recognition", "음성 인식이 시작되었습니다");
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.updateStatus("recognition", `인식 오류: ${event.error}`);
      this.isListening = false;
      this.updateRecognitionUI();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateRecognitionUI();
      this.updateStatus("recognition", "음성 인식이 종료되었습니다");
    };
  }

  loadVoices() {
    const loadVoicesList = () => {
      this.voices = this.synthesis.getVoices();
      const voiceSelect = document.getElementById("voiceSelect");

      // 기존 옵션 제거 (기본 옵션 제외)
      while (voiceSelect.children.length > 1) {
        voiceSelect.removeChild(voiceSelect.lastChild);
      }

      // 새 음성 옵션 추가
      this.voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.default) {
          option.textContent += " [기본]";
        }
        voiceSelect.appendChild(option);
      });
    };

    // 음성 목록이 로드되면 실행
    if (this.synthesis.getVoices().length !== 0) {
      loadVoicesList();
    } else {
      this.synthesis.addEventListener("voiceschanged", loadVoicesList);
    }
  }

  startRecognition() {
    if (!this.recognition) return;

    // 설정 적용
    const lang = document.getElementById("recognitionLang").value;
    const continuous = document.getElementById("continuousMode").checked;
    const interimResults = document.getElementById("interimResults").checked;
    const maxAlternatives = parseInt(
      document.getElementById("maxAlternatives").value
    );

    this.recognition.lang = lang;
    this.recognition.continuous = continuous;
    this.recognition.interimResults = interimResults;
    this.recognition.maxAlternatives = maxAlternatives;

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Recognition start error:", error);
      this.updateStatus("recognition", "인식 시작 실패");
    }
  }

  stopRecognition() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  clearResults() {
    document.getElementById("interimResult").textContent = "";
    document.getElementById("finalResults").innerHTML = "";
    document.getElementById("resultsStats").style.display = "none";
    this.recognitionResults = [];
  }

  handleRecognitionResult(event) {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalTranscript += transcript;

        // 결과 저장
        this.recognitionResults.push({
          text: transcript,
          confidence: result[0].confidence,
          timestamp: new Date(),
        });

        this.addFinalResult(transcript, result[0].confidence, result);
      } else {
        interimTranscript += transcript;
      }
    }

    // 중간 결과 표시
    document.getElementById("interimResult").textContent = interimTranscript;

    // 최종 결과가 있으면 처리
    if (finalTranscript) {
      this.updateResultsStats();
    }
  }

  addFinalResult(text, confidence, result) {
    const finalResults = document.getElementById("finalResults");
    const resultDiv = document.createElement("div");
    resultDiv.className = "result-item";

    const timestamp = new Date().toLocaleTimeString();
    const confidencePercent = Math.round(confidence * 100);

    let alternativesHTML = "";
    if (result.length > 1) {
      alternativesHTML = '<div class="alternatives"><strong>대안:</strong><ul>';
      for (let i = 1; i < result.length; i++) {
        const altConfidence = Math.round(result[i].confidence * 100);
        alternativesHTML += `<li>${result[i].transcript} (${altConfidence}%)</li>`;
      }
      alternativesHTML += "</ul></div>";
    }

    resultDiv.innerHTML = `
      <div class="result-header">
        <span class="timestamp">${timestamp}</span>
        <span class="confidence confidence-${this.getConfidenceClass(
          confidence
        )}">${confidencePercent}%</span>
      </div>
      <div class="result-text">${text}</div>
      ${alternativesHTML}
    `;

    finalResults.appendChild(resultDiv);
    finalResults.scrollTop = finalResults.scrollHeight;
  }

  getConfidenceClass(confidence) {
    if (confidence >= 0.8) return "high";
    if (confidence >= 0.6) return "medium";
    return "low";
  }

  updateResultsStats() {
    const stats = document.getElementById("resultsStats");
    const totalCount = this.recognitionResults.length;
    const avgConfidence =
      this.recognitionResults.reduce(
        (sum, result) => sum + result.confidence,
        0
      ) / totalCount;

    document.getElementById("totalRecognitions").textContent = totalCount;
    document.getElementById("averageConfidence").textContent =
      Math.round(avgConfidence * 100) + "%";

    stats.style.display = "block";
  }

  speakText() {
    const text = document.getElementById("textToSpeak").value.trim();
    if (!text) {
      this.updateStatus("synthesis", "읽을 텍스트를 입력해주세요");
      return;
    }

    // 기존 음성 중지
    this.synthesis.cancel();

    // 새 utterance 생성
    this.currentUtterance = new SpeechSynthesisUtterance(text);

    // 설정 적용
    const voiceIndex = document.getElementById("voiceSelect").value;
    if (voiceIndex && this.voices[voiceIndex]) {
      this.currentUtterance.voice = this.voices[voiceIndex];
    }

    this.currentUtterance.rate = parseFloat(
      document.getElementById("speechRate").value
    );
    this.currentUtterance.pitch = parseFloat(
      document.getElementById("speechPitch").value
    );
    this.currentUtterance.volume = parseFloat(
      document.getElementById("speechVolume").value
    );

    // 이벤트 리스너 설정
    this.currentUtterance.onstart = () => {
      this.updateSynthesisUI(true);
      this.updateStatus("synthesis", "텍스트를 읽고 있습니다");
    };

    this.currentUtterance.onend = () => {
      this.updateSynthesisUI(false);
      this.updateStatus("synthesis", "텍스트 읽기가 완료되었습니다");
    };

    this.currentUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      this.updateSynthesisUI(false);
      this.updateStatus("synthesis", `음성 합성 오류: ${event.error}`);
    };

    this.currentUtterance.onpause = () => {
      this.updateStatus("synthesis", "음성이 일시정지되었습니다");
    };

    this.currentUtterance.onresume = () => {
      this.updateStatus("synthesis", "음성을 다시 재생합니다");
    };

    // 음성 시작
    this.synthesis.speak(this.currentUtterance);
  }

  pauseSpeech() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resumeSpeech() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  stopSpeech() {
    this.synthesis.cancel();
    this.updateSynthesisUI(false);
    this.updateStatus("synthesis", "음성이 중지되었습니다");
  }

  startConversation() {
    this.isTranscribing = true;
    this.updateConversationUI();
    this.addConversationMessage(
      "system",
      "대화 모드가 시작되었습니다. 말씀해보세요!"
    );

    // 연속 음성 인식 시작
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "ko-KR";

    // 대화용 이벤트 핸들러 설정
    this.recognition.onresult = (event) => {
      this.handleConversationResult(event);
    };

    this.recognition.start();
  }

  stopConversation() {
    this.isTranscribing = false;
    this.updateConversationUI();
    this.stopRecognition();
    this.addConversationMessage("system", "대화 모드가 종료되었습니다.");
  }

  handleConversationResult(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        const transcript = result[0].transcript.trim();
        if (transcript) {
          this.addConversationMessage("user", transcript);
          this.generateResponse(transcript);
        }
      }
    }
  }

  generateResponse(userInput) {
    // 간단한 응답 생성 로직
    let response = "";

    const input = userInput.toLowerCase();

    if (input.includes("안녕") || input.includes("hello")) {
      response = "안녕하세요! 반갑습니다.";
    } else if (input.includes("날씨")) {
      response =
        "오늘 날씨가 어떤지 확인해보세요. 저는 웹 브라우저 안에 있어서 날씨를 직접 알 수는 없어요.";
    } else if (input.includes("시간") || input.includes("몇 시")) {
      const now = new Date();
      response = `현재 시간은 ${now.toLocaleTimeString()}입니다.`;
    } else if (input.includes("이름")) {
      response = "저는 웹 스피치 API 데모 봇입니다.";
    } else if (input.includes("고마워") || input.includes("감사")) {
      response = "천만에요! 도움이 되어 기쁩니다.";
    } else if (
      input.includes("안녕히") ||
      input.includes("잘 가") ||
      input.includes("bye")
    ) {
      response = "안녕히 가세요! 좋은 하루 되세요.";
    } else {
      const responses = [
        "흥미로운 말씀이네요!",
        "그렇군요. 더 말씀해주세요.",
        "좋은 생각입니다.",
        "네, 맞습니다.",
        "더 자세히 설명해주실 수 있나요?",
        "정말 재미있는 이야기네요.",
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    this.addConversationMessage("bot", response);

    // 응답을 음성으로 출력
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 1.2;
      utterance.lang = "ko-KR";
      this.synthesis.speak(utterance);
    }, 500);
  }

  addConversationMessage(sender, message) {
    const logContent = document.getElementById("logContent");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    const timestamp = new Date().toLocaleTimeString();
    const senderName = {
      user: "👤 사용자",
      bot: "🤖 봇",
      system: "⚙️ 시스템",
    }[sender];

    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="sender">${senderName}</span>
        <span class="timestamp">${timestamp}</span>
      </div>
      <div class="message-content">${message}</div>
    `;

    logContent.appendChild(messageDiv);
    logContent.scrollTop = logContent.scrollHeight;
  }

  updateRecognitionUI() {
    const startBtn = document.getElementById("startRecognition");
    const stopBtn = document.getElementById("stopRecognition");
    const indicator = document.getElementById("listeningIndicator");

    if (this.isListening) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      indicator.style.display = "flex";
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      indicator.style.display = "none";
    }
  }

  updateSynthesisUI(isSpeaking) {
    const speakBtn = document.getElementById("speakText");
    const pauseBtn = document.getElementById("pauseSpeech");
    const resumeBtn = document.getElementById("resumeSpeech");
    const stopBtn = document.getElementById("stopSpeech");
    const indicator = document.getElementById("speakingIndicator");

    if (isSpeaking) {
      speakBtn.disabled = true;
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
      stopBtn.disabled = false;
      indicator.style.display = "flex";
    } else {
      speakBtn.disabled = false;
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      stopBtn.disabled = true;
      indicator.style.display = "none";
    }
  }

  updateConversationUI() {
    const startBtn = document.getElementById("startConversation");
    const stopBtn = document.getElementById("stopConversation");

    if (this.isTranscribing) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }

  updateStatus(section, message) {
    const statusMap = {
      recognition: "recognitionStatus",
      synthesis: "synthesisStatus",
    };

    const statusElement = document.getElementById(statusMap[section]);
    if (statusElement) {
      statusElement.querySelector(".status-text").textContent = message;
    }
  }

  updateVoiceInfo() {
    const voiceSelect = document.getElementById("voiceSelect");
    const selectedIndex = voiceSelect.value;

    if (selectedIndex && this.voices[selectedIndex]) {
      const voice = this.voices[selectedIndex];
      console.log("Selected voice:", voice.name, voice.lang, voice.default);
    }
  }
}

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new WebSpeechDemo();
});
