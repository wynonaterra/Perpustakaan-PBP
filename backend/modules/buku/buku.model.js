const pool = require('../../config/db');

// Ambil semua buku beserta kategori
const getAllBuku = async ({ search, id_kategori }) => {
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(b.judul ILIKE $${params.length} OR b.penulis ILIKE $${params.length} OR b.isbn ILIKE $${params.length})`);
  }

  if (id_kategori) {
    params.push(id_kategori);
    conditions.push(`b.id_kategori = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT b.*, k.nama_kategori
    FROM buku b
    LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
    ${whereClause}
    ORDER BY b.id_buku DESC
  `;
  const result = await pool.query(query, params);
  return result.rows;
};

// Ambil detail 1 buku + daftar eksemplarnya
const getBukuById = async (id_buku) => {
  const bukuRes = await pool.query(
    `SELECT b.*, k.nama_kategori
     FROM buku b
     LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
     WHERE b.id_buku = $1`,
    [id_buku]
  );

  if (bukuRes.rows.length === 0) return null;

  const eksemplarRes = await pool.query(
    `SELECT id_eksemplar, nomor_urut, status
     FROM eksemplar_buku
     WHERE id_buku = $1
     ORDER BY nomor_urut ASC`,
    [id_buku]
  );

  return {
    ...bukuRes.rows[0],
    eksemplar: eksemplarRes.rows,
  };
};

// Tambah buku baru + auto-generate eksemplar (ISBN + nomor urut)
const createBuku = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const stokTotal = Number(data.stok_total) || 0;
    const stokTersedia = data.stok_tersedia !== undefined ? Number(data.stok_tersedia) : stokTotal;

    const bukuRes = await client.query(
      `INSERT INTO buku (
        id_kategori, isbn, judul, penulis, penerbit, tahun_terbit,
        deskripsi, gambar_sampul, stok_total, stok_tersedia
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.id_kategori || null,
        data.isbn,
        data.judul,
        data.penulis,
        data.penerbit || null,
        data.tahun_terbit || null,
        data.deskripsi || null,
        data.gambar_sampul || null,
        stokTotal,
        stokTersedia,
      ]
    );

    const newBuku = bukuRes.rows[0];
    const generatedEksemplar = [];

    for (let i = 1; i <= stokTotal; i++) {
      const idEksemplar = `${newBuku.isbn}${i}`;
      const eksRes = await client.query(
        `INSERT INTO eksemplar_buku (id_eksemplar, id_buku, nomor_urut, status)
         VALUES ($1, $2, $3, 'tersedia')
         RETURNING *`,
        [idEksemplar, newBuku.id_buku, i]
      );
      generatedEksemplar.push(eksRes.rows[0]);
    }

    await client.query('COMMIT');
    return { ...newBuku, eksemplar: generatedEksemplar };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Update buku + generate eksemplar tambahan jika stok_total bertambah
const updateBuku = async (id_buku, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const oldRes = await client.query('SELECT * FROM buku WHERE id_buku = $1', [id_buku]);
    if (oldRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const oldBuku = oldRes.rows[0];
    const newStokTotal = data.stok_total !== undefined ? Number(data.stok_total) : oldBuku.stok_total;

    if (newStokTotal < oldBuku.stok_total) {
      throw new Error('Stok total tidak boleh dikurangi di bawah jumlah eksemplar yang sudah terdaftar.');
    }

    const selisihStok = newStokTotal - oldBuku.stok_total;
    const newStokTersedia = oldBuku.stok_tersedia + selisihStok;

    const updateRes = await client.query(
      `UPDATE buku
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
       RETURNING *`,
      [
        data.id_kategori !== undefined ? data.id_kategori : oldBuku.id_kategori,
        data.isbn || oldBuku.isbn,
        data.judul || oldBuku.judul,
        data.penulis || oldBuku.penulis,
        data.penerbit !== undefined ? data.penerbit : oldBuku.penerbit,
        data.tahun_terbit !== undefined ? data.tahun_terbit : oldBuku.tahun_terbit,
        data.deskripsi !== undefined ? data.deskripsi : oldBuku.deskripsi,
        data.gambar_sampul !== undefined ? data.gambar_sampul : oldBuku.gambar_sampul,
        newStokTotal,
        newStokTersedia,
        id_buku,
      ]
    );

    const updatedBuku = updateRes.rows[0];

    // Cari nomor_urut terakhir agar tidak bentrok
    const maxUrutRes = await client.query(
      'SELECT COALESCE(MAX(nomor_urut), 0) AS max_urut FROM eksemplar_buku WHERE id_buku = $1',
      [id_buku]
    );
    let currentUrut = Number(maxUrutRes.rows[0].max_urut);

    for (let i = 0; i < selisihStok; i++) {
      currentUrut += 1;
      const idEksemplar = `${updatedBuku.isbn}${currentUrut}`;
      await client.query(
        `INSERT INTO eksemplar_buku (id_eksemplar, id_buku, nomor_urut, status)
         VALUES ($1, $2, $3, 'tersedia')`,
        [idEksemplar, id_buku, currentUrut]
      );
    }

    const eksRes = await client.query(
      'SELECT id_eksemplar, nomor_urut, status FROM eksemplar_buku WHERE id_buku = $1 ORDER BY nomor_urut ASC',
      [id_buku]
    );

    await client.query('COMMIT');
    return { ...updatedBuku, eksemplar: eksRes.rows };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Hapus buku (eksemplar otomatis ikut terhapus karena ON DELETE CASCADE)
const deleteBuku = async (id_buku) => {
  const result = await pool.query('DELETE FROM buku WHERE id_buku = $1 RETURNING *', [id_buku]);
  return result.rows[0];
};

// CRUD Kategori
const getAllKategori = async () => {
  const result = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori ASC');
  return result.rows;
};

const createKategori = async ({ nama_kategori, deskripsi }) => {
  const result = await pool.query(
    'INSERT INTO kategori (nama_kategori, deskripsi) VALUES ($1, $2) RETURNING *',
    [nama_kategori, deskripsi || null]
  );
  return result.rows[0];
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