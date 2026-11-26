const bukuModel = require('./buku.model');

const getAllBuku = async (req, res, next) => {
  try {
    const { search, id_kategori } = req.query;
    const data = await bukuModel.getAllBuku({ search, id_kategori });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getBukuById = async (req, res, next) => {
  try {
    const data = await bukuModel.getBukuById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const createBuku = async (req, res, next) => {
  try {
    const { isbn, judul, penulis, stok_total } = req.body;
    if (!isbn || !judul || !penulis) {
      return res.status(400).json({ message: 'ISBN, judul, dan penulis wajib diisi untuk membuat eksemplar buku.' });
    }
    if (stok_total === undefined || Number(stok_total) < 1) {
      return res.status(400).json({ message: 'Stok total minimal 1 eksemplar.' });
    }

    const data = await bukuModel.createBuku(req.body);
    res.status(201).json({
      message: `Buku berhasil ditambahkan beserta ${data.eksemplar.length} eksemplar.`,
      data,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'ISBN atau ID Eksemplar sudah terdaftar.' });
    }
    next(err);
  }
};

const updateBuku = async (req, res, next) => {
  try {
    const data = await bukuModel.updateBuku(req.params.id, req.body);
    if (!data) return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    res.json({ message: 'Data buku dan eksemplar berhasil diperbarui.', data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteBuku = async (req, res, next) => {
  try {
    const deleted = await bukuModel.deleteBuku(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    res.json({ message: 'Buku beserta seluruh eksemplarnya berhasil dihapus.' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ message: 'Buku tidak dapat dihapus karena salah satu eksemplarnya masih tercatat pada peminjaman.' });
    }
    next(err);
  }
};

const getAllKategori = async (req, res, next) => {
  try {
    const data = await bukuModel.getAllKategori();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const createKategori = async (req, res, next) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    if (!nama_kategori) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    const data = await bukuModel.createKategori({ nama_kategori, deskripsi });
    res.status(201).json({ message: 'Kategori berhasil ditambahkan.', data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
  getAllKategori,
  createKategori,
};