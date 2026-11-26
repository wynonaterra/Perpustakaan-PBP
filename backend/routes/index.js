const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const katalogRoutes = require('../modules/katalog/katalog.routes');

const pinjamRoutes = require("../modules/pinjam/pinjam.routes");

// 1, 2, 4, 5. Auth Routes
router.use('/auth', authRoutes);

// 3. Admin Dashboard
router.use('/admin/dashboard', verifyToken, authorizeRoles('admin'), dashboardRoutes);

// 6. Pengguna Katalog
router.use('/pengguna/katalog', verifyToken, authorizeRoles('anggota'), katalogRoutes);

// Kembali
router.use('/kembali', verifyToken, kembaliRoutes);

// Denda
router.use('/denda', verifyToken, dendaRoutes);

// 7. Peminjaman
router.use('/peminjaman', verifyToken, authorizeRoles('anggota'), pinjamRoutes);

module.exports = router;