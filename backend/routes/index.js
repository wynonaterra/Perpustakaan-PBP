const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const bookRoutes = require('../modules/books/book.routes');

// 1, 2, 4, 5. Auth Routes
router.use('/auth', authRoutes);

// 3. Admin Dashboard
router.use('/admin/dashboard', verifyToken, authorizeRoles('admin'), dashboardRoutes);

// 6. Pengguna Catalog
router.use('/pengguna/catalog', verifyToken, authorizeRoles('anggota'), bookRoutes);

module.exports = router;