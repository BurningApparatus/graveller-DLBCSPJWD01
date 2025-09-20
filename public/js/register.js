
const form = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop normal form submission
    errorMessage.textContent = ''; // reset error

    confirmPassword = document.getElementById('confirm-password').value;
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };


    if (formData.password != confirmPassword) {
        errorMessage.textContent = "Passwords do not match";
        return;
    }

    const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const err = await response.json();
        errorMessage.textContent = err.error || "Register failed";
        return;
    }

    const result = await response.json();

    if (result.success) {
        window.location.href = "/dashboard.html";
    }
    else {
        errorMessage.textContent = result.message || "Failed to Register";

    }



    console.log(result);
});
