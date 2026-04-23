const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'glossflow_db',
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
