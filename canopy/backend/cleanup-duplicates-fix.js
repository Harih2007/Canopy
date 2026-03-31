require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanupDuplicates() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'canopy_zoo'
        });

        console.log('✅ Connected!');

        // Get all animals
        const [animals] = await connection.query('SELECT * FROM animals ORDER BY id');
        console.log(`Found ${animals.length} total animals`);

        // Find duplicates by name
        const seen = new Map();
        const toDelete = [];

        for (const animal of animals) {
            if (seen.has(animal.animal_name)) {
                // This is a duplicate
                const original = seen.get(animal.animal_name);
                
                // Keep the one with image_url, delete the one without
                if (animal.image_url && !original.image_url) {
                    // Current has image, delete original
                    toDelete.push(original.id);
                    seen.set(animal.animal_name, animal);
                } else {
                    // Delete current, keep original
                    toDelete.push(animal.id);
                }
            } else {
                seen.set(animal.animal_name, animal);
            }
        }

        console.log(`Found ${toDelete.length} duplicates to delete`);

        // Delete duplicates
        for (const id of toDelete) {
            await connection.query('DELETE FROM animals WHERE id = ?', [id]);
            console.log(`Deleted animal ID: ${id}`);
        }

        // Show remaining animals
        const [remaining] = await connection.query('SELECT id, animal_name, image_url FROM animals ORDER BY id');
        console.log('\n✅ Remaining animals:');
        remaining.forEach(a => {
            console.log(`  ID ${a.id}: ${a.animal_name} - ${a.image_url ? 'Has image' : 'No image'}`);
        });

        await connection.end();
        console.log('\n✅ Cleanup complete!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

cleanupDuplicates();
