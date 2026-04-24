/**
 * Admin Dashboard Utilities - Shared helper functions and global state
 */

// Global API Configuration
window.API_URL = "http://localhost:5000/api";

/**
 * Professional Neon Success Toast
 * Displays a pulsing notification at the top of the screen
 */
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'neon-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Initial state set by CSS, this triggers the entrance animation
    setTimeout(() => toast.classList.add('visible'), 10);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove('visible');
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Attach to window for global access
window.showSuccessToast = showSuccessToast;

/**
 * Form Validator - Checks if all required fields in a form are filled
 */
window.validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const required = form.querySelectorAll('[required]');
    
    required.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ff4b2b';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
};
