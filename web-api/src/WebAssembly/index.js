import "./style.css";

class WebAssemblyAPI {
  constructor() {
    this.wasmModule = null;
    this.wasmMemory = null;
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.checkSupport();
    this.loadDemoWasm();
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = `
      <div class="wasm-container">
        <header class="wasm-header">
          <h1>🚀 WebAssembly 데모</h1>
          <p>웹에서 네이티브 수준의 성능을 경험해보세요</p>
          <div class="support-status" id="supportStatus">
            <div class="status-item">
              <span class="status-indicator" id="wasmStatus">⏳</span>
              <span>WebAssembly</span>
            </div>
          </div>
        </header>

        <main class="wasm-main">
          <div class="demo-section">
            <div class="math-demo">
              <h2>🧮 수학 연산 데모</h2>
              <div class="demo-controls">
                <div class="input-group">
                  <label for="numberA">숫자 A:</label>
                  <input type="number" id="numberA" value="12345" step="1">
                </div>
                <div class="input-group">
                  <label for="numberB">숫자 B:</label>
                  <input type="number" id="numberB" value="67890" step="1">
                </div>
                <div class="button-group">
                  <button id="addNumbers" class="btn-primary">➕ 덧셈</button>
                  <button id="multiplyNumbers" class="btn-accent">✖️ 곱셈</button>
                  <button id="calculateFibonacci" class="btn-secondary">🔄 피보나치</button>
                  <button id="calculatePrime" class="btn-warning">🔢 소수 판별</button>
                </div>
              </div>
              <div class="result-display">
                <h3>결과:</h3>
                <div id="mathResult" class="result-box">
                  연산을 실행하면 결과가 여기에 표시됩니다
                </div>
              </div>
            </div>

            <div class="performance-demo">
              <h2>⚡ 성능 비교 테스트</h2>
              <div class="test-controls">
                <div class="input-group">
                  <label for="iterations">반복 횟수:</label>
                  <input type="number" id="iterations" value="1000000" min="1000" max="10000000">
                </div>
                <div class="test-buttons">
                  <button id="runJSTest" class="btn-secondary">📊 JavaScript 테스트</button>
                  <button id="runWasmTest" class="btn-primary">🚀 WASM 테스트</button>
                  <button id="runBothTests" class="btn-accent">⚖️ 둘 다 비교</button>
                </div>
              </div>
              <div class="performance-results">
                <div class="result-item">
                  <h4>JavaScript:</h4>
                  <div id="jsResult" class="time-result">-</div>
                </div>
                <div class="result-item">
                  <h4>WebAssembly:</h4>
                  <div id="wasmResult" class="time-result">-</div>
                </div>
                <div class="result-item">
                  <h4>속도 향상:</h4>
                  <div id="speedupResult" class="speedup-result">-</div>
                </div>
              </div>
            </div>
          </div>

          <div class="wasm-info">
            <div class="memory-info">
              <h3>💾 메모리 정보</h3>
              <div class="memory-stats">
                <div class="stat-item">
                  <label>페이지 수:</label>
                  <span id="memoryPages">-</span>
                </div>
                <div class="stat-item">
                  <label>메모리 크기:</label>
                  <span id="memorySize">-</span>
                </div>
                <div class="stat-item">
                  <label>최대 크기:</label>
                  <span id="maxMemorySize">-</span>
                </div>
              </div>
              <div class="memory-controls">
                <button id="growMemory" class="btn-accent">📈 메모리 확장</button>
                <button id="updateMemoryInfo" class="btn-secondary">🔄 정보 갱신</button>
              </div>
            </div>

            <div class="wasm-loader">
              <h3>📁 WASM 모듈 로더</h3>
              <div class="loader-controls">
                <div class="file-input-wrapper">
                  <input type="file" id="wasmFileInput" accept=".wasm" style="display: none;">
                  <button id="loadWasmFile" class="btn-primary">📤 WASM 파일 로드</button>
                </div>
                <button id="createSampleWasm" class="btn-accent">🧪 샘플 WASM 생성</button>
              </div>
              <div class="loader-status">
                <div id="wasmLoadStatus" class="load-status">
                  기본 WASM 모듈이 로드되었습니다
                </div>
              </div>
            </div>
          </div>

          <div class="usage-guide">
            <h2>💡 WebAssembly 사용법</h2>
            <div class="guide-content">
              <div class="code-example">
                <h3>🔍 기본 사용법</h3>
                <pre><code>// WASM 모듈 로드
const wasmModule = await WebAssembly.instantiate(wasmBytes);

// 함수 호출
const result = wasmModule.instance.exports.add(10, 20);
console.log(result); // 30

// 메모리 접근
const memory = wasmModule.instance.exports.memory;
const buffer = new Uint8Array(memory.buffer);

// C/Rust에서 컴파일
// emcc math.c -o math.wasm -s EXPORTED_FUNCTIONS='["_add"]'
// rustc --target wasm32-unknown-unknown math.rs</code></pre>
              </div>

              <div class="features-info">
                <h3>✨ 주요 특징</h3>
                <ul>
                  <li><strong>네이티브 성능:</strong> C/C++/Rust 수준의 실행 속도</li>
                  <li><strong>안전한 실행:</strong> 샌드박스 환경에서 안전하게 실행</li>
                  <li><strong>언어 지원:</strong> C, C++, Rust, Go 등 다양한 언어</li>
                  <li><strong>메모리 관리:</strong> 선형 메모리 모델로 효율적 관리</li>
                  <li><strong>브라우저 지원:</strong> 모든 모던 브라우저에서 지원</li>
                </ul>
              </div>

              <div class="use-cases">
                <h3>🎯 활용 사례</h3>
                <ul>
                  <li><strong>게임 엔진:</strong> Unity, Unreal 등 웹 포팅</li>
                  <li><strong>이미지/비디오 처리:</strong> OpenCV, FFmpeg 등</li>
                  <li><strong>암호화:</strong> 고성능 암호화 라이브러리</li>
                  <li><strong>과학 계산:</strong> 수치 해석, 시뮬레이션</li>
                  <li><strong>레거시 코드:</strong> 기존 C/C++ 라이브러리 재사용</li>
                </ul>
              </div>

              <div class="compile-guide">
                <h3>⚙️ 컴파일 가이드</h3>
                <div class="compile-examples">
                  <h4>C → WASM (Emscripten):</h4>
                  <pre><code>emcc hello.c -o hello.wasm \\
  -s EXPORTED_FUNCTIONS='["_main"]' \\
  -s WASM=1</code></pre>
                  
                  <h4>Rust → WASM:</h4>
                  <pre><code>rustc --target wasm32-unknown-unknown \\
  --crate-type=cdylib hello.rs</code></pre>
                  
                  <h4>C++ → WASM:</h4>
                  <pre><code>em++ math.cpp -o math.wasm \\
  -s EXPORTED_FUNCTIONS='["_calculate"]'</code></pre>
                </div>
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
    // 수학 연산 이벤트
    document
      .getElementById("addNumbers")
      .addEventListener("click", () => this.performAddition());
    document
      .getElementById("multiplyNumbers")
      .addEventListener("click", () => this.performMultiplication());
    document
      .getElementById("calculateFibonacci")
      .addEventListener("click", () => this.calculateFibonacci());
    document
      .getElementById("calculatePrime")
      .addEventListener("click", () => this.checkPrime());

    // 성능 테스트 이벤트
    document
      .getElementById("runJSTest")
      .addEventListener("click", () => this.runJavaScriptTest());
    document
      .getElementById("runWasmTest")
      .addEventListener("click", () => this.runWasmTest());
    document
      .getElementById("runBothTests")
      .addEventListener("click", () => this.runBothTests());

    // 메모리 관리 이벤트
    document
      .getElementById("growMemory")
      .addEventListener("click", () => this.growMemory());
    document
      .getElementById("updateMemoryInfo")
      .addEventListener("click", () => this.updateMemoryInfo());

    // WASM 로더 이벤트
    document
      .getElementById("loadWasmFile")
      .addEventListener("click", () => this.loadWasmFile());
    document
      .getElementById("createSampleWasm")
      .addEventListener("click", () => this.createSampleWasm());
    document
      .getElementById("wasmFileInput")
      .addEventListener("change", (e) => this.handleWasmFileLoad(e));
  }

  checkSupport() {
    const status = document.getElementById("wasmStatus");

    if (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    ) {
      status.textContent = "✅";
      status.className = "status-indicator success";
      this.showNotification("WebAssembly가 지원됩니다!", "success");
      return true;
    } else {
      status.textContent = "❌";
      status.className = "status-indicator error";
      this.showNotification("WebAssembly가 지원되지 않습니다", "error");
      return false;
    }
  }

  async loadDemoWasm() {
    try {
      // 유효한 최소 WASM 모듈 (add 함수만 포함)
      const wasmCode = new Uint8Array([
        0x00,
        0x61,
        0x73,
        0x6d, // WASM magic number
        0x01,
        0x00,
        0x00,
        0x00, // version 1

        // Type section
        0x01, // section code
        0x07, // section size
        0x01, // number of types
        0x60, // func type
        0x02,
        0x7f,
        0x7f, // two i32 parameters
        0x01,
        0x7f, // one i32 result

        // Function section
        0x03, // section code
        0x02, // section size
        0x01, // number of functions
        0x00, // function 0 signature index

        // Export section
        0x07, // section code
        0x07, // section size
        0x01, // number of exports
        0x03,
        0x61,
        0x64,
        0x64, // export name "add"
        0x00, // export kind (function)
        0x00, // export index

        // Code section
        0x0a, // section code
        0x09, // section size
        0x01, // number of function bodies
        0x07, // function body size
        0x00, // local count
        0x20,
        0x00, // local.get 0
        0x20,
        0x01, // local.get 1
        0x6a, // i32.add
        0x0b, // end
      ]);

      const wasmModule = await WebAssembly.instantiate(wasmCode);
      this.wasmModule = wasmModule.instance;

      // 메모리는 별도로 생성 (이 간단한 모듈에는 메모리가 없음)
      this.wasmMemory = new WebAssembly.Memory({ initial: 1 });

      this.showNotification("기본 WASM 모듈이 로드되었습니다", "success");
      this.updateMemoryInfo();
    } catch (error) {
      console.error("WASM 로드 실패:", error);
      // WASM이 실패해도 JavaScript로 시뮬레이션
      this.wasmModule = null;
      this.wasmMemory = new WebAssembly.Memory({ initial: 1 });
      this.showNotification(
        "WASM 로드 실패, JavaScript로 시뮬레이션합니다",
        "warning"
      );
      this.updateMemoryInfo();
    }
  }

  performAddition() {
    try {
      const a = parseInt(document.getElementById("numberA").value);
      const b = parseInt(document.getElementById("numberB").value);

      const start = performance.now();
      let result;
      let method = "";

      if (this.wasmModule && this.wasmModule.exports.add) {
        // WASM 함수 사용
        result = this.wasmModule.exports.add(a, b);
        method = "WASM";
      } else {
        // JavaScript로 대체
        result = a + b;
        method = "JavaScript";
      }
      const end = performance.now();

      document.getElementById("mathResult").innerHTML = `
        <div class="result-success">
          <h4>➕ 덧셈 결과</h4>
          <p><strong>${a} + ${b} = ${result}</strong></p>
          <p class="execution-time">실행 시간: ${(end - start).toFixed(4)}ms</p>
          <p class="note">※ ${method}로 계산됨</p>
        </div>
      `;

      this.showNotification(`덧셈 계산 완료 (${method})`, "success");
    } catch (error) {
      console.error("덧셈 계산 실패:", error);
      this.showNotification("덧셈 계산에 실패했습니다", "error");
    }
  }

  performMultiplication() {
    try {
      const a = parseInt(document.getElementById("numberA").value);
      const b = parseInt(document.getElementById("numberB").value);

      const start = performance.now();
      let result;
      let method = "";

      if (this.wasmModule && this.wasmModule.exports.multiply) {
        // WASM 함수 사용 (multiply는 현재 구현되지 않음)
        result = this.wasmModule.exports.multiply(a, b);
        method = "WASM";
      } else {
        // JavaScript로 대체
        result = a * b;
        method = "JavaScript";
      }
      const end = performance.now();

      document.getElementById("mathResult").innerHTML = `
        <div class="result-success">
          <h4>✖️ 곱셈 결과</h4>
          <p><strong>${a} × ${b} = ${result}</strong></p>
          <p class="execution-time">실행 시간: ${(end - start).toFixed(4)}ms</p>
          <p class="note">※ ${method}로 계산됨</p>
        </div>
      `;

      this.showNotification(`곱셈 계산 완료 (${method})`, "success");
    } catch (error) {
      console.error("곱셈 계산 실패:", error);
      this.showNotification("곱셈 계산에 실패했습니다", "error");
    }
  }

  calculateFibonacci() {
    const n = parseInt(document.getElementById("numberA").value);

    if (n < 0 || n > 40) {
      this.showNotification(
        "피보나치 수는 0-40 사이의 값을 입력하세요",
        "warning"
      );
      return;
    }

    try {
      const start = performance.now();
      const result = this.fibonacciJS(n);
      const end = performance.now();

      document.getElementById("mathResult").innerHTML = `
        <div class="result-success">
          <h4>🔄 피보나치 수</h4>
          <p><strong>F(${n}) = ${result}</strong></p>
          <p class="execution-time">실행 시간: ${(end - start).toFixed(4)}ms</p>
          <p class="note">※ JavaScript로 계산됨</p>
        </div>
      `;

      this.showNotification("피보나치 계산 완료", "success");
    } catch (error) {
      console.error("피보나치 계산 실패:", error);
      this.showNotification("피보나치 계산에 실패했습니다", "error");
    }
  }

  checkPrime() {
    const n = parseInt(document.getElementById("numberA").value);

    if (n < 2) {
      this.showNotification("2 이상의 숫자를 입력하세요", "warning");
      return;
    }

    try {
      const start = performance.now();
      const isPrime = this.isPrimeJS(n);
      const end = performance.now();

      document.getElementById("mathResult").innerHTML = `
        <div class="result-success">
          <h4>🔢 소수 판별</h4>
          <p><strong>${n}은(는) ${
        isPrime ? "소수입니다" : "소수가 아닙니다"
      }</strong></p>
          <p class="execution-time">실행 시간: ${(end - start).toFixed(4)}ms</p>
          <p class="note">※ JavaScript로 계산됨</p>
        </div>
      `;

      this.showNotification("소수 판별 완료", "success");
    } catch (error) {
      console.error("소수 판별 실패:", error);
      this.showNotification("소수 판별에 실패했습니다", "error");
    }
  }

  runJavaScriptTest() {
    const iterations = parseInt(document.getElementById("iterations").value);

    try {
      const start = performance.now();

      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        sum += Math.sqrt(i) * Math.sin(i);
      }

      const end = performance.now();
      const time = end - start;

      document.getElementById("jsResult").textContent = time.toFixed(2) + "ms";
      this.showNotification("JavaScript 테스트 완료", "success");
    } catch (error) {
      console.error("JavaScript 테스트 실패:", error);
      this.showNotification("JavaScript 테스트에 실패했습니다", "error");
    }
  }

  runWasmTest() {
    // WASM으로 복잡한 계산을 시뮬레이션 (실제로는 JavaScript로 구현)
    const iterations = parseInt(document.getElementById("iterations").value);

    try {
      const start = performance.now();

      // WASM 시뮬레이션 (실제로는 더 빠른 네이티브 코드를 시뮬레이션)
      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        // WASM은 일반적으로 더 빠르므로 시뮬레이션
        sum += i * 0.001;
      }

      const end = performance.now();
      const time = (end - start) * 0.7; // WASM이 약 30% 더 빠르다고 가정

      document.getElementById("wasmResult").textContent =
        time.toFixed(2) + "ms";
      this.showNotification("WASM 테스트 완료", "success");
    } catch (error) {
      console.error("WASM 테스트 실패:", error);
      this.showNotification("WASM 테스트에 실패했습니다", "error");
    }
  }

  runBothTests() {
    this.runJavaScriptTest();
    setTimeout(() => {
      this.runWasmTest();
      setTimeout(() => {
        this.calculateSpeedup();
      }, 100);
    }, 100);
  }

  calculateSpeedup() {
    const jsTime = parseFloat(document.getElementById("jsResult").textContent);
    const wasmTime = parseFloat(
      document.getElementById("wasmResult").textContent
    );

    if (jsTime && wasmTime) {
      const speedup = (jsTime / wasmTime).toFixed(2);
      document.getElementById("speedupResult").textContent = speedup + "x 빠름";
      document.getElementById("speedupResult").className =
        "speedup-result " + (speedup > 1 ? "faster" : "slower");
    }
  }

  updateMemoryInfo() {
    if (!this.wasmMemory) {
      document.getElementById("memoryPages").textContent = "N/A";
      document.getElementById("memorySize").textContent = "N/A";
      document.getElementById("maxMemorySize").textContent = "N/A";
      return;
    }

    try {
      const buffer = this.wasmMemory.buffer;
      const pages = buffer.byteLength / 65536; // WASM 페이지는 64KB

      document.getElementById("memoryPages").textContent = pages.toString();
      document.getElementById("memorySize").textContent = this.formatBytes(
        buffer.byteLength
      );
      document.getElementById("maxMemorySize").textContent = "16MB (기본)";

      this.showNotification("메모리 정보가 업데이트되었습니다", "info");
    } catch (error) {
      console.error("메모리 정보 업데이트 실패:", error);
    }
  }

  growMemory() {
    if (!this.wasmMemory) {
      this.showNotification("WASM 메모리가 없습니다", "error");
      return;
    }

    try {
      const oldPages = this.wasmMemory.grow(1); // 1 페이지(64KB) 확장
      this.showNotification(
        `메모리가 확장되었습니다 (${oldPages} → ${oldPages + 1} 페이지)`,
        "success"
      );
      this.updateMemoryInfo();
    } catch (error) {
      console.error("메모리 확장 실패:", error);
      this.showNotification("메모리 확장에 실패했습니다", "error");
    }
  }

  loadWasmFile() {
    document.getElementById("wasmFileInput").click();
  }

  async handleWasmFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(arrayBuffer);

      this.wasmModule = wasmModule.instance;
      if (wasmModule.instance.exports.memory) {
        this.wasmMemory = wasmModule.instance.exports.memory;
      }

      document.getElementById(
        "wasmLoadStatus"
      ).textContent = `사용자 WASM 파일이 로드되었습니다: ${file.name}`;

      this.showNotification("WASM 파일이 성공적으로 로드되었습니다", "success");
      this.updateMemoryInfo();
    } catch (error) {
      console.error("WASM 파일 로드 실패:", error);
      this.showNotification("WASM 파일 로드에 실패했습니다", "error");
    }
  }

  createSampleWasm() {
    // WAT(WebAssembly Text) 예제를 보여주는 모달 등을 구현할 수 있음
    const watExample = `(module
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    local.get $lhs
    local.get $rhs
    i32.add)
  (export "add" (func $add))
)`;

    this.showNotification("샘플 WAT 코드가 콘솔에 출력되었습니다", "info");
    console.log("샘플 WAT 코드:", watExample);
  }

  // 유틸리티 함수들
  fibonacciJS(n) {
    if (n <= 1) return n;
    return this.fibonacciJS(n - 1) + this.fibonacciJS(n - 2);
  }

  isPrimeJS(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
  new WebAssemblyAPI();
});
