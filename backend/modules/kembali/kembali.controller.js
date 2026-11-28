const kembaliModel = require('./kembali.model');


// =========================================================
// GET RIWAYAT PENGEMBALIAN
// =========================================================
const getPengembalian = async (req, res, next) => {
    try {

        const role = req.user?.peran;

        // Admin melihat semua.
        // Anggota hanya melihat miliknya sendiri.
        const idPengguna =
            role === 'anggota'
                ? req.user.id_pengguna
                : null;

        const data =
            await kembaliModel.getAllPengembalian(
                idPengguna
            );

        res.status(200).json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};


// =========================================================
// GET PEMINJAMAN YANG BELUM DIKEMBALIKAN
// KHUSUS ADMIN
// =========================================================
const getPendingReturns = async (req, res, next) => {
    try {

        const data =
            await kembaliModel.getActiveBorrowedDetails();

        res.status(200).json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};


// =========================================================
// PROSES PENGEMBALIAN
// KHUSUS ADMIN
// =========================================================
const storePengembalian = async (req, res, next) => {
    try {

        const {
            id_detail_peminjaman,
            kondisi_buku,
            catatan
        } = req.body;


        // -----------------------------------------------------
        // VALIDASI ID DETAIL
        // -----------------------------------------------------
        if (
            !id_detail_peminjaman ||
            !Number.isInteger(
                Number(id_detail_peminjaman)
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'ID detail peminjaman wajib diisi dan harus valid.'
            });
        }


        // -----------------------------------------------------
        // VALIDASI KONDISI
        // -----------------------------------------------------
        const allowedKondisi = [
            'baik',
            'rusak',
            'hilang'
        ];

        if (
            !allowedKondisi.includes(kondisi_buku)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Kondisi buku harus baik, rusak, atau hilang.'
            });
        }


        // -----------------------------------------------------
        // PROSES
        // -----------------------------------------------------
        const result =
            await kembaliModel.createPengembalian({
                id_detail_peminjaman:
                    Number(id_detail_peminjaman),

                kondisi_buku,

                catatan
            });


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------
        let message =
            'Pengembalian berhasil dicatat tanpa denda.';

        if (result.denda) {

            message =
                `Pengembalian berhasil dicatat. ` +
                `Terdeteksi denda sebesar Rp ` +
                `${Number(
                    result.denda.jumlah_denda
                ).toLocaleString('id-ID')}.`;
        }


        res.status(201).json({
            success: true,
            message,
            data: result
        });

    } catch (err) {
        next(err);
    }
};


module.exports = {
    getPengembalian,
    getPendingReturns,
    storePengembalian
};