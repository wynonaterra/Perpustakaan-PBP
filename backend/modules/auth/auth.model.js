const pool = require('../../config/database');

// =========================================================
// CARI USER BERDASARKAN EMAIL
// =========================================================
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT
      id_pengguna,
      nama,
      email,
      kata_sandi,
      peran,
      nomor_anggota,
      alamat,
      no_telepon,
      status,
      dibuat_pada
     FROM pengguna
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

// =========================================================
// REGISTER ANGGOTA
// Semua akun anggota disimpan di tabel pengguna
// =========================================================
const registerAnggota = async ({
  nama,
  email,
  hashedPassword,
  alamat,
  no_telepon,
}) => {
  const insertRes = await pool.query(
    `INSERT INTO pengguna
      (nama, email, kata_sandi, peran, alamat, no_telepon, status)
     VALUES
      ($1, $2, $3, 'anggota', $4, $5, 'aktif')
     RETURNING id_pengguna`,
    [
      nama,
      email,
      hashedPassword,
      alamat || null,
      no_telepon || null,
    ]
  );

  const idPengguna = insertRes.rows[0].id_pengguna;

  const updateRes = await pool.query(
    `UPDATE pengguna
     SET nomor_anggota = 'AGT-' || LPAD($1::text, 4, '0')
     WHERE id_pengguna = $1
     RETURNING
       id_pengguna,
       nomor_anggota,
       nama,
       email,
       peran,
       alamat,
       no_telepon,
       status,
       dibuat_pada`,
    [idPengguna]
  );

  return updateRes.rows[0];
};

// =========================================================
// REGISTER ADMIN
// Semua akun admin juga disimpan di tabel pengguna
// =========================================================
const registerAdmin = async ({
  nama,
  email,
  hashedPassword,
  alamat,
  no_telepon,
}) => {
  const insertRes = await pool.query(
    `INSERT INTO pengguna
      (nama, email, kata_sandi, peran, alamat, no_telepon, status)
     VALUES
      ($1, $2, $3, 'admin', $4, $5, 'aktif')
     RETURNING id_pengguna`,
    [
      nama,
      email,
      hashedPassword,
      alamat || null,
      no_telepon || null,
    ]
  );

  const idPengguna = insertRes.rows[0].id_pengguna;

  const updateRes = await pool.query(
    `UPDATE pengguna
     SET nomor_anggota = 'ADM-' || LPAD($1::text, 4, '0')
     WHERE id_pengguna = $1
     RETURNING
       id_pengguna,
       nomor_anggota,
       nama,
       email,
       peran,
       alamat,
       no_telepon,
       status,
       dibuat_pada`,
    [idPengguna]
  );

  return updateRes.rows[0];
};

// =========================================================
// GET PROFILE
// =========================================================
const getUserById = async (idPengguna) => {
  const result = await pool.query(
    `SELECT
      id_pengguna,
      nomor_anggota,
      nama,
      email,
      peran,
      alamat,
      no_telepon,
      status,
      dibuat_pada
     FROM pengguna
     WHERE id_pengguna = $1`,
    [idPengguna]
  );

  return result.rows[0] || null;
};

// =========================================================
// GET SEMUA ADMIN
// =========================================================
const getAllAdmins = async () => {
  const result = await pool.query(
    `SELECT
      id_pengguna,
      nomor_anggota,
      nama,
      email,
      peran,
      alamat,
      no_telepon,
      status,
      dibuat_pada
     FROM pengguna
     WHERE peran = 'admin'
     ORDER BY id_pengguna ASC`
  );

  return result.rows;
};

module.exports = {
  findUserByEmail,
  registerAnggota,
  registerAdmin,
  getUserById,
  getAllAdmins,
};