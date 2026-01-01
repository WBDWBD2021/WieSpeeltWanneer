const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// Wedstrijd routes
router.get('/wedstrijden', matchController.getMatches);
router.get('/wedstrijden/:id', matchController.getMatch);
router.get('/wedstrijden/speler/:spelerId', matchController.getMatchesByPlayer);
router.post('/wedstrijden', matchController.createMatch);
router.put('/wedstrijden/:id', matchController.updateMatch);
router.delete('/wedstrijden/:id', matchController.deleteMatch);

// Speler toewijzingen
router.post('/wedstrijden/:id/wijs-spelers-toe', matchController.assignPlayers);
router.post('/wedstrijden/:id/wijs-rollen-toe', matchController.assignRoles);

module.exports = router; 