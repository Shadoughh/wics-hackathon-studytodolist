/* ==========================================================
   1. DATA INITIALIZATION
   ========================================================== */

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

// Run these immediately on load
renderTasks();
initTheme(); // NEW: Initialize the dark/light theme

function saveToLocalStorage() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

/* ==========================================================
   2. CORE ACTIONS (Add, Delete, Toggle)
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
}

/* ==========================================================
   3. RENDERING (Drawing the UI)
   ========================================================== */

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        // 1. Create a "Left Side" container for the Checkbox and the Text
        const leftSideGroup = document.createElement("div");
        leftSideGroup.style.display = "flex";
        leftSideGroup.style.alignItems = "center"; // Note: changed from align_items to alignItems
        leftSideGroup.style.gap = "8px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.width = "auto"; 
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            saveToLocalStorage();
            renderTasks();
        };

        const span = document.createElement("span");
        span.textContent = ` ${task.name} (Due ${task.due})`;
        if (task.completed) span.style.textDecoration = "line-through";

        leftSideGroup.appendChild(checkbox);
        leftSideGroup.appendChild(span);

        // 2. Create the "Right Side" button
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
   4. PROGRESS CALCULATION
   ========================================================== */

function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round(completed / total * 100);

    document.getElementById("progressBar").value = percent;
    document.getElementById("progressText").textContent = percent + "%";
    document.getElementById("taskCounter").textContent =
        `${completed} / ${total} Tasks Completed`;
}

/* ==========================================================
   5. DARK MODE TOGGLE LOGIC (REPAIRED)
   ========================================================== */

// 1. Check for saved theme preference as soon as the script loads
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    // We have to wait a tiny bit for the HTML to load before changing button text
    window.onload = () => {
        document.getElementById('themeToggle').textContent = "☀️ Light Mode";
    };
}

// 2. This function runs every time the button is clicked
function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');

    // Toggle the "dark-mode" class on the body
    body.classList.toggle('dark-mode');

    // Check if the body now has the class and update text/storage
    if (body.classList.contains('dark-mode')) {
        btn.textContent = "☀️ Light Mode";
        localStorage.setItem('theme', 'dark');
    } else {
        btn.textContent = "🌙 Dark Mode";
        localStorage.setItem('theme', 'light');
    }
}