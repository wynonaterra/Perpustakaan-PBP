
const express = require('express');
const router = express.Router();

const bookingController = require('./booking.controller');

const {
  validateBooking,
  validateBookingStatus
} = require('./booking.validation');

const authorizeRoles = require('../../middleware/roleMiddleware');

// Admin dan anggota dapat melihat daftar peminjaman
router.get(
  '/',
  authorizeRoles('admin', 'anggota'),
  bookingController.getAllBookings
);

// Admin dan anggota dapat melihat detail peminjaman
router.get(
  '/:id',
  authorizeRoles('admin', 'anggota'),
  bookingController.getBookingById
);

// Hanya anggota yang dapat mengajukan peminjaman
router.post(
  '/',
  authorizeRoles('anggota'),
  validateBooking,
  bookingController.createBooking
);

// Hanya admin yang dapat menyetujui atau menolak
router.patch(
  '/:id/status',
  authorizeRoles('admin'),
  validateBookingStatus,
  bookingController.updateBookingStatus
);

// Hanya anggota yang dapat membatalkan pengajuannya sendiri
router.patch(
  '/:id/cancel',
  authorizeRoles('anggota'),
  bookingController.cancelBooking
);

module.exports = router;
