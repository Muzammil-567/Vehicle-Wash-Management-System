const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        console.log("Resetting A1@gmail.com password to 'admin123'...");
        const [result] = await db.execute(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            [hash, 'A1@gmail.com']
        );
        
        if (result.affectedRows > 0) {
            console.log("✅ Admin password reset successfully!");
        } else {
            console.log("❌ User A1@gmail.com not found!");
        }
    } catch (err) {
        console.error("Failed to reset password:", err);
    } finally {
        process.exit();
    }
}

resetAdmin();
