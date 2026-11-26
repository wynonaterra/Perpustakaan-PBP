require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const seedAdmin = async () => {
  try {
    const nama = 'Admin Pertama';
    const email = 'admin@perpus.com';
    const passwordPolos = 'admin123';

    const hashedPassword = await bcrypt.hash(passwordPolos, 10);

    const query = `
      INSERT INTO pengguna (nama, email, kata_sandi, peran)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (email) DO NOTHING
      RETURNING id_pengguna, nama, email, peran;
    `;

    const { rows } = await pool.query(query, [nama, email, hashedPassword]);

    if (rows.length > 0) {
      console.log('Berhasil membuat akun admin awal:', rows[0]);
      console.log(`Login dengan -> Email: ${email} | Password: ${passwordPolos}`);
    } else {
      console.log(`Akun admin (${email}) sudah tersedia di database.`);
    }
  } catch (error) {
    console.error('Gagal menjalankan seeder admin:', error.message);
  } finally {
    await pool.end();
  }
};

seedAdmin();