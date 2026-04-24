/**
 * Booking Control Handler - Status Filtering and Dynamic Calendar Engine
 */

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const bookingData = [
    { id: 1, customer: "Arsalan Javed", vehicle: "Honda Civic (White)", service: "Elite Detailing", date: "2024-04-19", time: "10:00 AM", status: "pending" },
    { id: 2, customer: "Mehak Ali", vehicle: "Toyota Fortuner (Black)", service: "Ceramic Coating", date: "2024-04-19", time: "02:00 PM", status: "approved" },
    { id: 3, customer: "Zainab Bibi", vehicle: "Audi A4 (Blue)", service: "Interior Steam", date: "2024-04-21", time: "11:00 AM", status: "completed" },
    { id: 4, customer: "Omar Khan", vehicle: "Suzuki Swift (Red)", service: "Hydro Wash", date: "2024-04-25", time: "09:00 AM", status: "approved" }
];

function initBookingControl() {
    console.log('Initializing Booking Control...');
    const container = document.getElementById('booking-control');
    if (!container) return;

    renderBookingList('all');
    renderCalendar(currentMonth, currentYear);
    initFilters();
    initCalendarNav();
    initViewToggle();
}

/**
 * Renders the Booking List with status filtering
 */
function renderBookingList(status) {
    const listContainer = document.getElementById('active-booking-list');
    if (!listContainer) return;

    const filtered = status === 'all' ? bookingData : bookingData.filter(b => b.status === status);

    listContainer.innerHTML = filtered.map(booking => `
        <div class="booking-list-item ${booking.status}">
            <div class="customer-info">
                <h4>${booking.customer}</h4>
                <p><i class="fas fa-car"></i> ${booking.vehicle}</p>
            </div>
            <div class="booking-service">
                <span class="service-tag">${booking.service}</span>
            </div>
            <div class="booking-time">
                <p>${booking.date}</p>
                <span>${booking.time}</span>
            </div>
            <div class="booking-actions">
                <span class="status-pill status-${booking.status}">${booking.status.toUpperCase()}</span>
                ${booking.status === 'pending' ? `
                    <button class="action-circle-btn btn-approve" onclick="updateBookingStatus(${booking.id}, 'approved')" title="Approve"><i class="fas fa-check"></i></button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Dynamic Calendar Rendering Engine
 */
function renderCalendar(month, year) {
    const daysContainer = document.getElementById('calendar-days-injected');
    const monthDisplay = document.getElementById('month-display');
    if (!daysContainer) return;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0=Sun, 1=Mon... in JS)
    let emptyCells = firstDay === 0 ? 6 : firstDay - 1;

    let html = '';
    // Paddings for previous month
    for (let i = 0; i < emptyCells; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;
        const bookingsForDay = bookingData.filter(b => b.date === dateStr);

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}" id="cal-day-${dateStr}">
                <span class="calendar-day-num">${day}</span>
                <div class="booking-indicators-container">
                    ${bookingsForDay.map(b => `<div class="booking-indicator ${b.status}"></div>`).join('')}
                </div>
                ${bookingsForDay.length > 0 ? `
                    <div class="day-tooltip">
                        <strong>${bookingsForDay.length} Bookings</strong>
                        ${bookingsForDay.map(b => `<div style="margin-top:5px; font-size: 0.7rem;">• ${b.customer} (${b.time})</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    daysContainer.innerHTML = html;
}

/**
 * Initialization Helpers
 */
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBookingList(btn.dataset.status);
        };
    });
}

function initCalendarNav() {
    const prev = document.getElementById('prev-month');
    const next = document.getElementById('next-month');

    if (prev) prev.onclick = () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    };

    if (next) next.onclick = () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    };
}

function initViewToggle() {
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            document.getElementById('booking-list-view').classList.toggle('active', view === 'list');
            document.getElementById('booking-calendar-view').classList.toggle('active', view === 'calendar');
        };
    });
}

/**
 * Synchronization Action
 */
window.updateBookingStatus = (id, newStatus) => {
    const booking = bookingData.find(b => b.id === id);
    if (!booking) return;

    booking.status = newStatus;
    renderBookingList(document.querySelector('.filter-btn.active').dataset.status);
    renderCalendar(currentMonth, currentYear);

    // Flash Sync Visual
    const dayEl = document.getElementById(`cal-day-${booking.date}`);
    if (dayEl) {
        dayEl.classList.add('flash-sync');
        setTimeout(() => dayEl.classList.remove('flash-sync'), 1000);
    }
};

window.initBookingControl = initBookingControl;
