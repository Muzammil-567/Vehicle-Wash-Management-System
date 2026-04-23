/**
 * GlossFlow Customer Booking Wizard Logic
 * Handles step transitions, validation, and submission.
 */

document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
});

function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Extract all form data into a neat JSON object
        const bookingData = {
            vehicleModel: document.getElementById('car-model').value,
            plateNumber: document.getElementById('plate-number').value,
            serviceType: document.getElementById('service-type').value,
            bookingTime: document.getElementById('booking-time').value,
            timestamp: new Date().toISOString()
        };

        console.log('%c [GlossFlow] Booking JSON: ', 'background: #00FF94; color: #000; font-weight: bold;');
        console.table(bookingData);

        // Show professional Alert/Toast
        alert("Booking Received! Wait for Admin confirmation.");
        
        // Reset form and go back to step 1
        bookingForm.reset();
        window.nextStep(1);
    });
}

// Global function to switch between wizard steps
window.nextStep = function(step) {
    // Validation check before moving forward
    const currentActive = document.querySelector('.wizard-step.active');
    
    // If moving forward, check validity
    if (currentActive && parseInt(currentActive.dataset.step) < step) {
        const inputs = currentActive.querySelectorAll('input, select');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });
        if (!isValid) return;
    }

    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    
    // Show target step
    const nextStepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
    if(nextStepEl) {
        nextStepEl.classList.add('active');
        
        // Animation trigger
        nextStepEl.style.opacity = '0';
        requestAnimationFrame(() => {
            nextStepEl.style.transition = 'opacity 0.3s ease';
            nextStepEl.style.opacity = '1';
        });
    }
    
    // Update Header and Progress
    const titles = {
        1: 'Step 1: Vehicle Details',
        2: 'Step 2: Service Selection',
        3: 'Step 3: Schedule Time'
    };
    
    const titleEl = document.getElementById('wizard-step-title');
    if(titleEl) titleEl.textContent = titles[step];
    
    const progressEl = document.getElementById('wizard-progress');
    if(progressEl) progressEl.style.width = (step / 3 * 100) + '%';
};

