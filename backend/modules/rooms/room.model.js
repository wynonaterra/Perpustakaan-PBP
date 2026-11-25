
const db = require('../../config/database');

// Mengambil semua data ruangan
const getAllRooms = async (activeOnly = false) => {
  let query = `
    SELECT *
    FROM ruang
  `;

  if (activeOnly) {
    query += ` WHERE status = 'aktif'`;
  }

  query += ` ORDER BY id_ruang ASC`;

  const result = await db.query(query);
  return result.rows;
};

// Mengambil detail ruangan berdasarkan ID
const getRoomById = async (id, activeOnly = false) => {
  let query = `
    SELECT *
    FROM ruang
    WHERE id_ruang = $1
  `;

  if (activeOnly) {
    query += ` AND status = 'aktif'`;
  }

  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Menambahkan ruangan baru
const createRoom = async (data) => {
  const { nama_ruang, lokasi, kapasitas, fasilitas } = data;

  const query = `
    INSERT INTO ruang
      (nama_ruang, lokasi, kapasitas, fasilitas)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await db.query(query, [
    nama_ruang,
    lokasi,
    kapasitas,
    fasilitas
  ]);

  return result.rows[0];
};

// Mengubah data ruangan
const updateRoom = async (id, data) => {
  const { nama_ruang, lokasi, kapasitas, fasilitas, status } = data;

  const query = `
    UPDATE ruang
    SET
      nama_ruang = $1,
      lokasi = $2,
      kapasitas = $3,
      fasilitas = $4,
      status = $5
    WHERE id_ruang = $6
    RETURNING *
  `;

  const result = await db.query(query, [
    nama_ruang,
    lokasi,
    kapasitas,
    fasilitas,
    status,
    id
  ]);

  return result.rows[0];
};

// Menonaktifkan ruangan
const deactivateRoom = async (id) => {
  const query = `
    UPDATE ruang
    SET status = 'nonaktif'
    WHERE id_ruang = $1
    RETURNING *
  `;

  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deactivateRoom
};