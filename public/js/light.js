
// function for toggling dark mode
// This is in a separate file for reusability purposes

// We store the user preference in localStorage so that it persists
// If the user doesn't have a preference, the default is to set
// document attribute to light
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}
else {

    document.documentElement.setAttribute('data-theme', "light");
}


function toggleDark() {
    let theme = document.documentElement.getAttribute('data-theme');

    // The set and get Attribute functions can allow for the changing of 
    // values of CSS (defined in /css/colors.css). allowing for
    // very easy light/dark mode toggle
    if (theme == 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); 
    }
    else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); 
    }
}


