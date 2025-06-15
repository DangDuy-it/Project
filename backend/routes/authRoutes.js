const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth'); 

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/api/user', authenticateToken, authController.updateUser); 
router.put('/forgot-password', authController.forgotPassword);

module.exports = router;