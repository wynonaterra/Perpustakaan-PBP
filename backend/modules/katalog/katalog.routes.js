const express = require('express');
const router = express.Router();
const katalogController = require('./katalog.controller');

router.get('/kategori', katalogController.getKategoriList);
router.get('/', katalogController.getKatalogBuku);
router.get('/:id', katalogController.getDetailBuku);

module.exports = router;