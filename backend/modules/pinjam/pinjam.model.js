const pool = require("../../config/database");

const BATAS_HARI_PINJAM = 7;

// =========================================================
// GET SEMUA PEMINJAMAN
// =========================================================
const getAllPeminjaman = async () => {
    const result = await pool.query(`
        SELECT
            p.id_peminjaman,
            p.id_anggota,
            a.nomor_anggota,
            u.nama AS nama_anggota,
            p.jenis_peminjaman,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan,

            COALESCE(
                json_agg(
                    json_build_object(
                        'id_detail_peminjaman', dp.id_detail_peminjaman,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis,
                        'jumlah', dp.jumlah
                    )
                    ORDER BY dp.id_detail_peminjaman
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS detail_buku

        FROM peminjaman p

        JOIN anggota a
            ON p.id_anggota = a.id_anggota

        JOIN pengguna u
            ON a.id_pengguna = u.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON p.id_peminjaman = dp.id_peminjaman

        LEFT JOIN buku b
            ON dp.id_buku = b.id_buku

        GROUP BY
            p.id_peminjaman,
            a.nomor_anggota,
            u.nama

        ORDER BY p.id_peminjaman DESC
    `);

    return result.rows;
};


// =========================================================
// GET PEMINJAMAN BERDASARKAN ID
// =========================================================
const getPeminjamanById = async (id) => {
    const result = await pool.query(`
        SELECT
            p.id_peminjaman,
            p.id_anggota,
            a.nomor_anggota,
            u.nama AS nama_anggota,
            u.email,
            p.jenis_peminjaman,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan,

            COALESCE(
                json_agg(
                    json_build_object(
                        'id_detail_peminjaman', dp.id_detail_peminjaman,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis,
                        'jumlah', dp.jumlah
                    )
                    ORDER BY dp.id_detail_peminjaman
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS detail_buku

        FROM peminjaman p

        JOIN anggota a
            ON p.id_anggota = a.id_anggota

        JOIN pengguna u
            ON a.id_pengguna = u.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON p.id_peminjaman = dp.id_peminjaman

        LEFT JOIN buku b
            ON dp.id_buku = b.id_buku

        WHERE p.id_peminjaman = $1

        GROUP BY
            p.id_peminjaman,
            a.nomor_anggota,
            u.nama,
            u.email
    `);

    return result.rows[0];
};


// =========================================================
// GET PEMINJAMAN MILIK USER TERTENTU
// =========================================================
const getPeminjamanByUser = async (idPengguna) => {
    const result = await pool.query(`
        SELECT
            p.id_peminjaman,
            p.id_anggota,
            a.nomor_anggota,
            u.nama AS nama_anggota,
            p.jenis_peminjaman,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan,

            COALESCE(
                json_agg(
                    json_build_object(
                        'id_detail_peminjaman', dp.id_detail_peminjaman,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis,
                        'jumlah', dp.jumlah
                    )
                    ORDER BY dp.id_detail_peminjaman
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS detail_buku

        FROM peminjaman p

        JOIN anggota a
            ON p.id_anggota = a.id_anggota

        JOIN pengguna u
            ON a.id_pengguna = u.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON p.id_peminjaman = dp.id_peminjaman

        LEFT JOIN buku b
            ON dp.id_buku = b.id_buku

        WHERE a.id_pengguna = $1

        GROUP BY
            p.id_peminjaman,
            a.nomor_anggota,
            u.nama

        ORDER BY p.id_peminjaman DESC
    `);

    return result.rows;
};


// =========================================================
// CEK ID ANGGOTA BERDASARKAN ID PENGGUNA
// =========================================================
const getAnggotaByUserId = async (idPengguna) => {
    const result = await pool.query(`
        SELECT
            id_anggota,
            status
        FROM anggota
        WHERE id_pengguna = $1
    `, [idPengguna]);

    return result.rows[0];
};


// =========================================================
// CREATE PEMINJAMAN
// =========================================================
const createPeminjaman = async ({
    idAnggota,
    jenisPeminjaman = "online",
    catatan,
    daftarBuku
}) => {

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // -------------------------------------------------
        // 1. CEK ANGGOTA
        // -------------------------------------------------
        const anggotaResult = await client.query(`
            SELECT
                id_anggota,
                status
            FROM anggota
            WHERE id_anggota = $1
            FOR UPDATE
        `, [idAnggota]);

        if (anggotaResult.rows.length === 0) {
            throw new Error("Anggota tidak ditemukan.");
        }

        if (anggotaResult.rows[0].status !== "aktif") {
            throw new Error("Anggota tidak aktif dan tidak dapat melakukan peminjaman.");
        }


        // -------------------------------------------------
        // 2. VALIDASI DAFTAR BUKU
        // -------------------------------------------------
        if (!Array.isArray(daftarBuku) || daftarBuku.length === 0) {
            throw new Error("Minimal satu buku harus dipilih.");
        }


        // -------------------------------------------------
        // 3. CEK DUPLIKAT BUKU
        // -------------------------------------------------
        const idBukuList = daftarBuku.map(item => Number(item.id_buku));

        const uniqueIdBuku = [...new Set(idBukuList)];

        if (uniqueIdBuku.length !== idBukuList.length) {
            throw new Error("Buku yang sama tidak boleh dimasukkan dua kali.");
        }


        // -------------------------------------------------
        // 4. LOCK DAN CEK STOK BUKU
        // -------------------------------------------------
        const bukuResult = await client.query(`
            SELECT
                id_buku,
                judul,
                stok_tersedia
            FROM buku
            WHERE id_buku = ANY($1::int[])
            FOR UPDATE
        `, [uniqueIdBuku]);


        if (bukuResult.rows.length !== uniqueIdBuku.length) {
            throw new Error("Ada buku yang tidak ditemukan.");
        }


        // -------------------------------------------------
        // 5. CEK JUMLAH DAN STOK
        // -------------------------------------------------
        const bukuMap = new Map();

        bukuResult.rows.forEach(buku => {
            bukuMap.set(Number(buku.id_buku), buku);
        });


        for (const item of daftarBuku) {

            const idBuku = Number(item.id_buku);
            const jumlah = Number(item.jumlah);

            if (!Number.isInteger(jumlah) || jumlah <= 0) {
                throw new Error(`Jumlah buku untuk ID ${idBuku} harus lebih dari 0.`);
            }

            const buku = bukuMap.get(idBuku);

            if (!buku) {
                throw new Error(`Buku dengan ID ${idBuku} tidak ditemukan.`);
            }

            if (buku.stok_tersedia < jumlah) {
                throw new Error(
                    `Stok buku "${buku.judul}" tidak mencukupi. ` +
                    `Stok tersedia: ${buku.stok_tersedia}.`
                );
            }
        }


        // -------------------------------------------------
        // 6. BUAT PEMINJAMAN
        // Jatuh tempo otomatis 7 hari
        // -------------------------------------------------
        const peminjamanResult = await client.query(`
            INSERT INTO peminjaman (
                id_anggota,
                jenis_peminjaman,
                tanggal_peminjaman,
                tanggal_jatuh_tempo,
                status,
                catatan
            )
            VALUES (
                $1,
                $2,
                CURRENT_TIMESTAMP,
                CURRENT_DATE + INTERVAL '7 days',
                'dipinjam',
                $3
            )
            RETURNING *
        `, [
            idAnggota,
            jenisPeminjaman,
            catatan || null
        ]);


        const peminjaman = peminjamanResult.rows[0];


        // -------------------------------------------------
        // 7. INSERT DETAIL + KURANGI STOK
        // -------------------------------------------------
        for (const item of daftarBuku) {

            const idBuku = Number(item.id_buku);
            const jumlah = Number(item.jumlah);

            await client.query(`
                INSERT INTO detail_peminjaman (
                    id_peminjaman,
                    id_buku,
                    jumlah
                )
                VALUES ($1, $2, $3)
            `, [
                peminjaman.id_peminjaman,
                idBuku,
                jumlah
            ]);


            await client.query(`
                UPDATE buku
                SET stok_tersedia = stok_tersedia - $1
                WHERE id_buku = $2
            `, [
                jumlah,
                idBuku
            ]);
        }


        await client.query("COMMIT");

        return await getPeminjamanById(peminjaman.id_peminjaman);

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};


// =========================================================
// UPDATE PEMINJAMAN
// =========================================================
const updatePeminjaman = async (
    id,
    {
        status,
        catatan,
        batasPengambilan
    }
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const currentResult = await client.query(`
            SELECT *
            FROM peminjaman
            WHERE id_peminjaman = $1
            FOR UPDATE
        `, [id]);


        if (currentResult.rows.length === 0) {
            throw new Error("Peminjaman tidak ditemukan.");
        }

        const current = currentResult.rows[0];


        const allowedStatus = [
            "menunggu",
            "disetujui",
            "siap_diambil",
            "dipinjam",
            "ditolak",
            "dibatalkan"
        ];


        if (status && !allowedStatus.includes(status)) {
            throw new Error("Status peminjaman tidak valid.");
        }


        // -------------------------------------------------
        // Jika dibatalkan, stok dikembalikan
        // -------------------------------------------------
        if (
            status === "dibatalkan" &&
            current.status !== "dibatalkan" &&
            current.status !== "selesai"
        ) {

            const returnCheck = await client.query(`
                SELECT dp.id_detail_peminjaman
                FROM detail_peminjaman dp
                JOIN pengembalian pg
                    ON dp.id_detail_peminjaman = pg.id_detail_peminjaman
                WHERE dp.id_peminjaman = $1
                LIMIT 1
            `, [id]);


            if (returnCheck.rows.length > 0) {
                throw new Error(
                    "Peminjaman yang sudah memiliki pengembalian tidak dapat dibatalkan."
                );
            }


            const details = await client.query(`
                SELECT
                    id_buku,
                    jumlah
                FROM detail_peminjaman
                WHERE id_peminjaman = $1
            `, [id]);


            for (const detail of details.rows) {

                await client.query(`
                    UPDATE buku
                    SET stok_tersedia = stok_tersedia + $1
                    WHERE id_buku = $2
                `, [
                    detail.jumlah,
                    detail.id_buku
                ]);
            }
        }


        const result = await client.query(`
            UPDATE peminjaman
            SET
                status = COALESCE($1, status),
                catatan = COALESCE($2, catatan),
                batas_pengambilan = COALESCE($3, batas_pengambilan)
            WHERE id_peminjaman = $4
            RETURNING *
        `, [
            status || null,
            catatan !== undefined ? catatan : null,
            batasPengambilan || null,
            id
        ]);


        await client.query("COMMIT");

        return result.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};


// =========================================================
// DELETE PEMINJAMAN
// =========================================================
const deletePeminjaman = async (id) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const result = await client.query(`
            SELECT *
            FROM peminjaman
            WHERE id_peminjaman = $1
            FOR UPDATE
        `, [id]);


        if (result.rows.length === 0) {
            throw new Error("Peminjaman tidak ditemukan.");
        }


        const peminjaman = result.rows[0];


        if (peminjaman.status === "selesai") {
            throw new Error(
                "Peminjaman yang sudah selesai tidak dapat dihapus."
            );
        }


        // -------------------------------------------------
        // Cek apakah sudah ada pengembalian
        // -------------------------------------------------
        const returnCheck = await client.query(`
            SELECT dp.id_detail_peminjaman
            FROM detail_peminjaman dp
            JOIN pengembalian pg
                ON dp.id_detail_peminjaman = pg.id_detail_peminjaman
            WHERE dp.id_peminjaman = $1
            LIMIT 1
        `, [id]);


        if (returnCheck.rows.length > 0) {
            throw new Error(
                "Peminjaman yang sudah memiliki data pengembalian tidak dapat dihapus."
            );
        }


        // -------------------------------------------------
        // Jika belum dibatalkan, kembalikan stok
        // -------------------------------------------------
        if (peminjaman.status !== "dibatalkan") {

            const details = await client.query(`
                SELECT
                    id_buku,
                    jumlah
                FROM detail_peminjaman
                WHERE id_peminjaman = $1
            `, [id]);


            for (const detail of details.rows) {

                await client.query(`
                    UPDATE buku
                    SET stok_tersedia = stok_tersedia + $1
                    WHERE id_buku = $2
                `, [
                    detail.jumlah,
                    detail.id_buku
                ]);
            }
        }


        await client.query(`
            DELETE FROM peminjaman
            WHERE id_peminjaman = $1
        `, [id]);


        await client.query("COMMIT");

        return true;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};


module.exports = {
    getAllPeminjaman,
    getPeminjamanById,
    getPeminjamanByUser,
    getAnggotaByUserId,
    createPeminjaman,
    updatePeminjaman,
    deletePeminjaman
};