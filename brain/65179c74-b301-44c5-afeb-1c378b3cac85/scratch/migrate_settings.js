const path = require('path');
const db = require(path.join(__dirname, '../../../backend/config/db'));

async function migrate() {
    try {
        console.log("🚀 Starting DB Migration...");
        
        // 1. Add profile_image to users
        await db.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image LONGTEXT NULL AFTER role");
        console.log("✅ Users table updated with profile_image column.");

        // 2. Create system_settings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                setting_key VARCHAR(50) UNIQUE NOT NULL,
                setting_value TEXT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ system_settings table created.");

        // 3. Initialize default settings
        const defaults = [
            ['business_name', 'GlossFlow Car Wash'],
            ['business_email', 'support@glossflow.com'],
            ['business_address', 'Gulberg III, Main Boulevard, Lahore, Pakistan'],
            ['currency', 'RS'],
            ['lead_time', '2'],
            ['working_hours_weekday', '09:00 AM - 09:00 PM'],
            ['working_hours_weekend', '10:00 AM - 06:00 PM'],
            ['enable_email_alerts', '1'],
            ['enable_sms_gateway', '0']
        ];

        for (const [key, val] of defaults) {
            await db.execute("INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)", [key, val]);
        }
        console.log("✅ Default settings initialized.");

        console.log("🎉 Migration Complete!");
    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
