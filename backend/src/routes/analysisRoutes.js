const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

router.get('/', analysisController.getAnalysisData);
router.post('/export', analysisController.exportAnalysis);

module.exports = router; 