const dendaModel = require('./denda.model');

const getDenda = async (req, res, next) => {
    try {
        const idAnggota = req.user.peran === 'anggota' ? req.user.id_anggota : null;
        const data = await dendaModel.getAllDenda(idAnggota);
        res.json({ data });
    } catch (err) {
        next(err);
    }
};

const getDetailDenda = async (req, res, next) => {
    try {
        const data = await dendaModel.getDendaById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'Data denda tidak ditemukan.' });
        }
        res.json({ data });
    } catch (err) {
        next(err);
    }
};

const updateDenda = async (req, res, next) => {
    try {
        const { status_pembayaran } = req.body;
        const allowedStatus = ['belum_bayar', 'menunggu_verifikasi', 'lunas'];

        if (!status_pembayaran || !allowedStatus.includes(status_pembayaran)) {
            return res.status(400).json({
                message: 'Status pembayaran tidak valid (belum_bayar | menunggu_verifikasi | lunas).',
            });
        }

        const updated = await dendaModel.updateStatusDenda(req.params.id, status_pembayaran);
        if (!updated) {
            return res.status(404).json({ message: 'Data denda tidak ditemukan.' });
        }

        res.json({
            message: `Status denda berhasil diubah menjadi ${status_pembayaran}.`,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getDenda, getDetailDenda, updateDenda };