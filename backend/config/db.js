const mysql = require('mysql2');
require('dotenv').config({ path: __dirname + '/../.env' });

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'glossflow_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test the connection
pool.query('SELECT 1', (err) => {
    if (err) {
        console.error("❌ DB CONNECTION FAILED:", err);
    } else {
        console.log('✅ Connected to MySQL Database (glossflow_db) successfully!');
    }
});

module.exports = promisePool;
