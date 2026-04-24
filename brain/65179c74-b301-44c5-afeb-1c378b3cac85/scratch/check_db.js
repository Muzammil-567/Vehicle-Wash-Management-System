const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));

async function checkSchema() {
    try {
        console.log("Checking Users table...");
        const [users] = await db.execute("DESCRIBE users");
        console.log("Users Table Schema:", users.map(c => c.Field));
        
        console.log("Checking Bookings table...");
        const [bookings] = await db.execute("DESCRIBE bookings");
        console.log("Bookings Table Schema:", bookings.map(c => c.Field));
        
        console.log("Checking Services table...");
        const [services] = await db.execute("DESCRIBE services");
        console.log("Services Table Schema:", services.map(c => c.Field));
    } catch (err) {
        console.error("Schema Check Failed:", err);
    } finally {
        process.exit();
    }
}

checkSchema();
