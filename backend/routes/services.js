const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

console.log("📁 Route Triggered: [Services Route]");

// @route   GET /api/services
// @desc    Get all active services (Public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const [services] = await db.execute("SELECT id, service_name, price, category, description, features FROM services WHERE is_active = 1");
        res.json({ success: true, data: services });
    } catch (err) {
        console.error("🔥 GET PUBLIC SERVICES CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/services
// @desc    Get all services
// @access  Private (Admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const [services] = await db.execute("SELECT * FROM services ORDER BY created_at DESC");
        res.json({ success: true, data: services });
    } catch (err) {
        console.error("❌ GET SERVICES ERROR:", err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/services
// @desc    Add a new service
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const { service_name, price, category, description, features } = req.body;
        
        // Ensure features is stored as JSON string
        const featuresJson = JSON.stringify(Array.isArray(features) ? features : []);
        
        const query = "INSERT INTO services (service_name, price, category, description, features, is_active) VALUES (?, ?, ?, ?, ?, 1)";
        const [result] = await db.execute(query, [service_name, price, category, description, featuresJson]);
        
        res.status(201).json({ success: true, message: 'Service added successfully!', id: result.insertId });
    } catch (err) {
        console.error("❌ CREATE SERVICE ERROR:", err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   PUT /api/admin/services/:id
// @desc    Update service details
// @access  Private (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const { service_name, price, category, description, features } = req.body;
        const featuresJson = JSON.stringify(Array.isArray(features) ? features : []);
        
        const query = "UPDATE services SET service_name = ?, price = ?, category = ?, description = ?, features = ? WHERE id = ?";
        await db.execute(query, [service_name, price, category, description, featuresJson, req.params.id]);
        
        res.json({ success: true, message: 'Service updated successfully!' });
    } catch (err) {
        console.error("❌ UPDATE SERVICE ERROR:", err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   PATCH /api/admin/services/:id/toggle
// @desc    Toggle service active status
// @access  Private (Admin only)
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const query = "UPDATE services SET is_active = NOT is_active WHERE id = ?";
        await db.execute(query, [req.params.id]);
        
        res.json({ success: true, message: 'Status toggled successfully!' });
    } catch (err) {
        console.error("❌ TOGGLE SERVICE ERROR:", err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// @route   DELETE /api/admin/services/:id
// @desc    Delete a service
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        await db.execute("DELETE FROM services WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Service removed successfully!' });
    } catch (err) {
        console.error("❌ DELETE SERVICE ERROR:", err.message);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;
