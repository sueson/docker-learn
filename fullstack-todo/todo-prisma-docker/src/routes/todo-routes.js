import express from 'express';
import prisma from '../prisma-client.js';


const router = express.Router();

// Get all todos...
router.get('/', async(req, res) => {
    console.log('Fetching todos for userId:', req.userId);

    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId
        }
    })
    
    res.json(todos);
});

// Create a todo...
router.post('/', async(req, res) => {
    const { task } = req.body;
    
    const todo = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })
    res.json(todo);
})

// Update a todo...
router.put('/:id', async(req, res) => {
    const { completed } = req.body;
    // for accessing id req.params is used...
    const { id } = req.params;

    const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: req.userId,
        },
        data: {
            // !! turns into boolean value...
            completed: !!completed
        }
    })

    res.json(updatedTodo);
})

// Delete a todo...
router.delete('/:id', async(req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId
        }
    })

    // immediate disappear from client once delete is done, without send any response only refresh the browser to see the changes... 
    res.send({ message: "Todo deleted" });
})


export default router;