import "./style.css";

console.log("🌍 GeoLocation API 스크립트 시작!");

class GeoLocationAPI {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.locationHistory = [];
    this.isTracking = false;
    this.mapInstance = null;
    this.markers = [];
    this.init();
  }

  init() {
    console.log("🌍 GeoLocation API 초기화 시작");
    this.checkAPISupport();
    this.setupUI();
    this.setupEventListeners();
    console.log("✅ GeoLocation API 초기화 완료");
  }

  checkAPISupport() {
    console.log("🔍 GeoLocation API 지원 여부 확인 중...");

    const support = {
      geolocation: "geolocation" in navigator,
      permissions: "permissions" in navigator,
      secureContext:
        location.protocol === "https:" || location.hostname === "localhost",
    };

    console.log("📊 API 지원 현황:", support);
    this.apiSupport = support;
  }

  setupUI() {
    const appDiv = document.getElementById("app");
    const support = this.apiSupport;

    appDiv.innerHTML = `
      <div class="geolocation-container">
        <header class="geolocation-header">
          <h1>🌍 GeoLocation API</h1>
          <p>현재 위치를 확인하고 위치 기반 서비스를 체험하세요</p>
          <div class="api-support">
            <div class="support-badge ${
              support.geolocation ? "supported" : "unsupported"
            }">
              ${support.geolocation ? "✅ GeoLocation" : "❌ GeoLocation"}
            </div>
            <div class="support-badge ${
              support.permissions ? "supported" : "unsupported"
            }">
              ${support.permissions ? "✅ Permissions" : "❌ Permissions"}
            </div>
            <div class="support-badge ${
              support.secureContext ? "supported" : "unsupported"
            }">
              ${
                support.secureContext
                  ? "✅ Secure Context"
                  : "❌ Secure Context"
              }
            </div>
          </div>
        </header>

        <main class="geolocation-main">
          <!-- 위치 정보 패널 -->
          <div class="location-panel">
            <div class="panel-card primary">
              <h2>📍 현재 위치</h2>
              <div class="location-controls">
                <div class="location-buttons">
                  <button id="getCurrentLocation" class="btn-primary">
                    🎯 현재 위치 가져오기
                  </button>
                  <button id="startTracking" class="btn-success">
                    📱 위치 추적 시작
                  </button>
                  <button id="stopTracking" class="btn-danger" disabled>
                    ⏹️ 위치 추적 중지
                  </button>
                  <button id="clearHistory" class="btn-warning">
                    🗑️ 이력 삭제
                  </button>
                </div>

                <div class="location-options">
                  <div class="option-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="enableHighAccuracy" checked>
                      <span class="checkmark"></span>
                      고정밀도 모드
                    </label>
                  </div>
                  <div class="option-group">
                    <label for="timeout">타임아웃:</label>
                    <select id="timeout">
                      <option value="5000">5초</option>
                      <option value="10000" selected>10초</option>
                      <option value="15000">15초</option>
                      <option value="30000">30초</option>
                    </select>
                  </div>
                  <div class="option-group">
                    <label for="maximumAge">캐시 시간:</label>
                    <select id="maximumAge">
                      <option value="0">캐시 안함</option>
                      <option value="60000" selected>1분</option>
                      <option value="300000">5분</option>
                      <option value="600000">10분</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="current-location" id="currentLocationInfo">
                <div class="location-placeholder">
                  위치 정보를 가져오려면 '현재 위치 가져오기' 버튼을 클릭하세요
                </div>
              </div>
            </div>
          </div>

          <!-- 위치 기반 서비스 -->
          <div class="services-panel">
            <div class="panel-card full-width">
              <h2>🌏 위치 기반 서비스</h2>
              
              <div class="service-tabs">
                <button class="service-tab-btn active" data-service="map">🗺️ 지도</button>
                <button class="service-tab-btn" data-service="weather">🌤️ 날씨</button>
                <button class="service-tab-btn" data-service="places">🏪 주변 장소</button>
                <button class="service-tab-btn" data-service="distance">📏 거리 계산</button>
              </div>

              <div class="service-content">
                <!-- 지도 서비스 -->
                <div class="service-panel active" id="mapService">
                  <div class="map-controls">
                    <h3>🗺️ 위치 지도</h3>
                    <div class="map-options">
                      <button id="addMarker" class="btn-accent">📍 마커 추가</button>
                      <button id="clearMarkers" class="btn-secondary">🧹 마커 삭제</button>
                      <button id="fitBounds" class="btn-info">🔍 전체 보기</button>
                    </div>
                  </div>
                  
                  <div class="map-container">
                    <div id="mapDisplay" class="map-display">
                      <div class="map-placeholder">
                        위치 정보를 가져오면 지도가 표시됩니다
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 날씨 서비스 -->
                <div class="service-panel" id="weatherService">
                  <div class="weather-controls">
                    <h3>🌤️ 현재 날씨</h3>
                    <button id="getWeather" class="btn-primary">🌡️ 날씨 조회</button>
                  </div>
                  
                  <div class="weather-display" id="weatherInfo">
                    <div class="weather-placeholder">
                      위치를 확인한 후 날씨 정보를 조회할 수 있습니다
                    </div>
                  </div>
                </div>

                <!-- 주변 장소 서비스 -->
                <div class="service-panel" id="placesService">
                  <div class="places-controls">
                    <h3>🏪 주변 장소</h3>
                    <div class="search-controls">
                      <select id="placeType">
                        <option value="restaurant">🍽️ 음식점</option>
                        <option value="hospital">🏥 병원</option>
                        <option value="school">🏫 학교</option>
                        <option value="bank">🏦 은행</option>
                        <option value="gas_station">⛽ 주유소</option>
                        <option value="pharmacy">💊 약국</option>
                      </select>
                      <input type="number" id="searchRadius" value="1000" min="100" max="5000" step="100">
                      <span>미터</span>
                      <button id="searchPlaces" class="btn-primary">🔍 검색</button>
                    </div>
                  </div>
                  
                  <div class="places-results" id="placesResults">
                    <div class="places-placeholder">
                      현재 위치 기준으로 주변 장소를 검색할 수 있습니다
                    </div>
                  </div>
                </div>

                <!-- 거리 계산 서비스 -->
                <div class="service-panel" id="distanceService">
                  <div class="distance-controls">
                    <h3>📏 거리 계산</h3>
                    <div class="distance-inputs">
                      <div class="input-group">
                        <label>목적지 위도:</label>
                        <input type="number" id="targetLatitude" step="0.000001" placeholder="37.5665">
                      </div>
                      <div class="input-group">
                        <label>목적지 경도:</label>
                        <input type="number" id="targetLongitude" step="0.000001" placeholder="126.9780">
                      </div>
                      <button id="calculateDistance" class="btn-primary">📐 거리 계산</button>
                    </div>
                    
                    <div class="famous-places">
                      <h4>🏛️ 주요 랜드마크</h4>
                      <div class="landmark-buttons">
                        <button class="landmark-btn" data-lat="37.5665" data-lng="126.9780">🏛️ 서울시청</button>
                        <button class="landmark-btn" data-lat="37.5797" data-lng="126.9770">🏰 경복궁</button>
                        <button class="landmark-btn" data-lat="37.5173" data-lng="127.0473">🏢 강남역</button>
                        <button class="landmark-btn" data-lat="37.5506" data-lng="126.9910">🗼 남산타워</button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="distance-results" id="distanceResults">
                    <div class="distance-placeholder">
                      현재 위치와 목적지 사이의 거리를 계산할 수 있습니다
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 위치 이력 -->
          <div class="history-panel">
            <div class="panel-card full-width">
              <h2>📊 위치 이력</h2>
              <div class="history-stats">
                <div class="stat-item">
                  <span class="stat-label">총 위치 수:</span>
                  <span class="stat-value" id="totalLocations">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">추적 시간:</span>
                  <span class="stat-value" id="trackingTime">0초</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">이동 거리:</span>
                  <span class="stat-value" id="totalDistance">0m</span>
                </div>
              </div>
              
              <div class="location-history" id="locationHistory">
                <div class="history-placeholder">
                  위치 추적을 시작하면 이력이 표시됩니다
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
    // 위치 관련 버튼들
    const getCurrentBtn = document.getElementById("getCurrentLocation");
    const startTrackingBtn = document.getElementById("startTracking");
    const stopTrackingBtn = document.getElementById("stopTracking");
    const clearHistoryBtn = document.getElementById("clearHistory");

    if (getCurrentBtn) {
      getCurrentBtn.addEventListener("click", () => this.getCurrentLocation());
    }

    if (startTrackingBtn) {
      startTrackingBtn.addEventListener("click", () => this.startTracking());
    }

    if (stopTrackingBtn) {
      stopTrackingBtn.addEventListener("click", () => this.stopTracking());
    }

    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => this.clearHistory());
    }

    // 서비스 탭 버튼들
    const serviceTabs = document.querySelectorAll(".service-tab-btn");
    serviceTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const service = e.target.dataset.service;
        this.switchService(service);
      });
    });

    // 지도 관련 버튼들
    const addMarkerBtn = document.getElementById("addMarker");
    const clearMarkersBtn = document.getElementById("clearMarkers");
    const fitBoundsBtn = document.getElementById("fitBounds");

    if (addMarkerBtn) {
      addMarkerBtn.addEventListener("click", () => this.addMarker());
    }

    if (clearMarkersBtn) {
      clearMarkersBtn.addEventListener("click", () => this.clearMarkers());
    }

    if (fitBoundsBtn) {
      fitBoundsBtn.addEventListener("click", () => this.fitBounds());
    }

    // 날씨 조회
    const getWeatherBtn = document.getElementById("getWeather");
    if (getWeatherBtn) {
      getWeatherBtn.addEventListener("click", () => this.getWeather());
    }

    // 주변 장소 검색
    const searchPlacesBtn = document.getElementById("searchPlaces");
    if (searchPlacesBtn) {
      searchPlacesBtn.addEventListener("click", () => this.searchPlaces());
    }

    // 거리 계산
    const calculateDistanceBtn = document.getElementById("calculateDistance");
    if (calculateDistanceBtn) {
      calculateDistanceBtn.addEventListener("click", () =>
        this.calculateDistance()
      );
    }

    // 랜드마크 버튼들
    const landmarkBtns = document.querySelectorAll(".landmark-btn");
    landmarkBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lat = parseFloat(e.target.dataset.lat);
        const lng = parseFloat(e.target.dataset.lng);
        document.getElementById("targetLatitude").value = lat;
        document.getElementById("targetLongitude").value = lng;
        this.calculateDistance();
      });
    });

    console.log("✅ 이벤트 리스너 설정 완료");
  }

  getCurrentLocation() {
    if (!this.apiSupport.geolocation) {
      this.showNotification("GeoLocation API가 지원되지 않습니다", "error");
      return;
    }

    this.showNotification("위치 정보를 가져오는 중...", "info");

    const options = this.getLocationOptions();

    navigator.geolocation.getCurrentPosition(
      (position) => this.onLocationSuccess(position),
      (error) => this.onLocationError(error),
      options
    );
  }

  startTracking() {
    if (!this.apiSupport.geolocation) {
      this.showNotification("GeoLocation API가 지원되지 않습니다", "error");
      return;
    }

    if (this.isTracking) {
      this.showNotification("이미 위치 추적 중입니다", "warning");
      return;
    }

    const options = this.getLocationOptions();

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.onTrackingUpdate(position),
      (error) => this.onLocationError(error),
      options
    );

    this.isTracking = true;
    this.trackingStartTime = Date.now();

    // 버튼 상태 변경
    document.getElementById("startTracking").disabled = true;
    document.getElementById("stopTracking").disabled = false;

    this.showNotification("위치 추적을 시작했습니다", "success");
    this.updateTrackingStats();
  }

  stopTracking() {
    if (!this.isTracking) {
      this.showNotification("위치 추적이 실행 중이 아닙니다", "warning");
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;

    // 버튼 상태 변경
    document.getElementById("startTracking").disabled = false;
    document.getElementById("stopTracking").disabled = true;

    this.showNotification("위치 추적을 중지했습니다", "info");
  }

  clearHistory() {
    this.locationHistory = [];
    this.clearMarkers();
    this.updateLocationHistory();
    this.updateTrackingStats();
    this.showNotification("위치 이력을 삭제했습니다", "info");
  }

  getLocationOptions() {
    return {
      enableHighAccuracy: document.getElementById("enableHighAccuracy").checked,
      timeout: parseInt(document.getElementById("timeout").value),
      maximumAge: parseInt(document.getElementById("maximumAge").value),
    };
  }

  onLocationSuccess(position) {
    const coords = position.coords;

    this.currentPosition = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp: position.timestamp,
    };

    this.displayLocationInfo();
    this.updateMap();
    this.showNotification("위치 정보를 성공적으로 가져왔습니다", "success");
  }

  onTrackingUpdate(position) {
    this.onLocationSuccess(position);

    // 이력에 추가
    const locationData = {
      ...this.currentPosition,
      id: Date.now(),
    };

    this.locationHistory.push(locationData);
    this.updateLocationHistory();
    this.updateTrackingStats();

    // 지도에 마커 추가
    this.addMarkerToMap(this.currentPosition);
  }

  onLocationError(error) {
    let message = "위치 정보를 가져올 수 없습니다";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "위치 정보 접근이 거부되었습니다";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "위치 정보를 사용할 수 없습니다";
        break;
      case error.TIMEOUT:
        message = "위치 정보 요청이 시간 초과되었습니다";
        break;
    }

    this.showNotification(message, "error");
    console.error("GeoLocation 오류:", error);
  }

  displayLocationInfo() {
    const infoDiv = document.getElementById("currentLocationInfo");
    const pos = this.currentPosition;

    if (!pos) return;

    const timeString = new Date(pos.timestamp).toLocaleString();

    infoDiv.innerHTML = `
      <div class="location-details">
        <div class="location-coords">
          <div class="coord-item">
            <span class="coord-label">위도:</span>
            <span class="coord-value">${pos.latitude.toFixed(6)}</span>
          </div>
          <div class="coord-item">
            <span class="coord-label">경도:</span>
            <span class="coord-value">${pos.longitude.toFixed(6)}</span>
          </div>
        </div>
        
        <div class="location-meta">
          <div class="meta-item">
            <span class="meta-label">정확도:</span>
            <span class="meta-value">${Math.round(pos.accuracy)}m</span>
          </div>
          ${
            pos.altitude
              ? `
            <div class="meta-item">
              <span class="meta-label">고도:</span>
              <span class="meta-value">${Math.round(pos.altitude)}m</span>
            </div>
          `
              : ""
          }
          ${
            pos.speed
              ? `
            <div class="meta-item">
              <span class="meta-label">속도:</span>
              <span class="meta-value">${(pos.speed * 3.6).toFixed(
                1
              )}km/h</span>
            </div>
          `
              : ""
          }
          <div class="meta-item">
            <span class="meta-label">시간:</span>
            <span class="meta-value">${timeString}</span>
          </div>
        </div>
        
        <div class="location-actions">
          <button onclick="navigator.clipboard.writeText('${pos.latitude}, ${
      pos.longitude
    }')" class="btn-secondary">
            📋 좌표 복사
          </button>
          <button onclick="window.open('https://maps.google.com/?q=${
            pos.latitude
          },${pos.longitude}', '_blank')" class="btn-info">
            🗺️ Google Maps
          </button>
        </div>
      </div>
    `;
  }

  updateMap() {
    const mapDiv = document.getElementById("mapDisplay");

    if (!this.currentPosition) {
      mapDiv.innerHTML =
        '<div class="map-placeholder">위치 정보가 없습니다</div>';
      return;
    }

    const pos = this.currentPosition;

    // 간단한 지도 표시 (실제 지도 API 대신 시각적 표현)
    mapDiv.innerHTML = `
      <div class="simple-map">
        <div class="map-header">
          <h4>📍 현재 위치</h4>
          <span class="coordinates">${pos.latitude.toFixed(
            4
          )}, ${pos.longitude.toFixed(4)}</span>
        </div>
        <div class="map-visual">
          <div class="map-grid">
            <div class="current-marker">📍</div>
            ${this.markers
              .map(
                (marker, index) =>
                  `<div class="marker marker-${index}" style="left: ${
                    50 + (index % 5) * 10
                  }%; top: ${50 + Math.floor(index / 5) * 10}%;">📌</div>`
              )
              .join("")}
          </div>
        </div>
        <div class="map-info">
          <p>정확도: ${Math.round(pos.accuracy)}m</p>
          <p>마커 수: ${this.markers.length}개</p>
        </div>
      </div>
    `;
  }

  addMarker() {
    if (!this.currentPosition) {
      this.showNotification("현재 위치가 없습니다", "warning");
      return;
    }

    const marker = {
      id: Date.now(),
      latitude: this.currentPosition.latitude,
      longitude: this.currentPosition.longitude,
      timestamp: Date.now(),
    };

    this.markers.push(marker);
    this.updateMap();
    this.showNotification(
      `마커가 추가되었습니다 (총 ${this.markers.length}개)`,
      "success"
    );
  }

  addMarkerToMap(position) {
    const marker = {
      id: Date.now(),
      latitude: position.latitude,
      longitude: position.longitude,
      timestamp: Date.now(),
    };

    this.markers.push(marker);
    this.updateMap();
  }

  clearMarkers() {
    this.markers = [];
    this.updateMap();
    this.showNotification("모든 마커가 삭제되었습니다", "info");
  }

  fitBounds() {
    if (this.markers.length === 0) {
      this.showNotification("표시할 마커가 없습니다", "warning");
      return;
    }

    this.updateMap();
    this.showNotification("모든 마커를 화면에 맞췄습니다", "info");
  }

  async getWeather() {
    if (!this.currentPosition) {
      this.showNotification("현재 위치가 필요합니다", "warning");
      return;
    }

    const weatherDiv = document.getElementById("weatherInfo");
    weatherDiv.innerHTML =
      '<div class="loading">날씨 정보를 가져오는 중...</div>';

    try {
      // 실제 날씨 API 대신 시뮬레이션
      await this.delay(1500);

      const mockWeather = this.generateMockWeather();

      weatherDiv.innerHTML = `
        <div class="weather-card">
          <div class="weather-main">
            <div class="weather-icon">${mockWeather.icon}</div>
            <div class="weather-temp">${mockWeather.temperature}°C</div>
            <div class="weather-desc">${mockWeather.description}</div>
          </div>
          
          <div class="weather-details">
            <div class="weather-item">
              <span class="weather-label">체감온도:</span>
              <span class="weather-value">${mockWeather.feelsLike}°C</span>
            </div>
            <div class="weather-item">
              <span class="weather-label">습도:</span>
              <span class="weather-value">${mockWeather.humidity}%</span>
            </div>
            <div class="weather-item">
              <span class="weather-label">바람:</span>
              <span class="weather-value">${mockWeather.windSpeed}m/s</span>
            </div>
            <div class="weather-item">
              <span class="weather-label">기압:</span>
              <span class="weather-value">${mockWeather.pressure}hPa</span>
            </div>
          </div>
          
          <div class="weather-location">
            📍 ${this.currentPosition.latitude.toFixed(
              2
            )}, ${this.currentPosition.longitude.toFixed(2)}
          </div>
        </div>
      `;

      this.showNotification("날씨 정보를 가져왔습니다", "success");
    } catch (error) {
      weatherDiv.innerHTML =
        '<div class="error">날씨 정보를 가져올 수 없습니다</div>';
      this.showNotification("날씨 정보 조회 실패", "error");
    }
  }

  generateMockWeather() {
    const conditions = [
      { icon: "☀️", description: "맑음", temp: [20, 30] },
      { icon: "⛅", description: "구름 조금", temp: [15, 25] },
      { icon: "☁️", description: "흐림", temp: [10, 20] },
      { icon: "🌧️", description: "비", temp: [5, 15] },
      { icon: "❄️", description: "눈", temp: [-5, 5] },
    ];

    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.round(
      Math.random() * (condition.temp[1] - condition.temp[0]) +
        condition.temp[0]
    );

    return {
      icon: condition.icon,
      description: condition.description,
      temperature,
      feelsLike: temperature + Math.round((Math.random() - 0.5) * 4),
      humidity: Math.round(Math.random() * 40 + 30),
      windSpeed: Math.round(Math.random() * 10 + 1),
      pressure: Math.round(Math.random() * 50 + 1000),
    };
  }

  async searchPlaces() {
    if (!this.currentPosition) {
      this.showNotification("현재 위치가 필요합니다", "warning");
      return;
    }

    const placeType = document.getElementById("placeType").value;
    const radius = parseInt(document.getElementById("searchRadius").value);
    const resultsDiv = document.getElementById("placesResults");

    resultsDiv.innerHTML =
      '<div class="loading">주변 장소를 검색하는 중...</div>';

    try {
      await this.delay(2000);

      const mockPlaces = this.generateMockPlaces(placeType, radius);

      resultsDiv.innerHTML = `
        <div class="places-list">
          <h4>🔍 ${this.getPlaceTypeKorean(placeType)} (반경 ${radius}m)</h4>
          ${mockPlaces
            .map(
              (place) => `
            <div class="place-item">
              <div class="place-info">
                <div class="place-name">${place.name}</div>
                <div class="place-address">${place.address}</div>
                <div class="place-distance">📏 ${place.distance}m</div>
              </div>
              <div class="place-actions">
                <button onclick="window.open('https://maps.google.com/?q=${place.lat},${place.lng}', '_blank')" class="btn-small">
                  🗺️ 지도
                </button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      this.showNotification(
        `${mockPlaces.length}개의 장소를 찾았습니다`,
        "success"
      );
    } catch (error) {
      resultsDiv.innerHTML =
        '<div class="error">장소 검색에 실패했습니다</div>';
      this.showNotification("장소 검색 실패", "error");
    }
  }

  generateMockPlaces(type, radius) {
    const placeNames = {
      restaurant: [
        "맛있는 식당",
        "고향 냉면",
        "피자헤븐",
        "치킨마을",
        "한식당",
      ],
      hospital: ["서울병원", "건강의료원", "종합병원", "내과의원", "치과"],
      school: ["서울초등학교", "중앙중학교", "고등학교", "대학교", "어린이집"],
      bank: ["KB은행", "신한은행", "우리은행", "농협", "신협"],
      gas_station: [
        "SK주유소",
        "GS칼텍스",
        "현대오일뱅크",
        "S-Oil",
        "알뜰주유소",
      ],
      pharmacy: [
        "온누리약국",
        "건강약국",
        "24시간약국",
        "중앙약국",
        "행복약국",
      ],
    };

    const names = placeNames[type] || ["장소"];
    const places = [];

    for (let i = 0; i < 5; i++) {
      const distance = Math.round(Math.random() * radius);
      const lat = this.currentPosition.latitude + (Math.random() - 0.5) * 0.01;
      const lng = this.currentPosition.longitude + (Math.random() - 0.5) * 0.01;

      places.push({
        name: names[Math.floor(Math.random() * names.length)] + ` ${i + 1}`,
        address: `서울시 중구 ${Math.floor(Math.random() * 100)}번길`,
        distance,
        lat,
        lng,
      });
    }

    return places.sort((a, b) => a.distance - b.distance);
  }

  getPlaceTypeKorean(type) {
    const types = {
      restaurant: "음식점",
      hospital: "병원",
      school: "학교",
      bank: "은행",
      gas_station: "주유소",
      pharmacy: "약국",
    };
    return types[type] || "장소";
  }

  calculateDistance() {
    if (!this.currentPosition) {
      this.showNotification("현재 위치가 필요합니다", "warning");
      return;
    }

    const targetLat = parseFloat(
      document.getElementById("targetLatitude").value
    );
    const targetLng = parseFloat(
      document.getElementById("targetLongitude").value
    );

    if (isNaN(targetLat) || isNaN(targetLng)) {
      this.showNotification("올바른 좌표를 입력하세요", "warning");
      return;
    }

    const distance = this.calculateHaversineDistance(
      this.currentPosition.latitude,
      this.currentPosition.longitude,
      targetLat,
      targetLng
    );

    const resultsDiv = document.getElementById("distanceResults");

    resultsDiv.innerHTML = `
      <div class="distance-result">
        <h4>📐 거리 계산 결과</h4>
        <div class="distance-info">
          <div class="distance-main">
            <span class="distance-value">${(distance / 1000).toFixed(
              2
            )} km</span>
            <span class="distance-unit">(${Math.round(distance)} 미터)</span>
          </div>
          
          <div class="distance-details">
            <div class="coord-info">
              <div class="coord-section">
                <h5>출발지 (현재 위치)</h5>
                <p>위도: ${this.currentPosition.latitude.toFixed(6)}</p>
                <p>경도: ${this.currentPosition.longitude.toFixed(6)}</p>
              </div>
              
              <div class="coord-section">
                <h5>목적지</h5>
                <p>위도: ${targetLat.toFixed(6)}</p>
                <p>경도: ${targetLng.toFixed(6)}</p>
              </div>
            </div>
            
            <div class="travel-estimates">
              <h5>🚗 예상 이동 시간</h5>
              <div class="travel-time">
                <span>도보: ${Math.round(distance / 80)} 분</span>
                <span>자전거: ${Math.round(distance / 250)} 분</span>
                <span>자동차: ${Math.round(distance / 800)} 분</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.showNotification(
      `거리 계산 완료: ${(distance / 1000).toFixed(2)}km`,
      "success"
    );
  }

  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  updateLocationHistory() {
    const historyDiv = document.getElementById("locationHistory");

    if (this.locationHistory.length === 0) {
      historyDiv.innerHTML =
        '<div class="history-placeholder">위치 추적을 시작하면 이력이 표시됩니다</div>';
      return;
    }

    const recentHistory = this.locationHistory.slice(-10).reverse();

    historyDiv.innerHTML = `
      <div class="history-list">
        ${recentHistory
          .map(
            (location, index) => `
          <div class="history-item">
            <div class="history-time">
              ${new Date(location.timestamp).toLocaleTimeString()}
            </div>
            <div class="history-coords">
              ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </div>
            <div class="history-accuracy">
              정확도: ${Math.round(location.accuracy)}m
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  updateTrackingStats() {
    const totalElement = document.getElementById("totalLocations");
    const timeElement = document.getElementById("trackingTime");
    const distanceElement = document.getElementById("totalDistance");

    totalElement.textContent = this.locationHistory.length;

    if (this.isTracking && this.trackingStartTime) {
      const elapsed = Math.floor((Date.now() - this.trackingStartTime) / 1000);
      timeElement.textContent = `${elapsed}초`;
    } else {
      timeElement.textContent = "0초";
    }

    // 총 이동 거리 계산
    let totalDistance = 0;
    for (let i = 1; i < this.locationHistory.length; i++) {
      const prev = this.locationHistory[i - 1];
      const curr = this.locationHistory[i];
      totalDistance += this.calculateHaversineDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    distanceElement.textContent = `${Math.round(totalDistance)}m`;
  }

  switchService(service) {
    // 탭 버튼 활성화
    document.querySelectorAll(".service-tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document
      .querySelector(`[data-service="${service}"]`)
      .classList.add("active");

    // 서비스 패널 표시
    document.querySelectorAll(".service-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.getElementById(`${service}Service`).classList.add("active");
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
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
window.geoLocationAPI = null;

// 초기화
function initGeoLocationAPI() {
  console.log("🚀 GeoLocation API 초기화 함수 호출");
  window.geoLocationAPI = new GeoLocationAPI();
}

if (document.readyState === "loading") {
  console.log("📄 DOM 로딩 중, DOMContentLoaded 이벤트 대기");
  document.addEventListener("DOMContentLoaded", initGeoLocationAPI);
} else {
  console.log("📄 DOM 이미 로드됨, 즉시 초기화");
  initGeoLocationAPI();
}

console.log(
  "📄 GeoLocation API 스크립트 로드 완료, readyState:",
  document.readyState
);
