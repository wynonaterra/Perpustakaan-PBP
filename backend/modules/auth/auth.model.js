const pool = require('../../config/database');

const findUserByEmail = async (email) => {
  const query = `
    SELECT p.*, a.id_anggota, a.nomor_anggota, a.status AS status_anggota
    FROM pengguna p
    LEFT JOIN anggota a ON p.id_pengguna = a.id_pengguna
    WHERE p.email = $1
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

const registerAdmin = async ({ nama, email, hashedPassword }) => {
  const query = `
    INSERT INTO pengguna (nama, email, kata_sandi, peran)
    VALUES ($1, $2, $3, 'admin')
    RETURNING id_pengguna, nama, email, peran, dibuat_pada
  `;
  const { rows } = await pool.query(query, [nama, email, hashedPassword]);
  return rows[0];
};

const registerAnggota = async ({ nama, email, hashedPassword, alamat, no_telepon }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query(
      `INSERT INTO pengguna (nama, email, kata_sandi, peran)
       VALUES ($1, $2, $3, 'anggota')
       RETURNING id_pengguna, nama, email, peran, dibuat_pada`,
      [nama, email, hashedPassword]
    );
    const newUser = userRes.rows[0];

    const nomorAnggota = `AGT-${Date.now().toString().slice(-6)}`;
    const anggotaRes = await client.query(
      `INSERT INTO anggota (id_pengguna, nomor_anggota, alamat, no_telepon, tanggal_daftar, status)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, 'aktif')
       RETURNING id_anggota, nomor_anggota`,
      [newUser.id_pengguna, nomorAnggota, alamat || null, no_telepon || null]
    );

    await client.query('COMMIT');
    return { ...newUser, ...anggotaRes.rows[0] };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getProfileById = async (id_pengguna) => {
  const query = `
    SELECT p.id_pengguna, p.nama, p.email, p.peran, p.dibuat_pada,
           a.id_anggota, a.nomor_anggota, a.alamat, a.no_telepon, a.tanggal_daftar, a.status
    FROM pengguna p
    LEFT JOIN anggota a ON p.id_pengguna = a.id_pengguna
    WHERE p.id_pengguna = $1
  `;
  const { rows } = await pool.query(query, [id_pengguna]);
  return rows[0];
};

module.exports = { findUserByEmail, registerAdmin, registerAnggota, getProfileById };