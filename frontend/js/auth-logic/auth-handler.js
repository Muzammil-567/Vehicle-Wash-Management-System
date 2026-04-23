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

            // Mock Authentication Logic
            // In production, this would be a fetch() call to /api/auth/login
            console.log('Authenticating:', email);

            // Redirect based on email domain/prefix (Simplified for demo)
            if (email.startsWith('admin')) {
                window.location.href = '../admin/index.html';
            } else if (email.startsWith('employee')) {
                window.location.href = '../employee/index.html';
            } else {
                window.location.href = '../customer/index.html';
            }
        });
    }
});
