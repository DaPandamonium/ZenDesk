document.addEventListener('DOMContentLoaded', () => {
  setupPomodoroTimer();
  setupNotes();
  setupReminders();
  setupHabitTracker();
  setupToDo();
});

function setupPomodoroTimer() {
  const timerDisplay = document.getElementById('timer');
  const startButton = document.getElementById('start');
  const pauseButton = document.getElementById('pause');
  const resetButton = document.getElementById('reset');

  if (!timerDisplay || !startButton || !pauseButton || !resetButton) return;

  let timer;
  let isRunning = false;
  let timeLeft = 25 * 60; // 25 minutes in seconds

  function updateTimerDisplay() {
    if (timerDisplay) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  function startTimer() {
    if (timerDisplay && !isRunning) {
      isRunning = true;
      timer = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timer);
          alert("Time's up!");
        }
      }, 1000);
    }
  }

  function pauseTimer() {
    if (timerDisplay && isRunning) {
      clearInterval(timer);
      isRunning = false;
    }
  }

  function resetTimer() {
    if (timerDisplay) {
      clearInterval(timer);
      isRunning = false;
      timeLeft = 25 * 60;
      updateTimerDisplay();
    }
  }

  startButton?.addEventListener('click', startTimer);
  pauseButton?.addEventListener('click', pauseTimer);
  resetButton?.addEventListener('click', resetTimer);

  updateTimerDisplay();
}

function setupNotes() {
  const newNoteInput = document.getElementById('newNote');
  const addNoteButton = document.getElementById('addNote');
  const notesList = document.getElementById('notesList');

  if (!newNoteInput || !addNoteButton || !notesList) return;

  function addNote() {
    const noteText = newNoteInput.value.trim();
    if (noteText !== '') {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.innerHTML = `<p>${noteText}</p><button onclick="this.parentElement.remove()">Delete</button>`;
      notesList.appendChild(noteItem);
      newNoteInput.value = '';
    }
  }

  addNoteButton.addEventListener('click', addNote);

  newNoteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNote();
    }
  });
}

function setupReminders() {
  const reminderTitleInput = document.getElementById('reminderTitle');
  const reminderTextInput = document.getElementById('reminderText');
  const reminderTimeInput = document.getElementById('reminderTime');
  const addReminderButton = document.getElementById('addReminder');
  const remindersList = document.getElementById('remindersList');

  if (!reminderTitleInput || !reminderTextInput || !reminderTimeInput || !addReminderButton || !remindersList) return;

  function showNotification(title, text) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: text,
      });
    }
  }

  function addReminder() {
    const title = reminderTitleInput.value.trim();
    const text = reminderTextInput.value.trim();
    const time = reminderTimeInput.value;

    if (title !== '' && text !== '' && time !== '') {
      const reminderItem = document.createElement('div');
      reminderItem.className = 'reminder-item';
      reminderItem.innerHTML = `
                  <p><strong>${title}</strong></p>
                  <p>${text}</p>
                  <p><small>${new Date(time).toLocaleString()}</small></p>
                  <button onclick="this.parentElement.remove()">Delete</button>
              `;
      remindersList.appendChild(reminderItem);

      const reminderTime = new Date(time).getTime();
      const currentTime = new Date().getTime();
      const delay = reminderTime - currentTime;

      if (delay > 0) {
        setTimeout(() => {
          showNotification(title, text);
        }, delay);
      }

      reminderTitleInput.value = '';
      reminderTextInput.value = '';
      reminderTimeInput.value = '';
    }
  }

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  addReminderButton.addEventListener('click', addReminder);
}

function setupToDo() {
  const todoNameInput = document.getElementById('todoName');
  const dueDateInput = document.getElementById('dueDate');
  const todoCategorySelect = document.getElementById('todoCategory');
  const todoPrioritySelect = document.getElementById('todoPriority');
  const addTodoButton = document.getElementById('addTodo');
  const todoList = document.getElementById('todoList');
  const filterPrioritySelect = document.getElementById('filterPriority');
  const filterCategorySelect = document.getElementById('filterCategory');

  if (!todoNameInput || !dueDateInput || !todoCategorySelect || !todoPrioritySelect || !addTodoButton || !todoList || !filterPrioritySelect || !filterCategorySelect) return;

  addTodoButton.addEventListener('click', addTodo);
  filterPrioritySelect.addEventListener('change', filterTodos);
  filterCategorySelect.addEventListener('change', filterTodos);

  function addTodo() {
    const todoName = todoNameInput.value.trim();
    const dueDate = dueDateInput.value;
    const todoCategory = todoCategorySelect.value;
    const todoPriority = todoPrioritySelect.value;

    if (todoName !== '' && dueDate !== '') {
      const todoItem = document.createElement('div');
      todoItem.className = 'todo-item';
      todoItem.setAttribute('data-priority', todoPriority);
      todoItem.setAttribute('data-category', todoCategory);
      todoItem.innerHTML = `
            <div class="todo-info">
              <span>${todoName} - ${todoCategory} - ${todoPriority}</span>
              <span><small>Due: ${new Date(dueDate).toLocaleString()}</small></span>
            </div>
            <div class="todo-controls">
              <button onclick="this.parentElement.parentElement.remove()">Delete</button>
            </div>
          `;
      todoList.appendChild(todoItem);

      // Schedule notification
      const dueDateMs = new Date(dueDate).getTime();
      const currentTimeMs = new Date().getTime();
      const delay = dueDateMs - currentTimeMs;

      if (delay > 0) {
        setTimeout(() => {
          showNotification(todoName, `Your ${todoPriority} priority task "${todoName}" is due!`);
        }, delay);
      }

      todoNameInput.value = '';
      dueDateInput.value = '';
    }
  }

  function showNotification(title, message) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  function filterTodos() {
    const selectedPriority = filterPrioritySelect.value;
    const selectedCategory = filterCategorySelect.value;
    const todoItems = todoList.querySelectorAll('.todo-item');

    todoItems.forEach(item => {
      const itemPriority = item.getAttribute('data-priority');
      const itemCategory = item.getAttribute('data-category');

      if ((selectedPriority === 'all' || itemPriority === selectedPriority) &&
        (selectedCategory === 'all' || itemCategory === selectedCategory)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }
}

function setupHabitTracker() {
  const habitNameInput = document.getElementById('habitName');
  const reminderTimeInput = document.getElementById('reminderTime');
  const habitCategorySelect = document.getElementById('habitCategory');
  const addHabitButton = document.getElementById('addHabit');
  const habitsList = document.getElementById('habitsList');
  const totalPointsDisplay = document.getElementById('totalPoints');
  const xpBar = document.querySelector('.xp-bar div');
  const xpLevelDisplay = document.getElementById('xpLevel');

  if (!habitNameInput || !reminderTimeInput || !habitCategorySelect || !addHabitButton || !habitsList || !totalPointsDisplay || !xpBar || !xpLevelDisplay) {
      console.error('One or more elements are missing.');
      return;
  }

  let totalPoints = 0;
  let currentXP = 0;
  let currentLevel = 1;
  const xpPerLevel = 100;

  function addHabit() {
      console.log("Add Habit button clicked"); // Debugging message
      const habitName = habitNameInput.value.trim();
      const reminderTime = reminderTimeInput.value;
      const habitCategory = habitCategorySelect.value;

      if (habitName === '' || reminderTime === '') {
          console.error('Habit name or reminder time is empty.');
          return;
      }

      const habitItem = document.createElement('div');
      habitItem.className = 'habit-item';
      habitItem.innerHTML = `
          <div class="habit-info">
              <span>${habitName} - ${habitCategory}</span>
              <span><small>Reminder: ${new Date(reminderTime).toLocaleString()}</small></span>
          </div>
          <div class="progress-bar"><div style="width: 0%"></div></div>
          <div class="habit-controls">
              <input type="checkbox" onclick="toggleHabit(this)">
              <button onclick="this.parentElement.parentElement.remove()">Delete</button>
          </div>
      `;
      habitsList.appendChild(habitItem);

      // Schedule notification
      const reminderTimeMs = new Date(reminderTime).getTime();
      const currentTimeMs = new Date().getTime();
      const delay = reminderTimeMs - currentTimeMs;

      if (delay > 0) {
          setTimeout(() => {
              showNotification(habitName, `It's time to do your ${habitCategory} habit!`);
          }, delay);
      }

      habitNameInput.value = '';
      reminderTimeInput.value = '';
  }

  function showNotification(title, message) {
      if (Notification.permission === 'granted') {
          new Notification(title, { body: message });
      }
  }

  if (Notification.permission !== 'granted') {
      Notification.requestPermission();
  }

  addHabitButton.addEventListener('click', addHabit);

  window.toggleHabit = (checkbox) => {
      const habitItem = checkbox.parentElement.parentElement;
      const progressBar = habitItem.querySelector('.progress-bar div');
      const progress = parseInt(progressBar.style.width) || 0;

      if (checkbox.checked) {
          habitItem.style.textDecoration = 'line-through';
          progressBar.style.width = '100%';
          addPoints(10);
          addXP(20);
      } else {
          habitItem.style.textDecoration = 'none';
          progressBar.style.width = '0%';
          subtractPoints(10);
          subtractXP(20);
      }
  };

  function addPoints(points) {
      totalPoints += points;
      updatePointsDisplay();
  }

  function subtractPoints(points) {
      totalPoints -= points;
      updatePointsDisplay();
  }

  function updatePointsDisplay() {
      totalPointsDisplay.textContent = totalPoints;
  }

  function addXP(xp) {
      currentXP += xp;
      if (currentXP >= xpPerLevel) {
          currentXP -= xpPerLevel;
          currentLevel += 1;
      }
      updateXPDisplay();
  }

  function subtractXP(xp) {
      currentXP -= xp;
      if (currentXP < 0) {
          currentXP = 0;
      }
      updateXPDisplay();
  }

  function updateXPDisplay() {
      xpBar.style.width = `${(currentXP / xpPerLevel) * 100}%`;
      xpLevelDisplay.textContent = `Level ${currentLevel}: ${currentXP}/${xpPerLevel} XP`;
  }
}
