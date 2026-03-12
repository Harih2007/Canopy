require('dotenv').config();
const mysql = require('mysql2/promise');
const https = require('https');
const http = require('http');

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'CanopyZoo/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('Invalid JSON')); }
            });
        }).on('error', reject);
    });
}

(async () => {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'canopy_zoo'
    });

    const [animals] = await c.query('SELECT id, animal_name, image_url FROM animals');

    console.log('=== Fetching Wikipedia images for all animals ===\n');

    for (const animal of animals) {
        // Skip if admin already set a custom image
        if (animal.image_url && animal.image_url.trim().length > 0) {
            console.log(`  ✓ ${animal.animal_name} — already has custom image, skipping`);
            continue;
        }

        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(animal.animal_name)}`;
            const data = await fetchJSON(url);

            if (data.thumbnail && data.thumbnail.source) {
                // Get a larger version by replacing the size in the URL
                const imageUrl = data.thumbnail.source.replace(/\/\d+px-/, '/800px-');
                await c.query('UPDATE animals SET image_url = ? WHERE id = ?', [imageUrl, animal.id]);
                console.log(`  ✓ ${animal.animal_name} — saved: ${imageUrl.substring(0, 80)}...`);
            } else if (data.originalimage && data.originalimage.source) {
                await c.query('UPDATE animals SET image_url = ? WHERE id = ?', [data.originalimage.source, animal.id]);
                console.log(`  ✓ ${animal.animal_name} — saved original: ${data.originalimage.source.substring(0, 80)}...`);
            } else {
                console.log(`  ✗ ${animal.animal_name} — no image found on Wikipedia`);
            }
        } catch (err) {
            console.log(`  ✗ ${animal.animal_name} — error: ${err.message}`);
        }
    }

    // Show final state
    const [updated] = await c.query('SELECT id, animal_name, image_url FROM animals ORDER BY id');
    console.log('\n=== Final State ===');
    updated.forEach(a => {
        const status = a.image_url ? '✓' : '✗';
        console.log(`  ${status} #${a.id} ${a.animal_name}: ${a.image_url ? a.image_url.substring(0, 70) + '...' : 'NO IMAGE'}`);
    });

    await c.end();
    console.log('\nDone!');
})();
