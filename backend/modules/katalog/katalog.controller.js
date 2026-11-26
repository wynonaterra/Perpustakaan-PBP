const bukuModel = require('../buku/buku.model');

const getKategoriList = async (req, res, next) => {
  try {
    const data = await bukuModel.getAllKategori();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getKatalogBuku = async (req, res, next) => {
  try {
    const { search, id_kategori } = req.query;
    const data = await bukuModel.getAllBuku({ search, id_kategori });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getDetailBuku = async (req, res, next) => {
  try {
    const data = await bukuModel.getBukuById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getKategoriList, getKatalogBuku, getDetailBuku };