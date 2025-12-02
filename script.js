const taskInput = document.getElementById("todo-task");
const addTaskBtn = document.getElementById("add-task-btn");
const pendingList = document.getElementById("pending-task");
const completedList = document.getElementById("completed-task");

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getCurrentTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hour}:${minute}`;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  // add status class for CSS styling
  li.classList.add(task.status);

  li.innerHTML = `
    <input type="checkbox" class="custom-checkbox" id="task-${task.id}" ${
    task.isCompleted ? "checked" : ""
  }>
    <label for="task-${task.id}">${task.task}</label>
    <span class="task-time">${task.status} at ${task.time}</span>
    <div class="task-actions">
        <button type="button" class="edit-btn">Edit</button>
        <button type="button" class="delete-btn">Delete</button>
    </div>
  `;
  return li;
}

function renderTasks() {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const tasks = getTasks();

  tasks.sort(function (a, b) {
    return b.updatedAt - a.updatedAt;
  });

  tasks.forEach(function (task) {
    const newTask = createTaskElement(task);
    if (task.isCompleted) {
      completedList.appendChild(newTask);
    } else {
      pendingList.appendChild(newTask);
    }
  });
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const ts = Date.now();
  const newTask = {
    id: ts,
    task: taskText,
    time: getCurrentTime(),
    updatedAt: ts,
    isCompleted: false,
    status: "created",
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  renderTasks();
  taskInput.value = "";
}

function handleClickEvents(event) {
  const target = event.target;
  const li = target.closest("li");
  if (!li) return;

  const label = li.querySelector("label");
  const taskText = label ? label.innerText : "";
  let tasks = getTasks();

  if (target.classList.contains("delete-btn")) {
    const id = li.dataset.id;
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    tasks = tasks.filter(function (t) {
      return t.id != id;
    });
    saveTasks(tasks);
    renderTasks();
  } else if (target.classList.contains("edit-btn")) {
    const id = li.dataset.id;
    const currentText = taskText;
    const newText = prompt("Edit your task:", currentText);

    if (newText !== null && newText.trim() !== "") {
      tasks = tasks.map(function (t) {
        if (t.id == id) {
          return {
            ...t,
            task: newText.trim(),
            status: "modified",
            time: getCurrentTime(),
            updatedAt: Date.now(),
          };
        } else {
          return t;
        }
      });
      saveTasks(tasks);
      renderTasks();
    }
  }
}

function handleCheckboxChange(event) {
  const target = event.target;
  const li = target.closest("li");
  if (!li || !target.classList.contains("custom-checkbox")) return;

  const id = li.dataset.id;

  let tasks = getTasks();
  tasks = tasks.map(function (t) {
    if (t.id == id) {
      return {
        ...t,
        isCompleted: target.checked,
        status: target.checked ? "completed" : "modified",
        time: getCurrentTime(),
        updatedAt: Date.now(),
      };
    } else {
      return t;
    }
  });
  saveTasks(tasks);
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

pendingList.addEventListener("click", handleClickEvents);
completedList.addEventListener("click", handleClickEvents);
pendingList.addEventListener("change", handleCheckboxChange);
completedList.addEventListener("change", handleCheckboxChange);

renderTasks();
