const pool = require("../../config/database");

const BATAS_HARI_PINJAM = 7;

const STATUS_TRANSISI = {
    menunggu: ["disetujui", "ditolak", "dibatalkan"],
    disetujui: ["siap_diambil", "dibatalkan"],
    siap_diambil: ["dipinjam", "kedaluwarsa", "dibatalkan"],
    dipinjam: ["selesai"],
    ditolak: [],
    dibatalkan: [],
    kedaluwarsa: [],
    selesai: [],
};

// =========================================================
// GET SEMUA PEMINJAMAN
// =========================================================
const getAllPeminjaman = async () => {
    const result = await pool.query(`
        SELECT
            p.id_peminjaman,
            p.id_pengguna,
            u.nomor_anggota,
            u.nama AS nama_anggota,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id_detail_peminjaman', dp.id_detail_peminjaman,
                        'id_eksemplar', eb.id_eksemplar,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis,
                        'nomor_urut', eb.nomor_urut,
                        'status_eksemplar', eb.status,
                        'jumlah', 1
                    )
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS daftar_buku

        FROM peminjaman p

        JOIN pengguna u
            ON u.id_pengguna = p.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON dp.id_peminjaman = p.id_peminjaman

        LEFT JOIN eksemplar_buku eb
            ON eb.id_eksemplar = dp.id_eksemplar

        LEFT JOIN buku b
            ON b.id_buku = eb.id_buku

        GROUP BY
            p.id_peminjaman,
            p.id_pengguna,
            u.nomor_anggota,
            u.nama,
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
const getPeminjamanById = async (idPeminjaman) => {
    const result = await pool.query(
        `
        SELECT
            p.id_peminjaman,
            p.id_pengguna,
            u.nomor_anggota,
            u.nama AS nama_anggota,
            u.email,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id_detail_peminjaman', dp.id_detail_peminjaman,
                        'id_eksemplar', eb.id_eksemplar,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis,
                        'nomor_urut', eb.nomor_urut,
                        'status_eksemplar', eb.status,
                        'jumlah', 1
                    )
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS daftar_buku

        FROM peminjaman p

        JOIN pengguna u
            ON u.id_pengguna = p.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON dp.id_peminjaman = p.id_peminjaman

        LEFT JOIN eksemplar_buku eb
            ON eb.id_eksemplar = dp.id_eksemplar

        LEFT JOIN buku b
            ON b.id_buku = eb.id_buku

        WHERE p.id_peminjaman = $1

        GROUP BY
            p.id_peminjaman,
            p.id_pengguna,
            u.nomor_anggota,
            u.nama,
            u.email,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan
        `,
        [idPeminjaman]
    );

    return result.rows[0] || null;
};

// =========================================================
// GET PEMINJAMAN MILIK USER
// =========================================================
const getPeminjamanByUser = async (idPengguna) => {
    const result = await pool.query(
        `
        SELECT
            p.id_peminjaman,
            p.id_pengguna,
            u.nomor_anggota,
            u.nama AS nama_anggota,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id_detail_peminjaman', dp.id_detail_peminjaman,
                        'id_eksemplar', eb.id_eksemplar,
                        'id_buku', b.id_buku,
                        'judul', b.judul,
                        'penulis', b.penulis,
                        'nomor_urut', eb.nomor_urut,
                        'status_eksemplar', eb.status,
                        'jumlah', 1
                    )
                ) FILTER (WHERE dp.id_detail_peminjaman IS NOT NULL),
                '[]'
            ) AS daftar_buku

        FROM peminjaman p

        JOIN pengguna u
            ON u.id_pengguna = p.id_pengguna

        LEFT JOIN detail_peminjaman dp
            ON dp.id_peminjaman = p.id_peminjaman

        LEFT JOIN eksemplar_buku eb
            ON eb.id_eksemplar = dp.id_eksemplar

        LEFT JOIN buku b
            ON b.id_buku = eb.id_buku

        WHERE p.id_pengguna = $1

        GROUP BY
            p.id_peminjaman,
            p.id_pengguna,
            u.nomor_anggota,
            u.nama,
            p.tanggal_peminjaman,
            p.waktu_pengambilan,
            p.batas_pengambilan,
            p.tanggal_jatuh_tempo,
            p.status,
            p.catatan

        ORDER BY p.id_peminjaman DESC
        `,
        [idPengguna]
    );

    return result.rows;
};

// =========================================================
// CREATE PEMINJAMAN
// =========================================================
const createPeminjaman = async ({
    idPengguna,
    daftarBuku,
    catatan,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // -------------------------------------------------
        // Validasi user
        // -------------------------------------------------
        const userResult = await client.query(
            `
            SELECT
                id_pengguna,
                peran,
                status
            FROM pengguna
            WHERE id_pengguna = $1
            FOR UPDATE
            `,
            [idPengguna]
        );

        if (userResult.rows.length === 0) {
            throw new Error("Pengguna tidak ditemukan.");
        }

        const user = userResult.rows[0];

        if (user.peran !== "anggota") {
            throw new Error(
                "Hanya anggota yang dapat membuat peminjaman."
            );
        }

        if (user.status !== "aktif") {
            throw new Error(
                "Akun anggota tidak aktif."
            );
        }

        // -------------------------------------------------
        // Validasi daftar buku
        // -------------------------------------------------
        if (
            !Array.isArray(daftarBuku) ||
            daftarBuku.length === 0
        ) {
            throw new Error(
                "Minimal satu buku harus dipilih."
            );
        }

        // Normalisasi format:
        // [
        //   { id_buku: 1, jumlah: 1 },
        //   { id_buku: 2, jumlah: 2 }
        // ]
        const daftarNormal = daftarBuku.map((item) => ({
            id_buku: Number(item.id_buku),
            jumlah: Number(item.jumlah),
        }));

        for (const item of daftarNormal) {
            if (
                !Number.isInteger(item.id_buku) ||
                !Number.isInteger(item.jumlah) ||
                item.jumlah <= 0
            ) {
                throw new Error(
                    "id_buku dan jumlah harus berupa angka yang valid."
                );
            }
        }

        // -------------------------------------------------
        // Tidak boleh ada buku yang sama dalam satu transaksi
        // -------------------------------------------------
        const idBukuSet = new Set(
            daftarNormal.map((item) => item.id_buku)
        );

        if (idBukuSet.size !== daftarNormal.length) {
            throw new Error(
                "Buku yang sama tidak boleh dimasukkan lebih dari satu kali."
            );
        }

        // -------------------------------------------------
        // Lock data buku
        // -------------------------------------------------
        const idBukuArray = daftarNormal.map(
            (item) => item.id_buku
        );

        const bukuResult = await client.query(
            `
            SELECT
                id_buku,
                judul,
                stok_total,
                stok_tersedia
            FROM buku
            WHERE id_buku = ANY($1::int[])
            FOR UPDATE
            `,
            [idBukuArray]
        );

        if (
            bukuResult.rows.length !== idBukuArray.length
        ) {
            throw new Error(
                "Salah satu buku tidak ditemukan."
            );
        }

        const bukuMap = new Map();

        bukuResult.rows.forEach((buku) => {
            bukuMap.set(buku.id_buku, buku);
        });

        // -------------------------------------------------
        // Validasi stok dan eksemplar
        // -------------------------------------------------
        for (const item of daftarNormal) {
            const buku = bukuMap.get(item.id_buku);

            if (buku.stok_tersedia < item.jumlah) {
                throw new Error(
                    `Stok buku "${buku.judul}" tidak mencukupi.`
                );
            }

            const exemplarResult = await client.query(
                `
                SELECT
                    id_eksemplar,
                    id_buku,
                    nomor_urut,
                    status
                FROM eksemplar_buku
                WHERE id_buku = $1
                  AND status = 'tersedia'
                ORDER BY nomor_urut ASC
                LIMIT $2
                FOR UPDATE
                `,
                [item.id_buku, item.jumlah]
            );

            if (
                exemplarResult.rows.length < item.jumlah
            ) {
                throw new Error(
                    `Eksemplar buku "${buku.judul}" yang tersedia tidak mencukupi.`
                );
            }
        }

        // -------------------------------------------------
        // Buat data peminjaman
        // -------------------------------------------------
        const pinjamResult = await client.query(
            `
            INSERT INTO peminjaman (
                id_pengguna,
                tanggal_peminjaman,
                waktu_pengambilan,
                batas_pengambilan,
                tanggal_jatuh_tempo,
                status,
                catatan
            )
            VALUES (
                $1,
                CURRENT_TIMESTAMP,
                NULL,
                NULL,
                NULL,
                'menunggu',
                $2::TEXT
            )
            RETURNING id_peminjaman
            `,
            [
                idPengguna,
                catatan || null,
            ]
        );

        const idPeminjaman =
            pinjamResult.rows[0].id_peminjaman;

        // -------------------------------------------------
        // Simpan detail + reservasi eksemplar
        // -------------------------------------------------
        for (const item of daftarNormal) {
            const exemplarResult = await client.query(
                `
                SELECT
                    id_eksemplar,
                    id_buku,
                    nomor_urut
                FROM eksemplar_buku
                WHERE id_buku = $1
                  AND status = 'tersedia'
                ORDER BY nomor_urut ASC
                LIMIT $2
                FOR UPDATE
                `,
                [item.id_buku, item.jumlah]
            );

            for (const exemplar of exemplarResult.rows) {
                await client.query(
                    `
                    INSERT INTO detail_peminjaman (
                        id_peminjaman,
                        id_eksemplar
                    )
                    VALUES ($1, $2)
                    `,
                    [
                        idPeminjaman,
                        exemplar.id_eksemplar,
                    ]
                );

                // Eksemplar langsung dipesan
                await client.query(
                    `
                    UPDATE eksemplar_buku
                    SET status = 'dipesan'
                    WHERE id_eksemplar = $1
                    `,
                    [exemplar.id_eksemplar]
                );
            }

            // Stok berkurang karena eksemplar sudah dicadangkan
            await client.query(
                `
                UPDATE buku
                SET stok_tersedia = stok_tersedia - $1
                WHERE id_buku = $2
                `,
                [
                    item.jumlah,
                    item.id_buku,
                ]
            );
        }

        await client.query("COMMIT");

        return await getPeminjamanById(
            idPeminjaman
        );

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// =========================================================
// RELEASE EKSEMPLAR
// =========================================================
const releaseExemplars = async (
    client,
    idPeminjaman
) => {
    const result = await client.query(
        `
        SELECT
            eb.id_eksemplar,
            eb.id_buku,
            eb.status
        FROM detail_peminjaman dp
        JOIN eksemplar_buku eb
            ON eb.id_eksemplar = dp.id_eksemplar
        WHERE dp.id_peminjaman = $1
        FOR UPDATE OF eb
        `,
        [idPeminjaman]
    );

    const jumlahPerBuku = {};

    for (const exemplar of result.rows) {
        if (
            exemplar.status !== "dipesan" &&
            exemplar.status !== "dipinjam"
        ) {
            continue;
        }

        await client.query(
            `
            UPDATE eksemplar_buku
            SET status = 'tersedia'
            WHERE id_eksemplar = $1
            `,
            [exemplar.id_eksemplar]
        );

        if (!jumlahPerBuku[exemplar.id_buku]) {
            jumlahPerBuku[exemplar.id_buku] = 0;
        }

        jumlahPerBuku[exemplar.id_buku]++;
    }

    // Kembalikan stok
    for (const [idBuku, jumlah] of Object.entries(
        jumlahPerBuku
    )) {
        await client.query(
            `
            UPDATE buku
            SET stok_tersedia = LEAST(
                stok_total,
                stok_tersedia + $1
            )
            WHERE id_buku = $2
            `,
            [
                jumlah,
                Number(idBuku),
            ]
        );
    }
};

// =========================================================
// UPDATE PEMINJAMAN / PERUBAHAN STATUS
// =========================================================
const updatePeminjaman = async (
    idPeminjaman,
    {
        status,
        catatan,
        batasPengambilan,
    }
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // -------------------------------------------------
        // Lock peminjaman
        // -------------------------------------------------
        const currentResult = await client.query(
            `
            SELECT *
            FROM peminjaman
            WHERE id_peminjaman = $1
            FOR UPDATE
            `,
            [idPeminjaman]
        );

        if (currentResult.rows.length === 0) {
            throw new Error(
                "Data peminjaman tidak ditemukan."
            );
        }

        const current = currentResult.rows[0];

        if (!status) {
            throw new Error(
                "Status peminjaman wajib diisi."
            );
        }

        if (
            !Object.prototype.hasOwnProperty.call(
                STATUS_TRANSISI,
                current.status
            )
        ) {
            throw new Error(
                `Status peminjaman saat ini tidak valid: ${current.status}.`
            );
        }

        if (
            !STATUS_TRANSISI[current.status].includes(status)
        ) {
            throw new Error(
                `Status tidak dapat diubah dari "${current.status}" menjadi "${status}".`
            );
        }

        // -------------------------------------------------
        // Validasi eksemplar sebelum disetujui
        // -------------------------------------------------
        if (status === "disetujui") {
            const detailResult = await client.query(
                `
                SELECT
                    dp.id_eksemplar,
                    eb.status
                FROM detail_peminjaman dp
                JOIN eksemplar_buku eb
                    ON eb.id_eksemplar = dp.id_eksemplar
                WHERE dp.id_peminjaman = $1
                FOR UPDATE OF eb
                `,
                [idPeminjaman]
            );

            if (detailResult.rows.length === 0) {
                throw new Error(
                    "Peminjaman tidak memiliki detail buku."
                );
            }

            const semuaDipesan =
                detailResult.rows.every(
                    (item) => item.status === "dipesan"
                );

            if (!semuaDipesan) {
                throw new Error(
                    "Eksemplar buku tidak lagi berstatus dipesan."
                );
            }

            // Reservasi berubah menjadi dipinjam
            // Stok TIDAK dikurangi lagi karena sudah
            // dikurangi saat status dipesan.
            await client.query(
                `
                UPDATE eksemplar_buku eb
                SET status = 'dipinjam'
                FROM detail_peminjaman dp
                WHERE dp.id_peminjaman = $1
                  AND dp.id_eksemplar = eb.id_eksemplar
                  AND eb.status = 'dipesan'
                `,
                [idPeminjaman]
            );
        }

        // -------------------------------------------------
        // Validasi sebelum siap diambil
        // -------------------------------------------------
        if (status === "siap_diambil") {
            const detailResult = await client.query(
                `
                SELECT
                    eb.id_eksemplar,
                    eb.status
                FROM detail_peminjaman dp
                JOIN eksemplar_buku eb
                    ON eb.id_eksemplar = dp.id_eksemplar
                WHERE dp.id_peminjaman = $1
                FOR UPDATE OF eb
                `,
                [idPeminjaman]
            );

            if (detailResult.rows.length === 0) {
                throw new Error(
                    "Peminjaman tidak memiliki detail buku."
                );
            }

            const semuaDipinjam =
                detailResult.rows.every(
                    (item) => item.status === "dipinjam"
                );

            if (!semuaDipinjam) {
                throw new Error(
                    "Eksemplar buku belum berada pada status dipinjam."
                );
            }
        }

        // -------------------------------------------------
        // Saat buku benar-benar diambil
        // -------------------------------------------------
        let tambahanQuery = "";
        const tambahanParams = [];

        if (status === "dipinjam") {
            tambahanQuery += `,
                waktu_pengambilan = CURRENT_TIMESTAMP,
                tanggal_jatuh_tempo = CURRENT_DATE + $4::integer
            `;

            tambahanParams.push(BATAS_HARI_PINJAM);

            const detailResult = await client.query(
                `
                SELECT
                    eb.status
                FROM detail_peminjaman dp
                JOIN eksemplar_buku eb
                    ON eb.id_eksemplar = dp.id_eksemplar
                WHERE dp.id_peminjaman = $1
                FOR UPDATE OF eb
                `,
                [idPeminjaman]
            );

            if (detailResult.rows.length === 0) {
                throw new Error(
                    "Peminjaman tidak memiliki detail buku."
                );
            }

            const semuaDipinjam =
                detailResult.rows.every(
                    (item) => item.status === "dipinjam"
                );

            if (!semuaDipinjam) {
                throw new Error(
                    "Eksemplar buku belum siap untuk dipinjam."
                );
            }
        }

        // -------------------------------------------------
        // Status ditolak / dibatalkan / kedaluwarsa
        // -------------------------------------------------
        if (
            ["ditolak", "dibatalkan", "kedaluwarsa"].includes(
                status
            )
        ) {
            await releaseExemplars(
                client,
                idPeminjaman
            );
        }

        // -------------------------------------------------
        // Update data utama
        // -------------------------------------------------
        const updateParams = [
            status,
            catatan !== undefined
                ? catatan
                : current.catatan,
            batasPengambilan !== undefined
                ? batasPengambilan
                : current.batas_pengambilan,
            ...tambahanParams,
            idPeminjaman,
        ];

        const result = await client.query(
            `
            UPDATE peminjaman
            SET
                status = $1,
                catatan = $2,
                batas_pengambilan = $3
                ${tambahanQuery}
            WHERE id_peminjaman = $${updateParams.length}
            RETURNING id_peminjaman
            `,
            updateParams
        );

        await client.query("COMMIT");

        return await getPeminjamanById(
            result.rows[0].id_peminjaman
        );
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
    createPeminjaman,
    updatePeminjaman,
};