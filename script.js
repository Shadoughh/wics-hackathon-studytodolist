/* ==========================================================
   1. DATA INITIALIZATION
   ========================================================== */

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

// Run these immediately on load
renderTasks();
window.addEventListener('DOMContentLoaded', setDefaultTime);

function saveToLocalStorage() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Helper to set the default time to 11:59 PM
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
   2. CORE ACTIONS
   ========================================================== */

function addTask() {
    const name = document.getElementById("taskName").value;
    const due = document.getElementById("dueDate").value; 
    const diff = document.getElementById("difficulty").value;

    if (!name || !due || !diff) return alert("Fill all fields");

    tasks.push({
        name: name,
        due: due,
        difficulty: diff,
        completed: false
    });

    saveToLocalStorage();
    renderTasks(); 
    
    document.getElementById("taskName").value = "";
    setDefaultTime();
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
    list.innerHTML = "";

    // Sort by due date
    tasks.sort((a, b) => new Date(a.due) - new Date(b.due));

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
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            saveToLocalStorage();
            renderTasks();
        };

        // Date Formatting
        const dueDateObj = new Date(task.due);
        const formattedDate = dueDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const formattedTime = dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeLeft = getTimeRemaining(task.due);

        // Difficulty Color Logic
        let diffColor = "#10b981"; // Green
        if (task.difficulty == 3) diffColor = "#f59e0b"; // Orange
        if (task.difficulty >= 4) diffColor = "#ef4444"; // Red

        const span = document.createElement("span");
        // Updated HTML structure for the vertical stack
        span.innerHTML = `
            <div style="display: flex; flex-direction: column; line-height: 1.4;">
                <strong>${task.name}</strong>
                <small style="color: #6b7280;">📅 ${formattedDate} @ ${formattedTime} (${timeLeft})</small>
                <small style="font-weight: bold; color: ${diffColor};">Difficulty: ${task.difficulty}</small>
            </div>
        `;

        if (task.completed) span.style.textDecoration = "line-through";

        leftSideGroup.appendChild(checkbox);
        leftSideGroup.appendChild(span);

        const del = document.createElement("button");
        del.textContent = "Remove";
        del.className = "delete-btn"; 
        del.onclick = () => {
            tasks.splice(index, 1);
            saveToLocalStorage();
            renderTasks();
        };

        li.appendChild(leftSideGroup);
        li.appendChild(del);
        list.appendChild(li);
    });

    updateProgress();
}

/* ==========================================================
   4. PROGRESS & DARK MODE
   ========================================================== */

function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round(completed / total * 100);

    const fill = document.getElementById("progressBar");
    if (fill) fill.style.width = percent + "%";

    document.getElementById("progressText").textContent = percent + "%";
    document.getElementById("taskCounter").textContent = `${completed} / ${total} Tasks Completed`;

    // 100% Celebration
    if (percent === 100 && total > 0) {
        confetti({ particleCount: 400, spread: 100, origin: { y: 0.6 } });
    }
}

// Dark Mode logic
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    window.onload = () => {
        const btn = document.getElementById('themeToggle');
        if (btn) btn.textContent = "☀️ Light Mode";
    };
}

function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}