const express = require('express');
const router = express.Router();
const watchHistoryController = require('../controllers/watchHistoryController');
const { authenticateToken } = require('../middlewares/auth'); 

router.post('/api/watch-history', authenticateToken, watchHistoryController.addWatchHistory);
router.get('/api/watch-history', authenticateToken, watchHistoryController.getWatchHistory);

module.exports = router;