


/**
 * Function which sends a request to /api/v1/auth/info to get user information
 * to popuplate the header and account popup
 */
async function getInfo() {
    const response = await fetch("/api/v1/auth/info", {
        method: "GET",
        credentials: "include" 
    });

    if (response.ok) {
        const user = await response.json();
        populateHeaderInfo(user.username, user.balance);

        return user;
    } else {
        // If we aren't logged in, redirect to login screen
        window.location.href = "/login.html";
        return null;
    }
}

/**
 * Function which populates the DOM elements relating to the user with the 
 * given information
 */
function populateHeaderInfo(username, balance) {

    const greeting = document.getElementById("greeting");
    let balanceElement = document.getElementById("balance");
    const account_name = document.getElementById("account-name");
    const account_balance = document.getElementById("account-balance");

    greeting.textContent = `Greetings, ${username}`
    balanceElement.textContent = `$${balance}`

    account_name.textContent = `User: ${username}`;
    account_balance.textContent = `Balance: ${balance}`;
}

/**
 * Perform logout using /auth/logout POST request
 */
async function performLogout() {

    const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include" 
    });

    if (response.ok) {
        const user = await response.json();
        window.location.reload();
        return user;
    } else {
        return null;
    }
}

/**
 * Perform account deletion using /auth/info DELETE request
 */
async function performDeletion() {

    // Basic HTML popup to confirm account deletion
    let userConfirm = confirm("Are you sure you want to delete your account? This action is not reversible.");

    if (userConfirm) {

        const response = await fetch("/api/v1/auth/info", {
            method: "DELETE",
            credentials: "include" 
        });

        if (response.ok) {
            const user = await response.json();
            // Reloading should redirect to login page
            // as deleting also logs the user out
            window.location.reload();
            return user;
        } else {
            return null;
        }
    }

}

/**
 * Generic onclick callback function for buttons which open popups
 */
function activate_popup(popup_id) {
    document.getElementById(popup_id).style.display = "block";
}

/**
 * Function for sending a notification using the notification popup html elements
 * @param message The text content of the notification
 * @param button_callback Optional argument for adding a callback function for the button. The button only appears when button_callback is specified
 */
function send_notification(message, button_callback=null) {
    let notification_container = document.getElementById("notification-container");

    // Clear the container
    notification_container.innerHTML = "";

    

    // Add the user text
    let notification_text = generateNotificationText(message)
    notification_container.appendChild(notification_text);

    // If the caller adds a callback function, create a button with that 
    // functionality
    if (button_callback != null) {
        let button = generateNotificationButton(button_callback);
        notification_container.appendChild(button);
    }

    // Then activiate the popup
    activate_popup("notification-popup");
    // Automatically close after 5 seconds
    setTimeout(close_notification, 5000);
}

/**
 * Function for generating notification text. This function will fail if the
 * notification-container element has not been cleared beforehand
 */
function generateNotificationText(text) {
    let el = document.createElement("span");
    el.id = "notification-text";
    el.textContent = text;

    return el;

}

/**
 * Function for generating a button with a specific callback. 
 * This function will fail if the notification-container element has not been cleared 
 * beforehand.
 */
function generateNotificationButton(callback) {
    let button = document.createElement("button");
    button.id = "notification-button";
    button.classList.add("dot-button");
    button.textContent = "Undo";

    button.addEventListener("click", () => { 
        callback();
        // We also add the close_notification function after the callback by default
        close_notification();
    });
    return button;

}

/**
 * Function for closing the notification 
 */
function close_notification() {
    let notification_popup = document.getElementById("notification-popup");
    notification_popup.style.display = "none";
}

/**
 * Function for opening the task tab in responsive view
 */
function taskTab() {
    let task_preview = document.getElementById("task-preview");
    let non_tasks = document.getElementById("non-tasks");

    non_tasks.classList.add("tab-hidden");
    task_preview.classList.remove("tab-hidden");
}

/**
 * Function for opening the rewards tab in responsive view
 */
function rewardTab() {
    let task_preview = document.getElementById("task-preview");
    let non_tasks = document.getElementById("non-tasks");
    let reward_preview = document.getElementById("reward-tab");
    let stat_preview = document.getElementById("stats-tab");

    non_tasks.classList.remove("tab-hidden");
    stat_preview.classList.add("tab-hidden");
    task_preview.classList.add("tab-hidden");

    reward_preview.classList.remove("tab-hidden")
}

/**
 * Function for opening the stats tab in responsive view
 */
function statTab() {
    let task_preview = document.getElementById("task-preview");
    let non_tasks = document.getElementById("non-tasks");
    let reward_preview = document.getElementById("reward-tab");
    let stat_preview = document.getElementById("stats-tab");

    non_tasks.classList.remove("tab-hidden");
    reward_preview.classList.add("tab-hidden")
    task_preview.classList.add("tab-hidden");

    stat_preview.classList.remove("tab-hidden");

}


// Behaviour for clearing notifications once the user clicks anywhere
window.addEventListener("click", (event) => {
    const task_popup = document.getElementById("task-popup")
    const account_popup = document.getElementById("account-popup");
    const reward_popup = document.getElementById("reward-popup");
    if (event.target == task_popup) {
        task_popup.style.display = "none";
    }
    if (event.target == account_popup) {
        account_popup.style.display = "none";
    }
    if (event.target == reward_popup) {
        reward_popup.style.display = "none";
    }
})

getInfo();

