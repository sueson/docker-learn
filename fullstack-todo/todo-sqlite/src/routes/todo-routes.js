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
router.post('/', (req, res) => {
    const { task } = req.body;
    const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);

    const result = insertTodo.run(req.userId, task);
    res.json({ id: result.lastInsertRowid, task, completed: 0 });
})

// Update a todo...
router.put('/:id', (req, res) => {
    const { completed } = req.body;
    // for accessing id req.params is used...
    const { id } = req.params;
    // for query purpose req.query is used...
    // const{ page } = req.query;

    const updatedTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ?`)
    updatedTodo.run(completed, id);

    res.json({ message: 'Todo completed' });
})

// Delete a todo...
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`)
    deleteTodo.run(id, userId);

    // immediate disappear from client once delete is done, without send any response only refresh the browser to see the changes... 
    res.send({ message: "Todo deleted" });
})


export default router;