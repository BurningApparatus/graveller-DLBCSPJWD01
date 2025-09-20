const greeting = document.getElementById("greeting");
const balance = document.getElementById("balance");
const logout = document.getElementById("logout-button");
const task_popup = document.getElementById("task-popup")
const popup_button = document.getElementById("task-popup-button");
const account_popup = document.getElementById("account-popup");
const account_popup_button = document.getElementById("account-popup-button");
const account_name = document.getElementById("account-name");
const account_balance = document.getElementById("account-balance");

async function getInfo() {
  const response = await fetch("/api/v1/auth/info", {
    method: "GET",
    credentials: "include" 
  });

  if (response.ok) {
    const user = await response.json();
    console.log("Logged in as:", user.username);
    greeting.textContent = `Greetings, ${user.username}`
    balance.textContent = `$${user.balance}`
    account_name.textContent = `User: ${user.username}`;
    account_balance.textContent = `Balance: ${user.balance}`;
    return user;
  } else {
    console.log(response);
    console.log("Not logged in");
    window.location.href = "/login.html";
    return null;
  }
}

getInfo();


async function performLogout() {

    const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include" 
    });

    if (response.ok) {
        const user = await response.json();
        console.log("Logout Success");
        window.location.reload();
        return user;
    } else {
        console.log("What?");
        return null;
    }
}

async function performDeletion() {

    let userConfirm = confirm("Are you sure you want to delete your account? This action is not reversible.");

    if (userConfirm) {

        const response = await fetch("/api/v1/auth/info", {
            method: "DELETE",
            credentials: "include" 
        });

        if (response.ok) {
            const user = await response.json();
            console.log("Deletion success");
            window.location.reload();
            return user;
        } else {
            console.log("What?");
            return null;
        }
    }

}

function open_popup() {
    task_popup.style.display = "block";
}
function open_account_popup() {
    account_popup.style.display = "block";
}

window.addEventListener("click", (event) => {
  if (event.target == task_popup) {
    task_popup.style.display = "none";
  }
  if (event.target == account_popup) {
    account_popup.style.display = "none";
  }
})
