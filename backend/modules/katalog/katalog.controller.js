const pool = require('../../config/database');

const getKatalogBuku = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM buku ORDER BY id_buku DESC');
    res.json({
      message: 'Berhasil masuk ke halaman katalog pengguna.',
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getKatalogBuku };