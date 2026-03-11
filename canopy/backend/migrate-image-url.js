require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'canopy_zoo'
    });

    // Check if column exists first
    const [cols] = await c.query("SHOW COLUMNS FROM animals LIKE 'image_url'");
    if (cols.length === 0) {
        await c.query('ALTER TABLE animals ADD COLUMN image_url VARCHAR(500)');
        console.log('Column image_url added successfully');
    } else {
        console.log('Column image_url already exists');
    }
    await c.end();
})();
