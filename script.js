let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let editIndex = null;
let countdown;
let isPaused = false;
let timeLeftInSeconds = 0;
let currentFocusTask = "";

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
            <div style="display:flex; gap:15px; align-items:flex-start;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${i})" style="width:20px; height:20px; cursor:pointer;">
                <div>
                    <strong style="${task.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${task.name}</strong>
                    <div style="font-size:13px; opacity:0.7;">📅 ${new Date(task.due).toLocaleString()}</div>
                    <div style="color:var(--green); font-weight:800; font-size:12px;">Difficulty: ${task.difficulty}</div>
                </div>
            </div>
            <div class="task-actions">
                <button class="primary-btn" onclick="startTimer('${task.name.replace(/'/g, "\\'")}')">⏱️ Timer</button>
                <button style="background:#f59e0b; color:white;" onclick="editTask(${i})">Edit</button>
                <button style="background:#ef4444; color:white;" onclick="deleteTask(${i})">Remove</button>
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
        setupSecs = (setupSecs + amount + 60) % 60;
        document.getElementById("setupSeconds").textContent = setupSecs < 10 ? '0' + setupSecs : setupSecs;
    }
}

function startTimer(taskName) {
    currentFocusTask = taskName;
    document.getElementById("setupTaskName").textContent = "Timer: " + taskName;
    document.getElementById("timerSetup").style.display = "block";
    window.scrollTo({ top: document.getElementById("timerSetup").offsetTop - 50, behavior: 'smooth' });
}

function confirmAndStart() {
    timeLeftInSeconds = (setupMins * 60) + setupSecs;
    if (timeLeftInSeconds <= 0) return alert("Please set a time!");
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
    btn.style.backgroundColor = isPaused ? "#52b788" : "#f59e0b";
}

function stopTimer() {
    clearInterval(countdown);
    document.getElementById("activeTimerContainer").style.display = "none";
    document.getElementById("timerSetup").style.display = "none";
}

function editTask(i) {
    editIndex = i;
    const task = tasks[i];
    document.getElementById("taskName").value = task.name;
    document.getElementById("dueDate").value = task.due;
    document.getElementById("difficulty").value = task.difficulty;
    document.getElementById("addBtn").textContent = "Update Task";
    window.scrollTo({ top: 0, behavior: 'smooth' });
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