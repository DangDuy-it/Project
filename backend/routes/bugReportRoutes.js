const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bugReportController');

// GET danh sách lỗi
router.get('/api/bugs', bugController.getAllBugReports);

// POST phản hồi lỗi
router.post('/api/bugs/responses', bugController.responseToBug);

module.exports = router;