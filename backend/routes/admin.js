const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// @route   GET /api/admin/stats
// @desc    Get real-time statistics for the Admin Dashboard
// @access  Private (Admin only)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const [
            [revResult],
            [custResult],
            [pendingResult],
            [totalBookResult]
        ] = await Promise.all([
            db.execute("SELECT SUM(total_price) AS total_revenue FROM bookings WHERE status = 'completed'"),
            db.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'"),
            db.execute("SELECT COUNT(*) AS total_pending FROM bookings WHERE status IN ('pending', 'assigned', 'in_progress')"),
            db.execute("SELECT COUNT(*) AS total_bookings FROM bookings")
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue: revResult[0].total_revenue || 0,
                totalCustomers: custResult[0].total_customers || 0,
                totalPending: pendingResult[0].total_pending || 0,
                totalBookings: totalBookResult[0].total_bookings || 0
            }
        });

    } catch (err) {
        console.error("🔥 ADMIN STATS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Alias for requested route name
router.get('/dashboard-stats', authMiddleware, (req, res) => {
    res.redirect('/api/admin/stats');
});

// @route   GET /api/admin/bookings
// @desc    Get detailed booking information
// @access  Private (Admin only)
router.get('/bookings', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const query = `
            SELECT b.id, u.full_name AS customer_name, v.make_model, v.plate_number, 
                   b.service_type, b.booking_date, b.booking_time, b.status, b.total_price 
            FROM bookings b 
            JOIN users u ON b.customer_id = u.id 
            JOIN vehicles v ON b.vehicle_id = v.id 
            ORDER BY b.created_at DESC LIMIT 10
        `;
        const [bookings] = await db.execute(query);

        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error("🔥 ADMIN BOOKINGS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (filtered by role) with booking counts
// @access  Private (Admin only)
router.get('/users', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const { role } = req.query; 
        if (!role) return res.status(400).json({ success: false, message: 'Role parameter is required.' });

        const query = `
            SELECT u.id, u.full_name, u.email, u.phone, u.created_at, COUNT(b.id) AS total_bookings
            FROM users u
            LEFT JOIN bookings b ON u.id = b.customer_id OR u.id = b.assigned_employee_id
            WHERE u.role = ?
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `;
        const [users] = await db.execute(query, [role]);

        res.json({ success: true, data: users });
    } catch (err) {
        console.error("🔥 GET USERS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   POST /api/admin/users
// @desc    Add a new user (Customer or Employee)
// @access  Private (Admin only)
router.post('/users', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const { full_name, email, phone, password, role } = req.body;
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = "INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)";
        await db.execute(query, [full_name, email, phone || null, hashedPassword, role]);

        res.json({ success: true, message: `New ${role} added successfully!` });
    } catch (err) {
        console.error("🔥 ADD USER CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Private (Admin only)
router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const userId = req.params.id;
        const { full_name, email, phone } = req.body;

        if (!full_name || !email) {
            return res.status(400).json({ success: false, message: 'Name and Email are required.' });
        }

        const query = "UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?";
        await db.execute(query, [full_name, email, phone || null, userId]);

        res.json({ success: true, message: 'User updated successfully!' });
    } catch (err) {
        console.error("🔥 UPDATE USER CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const userId = req.params.id;
        const [activeBookings] = await db.execute("SELECT id FROM bookings WHERE (customer_id = ? OR assigned_employee_id = ?) AND status != 'completed'", [userId, userId]);
        
        if (activeBookings.length > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete user with active tasks or bookings.' });
        }

        await db.execute("DELETE FROM users WHERE id = ?", [userId]);
        res.json({ success: true, message: 'User deleted successfully!' });
    } catch (err) {
        console.error("🔥 DELETE USER CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});



module.exports = router;
