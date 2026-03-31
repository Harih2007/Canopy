require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'canopy_zoo',
            connectTimeout: 5000 // 5 second timeout
        });
        
        console.log('✅ Connected successfully!');
        
        // Test query
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM animals');
        console.log('✅ Animals in database:', rows[0].count);
        
        await connection.end();
        console.log('✅ Connection closed');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.error('Error code:', err.code);
        process.exit(1);
    }
}

testConnection();
