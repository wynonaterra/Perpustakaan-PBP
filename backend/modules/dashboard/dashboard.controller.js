const pool = require('../../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [bukuRes, anggotaRes, pinjamRes, kembaliRes, terbaruRes] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(stok_total), 0) AS total FROM buku'),
      pool.query("SELECT COUNT(*) AS total FROM anggota WHERE status = 'aktif'"),
      pool.query("SELECT COUNT(*) AS total FROM peminjaman WHERE status = 'dipinjam'"),
      pool.query('SELECT COUNT(*) AS total FROM pengembalian'),
      pool.query(`
        SELECT p.id_peminjaman, u.nama AS nama_anggota, p.jenis_peminjaman, p.tanggal_peminjaman, p.status
        FROM peminjaman p
        JOIN anggota a ON p.id_anggota = a.id_anggota
        JOIN pengguna u ON a.id_pengguna = u.id_pengguna
        ORDER BY p.tanggal_peminjaman DESC
        LIMIT 5
      `),
    ]);

    res.json({
      message: 'Berhasil memuat data dashboard admin.',
      stats: {
        total_buku: Number(bukuRes.rows[0].total),
        total_anggota: Number(anggotaRes.rows[0].total),
        sedang_dipinjam: Number(pinjamRes.rows[0].total),
        total_pengembalian: Number(kembaliRes.rows[0].total),
      },
      transaksi_terbaru: terbaruRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };