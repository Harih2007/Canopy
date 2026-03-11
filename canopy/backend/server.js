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

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

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
