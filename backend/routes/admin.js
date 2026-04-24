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
            db.execute("SELECT COUNT(*) AS total_pending FROM bookings WHERE status IN ('pending', 'assigned')"),
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
// @desc    Get all detailed booking information
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
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `;
        const [bookings] = await db.execute(query);

        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error("🔥 ADMIN BOOKINGS FETCH CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   PATCH /api/admin/bookings/:id
// @desc    Update booking status
// @access  Private (Admin only)
router.patch('/bookings/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const { status } = req.body;
        const bookingId = req.params.id;

        if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

        const [result] = await db.execute("UPDATE bookings SET status = ? WHERE id = ?", [status, bookingId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        res.json({ success: true, message: `Booking marked as ${status}!` });
    } catch (err) {
        console.error("🔥 ADMIN BOOKING UPDATE CRASH:", err);
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

// @route   GET /api/admin/employees
// @desc    Alias for getting all employees (used by staff-handler.js)
// @access  Private (Admin only)
router.get('/employees', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const [employees] = await db.execute("SELECT id, full_name, email, phone, created_at FROM users WHERE role = 'employee' ORDER BY created_at DESC");
        res.json({ success: true, data: employees });
    } catch (err) {
        console.error("🔥 GET EMPLOYEES ALIAS CRASH:", err);
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

        const query = "INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)";
        await db.execute(query, [full_name, email, hashedPassword, phone || null, role]);

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



// @route   GET /api/admin/revenue-analytics
// @desc    Get detailed revenue data for charts and breakdowns
// @access  Private (Admin only)
router.get('/revenue-analytics', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        // 1. Monthly Revenue (Last 6 months)
        const monthlyQuery = `
            SELECT DATE_FORMAT(booking_date, '%b') AS label, SUM(total_price) AS value 
            FROM bookings 
            WHERE status = 'completed' 
            AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY MONTH(booking_date)
            ORDER BY MONTH(booking_date) ASC
        `;
        
        // 2. Weekly Revenue (Current month)
        const weeklyQuery = `
            SELECT CONCAT('W', WEEK(booking_date) - WEEK(DATE_SUB(booking_date, INTERVAL DAYOFMONTH(booking_date)-1 DAY)) + 1) AS label, 
                   SUM(total_price) AS value 
            FROM bookings 
            WHERE status = 'completed' 
            AND MONTH(booking_date) = MONTH(CURDATE())
            GROUP BY WEEK(booking_date)
        `;

        // 3. Daily Revenue (Current week)
        const dailyQuery = `
            SELECT DATE_FORMAT(booking_date, '%a') AS label, SUM(total_price) AS value 
            FROM bookings 
            WHERE status = 'completed' 
            AND WEEK(booking_date) = WEEK(CURDATE())
            GROUP BY DAYOFWEEK(booking_date)
            ORDER BY DAYOFWEEK(booking_date) ASC
        `;

        // 4. Service Breakdown (Percentage)
        const breakdownQuery = `
            SELECT service_type AS name, COUNT(*) AS count, SUM(total_price) AS total_revenue
            FROM bookings
            WHERE status = 'completed'
            GROUP BY service_type
        `;

        const [
            [monthly],
            [weekly],
            [daily],
            [breakdown]
        ] = await Promise.all([
            db.execute(monthlyQuery),
            db.execute(weeklyQuery),
            db.execute(dailyQuery),
            db.execute(breakdownQuery)
        ]);

        // Calculate percentages for breakdown
        const totalCompleted = breakdown.reduce((acc, curr) => acc + curr.count, 0);
        const formattedBreakdown = breakdown.map(item => ({
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            percent: Math.round((item.count / totalCompleted) * 100),
            color: item.name.includes('premium') ? 'fill-blue' : (item.name.includes('ceramic') ? 'fill-cyan' : 'fill-green')
        }));

        res.json({
            success: true,
            data: {
                monthly,
                weekly,
                daily,
                breakdown: formattedBreakdown,
                summary: {
                    totalProfit: monthly.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0)
                }
            }
        });

    } catch (err) {
        console.error("🔥 REVENUE ANALYTICS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   GET /api/admin/feedback
// @desc    Get all customer feedback
// @access  Private (Admin only)
router.get('/feedback', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }

        const query = `
            SELECT f.id, f.rating, f.comment, f.created_at, u.full_name AS customer_name, b.service_type
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN bookings b ON f.booking_id = b.id
            ORDER BY f.created_at DESC
        `;
        const [feedback] = await db.execute(query);

        res.json({ success: true, data: feedback });
    } catch (err) {
        console.error("🔥 ADMIN FEEDBACK FETCH CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   GET /api/admin/me
// @desc    Get current admin profile
// @access  Private (Admin only)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [user] = await db.execute("SELECT id, full_name, email, phone, role, created_at, profile_image FROM users WHERE id = ?", [req.user.id]);
        if (user.length === 0) return res.status(404).json({ success: false, message: 'Admin not found.' });
        res.json({ success: true, data: user[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile
// @access  Private (Admin only)
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { full_name, email, phone, profile_image, current_password, new_password } = req.body;
        
        // 1. Basic Info Update
        await db.execute("UPDATE users SET full_name = ?, email = ?, phone = ?, profile_image = ? WHERE id = ?", 
            [full_name, email, phone || null, profile_image || null, req.user.id]);

        // 2. Password Update (if requested)
        if (current_password && new_password) {
            const [user] = await db.execute("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
            const isMatch = await bcrypt.compare(current_password, user[0].password_hash);
            if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password.' });

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(new_password, salt);
            await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, req.user.id]);
        }

        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   GET /api/admin/settings
// @desc    Get all system settings
// @access  Private (Admin only)
router.get('/settings', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT setting_key, setting_value FROM system_settings");
        const settings = {};
        rows.forEach(r => settings[r.setting_key] = r.setting_value);
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/settings', authMiddleware, async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, val] of Object.entries(settings)) {
            await db.execute("UPDATE system_settings SET setting_value = ? WHERE setting_key = ?", [val, key]);
        }
        res.json({ success: true, message: 'Settings updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   POST /api/admin/factory-reset
// @desc    Delete all data except admins
// @access  Private (Admin only)
router.post('/factory-reset', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false });

        // Atomic cleanup
        await db.execute("DELETE FROM feedback");
        await db.execute("DELETE FROM bookings");
        await db.execute("DELETE FROM vehicles");
        await db.execute("DELETE FROM users WHERE role != 'admin'");
        // Keep services or delete? Usually keep.
        
        res.json({ success: true, message: 'System reset complete. All customer/employee records removed.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
