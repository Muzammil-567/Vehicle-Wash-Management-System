/**
 * GlossFlow Booking Wizard Logic
 * Handles step transitions and data selection during the booking flow.
 */

// Global state for current booking
window.currentBooking = {
    vehicleId: null,
    service: {
        id: null,
        name: null,
        basePrice: 0
    },
    addons: [], // Array of {id, name, price}
    schedule: null,
    step: 1,
    total: 0
};

/**
 * Handle vehicle selection in the wizard.
 */
window.selectWizardVehicle = function(element, vehicleId) {
    console.log(`Wizard: Selected vehicle ${vehicleId}`);
    const allSelectable = document.querySelectorAll('.vehicle-card.selectable');
    allSelectable.forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    window.currentBooking.vehicleId = vehicleId;

    const nextBtn = document.getElementById('btn-next-step');
    if (nextBtn) {
        nextBtn.removeAttribute('disabled');
        nextBtn.classList.add('ready-to-pulse');
    }
}

/**
 * Handle Service Package Selection
 */
window.selectWizardPackage = function(element, pkgId, price) {
    const allCards = document.querySelectorAll('.service-card');
    allCards.forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');

    window.currentBooking.service = {
        id: pkgId,
        name: element.querySelector('h4').textContent,
        basePrice: price
    };

    updateSummary();
    
    // Enable "Next" button for Step 2
    const nextBtn = document.getElementById('btn-next-step');
    if (nextBtn) nextBtn.removeAttribute('disabled');
}

/**
 * Handle Add-on Toggling
 */
window.toggleWizardAddon = function(addonId, price, checkbox) {
    const addonName = checkbox.closest('.addon-item').querySelector('.addon-info span').textContent;
    
    if (checkbox.checked) {
        window.currentBooking.addons.push({ id: addonId, name: addonName, price: price });
    } else {
        window.currentBooking.addons = window.currentBooking.addons.filter(a => a.id !== addonId);
    }

    updateSummary();
}

/**
 * Real-time Price Integration
 */
function updateSummary() {
    const summaryBar = document.getElementById('summary-bar');
    const summaryText = document.getElementById('summary-text');
    const totalDisplay = document.getElementById('summary-total');

    if (!summaryBar) return;

    if (!window.currentBooking.service.id) {
        summaryBar.style.display = 'none';
        return;
    }

    summaryBar.style.display = 'block';
    
    // Calculate Total
    const addonTotal = window.currentBooking.addons.reduce((sum, a) => sum + a.price, 0);
    const total = window.currentBooking.service.basePrice + addonTotal;
    window.currentBooking.total = total;

    // Update UI
    const addonCount = window.currentBooking.addons.length;
    summaryText.textContent = `${window.currentBooking.service.name}${addonCount > 0 ? ` + ${addonCount} Add-ons` : ''}`;
    totalDisplay.textContent = total.toLocaleString();
}

/**
 * Navigation Logic
 */
document.addEventListener('click', (e) => {
    const nextBtn = e.target.closest('#btn-next-step');
    if (nextBtn && !nextBtn.disabled) {
        switch(window.currentBooking.step) {
            case 1: proceedToStep2(); break;
            case 2: proceedToStep3(); break;
            case 3: proceedToStep4(); break;
            case 4: finalizeBooking(); break;
        }
    }
});

window.proceedToStep2 = function() {
    window.currentBooking.step = 2;
    
    // Transitions
    document.getElementById('wizard-step-1').style.display = 'none';
    document.getElementById('wizard-step-2').style.display = 'block';
    document.getElementById('btn-back-step').style.display = 'flex';
    
    // Update Stepper
    document.getElementById('step-marker-1').classList.remove('active');
    document.getElementById('step-marker-1').classList.add('completed');
    document.getElementById('step-marker-1').querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
    document.getElementById('step-marker-2').classList.add('active');

    // Button Reset
    const nextBtn = document.getElementById('btn-next-step');
    nextBtn.querySelector('span').textContent = 'Next: Schedule Time';
    nextBtn.disabled = !window.currentBooking.service.id; 
    nextBtn.classList.remove('ready-to-pulse');
}

window.goBackToStep1 = function() {
    window.currentBooking.step = 1;
    
    // Transitions
    document.getElementById('wizard-step-2').style.display = 'none';
    document.getElementById('wizard-step-1').style.display = 'block';
    document.getElementById('btn-back-step').style.display = 'none';
    document.getElementById('summary-bar').style.display = 'none';
    
    // Update Stepper
    document.getElementById('step-marker-2').classList.remove('active');
    document.getElementById('step-marker-1').classList.add('active');
    document.getElementById('step-marker-1').classList.remove('completed');
    document.getElementById('step-marker-1').querySelector('.step-circle').innerHTML = '1';

    // Button Reset
    const nextBtn = document.getElementById('btn-next-step');
    nextBtn.querySelector('span').textContent = 'Next: Choose Service';
    nextBtn.disabled = false;
    nextBtn.classList.add('ready-to-pulse');
}

window.proceedToStep3 = function() {
    window.currentBooking.step = 3;

    // Transitions
    document.getElementById('wizard-step-2').style.display = 'none';
    document.getElementById('wizard-step-3').style.display = 'block';
    document.getElementById('summary-bar').style.bottom = '110px'; // Shift up for confirmation focus

    // Update Stepper
    document.getElementById('step-marker-2').classList.remove('active');
    document.getElementById('step-marker-2').classList.add('completed');
    document.getElementById('step-marker-2').querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
    document.getElementById('step-marker-3').classList.add('active');

    // Button Update
    const nextBtn = document.getElementById('btn-next-step');
    nextBtn.querySelector('span').textContent = 'Confirm Schedule';
    nextBtn.disabled = true;
    nextBtn.classList.remove('ready-to-pulse');

    // Generate Dates
    generateWizardDates();
}

/**
 * Step 3: Scheduling Logic
 */
window.generateWizardDates = function() {
    const strip = document.getElementById('date-strip');
    if (!strip) return;

    strip.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() + i);
        
        const dateStr = date.toISOString().split('T')[0];
        const card = document.createElement('div');
        card.className = 'date-card';
        card.onclick = () => selectWizardDate(dateStr, card);
        card.innerHTML = `
            <span class="day-short">${days[date.getDay()]}</span>
            <span class="day-num">${date.getDate()}</span>
        `;
        strip.appendChild(card);
    }
}

window.selectWizardDate = function(date, element) {
    document.querySelectorAll('.date-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    
    // Format for preview: "Monday, 20 Apr"
    const day = element.querySelector('.day-short').textContent;
    const num = element.querySelector('.day-num').textContent;
    window.currentBooking.scheduleDateFormatted = `${day}, ${num} Apr`; // Simplified for mock
    window.currentBooking.scheduleDate = date;
    
    checkStep3Ready();
}

window.selectWizardTime = function(time, element) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
    window.currentBooking.scheduleTime = time;
    checkStep3Ready();
}

function checkStep3Ready() {
    const ready = window.currentBooking.scheduleDate && window.currentBooking.scheduleTime;
    const nextBtn = document.getElementById('btn-next-step');
    const preview = document.getElementById('scheduling-preview');

    if (preview) {
        if (ready) {
            preview.innerHTML = `Your car will be washed on <b>${window.currentBooking.scheduleDateFormatted}</b> at <b>${window.currentBooking.scheduleTime}</b>`;
            preview.classList.add('active');
        } else {
            preview.classList.remove('active');
        }
    }

    if (nextBtn && ready) {
        nextBtn.removeAttribute('disabled');
        nextBtn.classList.add('ready-to-pulse');
        nextBtn.querySelector('span').textContent = 'Confirm & Book Your Shine';
    }
}

window.proceedToStep4 = function() {
    window.currentBooking.step = 4;

    // Transitions
    document.getElementById('wizard-step-3').style.display = 'none';
    document.getElementById('wizard-step-4').style.display = 'block';
    document.getElementById('scheduling-preview').style.display = 'none';

    // Populate Data
    document.getElementById('review-vehicle-name').textContent = window.currentBooking.vehicleId || 'Not Selected';
    document.getElementById('review-service-name').textContent = window.currentBooking.service.name || 'Basic Wash';
    document.getElementById('review-schedule-time').textContent = `${window.currentBooking.scheduleDateFormatted} @ ${window.currentBooking.scheduleTime}`;

    // Price Breakdown
    const subtotal = window.currentBooking.service.basePrice;
    const addonsTotal = window.currentBooking.addons.reduce((sum, a) => sum + a.price, 0);
    const tax = Math.round((subtotal + addonsTotal) * 0.15);
    const grandTotal = subtotal + addonsTotal + tax;

    document.getElementById('review-subtotal').textContent = `RS. ${subtotal.toLocaleString()}`;
    document.getElementById('review-addons-total').textContent = `RS. ${addonsTotal.toLocaleString()}`;
    document.getElementById('review-tax').textContent = `RS. ${tax.toLocaleString()}`;
    document.getElementById('review-grand-total').textContent = `RS. ${grandTotal.toLocaleString()}`;

    // Update Stepper
    document.getElementById('step-marker-3').classList.remove('active');
    document.getElementById('step-marker-3').classList.add('completed');
    document.getElementById('step-marker-3').querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
    document.getElementById('step-marker-4').classList.add('active');

    // Button Update
    const nextBtn = document.getElementById('btn-next-step');
    nextBtn.querySelector('span').textContent = 'Confirm & Book Now';
    nextBtn.classList.add('ready-to-pulse');
}

/**
 * Final Phase: Confirmation
 */
window.finalizeBooking = function() {
    const nextBtn = document.getElementById('btn-next-step');
    if (!nextBtn) return;

    // Show Loading State
    const originalText = nextBtn.innerHTML;
    nextBtn.disabled = true;
    nextBtn.innerHTML = '<div class="spinner-Commit"></div> <span>Processing...</span>';
    nextBtn.classList.remove('ready-to-pulse');

    console.log('Finalizing Booking...', window.currentBooking);

    // Simulated API Delay
    setTimeout(() => {
        // Hide UI
        document.getElementById('wizard-step-4').style.display = 'none';
        document.getElementById('summary-bar').style.display = 'none';
        document.querySelector('.wizard-footer').style.display = 'none';
        document.querySelector('.booking-stepper').style.opacity = '0.3';

        // Populate Success Mini Summary
        document.getElementById('success-service-summary').textContent = window.currentBooking.service.name;
        document.getElementById('success-time-summary').textContent = `${window.currentBooking.scheduleDateFormatted} @ ${window.currentBooking.scheduleTime}`;

        // Show Success
        document.getElementById('wizard-success').style.display = 'block';
        
        // Trigger Glow pulse (CSS animation is already on ring)
        console.log('Success! Confetti effect triggered.');
    }, 1500);
}
