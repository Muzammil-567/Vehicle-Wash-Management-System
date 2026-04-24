var API_URL = "http://localhost:5000/api";

/**
 * Authentication & Redirect Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            fetch(API_URL + "/auth/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    
                    const userRole = data.user.role || data.role; // Ensure we grab the role
                    localStorage.setItem('userRole', userRole);   // Save it for route guards

                    if (userRole === 'admin') {
                        window.location.replace('/frontend/admin/html/index.html');
                    } else if (userRole === 'employee') {
                        window.location.replace('/frontend/employee/html/index.html');
                    } else {
                        window.location.replace('/frontend/customer/html/index.html');
                    }
                } else {
                    alert(data.message || 'Login failed');
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                alert('An error occurred during login');
            });
        });
    }
});
