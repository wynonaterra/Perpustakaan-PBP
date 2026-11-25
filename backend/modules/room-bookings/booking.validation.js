
const validateBooking = (req, res, next) => {
  const {
    id_ruang,
    tanggal_peminjaman,
    jam_mulai,
    jam_selesai,
    jumlah_orang,
    catatan
  } = req.body;

  // Validasi ID ruangan
  if (
    !Number.isInteger(Number(id_ruang)) ||
    Number(id_ruang) <= 0
  ) {
    return res.status(400).json({
      message: 'ID ruangan harus berupa angka positif.'
    });
  }

  // Validasi tanggal
  if (
    !tanggal_peminjaman ||
    !/^\d{4}-\d{2}-\d{2}$/.test(tanggal_peminjaman)
  ) {
    return res.status(400).json({
      message: 'Tanggal peminjaman harus menggunakan format YYYY-MM-DD.'
    });
  }

  const date = new Date(`${tanggal_peminjaman}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== tanggal_peminjaman
  ) {
    return res.status(400).json({
      message: 'Tanggal peminjaman tidak valid.'
    });
  }

  // Validasi format jam
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

  if (!timeRegex.test(jam_mulai) || !timeRegex.test(jam_selesai)) {
    return res.status(400).json({
      message: 'Jam harus menggunakan format HH:MM atau HH:MM:SS.'
    });
  }

  // Validasi jam selesai harus lebih besar
  if (jam_selesai <= jam_mulai) {
    return res.status(400).json({
      message: 'Jam selesai harus lebih besar dari jam mulai.'
    });
  }

  // Validasi jumlah orang
  if (
    !Number.isInteger(Number(jumlah_orang)) ||
    Number(jumlah_orang) <= 0
  ) {
    return res.status(400).json({
      message: 'Jumlah orang harus berupa bilangan bulat lebih dari 0.'
    });
  }

  // Validasi catatan
  if (
    catatan !== undefined &&
    catatan !== null &&
    typeof catatan !== 'string'
  ) {
    return res.status(400).json({
      message: 'Catatan harus berupa teks.'
    });
  }

  next();
};

// Validasi status untuk persetujuan admin
const validateBookingStatus = (req, res, next) => {
  const { status } = req.body;

  if (!['disetujui', 'ditolak'].includes(status)) {
    return res.status(400).json({
      message: 'Status hanya boleh disetujui atau ditolak.'
    });
  }

  next();
};

module.exports = {
  validateBooking,
  validateBookingStatus
};
