require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDB() {
    try {
        console.log("Connecting to MySQL server...");
        // Connect WITHOUT specifying the database initially
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log("Reading schema.sql...");
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema queries to create the database and tables...");
        await connection.query(schema);

        console.log("Database initialized and randomly seeded successfully!");
        await connection.end();
    } catch (err) {
        console.error("Error initializing database:", err);
    }
}

initDB();
