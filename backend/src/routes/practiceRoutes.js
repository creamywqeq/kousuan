const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');

router.post('/start', practiceController.startPractice);
router.post('/submit', practiceController.submitAnswer);
router.post('/finish', practiceController.finishPractice);
router.get('/history', practiceController.getPracticeHistory);
router.get('/wrong-problems', practiceController.getWrongProblems);
router.post('/remove-wrong-problem', practiceController.removeWrongProblem);

module.exports = router; 