const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/admin/stats
// @desc    Get real-time statistics for the Admin Dashboard
// @access  Private (Admin only)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Security Check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        // Run Queries Concurrently
        const [
            [usersResult],
            [bookingsResult],
            [revenueResult],
            [pendingResult]
        ] = await Promise.all([
            db.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'"),
            db.execute("SELECT COUNT(*) AS total_bookings FROM bookings"),
            db.execute("SELECT SUM(total_price) AS total_revenue FROM bookings"),
            db.execute("SELECT COUNT(*) AS total_pending FROM bookings WHERE status = 'pending'")
        ]);

        const totalCustomers = usersResult[0].total_customers || 0;
        const totalBookings = bookingsResult[0].total_bookings || 0;
        const totalRevenue = revenueResult[0].total_revenue || 0;
        const totalPending = pendingResult[0].total_pending || 0;

        res.json({
            success: true,
            data: {
                totalCustomers,
                totalBookings,
                totalRevenue,
                totalPending
            }
        });

    } catch (err) {
        console.error("🔥 ADMIN STATS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
