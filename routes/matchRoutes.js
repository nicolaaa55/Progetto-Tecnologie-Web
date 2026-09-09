const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { Match, User } = require('../models');
const {
    fetchRandomWikipediaArtistArticle,
    isValidRandomArtistArticleTitle
} = require('../services/wikipedia');
const { maskText } = require('../controllers/matchController');
const { optionalAuthenticateToken } = require('../middlewares/authMiddleware');

function normalizeArtistName(value) {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s*\([^)]*\)\s*$/, '');
}


router.get('/leaderboard', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const wonMatches = await Match.findAll({
            where: { status: 'WON' },
            include: [{
                model: User,
                as: 'player',
                attributes: ['id', 'username']
            }]
        });

        const statsByUser = {};

        wonMatches.forEach(match => {
            if (!match.userId) {
                return;
            }

            const userId = match.userId;
            const username = match.player ? match.player.username : `Utente #${userId}`;

            const durationInSeconds = Math.max(
                0,
                Math.round((new Date(match.endTime) - new Date(match.startTime)) / 1000)
            );

            if (!statsByUser[userId]) {
                statsByUser[userId] = {
                    userId,
                    username,
                    wonMatchesCount: 0,
                    totalTimeSeconds: 0
                };
            }

            statsByUser[userId].wonMatchesCount += 1;
            statsByUser[userId].totalTimeSeconds += durationInSeconds;
        });

        const leaderboard = Object.values(statsByUser).map(player => ({
            userId: player.userId,
            username: player.username,
            wonMatchesCount: player.wonMatchesCount,
            averageTimeSeconds: Math.round(player.totalTimeSeconds / player.wonMatchesCount)
        }));

        leaderboard.sort((a, b) => {
            if (b.wonMatchesCount !== a.wonMatchesCount) {
                return b.wonMatchesCount - a.wonMatchesCount;
            }
            return a.averageTimeSeconds - b.averageTimeSeconds;
        });

        res.json(leaderboard);
    } catch (error) {
        console.error("Errore nel recupero della leaderboard:", error);
        res.status(500).json({ error: "Errore nel caricamento della classifica." });
    }
});


router.get('/completed', optionalAuthenticateToken, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const userId = req.user?.userId ?? null;
        const guestId = typeof req.headers['x-guest-id'] === 'string'
            ? req.headers['x-guest-id']
            : null;
        const completedMatches = await Match.findAll({
            where: {
                status: { [Op.in]: ['WON', 'ABANDONED'] },
                userId,
                guestId: userId ? null : guestId
            },
            include: [{
                model: User,
                as: 'player',
                attributes: ['username']
            }],
            order: [['endTime', 'DESC']],
            limit: 200
        });

        const formattedMatches = completedMatches
            .filter(m => isValidRandomArtistArticleTitle(m.targetTitle))
            .slice(0, 50)
            .map(m => {
            const durationInSeconds = m.endTime && m.startTime
                ? Math.round((new Date(m.endTime) - new Date(m.startTime)) / 1000)
                : null;

            return {
                id: m.id,
                player: m.player ? m.player.username : 'Anonimo',
                attempts: m.attempts,
                status: m.status,
                durationSeconds: durationInSeconds,
                completedAt: m.endTime,
                title: m.targetTitle,
                maskedText: maskText(m.originalText, m.guessedWords || [])
            };
            });

        res.json(formattedMatches);
    } catch (error) {
        console.error("Errore nel recupero partite concluse:", error);
        res.status(500).json({ error: "Errore nel caricamento delle partite concluse." });
    }
});


router.post('/new', optionalAuthenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId ?? null;
        const guestId = userId ? null : req.headers['x-guest-id'];

        const activeMatch = userId || guestId
            ? await Match.findOne({
                where: { userId, guestId: userId ? null : guestId, status: 'IN_PROGRESS' },
                order: [['startTime', 'DESC']]
            })
            : null;

        if (activeMatch
            && activeMatch.selectionMode === 'MEDIAWIKI_RANDOM_ARTIST'
            && isValidRandomArtistArticleTitle(activeMatch.targetTitle)) {
            return res.json({
                message: "Partita in corso recuperata.",
                matchId: activeMatch.id,
                maskedText: maskText(activeMatch.originalText, activeMatch.guessedWords || [])
            });
        }

        if (activeMatch) {
            activeMatch.status = 'ABANDONED';
            activeMatch.endTime = new Date();
            await activeMatch.save();
        }

        const artistData = await fetchRandomWikipediaArtistArticle();
        
        if (!artistData || !artistData.text) {
             return res.status(500).json({ error: "Errore nel recupero dati da Wikipedia" });
        }

        const newMatch = await Match.create({
            userId: userId,
            guestId,
            selectionMode: 'MEDIAWIKI_RANDOM_ARTIST',
            targetTitle: artistData.title,
            originalText: artistData.text,
            guessedWords: [],
            attempts: 0,
            status: 'IN_PROGRESS'
        });

        const maskedContent = maskText(artistData.text, []);

        res.status(201).json({
            message: "Nuova partita creata con successo!",
            matchId: newMatch.id,
            maskedText: maskedContent
        });

    } catch (error) {
        console.error("Errore durante la creazione della partita:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});


router.post('/:id/guess', optionalAuthenticateToken, async (req, res) => {
    try {
        const matchId = req.params.id;
        const { guess } = req.body; 
        
        const userId = req.user?.userId ?? null;
        const guestId = userId ? null : req.headers['x-guest-id'];

        if (typeof guess !== 'string' || !guess.trim()) {
            return res.status(400).json({ error: "Il tentativo (guess) è obbligatorio." });
        }

        const match = await Match.findOne({
            where: { id: matchId, userId, guestId }
        });

        if (!match) {
            return res.status(404).json({ error: "Partita non trovata." });
        }
        if (match.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: "Questa partita è già conclusa." });
        }

        const normalizedGuess = normalizeArtistName(guess);
        const targetTitleLower = normalizeArtistName(match.targetTitle);
        
        match.attempts += 1;

        if (normalizedGuess === targetTitleLower) {
            match.status = 'WON';
            match.endTime = new Date();
            
            await match.save();
            
            return res.json({
                status: 'WON',
                message: "Hai vinto! Hai indovinato l'artista.",
                attempts: match.attempts,
                fullText: match.originalText 
            });
        }

        let currentGuesses = match.guessedWords;
        
        if (!currentGuesses.includes(normalizedGuess)) {
            currentGuesses.push(normalizedGuess);
            match.guessedWords = currentGuesses; 
            match.changed('guessedWords', true);
        }

        const updatedMaskedText = maskText(match.originalText, match.guessedWords);

        await match.save();

        res.json({
            status: 'IN_PROGRESS',
            attempts: match.attempts,
            maskedText: updatedMaskedText
        });

    } catch (error) {
        console.error("Errore durante il tentativo:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

router.post('/:id/abandon', optionalAuthenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId ?? null;
        const match = await Match.findOne({
            where: {
                id: req.params.id,
                userId,
                guestId: userId ? null : req.headers['x-guest-id']
            }
        });

        if (!match) {
            return res.status(404).json({ error: "Partita non trovata." });
        }
        if (match.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: "Questa partita è già conclusa." });
        }

        match.status = 'ABANDONED';
        match.endTime = new Date();
        await match.save();

        res.json({
            status: match.status,
            attempts: match.attempts,
            title: match.targetTitle,
            maskedText: maskText(match.originalText, match.guessedWords || [])
        });
    } catch (error) {
        console.error("Errore durante l'abbandono della partita:", error);
        res.status(500).json({ error: "Errore interno del server." });
    }
});

module.exports = router;