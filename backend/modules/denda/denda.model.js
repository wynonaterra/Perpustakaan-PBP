const pool = require('../../config/database');

// =========================================================
// GET SEMUA DENDA
// Admin  : melihat semua denda
// Anggota: hanya melihat dendanya sendiri
// =========================================================
const getAllDenda = async (idPengguna = null) => {
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
            pg.catatan,

            dp.id_detail_peminjaman,
            dp.id_eksemplar,

            p.id_peminjaman,
            p.id_pengguna,
            p.tanggal_peminjaman,
            p.tanggal_jatuh_tempo,
            p.status AS status_peminjaman,

            u.nomor_anggota,
            u.nama AS nama_anggota,
            u.email,

            eb.id_buku,
            eb.nomor_urut,
            b.judul AS judul_buku,
            b.penulis

        FROM denda d

        JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        JOIN detail_peminjaman dp
            ON pg.id_detail_peminjaman = dp.id_detail_peminjaman

        JOIN peminjaman p
            ON dp.id_peminjaman = p.id_peminjaman

        JOIN pengguna u
            ON p.id_pengguna = u.id_pengguna

        JOIN eksemplar_buku eb
            ON dp.id_eksemplar = eb.id_eksemplar

        JOIN buku b
            ON eb.id_buku = b.id_buku
    `;

    const params = [];

    // Jika anggota, hanya tampilkan dendanya sendiri
    if (idPengguna) {
        query += `
            WHERE p.id_pengguna = $1
        `;

        params.push(idPengguna);
    }

    query += `
        ORDER BY d.id_denda DESC
    `;

    const { rows } = await pool.query(query, params);

    return rows;
};


// =========================================================
// GET DETAIL DENDA BERDASARKAN ID
// =========================================================
const getDendaById = async (idDenda) => {
    const query = `
        SELECT
            d.id_denda,
            d.id_pengembalian,
            d.jumlah_denda,
            d.alasan,
            d.status_pembayaran,
            d.tanggal_pembayaran,

            pg.tanggal_pengembalian,
            pg.kondisi_buku,
            pg.catatan,

            dp.id_detail_peminjaman,
            dp.id_eksemplar,

            p.id_peminjaman,
            p.id_pengguna,
            p.tanggal_peminjaman,
            p.tanggal_jatuh_tempo,
            p.status AS status_peminjaman,

            u.nomor_anggota,
            u.nama AS nama_anggota,
            u.email,

            eb.id_buku,
            eb.nomor_urut,

            b.judul AS judul_buku,
            b.penulis

        FROM denda d

        JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        JOIN detail_peminjaman dp
            ON pg.id_detail_peminjaman = dp.id_detail_peminjaman

        JOIN peminjaman p
            ON dp.id_peminjaman = p.id_peminjaman

        JOIN pengguna u
            ON p.id_pengguna = u.id_pengguna

        JOIN eksemplar_buku eb
            ON dp.id_eksemplar = eb.id_eksemplar

        JOIN buku b
            ON eb.id_buku = b.id_buku

        WHERE d.id_denda = $1
    `;

    const { rows } = await pool.query(query, [idDenda]);

    return rows[0] || null;
};


// =========================================================
// UPDATE STATUS PEMBAYARAN DENDA
// Hanya Admin
// =========================================================
const updateStatusDenda = async (idDenda, statusPembayaran) => {
    const query = `
        UPDATE denda
        SET
            status_pembayaran = $1::VARCHAR,
            tanggal_pembayaran =
                CASE
                    WHEN $1::VARCHAR = 'lunas'
                        THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
        WHERE id_denda = $2
        RETURNING *
    `;

    const { rows } = await pool.query(
        query,
        [statusPembayaran, idDenda]
    );

    return rows[0] || null;
};


module.exports = {
    getAllDenda,
    getDendaById,
    updateStatusDenda,
};