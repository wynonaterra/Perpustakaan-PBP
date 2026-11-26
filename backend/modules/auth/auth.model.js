const registerAdmin = async ({ nama, email, hashedPassword, alamat, no_telepon }) => {
  const insertRes = await pool.query(
    `INSERT INTO pengguna (nama, email, kata_sandi, peran, alamat, no_telepon, status)
     VALUES ($1, $2, $3, 'admin', $4, $5, 'aktif')
     RETURNING id_pengguna`,
    [nama, email, hashedPassword, alamat || null, no_telepon || null]
  );

  const idPengguna = insertRes.rows[0].id_pengguna;

  const updateRes = await pool.query(
    `UPDATE pengguna
     SET nomor_anggota = 'ADM-' || LPAD($1::text, 4, '0')
     WHERE id_pengguna = $1
     RETURNING id_pengguna, nomor_anggota, nama, email, peran, alamat, no_telepon, status, dibuat_pada`,
    [idPengguna]
  );
  return updateRes.rows[0];
};

const registerAnggota = async ({ nama, email, hashedPassword, alamat, no_telepon }) => {
  const insertRes = await pool.query(
    `INSERT INTO pengguna (nama, email, kata_sandi, peran, alamat, no_telepon, status)
     VALUES ($1, $2, $3, 'anggota', $4, $5, 'aktif')
     RETURNING id_pengguna`,
    [nama, email, hashedPassword, alamat || null, no_telepon || null]
  );

  const idPengguna = insertRes.rows[0].id_pengguna;

  const updateRes = await pool.query(
    `UPDATE pengguna
     SET nomor_anggota = 'AGT-' || LPAD($1::text, 4, '0')
     WHERE id_pengguna = $1
     RETURNING id_pengguna, nomor_anggota, nama, email, peran, alamat, no_telepon, status, dibuat_pada`,
    [idPengguna]
  );
  return updateRes.rows[0];
};