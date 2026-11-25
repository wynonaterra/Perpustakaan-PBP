const pool = require('../../config/database');

// Ambil semua riwayat pengembalian (Admin lihat semua, Anggota lihat miliknya)
const getAllPengembalian = async (id_anggota = null) => {
    let query = `
    SELECT 
      pg.id_pengembalian,
      pg.tanggal_pengembalian,
      pg.kondisi_buku,
      pg.catatan,
      dp.id_detail_peminjaman,
      dp.jumlah,
      p.id_peminjaman,
      p.tanggal_peminjaman,
      p.tanggal_jatuh_tempo,
      b.id_buku,
      b.judul AS judul_buku,
      b.isbn,
      a.id_anggota,
      a.nomor_anggota,
      u.nama AS nama_anggota,
      d.id_denda,
      d.jumlah_denda,
      d.status_pembayaran
    FROM pengembalian pg
    JOIN detail_peminjaman dp ON pg.id_detail_peminjaman = dp.id_detail_peminjaman
    JOIN peminjaman p ON dp.id_peminjaman = p.id_peminjaman
    JOIN buku b ON dp.id_buku = b.id_buku
    JOIN anggota a ON p.id_anggota = a.id_anggota
    JOIN pengguna u ON a.id_pengguna = u.id_pengguna
    LEFT JOIN denda d ON pg.id_pengembalian = d.id_pengembalian
  `;
    const params = [];
    if (id_anggota) {
        query += ` WHERE p.id_anggota = $1`;
        params.push(id_anggota);
    }
    query += ` ORDER BY pg.tanggal_pengembalian DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
};

// Ambil daftar buku yang masih berstatus 'dipinjam' dan belum dikembalikan (untuk dropdown form Admin)
const getActiveBorrowedDetails = async () => {
    const query = `
    SELECT 
      dp.id_detail_peminjaman,
      dp.jumlah,
      p.id_peminjaman,
      p.tanggal_peminjaman,
      p.tanggal_jatuh_tempo,
      b.id_buku,
      b.judul AS judul_buku,
      a.nomor_anggota,
      u.nama AS nama_anggota
    FROM detail_peminjaman dp
    JOIN peminjaman p ON dp.id_peminjaman = p.id_peminjaman
    JOIN buku b ON dp.id_buku = b.id_buku
    JOIN anggota a ON p.id_anggota = a.id_anggota
    JOIN pengguna u ON a.id_pengguna = u.id_pengguna
    LEFT JOIN pengembalian pg ON dp.id_detail_peminjaman = pg.id_detail_peminjaman
    WHERE p.status = 'dipinjam' AND pg.id_pengembalian IS NULL
    ORDER BY p.tanggal_jatuh_tempo ASC
  `;
    const { rows } = await pool.query(query);
    return rows;
};

// Proses Pengembalian + Update Stok + Update Status Pinjam + Generate Denda Otomatis
const createPengembalian = async ({ id_detail_peminjaman, kondisi_buku, catatan }) => {
    const client = await pool.connect();
    const TARIF_TELAT_PER_HARI = 2000;
    const DENDA_RUSAK = 25000;
    const DENDA_HILANG = 100000;

    try {
        await client.query('BEGIN');

        // 1. Kunci & ambil data detail peminjaman
        const detailRes = await client.query(
            `SELECT dp.*, p.id_peminjaman, p.tanggal_jatuh_tempo, p.status AS status_pinjam, b.judul
       FROM detail_peminjaman dp
       JOIN peminjaman p ON dp.id_peminjaman = p.id_peminjaman
       JOIN buku b ON dp.id_buku = b.id_buku
       WHERE dp.id_detail_peminjaman = $1
       FOR UPDATE`,
            [id_detail_peminjaman]
        );

        const detail = detailRes.rows[0];
        if (!detail) {
            throw Object.assign(new Error('Detail peminjaman tidak ditemukan.'), { statusCode: 404 });
        }
        if (detail.status_pinjam !== 'dipinjam') {
            throw Object.assign(new Error('Transaksi peminjaman ini tidak dalam status dipinjam.'), { statusCode: 400 });
        }

        // Pastikan belum pernah dikembalikan
        const cekKembali = await client.query(
            'SELECT id_pengembalian FROM pengembalian WHERE id_detail_peminjaman = $1',
            [id_detail_peminjaman]
        );
        if (cekKembali.rows.length > 0) {
            throw Object.assign(new Error('Buku ini sudah dikembalikan sebelumnya.'), { statusCode: 400 });
        }

        // 2. Insert ke tabel pengembalian
        const kembaliRes = await client.query(
            `INSERT INTO pengembalian (id_detail_peminjaman, tanggal_pengembalian, kondisi_buku, catatan)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
       RETURNING *`,
            [id_detail_peminjaman, kondisi_buku, catatan || null]
        );
        const pengembalian = kembaliRes.rows[0];

        // 3. Perbarui stok buku berdasarkan kondisi
        if (kondisi_buku === 'hilang') {
            // Stok tersedia tidak bertambah, stok_total dikurangi sesuai jumlah hilang
            await client.query(
                `UPDATE buku SET stok_total = GREATEST(0, stok_total - $1) WHERE id_buku = $2`,
                [detail.jumlah, detail.id_buku]
            );
        } else {
            // Kondisi 'baik' atau 'rusak' -> stok_tersedia kembali bertambah
            await client.query(
                `UPDATE buku SET stok_tersedia = LEAST(stok_total, stok_tersedia + $1) WHERE id_buku = $2`,
                [detail.jumlah, detail.id_buku]
            );
        }

        // 4. Cek apakah seluruh item dalam id_peminjaman ini sudah dikembalikan
        const sisaRes = await client.query(
            `SELECT COUNT(*) AS sisa
       FROM detail_peminjaman dp
       LEFT JOIN pengembalian pg ON dp.id_detail_peminjaman = pg.id_detail_peminjaman
       WHERE dp.id_peminjaman = $1 AND pg.id_pengembalian IS NULL`,
            [detail.id_peminjaman]
        );

        if (Number(sisaRes.rows[0].sisa) === 0) {
            await client.query(
                `UPDATE peminjaman SET status = 'selesai' WHERE id_peminjaman = $1`,
                [detail.id_peminjaman]
            );
        }

        // 5. Kalkulasi Denda Keterlambatan & Kondisi Buku
        let totalDenda = 0;
        const alasanList = [];

        if (detail.tanggal_jatuh_tempo) {
            const tglKembali = new Date(pengembalian.tanggal_pengembalian);
            const tglJatuhTempo = new Date(detail.tanggal_jatuh_tempo);
            // Set jam ke 00:00 untuk perbandingan hari kalender yang adil
            tglKembali.setHours(0, 0, 0, 0);
            tglJatuhTempo.setHours(0, 0, 0, 0);

            const selisihMs = tglKembali - tglJatuhTempo;
            const hariTelat = Math.floor(selisihMs / (1000 * 60 * 60 * 24));

            if (hariTelat > 0) {
                const dendaTelat = hariTelat * TARIF_TELAT_PER_HARI * detail.jumlah;
                totalDenda += dendaTelat;
                alasanList.push(`Terlambat ${hariTelat} hari (${detail.jumlah} eks)`);
            }
        }

        if (kondisi_buku === 'rusak') {
            totalDenda += DENDA_RUSAK * detail.jumlah;
            alasanList.push(`Buku rusak (${detail.jumlah} eks)`);
        } else if (kondisi_buku === 'hilang') {
            totalDenda += DENDA_HILANG * detail.jumlah;
            alasanList.push(`Buku hilang (${detail.jumlah} eks)`);
        }

        let dendaCreated = null;
        if (totalDenda > 0) {
            const dendaRes = await client.query(
                `INSERT INTO denda (id_pengembalian, jumlah_denda, alasan, status_pembayaran)
         VALUES ($1, $2, $3, 'belum_bayar')
         RETURNING *`,
                [pengembalian.id_pengembalian, totalDenda, alasanList.join(' + ')]
            );
            dendaCreated = dendaRes.rows[0];
        }

        await client.query('COMMIT');
        return { pengembalian, denda: dendaCreated };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getAllPengembalian,
    getActiveBorrowedDetails,
    createPengembalian,
};