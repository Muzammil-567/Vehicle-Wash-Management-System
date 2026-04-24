var API_URL = "http://localhost:5000/api";

/**
 * Customer Live Tracking System
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchMyBookings();
    // Real-time polling every 5 seconds
    setInterval(fetchMyBookings, 5000);
});

async function fetchMyBookings() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('active-wash-list');
    if (!token || !container) return;

    try {
        const response = await fetch(API_URL + "/customer/bookings", {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            renderBookings(json.data);
        }
    } catch (err) {
        console.error("Failed to fetch customer bookings:", err);
    }
}

function renderBookings(bookings) {
    const container = document.getElementById('active-wash-list');
    if (!container) return;

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div style="background: var(--card-bg); padding: 30px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-align: center; color: var(--text-dim);">
                <i class="fas fa-info-circle" style="display: block; font-size: 1.5rem; margin-bottom: 10px; color: var(--neon-blue);"></i>
                No active bookings found. Start by booking a wash!
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    // Only show active or recent bookings
    const activeBookings = bookings.filter(b => b.status !== 'completed').slice(0, 3);
    const bookingsToDisplay = activeBookings.length > 0 ? activeBookings : bookings.slice(0, 1);

    bookingsToDisplay.forEach(booking => {
        const card = createTrackingCard(booking);
        container.appendChild(card);
    });
}

function createTrackingCard(booking) {
    const div = document.createElement('div');
    div.className = 'tracking-card animate-fade-in';
    div.style.cssText = `
        background: var(--card-bg, #0a0e17);
        border-radius: 20px;
        padding: 25px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;

    const currentStatus = booking.status || 'pending';
    const statusSteps = ['pending', 'assigned', 'in_progress', 'completed'];
    const currentIndex = statusSteps.indexOf(currentStatus === '' ? 'pending' : currentStatus);

    const stepsHtml = statusSteps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        let color = 'rgba(255,255,255,0.1)';
        let extraClass = '';
        
        if (isActive) {
            if (currentStatus === 'completed') {
                color = 'var(--neon-green)';
                extraClass = 'completed';
            } else {
                color = 'var(--neon-blue)';
                if (isCurrent && step === 'in_progress') {
                    extraClass = 'pulse-neon';
                }
            }
        }

        const icon = (index < currentIndex || currentStatus === 'completed') ? '<i class="fas fa-check" style="font-size: 0.5rem; color: #000;"></i>' : '';

        return `
            <div class="status-step" style="flex: 1; text-align: center; position: relative; z-index: 1;">
                <div class="step-dot ${extraClass}" style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; transition: all 0.4s ease; ${isCurrent ? `box-shadow: 0 0 15px ${color};` : ''}">
                    ${icon}
                </div>
                <span style="font-size: 0.65rem; text-transform: uppercase; color: ${isActive ? 'white' : 'var(--text-dim)'}; font-weight: ${isCurrent ? '800' : '500'}; letter-spacing: 0.5px;">
                    ${step === 'in_progress' ? 'Washing' : (step === 'assigned' ? 'Staff Ready' : step.replace('_', ' '))}
                </span>
            </div>
        `;
    }).join('');

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-car-side" style="color: var(--neon-blue);"></i>
                    <h4 style="color: white; font-size: 1.1rem; margin: 0;">${booking.make_model}</h4>
                </div>
                <p style="color: var(--text-dim); font-size: 0.85rem; margin: 0;">Plate: <span style="color: white;">${booking.plate_number}</span> | <span style="color: var(--neon-blue); font-weight: 600;">${booking.service_type.toUpperCase()}</span></p>
            </div>
            <div style="text-align: right;">
                <span style="display: block; color: var(--neon-green); font-weight: 800; font-size: 1.2rem; text-shadow: 0 0 10px rgba(0,255,148,0.3);">RS. ${booking.total_price}</span>
                <span style="font-size: 0.75rem; color: var(--text-dim);">${new Date(booking.booking_date).toLocaleDateString()}</span>
            </div>
        </div>

        <div class="tracking-progress-wrapper" style="position: relative; padding: 10px 0;">
            <div class="progress-line" style="position: absolute; top: 17px; left: 12%; right: 12%; height: 2px; background: rgba(255,255,255,0.05); z-index: 0;">
                <div class="progress-fill" style="width: ${(Math.max(0, currentIndex) / (statusSteps.length - 1)) * 100}%; height: 100%; background: ${currentStatus === 'completed' ? 'var(--neon-green)' : 'var(--neon-blue)'}; transition: width 0.8s ease, background 0.4s ease; box-shadow: 0 0 10px ${currentStatus === 'completed' ? 'var(--neon-green)' : 'var(--neon-blue)'};"></div>
            </div>
            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                ${stepsHtml}
            </div>
        </div>

        ${currentStatus === 'completed' ? `
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="openFeedbackModal(${booking.id})" class="btn-primary" style="background: var(--neon-green); color: black; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%;">
                    <i class="fas fa-star"></i> Rate Your Wash
                </button>
            </div>
        ` : ''}
    `;

    return div;
}

