// Task Manager v2 App
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

function formatDate(date) {
  return date.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.setAttribute('role', 'listitem');
  li.setAttribute('tabindex', '0');

  const info = document.createElement('div');
  info.className = 'task-info';

  const span = document.createElement('span');
  span.textContent = task.text;

  const date = document.createElement('span');
  date.className = 'task-date';
  date.textContent = formatDate(new Date(task.created));
  date.setAttribute('aria-label', 'Created on ' + date.textContent);

  info.appendChild(span);
  info.appendChild(date);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const completeBtn = document.createElement('button');
  completeBtn.innerHTML = task.completed ? '✅' : '✔️';
  completeBtn.setAttribute('aria-label', task.completed ? 'Mark as incomplete' : 'Mark as completed');
  completeBtn.onclick = () => {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.onclick = () => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  };

  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(info);
  li.appendChild(actions);

  return li;
}


let tasks = [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('tasks-v2', JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem('tasks-v2');
  tasks = stored ? JSON.parse(stored) : [];
}

function getFilteredTasks() {
  if (currentFilter === 'completed') {
    return tasks.filter(t => t.completed);
  } else if (currentFilter === 'pending') {
    return tasks.filter(t => !t.completed);
  }
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = '';
  getFilteredTasks().forEach((task, idx) => {
    // Use the index from the original tasks array for actions
    const origIdx = tasks.indexOf(task);
    taskList.appendChild(createTaskElement(task, origIdx));
  });
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false, created: new Date().toISOString() });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
  }
});

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    taskForm.dispatchEvent(new Event('submit'));
  }
});

// Filter button logic
const filterBar = document.querySelector('.filter-bar');
if (filterBar) {
  filterBar.addEventListener('click', e => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.setAttribute('aria-pressed', 'false');
      });
      e.target.setAttribute('aria-pressed', 'true');
      currentFilter = e.target.getAttribute('data-filter');
      renderTasks();
    }
  });
}

// Accessibility: allow keyboard navigation for tasks
// (e.g., delete/complete with Enter/Space)
taskList.addEventListener('keydown', e => {
  const li = document.activeElement;
  if (li.classList.contains('task-item')) {
    const idx = Array.from(taskList.children).indexOf(li);
    // Map filtered index to original index
    const filteredTasks = getFilteredTasks();
    const origIdx = tasks.indexOf(filteredTasks[idx]);
    if (e.key === 'Delete') {
      tasks.splice(origIdx, 1);
      saveTasks();
      renderTasks();
    } else if (e.key === ' ' || e.key === 'Enter') {
      tasks[origIdx].completed = !tasks[origIdx].completed;
      saveTasks();
      renderTasks();
    }
  }
});

// Initial load
loadTasks();
renderTasks();
