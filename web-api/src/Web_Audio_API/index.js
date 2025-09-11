import "./style.css";

console.log("🎵 Web Audio API 스크립트 시작!");

class WebAudioAPI {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.oscillator = null;
    this.gainNode = null;
    this.audioBuffer = null;
    this.currentSource = null;
    this.mediaStream = null;
    this.recorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.isPlaying = false;
    this.frequencies = [];
    this.effects = new Map();
    this.presets = new Map();
    this.audioFiles = new Map();
    this.visualizer = null;
    this.animationId = null;
    this.init();
  }

  init() {
    console.log("🎵 Web Audio API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    this.initializePresets();
    this.loadSampleAudio();
    console.log("✅ Web Audio API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 Web Audio API 지원 여부 확인 중...");

    const support = {
      audioContext:
        typeof (window.AudioContext || window.webkitAudioContext) !==
        "undefined",
      mediaRecorder: typeof MediaRecorder !== "undefined",
      getUserMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      offlineAudioContext: typeof OfflineAudioContext !== "undefined",
      audioWorklet: typeof AudioWorkletNode !== "undefined",
      webAudioAPI:
        typeof window.AudioContext !== "undefined" ||
        typeof window.webkitAudioContext !== "undefined",
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  async initAudioContext() {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // 브라우저 정책으로 인한 컨텍스트 일시정지 해제
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      console.log("🎵 AudioContext 초기화됨:", this.audioContext.state);
    }
    return this.audioContext;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="webaudio-container">
        <header class="webaudio-header">
          <h1>🎵 Web Audio API</h1>
          <p>오디오 생성, 처리, 분석 및 시각화의 모든 기능을 체험하세요</p>
          <div class="api-support">
            <div class="support-badge ${
              support.audioContext ? "supported" : "unsupported"
            }">
              ${support.audioContext ? "✅ AudioContext" : "❌ AudioContext"}
            </div>
            <div class="support-badge ${
              support.mediaRecorder ? "supported" : "unsupported"
            }">
              ${support.mediaRecorder ? "✅ MediaRecorder" : "❌ MediaRecorder"}
            </div>
            <div class="support-badge ${
              support.getUserMedia ? "supported" : "unsupported"
            }">
              ${support.getUserMedia ? "✅ getUserMedia" : "❌ getUserMedia"}
            </div>
            <div class="support-badge ${
              support.offlineAudioContext ? "supported" : "unsupported"
            }">
              ${
                support.offlineAudioContext
                  ? "✅ OfflineAudioContext"
                  : "❌ OfflineAudioContext"
              }
            </div>
            <div class="support-badge ${
              support.audioWorklet ? "supported" : "unsupported"
            }">
              ${support.audioWorklet ? "✅ AudioWorklet" : "❌ AudioWorklet"}
            </div>
          </div>
        </header>

        <main class="webaudio-main">
          <!-- 오디오 컨텍스트 상태 -->
          <div class="panel-card primary">
            <h2>🎛️ 오디오 컨텍스트 제어</h2>
            <div class="context-controls">
              <div class="context-info">
                <div class="info-item">
                  <span class="info-label">상태:</span>
                  <span class="info-value" id="contextState">비활성</span>
                </div>
                <div class="info-item">
                  <span class="info-label">샘플레이트:</span>
                  <span class="info-value" id="sampleRate">-</span>
                </div>
                <div class="info-item">
                  <span class="info-label">현재 시간:</span>
                  <span class="info-value" id="currentTime">0.00s</span>
                </div>
              </div>
              <div class="context-actions">
                <button id="initContext" class="btn-primary">🎵 컨텍스트 초기화</button>
                <button id="resumeContext" class="btn-success" disabled>▶️ 재개</button>
                <button id="suspendContext" class="btn-warning" disabled>⏸️ 일시정지</button>
                <button id="closeContext" class="btn-danger" disabled>⏹️ 종료</button>
              </div>
            </div>
          </div>

          <!-- 오실레이터 & 사운드 생성 -->
          <div class="panel-card">
            <h2>🌊 오실레이터 & 사운드 생성</h2>
            <div class="oscillator-section">
              <div class="oscillator-controls">
                <div class="control-group">
                  <label for="waveType">파형 타입:</label>
                  <select id="waveType">
                    <option value="sine">사인파 (Sine)</option>
                    <option value="square">사각파 (Square)</option>
                    <option value="sawtooth">톱니파 (Sawtooth)</option>
                    <option value="triangle">삼각파 (Triangle)</option>
                  </select>
                </div>
                <div class="control-group">
                  <label for="frequency">주파수: <span id="frequencyValue">440</span>Hz</label>
                  <input type="range" id="frequency" min="20" max="2000" value="440" step="1">
                </div>
                <div class="control-group">
                  <label for="volume">볼륨: <span id="volumeValue">50</span>%</label>
                  <input type="range" id="volume" min="0" max="100" value="50" step="1">
                </div>
                <div class="control-group">
                  <label for="duration">지속시간: <span id="durationValue">1</span>초</label>
                  <input type="range" id="duration" min="0.1" max="5" value="1" step="0.1">
                </div>
              </div>
              
              <div class="oscillator-actions">
                <button id="playOscillator" class="btn-success">🎵 재생</button>
                <button id="stopOscillator" class="btn-danger" disabled>⏹️ 정지</button>
                <button id="playChord" class="btn-info">🎼 화음 재생</button>
                <button id="playScale" class="btn-secondary">🎹 스케일 재생</button>
              </div>

              <div class="preset-controls">
                <h3>🎛️ 프리셋:</h3>
                <div class="preset-buttons">
                  <button class="preset-btn" data-preset="piano">🎹 피아노</button>
                  <button class="preset-btn" data-preset="organ">🎺 오르간</button>
                  <button class="preset-btn" data-preset="bass">🎸 베이스</button>
                  <button class="preset-btn" data-preset="lead">🎼 리드</button>
                  <button class="preset-btn" data-preset="pad">🌊 패드</button>
                  <button class="preset-btn" data-preset="noise">📻 노이즈</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 오디오 파일 재생 -->
          <div class="panel-card">
            <h2>🎧 오디오 파일 재생 & 처리</h2>
            <div class="audio-file-section">
              <div class="file-controls">
                <div class="file-input-group">
                  <input type="file" id="audioFileInput" accept="audio/*" multiple>
                  <button id="loadSampleAudio" class="btn-info">🎵 샘플 오디오 로드</button>
                </div>
                <div class="file-list" id="audioFileList">
                  <div class="file-placeholder">오디오 파일을 선택하거나 샘플을 로드하세요</div>
                </div>
              </div>

              <div class="playback-controls">
                <div class="playback-info">
                  <div class="current-track" id="currentTrack">재생할 트랙을 선택하세요</div>
                  <div class="time-display">
                    <span id="currentTimeDisplay">00:00</span> / <span id="totalTimeDisplay">00:00</span>
                  </div>
                </div>
                <div class="playback-buttons">
                  <button id="playAudio" class="btn-success" disabled>▶️ 재생</button>
                  <button id="pauseAudio" class="btn-warning" disabled>⏸️ 일시정지</button>
                  <button id="stopAudio" class="btn-danger" disabled>⏹️ 정지</button>
                  <button id="loopAudio" class="btn-info">🔄 반복</button>
                </div>
                <div class="progress-container">
                  <input type="range" id="progressBar" min="0" max="100" value="0" disabled>
                </div>
              </div>

              <div class="audio-effects">
                <h3>🎛️ 오디오 이펙트:</h3>
                <div class="effects-grid">
                  <div class="effect-control">
                    <label for="masterVolume">마스터 볼륨: <span id="masterVolumeValue">100</span>%</label>
                    <input type="range" id="masterVolume" min="0" max="200" value="100" step="1">
                  </div>
                  <div class="effect-control">
                    <label for="playbackRate">재생 속도: <span id="playbackRateValue">1.0</span>x</label>
                    <input type="range" id="playbackRate" min="0.25" max="2.0" value="1.0" step="0.05">
                  </div>
                  <div class="effect-control">
                    <label for="detune">디튠: <span id="detuneValue">0</span> cents</label>
                    <input type="range" id="detune" min="-1200" max="1200" value="0" step="10">
                  </div>
                  <div class="effect-control">
                    <label for="lowpass">로우패스 필터: <span id="lowpassValue">20000</span>Hz</label>
                    <input type="range" id="lowpass" min="20" max="20000" value="20000" step="10">
                  </div>
                  <div class="effect-control">
                    <label for="highpass">하이패스 필터: <span id="highpassValue">20</span>Hz</label>
                    <input type="range" id="highpass" min="20" max="5000" value="20" step="10">
                  </div>
                  <div class="effect-control">
                    <label for="reverb">리버브: <span id="reverbValue">0</span>%</label>
                    <input type="range" id="reverb" min="0" max="100" value="0" step="1">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 오디오 분석 & 시각화 -->
          <div class="panel-card">
            <h2>📊 오디오 분석 & 시각화</h2>
            <div class="analysis-section">
              <div class="visualizer-controls">
                <div class="visualizer-options">
                  <label>
                    <input type="radio" name="visualizerType" value="frequency" checked>
                    주파수 스펙트럼
                  </label>
                  <label>
                    <input type="radio" name="visualizerType" value="waveform">
                    파형
                  </label>
                  <label>
                    <input type="radio" name="visualizerType" value="bars">
                    막대 그래프
                  </label>
                  <label>
                    <input type="radio" name="visualizerType" value="circular">
                    원형 시각화
                  </label>
                </div>
                <div class="visualizer-settings">
                  <div class="setting-control">
                    <label for="fftSize">FFT 크기:</label>
                    <select id="fftSize">
                      <option value="256">256</option>
                      <option value="512">512</option>
                      <option value="1024" selected>1024</option>
                      <option value="2048">2048</option>
                      <option value="4096">4096</option>
                    </select>
                  </div>
                  <div class="setting-control">
                    <label for="smoothing">스무딩: <span id="smoothingValue">0.8</span></label>
                    <input type="range" id="smoothing" min="0" max="1" value="0.8" step="0.1">
                  </div>
                </div>
              </div>
              
              <div class="visualizer-canvas-container">
                <canvas id="visualizerCanvas" width="800" height="300"></canvas>
              </div>

              <div class="frequency-analysis">
                <h3>🎵 주파수 분석:</h3>
                <div class="frequency-info">
                  <div class="freq-item">
                    <span class="freq-label">저음 (20-250Hz):</span>
                    <div class="freq-bar"><div class="freq-fill" id="bassLevel"></div></div>
                    <span class="freq-value" id="bassValue">0%</span>
                  </div>
                  <div class="freq-item">
                    <span class="freq-label">중음 (250-4000Hz):</span>
                    <div class="freq-bar"><div class="freq-fill" id="midLevel"></div></div>
                    <span class="freq-value" id="midValue">0%</span>
                  </div>
                  <div class="freq-item">
                    <span class="freq-label">고음 (4000-20000Hz):</span>
                    <div class="freq-bar"><div class="freq-fill" id="trebleLevel"></div></div>
                    <span class="freq-value" id="trebleValue">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 마이크 입력 & 녹음 -->
          <div class="panel-card">
            <h2>🎤 마이크 입력 & 녹음</h2>
            <div class="microphone-section">
              <div class="mic-controls">
                <div class="mic-actions">
                  <button id="startMic" class="btn-success">🎤 마이크 시작</button>
                  <button id="stopMic" class="btn-danger" disabled>🔇 마이크 중지</button>
                  <button id="startRecord" class="btn-primary" disabled>🔴 녹음 시작</button>
                  <button id="stopRecord" class="btn-warning" disabled>⏹️ 녹음 중지</button>
                </div>
                <div class="mic-info">
                  <div class="info-item">
                    <span class="info-label">상태:</span>
                    <span class="info-value" id="micStatus">비활성</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">입력 레벨:</span>
                    <div class="level-meter">
                      <div class="level-fill" id="inputLevel"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="recording-controls">
                <div class="recording-settings">
                  <div class="setting-control">
                    <label for="recordFormat">녹음 형식:</label>
                    <select id="recordFormat">
                      <option value="audio/webm">WebM</option>
                      <option value="audio/mp4">MP4</option>
                      <option value="audio/wav">WAV</option>
                    </select>
                  </div>
                  <div class="setting-control">
                    <label for="recordQuality">품질:</label>
                    <select id="recordQuality">
                      <option value="low">낮음 (64kbps)</option>
                      <option value="medium" selected>보통 (128kbps)</option>
                      <option value="high">높음 (256kbps)</option>
                    </select>
                  </div>
                </div>
                
                <div class="recorded-files" id="recordedFiles">
                  <div class="recordings-placeholder">녹음된 파일이 없습니다</div>
                </div>
              </div>

              <div class="mic-effects">
                <h3>🎛️ 실시간 이펙트:</h3>
                <div class="mic-effects-grid">
                  <div class="effect-control">
                    <label for="micGain">입력 게인: <span id="micGainValue">1.0</span></label>
                    <input type="range" id="micGain" min="0" max="3" value="1.0" step="0.1">
                  </div>
                  <div class="effect-control">
                    <label>
                      <input type="checkbox" id="enableEcho">
                      에코 이펙트
                    </label>
                  </div>
                  <div class="effect-control">
                    <label for="echoDelay">에코 지연: <span id="echoDelayValue">0.3</span>초</label>
                    <input type="range" id="echoDelay" min="0.1" max="1.0" value="0.3" step="0.1">
                  </div>
                  <div class="effect-control">
                    <label for="echoFeedback">에코 피드백: <span id="echoFeedbackValue">0.3</span></label>
                    <input type="range" id="echoFeedback" min="0" max="0.9" value="0.3" step="0.1">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 사운드 신디사이저 -->
          <div class="panel-card">
            <h2>🎹 사운드 신디사이저</h2>
            <div class="synthesizer-section">
              <div class="keyboard">
                <h3>🎹 가상 키보드:</h3>
                <div class="piano-keyboard" id="pianoKeyboard">
                  <!-- 화이트 키 -->
                  <div class="white-key" data-note="C4" data-freq="261.63">C</div>
                  <div class="black-key" data-note="C#4" data-freq="277.18">C#</div>
                  <div class="white-key" data-note="D4" data-freq="293.66">D</div>
                  <div class="black-key" data-note="D#4" data-freq="311.13">D#</div>
                  <div class="white-key" data-note="E4" data-freq="329.63">E</div>
                  <div class="white-key" data-note="F4" data-freq="349.23">F</div>
                  <div class="black-key" data-note="F#4" data-freq="369.99">F#</div>
                  <div class="white-key" data-note="G4" data-freq="392.00">G</div>
                  <div class="black-key" data-note="G#4" data-freq="415.30">G#</div>
                  <div class="white-key" data-note="A4" data-freq="440.00">A</div>
                  <div class="black-key" data-note="A#4" data-freq="466.16">A#</div>
                  <div class="white-key" data-note="B4" data-freq="493.88">B</div>
                  <div class="white-key" data-note="C5" data-freq="523.25">C5</div>
                </div>
              </div>

              <div class="synth-controls">
                <div class="synth-params">
                  <h3>🎛️ 신스 파라미터:</h3>
                  <div class="synth-grid">
                    <div class="param-group">
                      <h4>📈 ADSR 엔벨로프:</h4>
                      <div class="param-control">
                        <label for="attack">Attack: <span id="attackValue">0.1</span>s</label>
                        <input type="range" id="attack" min="0.01" max="2" value="0.1" step="0.01">
                      </div>
                      <div class="param-control">
                        <label for="decay">Decay: <span id="decayValue">0.2</span>s</label>
                        <input type="range" id="decay" min="0.01" max="2" value="0.2" step="0.01">
                      </div>
                      <div class="param-control">
                        <label for="sustain">Sustain: <span id="sustainValue">0.5</span></label>
                        <input type="range" id="sustain" min="0" max="1" value="0.5" step="0.01">
                      </div>
                      <div class="param-control">
                        <label for="release">Release: <span id="releaseValue">0.5</span>s</label>
                        <input type="range" id="release" min="0.01" max="3" value="0.5" step="0.01">
                      </div>
                    </div>

                    <div class="param-group">
                      <h4>🌊 오실레이터:</h4>
                      <div class="param-control">
                        <label for="osc1Type">OSC1 파형:</label>
                        <select id="osc1Type">
                          <option value="sine">Sine</option>
                          <option value="square">Square</option>
                          <option value="sawtooth" selected>Sawtooth</option>
                          <option value="triangle">Triangle</option>
                        </select>
                      </div>
                      <div class="param-control">
                        <label for="osc1Detune">OSC1 디튠: <span id="osc1DetuneValue">0</span></label>
                        <input type="range" id="osc1Detune" min="-50" max="50" value="0" step="1">
                      </div>
                      <div class="param-control">
                        <label for="osc2Type">OSC2 파형:</label>
                        <select id="osc2Type">
                          <option value="sine">Sine</option>
                          <option value="square" selected>Square</option>
                          <option value="sawtooth">Sawtooth</option>
                          <option value="triangle">Triangle</option>
                        </select>
                      </div>
                      <div class="param-control">
                        <label for="osc2Detune">OSC2 디튠: <span id="osc2DetuneValue">7</span></label>
                        <input type="range" id="osc2Detune" min="-50" max="50" value="7" step="1">
                      </div>
                      <div class="param-control">
                        <label for="oscMix">OSC 믹스: <span id="oscMixValue">50</span>%</label>
                        <input type="range" id="oscMix" min="0" max="100" value="50" step="1">
                      </div>
                    </div>

                    <div class="param-group">
                      <h4>🔽 필터:</h4>
                      <div class="param-control">
                        <label for="filterType">필터 타입:</label>
                        <select id="filterType">
                          <option value="lowpass" selected>Low Pass</option>
                          <option value="highpass">High Pass</option>
                          <option value="bandpass">Band Pass</option>
                          <option value="notch">Notch</option>
                        </select>
                      </div>
                      <div class="param-control">
                        <label for="filterFreq">컷오프: <span id="filterFreqValue">1000</span>Hz</label>
                        <input type="range" id="filterFreq" min="20" max="20000" value="1000" step="10">
                      </div>
                      <div class="param-control">
                        <label for="filterQ">Q (공명): <span id="filterQValue">1</span></label>
                        <input type="range" id="filterQ" min="0.1" max="30" value="1" step="0.1">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="synth-presets">
                  <h3>🎵 신스 프리셋:</h3>
                  <div class="preset-buttons">
                    <button class="synth-preset-btn" data-preset="lead">🎼 Lead</button>
                    <button class="synth-preset-btn" data-preset="bass">🎸 Bass</button>
                    <button class="synth-preset-btn" data-preset="pad">🌊 Pad</button>
                    <button class="synth-preset-btn" data-preset="pluck">🎹 Pluck</button>
                    <button class="synth-preset-btn" data-preset="organ">🎺 Organ</button>
                    <button class="synth-preset-btn" data-preset="strings">🎻 Strings</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 오디오 통계 & 정보 -->
          <div class="panel-card">
            <h2>📊 오디오 통계 & 정보</h2>
            <div class="stats-section">
              <div class="audio-stats">
                <div class="stat-card">
                  <div class="stat-icon">🎵</div>
                  <div class="stat-info">
                    <span class="stat-label">로드된 파일</span>
                    <span class="stat-value" id="loadedFiles">0</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⏱️</div>
                  <div class="stat-info">
                    <span class="stat-label">총 재생 시간</span>
                    <span class="stat-value" id="totalPlaytime">00:00</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔊</div>
                  <div class="stat-info">
                    <span class="stat-label">현재 볼륨</span>
                    <span class="stat-value" id="currentVolume">100%</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">📈</div>
                  <div class="stat-info">
                    <span class="stat-label">평균 주파수</span>
                    <span class="stat-value" id="avgFrequency">0 Hz</span>
                  </div>
                </div>
              </div>

              <div class="performance-info">
                <h3>⚡ 성능 정보:</h3>
                <div class="performance-grid">
                  <div class="perf-item">
                    <span class="perf-label">AudioContext 지연시간:</span>
                    <span class="perf-value" id="audioLatency">-</span>
                  </div>
                  <div class="perf-item">
                    <span class="perf-label">버퍼 크기:</span>
                    <span class="perf-value" id="bufferSize">-</span>
                  </div>
                  <div class="perf-item">
                    <span class="perf-label">활성 노드 수:</span>
                    <span class="perf-value" id="activeNodes">0</span>
                  </div>
                  <div class="perf-item">
                    <span class="perf-label">CPU 사용률:</span>
                    <span class="perf-value" id="cpuUsage">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 영역 -->
          <div id="notifications" class="notifications-container"></div>
        </main>
      </div>
    `;

    console.log("✅ UI 설정 완료");
  }

  setupEventListeners() {
    // 컨텍스트 제어
    document
      .getElementById("initContext")
      ?.addEventListener("click", () => this.handleInitContext());
    document
      .getElementById("resumeContext")
      ?.addEventListener("click", () => this.handleResumeContext());
    document
      .getElementById("suspendContext")
      ?.addEventListener("click", () => this.handleSuspendContext());
    document
      .getElementById("closeContext")
      ?.addEventListener("click", () => this.handleCloseContext());

    // 오실레이터 제어
    document
      .getElementById("frequency")
      ?.addEventListener("input", (e) =>
        this.updateFrequencyDisplay(e.target.value)
      );
    document
      .getElementById("volume")
      ?.addEventListener("input", (e) =>
        this.updateVolumeDisplay(e.target.value)
      );
    document
      .getElementById("duration")
      ?.addEventListener("input", (e) =>
        this.updateDurationDisplay(e.target.value)
      );
    document
      .getElementById("playOscillator")
      ?.addEventListener("click", () => this.playOscillator());
    document
      .getElementById("stopOscillator")
      ?.addEventListener("click", () => this.stopOscillator());
    document
      .getElementById("playChord")
      ?.addEventListener("click", () => this.playChord());
    document
      .getElementById("playScale")
      ?.addEventListener("click", () => this.playScale());

    // 프리셋 버튼
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.loadPreset(e.target.dataset.preset)
      );
    });

    // 파일 입력
    document
      .getElementById("audioFileInput")
      ?.addEventListener("change", (e) =>
        this.handleAudioFiles(e.target.files)
      );
    document
      .getElementById("loadSampleAudio")
      ?.addEventListener("click", () => this.loadSampleAudio());

    // 재생 제어
    document
      .getElementById("playAudio")
      ?.addEventListener("click", () => this.playAudio());
    document
      .getElementById("pauseAudio")
      ?.addEventListener("click", () => this.pauseAudio());
    document
      .getElementById("stopAudio")
      ?.addEventListener("click", () => this.stopAudio());
    document
      .getElementById("loopAudio")
      ?.addEventListener("click", () => this.toggleLoop());
    document
      .getElementById("progressBar")
      ?.addEventListener("input", (e) => this.seekAudio(e.target.value));

    // 이펙트 제어
    document
      .getElementById("masterVolume")
      ?.addEventListener("input", (e) =>
        this.updateMasterVolume(e.target.value)
      );
    document
      .getElementById("playbackRate")
      ?.addEventListener("input", (e) =>
        this.updatePlaybackRate(e.target.value)
      );
    document
      .getElementById("detune")
      ?.addEventListener("input", (e) => this.updateDetune(e.target.value));
    document
      .getElementById("lowpass")
      ?.addEventListener("input", (e) => this.updateLowpass(e.target.value));
    document
      .getElementById("highpass")
      ?.addEventListener("input", (e) => this.updateHighpass(e.target.value));
    document
      .getElementById("reverb")
      ?.addEventListener("input", (e) => this.updateReverb(e.target.value));

    // 시각화 설정
    document
      .getElementById("fftSize")
      ?.addEventListener("change", (e) => this.updateFFTSize(e.target.value));
    document
      .getElementById("smoothing")
      ?.addEventListener("input", (e) => this.updateSmoothing(e.target.value));
    document
      .querySelectorAll('input[name="visualizerType"]')
      .forEach((radio) => {
        radio.addEventListener("change", (e) =>
          this.changeVisualizerType(e.target.value)
        );
      });

    // 마이크 제어
    document
      .getElementById("startMic")
      ?.addEventListener("click", () => this.startMicrophone());
    document
      .getElementById("stopMic")
      ?.addEventListener("click", () => this.stopMicrophone());
    document
      .getElementById("startRecord")
      ?.addEventListener("click", () => this.startRecording());
    document
      .getElementById("stopRecord")
      ?.addEventListener("click", () => this.stopRecording());

    // 마이크 이펙트
    document
      .getElementById("micGain")
      ?.addEventListener("input", (e) => this.updateMicGain(e.target.value));
    document
      .getElementById("enableEcho")
      ?.addEventListener("change", (e) => this.toggleEcho(e.target.checked));
    document
      .getElementById("echoDelay")
      ?.addEventListener("input", (e) => this.updateEchoDelay(e.target.value));
    document
      .getElementById("echoFeedback")
      ?.addEventListener("input", (e) =>
        this.updateEchoFeedback(e.target.value)
      );

    // 신디사이저 키보드
    document.querySelectorAll(".white-key, .black-key").forEach((key) => {
      key.addEventListener("mousedown", (e) =>
        this.playNote(e.target.dataset.freq, e.target.dataset.note)
      );
      key.addEventListener("mouseup", (e) =>
        this.stopNote(e.target.dataset.note)
      );
      key.addEventListener("mouseleave", (e) =>
        this.stopNote(e.target.dataset.note)
      );
    });

    // 신스 파라미터
    document
      .getElementById("attack")
      ?.addEventListener("input", (e) => this.updateAttack(e.target.value));
    document
      .getElementById("decay")
      ?.addEventListener("input", (e) => this.updateDecay(e.target.value));
    document
      .getElementById("sustain")
      ?.addEventListener("input", (e) => this.updateSustain(e.target.value));
    document
      .getElementById("release")
      ?.addEventListener("input", (e) => this.updateRelease(e.target.value));

    // 신스 프리셋
    document.querySelectorAll(".synth-preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.loadSynthPreset(e.target.dataset.preset)
      );
    });

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  // 컨텍스트 관리
  async handleInitContext() {
    try {
      await this.initAudioContext();
      this.setupAudioNodes();
      this.updateContextInfo();
      this.startVisualization();
      this.showNotification("AudioContext가 초기화되었습니다", "success");

      // 버튼 상태 업데이트
      document.getElementById("initContext").disabled = true;
      document.getElementById("resumeContext").disabled = false;
      document.getElementById("suspendContext").disabled = false;
      document.getElementById("closeContext").disabled = false;
    } catch (error) {
      this.showNotification(
        `AudioContext 초기화 실패: ${error.message}`,
        "error"
      );
    }
  }

  async handleResumeContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
      this.updateContextInfo();
      this.showNotification("AudioContext가 재개되었습니다", "success");
    }
  }

  async handleSuspendContext() {
    if (this.audioContext && this.audioContext.state === "running") {
      await this.audioContext.suspend();
      this.updateContextInfo();
      this.showNotification("AudioContext가 일시정지되었습니다", "warning");
    }
  }

  async handleCloseContext() {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.stopVisualization();
      this.updateContextInfo();
      this.showNotification("AudioContext가 종료되었습니다", "info");

      // 버튼 상태 재설정
      document.getElementById("initContext").disabled = false;
      document.getElementById("resumeContext").disabled = true;
      document.getElementById("suspendContext").disabled = true;
      document.getElementById("closeContext").disabled = true;
    }
  }

  setupAudioNodes() {
    if (!this.audioContext) return;

    // 기본 노드들 설정
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1.0;

    // 이펙트 노드들 설정
    this.effects.set("lowpass", this.audioContext.createBiquadFilter());
    this.effects.set("highpass", this.audioContext.createBiquadFilter());
    this.effects.set("reverb", this.audioContext.createConvolver());

    const lowpass = this.effects.get("lowpass");
    lowpass.type = "lowpass";
    lowpass.frequency.value = 20000;

    const highpass = this.effects.get("highpass");
    highpass.type = "highpass";
    highpass.frequency.value = 20;

    // 연결
    this.gainNode.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  updateContextInfo() {
    const stateEl = document.getElementById("contextState");
    const sampleRateEl = document.getElementById("sampleRate");
    const currentTimeEl = document.getElementById("currentTime");

    if (this.audioContext) {
      stateEl.textContent = this.audioContext.state;
      sampleRateEl.textContent = `${this.audioContext.sampleRate} Hz`;

      // 시간 업데이트
      const updateTime = () => {
        if (this.audioContext) {
          currentTimeEl.textContent = `${this.audioContext.currentTime.toFixed(
            2
          )}s`;
          requestAnimationFrame(updateTime);
        }
      };
      updateTime();
    } else {
      stateEl.textContent = "비활성";
      sampleRateEl.textContent = "-";
      currentTimeEl.textContent = "0.00s";
    }
  }

  // 오실레이터 관리
  updateFrequencyDisplay(value) {
    document.getElementById("frequencyValue").textContent = value;
  }

  updateVolumeDisplay(value) {
    document.getElementById("volumeValue").textContent = value;
  }

  updateDurationDisplay(value) {
    document.getElementById("durationValue").textContent = value;
  }

  async playOscillator() {
    if (!this.audioContext) {
      this.showNotification("먼저 AudioContext를 초기화하세요", "warning");
      return;
    }

    const frequency = parseFloat(document.getElementById("frequency").value);
    const volume = parseFloat(document.getElementById("volume").value) / 100;
    const duration = parseFloat(document.getElementById("duration").value);
    const waveType = document.getElementById("waveType").value;

    try {
      this.oscillator = this.audioContext.createOscillator();
      const oscGain = this.audioContext.createGain();

      this.oscillator.type = waveType;
      this.oscillator.frequency.value = frequency;

      oscGain.gain.value = volume;

      this.oscillator.connect(oscGain);
      oscGain.connect(this.gainNode);

      this.oscillator.start();
      this.oscillator.stop(this.audioContext.currentTime + duration);

      document.getElementById("playOscillator").disabled = true;
      document.getElementById("stopOscillator").disabled = false;

      this.oscillator.addEventListener("ended", () => {
        document.getElementById("playOscillator").disabled = false;
        document.getElementById("stopOscillator").disabled = true;
        this.oscillator = null;
      });

      this.showNotification(
        `${waveType} 파형 재생 시작 (${frequency}Hz)`,
        "success"
      );
    } catch (error) {
      this.showNotification(`오실레이터 재생 실패: ${error.message}`, "error");
    }
  }

  stopOscillator() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
      document.getElementById("playOscillator").disabled = false;
      document.getElementById("stopOscillator").disabled = true;
      this.showNotification("오실레이터 정지", "info");
    }
  }

  async playChord() {
    if (!this.audioContext) {
      this.showNotification("먼저 AudioContext를 초기화하세요", "warning");
      return;
    }

    const baseFreq = parseFloat(document.getElementById("frequency").value);
    const volume = parseFloat(document.getElementById("volume").value) / 300; // 3개 음이므로 나누기
    const duration = parseFloat(document.getElementById("duration").value);
    const waveType = document.getElementById("waveType").value;

    // 메이저 코드: 1, 3, 5도
    const chordFreqs = [
      baseFreq, // 1도
      baseFreq * 1.25, // 3도 (5/4)
      baseFreq * 1.5, // 5도 (3/2)
    ];

    try {
      const oscillators = [];

      chordFreqs.forEach((freq) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = waveType;
        osc.frequency.value = freq;
        gain.gain.value = volume;

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);

        oscillators.push(osc);
      });

      this.showNotification(
        `화음 재생 시작 (${baseFreq.toFixed(1)}Hz 메이저)`,
        "success"
      );
    } catch (error) {
      this.showNotification(`화음 재생 실패: ${error.message}`, "error");
    }
  }

  async playScale() {
    if (!this.audioContext) {
      this.showNotification("먼저 AudioContext를 초기화하세요", "warning");
      return;
    }

    const baseFreq = parseFloat(document.getElementById("frequency").value);
    const volume = parseFloat(document.getElementById("volume").value) / 100;
    const waveType = document.getElementById("waveType").value;
    const noteDuration = 0.3;

    // 메이저 스케일 비율
    const scaleRatios = [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2];

    try {
      scaleRatios.forEach((ratio, index) => {
        setTimeout(() => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();

          osc.type = waveType;
          osc.frequency.value = baseFreq * ratio;
          gain.gain.value = volume;

          // ADSR 엔벨로프 적용
          gain.gain.setValueAtTime(0, this.audioContext.currentTime);
          gain.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + 0.05
          );
          gain.gain.linearRampToValueAtTime(
            volume * 0.7,
            this.audioContext.currentTime + 0.1
          );
          gain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + noteDuration
          );

          osc.connect(gain);
          gain.connect(this.gainNode);

          osc.start();
          osc.stop(this.audioContext.currentTime + noteDuration);
        }, index * noteDuration * 1000);
      });

      this.showNotification(
        `스케일 재생 시작 (${baseFreq.toFixed(1)}Hz 메이저)`,
        "success"
      );
    } catch (error) {
      this.showNotification(`스케일 재생 실패: ${error.message}`, "error");
    }
  }

  initializePresets() {
    this.presets.set("piano", {
      waveType: "triangle",
      frequency: 440,
      volume: 60,
      duration: 2,
    });

    this.presets.set("organ", {
      waveType: "square",
      frequency: 220,
      volume: 80,
      duration: 3,
    });

    this.presets.set("bass", {
      waveType: "sawtooth",
      frequency: 110,
      volume: 90,
      duration: 1.5,
    });

    this.presets.set("lead", {
      waveType: "sawtooth",
      frequency: 880,
      volume: 70,
      duration: 1,
    });

    this.presets.set("pad", {
      waveType: "sine",
      frequency: 330,
      volume: 40,
      duration: 4,
    });

    this.presets.set("noise", {
      waveType: "square",
      frequency: 2000,
      volume: 30,
      duration: 0.5,
    });
  }

  loadPreset(presetName) {
    const preset = this.presets.get(presetName);
    if (!preset) return;

    document.getElementById("waveType").value = preset.waveType;
    document.getElementById("frequency").value = preset.frequency;
    document.getElementById("volume").value = preset.volume;
    document.getElementById("duration").value = preset.duration;

    this.updateFrequencyDisplay(preset.frequency);
    this.updateVolumeDisplay(preset.volume);
    this.updateDurationDisplay(preset.duration);

    this.showNotification(`${presetName} 프리셋 로드됨`, "success");
  }

  // 오디오 파일 관리
  async handleAudioFiles(files) {
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );

        this.audioFiles.set(file.name, {
          buffer: audioBuffer,
          file: file,
          duration: audioBuffer.duration,
        });

        this.displayAudioFile(file.name, audioBuffer.duration);
        this.showNotification(`${file.name} 로드 완료`, "success");
      } catch (error) {
        this.showNotification(
          `${file.name} 로드 실패: ${error.message}`,
          "error"
        );
      }
    }

    this.updateStats();
  }

  displayAudioFile(filename, duration) {
    const container = document.getElementById("audioFileList");

    if (container.querySelector(".file-placeholder")) {
      container.innerHTML = "";
    }

    const fileDiv = document.createElement("div");
    fileDiv.className = "audio-file-item";
    fileDiv.innerHTML = `
      <div class="file-info">
        <div class="file-name">${filename}</div>
        <div class="file-duration">${this.formatTime(duration)}</div>
      </div>
      <div class="file-actions">
        <button onclick="window.webAudioAPI.selectAudioFile('${filename}')" class="btn-small btn-primary">선택</button>
        <button onclick="window.webAudioAPI.removeAudioFile('${filename}')" class="btn-small btn-danger">삭제</button>
      </div>
    `;

    container.appendChild(fileDiv);
  }

  selectAudioFile(filename) {
    const audioData = this.audioFiles.get(filename);
    if (!audioData) return;

    this.audioBuffer = audioData.buffer;
    document.getElementById("currentTrack").textContent = filename;
    document.getElementById("totalTimeDisplay").textContent = this.formatTime(
      audioData.duration
    );

    // 재생 버튼 활성화
    document.getElementById("playAudio").disabled = false;

    this.showNotification(`${filename} 선택됨`, "info");
  }

  removeAudioFile(filename) {
    this.audioFiles.delete(filename);

    const container = document.getElementById("audioFileList");
    const items = container.querySelectorAll(".audio-file-item");

    items.forEach((item) => {
      if (item.querySelector(".file-name").textContent === filename) {
        item.remove();
      }
    });

    if (this.audioFiles.size === 0) {
      container.innerHTML =
        '<div class="file-placeholder">오디오 파일을 선택하거나 샘플을 로드하세요</div>';
    }

    this.updateStats();
    this.showNotification(`${filename} 삭제됨`, "info");
  }

  async loadSampleAudio() {
    // 샘플 오디오 생성 (440Hz 사인파 3초)
    const sampleRate = 44100;
    const duration = 3;
    const frequency = 440;

    const arrayBuffer = this.audioContext.createBuffer(
      2,
      sampleRate * duration,
      sampleRate
    );

    for (let channel = 0; channel < arrayBuffer.numberOfChannels; channel++) {
      const channelData = arrayBuffer.getChannelData(channel);

      for (let i = 0; i < channelData.length; i++) {
        const time = i / sampleRate;
        channelData[i] = Math.sin(2 * Math.PI * frequency * time) * 0.3;
      }
    }

    this.audioFiles.set("샘플 사인파 (440Hz)", {
      buffer: arrayBuffer,
      file: null,
      duration: duration,
    });

    this.displayAudioFile("샘플 사인파 (440Hz)", duration);
    this.updateStats();
    this.showNotification("샘플 오디오가 생성되었습니다", "success");
  }

  // 오디오 재생 제어
  async playAudio() {
    if (!this.audioContext || !this.audioBuffer) {
      this.showNotification("재생할 오디오를 선택하세요", "warning");
      return;
    }

    try {
      this.stopAudio(); // 기존 재생 중단

      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = this.audioBuffer;

      // 이펙트 체인 연결
      this.currentSource.connect(this.gainNode);

      this.currentSource.start();
      this.isPlaying = true;

      // 버튼 상태 업데이트
      document.getElementById("playAudio").disabled = true;
      document.getElementById("pauseAudio").disabled = false;
      document.getElementById("stopAudio").disabled = false;
      document.getElementById("progressBar").disabled = false;

      // 진행률 업데이트
      this.updateProgress();

      this.currentSource.addEventListener("ended", () => {
        this.isPlaying = false;
        document.getElementById("playAudio").disabled = false;
        document.getElementById("pauseAudio").disabled = true;
        document.getElementById("stopAudio").disabled = true;
        document.getElementById("progressBar").disabled = true;
      });

      this.showNotification("재생 시작", "success");
    } catch (error) {
      this.showNotification(`재생 실패: ${error.message}`, "error");
    }
  }

  pauseAudio() {
    // Web Audio API는 일시정지를 직접 지원하지 않으므로 정지 후 재시작으로 구현
    this.stopAudio();
    this.showNotification("일시정지됨", "warning");
  }

  stopAudio() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }

    this.isPlaying = false;

    // 버튼 상태 재설정
    document.getElementById("playAudio").disabled = false;
    document.getElementById("pauseAudio").disabled = true;
    document.getElementById("stopAudio").disabled = true;
    document.getElementById("progressBar").value = 0;
    document.getElementById("currentTimeDisplay").textContent = "00:00";

    this.showNotification("재생 정지", "info");
  }

  updateProgress() {
    if (!this.isPlaying || !this.audioBuffer) return;

    const startTime = this.audioContext.currentTime;
    const duration = this.audioBuffer.duration;

    const updateLoop = () => {
      if (!this.isPlaying) return;

      const elapsed = this.audioContext.currentTime - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      document.getElementById("progressBar").value = progress;
      document.getElementById("currentTimeDisplay").textContent =
        this.formatTime(elapsed);

      if (progress < 100) {
        requestAnimationFrame(updateLoop);
      }
    };

    updateLoop();
  }

  // 이펙트 제어
  updateMasterVolume(value) {
    document.getElementById("masterVolumeValue").textContent = value;
    if (this.gainNode) {
      this.gainNode.gain.value = value / 100;
    }
  }

  updatePlaybackRate(value) {
    document.getElementById("playbackRateValue").textContent = value;
    if (this.currentSource) {
      this.currentSource.playbackRate.value = parseFloat(value);
    }
  }

  updateDetune(value) {
    document.getElementById("detuneValue").textContent = value;
    if (this.currentSource) {
      this.currentSource.detune.value = parseFloat(value);
    }
  }

  updateLowpass(value) {
    document.getElementById("lowpassValue").textContent = value;
    const filter = this.effects.get("lowpass");
    if (filter) {
      filter.frequency.value = parseFloat(value);
    }
  }

  updateHighpass(value) {
    document.getElementById("highpassValue").textContent = value;
    const filter = this.effects.get("highpass");
    if (filter) {
      filter.frequency.value = parseFloat(value);
    }
  }

  updateReverb(value) {
    document.getElementById("reverbValue").textContent = value;
    // 리버브 구현은 복잡하므로 여기서는 간단히 표시만
  }

  // 시각화
  startVisualization() {
    if (!this.analyser) return;

    const canvas = document.getElementById("visualizerCanvas");
    const ctx = canvas.getContext("2d");

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.analyser) return;

      this.animationId = requestAnimationFrame(draw);

      this.analyser.getByteFrequencyData(dataArray);

      // 캔버스 클리어
      ctx.fillStyle = "rgb(20, 20, 30)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const visualizerType = document.querySelector(
        'input[name="visualizerType"]:checked'
      ).value;

      switch (visualizerType) {
        case "frequency":
          this.drawFrequencySpectrum(ctx, dataArray, canvas);
          break;
        case "waveform":
          this.drawWaveform(ctx, dataArray, canvas);
          break;
        case "bars":
          this.drawBars(ctx, dataArray, canvas);
          break;
        case "circular":
          this.drawCircular(ctx, dataArray, canvas);
          break;
      }

      this.updateFrequencyAnalysis(dataArray);
    };

    draw();
  }

  stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  drawFrequencySpectrum(ctx, dataArray, canvas) {
    const barWidth = canvas.width / dataArray.length;

    ctx.fillStyle = "rgb(0, 255, 0)";

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeight,
        barWidth,
        barHeight
      );
    }
  }

  drawWaveform(ctx, dataArray, canvas) {
    this.analyser.getByteTimeDomainData(dataArray);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0, 255, 255)";
    ctx.beginPath();

    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
  }

  drawBars(ctx, dataArray, canvas) {
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      const r = barHeight + 25 * (i / dataArray.length);
      const g = 250 * (i / dataArray.length);
      const b = 50;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  drawCircular(ctx, dataArray, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    ctx.strokeStyle = "rgb(255, 0, 255)";
    ctx.lineWidth = 2;

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * 2 * Math.PI;
      const amplitude = (dataArray[i] / 255) * radius;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + amplitude);
      const y2 = centerY + Math.sin(angle) * (radius + amplitude);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  updateFrequencyAnalysis(dataArray) {
    // 주파수 대역별 분석
    const bassEnd = Math.floor(dataArray.length * 0.1);
    const midEnd = Math.floor(dataArray.length * 0.6);

    let bassSum = 0,
      midSum = 0,
      trebleSum = 0;

    for (let i = 0; i < bassEnd; i++) bassSum += dataArray[i];
    for (let i = bassEnd; i < midEnd; i++) midSum += dataArray[i];
    for (let i = midEnd; i < dataArray.length; i++) trebleSum += dataArray[i];

    const bassLevel = (bassSum / bassEnd / 255) * 100;
    const midLevel = (midSum / (midEnd - bassEnd) / 255) * 100;
    const trebleLevel = (trebleSum / (dataArray.length - midEnd) / 255) * 100;

    document.getElementById("bassLevel").style.width = `${bassLevel}%`;
    document.getElementById("midLevel").style.width = `${midLevel}%`;
    document.getElementById("trebleLevel").style.width = `${trebleLevel}%`;

    document.getElementById("bassValue").textContent = `${bassLevel.toFixed(
      1
    )}%`;
    document.getElementById("midValue").textContent = `${midLevel.toFixed(1)}%`;
    document.getElementById("trebleValue").textContent = `${trebleLevel.toFixed(
      1
    )}%`;
  }

  // 시각화 설정
  updateFFTSize(value) {
    if (this.analyser) {
      this.analyser.fftSize = parseInt(value);
    }
  }

  updateSmoothing(value) {
    document.getElementById("smoothingValue").textContent = value;
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = parseFloat(value);
    }
  }

  changeVisualizerType(type) {
    // 시각화 타입이 변경되면 다음 프레임부터 새로운 스타일로 그려짐
    this.showNotification(`시각화 타입: ${type}`, "info");
  }

  // 마이크 기능
  async startMicrophone() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const source = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );
      source.connect(this.analyser);

      document.getElementById("micStatus").textContent = "활성";
      document.getElementById("startMic").disabled = true;
      document.getElementById("stopMic").disabled = false;
      document.getElementById("startRecord").disabled = false;

      this.updateInputLevel();
      this.showNotification("마이크가 활성화되었습니다", "success");
    } catch (error) {
      this.showNotification(`마이크 접근 실패: ${error.message}`, "error");
    }
  }

  stopMicrophone() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    document.getElementById("micStatus").textContent = "비활성";
    document.getElementById("startMic").disabled = false;
    document.getElementById("stopMic").disabled = true;
    document.getElementById("startRecord").disabled = true;
    document.getElementById("inputLevel").style.width = "0%";

    this.showNotification("마이크가 비활성화되었습니다", "info");
  }

  updateInputLevel() {
    if (!this.analyser || !this.mediaStream) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLoop = () => {
      if (!this.mediaStream) return;

      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }

      const average = sum / dataArray.length;
      const level = (average / 255) * 100;

      document.getElementById("inputLevel").style.width = `${level}%`;

      requestAnimationFrame(updateLoop);
    };

    updateLoop();
  }

  // 녹음 기능
  startRecording() {
    if (!this.mediaStream) {
      this.showNotification("먼저 마이크를 시작하세요", "warning");
      return;
    }

    const format = document.getElementById("recordFormat").value;
    const quality = document.getElementById("recordQuality").value;

    const options = {
      mimeType: format,
      audioBitsPerSecond:
        quality === "low" ? 64000 : quality === "medium" ? 128000 : 256000,
    };

    try {
      this.recorder = new MediaRecorder(this.mediaStream, options);
      this.recordedChunks = [];

      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.recorder.onstop = () => {
        this.saveRecording();
      };

      this.recorder.start();
      this.isRecording = true;

      document.getElementById("startRecord").disabled = true;
      document.getElementById("stopRecord").disabled = false;

      this.showNotification("녹음이 시작되었습니다", "success");
    } catch (error) {
      this.showNotification(`녹음 시작 실패: ${error.message}`, "error");
    }
  }

  stopRecording() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;

      document.getElementById("startRecord").disabled = false;
      document.getElementById("stopRecord").disabled = true;

      this.showNotification("녹음이 완료되었습니다", "success");
    }
  }

  saveRecording() {
    const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const filename = `recording_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.webm`;

    this.displayRecording(filename, url, blob.size);
  }

  displayRecording(filename, url, size) {
    const container = document.getElementById("recordedFiles");

    if (container.querySelector(".recordings-placeholder")) {
      container.innerHTML = "";
    }

    const recordingDiv = document.createElement("div");
    recordingDiv.className = "recording-item";
    recordingDiv.innerHTML = `
      <div class="recording-info">
        <div class="recording-name">${filename}</div>
        <div class="recording-size">${(size / 1024 / 1024).toFixed(2)} MB</div>
      </div>
      <div class="recording-controls">
        <audio controls src="${url}"></audio>
      </div>
      <div class="recording-actions">
        <a href="${url}" download="${filename}" class="btn-small btn-success">💾 다운로드</a>
        <button onclick="this.parentElement.parentElement.remove()" class="btn-small btn-danger">🗑️ 삭제</button>
      </div>
    `;

    container.appendChild(recordingDiv);
  }

  // 신디사이저 기능
  playNote(frequency, note) {
    if (!this.audioContext) return;

    const freq = parseFloat(frequency);

    // 이미 재생 중인 노트는 무시
    if (this[`note_${note}`]) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = document.getElementById("osc1Type").value;
    osc.frequency.value = freq;

    // ADSR 엔벨로프 적용
    const attack = parseFloat(document.getElementById("attack").value);
    const decay = parseFloat(document.getElementById("decay").value);
    const sustain = parseFloat(document.getElementById("sustain").value);

    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + attack);
    gain.gain.linearRampToValueAtTime(0.3 * sustain, now + attack + decay);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start();

    this[`note_${note}`] = { osc, gain };

    // 키 시각적 피드백
    const keyElement = document.querySelector(`[data-note="${note}"]`);
    if (keyElement) {
      keyElement.classList.add("active");
    }
  }

  stopNote(note) {
    const noteData = this[`note_${note}`];
    if (!noteData) return;

    const { osc, gain } = noteData;
    const release = parseFloat(document.getElementById("release").value);
    const now = this.audioContext.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + release);

    osc.stop(now + release);

    delete this[`note_${note}`];

    // 키 시각적 피드백 제거
    const keyElement = document.querySelector(`[data-note="${note}"]`);
    if (keyElement) {
      keyElement.classList.remove("active");
    }
  }

  // 신스 파라미터 업데이트
  updateAttack(value) {
    document.getElementById("attackValue").textContent = value;
  }

  updateDecay(value) {
    document.getElementById("decayValue").textContent = value;
  }

  updateSustain(value) {
    document.getElementById("sustainValue").textContent = value;
  }

  updateRelease(value) {
    document.getElementById("releaseValue").textContent = value;
  }

  loadSynthPreset(presetName) {
    const presets = {
      lead: {
        osc1Type: "sawtooth",
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
      },
      bass: {
        osc1Type: "square",
        attack: 0.01,
        decay: 0.2,
        sustain: 0.8,
        release: 0.1,
      },
      pad: {
        osc1Type: "sine",
        attack: 0.5,
        decay: 0.3,
        sustain: 0.6,
        release: 1.0,
      },
      pluck: {
        osc1Type: "triangle",
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.2,
      },
      organ: {
        osc1Type: "square",
        attack: 0.01,
        decay: 0.1,
        sustain: 0.9,
        release: 0.1,
      },
      strings: {
        osc1Type: "sawtooth",
        attack: 0.3,
        decay: 0.2,
        sustain: 0.7,
        release: 0.8,
      },
    };

    const preset = presets[presetName];
    if (!preset) return;

    document.getElementById("osc1Type").value = preset.osc1Type;
    document.getElementById("attack").value = preset.attack;
    document.getElementById("decay").value = preset.decay;
    document.getElementById("sustain").value = preset.sustain;
    document.getElementById("release").value = preset.release;

    this.updateAttack(preset.attack);
    this.updateDecay(preset.decay);
    this.updateSustain(preset.sustain);
    this.updateRelease(preset.release);

    this.showNotification(`${presetName} 신스 프리셋 로드됨`, "success");
  }

  // 마이크 이펙트
  updateMicGain(value) {
    document.getElementById("micGainValue").textContent = value;
    // 실제 게인 적용은 마이크 소스에 연결된 게인 노드에서 처리
  }

  toggleEcho(enabled) {
    // 에코 이펙트 토글 (실제 구현은 복잡한 딜레이 체인 필요)
    this.showNotification(
      `에코 이펙트 ${enabled ? "활성화" : "비활성화"}`,
      "info"
    );
  }

  updateEchoDelay(value) {
    document.getElementById("echoDelayValue").textContent = value;
  }

  updateEchoFeedback(value) {
    document.getElementById("echoFeedbackValue").textContent = value;
  }

  // 통계 업데이트
  updateStats() {
    document.getElementById("loadedFiles").textContent = this.audioFiles.size;

    let totalDuration = 0;
    this.audioFiles.forEach((file) => {
      totalDuration += file.duration;
    });

    document.getElementById("totalPlaytime").textContent =
      this.formatTime(totalDuration);

    if (this.audioContext) {
      document.getElementById("audioLatency").textContent = `${(
        this.audioContext.baseLatency * 1000
      ).toFixed(1)}ms`;
      document.getElementById("bufferSize").textContent =
        this.audioContext.sampleRate;
    }
  }

  // 유틸리티 메소드
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notification = document.createElement("div");

    const icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
    };

    const icon = icons[type] || "ℹ️";

    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    notifications.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// 전역 접근을 위한 설정
window.webAudioAPI = null;

// 초기화
function initWebAudioAPI() {
  console.log("🚀 Web Audio API 초기화 함수 호출");
  window.webAudioAPI = new WebAudioAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initWebAudioAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initWebAudioAPI();
}

console.log(
  "📄 Web Audio API 스크립트 로드 완료, readyState:",
  document.readyState
);
