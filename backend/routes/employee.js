const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/employee/tasks
// @desc    Get tasks assigned to the logged-in employee
// @access  Private (Employee only)
router.get('/tasks', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'employee') {
            return res.status(403).json({ success: false, message: 'Forbidden. Employee access required.' });
        }

        const employeeId = req.user.id;
        const query = `
            SELECT b.id, v.make_model, v.plate_number, b.service_type, b.booking_date, b.booking_time, b.status 
            FROM bookings b 
            JOIN vehicles v ON b.vehicle_id = v.id 
            WHERE b.assigned_employee_id = ? 
            ORDER BY b.booking_date ASC, b.booking_time ASC
        `;
        const [tasks] = await db.execute(query, [employeeId]);

        res.json({ success: true, data: tasks });
    } catch (err) {
        console.error("🔥 EMPLOYEE GET TASKS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   PUT /api/employee/tasks/:id/status
// @desc    Update status of an assigned task
// @access  Private (Employee only)
router.put('/tasks/:id/status', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'employee') {
            return res.status(403).json({ success: false, message: 'Forbidden. Employee access required.' });
        }

        const { status } = req.body;
        const taskId = req.params.id;
        const employeeId = req.user.id;

        // Ensure they only update tasks assigned to them
        const query = "UPDATE bookings SET status = ? WHERE id = ? AND assigned_employee_id = ?";
        const [result] = await db.execute(query, [status, taskId, employeeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Task not found or not assigned to you.' });
        }

        res.json({ success: true, message: `Task status updated to ${status}` });
    } catch (err) {
        console.error("🔥 EMPLOYEE UPDATE STATUS CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
