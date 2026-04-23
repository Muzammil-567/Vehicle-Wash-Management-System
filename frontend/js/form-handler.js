/**
 * Contact Form Logic and Validation Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    // We wait a bit for the component loader to inject the contact section
    setTimeout(initContactForm, 500);
});

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (validateForm(name, email, message)) {
            showSuccessToast();
            contactForm.reset();
        }
    });
}

/**
 * Validates form fields using regex and simple length checks
 */
function validateForm(name, email, message) {
    if (name.length < 2) {
        alert('Please enter a valid name.');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (message.length < 5) {
        alert('Your message is too short.');
        return false;
    }

    return true;
}

/**
 * Displays a neon success toast notification
 */
function showSuccessToast() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Message sent successfully! We will contact you soon.</span>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4000);
}
