const db = require('./config/db');

async function createServicesTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50), -- e.g., 'Main Service', 'Package'
                features JSON, -- To store tags like ['Interior', 'Foam Wash']
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.execute(query);
        console.log("✅ Services Table Created Successfully!");
        
        // Seed some initial data if empty
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM services");
        if (rows[0].count === 0) {
            console.log("🌱 Seeding initial services...");
            const seedQuery = `
                INSERT INTO services (service_name, description, price, category, features) VALUES 
                ('Exterior Foam Wash', 'Full exterior foam wash with tire polish.', 1200.00, 'Main Service', '["Exterior", "Foam", "Tire Polish"]'),
                ('Interior Deep Clean', 'Vacuuming, upholstery cleaning, and dashboard polishing.', 1500.00, 'Main Service', '["Interior", "Vacuum", "Deep Clean"]'),
                ('Premium Gloss Package', 'Foam wash + Interior cleaning + Wax coating.', 2500.00, 'Package', '["Foam Wash", "Interior", "Wax Coating"]');
            `;
            await db.execute(seedQuery);
            console.log("✅ Initial services seeded!");
        }
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to create Services Table:", err);
        process.exit(1);
    }
}

createServicesTable();
