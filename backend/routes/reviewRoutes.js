const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/api/reviews', authenticateToken, reviewController.createReview);
router.get('/api/reviews/:movie_id', reviewController.getMovieReviews);

module.exports = router;