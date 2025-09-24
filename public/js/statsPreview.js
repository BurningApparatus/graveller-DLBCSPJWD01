
async function hydrateDailyEarnings() {
    let chart = document.getElementById("daily-earnings-chart");

    const response = await fetch("/api/v1/auth/stats", {
        method: "GET",
        credentials: "include" 
    });

    if (response.ok) {
        const stats = await response.json();
        console.log(stats);

        chart.innerHTML = ""; // clear
        console.log(chart);

        let today = Date.now();
        let one_day = 24 * 60 * 60 * 1000;


        // To create the bar chart for the past 14 days, we need a 14 length
        // array which has the total for each day. Index 0 wil be 14 days ago 
        // and Index 13 will be today.
        let bar_data = new Array(14).fill(0);
        
        // For each date which appears in the body, we set the corresponding
        // value in the bar chart to that value.
        stats.forEach((stat) => {
            let stat_date = new Date(stat.date);
            // We convert the date into the corresponding array index
            let days_between = Math.round((today - stat_date) / one_day);
            let index = 14 - days_between;
            bar_data[index] = Math.abs(stat.total);
            //console.log(`${stat_date} - ${index}`); 
        })
        console.log(bar_data);
        // Magic to get max element of array
        let max = Math.max.apply(Math, bar_data);
        for (let i = 0; i < 14; i++) {
            // The corresponding date
            let date = new Date(today - one_day * (13 - i));
            let bar = createBarHTML(
                bar_data[i] / max, 
                14, 
                `${date.getMonth()+1}/${date.getDate()}`, 
                bar_data[i],
                (i == 13)
            );
            chart.appendChild(bar);


        }
    }

}

function createBarHTML(percent, bars, key, value, highlight) {
    
    let container = document.createElement("div");
    container.classList.add("bar-container");
    let div = document.createElement("div");
    div.classList.add("bar");
    if (highlight) {
        div.classList.add("bar-highlight"); 
    }
    div.style["height"] = `${Math.floor(percent * 100)}%`
    container.style["width"] = `${Math.floor(100 / bars) - 1}%`

    let label = document.createElement("span");
    label.classList.add("bar-label")
    label.textContent = key;
    let quantity = document.createElement("span");
    quantity.classList.add("bar-quantity")
    quantity.textContent = value;
    container.appendChild(label);
    container.appendChild(div);
    container.appendChild(quantity);
    //div.textContent = key;
    return container;
}

hydrateDailyEarnings();
