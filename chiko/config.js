// 치코 설정 파일
// ⚠️ 이 파일은 Git에 포함되어 GitHub Pages 등에서 배포됩니다.
// 기본 API 키가 포함되어 있어 바로 사용할 수 있습니다.
// 개인 API 키는 설정 모달을 통해 localStorage에 저장되며, 우선순위가 더 높습니다.

// 기본 API 키 (GitHub Pages 배포용 - 공개 저장소에 포함됨)
// Google AI Studio에서 HTTP 리퍼러 제한을 설정하여 보안을 강화하는 것을 권장합니다.
const DEFAULT_API_KEY = 'AIzaSyD7N6Eu-dPcLEGDaYPC95TKahRA-00TnSI';

// 사용자 설정 API 키 가져오기 (localStorage에서)
// 개인 API 키가 설정되어 있으면 우선 사용, 없으면 기본 키 사용
function getUserApiKey() {
    if (typeof Storage !== 'undefined') {
        const savedKey = localStorage.getItem('chiko_api_key');
        if (savedKey && savedKey.trim() !== '' && savedKey.trim() !== DEFAULT_API_KEY) {
            return savedKey.trim();
        }
    }
    return null;
}

// API 키 저장하기
function saveUserApiKey(apiKey) {
    if (typeof Storage !== 'undefined') {
        localStorage.setItem('chiko_api_key', apiKey.trim());
    }
}

// 사용할 API 키 결정
// 우선순위: localStorage 개인 키 > 기본 키
const GEMINI_API_KEY = getUserApiKey() || DEFAULT_API_KEY;

// 전역으로 노출 (script.js에서 사용)
window.GEMINI_API_KEY = GEMINI_API_KEY;
window.saveUserApiKey = saveUserApiKey;
window.getUserApiKey = getUserApiKey;
window.DEFAULT_API_KEY = DEFAULT_API_KEY;

