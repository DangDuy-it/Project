const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const upload = require('../middlewares/upload');

router.get('/api/movies/searchAdmin', movieController.searchMoviesForAdmin);
router.get('/api/movies/search', movieController.searchMovies); // Tìm kiếm phim theo tên
router.get('/api/movies', movieController.getMovies); // Lấy danh sách phim cho người dùng ( chỉ approved )
router.get('/api/movies/:id', movieController.getMovieDetails); // Lấy chi tiết phim kèm danh sách tập 
router.get('/api/moviesad', movieController.getMoviesAdmin); // Lấy danh sách cho quản trị viên ( approved or pending )
router.get('/api/movies/:movie_id/edit', movieController.getMovieById); // Lấy thông tin phim theo ID
router.put('/api/movies/:movie_id', upload.fields([ { name: 'image', maxCount: 1 },{ name: 'background', maxCount: 1 }]),movieController.updateMovie); // Cập nhật thông tin phim
router.post('/api/movies/:movieId/episodes',movieController.addEpisode); // Thêm tập phim cho bộ phim 
router.delete('/api/movies/:movie_id', movieController.deleteMovie); // Xóa một bộ phim 
router.get('/api/slider-movies', movieController.getSliderMovie); // Lấy danh sách phim hiện thị Slider
router.post('/api/movies/add', upload.fields([ { name: 'image', maxCount: 1 },{ name: 'background', maxCount: 1 }]), movieController.addMovie);

module.exports = router;