const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));

async function checkCollation() {
    try {
        const [result] = await db.execute("SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_NAME = 'users'");
        console.log("Users Table Collation:", result[0].TABLE_COLLATION);
    } catch (err) {
        console.error("Failed to check collation:", err);
    } finally {
        process.exit();
    }
}

checkCollation();
