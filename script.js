let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let editIndex = null;
let countdown;
let timerRunning = false;
let timeLeftInSeconds = 0;
let isPaused = false;
let currentFocusTask = "";

// Time picker state
let setupMins = 25;
let setupSecs = 0;

renderTasks();

function addTask() {
    const nameInput = document.getElementById("taskName");
    const dueInput = document.getElementById("dueDate");
    const diffInput = document.getElementById("difficulty");
    if (!nameInput.value || !dueInput.value) return alert("Fill in Name and Date!");

    const taskData = {
        name: nameInput.value,
        due: dueInput.value,
        difficulty: diffInput.value || 1,
        completed: editIndex !== null ? tasks[editIndex].completed : false
    };

    if (editIndex !== null) {
        tasks[editIndex] = taskData;
        editIndex = null;
        document.getElementById("addBtn").textContent = "Add Task";
    } else {
        tasks.push(taskData);
    }
    saveAndRender();
    nameInput.value = ""; dueInput.value = ""; diffInput.value = "";
}

function renderTasks() {
    const list = document.getElementById("taskList");
    const sort = document.getElementById("sortOption").value;
    
    if (sort === "due") tasks.sort((a,b) => new Date(a.due) - new Date(b.due));
    else if (sort === "diffHigh") tasks.sort((a,b) => b.difficulty - a.difficulty);
    else if (sort === "diffLow") tasks.sort((a,b) => a.difficulty - b.difficulty);

    list.innerHTML = "";
    let overdueCount = 0;

    tasks.forEach((task, i) => {
        const isOverdue = new Date(task.due) < new Date() && !task.completed;
        if (isOverdue) overdueCount++;

        const li = document.createElement("li");
        li.className = "task-item";
        li.innerHTML = `
            <div class="task-main">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${i})">
                <div class="task-info">
                    <strong style="${task.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${task.name}</strong>
                    <small>📅 ${new Date(task.due).toLocaleString()}</small>
                    ${isOverdue ? '<span class="overdue-tag">⚠️ Overdue!</span>' : ''}
                    <span class="difficulty-tag">Difficulty: ${task.difficulty}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="timer-btn" onclick="startTimer('${task.name.replace(/'/g, "\\'")}')">⏱️ Timer</button>
                <button class="edit-btn" onclick="editTask(${i})">Edit</button>
                <button class="del-btn" onclick="deleteTask(${i})">Remove</button>
            </div>
        `;
        list.appendChild(li);
    });
    document.getElementById("statsOverdue").textContent = overdueCount;
    updateProgress();
}

function adjustTime(type, amount) {
    if (type === 'min') {
        setupMins = Math.max(0, Math.min(99, setupMins + amount));
        document.getElementById("setupMinutes").textContent = setupMins;
    } else {
        // Keeps seconds between 0-59
        setupSecs = (setupSecs + amount + 60) % 60;
        document.getElementById("setupSeconds").textContent = setupSecs < 10 ? '0' + setupSecs : setupSecs;
    }
}

function editTask(index) {
    editIndex = index;
    const task = tasks[index];
    document.getElementById("taskName").value = task.name;
    document.getElementById("dueDate").value = task.due;
    document.getElementById("difficulty").value = task.difficulty;
    document.getElementById("addBtn").textContent = "Update Task";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startTimer(taskName) {
    if (timerRunning) return alert("Timer is already running!");
    currentFocusTask = taskName;
    document.getElementById("setupTaskName").textContent = "Timer: " + taskName;
    document.getElementById("timerSetup").style.display = "block";
}

function confirmAndStart() {
    timeLeftInSeconds = (setupMins * 60) + setupSecs;
    if (timeLeftInSeconds <= 0) return alert("Please set a time!");
    
    timerRunning = true;
    isPaused = false;
    document.getElementById("timerSetup").style.display = "none";
    document.getElementById("activeTimerContainer").style.display = "block";
    document.getElementById("timerTaskName").innerHTML = `Focusing on: <span style="color:var(--primary)">${currentFocusTask}</span>`;
    
    clearInterval(countdown);
    updateTimerDisplay();
    countdown = setInterval(() => {
        if (!isPaused) {
            timeLeftInSeconds--;
            updateTimerDisplay();
            if (timeLeftInSeconds <= 0) {
                clearInterval(countdown);
                confetti();
                stopTimer();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeftInSeconds / 60);
    const s = timeLeftInSeconds % 60;
    document.getElementById("timerDisplay").textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById("startPauseBtn");
    btn.textContent = isPaused ? "Resume" : "Pause";
    btn.style.background = isPaused ? "#10b981" : "#f59e0b";
}

function stopTimer() {
    clearInterval(countdown);
    timerRunning = false;
    document.getElementById("activeTimerContainer").style.display = "none";
    document.getElementById("timerSetup").style.display = "none";
}

function toggleTask(i) { tasks[i].completed = !tasks[i].completed; saveAndRender(); }
function deleteTask(i) { tasks.splice(i, 1); saveAndRender(); }
function saveAndRender() { localStorage.setItem("studyTasks", JSON.stringify(tasks)); renderTasks(); }

function updateProgress() {
    const done = tasks.filter(t => t.completed).length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressText").textContent = percent + "%";
    document.getElementById("statsToday").textContent = done;
    document.getElementById("statsTotal").textContent = done;
    document.getElementById("taskCounter").textContent = `${done} / ${tasks.length} Tasks Completed`;
}

function toggleDarkMode() { document.body.classList.toggle('dark-mode'); }
function clearAllTasks() { if(confirm("Clear all?")) { tasks = []; saveAndRender(); } }