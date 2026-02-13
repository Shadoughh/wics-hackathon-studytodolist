/* ==========================================================
   1. DATA INITIALIZATION & SETUP
   ========================================================== */
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let editIndex = null; 
let countdown; 
let timerRunning = false;

renderTasks();
window.addEventListener('DOMContentLoaded', setDefaultTime);

function saveToLocalStorage() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function setDefaultTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const defaultDateTime = `${year}-${month}-${day}T23:59`;
    
    const dateInput = document.getElementById("dueDate");
    if (dateInput) dateInput.value = defaultDateTime;
}

/* ==========================================================
   2. CORE ACTIONS (Add, Edit, Clear All)
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
        completed: editIndex !== null ? tasks[editIndex].completed : false
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
   3. RENDERING & TIMER LOGIC
   ========================================================== */

function startTimer(taskName, minutes = 25) {
    if (timerRunning) return alert("A timer is already running!");

    const container = document.getElementById("activeTimerContainer");
    const display = document.getElementById("timerDisplay");
    const label = document.getElementById("timerTaskName");
    
    container.style.display = "block";
    label.textContent = "Focusing on: " + taskName;
    timerRunning = true;

    let seconds = minutes * 60;
    countdown = setInterval(() => {
        seconds--;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        display.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (seconds <= 0) {
            clearInterval(countdown);
            timerRunning = false;
            display.textContent = "Time's Up!";
            confetti({ particleCount: 200, spread: 100 });
            alert("Break time! Great job on: " + taskName);
        }
    }, 1000);
    container.scrollIntoView({ behavior: 'smooth' });
}

function stopTimer() {
    clearInterval(countdown);
    timerRunning = false;
    document.getElementById("activeTimerContainer").style.display = "none";
}

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
    const clearBtn = document.querySelector("button[onclick='clearAllTasks()']");
    if (!list) return;
    list.innerHTML = "";

    // Clear All Button Style
    if (tasks.length === 0) {
        clearBtn.style.background = "#94a3b8"; 
        clearBtn.style.cursor = "default";
        clearBtn.style.opacity = "0.7";
    } else {
        clearBtn.style.background = "#6366f1"; 
        clearBtn.style.cursor = "pointer";
        clearBtn.style.opacity = "1";
    }

    const sortValue = document.getElementById("sortOption") ? document.getElementById("sortOption").value : "due";
    tasks.sort((a, b) => {
        if (sortValue === "due") return new Date(a.due) - new Date(b.due);
        if (sortValue === "diffHigh") return (b.difficulty || 0) - (a.difficulty || 0);
        if (sortValue === "diffLow") return (a.difficulty || 0) - (b.difficulty || 0);
        return 0;
    });

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        const leftSideGroup = document.createElement("div");
        leftSideGroup.style.display = "flex";
        leftSideGroup.style.alignItems = "center";
        leftSideGroup.style.gap = "10px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            if (checkbox.checked) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            saveToLocalStorage();
            renderTasks();
        };

        const timeLeft = getTimeRemaining(task.due);
        let difficultyHTML = task.difficulty ? `<small style="font-weight: bold; color: ${task.difficulty >= 4 ? '#ef4444' : (task.difficulty == 3 ? '#f59e0b' : '#10b981')};">Difficulty: ${task.difficulty}</small>` : "";

        const span = document.createElement("span");
        span.innerHTML = `<div style="display:flex; flex-direction:column;"><strong>${task.name}</strong><small>${new Date(task.due).toLocaleDateString()} (${timeLeft})</small>${difficultyHTML}</div>`;
        if (task.completed) span.style.textDecoration = "line-through";

        leftSideGroup.appendChild(checkbox);
        leftSideGroup.appendChild(span);

        const btnGroup = document.createElement("div");
        btnGroup.style.display = "flex";
        btnGroup.style.gap = "5px";

        const focusBtn = document.createElement("button");
        focusBtn.textContent = "⏱️ Focus";
        focusBtn.style.cssText = "width:auto; margin:0; padding:5px 10px; background:#6366f1; font-size:12px;";
        focusBtn.onclick = () => startTimer(task.name, 25);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.cssText = "width:auto; margin:0; padding:5px 10px; background:#f59e0b; font-size:12px;";
        editBtn.onclick = () => {
            document.getElementById("taskName").value = task.name;
            document.getElementById("dueDate").value = task.due;
            document.getElementById("difficulty").value = task.difficulty || "";
            editIndex = index;
            const mainBtn = document.querySelector("button[onclick='addTask()']");
            mainBtn.textContent = "Save Changes";
            mainBtn.style.background = "#f59e0b";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const del = document.createElement("button");
        del.textContent = "Remove";
        del.className = "delete-btn";
        del.style.cssText = "width:auto; margin:0;";
        del.onclick = () => { tasks.splice(index, 1); saveToLocalStorage(); renderTasks(); };

        btnGroup.appendChild(focusBtn);
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(del);
        li.appendChild(leftSideGroup);
        li.appendChild(btnGroup);
        list.appendChild(li);
    });
    updateProgress();
}

function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round(completed / total * 100);
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressText").textContent = percent + "%";
    document.getElementById("taskCounter").textContent = `${completed} / ${total} Tasks Completed`;
    if (percent === 100 && total > 0) confetti({ particleCount: 400, spread: 100, origin: { y: 0.6 } });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('themeToggle').textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}
