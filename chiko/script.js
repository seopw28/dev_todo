// Gemini API 설정
// config.js에서 API 키를 로드합니다 (GitHub Pages 배포용)
// API URL은 메시지 전송 시 동적으로 생성됩니다
function getGeminiApiUrl() {
    // localStorage에서 개인 키 먼저 확인, 없으면 기본 키 사용
    const apiKey = window.GEMINI_API_KEY || window.DEFAULT_API_KEY || 'YOUR_API_KEY_HERE';
    // gemini-2.5-flash: 더 빠르고 최신 모델 (Python 예제와 동일)
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
}

// DOM 요소
let chatInput, sendBtn, chatMessages;

// 현재 선택된 캐릭터 모드
let currentCharacter = window.DEFAULT_CHARACTER || 'friend';

// 각 캐릭터별 채팅 히스토리 저장소
const CHAT_HISTORY_KEY_PREFIX = 'chiko_chat_history_';

// 채팅 히스토리 가져오기
function getChatHistory(characterId) {
    const key = CHAT_HISTORY_KEY_PREFIX + characterId;
    const historyJson = localStorage.getItem(key);
    if (historyJson) {
        try {
            return JSON.parse(historyJson);
        } catch (e) {
            console.error('채팅 히스토리 파싱 오류:', e);
            return [];
        }
    }
    return [];
}

// 채팅 히스토리 저장하기
function saveChatHistory(characterId, history) {
    const key = CHAT_HISTORY_KEY_PREFIX + characterId;
    localStorage.setItem(key, JSON.stringify(history));
}

// 채팅 히스토리에 메시지 추가
function addToChatHistory(characterId, message, type, timestamp = null) {
    const history = getChatHistory(characterId);
    history.push({
        text: message,
        type: type, // 'user' or 'bot'
        timestamp: timestamp || Date.now()
    });
    // 최근 100개 메시지만 유지 (용량 관리)
    if (history.length > 100) {
        history.shift();
    }
    saveChatHistory(characterId, history);
}

// 채팅 화면에 히스토리 표시
function renderChatHistory(characterId) {
    const history = getChatHistory(characterId);
    chatMessages.innerHTML = ''; // 기존 메시지 초기화
    
    if (history.length === 0) {
        // 히스토리가 없으면 인사 메시지만 표시
        const greetingMessages = {
            'lover': '안녕 자기야~ 오늘도 내가 여기 있어 💕',
            'secretary': '안녕하십니다. 충실한 비서 치코입니다. 무엇을 도와드릴까요?',
            'doctor': '안녕하세요. 치코 의사입니다. 건강 관련하여 무엇을 도와드릴까요?',
            'friend': '야 안녕! 뭐하고 있었어? 😊'
        };
        
        const greeting = greetingMessages[characterId] || greetingMessages['friend'];
        addMessageToDOM(greeting, 'bot', Date.now());
    } else {
        // 히스토리 메시지 모두 표시 (timestamp 포함)
        history.forEach(msg => {
            addMessageToDOM(msg.text, msg.type, msg.timestamp);
        });
    }
    
    scrollToBottom();
}

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
    
    // 캐릭터 선택 UI 생성
    setupCharacterSelector();
    
    // 저장된 캐릭터 선택 복원
    const savedCharacter = localStorage.getItem('chiko_character');
    if (savedCharacter && window.CHIKO_CHARACTERS[savedCharacter]) {
        currentCharacter = savedCharacter;
        updateCharacterSelector();
    }
    
    // 초기 배경 적용
    updateChatBackground(currentCharacter);
    
    // 현재 캐릭터의 채팅 히스토리 로드 및 표시
    renderChatHistory(currentCharacter);
    
    // 상태바 시간 업데이트
    updateStatusTime();
    setInterval(updateStatusTime, 1000);
    
    // 채팅 메시지 스크롤을 하단으로
    scrollToBottom();
});

// 캐릭터 선택 UI 생성
function setupCharacterSelector() {
    const selector = document.getElementById('characterSelector');
    if (!selector || !window.CHIKO_CHARACTERS) return;
    
    selector.innerHTML = '';
    
    // 순서대로: 연인, 비서, 의사, 친구
    const characterOrder = ['lover', 'secretary', 'doctor', 'friend'];
    
    characterOrder.forEach(characterId => {
        const character = window.CHIKO_CHARACTERS[characterId];
        if (!character) return;
        const item = document.createElement('div');
        item.className = 'character-item';
        item.dataset.characterId = character.id;
        
        if (character.id === currentCharacter) {
            item.classList.add('active');
        }
        
        // Font Awesome 아이콘으로 변환
        const iconMap = {
            '💕': '<i class="fas fa-heart"></i>',
            '📋': '<i class="fas fa-clipboard"></i>',
            '👨‍⚕️': '<i class="fas fa-user-doctor"></i>',
            '🤝': '<i class="fas fa-handshake"></i>'
        };
        
        const iconHtml = iconMap[character.icon] || `<span class="character-icon">${character.icon}</span>`;
        
        item.innerHTML = `
            <span class="character-icon">${iconHtml}</span>
            <span class="character-name">${character.name}</span>
        `;
        
        item.addEventListener('click', () => {
            selectCharacter(character.id);
        });
        
        selector.appendChild(item);
    });
}

// 캐릭터 선택 업데이트
function updateCharacterSelector() {
    const items = document.querySelectorAll('.character-item');
    items.forEach(item => {
        if (item.dataset.characterId === currentCharacter) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 현재 선택된 캐릭터의 프롬프트 가져오기
function getCurrentCharacterInstruction() {
    if (window.CHIKO_CHARACTERS && window.CHIKO_CHARACTERS[currentCharacter]) {
        return window.CHIKO_CHARACTERS[currentCharacter].instruction;
    }
    // 기본값
    return window.CHIKO_SYSTEM_INSTRUCTION || '당신은 "치코"라는 이름의 친근한 AI 어시스턴트입니다.';
}

// 채팅 배경 업데이트
function updateChatBackground(characterId) {
    const chatMessagesEl = document.getElementById('chatMessages');
    if (!chatMessagesEl) return;
    
    // 기존 배경 클래스 제거
    chatMessagesEl.classList.remove('bg-lover', 'bg-secretary', 'bg-doctor', 'bg-friend');
    
    // 새로운 배경 클래스 추가
    const backgroundMap = {
        'lover': 'bg-lover',
        'secretary': 'bg-secretary',
        'doctor': 'bg-doctor',
        'friend': 'bg-friend'
    };
    
    const bgClass = backgroundMap[characterId];
    if (bgClass) {
        chatMessagesEl.classList.add(bgClass);
    }
}

// 캐릭터 선택
function selectCharacter(characterId) {
    if (!window.CHIKO_CHARACTERS[characterId]) return;
    
    currentCharacter = characterId;
    localStorage.setItem('chiko_character', characterId);
    updateCharacterSelector();
    
    // 배경 변경
    updateChatBackground(characterId);
    
    // 선택된 캐릭터의 채팅 히스토리 로드 및 표시
    renderChatHistory(characterId);
}

// 설정 모달 기능 제거됨 - API 키는 사용자에게 노출되지 않음

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
    
    // 사용자 메시지 표시 및 히스토리 저장
    const userTimestamp = Date.now();
    addMessageToDOM(message, 'user', userTimestamp);
    addToChatHistory(currentCharacter, message, 'user', userTimestamp);
    chatInput.value = '';
    
    // 전송 버튼 비활성화
    sendBtn.disabled = true;
    sendBtn.textContent = '전송 중...';
    
    // 타이핑 인디케이터 표시
    const typingId = showTypingIndicator();
    
    // API 키 확인 및 URL 생성 (동적으로 가져옴)
    const apiKey = window.GEMINI_API_KEY || window.DEFAULT_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        removeTypingIndicator(typingId);
        const errorMsg = '⚠️ API 키가 설정되지 않았습니다.\n\n페이지를 새로고침하거나 설정에서 API 키를 입력해주세요.';
        const errorTimestamp = Date.now();
        addMessageToDOM(errorMsg, 'bot', errorTimestamp);
        addToChatHistory(currentCharacter, errorMsg, 'bot', errorTimestamp);
        sendBtn.disabled = false;
        sendBtn.textContent = '전송';
        chatInput.focus();
        return;
    }
    
    // API URL 동적 생성
    const apiUrl = getGeminiApiUrl();
    
    try {
        // 현재 캐릭터의 전체 대화 히스토리 가져오기
        const history = getChatHistory(currentCharacter);
        
        // Gemini API 형식에 맞게 대화 내용 변환 (최근 20개만 사용, 너무 길면 제한)
        const conversationHistory = history.slice(-20).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        
        // Gemini API 호출
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: getCurrentCharacterInstruction()
                    }]
                },
                contents: conversationHistory
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
        
        // 봇 메시지 표시 및 히스토리 저장
        const botTimestamp = Date.now();
        addMessageToDOM(botMessage, 'bot', botTimestamp);
        addToChatHistory(currentCharacter, botMessage, 'bot', botTimestamp);
        
    } catch (error) {
        console.error('API 오류 상세:', error);
        console.error('API 키 상태:', apiKey === 'YOUR_API_KEY_HERE' ? '미설정' : '설정됨');
        
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
        
        const errorTimestamp = Date.now();
        addMessageToDOM(errorMessage, 'bot', errorTimestamp);
        addToChatHistory(currentCharacter, errorMessage, 'bot', errorTimestamp);
    } finally {
        // 전송 버튼 활성화
        sendBtn.disabled = false;
        sendBtn.textContent = '전송';
        chatInput.focus();
    }
}

// DOM에 메시지 추가 (히스토리 저장 없이 표시만)
function addMessageToDOM(text, type, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    // 타임스탬프가 없으면 현재 시간 사용
    const msgTimestamp = timestamp || Date.now();
    messageDiv.dataset.messageId = msgTimestamp;
    messageDiv.dataset.messageType = type;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const p = document.createElement('p');
    // 줄바꿈 처리
    p.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    
    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    
    // 사용자 메시지와 봇 메시지 모두 길게 누르기로 삭제 가능
    setupLongPressDelete(messageDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 기존 함수 호환성 유지 (deprecated, addMessageToDOM 사용 권장)
function addMessage(text, type) {
    addMessageToDOM(text, type);
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

// 길게 누르기로 메시지 삭제 기능
function setupLongPressDelete(messageElement) {
    let pressTimer = null;
    let isLongPress = false;
    const LONG_PRESS_DURATION = 700; // 0.7초
    
    // 터치 이벤트 (모바일)
    messageElement.addEventListener('touchstart', (e) => {
        isLongPress = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            // 햅틱 피드백 (지원되는 경우)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            // 삭제 확인 모달 표시
            showDeleteConfirmModal(messageElement);
        }, LONG_PRESS_DURATION);
    }, { passive: true });
    
    messageElement.addEventListener('touchend', (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
        }
        if (isLongPress) {
            e.preventDefault();
        }
    }, { passive: false });
    
    messageElement.addEventListener('touchmove', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
        }
    }, { passive: true });
    
    // 마우스 이벤트 (데스크톱)
    messageElement.addEventListener('mousedown', (e) => {
        isLongPress = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            // 삭제 확인 모달 표시
            showDeleteConfirmModal(messageElement);
        }, LONG_PRESS_DURATION);
    });
    
    messageElement.addEventListener('mouseup', (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
        }
    });
    
    messageElement.addEventListener('mouseleave', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
        }
    });
    
    // 클릭 이벤트는 길게 누르기가 아닌 경우에만 발생
    messageElement.addEventListener('click', (e) => {
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// 삭제 확인 모달 표시
function showDeleteConfirmModal(messageElement) {
    const modal = document.getElementById('deleteConfirmModal');
    if (!modal) {
        console.error('삭제 확인 모달을 찾을 수 없습니다.');
        return;
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    
    const confirmBtn = document.getElementById('deleteConfirmBtn');
    const cancelBtn = document.getElementById('deleteCancelBtn');
    const resetBtn = document.getElementById('deleteResetBtn');
    
    // 기존 이벤트 리스너 제거를 위해 새 핸들러 함수 생성
    const handleConfirm = () => {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // 스크롤 복구
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        resetBtn.onclick = null;
        modal.onclick = null;
        // 실제 삭제 실행
        deleteMessage(messageElement);
    };
    
    const handleCancel = () => {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // 스크롤 복구
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        resetBtn.onclick = null;
        modal.onclick = null;
    };
    
    const handleReset = () => {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // 스크롤 복구
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        resetBtn.onclick = null;
        modal.onclick = null;
        // 채팅방 초기화 실행
        resetChatRoom();
    };
    
    // 이벤트 리스너 설정 (onclick 사용으로 간단하게)
    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = handleCancel;
    resetBtn.onclick = handleReset;
    
    // 배경 클릭 시 취소
    modal.onclick = (e) => {
        if (e.target === modal) {
            handleCancel();
        }
    };
}

// 채팅방 초기화 함수
function resetChatRoom() {
    // 현재 캐릭터의 채팅 히스토리 초기화
    const key = CHAT_HISTORY_KEY_PREFIX + currentCharacter;
    localStorage.removeItem(key);
    
    // 화면 초기화 (인사 메시지만 표시)
    renderChatHistory(currentCharacter);
}

// 메시지 삭제 함수
function deleteMessage(messageElement) {
    const messageId = messageElement.dataset.messageId;
    const messageType = messageElement.dataset.messageType;
    
    // 사용자 메시지와 봇 메시지 모두 삭제 가능
    
    if (!messageId) {
        console.error('메시지 ID를 찾을 수 없습니다.');
        return;
    }
    
    // localStorage에서 메시지 제거
    const history = getChatHistory(currentCharacter);
    const filteredHistory = history.filter(msg => {
        // timestamp를 숫자로 비교 (localStorage에서 불러올 때 문자열일 수 있음)
        return String(msg.timestamp) !== String(messageId);
    });
    
    // 변경사항이 있으면 저장
    if (filteredHistory.length !== history.length) {
        saveChatHistory(currentCharacter, filteredHistory);
        
        // DOM에서 제거 (시각적 피드백)
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateX(20px)';
        messageElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }
}

