const express = require('express');
const router = express.Router();
const episodesController = require('../controllers/episodesController');

// API endpoints
router.get('/api/episodes/movie/:movieId', episodesController.getEpisodesByMovieId);  // Lấy danh sách tập phim theo movie_id
router.get('/api/episodes/:episodeId', episodesController.getEpisodeById);          // Lấy chi tiết tập phim
router.post('/api/episodes', episodesController.addEpisode);                        // Thêm tập phim mới
router.put('/api/episodes/:episodeId', episodesController.updateEpisode);           // Cập nhật tập phim
router.delete('/api/episodes/:episodeId', episodesController.deleteEpisode);        // Xóa tập phim

module.exports = router;