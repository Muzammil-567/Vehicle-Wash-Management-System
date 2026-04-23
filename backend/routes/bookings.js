const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/bookings
// @desc    Create a booking and vehicle
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { make_model, plate_number, service_type, booking_date, booking_time } = req.body;
        const customer_id = req.user.id;

        // Determine total_price (e.g., basic = 15, premium = 30, ceramic = 100)
        let total_price = 0;
        const st = (service_type || '').toLowerCase();
        if (st.includes('basic')) total_price = 15;
        else if (st.includes('premium')) total_price = 30;
        else if (st.includes('ceramic')) total_price = 100;
        else total_price = 50; // fallback

        // INSERT into 'vehicles'
        const vQuery = 'INSERT INTO vehicles (user_id, make_model, plate_number) VALUES (?, ?, ?)';
        const [vResult] = await db.execute(vQuery, [customer_id, make_model, plate_number]);
        
        if (vResult.affectedRows === 0) throw new Error("Vehicle data not saved to DB");
        const vehicle_id = vResult.insertId;
        console.log("✅ Vehicle inserted with ID:", vehicle_id);

        // INSERT into 'bookings'
        const bQuery = "INSERT INTO bookings (customer_id, vehicle_id, service_type, booking_date, booking_time, total_price, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')";
        const [bResult] = await db.execute(bQuery, [customer_id, vehicle_id, service_type, booking_date, booking_time, total_price]);
        
        if (bResult.affectedRows === 0) throw new Error("Booking data not saved to DB");
        const booking_id = bResult.insertId;
        console.log("✅ Booking inserted with ID:", booking_id);

        res.status(201).json({ 
            success: true, 
            message: 'Booking Confirmed!',
            bookingId: booking_id,
            vehicleId: vehicle_id
        });

    } catch (err) {
        console.error("🔥 BOOKING ROUTE CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
