const express = require('express');
const router = express.Router();

const dendaController = require('./denda.controller');
const authorizeRoles = require('../../middleware/roleMiddleware');

// GET SEMUA DENDA
// Admin  → semua denda
// Anggota → hanya dendanya sendiri
router.get('/', dendaController.getDenda);


// GET DETAIL DENDA
router.get(
    '/:id',
    dendaController.getDetailDenda
);

// UPDATE STATUS PEMBAYARAN
// KHUSUS ADMIN
router.put('/:id', authorizeRoles('admin'), dendaController.updateDenda);

module.exports = router;