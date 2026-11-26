const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const verifyToken = require('../../middleware/authMiddleware');
const authorizeRoles = require('../../middleware/roleMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/create', verifyToken, authorizeRoles('admin'), authController.createAdmin);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;