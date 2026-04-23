/* ── Greeting ── */
const STORAGE_KEY_NAME = 'dashboard_username';

function getStoredName() {
    return localStorage.getItem(STORAGE_KEY_NAME) || '';
}

function saveName(name) {
    localStorage.setItem(STORAGE_KEY_NAME, name);
}

function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)  return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
}

function formatDateTime(date) {
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const day  = days[date.getDay()];
    const d    = date.getDate();
    const mon  = months[date.getMonth()];
    const yr   = date.getFullYear();
    const h    = String(date.getHours()).padStart(2, '0');
    const m    = String(date.getMinutes()).padStart(2, '0');
    const s    = String(date.getSeconds()).padStart(2, '0');
    return `${day}, ${d} ${mon} ${yr} — ${h}:${m}:${s}`;
}

function updateGreeting() {
    const name = getStoredName();
    const greeting = getTimeGreeting();
    const greetingEl  = document.getElementById('greeting-text');
    const datetimeEl  = document.getElementById('datetime-text');

    greetingEl.textContent = name
        ? `${greeting}, ${name}! 👋`
        : `${greeting}! 👋`;

    datetimeEl.textContent = formatDateTime(new Date());
}

function handleSetName() {
    const input = document.getElementById('name-input');
    const name  = input.value.trim();
    if (name) {
        saveName(name);
        input.value = '';
        updateGreeting();
    }
}

// Allow pressing Enter to set name
document.getElementById('name-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSetName();
});

// Pre-fill input with stored name
(function initGreeting() {
    const stored = getStoredName();
    if (stored) {
        document.getElementById('name-input').value = stored;
    }
    updateGreeting();
    setInterval(updateGreeting, 1000);
})();


/* ── Focus Timer ── */
const TIMER_DURATION = 25 * 60; // 25 minutes in seconds

let timerInterval = null;
let timeLeft      = TIMER_DURATION;
let isRunning     = false;

function renderTimer() {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    document.getElementById('timer-display').textContent = `${mins}:${secs}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(function () {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            alert('⏰ Focus session complete! Take a break.');
            return;
        }
        timeLeft--;
        renderTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    stopTimer();
    timeLeft = TIMER_DURATION;
    renderTimer();
}

renderTimer();


/* ── To-Do List ── */
const STORAGE_KEY_TODOS = 'dashboard_todos';

function loadTodos() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_TODOS)) || [];
    } catch {
        return [];
    }
}

function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
}

function renderTodos() {
    const todos = loadTodos();
    const list  = document.getElementById('list-container');
    list.innerHTML = '';

    todos.forEach(function (todo, index) {
        const li = document.createElement('li');
        if (todo.done) li.classList.add('done');

        // ── View mode ──
        const viewDiv = document.createElement('div');
        viewDiv.className = 'task-view';

        const span = document.createElement('span');
        span.className   = 'task-text';
        span.textContent = todo.text;
        span.title       = 'Click to mark as done / undone';
        span.addEventListener('click', function () {
            toggleDone(index);
        });

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className   = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            // hide view, show edit
            viewDiv.style.display  = 'none';
            editDiv.style.display  = 'flex';
            editInput.focus();
            editInput.select();
        });

        const delBtn = document.createElement('button');
        delBtn.className   = 'btn-delete';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteTask(index);
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        viewDiv.appendChild(span);
        viewDiv.appendChild(actions);

        // ── Edit mode ──
        const editDiv = document.createElement('div');
        editDiv.className  = 'task-edit';
        editDiv.style.display = 'none';

        const editInput = document.createElement('input');
        editInput.type      = 'text';
        editInput.className = 'edit-input';
        editInput.value     = todo.text;

        const saveBtn = document.createElement('button');
        saveBtn.className   = 'btn-save';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            saveEdit(index, editInput.value);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.className   = 'btn-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            // restore view mode without saving
            editDiv.style.display  = 'none';
            viewDiv.style.display  = 'flex';
        });

        // Save on Enter, cancel on Escape
        editInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter')  saveEdit(index, editInput.value);
            if (e.key === 'Escape') {
                editDiv.style.display = 'none';
                viewDiv.style.display = 'flex';
            }
        });

        editDiv.appendChild(editInput);
        editDiv.appendChild(saveBtn);
        editDiv.appendChild(cancelBtn);

        li.appendChild(viewDiv);
        li.appendChild(editDiv);
        list.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById('input-box');
    const text  = input.value.trim();
    if (!text) return;

    const todos = loadTodos();
    todos.push({ text: text, done: false });
    saveTodos(todos);
    input.value = '';
    renderTodos();
}

function toggleDone(index) {
    const todos = loadTodos();
    todos[index].done = !todos[index].done;
    saveTodos(todos);
    renderTodos();
}

function saveEdit(index, newText) {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const todos = loadTodos();
    todos[index].text = trimmed;
    saveTodos(todos);
    renderTodos();
}

function deleteTask(index) {
    const todos = loadTodos();
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos();
}

// Allow pressing Enter to add a task
document.getElementById('input-box').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
});

renderTodos();
