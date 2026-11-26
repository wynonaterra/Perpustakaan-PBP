const pool = require("../../config/database");

const BATAS_HARI_PINJAM = 7;

// =========================================================
// GET SEMUA PEMINJAMAN
// =========================================================
const getAllPeminjaman = async () => {
    const result = await pool.query(`
        SELECT
            p.id_peminjaman,
            p.id_pengguna,
            u.nama AS nama_pengguna,
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
                        'id_eksemplar', eb.id_eksemplar,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis
                    )
                    ORDER BY dp.id_detail_peminjaman
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS detail_buku

        FROM peminjaman p

        JOIN pengguna u
            ON p.id_pengguna = u.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON p.id_peminjaman = dp.id_peminjaman

        LEFT JOIN eksemplar_buku eb
            ON dp.id_eksemplar = eb.id_eksemplar

        LEFT JOIN buku b
            ON eb.id_buku = b.id_buku

        GROUP BY
            p.id_peminjaman,
            p.id_pengguna,
            u.nama,
            u.email,
            p.jenis_peminjaman,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan

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
            p.id_pengguna,
            u.nama AS nama_pengguna,
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
                        'id_eksemplar', eb.id_eksemplar,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis
                    )
                    ORDER BY dp.id_detail_peminjaman
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS detail_buku

        FROM peminjaman p

        JOIN pengguna u
            ON p.id_pengguna = u.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON p.id_peminjaman = dp.id_peminjaman

        LEFT JOIN eksemplar_buku eb
            ON dp.id_eksemplar = eb.id_eksemplar

        LEFT JOIN buku b
            ON eb.id_buku = b.id_buku

        WHERE p.id_peminjaman = $1

        GROUP BY
            p.id_peminjaman,
            p.id_pengguna,
            u.nama,
            u.email,
            p.jenis_peminjaman,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan
    `, [id]);

    return result.rows[0];
};


// =========================================================
// GET PEMINJAMAN MILIK USER TERTENTU
// =========================================================
const getPeminjamanByUser = async (idPengguna) => {
    const result = await pool.query(`
        SELECT
            p.id_peminjaman,
            p.id_pengguna,
            u.nama AS nama_pengguna,
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
                        'id_eksemplar', eb.id_eksemplar,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis
                    )
                    ORDER BY dp.id_detail_peminjaman
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS detail_buku

        FROM peminjaman p

        JOIN pengguna u
            ON p.id_pengguna = u.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON p.id_peminjaman = dp.id_peminjaman

        LEFT JOIN eksemplar_buku eb
            ON dp.id_eksemplar = eb.id_eksemplar

        LEFT JOIN buku b
            ON eb.id_buku = b.id_buku

        WHERE p.id_pengguna = $1

        GROUP BY
            p.id_peminjaman,
            p.id_pengguna,
            u.nama,
            u.email,
            p.jenis_peminjaman,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan

        ORDER BY p.id_peminjaman DESC
    `, [idPengguna]);

    return result.rows;
};


// =========================================================
// CREATE PEMINJAMAN
// =========================================================
const createPeminjaman = async ({
    idPengguna,
    jenisPeminjaman = "online",
    catatan,
    daftarBuku
}) => {

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // -------------------------------------------------
        // 1. CEK PENGGUNA
        // -------------------------------------------------
        const penggunaResult = await client.query(`
            SELECT
                id_pengguna,
                status,
                peran
            FROM pengguna
            WHERE id_pengguna = $1
            FOR UPDATE
        `, [idPengguna]);

        if (penggunaResult.rows.length === 0) {
            throw new Error("Pengguna tidak ditemukan.");
        }

        const pengguna = penggunaResult.rows[0];

        if (pengguna.status !== "aktif") {
            throw new Error(
                "Pengguna tidak aktif dan tidak dapat melakukan peminjaman."
            );
        }

        if (pengguna.peran !== "anggota") {
            throw new Error(
                "Hanya anggota yang dapat membuat peminjaman."
            );
        }

        // -------------------------------------------------
        // 2. VALIDASI JENIS PEMINJAMAN
        // -------------------------------------------------
        if (!["online", "offline"].includes(jenisPeminjaman)) {
            throw new Error(
                "Jenis peminjaman harus online atau offline."
            );
        }

        // -------------------------------------------------
        // 3. VALIDASI DAFTAR BUKU
        // -------------------------------------------------
        if (!Array.isArray(daftarBuku) || daftarBuku.length === 0) {
            throw new Error("Minimal satu buku harus dipilih.");
        }

        // -------------------------------------------------
        // 4. NORMALISASI DAN VALIDASI ID BUKU
        // -------------------------------------------------
        const idBukuList = daftarBuku.map(
            item => Number(item.id_buku)
        );

        const uniqueIdBuku = [...new Set(idBukuList)];

        if (uniqueIdBuku.length !== idBukuList.length) {
            throw new Error(
                "Buku yang sama tidak boleh dimasukkan dua kali."
            );
        }

        // -------------------------------------------------
        // 5. LOCK BUKU
        // -------------------------------------------------
        const bukuResult = await client.query(`
            SELECT
                id_buku,
                judul,
                stok_total,
                stok_tersedia
            FROM buku
            WHERE id_buku = ANY($1::int[])
            FOR UPDATE
        `, [uniqueIdBuku]);

        if (bukuResult.rows.length !== uniqueIdBuku.length) {
            throw new Error(
                "Ada buku yang tidak ditemukan."
            );
        }

        const bukuMap = new Map();

        bukuResult.rows.forEach(buku => {
            bukuMap.set(Number(buku.id_buku), buku);
        });

        // -------------------------------------------------
        // 6. VALIDASI JUMLAH DAN STOK
        // -------------------------------------------------
        for (const item of daftarBuku) {

            const idBuku = Number(item.id_buku);
            const jumlah = Number(item.jumlah);

            if (
                !Number.isInteger(idBuku) ||
                idBuku <= 0
            ) {
                throw new Error(
                    "ID buku tidak valid."
                );
            }

            if (
                !Number.isInteger(jumlah) ||
                jumlah <= 0
            ) {
                throw new Error(
                    `Jumlah buku untuk ID ${idBuku} harus lebih dari 0.`
                );
            }

            const buku = bukuMap.get(idBuku);

            if (!buku) {
                throw new Error(
                    `Buku dengan ID ${idBuku} tidak ditemukan.`
                );
            }

            if (Number(buku.stok_tersedia) < jumlah) {
                throw new Error(
                    `Stok buku "${buku.judul}" tidak mencukupi. ` +
                    `Stok tersedia: ${buku.stok_tersedia}.`
                );
            }
        }

        // -------------------------------------------------
        // 7. BUAT PEMINJAMAN
        // -------------------------------------------------
        const peminjamanResult = await client.query(`
            INSERT INTO peminjaman (
                id_pengguna,
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
                CURRENT_DATE + INTERVAL '${BATAS_HARI_PINJAM} days',
                'menunggu',
                $3
            )
            RETURNING *
        `, [
            idPengguna,
            jenisPeminjaman,
            catatan || null
        ]);

        const peminjaman = peminjamanResult.rows[0];

        // -------------------------------------------------
        // 8. AMBIL EKSEMPLAR TERSEDIA
        // -------------------------------------------------
        for (const item of daftarBuku) {

            const idBuku = Number(item.id_buku);
            const jumlah = Number(item.jumlah);

            const eksemplarResult = await client.query(`
                SELECT
                    id_eksemplar,
                    id_buku,
                    nomor_urut,
                    status
                FROM eksemplar_buku
                WHERE id_buku = $1
                  AND status = 'tersedia'
                ORDER BY nomor_urut
                LIMIT $2
                FOR UPDATE
            `, [
                idBuku,
                jumlah
            ]);

            if (eksemplarResult.rows.length !== jumlah) {
                throw new Error(
                    `Eksemplar buku dengan ID ${idBuku} ` +
                    `yang tersedia tidak mencukupi.`
                );
            }

            // -------------------------------------------------
            // 9. INSERT DETAIL PEMINJAMAN
            // -------------------------------------------------
            for (const eksemplar of eksemplarResult.rows) {

                await client.query(`
                    INSERT INTO detail_peminjaman (
                        id_peminjaman,
                        id_eksemplar
                    )
                    VALUES ($1, $2)
                `, [
                    peminjaman.id_peminjaman,
                    eksemplar.id_eksemplar
                ]);

                // -------------------------------------------------
                // 10. UBAH STATUS EKSEMPLAR
                // -------------------------------------------------
                await client.query(`
                    UPDATE eksemplar_buku
                    SET status = 'dipinjam'
                    WHERE id_eksemplar = $1
                `, [
                    eksemplar.id_eksemplar
                ]);
            }

            // -------------------------------------------------
            // 11. KURANGI STOK BUKU
            // -------------------------------------------------
            await client.query(`
                UPDATE buku
                SET stok_tersedia = stok_tersedia - $1
                WHERE id_buku = $2
            `, [
                jumlah,
                idBuku
            ]);
        }

        // -------------------------------------------------
        // 12. COMMIT
        // -------------------------------------------------
        await client.query("COMMIT");

        // Ambil data terbaru menggunakan connection pool
        return await getPeminjamanById(
            peminjaman.id_peminjaman
        );

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

        // -------------------------------------------------
        // 1. AMBIL PEMINJAMAN
        // -------------------------------------------------
        const currentResult = await client.query(`
            SELECT *
            FROM peminjaman
            WHERE id_peminjaman = $1
            FOR UPDATE
        `, [id]);

        if (currentResult.rows.length === 0) {
            throw new Error(
                "Peminjaman tidak ditemukan."
            );
        }

        const current = currentResult.rows[0];

        // -------------------------------------------------
        // 2. STATUS YANG DIIZINKAN
        // -------------------------------------------------
        const allowedStatus = [
            "menunggu",
            "disetujui",
            "siap_diambil",
            "dipinjam",
            "ditolak",
            "dibatalkan",
            "kedaluwarsa",
            "selesai"
        ];

        if (
            status !== undefined &&
            status !== null &&
            !allowedStatus.includes(status)
        ) {
            throw new Error(
                "Status peminjaman tidak valid."
            );
        }

        // -------------------------------------------------
        // 3. PEMINJAMAN SELESAI TIDAK BOLEH DIUBAH
        // -------------------------------------------------
        if (
            current.status === "selesai" &&
            (
                status !== undefined ||
                catatan !== undefined ||
                batasPengambilan !== undefined
            )
        ) {
            throw new Error(
                "Peminjaman yang sudah selesai tidak dapat diubah."
            );
        }

        // -------------------------------------------------
        // 4. CEK PEMBATALAN
        // -------------------------------------------------
        if (
            status === "dibatalkan" &&
            current.status !== "dibatalkan" &&
            current.status !== "selesai"
        ) {

            // ---------------------------------------------
            // CEK APAKAH SUDAH ADA PENGEMBALIAN
            // ---------------------------------------------
            const returnCheck = await client.query(`
                SELECT
                    dp.id_detail_peminjaman
                FROM detail_peminjaman dp
                JOIN pengembalian pg
                    ON dp.id_detail_peminjaman = pg.id_detail_peminjaman
                WHERE dp.id_peminjaman = $1
                LIMIT 1
            `, [id]);

            if (returnCheck.rows.length > 0) {
                throw new Error(
                    "Peminjaman yang sudah memiliki pengembalian " +
                    "tidak dapat dibatalkan."
                );
            }

            // ---------------------------------------------
            // AMBIL EKSEMPLAR PEMINJAMAN
            // ---------------------------------------------
            const detailsResult = await client.query(`
                SELECT
                    dp.id_detail_peminjaman,
                    dp.id_eksemplar,
                    eb.id_buku,
                    eb.status
                FROM detail_peminjaman dp
                JOIN eksemplar_buku eb
                    ON dp.id_eksemplar = eb.id_eksemplar
                WHERE dp.id_peminjaman = $1
                FOR UPDATE OF eb
            `, [id]);

            // ---------------------------------------------
            // KEMBALIKAN EKSEMPLAR
            // ---------------------------------------------
            const bukuJumlahMap = new Map();

            for (const detail of detailsResult.rows) {

                // Hanya eksemplar yang sedang dipinjam
                // yang dikembalikan ke stok.
                if (detail.status === "dipinjam") {

                    await client.query(`
                        UPDATE eksemplar_buku
                        SET status = 'tersedia'
                        WHERE id_eksemplar = $1
                    `, [
                        detail.id_eksemplar
                    ]);

                    const idBuku = Number(detail.id_buku);

                    bukuJumlahMap.set(
                        idBuku,
                        (bukuJumlahMap.get(idBuku) || 0) + 1
                    );
                }
            }

            // ---------------------------------------------
            // KEMBALIKAN STOK BUKU
            // ---------------------------------------------
            for (const [
                idBuku,
                jumlah
            ] of bukuJumlahMap.entries()) {

                await client.query(`
                    UPDATE buku
                    SET stok_tersedia = stok_tersedia + $1
                    WHERE id_buku = $2
                `, [
                    jumlah,
                    idBuku
                ]);
            }
        }

        // -------------------------------------------------
        // 5. UPDATE DATA PEMINJAMAN
        // -------------------------------------------------
        const result = await client.query(`
            UPDATE peminjaman
            SET
                status = COALESCE($1, status),
                catatan = COALESCE($2, catatan),
                batas_pengambilan = COALESCE($3, batas_pengambilan)
            WHERE id_peminjaman = $4
            RETURNING *
        `, [
            status !== undefined ? status : null,
            catatan !== undefined ? catatan : null,
            batasPengambilan !== undefined
                ? batasPengambilan
                : null,
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
// EXPORT
// =========================================================
module.exports = {
    getAllPeminjaman,
    getPeminjamanById,
    getPeminjamanByUser,
    createPeminjaman,
    updatePeminjaman
};