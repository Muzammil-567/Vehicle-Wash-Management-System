const db = require('./config/db');

async function cleanup() {
    try {
        const query = "UPDATE users SET role = 'employee' WHERE full_name LIKE 'E%' OR (role = 'customer' AND email LIKE '%staff%')";
        const [result] = await db.execute(query);
        console.log(`✅ Cleanup Successful! Affected rows: ${result.affectedRows}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup Failed:", err);
        process.exit(1);
    }
}

cleanup();
