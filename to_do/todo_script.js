// To Do 데이터 관리
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const todoDate = document.getElementById('todoDate');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const todoCount = document.getElementById('todoCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// 오늘 날짜를 기본값으로 설정
const today = new Date().toISOString().split('T')[0];
todoDate.value = today;

// 초기 렌더링
renderTodos();
updateStats();

// To Do 추가
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const text = todoInput.value.trim();
    const date = todoDate.value;

    if (text === '') {
        alert('To Do를 입력해주세요!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        date: date,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    updateStats();

    // 입력 필드 초기화
    todoInput.value = '';
    todoDate.value = today;
    todoInput.focus();
}

// To Do 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

// To Do 완료 토글
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
    updateStats();
}

// To Do 수정
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('To Do를 수정하세요:', todo.text);
    if (newText === null || newText.trim() === '') return;

    const newDate = prompt('날짜를 수정하세요 (YYYY-MM-DD):', todo.date);
    if (newDate === null) return;

    todos = todos.map(t => {
        if (t.id === id) {
            return { ...t, text: newText.trim(), date: newDate };
        }
        return t;
    });
    saveTodos();
    renderTodos();
    updateStats();
}

// 필터링
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

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

    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id})"
            />
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <span class="todo-date">
                    📅 ${formatDate(todo.date)}
                    ${isToday(todo.date) ? '<span style="color: #667eea; font-weight: bold;">(오늘)</span>' : ''}
                    ${isOverdue(todo.date) && !todo.completed ? '<span style="color: #dc3545; font-weight: bold;">(지난 날짜)</span>' : ''}
                </span>
            </div>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo(${todo.id})">수정</button>
                <button class="btn-delete" onclick="deleteTodo(${todo.id})">삭제</button>
            </div>
        </div>
    `).join('');
}

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

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    todoCount.textContent = `전체: ${total}`;
    activeCount.textContent = `활성: ${active}`;
    completedCount.textContent = `완료: ${completed}`;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = date - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    const formatted = date.toLocaleDateString('ko-KR', options);

    if (diffDays === 0) {
        return formatted;
    } else if (diffDays === 1) {
        return formatted + ' (내일)';
    } else if (diffDays === -1) {
        return formatted + ' (어제)';
    } else if (diffDays > 0) {
        return formatted + ` (${diffDays}일 후)`;
    } else {
        return formatted + ` (${Math.abs(diffDays)}일 전)`;
    }
}

// 오늘인지 확인
function isToday(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
}

// 지난 날짜인지 확인
function isOverdue(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 로컬 스토리지에 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 전역 함수로 등록 (인라인 이벤트 핸들러를 위해)
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.editTodo = editTodo;

