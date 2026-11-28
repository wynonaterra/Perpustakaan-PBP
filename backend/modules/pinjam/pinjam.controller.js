const pinjamModel = require("./pinjam.model");

// =========================================================
// AMBIL ID USER DARI TOKEN
// =========================================================
const getUserId = (req) => {
    return req.user?.id_pengguna || req.user?.id;
};

// =========================================================
// GET SEMUA PEMINJAMAN
// =========================================================
const getAll = async (req, res, next) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Data pengguna pada token tidak ditemukan.",
            });
        }

        let data;

        if (req.user.peran === "admin") {
            data = await pinjamModel.getAllPeminjaman();
        } else {
            data = await pinjamModel.getPeminjamanByUser(
                userId
            );
        }

        res.status(200).json({
            message: "Data peminjaman berhasil diambil.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// GET PEMINJAMAN BERDASARKAN ID
// =========================================================
const getById = async (req, res, next) => {
    try {
        const idPeminjaman = Number(req.params.id);

        if (!Number.isInteger(idPeminjaman)) {
            return res.status(400).json({
                message: "ID peminjaman tidak valid.",
            });
        }

        const data =
            await pinjamModel.getPeminjamanById(
                idPeminjaman
            );

        if (!data) {
            return res.status(404).json({
                message: "Data peminjaman tidak ditemukan.",
            });
        }

        // Admin boleh melihat semua
        if (req.user.peran === "admin") {
            return res.status(200).json({
                message:
                    "Data peminjaman berhasil diambil.",
                data,
            });
        }

        // Anggota hanya boleh melihat miliknya sendiri
        if (
            Number(data.id_pengguna) !==
            Number(getUserId(req))
        ) {
            return res.status(403).json({
                message:
                    "Anda tidak memiliki akses ke peminjaman ini.",
            });
        }

        res.status(200).json({
            message: "Data peminjaman berhasil diambil.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// CREATE PEMINJAMAN
// =========================================================
const create = async (req, res, next) => {
    try {
        if (req.user.peran !== "anggota") {
            return res.status(403).json({
                message:
                    "Hanya anggota yang dapat membuat peminjaman.",
            });
        }

        const {
            daftar_buku,
            catatan,
        } = req.body;

        if (
            !Array.isArray(daftar_buku) ||
            daftar_buku.length === 0
        ) {
            return res.status(400).json({
                message:
                    "daftar_buku wajib diisi dan minimal berisi satu buku.",
            });
        }

        const data =
            await pinjamModel.createPeminjaman({
                idPengguna: getUserId(req),
                daftarBuku: daftar_buku,
                catatan,
            });

        res.status(201).json({
            message:
                "Peminjaman berhasil dibuat dan menunggu persetujuan admin.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================
// UPDATE STATUS PEMINJAMAN
// =========================================================
const update = async (req, res, next) => {
    try {
        const idPeminjaman = Number(req.params.id);

        if (!Number.isInteger(idPeminjaman)) {
            return res.status(400).json({
                message: "ID peminjaman tidak valid.",
            });
        }

        const {
            status,
            catatan,
            batas_pengambilan,
        } = req.body;

        if (!status) {
            return res.status(400).json({
                message:
                    "Status peminjaman wajib diisi.",
            });
        }

        // -------------------------------------------------
        // ANGGOTA
        // -------------------------------------------------
        if (req.user.peran === "anggota") {
            if (status !== "dibatalkan") {
                return res.status(403).json({
                    message:
                        "Anggota hanya dapat membatalkan peminjaman.",
                });
            }

            const peminjaman =
                await pinjamModel.getPeminjamanById(
                    idPeminjaman
                );

            if (!peminjaman) {
                return res.status(404).json({
                    message:
                        "Data peminjaman tidak ditemukan.",
                });
            }

            if (
                Number(peminjaman.id_pengguna) !==
                Number(getUserId(req))
            ) {
                return res.status(403).json({
                    message:
                        "Anda tidak memiliki akses ke peminjaman ini.",
                });
            }

            if (
                ![
                    "menunggu",
                    "disetujui",
                    "siap_diambil",
                ].includes(peminjaman.status)
            ) {
                return res.status(400).json({
                    message:
                        `Peminjaman dengan status "${peminjaman.status}" tidak dapat dibatalkan.`,
                });
            }
        }

        // -------------------------------------------------
        // ROLE TIDAK DIKENAL
        // -------------------------------------------------
        if (
            req.user.peran !== "admin" &&
            req.user.peran !== "anggota"
        ) {
            return res.status(403).json({
                message: "Role pengguna tidak valid.",
            });
        }

        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------
        if (req.user.peran === "admin") {
            const allowedStatuses = [
                "disetujui",
                "ditolak",
                "siap_diambil",
                "dipinjam",
                "kedaluwarsa",
                "selesai",
                "dibatalkan",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message:
                        "Status yang dikirim tidak valid.",
                });
            }
        }

        const data =
            await pinjamModel.updatePeminjaman(
                idPeminjaman,
                {
                    status,
                    catatan,
                    batasPengambilan:
                        batas_pengambilan,
                }
            );

        res.status(200).json({
            message:
                "Status peminjaman berhasil diperbarui.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
};