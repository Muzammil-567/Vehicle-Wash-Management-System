const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/customer/bookings
// @desc    Get all bookings for the logged-in customer
// @access  Private (Customer only)
router.get('/bookings', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden. Customer access required.' });
        }

        const userId = req.user.id;
        const query = `
            SELECT b.id, v.make_model, v.plate_number, b.service_type, b.booking_date, b.booking_time, b.status, b.total_price 
            FROM bookings b 
            JOIN vehicles v ON b.vehicle_id = v.id 
            WHERE b.customer_id = ? 
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.execute(query, [userId]);
        console.log("📡 Backend Sending Bookings:", bookings);
        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error("🔥 CUSTOMER GET BOOKINGS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   POST /api/customer/feedback
// @desc    Submit feedback for a completed booking
// @access  Private (Customer only)
router.post('/feedback', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Forbidden. Customer access required.' });
        }

        const { booking_id, rating, comment } = req.body;
        const customer_id = req.user.id;

        // Verify booking belongs to customer and is completed
        const [booking] = await db.execute("SELECT id FROM bookings WHERE id = ? AND customer_id = ? AND status = 'completed'", [booking_id, customer_id]);
        
        if (booking.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid booking or wash not completed yet.' });
        }

        // Check if feedback already exists
        const [existing] = await db.execute("SELECT id FROM feedback WHERE booking_id = ?", [booking_id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Feedback already submitted for this booking.' });
        }

        const query = "INSERT INTO feedback (booking_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)";
        await db.execute(query, [booking_id, customer_id, rating, comment]);

        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (err) {
        console.error("🔥 SUBMIT FEEDBACK CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
