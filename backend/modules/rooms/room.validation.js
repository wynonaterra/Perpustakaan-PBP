// Validasi data ruangan
const validateRoom = (req, res, next) => {
  const { nama_ruang, lokasi, kapasitas, fasilitas } = req.body;

  // Validasi nama ruangan
  if (
    !nama_ruang ||
    typeof nama_ruang !== 'string' ||
    !nama_ruang.trim()
  ) {
    return res.status(400).json({
      message: 'Nama ruangan wajib diisi.'
    });
  }

  // Validasi kapasitas
  if (
    kapasitas === undefined ||
    kapasitas === null ||
    kapasitas === '' ||
    !Number.isInteger(Number(kapasitas)) ||
    Number(kapasitas) <= 0
  ) {
    return res.status(400).json({
      message: 'Kapasitas harus berupa bilangan bulat lebih dari 0.'
    });
  }

  // Validasi lokasi
  if (lokasi !== undefined && lokasi !== null && typeof lokasi !== 'string') {
    return res.status(400).json({
      message: 'Lokasi harus berupa teks.'
    });
  }

  // Validasi fasilitas
  if (
    fasilitas !== undefined &&
    fasilitas !== null &&
    typeof fasilitas !== 'string'
  ) {
    return res.status(400).json({
      message: 'Fasilitas harus berupa teks.'
    });
  }

  // Validasi status jika dikirim
  if (
    req.method === 'PUT' &&
    !['aktif', 'nonaktif'].includes(req.body.status)
  ) {
    return res.status(400).json({
      message: 'Status harus aktif atau nonaktif.'
    });
  }

  next();
};

module.exports = validateRoom;