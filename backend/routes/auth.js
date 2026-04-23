const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Secret key for JWT (In production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'glossflow_super_secret_key_2026';

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

        // Insert new user (default role is 'customer')
        const role = 'customer';
        const query = "INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, 'customer')";
        const [result] = await db.execute(query, [full_name, email, hashedPassword, phone || null]);

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
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
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
            }
        );

    } catch (error) {
        console.error('[Auth Error] Login failed:', error.message);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

module.exports = router;
