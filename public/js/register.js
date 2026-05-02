document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const terms = document.getElementById('terms').checked;

    // --- Validation ---
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }

    if (name.length < 3) {
        showNotification('Name must be at least 3 characters long', 'warning');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'warning');
        return;
    }

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'warning');
        return;
    }

    if (!terms) {
        showNotification('You must agree to the Terms & Conditions', 'warning');
        return;
    }

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await response.json(); // parse JSON first

        if (!response.ok)
            throw new Error(data.message || 'Registration failed');

        flashNotification('Registration successful! Please log in.', 'success');
        window.location.href = '/html/login.html';

    } catch (err) {
        console.error(err);
        showNotification(err.message, 'error');
    }
});
