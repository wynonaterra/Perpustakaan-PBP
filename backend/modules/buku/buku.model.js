const pool = require('../../config/database');

// Ambil semua buku beserta nama kategori (mendukung pencarian & filter kategori)
const getAllBuku = async ({ search, id_kategori }) => {
  let query = `
    SELECT b.*, k.nama_kategori
    FROM buku b
    LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (b.judul ILIKE $${params.length} OR b.penulis ILIKE $${params.length} OR b.isbn ILIKE $${params.length})`;
  }

  if (id_kategori) {
    params.push(id_kategori);
    query += ` AND b.id_kategori = $${params.length}`;
  }

  query += ` ORDER BY b.id_buku DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

// Ambil 1 buku berdasarkan ID
const getBukuById = async (id_buku) => {
  const query = `
    SELECT b.*, k.nama_kategori
    FROM buku b
    LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
    WHERE b.id_buku = $1
  `;
  const { rows } = await pool.query(query, [id_buku]);
  return rows[0];
};

// Tambah buku baru (stok_tersedia otomatis mengikuti stok_total)
const createBuku = async (data) => {
  const {
    id_kategori,
    isbn,
    judul,
    penulis,
    penerbit,
    tahun_terbit,
    deskripsi,
    gambar_sampul,
    stok_total,
  } = data;

  const stok = Number(stok_total) || 0;

  const query = `
    INSERT INTO buku (
      id_kategori, isbn, judul, penulis, penerbit,
      tahun_terbit, deskripsi, gambar_sampul, stok_total, stok_tersedia
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
    RETURNING *
  `;
  const values = [
    id_kategori || null,
    isbn || null,
    judul,
    penulis,
    penerbit || null,
    tahun_terbit ? Number(tahun_terbit) : null,
    deskripsi || null,
    gambar_sampul || null,
    stok,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Update buku & hitung ulang stok_tersedia secara aman
const updateBuku = async (id_buku, data) => {
  const existing = await getBukuById(id_buku);
  if (!existing) return null;

  const {
    id_kategori,
    isbn,
    judul,
    penulis,
    penerbit,
    tahun_terbit,
    deskripsi,
    gambar_sampul,
    stok_total,
  } = data;

  // Hitung jumlah buku yang sedang dipinjam/dialokasikan agar stok_tersedia tetap sinkron
  const sedangDipinjam = existing.stok_total - existing.stok_tersedia;
  const newStokTotal = stok_total !== undefined ? Number(stok_total) : existing.stok_total;

  if (newStokTotal < sedangDipinjam) {
    const err = new Error(
      `Stok total tidak boleh kurang dari jumlah buku yang sedang dipinjam (${sedangDipinjam} eksemplar).`
    );
    err.statusCode = 400;
    throw err;
  }

  const newStokTersedia = newStokTotal - sedangDipinjam;

  const query = `
    UPDATE buku
    SET id_kategori = $1,
        isbn = $2,
        judul = $3,
        penulis = $4,
        penerbit = $5,
        tahun_terbit = $6,
        deskripsi = $7,
        gambar_sampul = $8,
        stok_total = $9,
        stok_tersedia = $10
    WHERE id_buku = $11
    RETURNING *
  `;

  const values = [
    id_kategori !== undefined ? (id_kategori || null) : existing.id_kategori,
    isbn !== undefined ? (isbn || null) : existing.isbn,
    judul || existing.judul,
    penulis || existing.penulis,
    penerbit !== undefined ? (penerbit || null) : existing.penerbit,
    tahun_terbit !== undefined ? (tahun_terbit ? Number(tahun_terbit) : null) : existing.tahun_terbit,
    deskripsi !== undefined ? (deskripsi || null) : existing.deskripsi,
    gambar_sampul !== undefined ? (gambar_sampul || null) : existing.gambar_sampul,
    newStokTotal,
    newStokTersedia,
    id_buku,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Hapus buku
const deleteBuku = async (id_buku) => {
  const query = 'DELETE FROM buku WHERE id_buku = $1 RETURNING *';
  const { rows } = await pool.query(query, [id_buku]);
  return rows[0];
};

// === KATEGORI HELPER ===
const getAllKategori = async () => {
  const { rows } = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
  return rows;
};

const createKategori = async ({ nama_kategori, deskripsi }) => {
  const { rows } = await pool.query(
    'INSERT INTO kategori (nama_kategori, deskripsi) VALUES ($1, $2) RETURNING *',
    [nama_kategori, deskripsi || null]
  );
  return rows[0];
};

module.exports = {
  getAllBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
  getAllKategori,
  createKategori,
};