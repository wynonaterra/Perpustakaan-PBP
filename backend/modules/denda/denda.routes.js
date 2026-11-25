const express = require('express');
const router = express.Router();
const dendaController = require('./denda.controller');
const authorizeRoles = require('../../middleware/roleMiddleware');

// Admin & Anggota bisa melihat denda (otomatis terfilter di controller)
router.get('/', dendaController.getDenda);
router.get('/:id', dendaController.getDetailDenda);

// Khusus Admin mengelola status pembayaran denda
router.put('/:id', authorizeRoles('admin'), dendaController.updateDenda);

module.exports = router;