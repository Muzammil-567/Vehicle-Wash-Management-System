/**
 * GlossFlow Interactive Booking Wizard Logic
 * Handles step transitions and form data collection.
 */

document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
});

/**
 * Initialize the booking form listener
 */
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Gather data into a JSON object
        const formData = new FormData(bookingForm);
        const bookingData = {
            vehicle: formData.get('car-make-model'),
            plate: formData.get('plate-number'),
            service: formData.get('service-type'),
            schedule: formData.get('booking-datetime'),
            timestamp: new Date().toISOString()
        };

        // Log to console as requested
        console.log('%c [Booking Wizard] GATHERED DATA: ', 'background: #00FF94; color: #000; font-weight: bold;');
        console.table(bookingData);

        // Show success state (visual feedback)
        handleSuccessfulBooking(bookingData);
    });
}

/**
 * Global function to switch between wizard steps
 */
window.showStep = function(stepNumber) {
    // Basic validation before moving forward
    if (stepNumber === 2) {
        const make = document.getElementById('car-make-model').value;
        const plate = document.getElementById('plate-number').value;
        if (!make || !plate) {
            alert('Please fill in vehicle details first.');
            return;
        }
    }
    if (stepNumber === 3) {
        const service = document.getElementById('service-type').value;
        if (!service) {
            alert('Please select a service package.');
            return;
        }
    }

    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.style.display = 'none';
    });

    // Show target step
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
        targetStep.style.display = 'block';
        
        // Add fade-in animation
        targetStep.classList.remove('animate-fade-in-up');
        void targetStep.offsetWidth; // Trigger reflow
        targetStep.classList.add('animate-fade-in-up');
    }
};

/**
 * Handle visual success feedback
 */
function handleSuccessfulBooking(data) {
    const wizardCard = document.querySelector('.booking-wizard-card');
    if (wizardCard) {
        wizardCard.innerHTML = `
            <div class="success-view animate-fade-in-up" style="text-align: center; padding: 20px;">
                <div class="success-icon" style="font-size: 4rem; color: var(--neon-green); margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: var(--neon-green); margin-bottom: 10px;">Booking Confirmed!</h2>
                <p style="color: var(--text-muted); margin-bottom: 30px;">Your car wash for <strong>${data.vehicle}</strong> is scheduled.</p>
                <button class="btn-wizard-next" onclick="location.reload()">
                    <i class="fas fa-home"></i> Back to Dashboard
                </button>
            </div>
        `;
    }
}

// Export for re-init when tab changes
window.initBookingWizard = initBookingForm;
