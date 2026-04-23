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
        const vehicle_id = vResult.insertId;

        // INSERT into 'bookings'
        const bQuery = 'INSERT INTO bookings (customer_id, vehicle_id, service_type, booking_date, booking_time, total_price) VALUES (?, ?, ?, ?, ?, ?)';
        await db.execute(bQuery, [customer_id, vehicle_id, service_type, booking_date, booking_time, total_price]);

        res.status(201).json({ success: true, message: 'Booking Confirmed!' });

    } catch (err) {
        console.error("🔥 BOOKING ROUTE CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
