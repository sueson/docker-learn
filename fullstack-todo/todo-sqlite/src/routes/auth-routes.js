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

    // Encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Add a new user to the database
    const insertUser = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(insertUser, [username, hashedPassword], function (err) {
        if (err) {
            console.error("Error inserting user:", err.message);
            return res.status(500).json({ message: "Failed to register user" });
        }

        // Retrieve the user ID (this.lastID provides the last inserted row ID)
        const userId = this.lastID;
        console.log("Retrieved user ID:", userId);

        // Add the user's first default todo
        const defaultTodo = `Hello :) Add your first todo!`;
        const insertTodo = `INSERT INTO todos (user_id, task) VALUES (?, ?)`;
        db.run(insertTodo, [userId, defaultTodo], (err) => {
            if (err) {
                console.error("Error inserting todo:", err.message);
                return res.status(500).json({ message: "Failed to create default todo" });
            }

            // Create a JWT token for the new user
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
            console.log("Token generated for user ID:", userId);

            res.json({ token });
        });
    });
});

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