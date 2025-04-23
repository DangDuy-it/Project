const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/api/categorys',categoryController.getCategorys); // Lấy danh sách thể loại 



module.exports= router;