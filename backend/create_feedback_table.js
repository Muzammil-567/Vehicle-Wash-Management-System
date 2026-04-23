const db = require('./config/db');

async function createTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY, 
                booking_id INT, 
                customer_id INT, 
                rating INT, 
                comment TEXT, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
                FOREIGN KEY (booking_id) REFERENCES bookings(id),
                FOREIGN KEY (customer_id) REFERENCES users(id)
            );
        `;
        await db.execute(query);
        console.log("✅ Feedback Table Created Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create Feedback Table:", err);
        process.exit(1);
    }
}

createTable();
