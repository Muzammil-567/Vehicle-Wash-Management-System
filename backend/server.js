const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Allow frontend connections
app.use(express.json()); // Parse JSON bodies

// Static File Serving
// 1. Support legacy links starting with /frontend/
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// 2. Serve the entire frontend folder at root for absolute path support (/shared, /website)
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes Mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/admin/services', require('./routes/services'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admin/staff', require('./routes/staff'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/customer', require('./routes/customer'));

// Root endpoint serves the website landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/website/html/index.html'));
});

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 GlossFlow Server running on http://localhost:${PORT}`);
    console.log(`=================================================\n`);
});
