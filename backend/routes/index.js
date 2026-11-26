const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Import semua module routes
const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const bukuRoutes = require('../modules/buku/buku.routes');
const katalogRoutes = require('../modules/katalog/katalog.routes');
const pinjamRoutes = require('../modules/pinjam/pinjam.routes');
const kembaliRoutes = require('../modules/kembali/kembali.routes');
const dendaRoutes = require('../modules/denda/denda.routes');
const roomRoutes = require('../modules/rooms/room.routes');
const bookingRoutes = require('../modules/room-bookings/booking.routes');

// 1, 2, 4, 5. Auth Routes (Fafa)
// AUTH
router.use('/auth', authRoutes);

// ADMIN DASHBOARD (FAFA)
router.use('/admin/dashboard', verifyToken, authorizeRoles('admin'), dashboardRoutes);

// ADMIN MANAJEMEN BUKU (IFA)
router.use('/admin/buku', verifyToken, authorizeRoles('admin'), bukuRoutes);
// ANGGOTA KATALOG BUKU 
router.use('/pengguna/katalog', verifyToken, authorizeRoles('anggota'), katalogRoutes);

// PEMINJAMAN (WYN)
router.use('/pinjam', pinjamRoutes);

// PENGEMBALIAN (AUDEL)
router.use('/kembali', verifyToken, kembaliRoutes);
// DENDA
router.use('/denda', verifyToken, dendaRoutes);

// RUANGAN (NADYA)
router.use('/rooms', verifyToken, roomRoutes);
// BOOKING RUANGAN
router.use('/room-bookings', verifyToken, bookingRoutes);

module.exports = router;