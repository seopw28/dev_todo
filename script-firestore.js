// To Do 데이터 관리 (Firestore 버전)
let todos = [];
let currentFilter = 'active'; // 기본값을 'active'로 변경
let unsubscribeTodos = null; // 실시간 리스너 구독 해제 함수

// DOM 요소 변수 (초기화 시 할당)
let todoInput, addBtn, todoList, filterBtns;

// 렌더링 최적화를 위한 debounce 및 캐시
let renderTimeout = null;
let lastRenderedHTML = ''; // 마지막으로 렌더링된 HTML 캐시

// 커스텀 모달 함수 (Promise 기반)
function showModal(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('show');
        
        const handleConfirm = () => {
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            document.body.style.overflow = ''; // 스크롤 복구
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            document.body.style.overflow = ''; // 스크롤 복구
            resolve(false);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        
        // 배경 클릭 시 취소
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                handleCancel();
            }
        });
        
        // ESC 키로 취소
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // 모달이 닫힐 때 ESC 리스너 제거
        const observer = new MutationObserver(() => {
            if (!modal.classList.contains('show')) {
                document.removeEventListener('keydown', handleEsc);
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    });
}

// 입력 모달 함수 (Promise 기반)
function showInputModal(title, label, defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('inputModal');
        const modalTitle = document.getElementById('inputModalTitle');
        const modalLabel = document.getElementById('inputModalLabel');
        const inputField = document.getElementById('inputModalField');
        const confirmBtn = document.getElementById('inputModalConfirmBtn');
        const cancelBtn = document.getElementById('inputModalCancelBtn');
        
        modalTitle.textContent = title;
        modalLabel.textContent = label;
        inputField.value = defaultValue;
        inputField.placeholder = label;
        modal.classList.add('show');
        
        // 입력 필드 포커스 및 텍스트 선택
        setTimeout(() => {
            inputField.focus();
            inputField.select();
        }, 100);
        
        const handleConfirm = () => {
            const value = inputField.value.trim();
            if (value === '') {
                alert('내용을 입력해주세요.');
                return;
            }
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            inputField.removeEventListener('keydown', handleEnter);
            document.body.style.overflow = ''; // 스크롤 복구
            resolve(value);
        };
        
        const handleCancel = () => {
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            inputField.removeEventListener('keydown', handleEnter);
            document.body.style.overflow = ''; // 스크롤 복구
            resolve(null);
        };
        
        // Enter 키로 확인
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
            }
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        inputField.addEventListener('keydown', handleEnter);
        
        // 배경 클릭 시 취소
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                handleCancel();
            }
        });
        
        // ESC 키로 취소
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // 모달이 닫힐 때 ESC 리스너 제거
        const observer = new MutationObserver(() => {
            if (!modal.classList.contains('show')) {
                document.removeEventListener('keydown', handleEsc);
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    });
}

// 토스트 팝업 함수 (자동으로 사라짐)
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastCloseBtn = document.getElementById('toastCloseBtn');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // 수동으로 닫기
    const handleClose = () => {
        toast.classList.remove('show');
        toastCloseBtn.removeEventListener('click', handleClose);
    };
    
    toastCloseBtn.addEventListener('click', handleClose);
    
    // 자동으로 닫기 (1.2초 후)
    setTimeout(() => {
        if (toast.classList.contains('show')) {
            toast.classList.remove('show');
            toastCloseBtn.removeEventListener('click', handleClose);
        }
    }, duration);
}

// Firestore 초기화 및 데이터 로드
function initFirestore() {
    // Firestore 실시간 리스너로 데이터 동기화
    // order 필드가 있으면 order로 정렬, 없으면 createdAt으로 정렬
    let query = db.collection('todos');
    
    unsubscribeTodos = query.onSnapshot((snapshot) => {
        todos = [];
        snapshot.forEach((doc) => {
            const todo = {
                id: doc.id, // Firestore 문서 ID 사용
                ...doc.data()
            };
            todos.push(todo);
        });
        // 클라이언트 측에서 정렬 (order가 있으면 order 우선, 없으면 createdAt)
        todos.sort((a, b) => {
            // order 필드가 있으면 order 우선
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            if (a.order !== undefined) return -1; // order가 있는 항목을 앞으로
            if (b.order !== undefined) return 1;
            // 둘 다 order가 없으면 createdAt으로 정렬
            const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
            return bTime - aTime;
        });
        debouncedRenderTodos();
        updateStats();
    }, (error) => {
        console.error('Firestore 오류:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        
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
                // 클라이언트 측에서 정렬 (order가 있으면 order 우선, 없으면 createdAt)
                todos.sort((a, b) => {
                    // order 필드가 있으면 order 우선
                    if (a.order !== undefined && b.order !== undefined) {
                        return a.order - b.order;
                    }
                    // createdAt으로 정렬
                    const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
                    return bTime - aTime;
                });
                debouncedRenderTodos();
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
        showToast('To Do를 입력해주세요!', 2000);
        return;
    }

    // 현재 todos 개수를 order로 사용 (새 항목은 맨 아래)
    const currentOrder = todos.length;
    
    const todo = {
        text: text,
        completed: false,
        deleted: false, // 삭제 여부 (휴지통 관리)
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        order: currentOrder // 순서 필드 추가
        // description은 선택사항이므로 나중에 추가
    };

    try {
        const docRef = await db.collection('todos').add(todo);
        console.log('To Do 추가 완료:', docRef.id);
        // 입력 필드 초기화
        todoInput.value = '';
        todoInput.focus();
    } catch (error) {
        console.error('추가 오류 상세:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        
        // 더 자세한 에러 메시지 제공
        let errorMessage = 'To Do 추가 중 오류가 발생했습니다.';
        if (error.code === 'permission-denied') {
            errorMessage += '\n\n권한 오류입니다. Firestore 규칙을 확인해주세요.';
        } else if (error.code === 'unavailable') {
            errorMessage += '\n\n네트워크 오류입니다. 인터넷 연결을 확인해주세요.';
        } else {
            errorMessage += `\n\n오류: ${error.message || error.code || '알 수 없는 오류'}`;
        }
        alert(errorMessage);
    }
}

// To Do 삭제 (휴지통으로 이동)
async function deleteTodo(id) {
    // 할일 탭에서는 확인 없이 바로 휴지통으로 이동
    // 휴지통 탭에서는 확인 후 완전 삭제
    
    if (currentFilter === 'trash') {
        // 휴지통 탭에서는 완전 삭제
        const confirmed = await showModal('완전 삭제', '정말 완전히 삭제하시겠습니까?');
        if (!confirmed) return;
        
        try {
            await db.collection('todos').doc(id).delete();
        } catch (error) {
            console.error('완전 삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    } else {
        // 할일/완료 탭에서는 휴지통으로 이동 (확인 없이)
        try {
            await db.collection('todos').doc(id).update({
                deleted: true,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('휴지통 이동 오류:', error);
            alert('휴지통으로 이동 중 오류가 발생했습니다.');
        }
    }
}

// 휴지통 비우기 (모든 삭제된 항목 완전 삭제)
async function emptyTrash() {
    const confirmed = await showModal(
        '휴지통 비우기', 
        '휴지통의 모든 항목을 완전히 삭제하시겠습니까?'
    );
    if (!confirmed) {
        return;
    }
    
    try {
        const deletedTodos = todos.filter(todo => todo.deleted === true);
        const batch = db.batch();
        
        deletedTodos.forEach(todo => {
            const todoRef = db.collection('todos').doc(todo.id);
            batch.delete(todoRef);
        });
        
        await batch.commit();
        showToast(`${deletedTodos.length}개의 항목이 완전히 삭제되었습니다.`);
    } catch (error) {
        console.error('휴지통 비우기 오류:', error);
        alert('휴지통 비우기 중 오류가 발생했습니다.');
    }
}

// To Do 완료 토글
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    // 휴지통에 있는 항목은 완료 상태 변경 불가
    if (todo.deleted) return;

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
    
    // 휴지통에 있는 항목은 수정 불가
    if (todo.deleted) {
        alert('휴지통에 있는 항목은 수정할 수 없습니다.');
        return;
    }

    // 커스텀 입력 모달 사용
    const newText = await showInputModal('To Do 수정', 'To Do를 수정하세요:', todo.text);
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

// 렌더링 debounce 함수 (연속된 렌더링 요청을 묶어서 처리)
function debouncedRenderTodos() {
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }
    renderTimeout = setTimeout(() => {
        renderTodos();
        renderTimeout = null;
    }, 50); // 50ms 내의 연속된 렌더링 요청을 묶음
}

// To Do 렌더링
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    let newHTML = '';
    
    if (filteredTodos.length === 0) {
        newHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p>${getEmptyMessage()}</p>
                ${currentFilter === 'trash' ? '<button class="btn-empty-trash" onclick="emptyTrash()" style="display: none;">휴지통 비우기</button>' : ''}
            </div>
        `;
    } else {
        // 휴지통 탭에서만 비우기 버튼 표시
        let emptyTrashButton = '';
        if (currentFilter === 'trash' && filteredTodos.length > 0) {
            emptyTrashButton = `
                <div class="trash-actions" style="margin-bottom: 20px; text-align: center;">
                    <button class="btn-empty-trash" onclick="emptyTrash()">휴지통 비우기</button>
                </div>
            `;
        }

        newHTML = emptyTrashButton + filteredTodos.map((todo, index) => {
        // Firestore Timestamp를 Date로 변환
        const createdAt = todo.createdAt?.toDate ? todo.createdAt.toDate().toISOString() : (todo.createdAt || new Date().toISOString());
        const todoId = todo.id; // Firestore 문서 ID

        // 휴지통 탭에서는 체크박스와 수정 버튼 숨김
        const isTrash = currentFilter === 'trash';
        
        return `
        <div class="todo-item ${todo.completed ? 'completed' : ''} ${isTrash ? 'trash-item' : ''}" 
             data-todo-id="${todoId}"
             data-index="${index}">
            ${!isTrash ? `<input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo('${todoId}'); event.stopPropagation();"
                onclick="event.stopPropagation();"
            />` : '<div style="width: 22px;"></div>'}
            <div class="todo-content" style="cursor: pointer; flex: 1;">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
            </div>
            <div class="todo-actions" onclick="event.stopPropagation();">
                ${!isTrash ? `<button class="btn-edit" onclick="editTodo('${todoId}'); event.stopPropagation();" title="수정">✎</button>` : ''}
                <button class="btn-delete" onclick="deleteTodo('${todoId}'); event.stopPropagation();" title="${isTrash ? '완전 삭제' : '휴지통으로'}">🗑</button>
            </div>
        </div>
        `;
        }).join('');
    }
    
    // HTML이 변경된 경우에만 DOM 업데이트 (불필요한 리플로우 방지)
    if (newHTML !== lastRenderedHTML) {
        // requestAnimationFrame을 사용하여 브라우저 렌더링 사이클에 맞춤
        requestAnimationFrame(() => {
            todoList.innerHTML = newHTML;
            lastRenderedHTML = newHTML;
            // 상세 페이지 열기 이벤트 설정
            setupTodoClickEvents();
        });
    }
}

// 상세 페이지 열기
function openDetail(id) {
    window.location.href = `todo-detail.html?id=${id}`;
}

// 상세 페이지 열기 이벤트 설정 (드래그 앤 드롭 기능 제거)
function setupTodoClickEvents() {
    const items = todoList.querySelectorAll('.todo-item');
    
    items.forEach((item) => {
        // todo-content 클릭 시 상세 페이지로 이동
        const content = item.querySelector('.todo-content');
        if (content) {
            content.addEventListener('click', (e) => {
                // 체크박스나 액션 버튼 클릭은 무시
                if (e.target.closest('.todo-checkbox, .todo-actions, .btn-edit, .btn-delete')) {
                    return;
                }
                const todoId = item.dataset.todoId;
                openDetail(todoId);
            });
        }
    });
}

// 전역 함수로 등록
window.openDetail = openDetail;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.editTodo = editTodo;
window.emptyTrash = emptyTrash;

// 필터링된 To Do 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed && !todo.deleted);
        case 'completed':
            return todos.filter(todo => todo.completed && !todo.deleted);
        case 'trash':
            return todos.filter(todo => todo.deleted === true);
        default:
            return todos.filter(todo => !todo.deleted);
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

// 드래그 앤 드롭 기능 제거됨 (사용하지 않음)
/*
function setupDragAndDrop() {
    const items = todoList.querySelectorAll('.todo-item');
    let draggedElement = null;
    let draggedTodoId = null;
    let draggedIndex = null;

    items.forEach((item) => {
        const todoId = item.dataset.todoId;
        let isDragging = false;
        
        // 드래그 시작 (마우스 누르고 움직이기 시작)
        item.addEventListener('mousedown', (e) => {
            // 체크박스, 버튼 클릭 시 드래그 방지
            if (e.target.closest('.todo-checkbox, .todo-actions, .btn-edit, .btn-delete')) {
                return;
            }
            isDragging = false;
            const startY = e.clientY;
            const startX = e.clientX;
            
            const handleMouseMove = (moveEvent) => {
                const deltaY = Math.abs(moveEvent.clientY - startY);
                const deltaX = Math.abs(moveEvent.clientX - startX);
                // 5px 이상 움직이면 드래그로 간주
                if (deltaY > 5 || deltaX > 5) {
                    isDragging = true;
                    item.draggable = true;
                    document.removeEventListener('mousemove', handleMouseMove);
                }
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                // 드래그가 아니었다면 상세 페이지로 이동
                if (!isDragging && e.target.closest('.todo-content')) {
                    const content = e.target.closest('.todo-content');
                    if (content) {
                        const clickedTodoId = item.dataset.todoId;
                        openDetail(clickedTodoId);
                    }
                }
                isDragging = false;
                item.draggable = true; // 기본값으로 유지
            };
            
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        // 드래그 시작
        item.addEventListener('dragstart', (e) => {
            // 체크박스, 버튼에서 드래그 시작 방지
            if (e.target.closest('.todo-checkbox, .todo-actions, .btn-edit, .btn-delete')) {
                e.preventDefault();
                return false;
            }
            
            draggedElement = item;
            draggedTodoId = todoId;
            draggedIndex = Array.from(items).indexOf(item);
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', todoId);
        });

        // 드래그 종료
        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            // 모든 drag-over 클래스 제거
            items.forEach(el => el.classList.remove('drag-over'));
        });

        // 드래그 오버 (항목 위로 마우스 이동)
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (item !== draggedElement) {
                item.classList.add('drag-over');
            }
        });

        // 드래그 엔터
        item.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (item !== draggedElement) {
                item.classList.add('drag-over');
            }
        });

        // 드래그 리브
        item.addEventListener('dragleave', (e) => {
            item.classList.remove('drag-over');
        });

        // 드롭
        item.addEventListener('drop', async (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            
            if (draggedElement && draggedElement !== item && draggedTodoId) {
                const filteredTodos = getFilteredTodos();
                const currentIndex = filteredTodos.findIndex(t => t.id === draggedTodoId);
                const dropIndex = filteredTodos.findIndex(t => t.id === item.dataset.todoId);
                
                if (currentIndex !== -1 && dropIndex !== -1 && currentIndex !== dropIndex) {
                    await reorderTodos(currentIndex, dropIndex);
                }
            }
        });
    });
}
*/

// To Do 순서 변경 기능 제거됨 (사용하지 않음)
/*
async function reorderTodos(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    const filteredTodos = getFilteredTodos();
    const [movedTodo] = filteredTodos.splice(fromIndex, 1);
    filteredTodos.splice(toIndex, 0, movedTodo);
    
    try {
        // Firestore에 order 필드 저장 (순서 유지)
        // 각 항목에 order 값을 업데이트
        const batch = db.batch();
        
        filteredTodos.forEach((todo, index) => {
            const todoRef = db.collection('todos').doc(todo.id);
            batch.update(todoRef, {
                order: index,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        console.log('순서 변경 완료:', fromIndex, '->', toIndex);
    } catch (error) {
        console.error('순서 변경 오류:', error);
        alert('순서 변경 중 오류가 발생했습니다.');
    }
}
*/

// 페이지 종료 시 리스너 해제
window.addEventListener('beforeunload', () => {
    if (unsubscribeTodos) {
        unsubscribeTodos();
    }
});

