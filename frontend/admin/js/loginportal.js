/**
 * Staff/Admin Portal Authentication Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('portal-login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('portal-email').value;
            const password = document.getElementById('portal-password').value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userName', data.user.full_name);

                    const role = data.user.role;
                    if (role === 'admin') {
                        window.location.href = '../html/index.html';
                    } else if (role === 'employee') {
                        window.location.href = '../../employee/html/index.html';
                    } else {
                        alert('Unauthorized role. Please use the Customer portal.');
                        localStorage.clear();
                        window.location.href = '../../customer/html/loginbook.html';
                    }
                } else {
                    alert(data.message || 'Access Denied');
                }
            } catch (error) {
                console.error('Portal Login error:', error);
                alert('Secure connection failed.');
            }
        });
    }
});
