// To Do 데이터 관리 (Firestore 버전)
let todos = [];
let currentFilter = 'all';
let unsubscribeTodos = null; // 실시간 리스너 구독 해제 함수

// DOM 요소 변수 (초기화 시 할당)
let todoInput, addBtn, todoList, filterBtns;

// Firestore 초기화 및 데이터 로드
function initFirestore() {
    // Firestore 실시간 리스너로 데이터 동기화
    // createdAt 필드로 정렬 시도 (인덱스가 필요할 수 있음)
    let query = db.collection('todos').orderBy('createdAt', 'desc');
    
    unsubscribeTodos = query.onSnapshot((snapshot) => {
        todos = [];
        snapshot.forEach((doc) => {
            const todo = {
                id: doc.id, // Firestore 문서 ID 사용
                ...doc.data()
            };
            todos.push(todo);
        });
        renderTodos();
        updateStats();
    }, (error) => {
        console.error('Firestore 오류:', error);
        // 인덱스 오류인 경우 정렬 없이 다시 시도
        if (error.code === 'failed-precondition') {
            console.warn('인덱스가 필요합니다. 정렬 없이 로드합니다.');
            // 인덱스 링크가 있으면 제공
            if (error.message && error.message.includes('index')) {
                const match = error.message.match(/https:\/\/[^\s]+/);
                if (match) {
                    console.log('인덱스 생성 링크:', match[0]);
                }
            }
            // 정렬 없이 다시 시도
            unsubscribeTodos = db.collection('todos').onSnapshot((snapshot) => {
                todos = [];
                snapshot.forEach((doc) => {
                    const todo = {
                        id: doc.id,
                        ...doc.data()
                    };
                    todos.push(todo);
                });
                // 클라이언트 측에서 정렬 (createdAt이 있는 경우)
                todos.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
                    return bTime - aTime;
                });
                renderTodos();
                updateStats();
            }, (err) => {
                console.error('Firestore 오류:', err);
                alert('데이터를 불러오는 중 오류가 발생했습니다.');
            });
        } else {
            alert('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        }
    });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    todoInput = document.getElementById('todoInput');
    addBtn = document.getElementById('addBtn');
    todoList = document.getElementById('todoList');
    filterBtns = document.querySelectorAll('.sub-tab');

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 필터링 이벤트 리스너
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // Firestore 초기화
    if (typeof useAuth === 'undefined' || !useAuth) {
        // 인증 사용 안 하는 경우 바로 초기화
        initFirestore();
    } else {
        // Firebase 인증 확인 후 초기화
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                initFirestore();
            } else {
                // 익명 인증 (선택사항)
                firebase.auth().signInAnonymously()
                    .then(() => {
                        console.log('익명 인증 완료');
                        initFirestore();
                    })
                    .catch((error) => {
                        console.error('인증 오류:', error);
                        alert('인증에 실패했습니다. 페이지를 새로고침해주세요.');
                    });
            }
        });
    }
});

async function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('To Do를 입력해주세요!');
        return;
    }

    const todo = {
        text: text,
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        description: '' // 상세내역
    };

    try {
        await db.collection('todos').add(todo);
        // 입력 필드 초기화
        todoInput.value = '';
        todoInput.focus();
    } catch (error) {
        console.error('추가 오류:', error);
        alert('To Do 추가 중 오류가 발생했습니다.');
    }
}

// To Do 삭제
async function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        await db.collection('todos').doc(id).delete();
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
}

// To Do 완료 토글
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        await db.collection('todos').doc(id).update({
            completed: !todo.completed
        });
    } catch (error) {
        console.error('업데이트 오류:', error);
        alert('상태 변경 중 오류가 발생했습니다.');
    }
}

// To Do 수정
async function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('To Do를 수정하세요:', todo.text);
    if (newText === null || newText.trim() === '') return;

    try {
        await db.collection('todos').doc(id).update({
            text: newText.trim()
        });
    } catch (error) {
        console.error('수정 오류:', error);
        alert('수정 중 오류가 발생했습니다.');
    }
}

// 필터링 이벤트는 DOMContentLoaded 내부로 이동됨

// To Do 렌더링
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p>${getEmptyMessage()}</p>
            </div>
        `;
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => {
        // Firestore Timestamp를 Date로 변환
        const createdAt = todo.createdAt?.toDate ? todo.createdAt.toDate().toISOString() : (todo.createdAt || new Date().toISOString());
        const todoId = todo.id; // Firestore 문서 ID

        return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo('${todoId}'); event.stopPropagation();"
                onclick="event.stopPropagation();"
            />
            <div class="todo-content" onclick="openDetail('${todoId}')" style="cursor: pointer; flex: 1;">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
            </div>
            <div class="todo-actions" onclick="event.stopPropagation();">
                <button class="btn-edit" onclick="editTodo('${todoId}'); event.stopPropagation();" title="수정">✎</button>
                <button class="btn-delete" onclick="deleteTodo('${todoId}'); event.stopPropagation();" title="삭제">🗑</button>
            </div>
        </div>
        `;
    }).join('');
}

// 상세 페이지 열기
function openDetail(id) {
    window.location.href = `todo-detail.html?id=${id}`;
}

// 전역 함수로 등록
window.openDetail = openDetail;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.editTodo = editTodo;

// 필터링된 To Do 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 빈 상태 메시지
function getEmptyMessage() {
    switch (currentFilter) {
        case 'active':
            return '활성화된 To Do가 없습니다.';
        case 'completed':
            return '완료된 To Do가 없습니다.';
        default:
            return 'To Do를 추가해보세요!';
    }
}

// 통계 업데이트 함수
function updateStats() {
    // 필요시 통계 업데이트
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 페이지 종료 시 리스너 해제
window.addEventListener('beforeunload', () => {
    if (unsubscribeTodos) {
        unsubscribeTodos();
    }
});

