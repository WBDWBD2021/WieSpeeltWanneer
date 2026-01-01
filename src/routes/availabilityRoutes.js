const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// Beschikbaarheid routes
router.get('/beschikbaarheid/wedstrijd/:wedstrijdId/samenvatting', availabilityController.getAvailabilitySummary);
router.get('/beschikbaarheid/wedstrijd/:wedstrijdId/speler/:spelerId', availabilityController.getPlayerAvailability);
router.get('/beschikbaarheid/wedstrijd/:wedstrijdId', availabilityController.getMatchAvailability);
router.put('/beschikbaarheid/wedstrijd/:wedstrijdId/speler/:spelerId', availabilityController.updateAvailability);
router.delete('/beschikbaarheid/wedstrijd/:wedstrijdId/speler/:spelerId', availabilityController.deleteAvailability);

module.exports = router; 