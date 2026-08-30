// State variables
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskInput = document.getElementById('task-input');
const taskPriority = document.getElementById('task-priority');
const addTaskBtn = document.getElementById('add-task-btn');
const validationMsg = document.getElementById('validation-msg');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.btn-filter');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const totalTasksEl = document.getElementById('total-tasks');
const activeTasksEl = document.getElementById('active-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const toast = document.getElementById('toast');
const themeMenuBtn = document.getElementById('theme-menu-btn');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');

// Category, Due Date, Sort, and Progress Elements
const taskCategory = document.getElementById('task-category');
const taskDate = document.getElementById('task-date');
const sortSelect = document.getElementById('sort-select');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercent = document.getElementById('progress-percent');

// Custom Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

let modalResolver = null;

// ==========================================
// CUSTOM MODAL CONFIRM SYSTEM
// ==========================================

function showConfirm(title, message) {
    if (!confirmModal || !modalTitle || !modalMessage) {
        return Promise.resolve(confirm(message));
    }
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmModal.classList.remove('hidden');
    confirmModal.offsetHeight;
    confirmModal.classList.add('show');

    return new Promise((resolve) => {
        modalResolver = resolve;
    });
}

function hideConfirm(result) {
    if (!confirmModal) return;
    confirmModal.classList.remove('show');
    setTimeout(() => {
        confirmModal.classList.add('hidden');
        if (modalResolver) {
            modalResolver(result);
            modalResolver = null;
        }
    }, 250);
}

if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', () => hideConfirm(true));
if (modalCancelBtn) modalCancelBtn.addEventListener('click', () => hideConfirm(false));
if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) hideConfirm(false);
    });
}

// ==========================================
// LOCAL STORAGE FUNCTIONS (SYNCED)
// ==========================================

function loadTasks() {
    const storedTasks = localStorage.getItem('anmol-todo-tasks') || localStorage.getItem('todoTasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (e) {
            console.error('Error parsing stored tasks:', e);
            tasks = [];
        }
    }
}

function saveTasks() {
    const serialized = JSON.stringify(tasks);
    localStorage.setItem('anmol-todo-tasks', serialized);
    localStorage.setItem('todoTasks', serialized);
}

// ==========================================
// CORE TASK FUNCTIONS
// ==========================================

function addTask() {
    const title = taskInput.value.trim();

    if (title === '') {
        if (validationMsg) validationMsg.textContent = 'Please enter a task title.';
        showNotification('Task title cannot be empty.');
        return;
    }

    if (validationMsg) validationMsg.textContent = '';

    const newTask = {
        id: Date.now().toString(),
        title: title,
        completed: false,
        priority: taskPriority ? taskPriority.value : 'medium',
        category: taskCategory ? taskCategory.value : 'Work',
        dueDate: taskDate && taskDate.value ? taskDate.value : null,
        createdAt: new Date().toISOString(),
        updatedAt: null
    };

    tasks.push(newTask);
    saveTasks();
    
    if (taskInput) taskInput.value = '';
    if (taskDate) taskDate.value = '';
    if (taskPriority) taskPriority.value = 'medium';
    if (taskCategory) taskCategory.value = 'Work';
    
    renderTasks();
    showNotification('Task added successfully.');
}

async function deleteTask(id) {
    const confirmDelete = await showConfirm('Delete Task', 'Are you sure you want to delete this task? This action cannot be undone.');
    if (confirmDelete) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        showNotification('Task deleted.');
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
    }
}

function editTask(id) {
    const taskItem = document.querySelector(`[data-id="${id}"]`);
    if (!taskItem) return;

    const titleSpan = taskItem.querySelector('.task-title');
    if (!titleSpan) return;

    const currentTitle = titleSpan.textContent;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentTitle;
    editInput.className = 'edit-input';

    titleSpan.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    let isSaved = false;

    const saveChanges = () => {
        if (isSaved) return;
        isSaved = true;

        const newTitle = editInput.value.trim();
        if (newTitle === '') {
            showNotification('Task title cannot be empty.');
            renderTasks();
            return;
        }
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.title = newTitle;
            task.updatedAt = new Date().toISOString();
            saveTasks();
        }
        renderTasks();
        showNotification('Task updated.');
    };

    const cancelEdit = () => {
        if (isSaved) return;
        isSaved = true;
        renderTasks();
    };

    editInput.addEventListener('blur', saveChanges);
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveChanges();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
}

async function clearCompleted() {
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) {
        showNotification('No completed tasks to clear.');
        return;
    }

    const confirmClear = await showConfirm('Clear Completed', `Are you sure you want to clear all ${completedTasks.length} completed task(s)?`);
    if (confirmClear) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        showNotification('Completed tasks cleared.');
    }
}

// ==========================================
// RENDERING & UI FUNCTIONS
// ==========================================

function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = '';

    let filteredTasks = [...tasks];

    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (searchQuery !== '') {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const sortVal = sortSelect ? sortSelect.value : 'newest';
    filteredTasks.sort((a, b) => {
        const timeA = new Date(a.createdAt || parseInt(a.id) || 0).getTime();
        const timeB = new Date(b.createdAt || parseInt(b.id) || 0).getTime();

        if (sortVal === 'newest') {
            return timeB - timeA;
        } else if (sortVal === 'oldest') {
            return timeA - timeB;
        } else if (sortVal === 'priority-desc' || sortVal === 'priority-asc') {
            const weights = { low: 1, medium: 2, high: 3 };
            const weightA = weights[a.priority] || 2;
            const weightB = weights[b.priority] || 2;
            return sortVal === 'priority-desc' ? weightB - weightA : weightA - weightB;
        } else if (sortVal === 'due-soon') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const dateA = new Date(a.dueDate.includes('T') ? a.dueDate : `${a.dueDate}T00:00:00`);
            const dateB = new Date(b.dueDate.includes('T') ? b.dueDate : `${b.dueDate}T00:00:00`);
            return dateA - dateB;
        }
        return 0;
    });

    if (emptyState) {
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';

        const badgesDiv = document.createElement('div');
        badgesDiv.className = 'task-badges';

        const prioritySpan = document.createElement('span');
        prioritySpan.className = `priority-badge priority-${task.priority}`;
        prioritySpan.textContent = (task.priority || 'medium').toUpperCase();
        badgesDiv.appendChild(prioritySpan);

        const categorySpan = document.createElement('span');
        const category = task.category || 'Other';
        categorySpan.className = `category-badge category-${category.toLowerCase()}`;
        const emojiMap = { work: '💼 Work', personal: '🏠 Personal', health: '💪 Health', finance: '💰 Finance', other: '✨ Other' };
        categorySpan.textContent = emojiMap[category.toLowerCase()] || `✨ ${category}`;
        badgesDiv.appendChild(categorySpan);

        detailsDiv.appendChild(badgesDiv);

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        detailsDiv.appendChild(titleSpan);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta-info';

        const createdSpan = document.createElement('span');
        createdSpan.className = 'task-meta';
        const createdDateObj = task.createdAt ? new Date(task.createdAt) : new Date(parseInt(task.id));
        createdSpan.textContent = `Created: ${createdDateObj.toLocaleDateString()}`;
        metaDiv.appendChild(createdSpan);

        if (task.dueDate) {
            const dueSpan = document.createElement('span');
            dueSpan.className = 'meta-due-date';
            
            const dueDateStr = task.dueDate.includes('T') ? task.dueDate : `${task.dueDate}T00:00:00`;
            const dueDateObj = new Date(dueDateStr);
            const formattedDueDate = dueDateObj.toLocaleDateString();

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueCheck = new Date(dueDateStr);
            dueCheck.setHours(0, 0, 0, 0);

            if (dueCheck < today && !task.completed) {
                dueSpan.classList.add('overdue');
                dueSpan.innerHTML = `⚠️ Overdue: ${formattedDueDate}`;
            } else {
                dueSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px; margin-right:4px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> Due: ${formattedDueDate}`;
            }
            metaDiv.appendChild(dueSpan);
        }
        
        detailsDiv.appendChild(metaDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action btn-edit';
        editBtn.setAttribute('aria-label', 'Edit task');
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-action btn-delete';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(detailsDiv);
        li.appendChild(actionsDiv);

        taskList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (activeTasksEl) activeTasksEl.textContent = active;
    if (completedTasksEl) completedTasksEl.textContent = completed;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    if (progressPercent) progressPercent.textContent = `${percentage}%`;
}

function showNotification(message) {
    if (!toast) return;
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color, #3b82f6)"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> <span>${message}</span>`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);

if (taskInput) {
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderTasks();
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompleted);
if (sortSelect) sortSelect.addEventListener('change', renderTasks);

if (themeMenuBtn && themeMenu) {
    themeMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!themeMenu.contains(e.target) && e.target !== themeMenuBtn) {
            themeMenu.classList.remove('show');
        }
    });
}

themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        setTheme(theme);
        if (themeMenu) themeMenu.classList.remove('show');
    });
});

function setTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-emerald', 'theme-sunset', 'theme-ocean', 'theme-dusk', 'theme-autumn');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('appTheme', theme);
    showNotification(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}.`);
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    let savedTheme = localStorage.getItem('appTheme');
    if (!savedTheme || savedTheme === 'light') {
        savedTheme = 'dark';
    }
    setTheme(savedTheme);

    loadTasks();

    if (tasks.length === 0) {
        const base = Date.now();
        const makeId = (i) => (base + i).toString();

        const sampleTasks = [
            {
                id: makeId(1),
                title: 'Explore Anmol\'s responsive portfolio website',
                completed: true,
                priority: 'high',
                category: 'Work',
                dueDate: isoDateOffset(2),
                createdAt: new Date(base + 1).toISOString(),
                updatedAt: null
            },
            {
                id: makeId(2),
                title: 'Test the interactive features & task filters',
                completed: false,
                priority: 'medium',
                category: 'Work',
                dueDate: isoDateOffset(4),
                createdAt: new Date(base + 2).toISOString(),
                updatedAt: null
            },
            {
                id: makeId(3),
                title: 'Hire Anmol Akber for Web Developer Internship',
                completed: false,
                priority: 'high',
                category: 'Personal',
                dueDate: null,
                createdAt: new Date(base + 3).toISOString(),
                updatedAt: null
            }
        ];

        tasks = sampleTasks;
        saveTasks();
    }

    renderTasks();
}

function isoDateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

init();