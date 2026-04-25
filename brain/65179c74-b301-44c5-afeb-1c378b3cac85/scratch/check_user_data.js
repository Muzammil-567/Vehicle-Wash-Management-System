const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));

async function checkUserData() {
    try {
        const [rows] = await db.execute("SELECT id, full_name, email, role FROM users");
        console.log("Users in database:", rows);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkUserData();