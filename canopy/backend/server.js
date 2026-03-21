require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const animalRoutes = require('./routes/animals');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Image proxy route to avoid CORS issues
app.get('/api/image-proxy', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).send('Missing url parameter');
    }

    try {
        const https = require('https');
        const http = require('http');
        const client = imageUrl.startsWith('https') ? https : http;

        client.get(imageUrl, { headers: { 'User-Agent': 'CanopyZoo/1.0' } }, (imageRes) => {
            // Forward the content type
            res.setHeader('Content-Type', imageRes.headers['content-type'] || 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
            imageRes.pipe(res);
        }).on('error', (err) => {
            console.error('Image proxy error:', err.message);
            res.status(500).send('Failed to fetch image');
        });
    } catch (err) {
        console.error('Image proxy error:', err.message);
        res.status(500).send('Failed to fetch image');
    }
});

// API Routes
app.use('/api/animals', animalRoutes);
app.use('/api', authRoutes);

// Fallback: serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🌿 CANOPY server running on http://localhost:${PORT}`);
});
