const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');

router.post('/import', upload.single('file'), fileController.importProblems);
router.post('/export', fileController.exportProblems);

module.exports = router; 