const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

router.get('/clubs', clubController.getAllClubs);
router.get('/clubs/:id', clubController.getClubById);
router.post('/clubs', clubController.createClub);
router.put('/clubs/:id', clubController.updateClub);
router.delete('/clubs/:id', clubController.deleteClub);

module.exports = router;
