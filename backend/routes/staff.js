const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

console.log("📁 Route Triggered: [Staff Route]");

// @route   GET /api/admin/staff
// @desc    Get all employees
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }
        const [employees] = await db.execute("SELECT id, full_name, email, phone, created_at FROM users WHERE role = 'employee'");
        res.json({ success: true, data: employees });
    } catch (err) {
        console.error("🔥 GET EMPLOYEES CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   DELETE /api/admin/staff/:id
// @desc    Remove an employee
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
        }
        const employeeId = req.params.id;
        const [activeTasks] = await db.execute("SELECT COUNT(*) as count FROM bookings WHERE assigned_employee_id = ? AND status != 'completed'", [employeeId]);
        
        if (activeTasks[0].count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete employee with active tasks.' });
        }

        await db.execute("DELETE FROM users WHERE id = ? AND role = 'employee'", [employeeId]);
        res.json({ success: true, message: 'Employee removed successfully!' });
    } catch (err) {
        console.error("🔥 DELETE EMPLOYEE CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
