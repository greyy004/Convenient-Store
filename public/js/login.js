document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Login failed');

        if (!data.user) throw new Error('User data missing from response');

        // Redirect based on isadmin
        if (data.user.is_admin === true) {
            location.assign('/admin/dashboard');
        } else {
            location.assign('/user/dashboard');
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});
