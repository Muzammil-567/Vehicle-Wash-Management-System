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
promisePool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL Database (glossflow_db) successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error connecting to MySQL Database:', err.message);
    });

module.exports = promisePool;
