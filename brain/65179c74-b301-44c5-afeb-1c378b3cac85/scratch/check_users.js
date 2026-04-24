const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));

async function checkUserTable() {
    try {
        const [rows] = await db.execute("DESCRIBE users");
        console.log("Users Table Structure:", rows);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkUserTable();
