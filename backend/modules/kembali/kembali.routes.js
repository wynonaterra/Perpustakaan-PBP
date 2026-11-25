const express = require('express');
const router = express.Router();
const kembaliController = require('./kembali.controller');
const authorizeRoles = require('../../middleware/roleMiddleware');

// Admin & Anggota bisa melihat riwayat pengembalian
router.get('/', kembaliController.getPengembalian);

// Khusus Admin: melihat daftar buku yang sedang dipinjam & memproses pengembalian
router.get('/aktif', authorizeRoles('admin'), kembaliController.getPendingReturns);
router.post('/', authorizeRoles('admin'), kembaliController.storePengembalian);

module.exports = router;