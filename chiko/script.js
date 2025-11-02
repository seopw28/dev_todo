// Gemini API 설정
// config.js에서 API 키를 로드합니다 (GitHub Pages 배포용)
// API URL은 메시지 전송 시 동적으로 생성됩니다
function getGeminiApiUrl() {
    // localStorage에서 개인 키 먼저 확인, 없으면 기본 키 사용
    const apiKey = window.GEMINI_API_KEY || window.DEFAULT_API_KEY || 'YOUR_API_KEY_HERE';
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
}

// DOM 요소
let chatInput, sendBtn, chatMessages;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    chatInput = document.getElementById('chatInput');
    sendBtn = document.getElementById('sendBtn');
    chatMessages = document.getElementById('chatMessages');
    
    // 이벤트 리스너
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 설정 모달 이벤트
    setupSettingsModal();
    
    // 상태바 시간 업데이트
    updateStatusTime();
    setInterval(updateStatusTime, 1000);
    
    // 채팅 메시지 스크롤을 하단으로
    scrollToBottom();
});

// 설정 모달 설정
function setupSettingsModal() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const useDefaultBtn = document.getElementById('useDefaultBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    // 기존 저장된 키 표시 (마스킹)
    const savedKey = window.getUserApiKey();
    
    // 설정 버튼 클릭
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('show');
        // 저장된 키가 있으면 전체 표시, 없으면 기본 키 표시
        if (savedKey) {
            apiKeyInput.value = savedKey;
            apiKeyInput.placeholder = '개인 API 키가 설정되어 있습니다';
        } else {
            // 기본 키는 마스킹하여 표시 (보안)
            const defaultKey = window.DEFAULT_API_KEY || '';
            if (defaultKey.length > 14) {
                apiKeyInput.value = '';
                apiKeyInput.placeholder = `기본 키 사용 중 (${defaultKey.substring(0, 10)}...)`;
            } else {
                apiKeyInput.value = '';
                apiKeyInput.placeholder = 'API 키를 입력하세요 (AIzaSy...)';
            }
        }
    });
    
    // 닫기 버튼
    settingsCloseBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });
    
    // 배경 클릭 시 닫기
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('show');
        }
    });
    
    // 저장 버튼
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey && apiKey !== '' && apiKey.startsWith('AIzaSy')) {
            window.saveUserApiKey(apiKey);
            // 전역 변수 즉시 업데이트 (페이지 새로고침 없이 적용)
            window.GEMINI_API_KEY = apiKey;
            alert('API 키가 저장되었습니다! 이제 개인 API 키를 사용합니다.');
            settingsModal.classList.remove('show');
        } else if (apiKey === '') {
            // 빈 값이면 기본 키로 전환
            if (confirm('빈 값으로 설정하면 기본 API 키를 사용합니다. 계속하시겠습니까?')) {
                if (typeof Storage !== 'undefined') {
                    localStorage.removeItem('chiko_api_key');
                }
                window.GEMINI_API_KEY = window.DEFAULT_API_KEY;
                alert('기본 API 키로 설정되었습니다.');
                settingsModal.classList.remove('show');
                location.reload(); // 설정 적용을 위해 새로고침
            }
        } else {
            alert('올바른 API 키 형식이 아닙니다. API 키는 "AIzaSy"로 시작해야 합니다.');
        }
    });
    
    // 기본 키 사용
    useDefaultBtn.addEventListener('click', () => {
        if (confirm('기본 API 키를 사용하시겠습니까? 저장된 개인 키는 삭제됩니다.')) {
            if (typeof Storage !== 'undefined') {
                localStorage.removeItem('chiko_api_key');
            }
            window.GEMINI_API_KEY = window.DEFAULT_API_KEY;
            alert('기본 키로 설정되었습니다.');
            settingsModal.classList.remove('show');
            location.reload(); // 설정 적용을 위해 새로고침
        }
    });
}

// 상태바 시간 업데이트
function updateStatusTime() {
    const timeElement = document.getElementById('statusTime');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// 메시지 전송
async function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;
    
    // 사용자 메시지 표시
    addMessage(message, 'user');
    chatInput.value = '';
    
    // 전송 버튼 비활성화
    sendBtn.disabled = true;
    sendBtn.textContent = '전송 중...';
    
    // 타이핑 인디케이터 표시
    const typingId = showTypingIndicator();
    
    // API 키 확인 (config.js에서 로드된 키 사용)
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        removeTypingIndicator(typingId);
        addMessage('⚠️ API 키가 설정되지 않았습니다.\n\n페이지를 새로고침하거나 설정에서 API 키를 입력해주세요.', 'bot');
        sendBtn.disabled = false;
        sendBtn.textContent = '전송';
        chatInput.focus();
        return;
    }
    
    try {
        // Gemini API 호출
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP 오류: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 타이핑 인디케이터 제거
        removeTypingIndicator(typingId);
        
        if (data.error) {
            throw new Error(data.error.message || 'API 오류가 발생했습니다.');
        }
        
        // 응답 메시지 추출
        const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          '응답을 받을 수 없었습니다.';
        
        // 봇 메시지 표시
        addMessage(botMessage, 'bot');
        
    } catch (error) {
        console.error('API 오류 상세:', error);
        console.error('API 키 상태:', GEMINI_API_KEY === 'YOUR_API_KEY_HERE' ? '미설정' : '설정됨');
        
        // 타이핑 인디케이터 제거
        removeTypingIndicator(typingId);
        
        // 상세한 오류 메시지 표시
        let errorMessage = '죄송합니다. 오류가 발생했습니다.';
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
            errorMessage = '❌ API 키가 유효하지 않습니다.\n\nGoogle AI Studio에서 올바른 API 키를 확인해주세요.';
        } else if (error.message.includes('403')) {
            errorMessage = '❌ API 접근 권한이 없습니다.\n\nAPI 키 권한을 확인해주세요.';
        } else if (error.message.includes('429')) {
            errorMessage = '⚠️ API 사용량 제한에 도달했습니다.\n\n잠시 후 다시 시도해주세요.';
        } else {
            errorMessage = `❌ 오류: ${error.message}\n\n개발자 도구 콘솔에서 자세한 오류를 확인할 수 있습니다.`;
        }
        
        addMessage(errorMessage, 'bot');
    } finally {
        // 전송 버튼 활성화
        sendBtn.disabled = false;
        sendBtn.textContent = '전송';
        chatInput.focus();
    }
}

// 메시지 추가
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const p = document.createElement('p');
    // 줄바꿈 처리
    p.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    
    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const indicatorId = 'typing-' + Date.now();
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = indicatorId;
    indicatorDiv.className = 'chat-message bot-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    contentDiv.appendChild(typingDiv);
    indicatorDiv.appendChild(contentDiv);
    chatMessages.appendChild(indicatorDiv);
    scrollToBottom();
    
    return indicatorId;
}

// 타이핑 인디케이터 제거
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// 스크롤을 하단으로
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

