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
   3. RENDERING & TIMER LOGIC
   ========================================================== */

function startTimer(taskName, minutes = 25) {
    if (timerRunning) return alert("A timer is already running!");

    const container = document.getElementById("activeTimerContainer");
    const display = document.getElementById("timerDisplay");
    const label = document.getElementById("timerTaskName");
    
    if (container) container.style.display = "block";
    if (label) label.textContent = "Focusing on: " + taskName;
    timerRunning = true;

    let seconds = minutes * 60;
    countdown = setInterval(() => {
        seconds--;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        if (display) display.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (seconds <= 0) {
            clearInterval(countdown);
            timerRunning = false;
            if (display) display.textContent = "Time's Up!";
            confetti({ particleCount: 200, spread: 100 });
            alert("Break time! Great job on: " + taskName);
        }
    }, 1000);
    if (container) container.scrollIntoView({ behavior: 'smooth' });
}

function stopTimer() {
    clearInterval(countdown);
    timerRunning = false;
    const container = document.getElementById("activeTimerContainer");
    if (container) container.style.display = "none";
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
    const clearBtn = document.querySelector(".clear-btn");
    if (!list) return;
    list.innerHTML = "";

    if (tasks.length === 0) {
        if (clearBtn) {
            clearBtn.style.background = "#94a3b8"; 
            clearBtn.style.cursor = "default";
            clearBtn.style.opacity = "0.7";
        }
    } else {
        if (clearBtn) {
            clearBtn.style.background = "#6366f1"; 
            clearBtn.style.cursor = "pointer";
            clearBtn.style.opacity = "1";
        }
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
        const timeLeft = getTimeRemaining(task.due);

        const taskMain = document.createElement("div");
        taskMain.className = "task-main";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            // Record completion date for "Done Today" tracking
            task.completedDate = checkbox.checked ? new Date().toISOString().split('T')[0] : null;
            
            if (checkbox.checked) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            saveToLocalStorage();
            renderTasks();
        };

        const infoStack = document.createElement("div");
        infoStack.className = "task-info";

        const d = task.difficulty;
        const diffColor = d >= 4 ? '#ef4444' : (d >= 3 ? '#f59e0b' : '#10b981');
        const diffLabel = d ? `<small style="font-weight: bold; color: ${diffColor}; margin-top: 2px;">Difficulty: ${d}</small>` : "";

        infoStack.innerHTML = `
            <strong style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.name}</strong>
            <small>📅 ${new Date(task.due).toLocaleDateString()} • <span style="color: ${timeLeft.includes('⚠️') ? '#ef4444' : '#6366f1'}; font-weight:600;">${timeLeft}</span></small>
            ${diffLabel}
        `;

        taskMain.appendChild(checkbox);
        taskMain.appendChild(infoStack);

        const btnGroup = document.createElement("div");
        btnGroup.className = "task-actions";

        const focusBtn = document.createElement("button");
        focusBtn.textContent = "⏱️ Focus";
        focusBtn.onclick = () => startTimer(task.name, 25);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.background = "#f59e0b";
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

        const delBtn = document.createElement("button");
        delBtn.textContent = "Remove";
        delBtn.className = "delete-btn"; 
        delBtn.onclick = () => { 
            tasks.splice(index, 1); 
            saveToLocalStorage(); 
            renderTasks(); 
        };

        btnGroup.appendChild(focusBtn);
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(delBtn);
        
        li.appendChild(taskMain);
        li.appendChild(btnGroup);
        list.appendChild(li);
    });
    updateProgress();
}

/* ==========================================================
   4. PROGRESS & STATISTICS LOGIC
   ========================================================== */

function updateProgress() {
    const todayStr = new Date().toISOString().split('T')[0];
    const completedTasks = tasks.filter(t => t.completed);
    const completedCount = completedTasks.length;
    const totalCount = tasks.length;
    
    // Calculate Percent
    const percent = totalCount === 0 ? 0 : Math.round(completedCount / totalCount * 100);
    
    // Count tasks finished specifically today
    const finishedToday = tasks.filter(t => t.completed && t.completedDate === todayStr).length;
    
    // Calculate Overdue
    const overdueCount = tasks.filter(t => {
        return !t.completed && new Date(t.due) < new Date();
    }).length;

    // Update UI Elements
    const bar = document.getElementById("progressBar");
    const text = document.getElementById("progressText");
    const counter = document.getElementById("taskCounter");
    
    // Update Stats Cards
    if (document.getElementById("statsToday")) document.getElementById("statsToday").textContent = finishedToday;
    if (document.getElementById("statsTotal")) document.getElementById("statsTotal").textContent = completedCount;
    if (document.getElementById("statsOverdue")) {
        const ovElement = document.getElementById("statsOverdue");
        ovElement.textContent = overdueCount;
        ovElement.style.color = overdueCount > 0 ? "#ef4444" : "#6366f1";
    }

    if (bar) bar.style.width = percent + "%";
    if (text) text.textContent = percent + "%";
    if (counter) counter.textContent = `${completedCount} / ${totalCount} Tasks Completed`;
    
    if (percent === 100 && totalCount > 0) {
        confetti({ particleCount: 400, spread: 100, origin: { y: 0.6 } });
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
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
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const completed = tasks.filter(t => t.completed);
    
    // 1. All Time Done
    document.getElementById("totalAllTime").textContent = completed.length;
    
    // 2. Finished Today
    const today = completed.filter(t => t.completedDate === todayStr).length;
    document.getElementById("todayCount").textContent = today;
    
    // 3. Finished This Week (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const weekTasks = completed.filter(t => {
        const compDate = new Date(t.completedDate);
        return compDate >= sevenDaysAgo;
    }).length;
    document.getElementById("weekCount").textContent = weekTasks;
    
    // 4. % Completed On Time
    // Logic: Of the completed tasks, how many were finished on or before the due date?
    const onTimeTasks = completed.filter(t => {
        const compDate = new Date(t.completedDate);
        const dueDate = new Date(t.due);
        return compDate <= dueDate;
    }).length;

    const onTimePercent = completed.length === 0 
        ? 0 
        : Math.round((onTimeTasks / completed.length) * 100);
        
    const scoreElement = document.getElementById("onTimeScore");
    scoreElement.textContent = onTimePercent + "%";
    
    // Optional: Color code the percentage
    scoreElement.style.color = onTimePercent >= 80 ? "#10b981" : (onTimePercent >= 50 ? "#f59e0b" : "#ef4444");
}

// Close modal if user clicks outside of the box
window.onclick = function(event) {
    const modal = document.getElementById("statsModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function resetStats() {
    if (confirm("This will clear your 'All-Time', 'Weekly', and 'Today' progress. Your tasks will remain, but will be marked as incomplete. Proceed?")) {
        
        tasks.forEach(task => {
            task.completed = false;
            task.completedDate = null;
        });

        saveToLocalStorage();
        renderTasks(); // This will refresh the main list
        updateDetailedStats(); // This will refresh the numbers in the modal
        
        alert("Stats have been reset to a fresh slate!");
    }
}