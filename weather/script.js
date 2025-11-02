// DOM 요소 참조
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const getLocationBtn = document.getElementById('getLocationBtn');
const weatherSection = document.getElementById('weatherSection');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const statusTime = document.querySelector('.status-time');

// 상태바 시간 업데이트
function updateStatusTime() {
    if (statusTime) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        statusTime.textContent = `${hours}:${minutes}`;
    }
}

// 상태바 시간 주기적 업데이트
if (statusTime) {
    updateStatusTime();
    setInterval(updateStatusTime, 1000);
}

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

// 기본 API 키 (사용자에게 보이지 않음)
const DEFAULT_API_KEY = '42d715326be242e18f224055250211';

// 기본 도시 (서울)
const DEFAULT_CITY = '서울';

// 한글 도시명을 영어명으로 변환하는 매핑 (WeatherAPI 호환성 향상)
const CITY_NAME_MAP = {
    '서울': 'Seoul',
    '부산': 'Busan',
    '대구': 'Daegu',
    '인천': 'Incheon',
    '광주': 'Gwangju',
    '대전': 'Daejeon',
    '울산': 'Ulsan',
    '수원': 'Suwon',
    '성남': 'Seongnam',
    '고양': 'Goyang',
    '용인': 'Yongin',
    '부천': 'Bucheon',
    '안산': 'Ansan',
    '안양': 'Anyang',
    '평택': 'Pyeongtaek',
    '시흥': 'Siheung',
    '김포': 'Gimpo',
    '의정부': 'Uijeongbu',
    '광명': 'Gwangmyeong',
    '파주': 'Paju',
    '이천': 'Icheon',
    '오산': 'Osan',
    '구리': 'Guri',
    '안성': 'Anseong',
    '포천': 'Pocheon',
    '의왕': 'Uiwang',
    '하남': 'Hanam',
    '여주': 'Yeoju'
};

// 도시명 변환 함수 (한글이면 영어로 변환, 이미 영어거나 숫자면 그대로 사용)
function normalizeCityName(cityName) {
    const trimmed = cityName.trim();
    
    // 한글 도시명 매핑에 있으면 영어명으로 변환
    if (CITY_NAME_MAP[trimmed]) {
        return CITY_NAME_MAP[trimmed];
    }
    
    // 위도,경도 형식이면 그대로 반환
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(trimmed)) {
        return trimmed;
    }
    
    // 이미 영어명이거나 다른 형식이면 그대로 반환
    return trimmed;
}

// 현재 위치 가져오기 함수 (재사용 가능하도록 분리)
function getCurrentLocation() {
    if (!navigator.geolocation) {
        // 위치 정보를 지원하지 않는 경우 서울로 대체
        showError('브라우저가 위치 정보를 지원하지 않습니다. 서울 날씨를 표시합니다.');
        fetchWeather(normalizeCityName(DEFAULT_CITY));
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
            let errorMsg = '위치 정보를 가져올 수 없습니다. 서울 날씨를 표시합니다.';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = '위치 정보 접근이 거부되었습니다. 서울 날씨를 표시합니다.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = '위치 정보를 사용할 수 없습니다. 서울 날씨를 표시합니다.';
                    break;
                case error.TIMEOUT:
                    errorMsg = '위치 정보 요청 시간이 초과되었습니다. 서울 날씨를 표시합니다.';
                    break;
            }
            showError(errorMsg);
            // 에러 발생 시 서울 날씨를 대체로 표시
            fetchWeather(normalizeCityName(DEFAULT_CITY));
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// 페이지 로드 시 현재 위치 기반 날씨 자동 로드
window.addEventListener('DOMContentLoaded', () => {
    // 기본 API 키를 localStorage에 설정 (없을 경우에만)
    let savedApiKey = localStorage.getItem('weatherapi_key');
    if (!savedApiKey) {
        localStorage.setItem('weatherapi_key', DEFAULT_API_KEY);
    }
    
    // 페이지 로드 시 현재 위치 기반 날씨 자동 로드
    getCurrentLocation();
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
    // 항상 기본 API 키 사용 (사용자에게 노출하지 않음)
    const apiKey = DEFAULT_API_KEY;

    setLoading(true);

    try {
        // WeatherAPI.com API 호출 (현재 날씨)
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(query)}&lang=ko`;
        console.log('날씨 정보 요청:', query);
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || '날씨 정보를 가져올 수 없습니다.');
        }

        const data = await response.json();
        console.log('날씨 정보 응답:', data.location.name, '요청:', query);
        
        // 응답받은 도시 정보 표시
        displayWeather(data);
    } catch (error) {
        console.error('날씨 정보 가져오기 오류:', error);
        showError(error.message || '날씨 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
        setLoading(false);
    }
}

// 날씨 코드에 따른 Font Awesome 아이콘 매핑
function getWeatherIconClass(conditionCode, conditionText) {
    const code = conditionCode || 1000;
    const text = (conditionText || '').toLowerCase();
    
    // 맑음
    if (code === 1000 || text.includes('clear') || text.includes('맑')) {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? 'fa-sun' : 'fa-moon';
    }
    
    // 구름
    if (code === 1003 || code === 1006 || code === 1009 || text.includes('cloud') || text.includes('구름')) {
        if (code === 1003 || text.includes('partly')) {
            return 'fa-cloud-sun';
        }
        return 'fa-cloud';
    }
    
    // 비
    if ((code >= 1063 && code <= 1087) || text.includes('rain') || text.includes('비') || text.includes('shower')) {
        if (code === 1273 || code === 1276 || text.includes('thunder') || text.includes('천둥')) {
            return 'fa-cloud-bolt';
        }
        return 'fa-cloud-rain';
    }
    
    // 눈
    if ((code >= 1114 && code <= 1207) || text.includes('snow') || text.includes('눈')) {
        return 'fa-snowflake';
    }
    
    // 안개
    if (code === 1030 || code === 1135 || code === 1147 || text.includes('mist') || text.includes('fog') || text.includes('안개')) {
        return 'fa-smog';
    }
    
    // 기본값
    return 'fa-sun';
}

// 날씨 아이콘 색상 결정 함수
function getWeatherIconColor(iconClass) {
    if (iconClass === 'fa-sun') {
        return '#ffd700'; // 노란색
    } else if (iconClass === 'fa-moon') {
        return '#e0e0e0'; // 흰색
    } else if (iconClass === 'fa-cloud' || iconClass === 'fa-cloud-sun') {
        return '#a0a0a0'; // 회색
    } else if (iconClass === 'fa-cloud-rain') {
        return '#4a90e2'; // 파란색
    } else if (iconClass === 'fa-cloud-bolt') {
        return '#ffd700'; // 노란색 (천둥)
    } else if (iconClass === 'fa-snowflake') {
        return '#ffffff'; // 하얀색
    } else if (iconClass === 'fa-smog') {
        return '#888888'; // 회색
    }
    return '#ffd700'; // 기본값: 노란색
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

    // 날씨 아이콘 (Font Awesome)
    const iconClass = getWeatherIconClass(data.current.condition.code, data.current.condition.text);
    const iconColor = getWeatherIconColor(iconClass);
    weatherIcon.className = `fas ${iconClass} weather-icon`;
    weatherIcon.style.color = iconColor;
    weatherIcon.setAttribute('title', data.current.condition.text);

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

// 도시 검색 함수 (재사용 가능하도록 분리)
function searchCity() {
    const city = cityInput.value.trim();
    if (city) {
        // 한글 도시명을 영어명으로 변환하여 검색 정확도 향상
        const normalizedCity = normalizeCityName(city);
        console.log('검색 중:', city, '->', normalizedCity);
        fetchWeather(normalizedCity);
    } else {
        showError('도시명을 입력해주세요.');
    }
}

// 도시 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', () => {
    searchCity();
});

// Enter 키로 검색
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // 기본 동작 방지
        searchCity();
    }
});

// 현재 위치 사용 버튼 클릭 이벤트
getLocationBtn.addEventListener('click', () => {
    getCurrentLocation();
});

