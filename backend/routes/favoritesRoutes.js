const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authenticateToken } = require('../middlewares/auth');

// API thêm phim vào danh sách yêu thích
router.post('/api/favorites', authenticateToken, favoritesController.addFavorite);
// API xóa phim khỏi danh sách yêu thích
router.delete('/api/favorites/:movieId', authenticateToken, favoritesController.removeFavorite);
// API kiểm tra trạng thái yêu thích của phim
router.get('/api/favorites/:movieId/status', authenticateToken, favoritesController.checkFavoriteStatus);
// API lấy danh sách phim yêu thích
router.get('/api/favorites', authenticateToken, favoritesController.getFavorites);

module.exports = router;