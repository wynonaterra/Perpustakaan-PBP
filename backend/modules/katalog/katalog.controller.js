const pool = require('../../config/database');

// Ambil katalog buku untuk anggota dengan filter pencarian, kategori, & status tersedia
const getKatalogBuku = async (req, res, next) => {
  try {
    const { search, kategori, tersedia } = req.query;

    let query = `
      SELECT 
        b.id_buku, b.id_kategori, b.isbn, b.judul, b.penulis, 
        b.penerbit, b.tahun_terbit, b.deskripsi, b.gambar_sampul,
        b.stok_total, b.stok_tersedia,
        k.nama_kategori,
        CASE WHEN b.stok_tersedia > 0 THEN 'Tersedia' ELSE 'Habis' END AS status_ketersediaan
      FROM buku b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (b.judul ILIKE $${params.length} OR b.penulis ILIKE $${params.length} OR b.isbn ILIKE $${params.length})`;
    }

    if (kategori) {
      params.push(kategori);
      query += ` AND b.id_kategori = $${params.length}`;
    }

    if (tersedia === 'true') {
      query += ` AND b.stok_tersedia > 0`;
    }

    query += ` ORDER BY b.id_buku DESC`;

    const { rows } = await pool.query(query, params);
    res.json({
      message: 'Berhasil memuat katalog buku.',
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

// Ambil daftar kategori untuk pill filter di halaman katalog
const getKategoriList = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// Ambil detail 1 buku untuk panel pratinjau anggota
const getDetailBuku = async (req, res, next) => {
  try {
    const query = `
      SELECT b.*, k.nama_kategori,
             CASE WHEN b.stok_tersedia > 0 THEN 'Tersedia' ELSE 'Habis' END AS status_ketersediaan
      FROM buku b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      WHERE b.id_buku = $1
    `;
    const { rows } = await pool.query(query, [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getKatalogBuku,
  getKategoriList,
  getDetailBuku,
};