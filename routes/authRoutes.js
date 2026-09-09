const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET non definita nel file .env!");
    process.exit(1);
}

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username e password sono obbligatori." });
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: "Username già in uso." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username: username,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: "Utente registrato con successo!", 
            userId: newUser.id 
        });

    } catch (error) {
        console.error("Errore in registrazione:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username e password sono obbligatori." });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: "Credenziali non valide." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenziali non valide." });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login effettuato con successo",
            token: token,
            username: user.username
        });

    } catch (error) {
        console.error("Errore in login:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

module.exports = router;