const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/api/reviews', reviewController.createReview);
router.get('/api/reviews/:movie_id', reviewController.getMovieReviews);

module.exports = router;