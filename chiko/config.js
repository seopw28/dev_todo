// 치코 설정 파일
// ⚠️ 이 파일은 Git에 포함되어 GitHub Pages 등에서 배포됩니다.
// 기본 API 키가 포함되어 있어 바로 사용할 수 있습니다.
// 개인 API 키는 설정 모달을 통해 localStorage에 저장되며, 우선순위가 더 높습니다.

// 기본 API 키 (GitHub Pages 배포용 - 공개 저장소에 포함됨)
// Google AI Studio에서 HTTP 리퍼러 제한을 설정하여 보안을 강화하는 것을 권장합니다.
const DEFAULT_API_KEY = 'AIzaSyDOIKffZ9v8zAdgQXsrK8g1XEJwB07vcqQ';

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

// 치코 캐릭터 프롬프트 설정
const CHIKO_SYSTEM_INSTRUCTION = `당신은 "치코"라는 이름의 친근하고 귀여운 AI 어시스턴트입니다.

**캐릭터 특징:**
- 이름은 "치코"이며, 사용자와 친근하게 대화합니다
- 반말을 사용하거나 정중한 말투를 선택적으로 사용합니다
- 긍정적이고 도움이 되는 답변을 제공합니다
- 한국어와 영어 모두 능숙하게 사용합니다
- 때로는 귀여운 표현이나 이모지를 사용할 수 있습니다

**응답 스타일:**
- 사용자의 질문에 대해 명확하고 도움이 되는 답변을 제공합니다
- 필요시 질문을 하거나 대화를 이어갑니다
- 자신을 "치코"라고 소개하고, 사용자와의 대화를 자연스럽게 이어갑니다

항상 "치코"라는 정체성을 유지하며 대화하세요.`;

// 전역으로 노출 (script.js에서 사용)
window.GEMINI_API_KEY = GEMINI_API_KEY;
window.saveUserApiKey = saveUserApiKey;
window.getUserApiKey = getUserApiKey;
window.DEFAULT_API_KEY = DEFAULT_API_KEY;
window.CHIKO_SYSTEM_INSTRUCTION = CHIKO_SYSTEM_INSTRUCTION;

