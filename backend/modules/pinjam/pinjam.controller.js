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

        if (role !== "admin") {

            const userId = getUserId(req);

            const anggota = await pinjamModel.getAnggotaByUserId(userId);

            if (
                !anggota ||
                Number(anggota.id_anggota) !== Number(data.id_anggota)
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
const create = async (req, res) => {

    try {

        const role = req.user?.peran || req.user?.role;
        const userId = getUserId(req);


        let idAnggota = Number(req.body.id_anggota);


        // -------------------------------------------------
        // Kalau anggota biasa, pakai akun sendiri
        // -------------------------------------------------
        if (role === "anggota") {

            const anggota = await pinjamModel.getAnggotaByUserId(userId);


            if (!anggota) {
                return res.status(404).json({
                    success: false,
                    message: "Data anggota tidak ditemukan."
                });
            }


            if (anggota.status !== "aktif") {
                return res.status(403).json({
                    success: false,
                    message: "Akun anggota tidak aktif."
                });
            }


            idAnggota = Number(anggota.id_anggota);
        }


        if (!Number.isInteger(idAnggota)) {

            return res.status(400).json({
                success: false,
                message: "id_anggota wajib diisi."
            });
        }


        const {
            jenis_peminjaman,
            catatan,
            daftar_buku
        } = req.body;


        const data = await pinjamModel.createPeminjaman({
            idAnggota,
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


        if (role !== "admin") {

            const userId = getUserId(req);

            const anggota = await pinjamModel.getAnggotaByUserId(userId);


            if (
                !anggota ||
                Number(anggota.id_anggota) !== Number(dataLama.id_anggota)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Anda tidak memiliki akses ke peminjaman ini."
                });
            }
        }


        const {
            status,
            catatan,
            batas_pengambilan
        } = req.body;


        const data = await pinjamModel.updatePeminjaman(
            id,
            {
                status,
                catatan,
                batasPengambilan: batas_pengambilan
            }
        );


        res.status(200).json({
            success: true,
            message: "Peminjaman berhasil diperbarui.",
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
// DELETE PEMINJAMAN
// =========================================================
const remove = async (req, res) => {

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


        if (role !== "admin") {

            const userId = getUserId(req);

            const anggota = await pinjamModel.getAnggotaByUserId(userId);


            if (
                !anggota ||
                Number(anggota.id_anggota) !== Number(dataLama.id_anggota)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Anda tidak memiliki akses ke peminjaman ini."
                });
            }
        }


        await pinjamModel.deletePeminjaman(id);


        res.status(200).json({
            success: true,
            message: "Peminjaman berhasil dihapus."
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};