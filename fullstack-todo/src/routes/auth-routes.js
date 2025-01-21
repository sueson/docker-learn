import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();

// Register a new user endpoint...
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    // Encrypt the password...
    const hashedPassword = bcrypt.hashSync(password, 8);
    
    try {
        // adding new user to the database...
        const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        const result = insertUser.run(username, hashedPassword);

        // now have the user, so have to add their first todo...
        const defaultTodo = `Hello :) Add your first todo!`;
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo);

        // create a token...
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
})

// Login a existing user endpoint...
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).send({ message: "username is required" });
    }

    try {
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`);
        getUser.get(username, (err, user) => {
            if(err) {
                console.log('Error retrieving user: ', err);
                return res.status(500).send({ message: 'Error retrieving user' })
            }

            if (!user) {
                return res.status(404).send({ message: "user not found" });
            }

            console.log('Retrieved user:', user);

            // Ensure password is defined
            if (!user.password) {
                console.error('Password is undefined for user:', user);
                return res.status(500).send({ message: "Password is undefined" });
            }

            // Synchronously compare the string password with the hashed password...
            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).send({ message: "Invalid password" });
            }

            // If authentication was successful...
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });

        });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(503);
    }
});


export default router;