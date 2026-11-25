const kembaliModel = require('./kembali.model');

const getPengembalian = async (req, res, next) => {
    try {
        // Jika role anggota, filter hanya pengembalian miliknya sendiri
        const idAnggota = req.user.peran === 'anggota' ? req.user.id_anggota : null;
        const data = await kembaliModel.getAllPengembalian(idAnggota);
        res.json({ data });
    } catch (err) {
        next(err);
    }
};

const getPendingReturns = async (req, res, next) => {
    try {
        const data = await kembaliModel.getActiveBorrowedDetails();
        res.json({ data });
    } catch (err) {
        next(err);
    }
};

const storePengembalian = async (req, res, next) => {
    try {
        const { id_detail_peminjaman, kondisi_buku, catatan } = req.body;

        if (!id_detail_peminjaman || !kondisi_buku) {
            return res.status(400).json({ message: 'Item peminjaman dan kondisi buku wajib diisi.' });
        }

        const allowedKondisi = ['baik', 'rusak', 'hilang'];
        if (!allowedKondisi.includes(kondisi_buku)) {
            return res.status(400).json({ message: 'Kondisi buku harus baik, rusak, atau hilang.' });
        }

        const result = await kembaliModel.createPengembalian({
            id_detail_peminjaman,
            kondisi_buku,
            catatan,
        });

        res.status(201).json({
            message: result.denda
                ? `Pengembalian berhasil dicatat. Terdeteksi denda sebesar Rp ${Number(result.denda.jumlah_denda).toLocaleString('id-ID')}.`
                : 'Pengembalian berhasil dicatat tanpa denda.',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getPengembalian, getPendingReturns, storePengembalian };