
/**
 * Creates the bar chart from GET /api/v1/auth/stats
 */
async function hydrateDailyEarnings() {
    let chart = document.getElementById("daily-earnings-chart");

    // This gets an array containing a summary of earnings for the 
    // past 14 days
    const response = await fetch("/api/v1/auth/stats", {
        method: "GET",
        credentials: "include" 
    });

    if (response.ok) {
        const stats = await response.json();

        chart.innerHTML = ""; // clear

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
            bar_data[index] = stat.total;
            //console.log(`${stat_date} - ${index}`); 
        })

        // Get max element of array
        let max = Math.max.apply(Math, bar_data);
        for (let i = 0; i < 14; i++) {
            // The corresponding date
            let date = new Date(today - one_day * (13 - i));
            let bar = createBarHTML(
                // We divide by max to normalize bar heights from 0 to 1
                Math.max(bar_data[i],0) / max, 
                14, // 14 bars
                `${date.getMonth()+1}/${date.getDate()}`, // Bar key for month/day
                bar_data[i], // Bar value
                (i == 13) // The bar should be highlighted when i = 13 (today)
            );
            chart.appendChild(bar);


        }
    }

}

/**
 * Create the HTML DOM element for a bar in the bar chart
 *
 * @param {number} perecent - a number from 0 to 1 representing the height of the bar
 * @param {number} bars - The number of bars
 * @param {string} key - The value displayed at the bottom of the bar
 * @param {string} value - The value displayed at the top of the bar
 * @param {boolean} highlight - Whether the bar should be given the "bar-highlight" class
 */
function createBarHTML(percent, bars, key, value, highlight) {
    
    let container = document.createElement("div");
    container.classList.add("bar-container");
    let div = document.createElement("div");
    div.classList.add("bar");

    // Highlight
    if (highlight) {
        div.classList.add("bar-highlight"); 
    }

    // We set the bar height to the percentage
    div.style["height"] = `${Math.floor(percent * 100)}%`

    // We set the bar width to be proportional to the total amount of bars
    container.style["width"] = `${Math.floor(100 / bars) - 1}%`

    let label = document.createElement("span");
    label.classList.add("bar-label")
    // Set the label
    label.textContent = key;
    let quantity = document.createElement("span");
    quantity.classList.add("bar-quantity")
    // Set the quantity
    quantity.textContent = value;

    container.appendChild(label);
    container.appendChild(div);
    container.appendChild(quantity);
    return container;
}

hydrateDailyEarnings();
