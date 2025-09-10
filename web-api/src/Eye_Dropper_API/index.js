import "./style.css";

// Eye Dropper API 테스트 및 데모
class EyeDropperDemo {
  constructor() {
    this.eyeDropper = null;
    this.colorHistory = [];
    this.colorPalette = [];
    this.isPickingColor = false;
    this.gradientColors = [];

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
    this.initializeColorDemo();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    const eyeDropperSupport = "EyeDropper" in window;

    let statusHTML = "";

    if (eyeDropperSupport) {
      statusHTML = `<span class="status-success">✅ Eye Dropper API 완전 지원됨</span>`;
      this.eyeDropper = new EyeDropper();
    } else {
      statusHTML = `<span class="status-error">❌ Eye Dropper API가 지원되지 않습니다</span>`;
      this.disableButtons();
    }

    statusElement.innerHTML = statusHTML;
    return eyeDropperSupport;
  }

  disableButtons() {
    document.querySelectorAll(".dropper-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="eyedropper-demo">
        <h1>🎨 Eye Dropper API 테스트</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <!-- 색상 추출 섹션 -->
        <div class="dropper-section color-picker-section">
          <h2>🎯 색상 추출하기</h2>
          
          <div class="picker-controls">
            <div class="control-group">
              <button id="startColorPicker" class="dropper-btn picker-btn">
                🎨 색상 스포이드 시작
              </button>
              <div class="picker-status" id="pickerStatus">
                <span class="status-text">스포이드 버튼을 클릭하여 화면의 색상을 추출해보세요</span>
                <div class="picking-indicator" id="pickingIndicator" style="display: none;">
                  <span class="crosshair">✛</span>
                  <span>색상을 선택하세요...</span>
                </div>
              </div>
            </div>
          </div>

          <div class="current-color-display">
            <h4>🎨 선택된 색상</h4>
            <div class="color-preview-large">
              <div id="currentColorSwatch" class="color-swatch-large"></div>
              <div class="color-info">
                <div class="color-value">
                  <label>HEX:</label>
                  <input type="text" id="currentHex" readonly>
                  <button class="copy-btn" data-target="currentHex">📋</button>
                </div>
                <div class="color-value">
                  <label>RGB:</label>
                  <input type="text" id="currentRgb" readonly>
                  <button class="copy-btn" data-target="currentRgb">📋</button>
                </div>
                <div class="color-value">
                  <label>HSL:</label>
                  <input type="text" id="currentHsl" readonly>
                  <button class="copy-btn" data-target="currentHsl">📋</button>
                </div>
                <div class="color-value">
                  <label>HSV:</label>
                  <input type="text" id="currentHsv" readonly>
                  <button class="copy-btn" data-target="currentHsv">📋</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 색상 팔레트 섹션 -->
        <div class="dropper-section palette-section">
          <h2>🎨 색상 팔레트</h2>
          
          <div class="palette-controls">
            <div class="control-group">
              <button id="addToPalette" class="dropper-btn add-btn" disabled>
                ➕ 팔레트에 추가
              </button>
              <button id="clearPalette" class="dropper-btn clear-btn">
                🗑️ 팔레트 지우기
              </button>
              <button id="exportPalette" class="dropper-btn export-btn">
                📤 팔레트 내보내기
              </button>
              <button id="generateHarmony" class="dropper-btn harmony-btn" disabled>
                🌈 조화색 생성
              </button>
            </div>
          </div>

          <div class="palette-container" id="paletteContainer">
            <div class="empty-palette">
              <p>🎨 색상을 추출하고 팔레트에 추가해보세요!</p>
            </div>
          </div>

          <div class="harmony-colors" id="harmonyColors" style="display: none;">
            <h4>🌈 조화색 (Color Harmony)</h4>
            <div class="harmony-container">
              <div class="harmony-group">
                <h5>보색 (Complementary)</h5>
                <div id="complementaryColors" class="harmony-row"></div>
              </div>
              <div class="harmony-group">
                <h5>삼각색 (Triadic)</h5>
                <div id="triadicColors" class="harmony-row"></div>
              </div>
              <div class="harmony-group">
                <h5>유사색 (Analogous)</h5>
                <div id="analogousColors" class="harmony-row"></div>
              </div>
              <div class="harmony-group">
                <h5>분할보색 (Split Complementary)</h5>
                <div id="splitComplementaryColors" class="harmony-row"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 색상 분석 섹션 -->
        <div class="dropper-section analysis-section">
          <h2>🔍 색상 분석</h2>
          
          <div class="analysis-container" id="analysisContainer" style="display: none;">
            <div class="analysis-grid">
              <div class="analysis-item">
                <h4>🌡️ 색온도</h4>
                <div class="analysis-value" id="colorTemperature">-</div>
                <div class="temperature-bar" id="temperatureBar"></div>
              </div>
              <div class="analysis-item">
                <h4>💡 밝기</h4>
                <div class="analysis-value" id="colorBrightness">-</div>
                <div class="brightness-bar" id="brightnessBar"></div>
              </div>
              <div class="analysis-item">
                <h4>🎨 채도</h4>
                <div class="analysis-value" id="colorSaturation">-</div>
                <div class="saturation-bar" id="saturationBar"></div>
              </div>
              <div class="analysis-item">
                <h4>👁️ 접근성</h4>
                <div class="accessibility-info" id="accessibilityInfo">
                  <div class="contrast-check">
                    <span>대비율 (흰색): <span id="whiteContrast">-</span></span>
                    <span>대비율 (검은색): <span id="blackContrast">-</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="color-blindness-simulation">
              <h4>👁️ 색맹 시뮬레이션</h4>
              <div class="simulation-grid">
                <div class="simulation-item">
                  <div class="simulation-label">원본</div>
                  <div id="originalSimulation" class="simulation-swatch"></div>
                </div>
                <div class="simulation-item">
                  <div class="simulation-label">적록색맹</div>
                  <div id="protanopiaSimulation" class="simulation-swatch"></div>
                </div>
                <div class="simulation-item">
                  <div class="simulation-label">녹색맹</div>
                  <div id="deuteranopiaSimulation" class="simulation-swatch"></div>
                </div>
                <div class="simulation-item">
                  <div class="simulation-label">청황색맹</div>
                  <div id="tritanopiaSimulation" class="simulation-swatch"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 색상 히스토리 섹션 -->
        <div class="dropper-section history-section">
          <h2>📜 색상 히스토리</h2>
          
          <div class="history-controls">
            <button id="clearHistory" class="dropper-btn clear-btn">
              🗑️ 히스토리 지우기
            </button>
            <button id="exportHistory" class="dropper-btn export-btn">
              📤 히스토리 내보내기
            </button>
          </div>
          
          <div class="history-container" id="historyContainer">
            <div class="empty-history">
              <p>아직 추출한 색상이 없습니다.</p>
              <p>스포이드를 사용해서 색상을 추출해보세요!</p>
            </div>
          </div>
        </div>

        <!-- 색상 데모 섹션 -->
        <div class="dropper-section demo-section">
          <h2>🌈 색상 데모</h2>
          
          <div class="demo-container">
            <div class="color-samples">
              <h4>📚 샘플 색상들</h4>
              <div class="sample-grid">
                <div class="color-sample" style="background: #ff6b6b;" data-color="#ff6b6b">
                  <span>레드</span>
                </div>
                <div class="color-sample" style="background: #4ecdc4;" data-color="#4ecdc4">
                  <span>티퀄</span>
                </div>
                <div class="color-sample" style="background: #45b7d1;" data-color="#45b7d1">
                  <span>블루</span>
                </div>
                <div class="color-sample" style="background: #96ceb4;" data-color="#96ceb4">
                  <span>민트</span>
                </div>
                <div class="color-sample" style="background: #ffeaa7;" data-color="#ffeaa7">
                  <span>옐로우</span>
                </div>
                <div class="color-sample" style="background: #dda0dd;" data-color="#dda0dd">
                  <span>퍼플</span>
                </div>
                <div class="color-sample" style="background: #ff7675;" data-color="#ff7675">
                  <span>코랄</span>
                </div>
                <div class="color-sample" style="background: #fd79a8;" data-color="#fd79a8">
                  <span>핑크</span>
                </div>
              </div>
            </div>

            <div class="gradient-demo">
              <h4>🌈 그라디언트 데모</h4>
              <div class="gradient-samples">
                <div class="gradient-sample gradient1">
                  <span>선셋</span>
                </div>
                <div class="gradient-sample gradient2">
                  <span>오션</span>
                </div>
                <div class="gradient-sample gradient3">
                  <span>포레스트</span>
                </div>
                <div class="gradient-sample gradient4">
                  <span>스페이스</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Eye Dropper API 정보</h3>
          <div class="info-grid">
            <div class="info-card">
              <h4>🎯 Eye Dropper</h4>
              <ul>
                <li>화면의 모든 픽셀 색상 추출</li>
                <li>시스템 레벨 색상 선택</li>
                <li>높은 정확도의 색상 값</li>
                <li>크로스 플랫폼 지원</li>
                <li>보안이 강화된 API</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🎨 색상 형식</h4>
              <ul>
                <li><strong>HEX:</strong> #RRGGBB 형식</li>
                <li><strong>RGB:</strong> Red, Green, Blue</li>
                <li><strong>HSL:</strong> Hue, Saturation, Lightness</li>
                <li><strong>HSV:</strong> Hue, Saturation, Value</li>
                <li>모든 형식 상호 변환</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🌈 색상 이론</h4>
              <ul>
                <li><strong>보색:</strong> 180도 반대편 색상</li>
                <li><strong>삼각색:</strong> 120도 간격 3색</li>
                <li><strong>유사색:</strong> 인접한 색상들</li>
                <li><strong>분할보색:</strong> 보색의 양옆 색상</li>
                <li>조화로운 색상 조합</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>💡 활용 분야</h4>
              <ul>
                <li>웹 디자인 & UI/UX</li>
                <li>그래픽 디자인</li>
                <li>브랜딩 & 마케팅</li>
                <li>접근성 개선</li>
                <li>색상 팔레트 생성</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 색상 추출
    document
      .getElementById("startColorPicker")
      .addEventListener("click", () => this.startColorPicker());

    // 팔레트 관리
    document
      .getElementById("addToPalette")
      .addEventListener("click", () => this.addToPalette());
    document
      .getElementById("clearPalette")
      .addEventListener("click", () => this.clearPalette());
    document
      .getElementById("exportPalette")
      .addEventListener("click", () => this.exportPalette());
    document
      .getElementById("generateHarmony")
      .addEventListener("click", () => this.generateHarmony());

    // 히스토리
    document
      .getElementById("clearHistory")
      .addEventListener("click", () => this.clearHistory());
    document
      .getElementById("exportHistory")
      .addEventListener("click", () => this.exportHistory());

    // 복사 버튼들
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const targetId = e.target.dataset.target;
        this.copyToClipboard(targetId);
      });
    });

    // 샘플 색상 클릭
    document.querySelectorAll(".color-sample").forEach((sample) => {
      sample.addEventListener("click", (e) => {
        const color = e.target.closest(".color-sample").dataset.color;
        this.simulateColorPick(color);
      });
    });
  }

  initializeColorDemo() {
    // 기본 색상으로 데모 표시
    this.simulateColorPick("#646cff");
  }

  async startColorPicker() {
    if (!this.eyeDropper) {
      this.showNotification("Eye Dropper API가 지원되지 않습니다.", "error");
      return;
    }

    try {
      this.isPickingColor = true;
      this.updatePickerUI();

      const result = await this.eyeDropper.open();
      const color = result.sRGBHex;

      this.handleColorPicked(color);
      this.showNotification("색상이 성공적으로 추출되었습니다!", "success");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Color picker error:", error);
        this.showNotification("색상 추출 중 오류가 발생했습니다.", "error");
      }
    } finally {
      this.isPickingColor = false;
      this.updatePickerUI();
    }
  }

  simulateColorPick(color) {
    this.handleColorPicked(color);
  }

  handleColorPicked(hexColor) {
    // 현재 색상 업데이트
    this.updateCurrentColor(hexColor);

    // 히스토리에 추가
    this.addToHistory(hexColor);

    // 색상 분석 표시
    this.analyzeColor(hexColor);

    // 버튼 활성화
    document.getElementById("addToPalette").disabled = false;
    document.getElementById("generateHarmony").disabled = false;
  }

  updateCurrentColor(hexColor) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);

    // 색상 스와치 업데이트
    document.getElementById("currentColorSwatch").style.backgroundColor =
      hexColor;

    // 색상 값 업데이트
    document.getElementById("currentHex").value = hexColor.toUpperCase();
    document.getElementById(
      "currentRgb"
    ).value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById("currentHsl").value = `hsl(${Math.round(
      hsl.h
    )}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    document.getElementById("currentHsv").value = `hsv(${Math.round(
      hsv.h
    )}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;
  }

  analyzeColor(hexColor) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // 색온도 계산
    const temperature = this.calculateColorTemperature(rgb);
    document.getElementById("colorTemperature").textContent = `${temperature}K`;
    this.updateTemperatureBar(temperature);

    // 밝기 계산
    const brightness = Math.round(hsl.l);
    document.getElementById("colorBrightness").textContent = `${brightness}%`;
    this.updateBrightnessBar(brightness);

    // 채도 계산
    const saturation = Math.round(hsl.s);
    document.getElementById("colorSaturation").textContent = `${saturation}%`;
    this.updateSaturationBar(saturation);

    // 접근성 분석
    this.analyzeAccessibility(rgb);

    // 색맹 시뮬레이션
    this.simulateColorBlindness(hexColor);

    document.getElementById("analysisContainer").style.display = "block";
  }

  calculateColorTemperature(rgb) {
    // 간단한 색온도 근사 계산
    const { r, g, b } = rgb;
    const x = (0.412453 * r + 0.35758 * g + 0.180423 * b) / 255;
    const y = (0.212671 * r + 0.71516 * g + 0.072169 * b) / 255;
    const z = (0.019334 * r + 0.119193 * g + 0.950227 * b) / 255;

    const sum = x + y + z;
    if (sum === 0) return 6500;

    const chromaticityX = x / sum;
    const chromaticityY = y / sum;

    const n = (chromaticityX - 0.332) / (0.1858 - chromaticityY);
    const temperature = 449 * n ** 3 + 3525 * n ** 2 + 6823.3 * n + 5520.33;

    return Math.max(1000, Math.min(15000, Math.round(temperature)));
  }

  updateTemperatureBar(temperature) {
    const bar = document.getElementById("temperatureBar");
    const percentage = ((temperature - 1000) / (15000 - 1000)) * 100;
    bar.style.background = `linear-gradient(to right, 
      #ff4444 0%, 
      #ffaa44 25%, 
      #ffffff ${percentage}%, 
      #aaccff 75%, 
      #4488ff 100%)`;
  }

  updateBrightnessBar(brightness) {
    const bar = document.getElementById("brightnessBar");
    bar.style.background = `linear-gradient(to right, #000000, #ffffff)`;
    bar.style.position = "relative";
    bar.innerHTML = `<div style="position: absolute; left: ${brightness}%; top: 0; bottom: 0; width: 2px; background: red;"></div>`;
  }

  updateSaturationBar(saturation) {
    const bar = document.getElementById("saturationBar");
    bar.style.background = `linear-gradient(to right, #808080, #ff0000)`;
    bar.style.position = "relative";
    bar.innerHTML = `<div style="position: absolute; left: ${saturation}%; top: 0; bottom: 0; width: 2px; background: white;"></div>`;
  }

  analyzeAccessibility(rgb) {
    const whiteContrast = this.calculateContrast(rgb, {
      r: 255,
      g: 255,
      b: 255,
    });
    const blackContrast = this.calculateContrast(rgb, { r: 0, g: 0, b: 0 });

    document.getElementById("whiteContrast").textContent =
      whiteContrast.toFixed(2);
    document.getElementById("blackContrast").textContent =
      blackContrast.toFixed(2);

    // WCAG 기준에 따른 표시
    const whiteElement = document.getElementById("whiteContrast");
    const blackElement = document.getElementById("blackContrast");

    if (whiteContrast >= 4.5) {
      whiteElement.style.color = "#4ade80";
    } else if (whiteContrast >= 3) {
      whiteElement.style.color = "#fbbf24";
    } else {
      whiteElement.style.color = "#ef4444";
    }

    if (blackContrast >= 4.5) {
      blackElement.style.color = "#4ade80";
    } else if (blackContrast >= 3) {
      blackElement.style.color = "#fbbf24";
    } else {
      blackElement.style.color = "#ef4444";
    }
  }

  calculateContrast(color1, color2) {
    const getLuminance = (rgb) => {
      const { r, g, b } = rgb;
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  simulateColorBlindness(hexColor) {
    const rgb = this.hexToRgb(hexColor);

    // 원본
    document.getElementById("originalSimulation").style.backgroundColor =
      hexColor;

    // 적록색맹 (Protanopia)
    const protanopia = this.simulateProtanopia(rgb);
    document.getElementById("protanopiaSimulation").style.backgroundColor =
      this.rgbToHex(protanopia);

    // 녹색맹 (Deuteranopia)
    const deuteranopia = this.simulateDeuteranopia(rgb);
    document.getElementById("deuteranopiaSimulation").style.backgroundColor =
      this.rgbToHex(deuteranopia);

    // 청황색맹 (Tritanopia)
    const tritanopia = this.simulateTritanopia(rgb);
    document.getElementById("tritanopiaSimulation").style.backgroundColor =
      this.rgbToHex(tritanopia);
  }

  simulateProtanopia(rgb) {
    // 적록색맹 시뮬레이션 매트릭스
    return {
      r: Math.round(0.567 * rgb.r + 0.433 * rgb.g + 0 * rgb.b),
      g: Math.round(0.558 * rgb.r + 0.442 * rgb.g + 0 * rgb.b),
      b: Math.round(0 * rgb.r + 0.242 * rgb.g + 0.758 * rgb.b),
    };
  }

  simulateDeuteranopia(rgb) {
    // 녹색맹 시뮬레이션 매트릭스
    return {
      r: Math.round(0.625 * rgb.r + 0.375 * rgb.g + 0 * rgb.b),
      g: Math.round(0.7 * rgb.r + 0.3 * rgb.g + 0 * rgb.b),
      b: Math.round(0 * rgb.r + 0.3 * rgb.g + 0.7 * rgb.b),
    };
  }

  simulateTritanopia(rgb) {
    // 청황색맹 시뮬레이션 매트릭스
    return {
      r: Math.round(0.95 * rgb.r + 0.05 * rgb.g + 0 * rgb.b),
      g: Math.round(0 * rgb.r + 0.433 * rgb.g + 0.567 * rgb.b),
      b: Math.round(0 * rgb.r + 0.475 * rgb.g + 0.525 * rgb.b),
    };
  }

  addToPalette() {
    const currentHex = document.getElementById("currentHex").value;
    if (!currentHex || this.colorPalette.includes(currentHex)) {
      this.showNotification("이미 팔레트에 있는 색상입니다.", "warning");
      return;
    }

    this.colorPalette.push(currentHex);
    this.updatePaletteDisplay();
    this.showNotification("색상이 팔레트에 추가되었습니다!", "success");
  }

  updatePaletteDisplay() {
    const container = document.getElementById("paletteContainer");

    if (this.colorPalette.length === 0) {
      container.innerHTML = `
        <div class="empty-palette">
          <p>🎨 색상을 추출하고 팔레트에 추가해보세요!</p>
        </div>
      `;
      return;
    }

    let html = '<div class="palette-grid">';
    this.colorPalette.forEach((color, index) => {
      const rgb = this.hexToRgb(color);
      html += `
        <div class="palette-item">
          <div class="palette-swatch" style="background-color: ${color}"></div>
          <div class="palette-info">
            <div class="palette-hex">${color}</div>
            <div class="palette-rgb">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
            <button class="remove-palette-btn" data-index="${index}">✕</button>
          </div>
        </div>
      `;
    });
    html += "</div>";

    container.innerHTML = html;

    // 제거 버튼 이벤트 바인딩
    container.querySelectorAll(".remove-palette-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeFromPalette(index);
      });
    });
  }

  removeFromPalette(index) {
    this.colorPalette.splice(index, 1);
    this.updatePaletteDisplay();
    this.showNotification("색상이 팔레트에서 제거되었습니다.", "info");
  }

  clearPalette() {
    this.colorPalette = [];
    this.updatePaletteDisplay();
    document.getElementById("harmonyColors").style.display = "none";
    this.showNotification("팔레트가 지워졌습니다.", "info");
  }

  generateHarmony() {
    const currentHex = document.getElementById("currentHex").value;
    if (!currentHex) return;

    const baseHsl = this.rgbToHsl(...Object.values(this.hexToRgb(currentHex)));

    // 보색 (Complementary)
    const complementary = this.hslToHex(
      (baseHsl.h + 180) % 360,
      baseHsl.s,
      baseHsl.l
    );
    this.displayHarmonyColors("complementaryColors", [
      currentHex,
      complementary,
    ]);

    // 삼각색 (Triadic)
    const triadic1 = this.hslToHex(
      (baseHsl.h + 120) % 360,
      baseHsl.s,
      baseHsl.l
    );
    const triadic2 = this.hslToHex(
      (baseHsl.h + 240) % 360,
      baseHsl.s,
      baseHsl.l
    );
    this.displayHarmonyColors("triadicColors", [
      currentHex,
      triadic1,
      triadic2,
    ]);

    // 유사색 (Analogous)
    const analogous1 = this.hslToHex(
      (baseHsl.h + 30) % 360,
      baseHsl.s,
      baseHsl.l
    );
    const analogous2 = this.hslToHex(
      (baseHsl.h - 30 + 360) % 360,
      baseHsl.s,
      baseHsl.l
    );
    this.displayHarmonyColors("analogousColors", [
      analogous2,
      currentHex,
      analogous1,
    ]);

    // 분할보색 (Split Complementary)
    const splitComp1 = this.hslToHex(
      (baseHsl.h + 150) % 360,
      baseHsl.s,
      baseHsl.l
    );
    const splitComp2 = this.hslToHex(
      (baseHsl.h + 210) % 360,
      baseHsl.s,
      baseHsl.l
    );
    this.displayHarmonyColors("splitComplementaryColors", [
      currentHex,
      splitComp1,
      splitComp2,
    ]);

    document.getElementById("harmonyColors").style.display = "block";
    this.showNotification("조화색이 생성되었습니다!", "success");
  }

  displayHarmonyColors(containerId, colors) {
    const container = document.getElementById(containerId);
    let html = "";

    colors.forEach((color) => {
      html += `
        <div class="harmony-color" style="background-color: ${color}" title="${color}">
          <span class="harmony-hex">${color}</span>
        </div>
      `;
    });

    container.innerHTML = html;

    // 클릭 이벤트 추가
    container.querySelectorAll(".harmony-color").forEach((colorEl) => {
      colorEl.addEventListener("click", () => {
        const color = colorEl.style.backgroundColor;
        const hex = this.rgbToHex(this.parseRgb(color));
        this.simulateColorPick(hex);
      });
    });
  }

  addToHistory(hexColor) {
    const historyItem = {
      color: hexColor,
      timestamp: new Date(),
      rgb: this.hexToRgb(hexColor),
    };

    // 중복 제거
    this.colorHistory = this.colorHistory.filter(
      (item) => item.color !== hexColor
    );
    this.colorHistory.unshift(historyItem);

    // 최대 20개까지만 보관
    if (this.colorHistory.length > 20) {
      this.colorHistory = this.colorHistory.slice(0, 20);
    }

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const container = document.getElementById("historyContainer");

    if (this.colorHistory.length === 0) {
      container.innerHTML = `
        <div class="empty-history">
          <p>아직 추출한 색상이 없습니다.</p>
          <p>스포이드를 사용해서 색상을 추출해보세요!</p>
        </div>
      `;
      return;
    }

    let html = '<div class="history-grid">';
    this.colorHistory.forEach((item, index) => {
      const timeString = item.timestamp.toLocaleTimeString();
      html += `
        <div class="history-item">
          <div class="history-swatch" style="background-color: ${item.color}"></div>
          <div class="history-info">
            <div class="history-color">${item.color}</div>
            <div class="history-time">${timeString}</div>
            <button class="history-select-btn" data-color="${item.color}">선택</button>
          </div>
        </div>
      `;
    });
    html += "</div>";

    container.innerHTML = html;

    // 선택 버튼 이벤트 바인딩
    container.querySelectorAll(".history-select-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const color = e.target.dataset.color;
        this.simulateColorPick(color);
      });
    });
  }

  clearHistory() {
    this.colorHistory = [];
    this.updateHistoryDisplay();
    this.showNotification("히스토리가 지워졌습니다.", "info");
  }

  exportPalette() {
    if (this.colorPalette.length === 0) {
      this.showNotification("내보낼 팔레트가 없습니다.", "warning");
      return;
    }

    const paletteData = {
      name: `Color Palette ${new Date().toLocaleDateString()}`,
      colors: this.colorPalette.map((hex) => ({
        hex,
        rgb: this.hexToRgb(hex),
        hsl: this.rgbToHsl(...Object.values(this.hexToRgb(hex))),
      })),
      exportDate: new Date().toISOString(),
    };

    this.downloadJSON(paletteData, `color-palette-${this.getTimestamp()}.json`);
    this.showNotification("팔레트가 JSON 파일로 내보내졌습니다!", "success");
  }

  exportHistory() {
    if (this.colorHistory.length === 0) {
      this.showNotification("내보낼 히스토리가 없습니다.", "warning");
      return;
    }

    const historyData = {
      totalColors: this.colorHistory.length,
      colors: this.colorHistory,
      exportDate: new Date().toISOString(),
    };

    this.downloadJSON(historyData, `color-history-${this.getTimestamp()}.json`);
    this.showNotification("히스토리가 JSON 파일로 내보내졌습니다!", "success");
  }

  downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  updatePickerUI() {
    const indicator = document.getElementById("pickingIndicator");
    const statusText = document.querySelector(".status-text");

    if (this.isPickingColor) {
      indicator.style.display = "flex";
      statusText.textContent =
        "화면의 원하는 위치를 클릭하여 색상을 선택하세요";
    } else {
      indicator.style.display = "none";
      statusText.textContent =
        "스포이드 버튼을 클릭하여 화면의 색상을 추출해보세요";
    }
  }

  async copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.value;

    try {
      await navigator.clipboard.writeText(text);
      this.showNotification("클립보드에 복사되었습니다!", "success");
    } catch (error) {
      console.error("Copy failed:", error);
      this.showNotification("복사에 실패했습니다.", "error");
    }
  }

  // 색상 변환 유틸리티 함수들
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  rgbToHex(rgb) {
    const componentToHex = (c) => {
      const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(
      rgb.b
    )}`;
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100,
    };
  }

  hslToHex(h, s, l) {
    h = h % 360;
    s = s / 100;
    l = l / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return this.rgbToHex({ r, g, b });
  }

  rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6;
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return {
      h: h,
      s: s * 100,
      v: v * 100,
    };
  }

  parseRgb(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match
      ? {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
        }
      : { r: 0, g: 0, b: 0 };
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
  new EyeDropperDemo();
});
