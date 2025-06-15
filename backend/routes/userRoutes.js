const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/api/users/search', userController.searchUsers);
router.get('/api/users', userController.getUsers);
router.get('/api/users/:user_id', userController.getUserById);
router.put('/api/users/:user_id/status', userController.updateUserStatus);

module.exports = router;