const bukuModel = require('./buku.model');

const getAllBuku = async (req, res, next) => {
  try {
    const { search, kategori } = req.query;
    const data = await bukuModel.getAllBuku({ search, id_kategori: kategori });
    res.json({ message: 'Berhasil mengambil data buku.', data });
  } catch (err) {
    next(err);
  }
};

const getBukuById = async (req, res, next) => {
  try {
    const data = await bukuModel.getBukuById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const createBuku = async (req, res, next) => {
  try {
    const { judul, penulis, stok_total } = req.body;
    if (!judul || !penulis) {
      return res.status(400).json({ message: 'Judul dan penulis buku wajib diisi.' });
    }
    if (stok_total !== undefined && Number(stok_total) < 0) {
      return res.status(400).json({ message: 'Stok total tidak boleh bernilai negatif.' });
    }

    const data = await bukuModel.createBuku(req.body);
    res.status(201).json({ message: 'Buku berhasil ditambahkan.', data });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'ISBN sudah terdaftar pada buku lain.' });
    }
    next(err);
  }
};

const updateBuku = async (req, res, next) => {
  try {
    const updated = await bukuModel.updateBuku(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    }
    res.json({ message: 'Data buku berhasil diperbarui.', data: updated });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'ISBN sudah digunakan oleh buku lain.' });
    }
    next(err);
  }
};

const deleteBuku = async (req, res, next) => {
  try {
    const deleted = await bukuModel.deleteBuku(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Buku tidak ditemukan.' });
    }
    res.json({ message: 'Buku berhasil dihapus.' });
  } catch (err) {
    // Error foreign key PostgreSQL (23503) jika buku sudah pernah dipinjam
    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Buku tidak dapat dihapus karena sudah tercatat dalam riwayat peminjaman.',
      });
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
    if (!nama_kategori) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    }
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