/**
 * Customer Authentication Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginToggle) {
        loginToggle.addEventListener('click', () => {
            loginToggle.classList.add('active');
            signupToggle.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        });
    }

    if (signupToggle) {
        signupToggle.addEventListener('click', () => {
            signupToggle.classList.add('active');
            loginToggle.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Login Logic
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const hostname = window.location.hostname;
            const API_URL = `http://${hostname}:5000/api/auth/login`;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    
                    // Force Customer Check (Optional security on frontend)
                    if (data.user.role !== 'customer') {
                        alert('This portal is for customers only. Please use the Staff Portal.');
                        window.location.href = '../../admin/html/loginportal.html';
                        return;
                    }

                    window.location.href = '../html/index.html';
                } else {
                    alert(data.message || 'Invalid credentials');
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        });
    }

    // Signup Logic
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const full_name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name, email, password, phone, role: 'customer' })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    alert('Account Created Successfully!');
                    loginToggle.click();
                    signupForm.reset();
                } else {
                    alert(data.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
            }
        });
    }
});
