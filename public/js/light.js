



function toggleDark() {
    let theme = document.documentElement.getAttribute('data-theme');
    console.log(theme);

    if (theme == 'light') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}


document.documentElement.setAttribute('data-theme', 'light');
