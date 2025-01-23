import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma-client.js';

import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();

// Register a new user endpoint...
router.post('/register', async(req, res) => {
    const { username, password } = req.body;

    // Encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        // Add a new user to the database
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });
        console.log(user);

        // Add the user's first default todo
        const defaultTodo = `Hello :) Add your first todo!`;
        await prisma.todo.create({
            data: {
                task: defaultTodo,
                userId: user.id
            }
        });

        // Create a JWT token for the new user
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token });
    } catch (error) {
        console.log(error);
        res.sendStatus(503)
    }
});

// Login a existing user endpoint...
router.post('/login', async(req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Synchronously compare the string password with the hashed password...
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).send({ message: "Invalid password" });
        }
        console.log(user);

        // If authentication was successful...
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });

    } catch (error) {
        console.log(error);
        res.sendStatus(503);
    }
});


export default router;