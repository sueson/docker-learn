import express from 'express';
import db from '../db.js';


const router = express.Router();

// Get all todos...
router.get('/', (req, res) => {
    console.log('Fetching todos for userId:', req.userId);

    const query = `SELECT * FROM todos WHERE user_id = ?`;
    db.all(query, [req.userId], (err, todos) => {
        if (err) {
            console.error('Error fetching todos:', err.message);
            return res.status(500).json({ message: 'Error retrieving todos' });
        }

        console.log('Retrieved todos:', todos);

        // Ensure rows is an array
        if (!Array.isArray(todos)) {
            return res.json([]);
        }

        res.json(todos);
    });
});

// Create a todo...
router.post('/', (req, res) => {})

// Update a todo...
router.put('/:id', (req, res) => {})

// Delete a todo...
router.delete('/:id', (req, res) => {})


export default router;