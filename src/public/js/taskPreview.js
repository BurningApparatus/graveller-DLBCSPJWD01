
// Sets the format for rendering dates in the task view
const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",

});

// The stack of deleted Task IDs for restoring deleted tasks via undo
const taskDeletedStack = [];

/**
 * Hydrate the tasklist Element with <li> representing tasks and showing task info from
 * GET /tasks
 */
async function hydrateTasks() {
    let tasklist = document.getElementById("tasklist");

    const response = await fetch("/api/v1/tasks/", {
        method: "GET",
        credentials: "include" 
    });

    tasklist.innerHTML = ""; // clear list

    if (response.ok) {
        // The request returns a JSON array of task objects
        const tasks = await response.json();

        // This puts non-completed above completed ones
        tasks.sort((a, b) => a.completed - b.completed);


        tasks.forEach((task) => {
            tasklist.appendChild(createTaskHTML(task));
        })

    }
}

/**
 * Assembles an <li> element which holds all task information from given task
 */
function createTaskHTML(task) {
    let li = document.createElement("li");
    li.classList.add("task");

    let dueDate = new Date(task.due);

    // Button which can be clicked to complete the task and holds main content
    let taskClickable = tag("button", "task-click", "");

    let title = tag("span","task-title", `${task.name} - $${task.value}`);

    // Delete button
    let del = tag("button","task-delete", ``);

    // Add svg icons for delete and refresh buttons
    let x_img = document.createElement("img");
    x_img.classList.add("x-img");
    x_img.src = "/svg/delete.svg";

    del.appendChild(x_img);

    let refresh = tag("button","task-refresh", ``);

    let r_img = document.createElement("img");
    r_img.classList.add("refresh-img");
    r_img.src = "/svg/refresh.svg";

    refresh.appendChild(r_img);

    let description = tag("div", "task-description", task.description);
    let due = tag("div", "task-due", formatter.format(dueDate));

    // Extra styling for completed tasks
    if (task.completed) {
        title.classList.add("task-done");
        description.classList.add("task-done");
        taskClickable.classList.add("task-done-click");
    }

    // Task Completion on clicking main content
    taskClickable.addEventListener("click", async () => {
        await toggleTask(task.taskID, task.completed);
        hydrateTasks();
        // Defined in js/statsPreview.js
        // Adds money if the task is completed, subtracts if uncompleted
        addToday(task.completed ? -task.value : task.value);
    } );

    // Task deletion 
    del.addEventListener("click", async () => {
        await deleteTask(task.taskID);
        hydrateTasks();
    } );

    // Task deletion refresh
    refresh.addEventListener("click", async () => {
        await refreshTask(task.taskID);
        hydrateTasks();
    } );

    taskClickable.appendChild(title);
    taskClickable.appendChild(description);

    // Due date not displayed for completed task
    if (!task.completed) {
        taskClickable.appendChild(due);
    }

    li.appendChild(taskClickable);
    li.appendChild(del);

    // Refresh button only displayed for completed tasks
    if (task.completed) {
        li.appendChild(refresh);
    }

    return li;
}

/**
 * Callback for task completion
 */
async function toggleTask(id, completed) { 

    // Whether or not the function should complete or uncomplete a task
    let end = completed ? "uncomplete" : "complete"

    // Since the API only has /complete and /uncomplete, we dynamically
    // change which endpoint we request to get toggle functionality
    const res = await fetch(`/api/v1/tasks/${id}/${end}`, {
        method: "PUT",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();

        let balanceElement = document.getElementById("balance");
        let accountBalance = document.getElementById("account-balance");

        // There is no reason to send back a request to database to find
        // out the new balance, we have all the info on client side
        // by reading the data off of the balance element, stripping the dollar 
        // sign and converting to Number
        let clientBalance = Number(balanceElement.textContent.substring(1));

        if (!completed) {
            send_notification("Task completed!");
            // We to balance if completion
            clientBalance += out.task.value;
        }
        else {
            // We subtract from balance if not completion
            clientBalance -= out.task.value;
        }
        // Balance is represented twice on the website (in the header and account popup)
        balanceElement.innerHTML = "$" + clientBalance;
        accountBalance.textContent = "$" + clientBalance;

    }
    else {
        const error = await res.json();
        alert("Error: " + error.error);

    }
}

/**
 * Callback for the delete button
 */
async function deleteTask(id) { 

    const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "DELETE",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        // We give the option to undo a deletion
        send_notification("Task deleted", undoDeletion);
        // Add it to the undo stack
        taskDeletedStack.push(out.old_task.taskID);
    }
    else {
        const error = await res.json();
        alert("Error: " + error.error);

    }
}


/**
 * Function which restores a deleted task
 */
async function restoreTask(id) { 

    const res = await fetch(`/api/v1/tasks/${id}/restore`, {
        method: "PUT",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        hydrateTasks();
    }
    else {
        const error = await res.json();
        alert("Error: " + error.error);

    }
}

/**
 * Call back for the refresh button
 */
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

/**
 * Function which reads the global taskDeletedStack, reading the topmost
 * value and restoring it.
 */
async function undoDeletion() {
    let last_deleted_id = taskDeletedStack.pop();
    if (last_deleted_id) {
        await restoreTask(last_deleted_id);
    }
}

/**
 * Simple helper function for creating HTML DOM elements with a className
 * and textContent
 */
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

    // get the form data for the request as a JS Object
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
        // JS object is converted to JSON in request body
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const err = await response.json();
        errorMessage.textContent = err.error || "Task Creation failed";
        return;
    }

    const result = await response.json();

    if (result.success) {
        // Refresh tasks as there is a new one
        hydrateTasks();
    }
    else {
        errorMessage.textContent = result.message || "Failed to Create Task";

    }



});
