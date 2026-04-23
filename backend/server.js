const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Allow frontend connections
app.use(express.json()); // Parse JSON bodies

// Static File Serving for Frontend
// Serve the main frontend directory so UI loads correctly
const frontendPath = path.join(__dirname, '../frontend');
app.use('/frontend', express.static(frontendPath));

// API Routes Mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// Root endpoint redirect or standard response
app.get('/', (req, res) => {
    res.send('✅ GlossFlow API Server is Running. Frontend is available at /frontend/customer/index.html');
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
