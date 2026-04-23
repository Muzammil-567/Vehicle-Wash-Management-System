/**
 * Customer History and Garage Initialization
 */

window.initHistory = async function() {
    console.log("Initializing Booking History...");
    const container = document.getElementById('customer-history-list');
    const token = localStorage.getItem('token');
    if (!container || !token) return;

    try {
        const response = await fetch('http://localhost:5000/api/customer/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            if (json.data.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-dim);">No bookings found in your history.</div>';
                return;
            }

            container.innerHTML = json.data.map(booking => `
                <div class="history-item" style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="color: white; margin: 0;">${booking.make_model}</h4>
                        <p style="color: var(--text-dim); font-size: 0.8rem; margin: 5px 0 0;">${booking.service_type} | ${new Date(booking.booking_date).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: block; color: var(--neon-green); font-weight: bold;">RS. ${booking.total_price}</span>
                        <span style="font-size: 0.7rem; color: ${booking.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-blue)'}; text-transform: uppercase;">${booking.status}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("Failed to load history:", err);
    }
};

window.initGarage = async function() {
    console.log("Initializing My Garage...");
    const container = document.getElementById('customer-garage-list');
    const token = localStorage.getItem('token');
    if (!container || !token) return;

    try {
        const response = await fetch('http://localhost:5000/api/customer/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await response.json();

        if (json.success) {
            // Group by vehicle (plate number)
            const vehicles = {};
            json.data.forEach(b => {
                if (!vehicles[b.plate_number]) {
                    vehicles[b.plate_number] = { make_model: b.make_model, plate_number: b.plate_number };
                }
            });

            const vehicleList = Object.values(vehicles);

            if (vehicleList.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-dim);">Your garage is empty. Book a wash to add a vehicle!</div>';
                return;
            }

            container.innerHTML = vehicleList.map(v => `
                <div class="vehicle-card" style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                    <i class="fas fa-car" style="font-size: 2rem; color: var(--neon-blue); margin-bottom: 15px;"></i>
                    <h3 style="color: white; margin: 0;">${v.make_model}</h3>
                    <p style="color: var(--text-dim); margin: 5px 0 0;">Plate: ${v.plate_number}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("Failed to load garage:", err);
    }
};
