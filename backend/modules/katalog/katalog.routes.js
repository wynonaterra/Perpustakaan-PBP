const express = require('express');
const router = express.Router();
const katalogController = require('./katalog.controller');

router.get('/', katalogController.getKatalogBuku);

module.exports = router;