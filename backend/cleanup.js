const db = require('./config/db');

async function cleanup() {
    try {
        const query = "UPDATE bookings SET status = 'pending' WHERE status = '' OR status IS NULL;";
        const [result] = await db.execute(query);
        console.log(`✅ Database Cleanup Successful! Rows affected: ${result.affectedRows}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Database Cleanup Failed:", err);
        process.exit(1);
    }
}

cleanup();
