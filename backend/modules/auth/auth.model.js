const pool = require('../../config/database');

const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM pengguna WHERE email = $1', [email]);
  return rows[0];
};

const registerAdmin = async ({ nama, email, hashedPassword }) => {
  const query = `
    INSERT INTO pengguna (nama, email, kata_sandi, peran, status)
    VALUES ($1, $2, $3, 'admin', 'aktif')
    RETURNING id_pengguna, nama, email, peran, status, dibuat_pada
  `;
  const { rows } = await pool.query(query, [nama, email, hashedPassword]);
  return rows[0];
};

const registerAnggota = async ({ nama, email, hashedPassword, alamat, no_telepon }) => {
  const nomorAnggota = `AGT-${Date.now().toString().slice(-6)}`;
  const query = `
    INSERT INTO pengguna (nama, email, kata_sandi, peran, nomor_anggota, alamat, no_telepon, status)
    VALUES ($1, $2, $3, 'anggota', $4, $5, $6, 'aktif')
    RETURNING id_pengguna, nama, email, peran, nomor_anggota, alamat, no_telepon, status, dibuat_pada
  `;
  const { rows } = await pool.query(query, [
    nama,
    email,
    hashedPassword,
    nomorAnggota,
    alamat || null,
    no_telepon || null,
  ]);
  return rows[0];
};

const getProfileById = async (id_pengguna) => {
  const query = `
    SELECT id_pengguna, nama, email, peran, nomor_anggota, alamat, no_telepon, status, dibuat_pada
    FROM pengguna
    WHERE id_pengguna = $1
  `;
  const { rows } = await pool.query(query, [id_pengguna]);
  return rows[0];
};

const getAllAdmins = async () => {
  const { rows } = await pool.query(
    `SELECT id_pengguna, nama, email, peran, dibuat_pada 
     FROM pengguna WHERE peran = 'admin' ORDER BY id_pengguna ASC`
  );
  return rows;
};

module.exports = { findUserByEmail, registerAdmin, registerAnggota, getProfileById, getAllAdmins };