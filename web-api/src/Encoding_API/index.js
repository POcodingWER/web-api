import "./style.css";

// Encoding API 테스트 및 데모
class EncodingDemo {
  constructor() {
    this.encoder = new TextEncoder();
    this.supportedEncodings = [
      "utf-8",
      "utf-16le",
      "utf-16be",
      "ascii",
      "iso-8859-1",
      "iso-8859-2",
      "iso-8859-3",
      "iso-8859-4",
      "iso-8859-5",
      "iso-8859-6",
      "iso-8859-7",
      "iso-8859-8",
      "iso-8859-9",
      "iso-8859-10",
      "iso-8859-13",
      "iso-8859-14",
      "iso-8859-15",
      "iso-8859-16",
      "windows-1250",
      "windows-1251",
      "windows-1252",
      "windows-1253",
      "windows-1254",
      "windows-1255",
      "windows-1256",
      "windows-1257",
      "windows-1258",
      "koi8-r",
      "koi8-u",
      "big5",
      "gb2312",
      "gbk",
      "gb18030",
      "euc-jp",
      "iso-2022-jp",
      "shift_jis",
      "euc-kr",
    ];
    this.conversionHistory = [];

    this.init();
  }

  init() {
    this.renderUI();
    this.bindEvents();
    this.checkBrowserSupport();
    this.populateEncodingSelects();
  }

  checkBrowserSupport() {
    const statusElement = document.getElementById("browserStatus");

    const textEncoderSupport = typeof TextEncoder !== "undefined";
    const textDecoderSupport = typeof TextDecoder !== "undefined";

    let statusHTML = "";

    if (textEncoderSupport && textDecoderSupport) {
      statusHTML = `<span class="status-success">✅ Encoding API 완전 지원됨</span>`;
    } else if (textEncoderSupport) {
      statusHTML = `<span class="status-warning">⚠️ TextEncoder만 지원됨 (TextDecoder 미지원)</span>`;
    } else if (textDecoderSupport) {
      statusHTML = `<span class="status-warning">⚠️ TextDecoder만 지원됨 (TextEncoder 미지원)</span>`;
    } else {
      statusHTML = `<span class="status-error">❌ Encoding API가 지원되지 않습니다</span>`;
      this.disableButtons();
    }

    statusElement.innerHTML = statusHTML;
    return textEncoderSupport || textDecoderSupport;
  }

  disableButtons() {
    document.querySelectorAll(".encoding-btn").forEach((btn) => {
      btn.disabled = true;
    });
  }

  renderUI() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div class="encoding-demo">
        <h1>🔤 Encoding API 테스트</h1>
        
        <div class="browser-status" id="browserStatus">
          <span class="status-checking">🔍 브라우저 지원 확인 중...</span>
        </div>

        <!-- 텍스트 인코딩/디코딩 섹션 -->
        <div class="encoding-section text-encoding-section">
          <h2>📝 텍스트 인코딩 & 디코딩</h2>
          
          <div class="text-input-area">
            <div class="input-group">
              <label for="inputText">입력 텍스트:</label>
              <textarea id="inputText" placeholder="여기에 인코딩할 텍스트를 입력하세요...">안녕하세요! Hello! こんにちは! 你好! مرحبا! Привет! 🌍✨</textarea>
            </div>
          </div>

          <div class="encoding-controls">
            <div class="control-row">
              <div class="control-group">
                <label for="targetEncoding">대상 인코딩:</label>
                <select id="targetEncoding">
                  <option value="utf-8" selected>UTF-8</option>
                </select>
              </div>
              <div class="control-group">
                <button id="encodeText" class="encoding-btn encode-btn">
                  🔒 텍스트 인코딩
                </button>
                <button id="decodeBytes" class="encoding-btn decode-btn">
                  🔓 바이트 디코딩
                </button>
              </div>
            </div>
          </div>

          <div class="results-area">
            <div class="result-group">
              <h4>📊 인코딩 결과</h4>
              <div class="result-container">
                <div class="result-header">
                  <span>바이트 배열 (Uint8Array)</span>
                  <button id="copyBytes" class="copy-btn">📋 복사</button>
                </div>
                <div id="encodedBytes" class="result-content bytes-display"></div>
              </div>
              
              <div class="result-container">
                <div class="result-header">
                  <span>16진수 표현</span>
                  <button id="copyHex" class="copy-btn">📋 복사</button>
                </div>
                <div id="hexRepresentation" class="result-content hex-display"></div>
              </div>
              
              <div class="result-container">
                <div class="result-header">
                  <span>Base64 인코딩</span>
                  <button id="copyBase64" class="copy-btn">📋 복사</button>
                </div>
                <div id="base64Representation" class="result-content base64-display"></div>
              </div>
            </div>

            <div class="result-group">
              <h4>🔍 디코딩 결과</h4>
              <div class="result-container">
                <div class="result-header">
                  <span>복원된 텍스트</span>
                  <button id="copyDecoded" class="copy-btn">📋 복사</button>
                </div>
                <div id="decodedText" class="result-content text-display"></div>
              </div>
            </div>
          </div>

          <div class="encoding-info" id="encodingInfo" style="display: none;">
            <h4>📈 인코딩 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">원본 길이:</span>
                <span id="originalLength" class="info-value">-</span>
              </div>
              <div class="info-item">
                <span class="info-label">바이트 수:</span>
                <span id="byteLength" class="info-value">-</span>
              </div>
              <div class="info-item">
                <span class="info-label">압축률:</span>
                <span id="compressionRatio" class="info-value">-</span>
              </div>
              <div class="info-item">
                <span class="info-label">인코딩:</span>
                <span id="usedEncoding" class="info-value">-</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 바이너리 데이터 처리 섹션 -->
        <div class="encoding-section binary-section">
          <h2>🔢 바이너리 데이터 처리</h2>
          
          <div class="binary-input-area">
            <div class="input-tabs">
              <button id="hexTab" class="tab-btn active" data-type="hex">16진수</button>
              <button id="base64Tab" class="tab-btn" data-type="base64">Base64</button>
              <button id="binaryTab" class="tab-btn" data-type="binary">이진수</button>
              <button id="decimalTab" class="tab-btn" data-type="decimal">10진수</button>
            </div>
            
            <div class="tab-content">
              <div id="hexInput" class="tab-pane active">
                <label for="hexData">16진수 데이터:</label>
                <textarea id="hexData" placeholder="예: 48656c6c6f20576f726c64">48656c6c6f20576f726c64</textarea>
              </div>
              <div id="base64Input" class="tab-pane">
                <label for="base64Data">Base64 데이터:</label>
                <textarea id="base64Data" placeholder="예: SGVsbG8gV29ybGQ=">SGVsbG8gV29ybGQ=</textarea>
              </div>
              <div id="binaryInput" class="tab-pane">
                <label for="binaryData">이진수 데이터:</label>
                <textarea id="binaryData" placeholder="예: 01001000011001010110110001101100011011110010000001010111011011110111001001101100011001000010000000100001">01001000011001010110110001101100011011110010000001010111011011110111001001101100011001000010000000100001</textarea>
              </div>
              <div id="decimalInput" class="tab-pane">
                <label for="decimalData">10진수 배열:</label>
                <textarea id="decimalData" placeholder="예: 72,101,108,108,111,32,87,111,114,108,100,32,33">72,101,108,108,111,32,87,111,114,108,100,32,33</textarea>
              </div>
            </div>
          </div>

          <div class="binary-controls">
            <div class="control-group">
              <label for="sourceEncoding">소스 인코딩:</label>
              <select id="sourceEncoding">
                <option value="utf-8" selected>UTF-8</option>
              </select>
            </div>
            <div class="control-group">
              <button id="processBinary" class="encoding-btn process-btn">
                🔄 바이너리 처리
              </button>
              <button id="clearBinary" class="encoding-btn clear-btn">
                🗑️ 지우기
              </button>
            </div>
          </div>

          <div class="binary-results" id="binaryResults" style="display: none;">
            <h4>🔄 변환 결과</h4>
            <div class="conversion-grid">
              <div class="conversion-item">
                <span class="conversion-label">텍스트:</span>
                <div class="conversion-value" id="binaryToText">-</div>
              </div>
              <div class="conversion-item">
                <span class="conversion-label">16진수:</span>
                <div class="conversion-value" id="binaryToHex">-</div>
              </div>
              <div class="conversion-item">
                <span class="conversion-label">Base64:</span>
                <div class="conversion-value" id="binaryToBase64">-</div>
              </div>
              <div class="conversion-item">
                <span class="conversion-label">이진수:</span>
                <div class="conversion-value" id="binaryToBinary">-</div>
              </div>
              <div class="conversion-item">
                <span class="conversion-label">10진수:</span>
                <div class="conversion-value" id="binaryToDecimal">-</div>
              </div>
              <div class="conversion-item">
                <span class="conversion-label">바이트 수:</span>
                <div class="conversion-value" id="binaryByteCount">-</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 다국어 텍스트 테스트 섹션 -->
        <div class="encoding-section multilingual-section">
          <h2>🌍 다국어 텍스트 테스트</h2>
          
          <div class="language-samples">
            <h4>📚 언어별 샘플 텍스트</h4>
            <div class="sample-grid">
              <button class="sample-btn" data-text="Hello, World! 🌍" data-lang="English">
                🇺🇸 영어
              </button>
              <button class="sample-btn" data-text="안녕하세요, 세계! 🌏" data-lang="Korean">
                🇰🇷 한국어
              </button>
              <button class="sample-btn" data-text="こんにちは、世界！🌎" data-lang="Japanese">
                🇯🇵 일본어
              </button>
              <button class="sample-btn" data-text="你好，世界！🌍" data-lang="Chinese">
                🇨🇳 중국어
              </button>
              <button class="sample-btn" data-text="مرحبا بالعالم! 🌍" data-lang="Arabic">
                🇸🇦 아랍어
              </button>
              <button class="sample-btn" data-text="Привет, мир! 🌍" data-lang="Russian">
                🇷🇺 러시아어
              </button>
              <button class="sample-btn" data-text="🎵🎶🎼🎹🎸🎺🎻🎭🎨🎪" data-lang="Emoji">
                😊 이모지
              </button>
              <button class="sample-btn" data-text="∑∏∆√∞∂∫≈≠≤≥±∓∝∴∵" data-lang="Mathematical">
                📐 수학 기호
              </button>
            </div>
          </div>

          <div class="encoding-comparison">
            <h4>🔍 인코딩 비교</h4>
            <div class="comparison-controls">
              <button id="compareEncodings" class="encoding-btn compare-btn">
                📊 인코딩 비교하기
              </button>
            </div>
            <div id="comparisonResults" class="comparison-results"></div>
          </div>
        </div>

        <!-- 변환 히스토리 섹션 -->
        <div class="encoding-section history-section">
          <h2>📜 변환 히스토리</h2>
          
          <div class="history-controls">
            <button id="clearHistory" class="encoding-btn clear-btn">
              🗑️ 히스토리 지우기
            </button>
            <button id="exportHistory" class="encoding-btn export-btn">
              📤 히스토리 내보내기
            </button>
          </div>
          
          <div class="history-list" id="historyList">
            <div class="empty-history">
              <p>아직 변환 히스토리가 없습니다.</p>
              <p>텍스트를 인코딩하거나 바이너리 데이터를 처리해보세요!</p>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>ℹ️ Encoding API 정보</h3>
          <div class="info-grid-large">
            <div class="info-card">
              <h4>🔤 TextEncoder</h4>
              <ul>
                <li>UTF-8 인코딩 전용</li>
                <li>문자열을 Uint8Array로 변환</li>
                <li>유니코드 완전 지원</li>
                <li>스트리밍 인코딩 지원</li>
                <li>높은 성능</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🔓 TextDecoder</h4>
              <ul>
                <li>다양한 인코딩 지원</li>
                <li>Uint8Array를 문자열로 변환</li>
                <li>오류 처리 옵션</li>
                <li>스트리밍 디코딩 지원</li>
                <li>BOM 처리</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>🌐 지원 인코딩</h4>
              <ul>
                <li><strong>UTF-8:</strong> 유니코드 표준</li>
                <li><strong>UTF-16:</strong> Little/Big Endian</li>
                <li><strong>ISO-8859:</strong> 라틴 문자셋</li>
                <li><strong>Windows:</strong> Windows 코드페이지</li>
                <li><strong>Asian:</strong> CJK 인코딩</li>
              </ul>
            </div>
            <div class="info-card">
              <h4>💡 활용 예시</h4>
              <ul>
                <li>파일 I/O 처리</li>
                <li>네트워크 통신</li>
                <li>암호화/해시</li>
                <li>바이너리 데이터 분석</li>
                <li>문자셋 변환</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  populateEncodingSelects() {
    const selects = ["targetEncoding", "sourceEncoding"];

    selects.forEach((selectId) => {
      const select = document.getElementById(selectId);

      this.supportedEncodings.forEach((encoding) => {
        const option = document.createElement("option");
        option.value = encoding;
        option.textContent = encoding.toUpperCase();
        select.appendChild(option);
      });
    });
  }

  bindEvents() {
    // 텍스트 인코딩/디코딩
    document
      .getElementById("encodeText")
      .addEventListener("click", () => this.encodeText());
    document
      .getElementById("decodeBytes")
      .addEventListener("click", () => this.decodeBytes());

    // 바이너리 처리
    document
      .getElementById("processBinary")
      .addEventListener("click", () => this.processBinary());
    document
      .getElementById("clearBinary")
      .addEventListener("click", () => this.clearBinary());

    // 탭 전환
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTab(e.target.dataset.type)
      );
    });

    // 언어 샘플
    document.querySelectorAll(".sample-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.getElementById("inputText").value = e.target.dataset.text;
      });
    });

    // 인코딩 비교
    document
      .getElementById("compareEncodings")
      .addEventListener("click", () => this.compareEncodings());

    // 히스토리
    document
      .getElementById("clearHistory")
      .addEventListener("click", () => this.clearHistory());
    document
      .getElementById("exportHistory")
      .addEventListener("click", () => this.exportHistory());

    // 복사 버튼들
    document
      .getElementById("copyBytes")
      .addEventListener("click", () => this.copyToClipboard("encodedBytes"));
    document
      .getElementById("copyHex")
      .addEventListener("click", () =>
        this.copyToClipboard("hexRepresentation")
      );
    document
      .getElementById("copyBase64")
      .addEventListener("click", () =>
        this.copyToClipboard("base64Representation")
      );
    document
      .getElementById("copyDecoded")
      .addEventListener("click", () => this.copyToClipboard("decodedText"));
  }

  encodeText() {
    const inputText = document.getElementById("inputText").value;
    const encoding = document.getElementById("targetEncoding").value;

    if (!inputText.trim()) {
      this.showNotification("입력 텍스트를 입력해주세요.", "warning");
      return;
    }

    try {
      // TextEncoder는 UTF-8만 지원하므로 UTF-8로 인코딩
      const encoded = this.encoder.encode(inputText);

      // 다른 인코딩이 선택된 경우 시뮬레이션 (실제로는 UTF-8)
      let finalEncoded = encoded;
      if (encoding !== "utf-8") {
        // 실제 브라우저에서는 다른 인코딩을 직접 지원하지 않으므로
        // UTF-8로 인코딩된 결과를 표시하되 정보는 선택된 인코딩으로 표시
        this.showNotification(
          `참고: 브라우저는 UTF-8 인코딩만 직접 지원합니다. (${encoding.toUpperCase()} 시뮬레이션)`,
          "info"
        );
      }

      // 결과 표시
      this.displayEncodingResults(inputText, finalEncoded, encoding);

      // 히스토리 추가
      this.addToHistory({
        type: "encode",
        input: inputText,
        encoding: encoding,
        output: Array.from(finalEncoded),
        timestamp: new Date(),
      });

      this.showNotification("텍스트가 성공적으로 인코딩되었습니다!", "success");
    } catch (error) {
      console.error("Encoding error:", error);
      this.showNotification(
        `인코딩 중 오류가 발생했습니다: ${error.message}`,
        "error"
      );
    }
  }

  decodeBytes() {
    const encodedBytesElement = document.getElementById("encodedBytes");
    const encoding = document.getElementById("targetEncoding").value;

    if (!encodedBytesElement.textContent.trim()) {
      this.showNotification("먼저 텍스트를 인코딩해주세요.", "warning");
      return;
    }

    try {
      // 인코딩된 바이트 배열 가져오기
      const bytesText = encodedBytesElement.textContent.replace(/[\[\]]/g, "");
      const bytes = new Uint8Array(
        bytesText.split(",").map((b) => parseInt(b.trim()))
      );

      // TextDecoder로 디코딩
      let decoder;
      try {
        decoder = new TextDecoder(encoding, { fatal: true });
      } catch (e) {
        // 지원하지 않는 인코딩인 경우 UTF-8로 fallback
        decoder = new TextDecoder("utf-8", { fatal: true });
        this.showNotification(
          `${encoding.toUpperCase()}는 직접 지원되지 않아 UTF-8로 디코딩합니다.`,
          "info"
        );
      }

      const decoded = decoder.decode(bytes);

      // 결과 표시
      document.getElementById("decodedText").textContent = decoded;

      // 히스토리 추가
      this.addToHistory({
        type: "decode",
        input: Array.from(bytes),
        encoding: encoding,
        output: decoded,
        timestamp: new Date(),
      });

      this.showNotification("바이트가 성공적으로 디코딩되었습니다!", "success");
    } catch (error) {
      console.error("Decoding error:", error);
      this.showNotification(
        `디코딩 중 오류가 발생했습니다: ${error.message}`,
        "error"
      );
    }
  }

  displayEncodingResults(originalText, encodedBytes, encoding) {
    // 바이트 배열 표시
    const bytesArray = Array.from(encodedBytes);
    document.getElementById("encodedBytes").textContent = `[${bytesArray.join(
      ", "
    )}]`;

    // 16진수 표시
    const hexString = bytesArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    document.getElementById("hexRepresentation").textContent =
      hexString.toUpperCase();

    // Base64 표시
    const base64String = btoa(String.fromCharCode(...bytesArray));
    document.getElementById("base64Representation").textContent = base64String;

    // 인코딩 정보 표시
    document.getElementById(
      "originalLength"
    ).textContent = `${originalText.length} 문자`;
    document.getElementById(
      "byteLength"
    ).textContent = `${encodedBytes.length} 바이트`;
    document.getElementById("compressionRatio").textContent = `${(
      (encodedBytes.length / originalText.length) *
      100
    ).toFixed(1)}%`;
    document.getElementById("usedEncoding").textContent =
      encoding.toUpperCase();

    document.getElementById("encodingInfo").style.display = "block";
  }

  switchTab(type) {
    // 탭 버튼 활성화
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(`${type}Tab`).classList.add("active");

    // 탭 패널 표시
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active");
    });
    document.getElementById(`${type}Input`).classList.add("active");
  }

  processBinary() {
    const activeTab = document.querySelector(".tab-btn.active").dataset.type;
    const encoding = document.getElementById("sourceEncoding").value;

    let inputData = "";
    let bytes = null;

    try {
      // 입력 데이터 가져오기
      switch (activeTab) {
        case "hex":
          inputData = document
            .getElementById("hexData")
            .value.replace(/\s/g, "");
          bytes = this.hexToBytes(inputData);
          break;
        case "base64":
          inputData = document.getElementById("base64Data").value;
          bytes = this.base64ToBytes(inputData);
          break;
        case "binary":
          inputData = document
            .getElementById("binaryData")
            .value.replace(/\s/g, "");
          bytes = this.binaryToBytes(inputData);
          break;
        case "decimal":
          inputData = document.getElementById("decimalData").value;
          bytes = this.decimalToBytes(inputData);
          break;
      }

      if (!bytes || bytes.length === 0) {
        this.showNotification("유효한 데이터를 입력해주세요.", "warning");
        return;
      }

      // 모든 형식으로 변환
      this.displayBinaryResults(bytes, encoding);

      // 히스토리 추가
      this.addToHistory({
        type: "binary",
        inputType: activeTab,
        input: inputData,
        encoding: encoding,
        output: Array.from(bytes),
        timestamp: new Date(),
      });

      this.showNotification(
        "바이너리 데이터가 성공적으로 처리되었습니다!",
        "success"
      );
    } catch (error) {
      console.error("Binary processing error:", error);
      this.showNotification(
        `바이너리 처리 중 오류가 발생했습니다: ${error.message}`,
        "error"
      );
    }
  }

  displayBinaryResults(bytes, encoding) {
    try {
      // 텍스트 디코딩
      let decoder;
      try {
        decoder = new TextDecoder(encoding, { fatal: false });
      } catch (e) {
        decoder = new TextDecoder("utf-8", { fatal: false });
      }
      const text = decoder.decode(bytes);

      // 각 형식으로 변환
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")
        .toUpperCase();
      const base64 = btoa(String.fromCharCode(...bytes));
      const binary = Array.from(bytes)
        .map((b) => b.toString(2).padStart(8, "0"))
        .join(" ");
      const decimal = Array.from(bytes).join(", ");

      // 결과 표시
      document.getElementById("binaryToText").textContent = text;
      document.getElementById("binaryToHex").textContent = hex;
      document.getElementById("binaryToBase64").textContent = base64;
      document.getElementById("binaryToBinary").textContent = binary;
      document.getElementById("binaryToDecimal").textContent = decimal;
      document.getElementById(
        "binaryByteCount"
      ).textContent = `${bytes.length} 바이트`;

      document.getElementById("binaryResults").style.display = "block";
    } catch (error) {
      console.error("Display results error:", error);
      this.showNotification("결과 표시 중 오류가 발생했습니다.", "error");
    }
  }

  hexToBytes(hex) {
    if (hex.length % 2 !== 0)
      throw new Error("16진수 길이가 올바르지 않습니다.");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  binaryToBytes(binary) {
    if (binary.length % 8 !== 0)
      throw new Error("이진수 길이가 올바르지 않습니다.");
    const bytes = new Uint8Array(binary.length / 8);
    for (let i = 0; i < binary.length; i += 8) {
      bytes[i / 8] = parseInt(binary.substr(i, 8), 2);
    }
    return bytes;
  }

  decimalToBytes(decimal) {
    const numbers = decimal.split(",").map((n) => parseInt(n.trim()));
    if (numbers.some((n) => isNaN(n) || n < 0 || n > 255)) {
      throw new Error("유효하지 않은 10진수 값입니다.");
    }
    return new Uint8Array(numbers);
  }

  compareEncodings() {
    const inputText = document.getElementById("inputText").value;

    if (!inputText.trim()) {
      this.showNotification("비교할 텍스트를 입력해주세요.", "warning");
      return;
    }

    const testEncodings = ["utf-8", "utf-16le", "utf-16be", "iso-8859-1"];
    const results = [];

    // UTF-8 인코딩 (실제)
    const utf8Bytes = this.encoder.encode(inputText);
    results.push({
      encoding: "UTF-8",
      bytes: utf8Bytes,
      length: utf8Bytes.length,
      hex: Array.from(utf8Bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")
        .toUpperCase(),
    });

    // 다른 인코딩들은 시뮬레이션
    testEncodings.slice(1).forEach((encoding) => {
      try {
        // 실제로는 TextDecoder로 디코딩 후 다시 UTF-8로 인코딩
        // 이는 시뮬레이션이며 실제 인코딩과는 다를 수 있음
        let simulatedBytes = utf8Bytes; // 기본값

        if (encoding === "utf-16le" || encoding === "utf-16be") {
          // UTF-16 시뮬레이션 (간단한 예시)
          simulatedBytes = new Uint8Array(inputText.length * 2);
          for (let i = 0; i < inputText.length; i++) {
            const code = inputText.charCodeAt(i);
            if (encoding === "utf-16le") {
              simulatedBytes[i * 2] = code & 0xff;
              simulatedBytes[i * 2 + 1] = (code >> 8) & 0xff;
            } else {
              simulatedBytes[i * 2] = (code >> 8) & 0xff;
              simulatedBytes[i * 2 + 1] = code & 0xff;
            }
          }
        }

        results.push({
          encoding: encoding.toUpperCase(),
          bytes: simulatedBytes,
          length: simulatedBytes.length,
          hex: Array.from(simulatedBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ")
            .toUpperCase(),
        });
      } catch (error) {
        console.warn(`Encoding ${encoding} simulation failed:`, error);
      }
    });

    // 결과 표시
    this.displayComparisonResults(results);
  }

  displayComparisonResults(results) {
    const container = document.getElementById("comparisonResults");

    let html = `
      <div class="comparison-table">
        <div class="comparison-header">
          <div class="comparison-cell">인코딩</div>
          <div class="comparison-cell">바이트 수</div>
          <div class="comparison-cell">16진수 표현</div>
        </div>
    `;

    results.forEach((result) => {
      const shortHex =
        result.hex.length > 50
          ? result.hex.substring(0, 50) + "..."
          : result.hex;
      html += `
        <div class="comparison-row">
          <div class="comparison-cell encoding-name">${result.encoding}</div>
          <div class="comparison-cell byte-count">${result.length}</div>
          <div class="comparison-cell hex-data" title="${result.hex}">${shortHex}</div>
        </div>
      `;
    });

    html += "</div>";
    container.innerHTML = html;
  }

  clearBinary() {
    document.querySelectorAll(".tab-pane textarea").forEach((textarea) => {
      textarea.value = "";
    });
    document.getElementById("binaryResults").style.display = "none";
    this.showNotification("바이너리 데이터가 지워졌습니다.", "info");
  }

  addToHistory(entry) {
    this.conversionHistory.unshift(entry);

    // 최대 50개까지만 보관
    if (this.conversionHistory.length > 50) {
      this.conversionHistory = this.conversionHistory.slice(0, 50);
    }

    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const historyList = document.getElementById("historyList");

    if (this.conversionHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <p>아직 변환 히스토리가 없습니다.</p>
          <p>텍스트를 인코딩하거나 바이너리 데이터를 처리해보세요!</p>
        </div>
      `;
      return;
    }

    let html = "";
    this.conversionHistory.forEach((entry, index) => {
      const timestamp = entry.timestamp.toLocaleString();
      const typeIcon = {
        encode: "🔒",
        decode: "🔓",
        binary: "🔢",
      }[entry.type];

      let summary = "";
      if (entry.type === "encode") {
        summary = `"${entry.input.substring(0, 30)}${
          entry.input.length > 30 ? "..." : ""
        }" → ${entry.encoding.toUpperCase()}`;
      } else if (entry.type === "decode") {
        summary = `${entry.encoding.toUpperCase()} → "${entry.output.substring(
          0,
          30
        )}${entry.output.length > 30 ? "..." : ""}"`;
      } else if (entry.type === "binary") {
        summary = `${entry.inputType.toUpperCase()} → ${entry.encoding.toUpperCase()}`;
      }

      html += `
        <div class="history-item">
          <div class="history-header">
            <span class="history-type">${typeIcon} ${entry.type.toUpperCase()}</span>
            <span class="history-time">${timestamp}</span>
          </div>
          <div class="history-summary">${summary}</div>
        </div>
      `;
    });

    historyList.innerHTML = html;
  }

  clearHistory() {
    this.conversionHistory = [];
    this.updateHistoryDisplay();
    this.showNotification("히스토리가 지워졌습니다.", "info");
  }

  exportHistory() {
    if (this.conversionHistory.length === 0) {
      this.showNotification("내보낼 히스토리가 없습니다.", "warning");
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalEntries: this.conversionHistory.length,
      entries: this.conversionHistory,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `encoding-history-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    this.showNotification("히스토리가 JSON 파일로 내보내졌습니다.", "success");
  }

  async copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    try {
      await navigator.clipboard.writeText(text);
      this.showNotification("클립보드에 복사되었습니다!", "success");
    } catch (error) {
      console.error("Copy failed:", error);
      this.showNotification("복사에 실패했습니다.", "error");
    }
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
  new EncodingDemo();
});
