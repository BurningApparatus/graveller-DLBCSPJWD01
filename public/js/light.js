



// function for toggling dark mode
// This is in a separate file for reusability purposes
function toggleDark() {
    let theme = document.documentElement.getAttribute('data-theme');
    console.log(theme);

    // The set and get Attribute functions can allow for the changing of 
    // values of CSS (defined in /css/colors.css). allowing for
    // very easy light/dark mode toggle
    if (theme == 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}


document.documentElement.setAttribute('data-theme', 'light');
