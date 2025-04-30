const express = require('express');
const router = express.Router(); // Khởi tạo router

const categoryController = require('../controllers/categoryController');

// Định nghĩa route để lấy danh sách thể loại
router.get('/api/categories', categoryController.getCategories); // Lấy danh sách thể loại
router.get('/api/categories/:name',categoryController.getMoviesByCategoryName);
// Export router để sử dụng trong file server chính
module.exports = router;