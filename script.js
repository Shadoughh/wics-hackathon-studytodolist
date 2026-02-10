// Array to store all tasks
let tasks = [];

// Function to add a new task to the array and display it
function addTask() {
    // Get values from input fields
    const name = document.getElementById("taskName").value;
    const due = document.getElementById("dueDate").value;
    const diff = document.getElementById("difficulty").value;

    // If any input is empty, do nothing
    if (!name || !due || !diff) return;

    // Add new task as an object to the tasks array
    tasks.push({
        name: name,
        due: due,
        difficulty: diff
    });

    // Update the task list display
    renderTasks();
}

// Function to display all tasks in the taskList <ul>
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = ""; // Clear the current list

    // Loop through all tasks and create a <li> for each
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = `${task.name} - Due: ${task.due} - Difficulty: ${task.difficulty}`;
        list.appendChild(li);
    });
}
