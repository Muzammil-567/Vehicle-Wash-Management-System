const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));

async function checkTables() {
    try {
        const [rows] = await db.execute("SHOW TABLES");
        console.log("Tables in database:", rows.map(r => Object.values(r)[0]));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

checkTables();
