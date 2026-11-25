const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const verifyToken = require('../../middleware/authMiddleware');

router.post('/admin/register', authController.registerAdmin);
router.post('/admin/login', authController.loginAdmin);
router.post('/pengguna/register', authController.registerPengguna);
router.post('/pengguna/login', authController.loginPengguna);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;