
const bookingModel = require('./booking.model');

// Menampilkan daftar peminjaman
const getAllBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.peran === 'admin') {
      // Admin dapat melihat seluruh peminjaman
      bookings = await bookingModel.getAllBookings();
    } else {
      // Anggota hanya dapat melihat peminjamannya sendiri
      if (!req.user.id_anggota) {
        return res.status(403).json({
          message: 'Akun ini tidak terhubung dengan data anggota.'
        });
      }

      bookings = await bookingModel.getBookingsByMember(
        req.user.id_anggota
      );
    }

    return res.status(200).json({
      message: 'Data peminjaman berhasil diambil.',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Menampilkan detail peminjaman
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: 'ID peminjaman tidak valid.'
      });
    }

    const booking = await bookingModel.getBookingById(id);

    if (!booking) {
      return res.status(404).json({
        message: 'Data peminjaman tidak ditemukan.'
      });
    }

    // Anggota hanya boleh melihat peminjamannya sendiri
    if (
      req.user.peran === 'anggota' &&
      Number(booking.id_anggota) !== Number(req.user.id_anggota)
    ) {
      return res.status(403).json({
        message: 'Kamu tidak memiliki akses ke peminjaman ini.'
      });
    }

    return res.status(200).json({
      message: 'Detail peminjaman berhasil diambil.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Mengajukan peminjaman ruangan
const createBooking = async (req, res, next) => {
  try {
    if (req.user.peran !== 'anggota') {
      return res.status(403).json({
        message: 'Hanya anggota yang dapat mengajukan peminjaman.'
      });
    }

    if (!req.user.id_anggota) {
      return res.status(403).json({
        message: 'Akun ini tidak terhubung dengan data anggota.'
      });
    }

    const booking = await bookingModel.createBooking({
      ...req.body,
      id_anggota: req.user.id_anggota
    });

    return res.status(201).json({
      message: 'Pengajuan peminjaman berhasil dibuat.',
      data: booking
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    next(error);
  }
};

// Admin menyetujui atau menolak peminjaman
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: 'ID peminjaman tidak valid.'
      });
    }

    const existingBooking = await bookingModel.getBookingById(id);

    if (!existingBooking) {
      return res.status(404).json({
        message: 'Data peminjaman tidak ditemukan.'
      });
    }

    if (existingBooking.status !== 'menunggu') {
      return res.status(409).json({
        message: 'Peminjaman ini sudah diproses sebelumnya.'
      });
    }

    const booking = await bookingModel.updateBookingStatus(id, status);

    if (!booking) {
      return res.status(409).json({
        message: 'Status peminjaman gagal diperbarui.'
      });
    }

    return res.status(200).json({
      message: `Peminjaman berhasil ${status}.`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Anggota membatalkan pengajuan
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: 'ID peminjaman tidak valid.'
      });
    }

    if (!req.user.id_anggota) {
      return res.status(403).json({
        message: 'Akun ini tidak terhubung dengan data anggota.'
      });
    }

    const booking = await bookingModel.cancelBooking(
      id,
      req.user.id_anggota
    );

    if (!booking) {
      return res.status(404).json({
        message: 'Peminjaman tidak ditemukan atau tidak dapat dibatalkan.'
      });
    }

    return res.status(200).json({
      message: 'Pengajuan peminjaman berhasil dibatalkan.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking
};
