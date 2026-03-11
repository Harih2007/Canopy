const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'canopy_zoo_secret_2024';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
}

// GET /api/animals - Get all animals
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM animals ORDER BY last_updated DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/animals/:id - Get single animal
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Animal not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/animals - Add new animal (auth required)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { animal_name, species, enclosure, count } = req.body;
        if (!animal_name || !species || !enclosure) {
            return res.status(400).json({ error: 'animal_name, species, and enclosure are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO animals (animal_name, species, enclosure, count) VALUES (?, ?, ?, ?)',
            [animal_name, species, enclosure, count || 1]
        );
        const [newAnimal] = await pool.query('SELECT * FROM animals WHERE id = ?', [result.insertId]);
        res.status(201).json(newAnimal[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/animals/:id - Update animal (auth required)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { animal_name, species, enclosure, count } = req.body;
        const [result] = await pool.query(
            'UPDATE animals SET animal_name = ?, species = ?, enclosure = ?, count = ? WHERE id = ?',
            [animal_name, species, enclosure, count, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Animal not found' });
        const [updated] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/animals/update-count/:id - Update only count (auth required)
router.put('/update-count/:id', authenticateToken, async (req, res) => {
    try {
        const { count } = req.body;
        if (count === undefined || count === null) {
            return res.status(400).json({ error: 'count is required' });
        }
        const [result] = await pool.query(
            'UPDATE animals SET count = ? WHERE id = ?',
            [count, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Animal not found' });
        const [updated] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/animals/:id - Delete animal (auth required)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM animals WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Animal not found' });
        res.json({ message: 'Animal deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
