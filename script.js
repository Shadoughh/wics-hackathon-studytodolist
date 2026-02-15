/* ==========================================================
   1. DATA & STATE
   ========================================================== */
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let editIndex = null; 
let countdown; 
let timerRunning = false;
let timeLeftInSeconds = 0;
let isPaused = false;

renderTasks();
window.addEventListener('DOMContentLoaded', setDefaultTime);

function saveToLocalStorage() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function setDefaultTime() {
    const now = new Date();
    const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T23:59`;
    const dateInput = document.getElementById("dueDate");
    if (dateInput) dateInput.value = defaultDateTime;
}

/* ==========================================================
   2. CORE ACTIONS
   ========================================================== */

function addTask() {
    const nameInput = document.getElementById("taskName");
    const dueInput = document.getElementById("dueDate");
    const diffInput = document.getElementById("difficulty");
    const mainBtn = document.querySelector("button[onclick='addTask()']");

    if (!nameInput.value || !dueInput.value) return alert("Please enter Name and Due Date!");

    const taskData = {
        name: nameInput.value,
        due: dueInput.value,
        difficulty: diffInput.value ? parseInt(diffInput.value) : null,
        completed: editIndex !== null ? tasks[editIndex].completed : false,
        completedDate: editIndex !== null ? tasks[editIndex].completedDate : null
    };

    if (editIndex !== null) {
        tasks[editIndex] = taskData;
        editIndex = null;
        mainBtn.textContent = "Add Task";
        mainBtn.style.background = ""; 
    } else {
        tasks.push(taskData);
    }

    saveToLocalStorage();
    renderTasks(); 
    nameInput.value = "";
    diffInput.value = "";
    setDefaultTime();
}

function clearAllTasks() {
    if (tasks.length === 0) return;
    if (confirm("Are you sure you want to delete ALL tasks?")) {
        tasks = [];
        editIndex = null;
        saveToLocalStorage();
        renderTasks();
    }
}

/* ==========================================================
   3. CUSTOM TIMER LOGIC
   ========================================================== */

function startTimer(taskName) {
    if (timerRunning) return alert("A timer is already running!");

    const container = document.getElementById("activeTimerContainer");
    const label = document.getElementById("timerTaskName");
    const customMinInput = document.getElementById("customMinutes");
    const settingsDiv = document.getElementById("timerSettings");
    const startPauseBtn = document.getElementById("startPauseBtn");

    let minutes = parseInt(customMinInput.value) || 25;
    timeLeftInSeconds = minutes * 60;
    isPaused = false;
    timerRunning = true;
    
    container.style.display = "block";
    settingsDiv.style.display = "none"; 
    label.textContent = "Focusing on: " + taskName;
    startPauseBtn.textContent = "Pause";
    startPauseBtn.style.background = "#f59e0b"; 

    updateTimerDisplay();
    runTick();
    container.scrollIntoView({ behavior: 'smooth' });
}

function runTick() {
    countdown = setInterval(() => {
        if (!isPaused) {
            timeLeftInSeconds--;
            updateTimerDisplay();

            if (timeLeftInSeconds <= 0) {
                clearInterval(countdown);
                timerRunning = false;
                confetti({ particleCount: 200, spread: 100 });
                alert("Time's Up! Great focus session.");
                stopTimer();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const display = document.getElementById("timerDisplay");
    let mins = Math.floor(timeLeftInSeconds / 60);
    let secs = timeLeftInSeconds % 60;
    display.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function togglePause() {
    const btn = document.getElementById("startPauseBtn");
    isPaused = !isPaused;
    btn.textContent = isPaused ? "Resume" : "Pause";
    btn.style.background = isPaused ? "#10b981" : "#f59e0b";
}

function stopTimer() {
    clearInterval(countdown);
    timerRunning = false;
    isPaused = false;
    document.getElementById("activeTimerContainer").style.display = "none";
    document.getElementById("timerSettings").style.display = "block";
}

/* ==========================================================
   4. RENDERING & STATS
   ========================================================== */

function getTimeRemaining(dateTimeString) {
    const now = new Date();
    const due = new Date(dateTimeString);
    const diff = due - now;
    if (diff <= 0) return "⚠️ Overdue!";
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `⏳ ${days}d left`;
    if (hours > 0) return `⏰ ${hours}h left`;
    return `🔥 ${mins}m left!`;
}

function renderTasks() {
    const list = document.getElementById("taskList");
    const clearBtn = document.querySelector(".clear-btn");
    if (!list) return;
    list.innerHTML = "";

    // Dynamic Clear Button Styling
    if (clearBtn) {
        clearBtn.style.background = tasks.length === 0 ? "#94a3b8" : "#6366f1";
        clearBtn.style.cursor = tasks.length === 0 ? "default" : "pointer";
        clearBtn.style.opacity = tasks.length === 0 ? "0.7" : "1";
    }

    const sortValue = document.getElementById("sortOption")?.value || "due";
    tasks.sort((a, b) => {
        if (sortValue === "due") return new Date(a.due) - new Date(b.due);
        if (sortValue === "diffHigh") return (b.difficulty || 0) - (a.difficulty || 0);
        if (sortValue === "diffLow") return (a.difficulty || 0) - (b.difficulty || 0);
        return 0;
    });

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        const timeLeft = getTimeRemaining(task.due);
        const d = task.difficulty;
        const diffColor = d >= 4 ? '#ef4444' : (d >= 3 ? '#f59e0b' : '#10b981');

        li.innerHTML = `
            <div class="task-main">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                <div class="task-info">
                    <strong style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.name}</strong>
                    <small>📅 ${new Date(task.due).toLocaleDateString()} • <span style="color: ${timeLeft.includes('⚠️') ? '#ef4444' : '#6366f1'}; font-weight:600;">${timeLeft}</span></small>
                    ${d ? `<small style="font-weight: bold; color: ${diffColor};">Difficulty: ${d}</small>` : ""}
                </div>
            </div>
            <div class="task-actions">
                <button onclick="startTimer('${task.name.replace(/'/g, "\\'")}')">⏱️ Focus</button>
                <button style="background: #f59e0b;" onclick="editTask(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${index})">Remove</button>
            </div>
        `;
        list.appendChild(li);
    });
    updateProgress();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    tasks[index].completedDate = tasks[index].completed ? new Date().toISOString().split('T')[0] : null;
    if (tasks[index].completed) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    saveToLocalStorage();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveToLocalStorage();
    renderTasks();
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById("taskName").value = task.name;
    document.getElementById("dueDate").value = task.due;
    document.getElementById("difficulty").value = task.difficulty || "";
    editIndex = index;
    const mainBtn = document.querySelector("button[onclick='addTask()']");
    mainBtn.textContent = "Save Changes";
    mainBtn.style.background = "#f59e0b";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const todayStr = new Date().toISOString().split('T')[0];
    const completed = tasks.filter(t => t.completed);
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round(completed.length / total * 100);
    
    document.getElementById("statsToday").textContent = tasks.filter(t => t.completed && t.completedDate === todayStr).length;
    document.getElementById("statsTotal").textContent = completed.length;
    document.getElementById("statsOverdue").textContent = tasks.filter(t => !t.completed && new Date(t.due) < new Date()).length;

    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressText").textContent = percent + "%";
    document.getElementById("taskCounter").textContent = `${completed.length} / ${total} Tasks Completed`;
}

/* ==========================================================
   5. MODAL & THEME
   ========================================================== */

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeToggle').textContent = document.body.classList.contains('dark-mode') ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function toggleStatsModal() {
    const modal = document.getElementById("statsModal");
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        updateDetailedStats();
        modal.style.display = "block";
    }
}

function updateDetailedStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const completed = tasks.filter(t => t.completed);
    document.getElementById("totalAllTime").textContent = completed.length;
    document.getElementById("todayCount").textContent = completed.filter(t => t.completedDate === todayStr).length;
    
    const onTimeTasks = completed.filter(t => new Date(t.completedDate) <= new Date(t.due)).length;
    const onTimePercent = completed.length === 0 ? 0 : Math.round((onTimeTasks / completed.length) * 100);
    document.getElementById("onTimeScore").textContent = onTimePercent + "%";
}

function resetStats() {
    if (confirm("Reset all progress? Tasks stay, but completion history is wiped.")) {
        tasks.forEach(t => { t.completed = false; t.completedDate = null; });
        saveToLocalStorage();
        renderTasks();
        updateDetailedStats();
    }
}

window.onclick = (e) => { if (e.target == document.getElementById("statsModal")) document.getElementById("statsModal").style.display = "none"; }