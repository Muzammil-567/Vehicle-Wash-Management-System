/**
 * GlossFlow Booking History Logic
 * Handles data rendering, filtering, and tab switching for the history ledger.
 */

const mockHistoryData = [
    {
        id: 'ORD-001',
        date: '2026-04-20',
        time: '09:30 AM',
        vehicle: 'White City',
        plate: 'ABC-1234',
        service: 'Elite Detail',
        price: '5,150',
        status: 'upcoming'
    },
    {
        id: 'ORD-002',
        date: '2026-04-15',
        time: '02:15 PM',
        vehicle: 'Desert Storm',
        plate: 'KJH-882',
        service: 'Pro Wash',
        price: '2,875',
        status: 'completed'
    },
    {
        id: 'ORD-003',
        date: '2026-04-10',
        time: '11:00 AM',
        vehicle: 'White City',
        plate: 'ABC-1234',
        service: 'Starter Wash',
        price: '1,150',
        status: 'completed'
    },
    {
        id: 'ORD-004',
        date: '2026-04-05',
        time: '04:45 PM',
        vehicle: 'Blue Thunder',
        plate: 'XYZ-777',
        service: 'Pro Wash',
        price: '2,875',
        status: 'cancelled'
    }
];

let currentHistoryTab = 'upcoming';

/**
 * Initialize History UI
 */
window.initHistory = function() {
    renderHistoryItems();
}

/**
 * Toggle between Upcoming and Past sub-tabs
 */
window.toggleHistoryTab = function(tab) {
    currentHistoryTab = tab;
    
    // Update active tab UI
    document.querySelectorAll('.h-tab').forEach(t => {
        t.classList.remove('active');
        if (t.dataset.htab === tab) t.classList.add('active');
    });

    renderHistoryItems();
}

/**
 * Render history cards based on active tab and search query
 */
window.renderHistoryItems = function() {
    const container = document.getElementById('history-items-container');
    const searchTerm = document.getElementById('history-search')?.value.toLowerCase() || '';
    
    if (!container) return;

    // Filter by tab status
    let filtered = mockHistoryData.filter(item => {
        if (currentHistoryTab === 'upcoming') {
            return item.status === 'upcoming';
        } else {
            return item.status === 'completed' || item.status === 'cancelled';
        }
    });

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.vehicle.toLowerCase().includes(searchTerm) || 
            item.service.toLowerCase().includes(searchTerm) ||
            item.plate.toLowerCase().includes(searchTerm)
        );
    }

    // Render HTML
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-history" style="font-size: 2rem; opacity: 0.2; margin-bottom: 10px;"></i>
                <p>No ${currentHistoryTab} bookings found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="history-card ${item.status}">
            <div class="h-card-main">
                <span class="h-card-date">${item.date} | ${item.time}</span>
                <span class="h-card-vehicle">${item.vehicle} <span style="font-size: 0.7rem; opacity: 0.5;">${item.plate}</span></span>
                <span class="h-card-service">${item.service}</span>
            </div>
            <div class="h-card-meta">
                <div class="h-status-badge status-${item.status}">${item.status}</div>
                <div class="h-card-price">RS. ${item.price}</div>
                ${item.status !== 'upcoming' ? `
                    <button class="btn-link" style="font-size: 11px; padding: 0;" onclick="triggerReBook('${item.id}')">
                        Re-Book <i class="fas fa-redo" style="font-size: 9px;"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Search filtering
 */
window.filterHistoryList = function() {
    renderHistoryItems();
}

/**
 * Re-booking logic - pre-fills wizard
 */
window.triggerReBook = function(orderId) {
    const order = mockHistoryData.find(o => o.id === orderId);
    if (!order) return;

    console.log(`Re-booking order ${orderId}...`);

    // Pre-fill wizard state globally
    window.currentBooking = {
        vehicleId: order.plate, // Placeholder assignment
        service: {
            id: order.service.toLowerCase().replace(' ', '-'),
            name: order.service,
            basePrice: parseInt(order.price.replace(',', ''))
        },
        addons: [],
        step: 1, // Start at step 1 for sanity, but pre-filled
        total: parseInt(order.price.replace(',', ''))
    };

    // Switch to bookings tab
    const bookingsNav = document.querySelector('[data-tab=bookings]');
    if (bookingsNav) bookingsNav.click();
}
