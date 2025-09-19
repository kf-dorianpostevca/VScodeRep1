// Task Manager App
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.setAttribute('role', 'listitem');
  li.setAttribute('tabindex', '0');

  const span = document.createElement('span');
  span.textContent = task.text;

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

  li.appendChild(span);
  li.appendChild(actions);

  return li;
}

let tasks = [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    taskList.appendChild(createTaskElement(task, idx));
  });
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
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

// Accessibility: allow keyboard navigation for tasks
// (e.g., delete/complete with Enter/Space)
taskList.addEventListener('keydown', e => {
  const li = document.activeElement;
  if (li.classList.contains('task-item')) {
    const idx = Array.from(taskList.children).indexOf(li);
    if (e.key === 'Delete') {
      tasks.splice(idx, 1);
      saveTasks();
      renderTasks();
    } else if (e.key === ' ' || e.key === 'Enter') {
      tasks[idx].completed = !tasks[idx].completed;
      saveTasks();
      renderTasks();
    }
  }
});

// Initial load
loadTasks();
renderTasks();
