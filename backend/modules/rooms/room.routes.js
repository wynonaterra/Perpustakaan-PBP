const express = require('express');
const router = express.Router();

const roomController = require('./room.controller');
const validateRoom = require('./room.validation');
const authorizeRoles = require('../../middleware/roleMiddleware');

// Admin dan anggota dapat melihat daftar ruangan
router.get(
  '/',
  authorizeRoles('admin', 'anggota'),
  roomController.getAllRooms
);

// Admin dan anggota dapat melihat detail ruangan
router.get(
  '/:id',
  authorizeRoles('admin', 'anggota'),
  roomController.getRoomById
);

// Hanya admin yang dapat menambahkan ruangan
router.post(
  '/',
  authorizeRoles('admin'),
  validateRoom,
  roomController.createRoom
);

// Hanya admin yang dapat mengubah ruangan
router.put(
  '/:id',
  authorizeRoles('admin'),
  validateRoom,
  roomController.updateRoom
);

// Hanya admin yang dapat menonaktifkan ruangan
router.patch(
  '/:id/deactivate',
  authorizeRoles('admin'),
  roomController.deactivateRoom
);

module.exports = router;