/**
 * Booking Control Handler - Status Filtering and Dynamic Calendar Engine
 */

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let windowBookingData = []; // Local cache of database bookings

async function initBookingControl() {
    console.log('Initializing Booking Control...');
    const container = document.getElementById('booking-control');
    if (!container) return;

    await fetchBookings();
    
    // Initial Render
    renderBookingList('all');
    renderCalendar(currentMonth, currentYear);
    
    // Setup UI Interactions
    initFilters();
    initCalendarNav();
    initViewToggle();
}

/**
 * Fetch all bookings from the backend
 */
async function fetchBookings() {
    const token = localStorage.getItem('token');
    try {
        console.log("📡 Fetching real-time bookings...");
        const response = await fetch(`${window.API_URL}/admin/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();
        if (json.success) {
            windowBookingData = json.data;
            console.log(`✅ Loaded ${windowBookingData.length} bookings.`);
        }
    } catch (err) {
        console.error("🔥 Fetch Bookings Failed:", err);
    }
}

/**
 * Renders the Booking List with status filtering
 */
function renderBookingList(status) {
    const listContainer = document.getElementById('active-booking-list');
    if (!listContainer) return;

    const filtered = status === 'all' ? windowBookingData : windowBookingData.filter(b => b.status === status);

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-dim);">No ${status} bookings found.</div>`;
        return;
    }

    listContainer.innerHTML = filtered.map(booking => {
        // Handle date formatting
        const dateObj = new Date(booking.booking_date);
        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        return `
            <div class="booking-list-item ${booking.status}" data-id="${booking.id}">
                <div class="customer-info">
                    <h4>${booking.customer_name}</h4>
                    <p><i class="fas fa-car"></i> ${booking.make_model} (${booking.plate_number})</p>
                </div>
                <div class="booking-service">
                    <span class="service-tag">${booking.service_type.toUpperCase()}</span>
                </div>
                <div class="booking-time">
                    <p>${formattedDate}</p>
                    <span>${booking.booking_time}</span>
                </div>
                <div class="booking-actions">
                    <span class="status-pill status-${booking.status}">${booking.status.toUpperCase()}</span>
                    ${booking.status === 'pending' ? `
                        <button class="action-circle-btn btn-approve" onclick="updateBookingStatus(${booking.id}, 'approved')" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${booking.status === 'approved' ? `
                        <button class="action-circle-btn btn-complete" onclick="updateBookingStatus(${booking.id}, 'completed')" title="Mark Completed" style="background: var(--accent-green); color: black;">
                            <i class="fas fa-flag-checkered"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
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
        
        // Match with database date (ensuring local date string match)
        const bookingsForDay = windowBookingData.filter(b => {
            const bDate = new Date(b.booking_date).toISOString().split('T')[0];
            return bDate === dateStr;
        });

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}" id="cal-day-${dateStr}">
                <span class="calendar-day-num">${day}</span>
                <div class="booking-indicators-container">
                    ${bookingsForDay.map(b => `<div class="booking-indicator ${b.status}"></div>`).join('')}
                </div>
                ${bookingsForDay.length > 0 ? `
                    <div class="day-tooltip">
                        <strong>${bookingsForDay.length} Bookings</strong>
                        ${bookingsForDay.map(b => `<div style="margin-top:5px; font-size: 0.7rem;">• ${b.customer_name} (${b.booking_time})</div>`).join('')}
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
 * Synchronization Action (Backend Integrated)
 */
window.updateBookingStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${window.API_URL}/admin/bookings/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            window.showSuccessToast(`Booking marked as ${newStatus}!`);
            await fetchBookings(); // Refresh cache
            
            // Re-render current active filter
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.status || 'all';
            renderBookingList(activeFilter);
            renderCalendar(currentMonth, currentYear);
        } else {
            const err = await response.json();
            alert("Update Failed: " + err.message);
        }
    } catch (err) {
        console.error("🔥 Status Update Error:", err);
    }
};

window.initBookingControl = initBookingControl;

window.initBookingControl = initBookingControl;
