const dendaModel = require('./denda.model');


// =========================================================
// GET SEMUA DENDA
// =========================================================
const getDenda = async (req, res, next) => {
    try {
        /*
         * Admin:
         *   idPengguna = null
         *   → melihat semua denda
         *
         * Anggota:
         *   idPengguna = req.user.id_pengguna
         *   → hanya melihat dendanya sendiri
         */

        const idPengguna =
            req.user.peran === 'anggota'
                ? req.user.id_pengguna
                : null;

        const data = await dendaModel.getAllDenda(idPengguna);

        res.json({
            success: true,
            message: 'Data denda berhasil diambil.',
            data,
        });

    } catch (err) {
        next(err);
    }
};


// =========================================================
// GET DETAIL DENDA
// =========================================================
const getDetailDenda = async (req, res, next) => {
    try {
        const data = await dendaModel.getDendaById(
            req.params.id
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Data denda tidak ditemukan.',
            });
        }

        /*
         * Anggota hanya boleh melihat denda miliknya sendiri.
         */
        if (
            req.user.peran === 'anggota' &&
            data.id_pengguna !== req.user.id_pengguna
        ) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki akses ke data denda ini.',
            });
        }

        res.json({
            success: true,
            message: 'Detail denda berhasil diambil.',
            data,
        });

    } catch (err) {
        next(err);
    }
};


// =========================================================
// UPDATE STATUS PEMBAYARAN DENDA
// KHUSUS ADMIN
// =========================================================
const updateDenda = async (req, res, next) => {
    try {
        const { status_pembayaran } = req.body;

        const allowedStatus = [
            'belum_bayar',
            'menunggu_verifikasi',
            'lunas',
        ];

        if (
            !status_pembayaran ||
            !allowedStatus.includes(status_pembayaran)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Status pembayaran tidak valid (belum_bayar | menunggu_verifikasi | lunas).',
            });
        }

        const updated =
            await dendaModel.updateStatusDenda(
                req.params.id,
                status_pembayaran
            );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Data denda tidak ditemukan.',
            });
        }

        res.json({
            success: true,
            message:
                `Status denda berhasil diubah menjadi ${status_pembayaran}.`,
            data: updated,
        });

    } catch (err) {
        next(err);
    }
};


module.exports = {
    getDenda,
    getDetailDenda,
    updateDenda,
};