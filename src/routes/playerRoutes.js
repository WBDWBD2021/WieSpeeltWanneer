const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Debug middleware
router.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Speler routes
router.get('/spelers', playerController.getAllPlayers);
router.get('/spelers/:id', playerController.getPlayerById);
router.post('/spelers', playerController.createPlayer);
router.put('/spelers/:id', playerController.updatePlayer);
router.delete('/spelers/:id', playerController.deletePlayer);

module.exports = router; 