const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');

router.get('/competities', competitionController.getAllCompetitions);
router.get('/competities/:id', competitionController.getCompetitionById);
router.post('/competities', competitionController.createCompetition);
router.put('/competities/:id', competitionController.updateCompetition);
router.delete('/competities/:id', competitionController.deleteCompetition);

module.exports = router;
