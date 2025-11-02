// DOM 요소 참조
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const getLocationBtn = document.getElementById('getLocationBtn');
const weatherSection = document.getElementById('weatherSection');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

// 날씨 정보 표시 요소들
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const weatherCondition = document.getElementById('weatherCondition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');

// 기본 API 키
const DEFAULT_API_KEY = '42d715326be242e18f224055250211';

// 페이지 로드 시 저장된 API 키 불러오기 또는 기본 키 설정
window.addEventListener('DOMContentLoaded', () => {
    let savedApiKey = localStorage.getItem('weatherapi_key');
    
    // 저장된 키가 없으면 기본 키 사용
    if (!savedApiKey) {
        savedApiKey = DEFAULT_API_KEY;
        localStorage.setItem('weatherapi_key', DEFAULT_API_KEY);
    }
    
    apiKeyInput.value = savedApiKey;
    // API 키가 있으면 입력 필드 숨기기 (선택사항)
    // apiKeyInput.parentElement.parentElement.style.display = 'none';
});

// API 키 저장 버튼 클릭 이벤트
saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('weatherapi_key', apiKey);
        alert('API 키가 저장되었습니다.');
        apiKeyInput.value = ''; // 보안을 위해 입력 필드 비우기
    } else {
        alert('API 키를 입력해주세요.');
    }
});

// 에러 메시지 표시 함수
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    weatherSection.style.display = 'none';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// 로딩 상태 관리
function setLoading(isLoading) {
    loading.style.display = isLoading ? 'block' : 'none';
    weatherSection.style.display = isLoading ? 'none' : 'block';
    errorMessage.style.display = 'none';
}

// 날씨 정보 가져오기 함수
async function fetchWeather(query) {
    let apiKey = localStorage.getItem('weatherapi_key');
    
    // API 키가 없으면 기본 키 사용
    if (!apiKey) {
        apiKey = DEFAULT_API_KEY;
        localStorage.setItem('weatherapi_key', DEFAULT_API_KEY);
    }

    setLoading(true);

    try {
        // WeatherAPI.com API 호출 (현재 날씨)
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}&lang=ko`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || '날씨 정보를 가져올 수 없습니다.');
        }

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('날씨 정보 가져오기 오류:', error);
        showError(error.message || '날씨 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
        setLoading(false);
    }
}

// 날씨 정보 표시 함수
function displayWeather(data) {
    // 위치 정보
    cityName.textContent = data.location.name;
    
    // 현재 날짜 및 시간
    const date = new Date(data.location.localtime);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    currentDate.textContent = date.toLocaleDateString('ko-KR', options);

    // 온도 정보
    temp.textContent = Math.round(data.current.temp_c);

    // 날씨 아이콘
    weatherIcon.src = data.current.condition.icon;
    weatherIcon.alt = data.current.condition.text;

    // 날씨 상태
    weatherCondition.textContent = data.current.condition.text;

    // 상세 정보
    feelsLike.textContent = `${Math.round(data.current.feelslike_c)}°C`;
    humidity.textContent = `${data.current.humidity}%`;
    windSpeed.textContent = `${data.current.wind_kph} km/h`;
    pressure.textContent = `${data.current.pressure_mb} mb`;

    // 날씨 섹션 표시
    weatherSection.style.display = 'block';
}

// 도시 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError('도시명을 입력해주세요.');
    }
});

// Enter 키로 검색
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// 현재 위치 사용 버튼 클릭 이벤트
getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showError('브라우저가 위치 정보를 지원하지 않습니다.');
        return;
    }

    setLoading(true);

    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // 위도, 경도를 문자열로 변환하여 API에 전달
            fetchWeather(`${latitude},${longitude}`);
        },
        (error) => {
            setLoading(false);
            console.error('위치 정보 가져오기 오류:', error);
            let errorMsg = '위치 정보를 가져올 수 없습니다.';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '위치 정보를 사용할 수 없습니다.';
                    break;
                case error.TIMEOUT:
                    errorMsg = '위치 정보 요청 시간이 초과되었습니다.';
                    break;
            }
            showError(errorMsg);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
});

