
// Stack for undoing deleted tasks
const rewardDeletedStack = [];

/**
 * Fill rewardslist <ul> element with rewards from GET /rewards 
 */
async function hydrateRewards() {
    let rewardlist = document.getElementById("rewardlist");

    const response = await fetch("/api/v1/rewards/", {
        method: "GET",
        credentials: "include" 
    });

    rewardlist.innerHTML = ""; // clear
    if (response.ok) {
        const rewards = await response.json();
        // Have lower value (more common) rewards come first
        rewards.rewards.sort((a, b) => a.value - b.value);

        rewards.rewards.forEach((reward) => {
            rewardlist.appendChild(createRewardHTML(reward));
        })

    }
}

/**
 * Creates HTML DOM element for representing rewards from data in object
 */
function createRewardHTML(reward) {
    let li = document.createElement("li");
    li.classList.add("task");
    li.classList.add("reward-li");

    

    let rewardClickable = tag("button", "task-click", "");
    rewardClickable.classList.add("reward-click");



    // This is a container element so that the "completions" number
    // can be left aligned, while everything else (the "non completion section")
    // may be right aligned
    let non_completion_section = tag("div","non-completion", ``);

    let title = tag("span","task-title", `${reward.name} - $${reward.value}`);
    let del = tag("button","task-delete", ``);
    let description = tag("div", "task-description", reward.description);

    let completions = tag("div", "reward-completions", reward.completions);

    let balElement = document.getElementById("balance");
    let clientBalance = Number(balElement.textContent.substring(1));

    if (reward.value > clientBalance) {
        // Add more style for rewards which cannot be afforded
        rewardClickable.classList.add("reward-expensive")
        completions.classList.add("reward-text-light");
    }
    else {
        title.classList.add("reward-text");
        completions.classList.add("reward-text");
        description.classList.add("reward-text");
    }


    // Clicking on the reward completes it
    rewardClickable.addEventListener("click", async () => {
    
        // We get the last known balance from the client
        let clientBalance = Number(balElement.textContent.substring(1));

        // Test whether the user can afford it before purchase 
        if (clientBalance >= reward.value) {
            await completeReward(reward.rewardID);
        }
        else {
            send_notification("You cannot afford this reward!");
        }

        hydrateRewards();
    } );
    // Delete button function
    del.addEventListener("click", async () => {

        await deleteReward(reward.rewardID);

        hydrateRewards();
    } );

    // X svg for delete button
    let del_img = document.createElement("img");
    del_img.classList.add("x-img");
    del_img.src = "/svg/delete.svg";
    del.appendChild(del_img);

    // trophy
    let img = document.createElement("img");
    img.classList.add("trophy-img");
    img.src = "/svg/trophy.svg";
    let br = document.createElement("br");
    //img.alt = "Vector image of trophy";

    non_completion_section.appendChild(img);
    non_completion_section.appendChild(title);
    non_completion_section.appendChild(description);


    rewardClickable.appendChild(non_completion_section);
    rewardClickable.appendChild(completions);

    li.appendChild(rewardClickable);
    li.appendChild(del);

    return li;
}

/**
 * Callback function for completing a reward
 */
async function completeReward(id) { 

    const res = await fetch(`/api/v1/rewards/${id}/complete`, {
        method: "PUT",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        let balElement = document.getElementById("balance");

        let accountBalance = document.getElementById("account-balance");
        send_notification("Reward Redeemed!");

        // We don't have to do an entire request to update the reward
        // completion, we get get the clientBalance from the element
        // and add the corresponding value
        let clientBalance = Number(balElement.textContent.substring(1));

        clientBalance -= out.old_reward.value;

        // Balance is represented twice in the website
        balElement.innerHTML = "$" + clientBalance;
        accountBalance.textContent = "$" + clientBalance;
    }
    else {

        const error = await res.json();
        alert("Error: " + error.error);
    }
}

/**
 * Callback function for deleting a reward
*/
async function deleteReward(id) { 

    const res = await fetch(`/api/v1/rewards/${id}`, {
        method: "DELETE",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        // We give the user an opportunity to undo 
        send_notification("Reward deleted", undoRewardDeletion);
        // Add deleted rewardID 
        rewardDeletedStack.push(out.old_reward.rewardID);
    }
    else {
        const error = await res.json();
        alert("Error: " + error.error);
    }
}

/**
 * Function for undoing a deeted reward from the rewardDeletedStack
*/
async function undoRewardDeletion() {

    let last_deleted_id = rewardDeletedStack.pop();
    if (last_deleted_id) {
        await restoreReward(last_deleted_id);
    }
}

/**
 * Function for restoring a reward using the /rewards/id/restore PUT API 
 * endpoint
 */
async function restoreReward(id) { 

    const res = await fetch(`/api/v1/rewards/${id}/restore`, {
        method: "PUT",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        hydrateRewards();
    }
    else {
        const error = await res.json();
        alert("Error: " + error.error);

    }
}
hydrateRewards();

// Reward creation form
const rewardform = document.getElementById('rewardForm');
const rewardErrorMessage = document.getElementById('rewarderror');

rewardform.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal form submission
    rewardErrorMessage.textContent = ''; // reset error

    // We get the JSON body info from the form inputs
    const formData = {
        name: document.getElementById('rewardname').value,
        description: document.getElementById('rewarddesc').value,
        value: parseInt(document.getElementById('rewardvalue').value),
    };

    const response = await fetch('/api/v1/rewards/', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const err = await response.json();
        rewardErrorMessage.textContent = err.error || "Reward Creation failed";
        return;
    }

    const result = await response.json();

    if (result.success) {
        // We added a reward, now we refresh to see them
        hydrateRewards();
    }
    else {
        rewardErrorMessage.textContent = result.message || "Reward Creation failed";

    }



});
