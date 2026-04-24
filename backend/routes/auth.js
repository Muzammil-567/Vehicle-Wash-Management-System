const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Secret key for JWT (In production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'glossflow_super_secret_key_2026';

// @route   GET /api/services
// @desc    Get all active services for booking
// @access  Public
router.get('/services', async (req, res) => {
    try {
        const [services] = await db.execute("SELECT id, service_name, price, category FROM services WHERE is_active = TRUE");
        res.json({ success: true, data: services });
    } catch (err) {
        console.error("🔥 GET PUBLIC SERVICES CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Customer)
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, password, phone } = req.body;

        // Validation
        if (!full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields (full_name, email, password).' });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user (default role is 'customer' unless specified)
        const role = req.body.role || 'customer';
        const query = "INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.execute(query, [full_name, email, hashedPassword, phone || null, role]);

        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in.'
        });

    } catch (err) {
        console.error("🔥 REGISTRATION CRASH:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        // Check for user
        console.log(`[Auth] Login attempt for: ${email}`);
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            console.log(`[Auth] User not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
        }

        const user = users[0];
        console.log(`[Auth] User found: ${user.email} (Role: ${user.role})`);

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log(`[Auth] Password mismatch for: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
        }

        console.log(`[Auth] Password verified for: ${email}`);

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign token synchronously for cleaner error handling
        try {
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
            console.log(`[Auth] JWT generated for: ${email}`);
            
            res.json({
                success: true,
                message: 'Login successful!',
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (jwtErr) {
            console.error('[Auth] JWT Signing Error:', jwtErr);
            throw jwtErr;
        }

    } catch (error) {
        console.error('[Auth Error] Critical Failure:', error);
        res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
    }
});

module.exports = router;
