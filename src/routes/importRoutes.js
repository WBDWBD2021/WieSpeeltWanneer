const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');

// Import routes
router.post('/import/knltb', importController.importFromKNLTB);
router.post('/import/csv', importController.importFromCSV);
router.get('/import/csv-template', importController.getCSVTemplate);

module.exports = router;
