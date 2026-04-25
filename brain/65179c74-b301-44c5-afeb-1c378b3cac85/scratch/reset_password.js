const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        await db.execute("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, 'E2@gmail.com']);
        console.log("✅ Password for E2@gmail.com reset to: 123456");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

resetPassword();
