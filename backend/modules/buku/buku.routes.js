const express = require('express');
const router = express.Router();
const bukuController = require('./buku.controller');

// Route kategori ditaruh di atas /:id agar tidak terbaca sebagai parameter :id
router.get('/kategori', bukuController.getAllKategori);
router.post('/kategori', bukuController.createKategori);

// CRUD Buku
router.get('/', bukuController.getAllBuku);
router.get('/:id', bukuController.getBukuById);
router.post('/', bukuController.createBuku);
router.put('/:id', bukuController.updateBuku);
router.delete('/:id', bukuController.deleteBuku);

module.exports = router;