const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.get('/list', problemController.getProblems);
router.post('/generate', problemController.generateProblems);

module.exports = router; 