const express = require('express');

const router = express.Router();

const authController = require('./auth.controller');

const verifyToken = require('../../middleware/authMiddleware');
const authorizeRoles = require('../../middleware/roleMiddleware');

// =========================================================
// PUBLIC AUTH
// =========================================================

router.post(
  '/register',
  authController.register
);

router.post(
  '/login',
  authController.login
);

// =========================================================
// USER PROFILE
// =========================================================

router.get(
  '/profile',
  verifyToken,
  authController.getProfile
);

// =========================================================
// ADMIN
// =========================================================

// Tambah admin
router.post(
  '/admin/create',
  verifyToken,
  authorizeRoles('admin'),
  authController.createAdmin
);

// Lihat semua admin
router.get(
  '/admin/list',
  verifyToken,
  authorizeRoles('admin'),
  authController.listAdmins
);

module.exports = router;