const pinjamModel = require("./pinjam.model");

// =========================================================
// HELPER ID USER
// =========================================================
const getUserId = (req) => {
    return req.user?.id_pengguna || req.user?.id;
};

// =========================================================
// GET SEMUA PEMINJAMAN
// =========================================================
const getAll = async (req, res) => {
    try {
        const userId = getUserId(req);
        const role = req.user?.peran || req.user?.role;

        let data;

        if (role === "admin") {
            data = await pinjamModel.getAllPeminjaman();
        } else {
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User tidak terautentikasi."
                });
            }

            data = await pinjamModel.getPeminjamanByUser(userId);
        }

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data peminjaman."
        });
    }
};

// =========================================================
// GET DETAIL PEMINJAMAN
// =========================================================
const getById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "ID peminjaman tidak valid."
            });
        }

        const data = await pinjamModel.getPeminjamanById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan."
            });
        }

        const role = req.user?.peran || req.user?.role;

        // Pengguna dengan role anggota hanya boleh
        // melihat peminjaman miliknya sendiri
        if (role !== "admin") {
            const userId = getUserId(req);

            if (
                !userId ||
                Number(userId) !== Number(data.id_pengguna)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Anda tidak memiliki akses ke peminjaman ini."
                });
            }
        }

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil detail peminjaman."
        });
    }
};

// =========================================================
// CREATE PEMINJAMAN
// =========================================================
const create = async (req, res, next) => {
    try {
        const {
            jenis_peminjaman,
            catatan,
            daftar_buku
        } = req.body;

        // Ambil ID pengguna langsung dari JWT
        const userId = getUserId(req);
        const { peran } = req.user;

        // Hanya pengguna dengan role anggota
        // yang boleh membuat peminjaman
        if (peran !== "anggota") {
            return res.status(403).json({
                success: false,
                message: "Hanya anggota yang dapat membuat peminjaman."
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID pengguna tidak ditemukan."
            });
        }

        // Validasi jenis peminjaman
        if (
            jenis_peminjaman &&
            !["online", "offline"].includes(jenis_peminjaman)
        ) {
            return res.status(400).json({
                success: false,
                message: "Jenis peminjaman harus online atau offline."
            });
        }

        // Validasi daftar buku
        if (!Array.isArray(daftar_buku) || daftar_buku.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Minimal satu buku harus dipilih."
            });
        }

        // Buat peminjaman
        const data = await pinjamModel.createPeminjaman({
            idPengguna: userId,
            jenisPeminjaman: jenis_peminjaman || "online",
            catatan,
            daftarBuku: daftar_buku
        });

        res.status(201).json({
            success: true,
            message: "Peminjaman berhasil dibuat.",
            data
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// =========================================================
// UPDATE PEMINJAMAN
// =========================================================
const update = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "ID peminjaman tidak valid."
            });
        }

        const dataLama = await pinjamModel.getPeminjamanById(id);

        if (!dataLama) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan."
            });
        }

        const role = req.user?.peran || req.user?.role;
        const userId = getUserId(req);

        // =====================================================
        // CEK KEPEMILIKAN UNTUK ANGGOTA
        // =====================================================
        if (role === "anggota") {

            if (
                !userId ||
                Number(userId) !== Number(dataLama.id_pengguna)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Anda tidak memiliki akses ke peminjaman ini."
                });
            }

            // Anggota hanya boleh membatalkan peminjaman
            const { status } = req.body;

            if (status !== "dibatalkan") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Anggota hanya dapat membatalkan peminjaman."
                });
            }

            // Peminjaman yang sudah selesai tidak dapat dibatalkan
            if (dataLama.status === "selesai") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Peminjaman yang sudah selesai tidak dapat dibatalkan."
                });
            }

            // Peminjaman yang sudah dibatalkan tidak perlu dibatalkan lagi
            if (dataLama.status === "dibatalkan") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Peminjaman sudah berstatus dibatalkan."
                });
            }

            const data = await pinjamModel.updatePeminjaman(
                id,
                {
                    status: "dibatalkan",
                    catatan: req.body.catatan,
                    batasPengambilan: undefined
                }
            );

            return res.status(200).json({
                success: true,
                message: "Peminjaman berhasil dibatalkan.",
                data
            });
        }

        // =====================================================
        // ADMIN
        // =====================================================
        if (role === "admin") {
            const {
                status,
                catatan,
                batas_pengambilan
            } = req.body;

            const statusValid = [
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
                !status &&
                catatan === undefined &&
                batas_pengambilan === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Tidak ada data yang diperbarui."
                });
            }

            if (status && !statusValid.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Status peminjaman tidak valid."
                });
            }

            // Peminjaman yang sudah selesai tidak boleh diubah lagi
            if (dataLama.status === "selesai") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Peminjaman yang sudah selesai tidak dapat diperbarui."
                });
            }

            const data = await pinjamModel.updatePeminjaman(
                id,
                {
                    status,
                    catatan,
                    batasPengambilan: batas_pengambilan
                }
            );

            return res.status(200).json({
                success: true,
                message: "Peminjaman berhasil diperbarui.",
                data
            });
        }

        // =====================================================
        // ROLE TIDAK DIKENAL
        // =====================================================
        return res.status(403).json({
            success: false,
            message: "Anda tidak memiliki hak akses."
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update
};