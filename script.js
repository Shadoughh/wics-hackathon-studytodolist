/* ==========================================================
   1. DATA INITIALIZATION & SETUP
   ========================================================== */
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let editIndex = null; 

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
    if (dateInput) {
        dateInput.value = defaultDateTime;
    }
}

/* ==========================================================
   2. CORE ACTIONS (Add, Edit, Clear All)
   ========================================================== */

function addTask() {
    const nameInput = document.getElementById("taskName");
    const dueInput = document.getElementById("dueDate");
    const diffInput = document.getElementById("difficulty");
    const mainBtn = document.querySelector("button[onclick='addTask()']");

    if (!nameInput.value || !dueInput.value) return alert("Please enter a Task Name and Due Date!");

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
    if (tasks.length === 0) return; // Silent return if empty
    if (confirm("Are you sure you want to delete ALL tasks? This cannot be undone.")) {
        tasks = [];
        editIndex = null;
        const mainBtn = document.querySelector("button[onclick='addTask()']");
        mainBtn.textContent = "Add Task";
        saveToLocalStorage();
        renderTasks();
    }
}

/* ==========================================================
   3. RENDERING & LOGIC
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
    const clearBtn = document.querySelector("button[onclick='clearAllTasks()']");
    if (!list) return;
    list.innerHTML = "";

    // DYNAMIC UI: Clear All Button Styling
    if (tasks.length === 0) {
        clearBtn.style.background = "#94a3b8"; // Muted Grey
        clearBtn.style.cursor = "default";
        clearBtn.style.opacity = "0.7";
    } else {
        clearBtn.style.background = "#6366f1"; // Action Purple
        clearBtn.style.cursor = "pointer";
        clearBtn.style.opacity = "1";
    }

    // SORTING LOGIC
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
        checkbox.style.width = "auto"; 
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            if (checkbox.checked) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
            saveToLocalStorage();
            renderTasks();
        };

        const dueDateObj = new Date(task.due);
        const formattedDate = dueDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const formattedTime = dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeLeft = getTimeRemaining(task.due);

        let difficultyHTML = ""; 
        if (task.difficulty) {
            let diffColor = "#10b981"; 
            if (task.difficulty == 3) diffColor = "#f59e0b"; 
            if (task.difficulty >= 4) diffColor = "#ef4444"; 
            difficultyHTML = `<small style="font-weight: bold; color: ${diffColor};">Difficulty: ${task.difficulty}</small>`;
        }

        const span = document.createElement("span");
        span.innerHTML = `
            <div style="display: flex; flex-direction: column; line-height: 1.4;">
                <strong>${task.name}</strong>
                <small style="color: #6b7280;">📅 ${formattedDate} at ${formattedTime} (${timeLeft})</small>
                ${difficultyHTML} 
            </div>
        `;
        if (task.completed) span.style.textDecoration = "line-through";

        leftSideGroup.appendChild(checkbox);
        leftSideGroup.appendChild(span);

        const btnGroup = document.createElement("div"); 
        btnGroup.style.display = "flex"; 
        btnGroup.style.gap = "5px";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.width = "auto";
        editBtn.style.margin = "0";
        editBtn.style.padding = "5px 10px";
        editBtn.style.background = "#f59e0b"; 
        editBtn.style.fontSize = "12px";
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
        del.style.width = "auto";
        del.style.margin = "0";
        del.onclick = () => {
            tasks.splice(index, 1);
            saveToLocalStorage();
            renderTasks();
        };

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(del);

        li.appendChild(leftSideGroup);
        li.appendChild(btnGroup);
        list.appendChild(li);
    });

    updateProgress();
}

/* ==========================================================
   4. PROGRESS & CELEBRATION
   ========================================================== */

function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round(completed / total * 100);

    const fill = document.getElementById("progressBar");
    if (fill) fill.style.width = percent + "%";

    const text = document.getElementById("progressText");
    if (text) text.textContent = percent + "%";
    
    const counter = document.getElementById("taskCounter");
    if (counter) counter.textContent = `${completed} / ${total} Tasks Completed`;

    if (percent === 100 && total > 0) {
        confetti({ particleCount: 400, spread: 100, origin: { y: 0.6 } });
    }
}

/* ==========================================================
   5. DARK MODE TOGGLE LOGIC
   ========================================================== */

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    if (btn) btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
