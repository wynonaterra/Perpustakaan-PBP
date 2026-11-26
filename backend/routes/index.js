const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Import semua module routes
const authRoutes = require('../modules/auth/auth.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const bukuRoutes = require('../modules/buku/buku.routes');
const katalogRoutes = require('../modules/katalog/katalog.routes');
const kembaliRoutes = require('../modules/kembali/kembali.routes');
const dendaRoutes = require('../modules/denda/denda.routes');
const roomRoutes = require('../modules/rooms/room.routes');
const bookingRoutes = require('../modules/room-bookings/booking.routes');


const pinjamRoutes = require("../modules/pinjam/pinjam.routes");

// 1, 2, 4, 5. Auth Routes (Fafa)

router.use('/auth', authRoutes);

// 3. Admin Dashboard (Fafa)
router.use('/admin/dashboard', verifyToken, authorizeRoles('admin'), dashboardRoutes);

// Admin Manajemen Buku (Ifa)
router.use('/admin/buku', verifyToken, authorizeRoles('admin'), bukuRoutes);

// 6. Anggota Katalog Buku (Ifa)
router.use('/pengguna/katalog', verifyToken, authorizeRoles('anggota'), katalogRoutes);

// Pengembalian & Denda (Audel)
router.use('/kembali', verifyToken, kembaliRoutes);
router.use('/denda', verifyToken, dendaRoutes);

// 7. Peminjaman (Wynona)
router.use('/peminjaman', verifyToken, authorizeRoles('anggota'), pinjamRoutes);

// Ruangan (Nadya)
router.use('/rooms', verifyToken, roomRoutes);

// Booking Ruangan (Nadya)
router.use('/room-bookings', verifyToken, bookingRoutes);

module.exports = router;