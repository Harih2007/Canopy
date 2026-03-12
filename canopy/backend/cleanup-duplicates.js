require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'canopy_zoo'
    });

    console.log('=== Duplicate Cleanup Script ===');

    // Find duplicates by animal_name
    const [dupes] = await c.query(`
        SELECT animal_name, COUNT(*) as cnt, MIN(id) as keep_id
        FROM animals
        GROUP BY animal_name
        HAVING cnt > 1
    `);

    if (dupes.length === 0) {
        console.log('No duplicates found!');
    } else {
        for (const dupe of dupes) {
            console.log(`Found ${dupe.cnt} entries for "${dupe.animal_name}" — keeping id=${dupe.keep_id}, deleting others`);
            await c.query(
                'DELETE FROM animals WHERE animal_name = ? AND id != ?',
                [dupe.animal_name, dupe.keep_id]
            );
        }
        console.log('Duplicates cleaned up!');
    }

    // Also fix Orangutan image_url if it currently shows a red panda
    const [orangutans] = await c.query("SELECT id, image_url FROM animals WHERE animal_name = 'Orangutan'");
    if (orangutans.length > 0) {
        // Clear any incorrect image_url so it falls through to the curated Unsplash image
        await c.query("UPDATE animals SET image_url = NULL WHERE animal_name = 'Orangutan'");
        console.log('Cleared Orangutan image_url to use curated image instead');
    }

    // Show final state
    const [animals] = await c.query('SELECT id, animal_name, species, count, image_url FROM animals ORDER BY id');
    console.log('\n=== Current Animals ===');
    animals.forEach(a => {
        console.log(`  #${a.id} ${a.animal_name} (${a.species}) — count: ${a.count} — image_url: ${a.image_url || '(auto)'}`);
    });

    await c.end();
})();
