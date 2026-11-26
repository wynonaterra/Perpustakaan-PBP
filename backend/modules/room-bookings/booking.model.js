
const db = require('../../config/database');

// Mengambil semua data peminjaman
const getAllBookings = async () => {
  const query = `
    SELECT
      p.*,
      r.nama_ruang,
      a.nomor_anggota,
      u.nama AS nama_anggota
    FROM peminjaman_ruang p
    JOIN ruang r ON p.id_ruang = r.id_ruang
    JOIN anggota a ON p.id_anggota = a.id_anggota
    JOIN pengguna u ON a.id_pengguna = u.id_pengguna
    ORDER BY p.id_peminjaman_ruang DESC
  `;

  const result = await db.query(query);
  return result.rows;
};

// Mengambil peminjaman berdasarkan anggota
const getBookingsByMember = async (id_anggota) => {
  const query = `
    SELECT
      p.*,
      r.nama_ruang,
      r.lokasi
    FROM peminjaman_ruang p
    JOIN ruang r ON p.id_ruang = r.id_ruang
    WHERE p.id_anggota = $1
    ORDER BY p.id_peminjaman_ruang DESC
  `;

  const result = await db.query(query, [id_anggota]);
  return result.rows;
};

// Mengambil detail peminjaman
const getBookingById = async (id) => {
  const query = `
    SELECT
      p.*,
      r.nama_ruang,
      r.lokasi,
      a.nomor_anggota,
      u.nama AS nama_anggota
    FROM peminjaman_ruang p
    JOIN ruang r ON p.id_ruang = r.id_ruang
    JOIN anggota a ON p.id_anggota = a.id_anggota
    JOIN pengguna u ON a.id_pengguna = u.id_pengguna
    WHERE p.id_peminjaman_ruang = $1
  `;

  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Membuat pengajuan peminjaman
const createBooking = async (data) => {
  const {
    id_ruang,
    id_anggota,
    tanggal_peminjaman,
    jam_mulai,
    jam_selesai,
    jumlah_orang,
    catatan
  } = data;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Memastikan ruangan tersedia dan kapasitas mencukupi
    const roomResult = await client.query(
      `SELECT * FROM ruang
       WHERE id_ruang = $1 AND status = 'aktif'
       FOR UPDATE`,
      [id_ruang]
    );

    const room = roomResult.rows[0];

    if (!room) {
      const error = new Error('Ruangan tidak ditemukan atau tidak aktif.');
      error.statusCode = 404;
      throw error;
    }

    if (jumlah_orang > room.kapasitas) {
      const error = new Error('Jumlah orang melebihi kapasitas ruangan.');
      error.statusCode = 400;
      throw error;
    }

    // Memastikan anggota masih aktif
    const memberResult = await client.query(
      `SELECT id_anggota FROM anggota
       WHERE id_anggota = $1 AND status = 'aktif'`,
      [id_anggota]
    );

    if (!memberResult.rows[0]) {
      const error = new Error('Anggota tidak ditemukan atau tidak aktif.');
      error.statusCode = 403;
      throw error;
    }

    // Memeriksa jadwal yang bertabrakan
    const conflictResult = await client.query(
      `SELECT id_peminjaman_ruang
       FROM peminjaman_ruang
       WHERE id_ruang = $1
       AND tanggal_peminjaman = $2
       AND status IN ('menunggu', 'disetujui')
       AND jam_mulai < $4
       AND jam_selesai > $3`,
      [id_ruang, tanggal_peminjaman, jam_mulai, jam_selesai]
    );

    if (conflictResult.rows.length > 0) {
      const error = new Error('Ruangan sudah memiliki pengajuan pada jam tersebut.');
      error.statusCode = 409;
      throw error;
    }

    // Menyimpan pengajuan dengan status menunggu
    const insertResult = await client.query(
      `INSERT INTO peminjaman_ruang (
        id_ruang,
        id_anggota,
        tanggal_peminjaman,
        jam_mulai,
        jam_selesai,
        jumlah_orang,
        status,
        catatan
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'menunggu', $7)
      RETURNING *`,
      [
        id_ruang,
        id_anggota,
        tanggal_peminjaman,
        jam_mulai,
        jam_selesai,
        jumlah_orang,
        catatan || null
      ]
    );

    await client.query('COMMIT');

    return insertResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Mengubah status peminjaman oleh admin
const updateBookingStatus = async (id, status) => {
  const query = `
    UPDATE peminjaman_ruang
    SET status = $1
    WHERE id_peminjaman_ruang = $2
    AND status = 'menunggu'
    RETURNING *
  `;

  const result = await db.query(query, [status, id]);
  return result.rows[0];
};

// Membatalkan pengajuan oleh anggota
const cancelBooking = async (id, id_anggota) => {
  const query = `
    UPDATE peminjaman_ruang
    SET status = 'dibatalkan'
    WHERE id_peminjaman_ruang = $1
    AND id_anggota = $2
    AND status = 'menunggu'
    RETURNING *
  `;

  const result = await db.query(query, [id, id_anggota]);
  return result.rows[0];
};

module.exports = {
  getAllBookings,
  getBookingsByMember,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking
};
