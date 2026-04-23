/**
 * GlossFlow Customer Booking Wizard Logic
 * Handles step transitions, validation, and submission.
 */

document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
});

// Export for SPA navigation
window.initBookingWizard = initBookingForm;

function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    // Fetch and populate services dynamically
    fetchActiveServices();

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to book a service.");
            return;
        }

        const make_model = document.getElementById('car-model').value;
        const plate_number = document.getElementById('plate-number').value;
        const service_type = document.getElementById('service-type').value;
        const datetimeVal = document.getElementById('booking-time').value;

        // Extract date and time from datetime-local input (YYYY-MM-DDTHH:MM)
        const [booking_date, booking_time] = datetimeVal.split('T');

        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    make_model,
                    plate_number,
                    service_type,
                    booking_date,
                    booking_time
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert("Booking Confirmed!");
                bookingForm.reset();
                if (window.nextStep) window.nextStep(1);
                if (typeof fetchMyBookings === 'function') fetchMyBookings();
            } else {
                alert(data.message || "Failed to submit booking.");
            }
        } catch (error) {
            console.error("Booking submission error:", error);
            alert("An error occurred. Please try again later.");
        }
    });
}

/**
 * Fetch all active services from DB and populate the select dropdown
 */
async function fetchActiveServices() {
    const select = document.getElementById('service-type');
    if (!select) return;

    try {
        const response = await fetch('http://localhost:5000/api/services');
        const json = await response.json();

        if (json.success && json.data) {
            select.innerHTML = '<option value="" disabled selected>Choose your wash package...</option>';
            json.data.forEach(service => {
                const option = document.createElement('option');
                option.value = service.service_name;
                option.textContent = `${service.service_name} (RS. ${service.price})`;
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Failed to load services for wizard:", err);
    }
}

// Global function to switch between wizard steps
window.nextStep = function (step) {
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
    if (nextStepEl) {
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
    if (titleEl) titleEl.textContent = titles[step];

    const progressEl = document.getElementById('wizard-progress');
    if (progressEl) progressEl.style.width = (step / 3 * 100) + '%';
};

