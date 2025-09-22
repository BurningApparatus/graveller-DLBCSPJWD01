
async function hydrateRewards() {
    let rewardlist = document.getElementById("rewardlist");

    const response = await fetch("/api/v1/rewards/", {
        method: "GET",
        credentials: "include" 
    });

    rewardlist.innerHTML = ""; // clear
    if (response.ok) {
        const rewards = await response.json();
        //tasks.sort((a, b) => a.completed - b.completed);

        rewards.forEach((reward) => {
            //let li = document.createElement("li");
            //li.appendChild(document.createTextNode(task.name));
            rewardlist.appendChild(createRewardHTML(reward));
        })

    }
}

function createRewardHTML(task) {
    let li = document.createElement("li");
    li.classList.add("task");
    li.classList.add("reward-li");

    

    let rewardClickable = tag("button", "task-click", "");
    rewardClickable.classList.add("reward-click");



    let non_completion_section = tag("div","non-completion", ``);

    let title = tag("span","task-title", `${task.name} - $${task.value}`);
    let del = tag("button","task-delete", `X`);
    let description = tag("div", "task-description", task.description);

    let completions = tag("div", "reward-completions", task.completions);

    let balElement = document.getElementById("balance");
    let clientBalance = Number(balElement.textContent.substring(1));

    if (task.value > clientBalance) {
        rewardClickable.classList.add("reward-expensive")
        completions.classList.add("reward-text-light");
    }
    else {
        title.classList.add("reward-text");
        completions.classList.add("reward-text");
        description.classList.add("reward-text");
    }


    rewardClickable.addEventListener("click", async () => {
        await completeReward(task.rewardID);
        hydrateRewards();
    } );
    del.addEventListener("click", async () => {
        await deleteReward(task.rewardID);
        hydrateRewards();
    } );


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
    //li.appendChild(del);

    return li;
}

async function completeReward(id) { 

    const res = await fetch(`/api/v1/rewards/${id}/complete`, {
        method: "PUT",
        credentials: "include" 
    });

    if (res.ok) {
        const out = await res.json();
        let balElement = document.getElementById("balance");

        console.log(out);
        let clientBalance = Number(balElement.textContent.substring(1));

        clientBalance -= out.old_reward.value;

        balElement.innerHTML = "$" + clientBalance;
        account_balance.textContent = "$" + clientBalance;
    }
    else {

        const error = await res.json();
        alert("Error: " + error.error);
    }
}

async function deleteReward(id) { 

    const res = await fetch(`/api/v1/rewards/${id}`, {
        method: "DELETE",
        credentials: "include" 
    });

    if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.error);
    }
}
hydrateRewards();


