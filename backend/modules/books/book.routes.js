const express = require('express');
const router = express.Router();
const pool = require('../../config/database');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM buku ORDER BY id_buku DESC');
    res.json({
      message: 'Berhasil masuk ke catalog pengguna.',
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;