
const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "numeric"

});

let balanceElement = document.getElementById("balance");
let clientTasks = [];
//let balanceElement = document.getElementById("balance");
//let clientBalance = Number(balanceElement.textContent.substring(1));

async function hydrateTasks() {
    let tasklist = document.getElementById("tasklist");

    const response = await fetch("/api/v1/tasks/", {
        method: "GET",
        credentials: "include" 
    });

    tasklist.innerHTML = ""; // clear
    if (response.ok) {
        const tasks = await response.json();
        tasks.sort((a, b) => a.completed - b.completed);

        clientTasks = tasks;

        tasks.forEach((task) => {
            //let li = document.createElement("li");
            //li.appendChild(document.createTextNode(task.name));
            tasklist.appendChild(createTaskHTML(task));
        })

    }
}

async function hydrateBalance() {

    const response = await fetch("/api/v1/auth/info", {
        method: "GET",
        credentials: "include" 
    });

    if (response.ok) {
        const user = await response.json();
        console.log(`WERE GETTING THIS SHIT BRO ${user.balance}`)
        balanceElement.textContent = "$" + user.balance;

    }
}
hydrateBalance();
function softHydrateTasks() {
    let tasklist = document.getElementById("tasklist");
    tasklist.innerHTML = ""; // clear

    clientTasks.sort((a, b) => a.completed - b.completed);

    clientTasks.forEach((task) => {
        tasklist.appendChild(createTaskHTML(task));
    })

}

function createTaskHTML(task) {
    let li = document.createElement("li");
    li.classList.add("task");

    

    let dueDate = new Date(task.due);
    let taskClickable = tag("button", "task-click", "");

    let title = tag("span","task-title", `${task.name} - $${task.value}`);
    let del = tag("button","task-delete", `X`);
    let refresh = tag("button","task-refresh", `3`);
    let description = tag("div", "task-description", task.description);
    let due = tag("div", "task-due", formatter.format(dueDate));

    if (task.completed) {
        title.classList.add("task-done");
        description.classList.add("task-done");
        taskClickable.classList.add("task-done-click");
    }

    taskClickable.addEventListener("click", async () => {
        await toggleTask(task.taskID, task.completed);
        hydrateTasks();
    } );
    del.addEventListener("click", async () => {

        let userConfirm = confirm("Are you sure you want to delete this task? This action is not reversible.");

        if (userConfirm) {

            await deleteTask(task.taskID);
        }
        hydrateTasks();
    } );
    refresh.addEventListener("click", async () => {

        await refreshTask(task.taskID);
        hydrateTasks();
    } );

    taskClickable.appendChild(title);
    taskClickable.appendChild(description);
    if (!task.completed) {
        taskClickable.appendChild(due);
    }
    li.appendChild(taskClickable);
    li.appendChild(del);
    if (task.completed) {
        li.appendChild(refresh);
    }

    return li;
}

async function toggleTask(id, completed) { 

    let end = completed ? "uncomplete" : "complete"
    console.log(completed);
    console.log(end);

    const res = await fetch(`/api/v1/tasks/${id}/${end}`, {
        method: "PUT",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        let clientBalance = Number(balanceElement.textContent.substring(1));

        console.log(out.task.value);
        console.log(clientBalance);
        if (!completed) {
            clientBalance += out.task.value;
        }
        else {
            clientBalance -= out.task.value;
        }
        balanceElement.innerHTML = "$" + clientBalance;
        account_balance.textContent = "$" + clientBalance;

    }
    else {
        const error = await res.json();
        alert("Error: " + error.error);

    }
}

async function deleteTask(id) { 

    const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "DELETE",
        credentials: "include" 
    });

    if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.error);
    }
}
async function refreshTask(id) { 

    const res = await fetch(`/api/v1/tasks/${id}/refresh`, {
        method: "PUT",
        credentials: "include" 
    });

    if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.error);
    }
}

function tag(element, className, content) {
    let e = document.createElement(element);
    e.classList.add(className);
    e.appendChild(document.createTextNode(content))
    return e;
}

hydrateTasks();

// Task creation form
const form = document.getElementById('taskForm');
const errorMessage = document.getElementById('taskerror');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal form submission
    errorMessage.textContent = ''; // reset error

    const formData = {
        name: document.getElementById('taskname').value,
        description: document.getElementById('taskdesc').value,
        value: parseInt(document.getElementById('taskvalue').value),
        due: document.getElementById('taskdue').valueAsNumber,
    };

    const response = await fetch('/api/v1/tasks/', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const err = await response.json();
        errorMessage.textContent = err.error || "Task Creation failed";
        return;
    }

    const result = await response.json();

    if (result.success) {
        hydrateTasks();
    }
    else {
        errorMessage.textContent = result.message || "Failed to Create Task";

    }



    console.log(result);
});
