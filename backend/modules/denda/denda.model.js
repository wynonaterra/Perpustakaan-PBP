const pool = require('../../config/database');

const getAllDenda = async (id_anggota = null) => {
    let query = `
    SELECT 
      d.id_denda,
      d.id_pengembalian,
      d.jumlah_denda,
      d.alasan,
      d.status_pembayaran,
      d.tanggal_pembayaran,
      pg.tanggal_pengembalian,
      pg.kondisi_buku,
      p.id_peminjaman,
      p.tanggal_jatuh_tempo,
      b.judul AS judul_buku,
      a.id_anggota,
      a.nomor_anggota,
      u.nama AS nama_anggota,
      u.email
    FROM denda d
    JOIN pengembalian pg ON d.id_pengembalian = pg.id_pengembalian
    JOIN detail_peminjaman dp ON pg.id_detail_peminjaman = dp.id_detail_peminjaman
    JOIN peminjaman p ON dp.id_peminjaman = p.id_peminjaman
    JOIN buku b ON dp.id_buku = b.id_buku
    JOIN anggota a ON p.id_anggota = a.id_anggota
    JOIN pengguna u ON a.id_pengguna = u.id_pengguna
  `;
    const params = [];
    if (id_anggota) {
        query += ` WHERE p.id_anggota = $1`;
        params.push(id_anggota);
    }
    query += ` ORDER BY d.id_denda DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
};

const getDendaById = async (id_denda) => {
    const query = `
    SELECT d.*, u.nama AS nama_anggota, a.nomor_anggota, b.judul AS judul_buku
    FROM denda d
    JOIN pengembalian pg ON d.id_pengembalian = pg.id_pengembalian
    JOIN detail_peminjaman dp ON pg.id_detail_peminjaman = dp.id_detail_peminjaman
    JOIN peminjaman p ON dp.id_peminjaman = p.id_peminjaman
    JOIN buku b ON dp.id_buku = b.id_buku
    JOIN anggota a ON p.id_anggota = a.id_anggota
    JOIN pengguna u ON a.id_pengguna = u.id_pengguna
    WHERE d.id_denda = $1
  `;
    const { rows } = await pool.query(query, [id_denda]);
    return rows[0];
};

const updateStatusDenda = async (id_denda, status_pembayaran) => {
    const query = `
    UPDATE denda
    SET 
      status_pembayaran = $1,
      tanggal_pembayaran = CASE WHEN $1 = 'lunas' THEN CURRENT_TIMESTAMP ELSE NULL END
    WHERE id_denda = $2
    RETURNING *
  `;
    const { rows } = await pool.query(query, [status_pembayaran, id_denda]);
    return rows[0];
};

module.exports = { getAllDenda, getDendaById, updateStatusDenda };