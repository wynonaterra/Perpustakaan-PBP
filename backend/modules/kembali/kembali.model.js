const pool = require('../../config/database');

// =========================================================
// GET SEMUA RIWAYAT PENGEMBALIAN
// Admin  : melihat semua
// Anggota: hanya melihat miliknya sendiri
// =========================================================
const getAllPengembalian = async (idPengguna = null) => {
    let query = `
        SELECT
            pg.id_pengembalian,
            pg.tanggal_pengembalian,
            pg.kondisi_buku,
            pg.catatan,

            dp.id_detail_peminjaman,
            dp.id_eksemplar,

            p.id_peminjaman,
            p.id_pengguna,
            p.tanggal_peminjaman,
            p.tanggal_jatuh_tempo,

            u.nama AS nama_pengguna,
            u.email,

            eb.id_buku,
            eb.nomor_urut,
            eb.status AS status_eksemplar,

            b.judul AS judul_buku,
            b.isbn,

            d.id_denda,
            d.jumlah_denda,
            d.alasan,
            d.status_pembayaran,
            d.tanggal_pembayaran

        FROM pengembalian pg

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

        LEFT JOIN denda d
            ON pg.id_pengembalian = d.id_pengembalian
    `;

    const params = [];

    if (idPengguna !== null) {
        query += `
            WHERE p.id_pengguna = $1
        `;

        params.push(idPengguna);
    }

    query += `
        ORDER BY pg.tanggal_pengembalian DESC
    `;

    const { rows } = await pool.query(query, params);

    return rows;
};


// =========================================================
// GET BUKU YANG MASIH DIPINJAM
// Khusus Admin untuk proses pengembalian
// =========================================================
const getActiveBorrowedDetails = async () => {
    const query = `
        SELECT
            dp.id_detail_peminjaman,
            dp.id_eksemplar,

            p.id_peminjaman,
            p.id_pengguna,
            p.tanggal_peminjaman,
            p.tanggal_jatuh_tempo,

            u.nama AS nama_pengguna,
            u.email,

            eb.id_buku,
            eb.nomor_urut,
            eb.status AS status_eksemplar,

            b.judul AS judul_buku,
            b.isbn

        FROM detail_peminjaman dp

        JOIN peminjaman p
            ON dp.id_peminjaman = p.id_peminjaman

        JOIN pengguna u
            ON p.id_pengguna = u.id_pengguna

        JOIN eksemplar_buku eb
            ON dp.id_eksemplar = eb.id_eksemplar

        JOIN buku b
            ON eb.id_buku = b.id_buku

        LEFT JOIN pengembalian pg
            ON dp.id_detail_peminjaman = pg.id_detail_peminjaman

        WHERE p.status = 'dipinjam'
          AND eb.status = 'dipinjam'
          AND pg.id_pengembalian IS NULL

        ORDER BY
            p.tanggal_jatuh_tempo ASC,
            p.id_peminjaman ASC
    `;

    const { rows } = await pool.query(query);

    return rows;
};


// =========================================================
// CREATE PENGEMBALIAN
// Sekaligus:
// - update status eksemplar
// - update stok buku
// - update status peminjaman
// - generate denda otomatis
// =========================================================
const createPengembalian = async ({
    id_detail_peminjaman,
    kondisi_buku,
    catatan
}) => {

    const client = await pool.connect();

    const TARIF_TELAT_PER_HARI = 2000;
    const DENDA_RUSAK = 25000;
    const DENDA_HILANG = 100000;

    try {
        await client.query('BEGIN');

        // =====================================================
        // 1. AMBIL DETAIL PEMINJAMAN
        // =====================================================
        const detailRes = await client.query(
            `
            SELECT
                dp.id_detail_peminjaman,
                dp.id_peminjaman,
                dp.id_eksemplar,

                p.id_pengguna,
                p.tanggal_jatuh_tempo,
                p.status AS status_peminjaman,

                eb.id_buku,
                eb.nomor_urut,
                eb.status AS status_eksemplar,

                b.judul

            FROM detail_peminjaman dp

            JOIN peminjaman p
                ON dp.id_peminjaman = p.id_peminjaman

            JOIN eksemplar_buku eb
                ON dp.id_eksemplar = eb.id_eksemplar

            JOIN buku b
                ON eb.id_buku = b.id_buku

            WHERE dp.id_detail_peminjaman = $1

            FOR UPDATE OF dp, p, eb
            `,
            [id_detail_peminjaman]
        );

        const detail = detailRes.rows[0];

        if (!detail) {
            throw Object.assign(
                new Error('Detail peminjaman tidak ditemukan.'),
                { statusCode: 404 }
            );
        }


        // =====================================================
        // 2. CEK STATUS PEMINJAMAN
        // =====================================================
        if (detail.status_peminjaman !== 'dipinjam') {
            throw Object.assign(
                new Error(
                    'Peminjaman ini tidak sedang berstatus dipinjam.'
                ),
                { statusCode: 400 }
            );
        }


        // =====================================================
        // 3. CEK STATUS EKSEMPLAR
        // =====================================================
        if (detail.status_eksemplar !== 'dipinjam') {
            throw Object.assign(
                new Error(
                    'Eksemplar buku ini tidak sedang dipinjam.'
                ),
                { statusCode: 400 }
            );
        }


        // =====================================================
        // 4. CEK SUDAH PERNAH DIKEMBALIKAN
        // =====================================================
        const cekKembali = await client.query(
            `
            SELECT id_pengembalian
            FROM pengembalian
            WHERE id_detail_peminjaman = $1
            `,
            [id_detail_peminjaman]
        );

        if (cekKembali.rows.length > 0) {
            throw Object.assign(
                new Error(
                    'Eksemplar buku ini sudah dikembalikan sebelumnya.'
                ),
                { statusCode: 400 }
            );
        }


        // =====================================================
        // 5. INSERT PENGEMBALIAN
        // =====================================================
        const kembaliRes = await client.query(
            `
            INSERT INTO pengembalian (
                id_detail_peminjaman,
                tanggal_pengembalian,
                kondisi_buku,
                catatan
            )
            VALUES (
                $1,
                CURRENT_TIMESTAMP,
                $2,
                $3
            )
            RETURNING *
            `,
            [
                id_detail_peminjaman,
                kondisi_buku,
                catatan || null
            ]
        );

        const pengembalian = kembaliRes.rows[0];


        // =====================================================
        // 6. UPDATE EKSEMPLAR + STOK BUKU
        // =====================================================

        if (kondisi_buku === 'baik') {

            // Eksemplar kembali tersedia
            await client.query(
                `
                UPDATE eksemplar_buku
                SET status = 'tersedia'
                WHERE id_eksemplar = $1
                `,
                [detail.id_eksemplar]
            );

            // Stok tersedia bertambah
            await client.query(
                `
                UPDATE buku
                SET stok_tersedia =
                    LEAST(stok_total, stok_tersedia + 1)
                WHERE id_buku = $1
                `,
                [detail.id_buku]
            );
        }


        else if (kondisi_buku === 'rusak') {

            // Eksemplar tidak bisa dipinjam lagi
            await client.query(
                `
                UPDATE eksemplar_buku
                SET status = 'rusak'
                WHERE id_eksemplar = $1
                `,
                [detail.id_eksemplar]
            );

            // Tidak menambah stok_tersedia
            // karena buku rusak tidak dapat dipinjam.
        }


        else if (kondisi_buku === 'hilang') {

            // Eksemplar menjadi hilang
            await client.query(
                `
                UPDATE eksemplar_buku
                SET status = 'hilang'
                WHERE id_eksemplar = $1
                `,
                [detail.id_eksemplar]
            );

            // Buku hilang mengurangi stok total.
            await client.query(
                `
                UPDATE buku
                SET stok_total = GREATEST(0, stok_total - 1),
                    stok_tersedia =
                        LEAST(
                            GREATEST(0, stok_total - 1),
                            stok_tersedia
                        )
                WHERE id_buku = $1
                `,
                [detail.id_buku]
            );
        }


        // =====================================================
        // 7. CEK APAKAH SEMUA DETAIL SUDAH DIKEMBALIKAN
        // =====================================================
        const sisaRes = await client.query(
            `
            SELECT COUNT(*) AS sisa
            FROM detail_peminjaman dp

            LEFT JOIN pengembalian pg
                ON dp.id_detail_peminjaman =
                   pg.id_detail_peminjaman

            WHERE dp.id_peminjaman = $1
              AND pg.id_pengembalian IS NULL
            `,
            [detail.id_peminjaman]
        );

        const sisa = Number(sisaRes.rows[0].sisa);

        if (sisa === 0) {

            await client.query(
                `
                UPDATE peminjaman
                SET status = 'selesai'
                WHERE id_peminjaman = $1
                `,
                [detail.id_peminjaman]
            );
        }


        // =====================================================
        // 8. HITUNG DENDA
        // =====================================================
        let totalDenda = 0;

        const alasanList = [];


        // -----------------------------------------------------
        // DENDA KETERLAMBATAN
        // -----------------------------------------------------
        if (detail.tanggal_jatuh_tempo) {

            const tanggalKembali = new Date(
                pengembalian.tanggal_pengembalian
            );

            const tanggalJatuhTempo = new Date(
                detail.tanggal_jatuh_tempo
            );

            tanggalKembali.setHours(0, 0, 0, 0);
            tanggalJatuhTempo.setHours(0, 0, 0, 0);

            const selisihMs =
                tanggalKembali - tanggalJatuhTempo;

            const hariTelat = Math.floor(
                selisihMs /
                (1000 * 60 * 60 * 24)
            );

            if (hariTelat > 0) {

                const dendaTelat =
                    hariTelat * TARIF_TELAT_PER_HARI;

                totalDenda += dendaTelat;

                alasanList.push(
                    `Terlambat ${hariTelat} hari`
                );
            }
        }


        // -----------------------------------------------------
        // DENDA RUSAK
        // -----------------------------------------------------
        if (kondisi_buku === 'rusak') {

            totalDenda += DENDA_RUSAK;

            alasanList.push(
                'Buku rusak'
            );
        }


        // -----------------------------------------------------
        // DENDA HILANG
        // -----------------------------------------------------
        if (kondisi_buku === 'hilang') {

            totalDenda += DENDA_HILANG;

            alasanList.push(
                'Buku hilang'
            );
        }


        // =====================================================
        // 9. INSERT DENDA JIKA ADA
        // =====================================================
        let dendaCreated = null;

        if (totalDenda > 0) {

            const dendaRes = await client.query(
                `
                INSERT INTO denda (
                    id_pengembalian,
                    jumlah_denda,
                    alasan,
                    status_pembayaran
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    'belum_bayar'
                )
                RETURNING *
                `,
                [
                    pengembalian.id_pengembalian,
                    totalDenda,
                    alasanList.join(' + ')
                ]
            );

            dendaCreated = dendaRes.rows[0];
        }


        // =====================================================
        // 10. COMMIT
        // =====================================================
        await client.query('COMMIT');

        return {
            pengembalian,
            denda: dendaCreated
        };

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
    createPengembalian
};