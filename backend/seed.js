require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const seedAdmin = async () => {
  try {
    const nama = 'Admin Pertama';
    const email = 'admin@perpus.com';
    const passwordPolos = 'admin123';
    const alamat = 'Jl. Kartini No. 10, Salatiga';
    const no_telepon = '081111222333';

    const hashedPassword = await bcrypt.hash(passwordPolos, 10);

    // Langkah 1: Insert / Upsert data admin untuk mendapatkan id_pengguna
    const insertRes = await pool.query(
      `INSERT INTO pengguna (nama, email, kata_sandi, peran, alamat, no_telepon, status)
       VALUES ($1, $2, $3, 'admin', $4, $5, 'aktif')
       ON CONFLICT (email) DO UPDATE SET nama = EXCLUDED.nama
       RETURNING id_pengguna`,
      [nama, email, hashedPassword, alamat, no_telepon]
    );

    const idPengguna = insertRes.rows[0].id_pengguna;

    // Langkah 2: Update nomor_anggota berdasarkan id_pengguna yang baru dibuat
    const updateRes = await pool.query(
      `UPDATE pengguna
       SET nomor_anggota = 'ADM-' || LPAD($1::text, 4, '0')
       WHERE id_pengguna = $1
       RETURNING id_pengguna, nomor_anggota, nama, email, peran, status`,
      [idPengguna]
    );

    console.log('Berhasil membuat akun admin awal:', updateRes.rows[0]);
    console.log(`Login dengan -> Email: ${email} | Password: ${passwordPolos}`);
  } catch (error) {
    console.error('Gagal menjalankan seeder admin:', error.message);
  } finally {
    await pool.end();
  }
};

seedAdmin();