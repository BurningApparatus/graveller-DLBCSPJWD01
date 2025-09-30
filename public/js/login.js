
// Login form handling
const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal form submission
    errorMessage.textContent = ''; // reset error

    // We get the JSON body from the form fields
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const err = await response.json();
        errorMessage.textContent = err.error || "Login failed";
        return;
    }

    const result = await response.json();

    if (result.success) {
        // If successful, we should be ok to go to the dasboard
        window.location.href = "/dashboard";
    }
    else {
        errorMessage.textContent = result.message || "Failed to Login";

    }



});
