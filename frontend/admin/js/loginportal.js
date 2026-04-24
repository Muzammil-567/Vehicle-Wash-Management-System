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

            // Robust API URL Detection
            const hostname = window.location.hostname;
            const API_URL = `http://${hostname}:5000/api/auth/login`;
            
            console.log(`🔑 [PortalAuth] Attempting login for ${email} at ${API_URL}`);

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                console.log(`📡 [PortalAuth] Response Status: ${response.status}`);
                const data = await response.json();
                console.log(`📦 [PortalAuth] Response Data:`, data);

                if (response.ok && data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userName', data.user.full_name);

                    console.log(`✅ [PortalAuth] Login successful. Role: ${data.user.role}`);

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
                    alert(data.message || 'Access Denied. Please check your credentials.');
                }
            } catch (error) {
                console.error('🔥 [PortalAuth] Critical Fetch Error:', error);
                alert(`Connection Error: Could not reach the authentication server. \nDetails: ${error.message}`);
            }
        });
    }
});
