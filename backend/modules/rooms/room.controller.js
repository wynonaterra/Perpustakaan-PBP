const roomModel = require('./room.model');

// Menampilkan semua ruangan
const getAllRooms = async (req, res, next) => {
  try {
    const activeOnly = req.user.peran === 'anggota';

    const rooms = await roomModel.getAllRooms(activeOnly);

    return res.status(200).json({
      message: 'Data ruangan berhasil diambil.',
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// Menampilkan detail ruangan
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: 'ID ruangan tidak valid.'
      });
    }

    const activeOnly = req.user.peran === 'anggota';

    const room = await roomModel.getRoomById(id, activeOnly);

    if (!room) {
      return res.status(404).json({
        message: 'Ruangan tidak ditemukan.'
      });
    }

    return res.status(200).json({
      message: 'Detail ruangan berhasil diambil.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// Menambahkan ruangan
const createRoom = async (req, res, next) => {
  try {
    const room = await roomModel.createRoom(req.body);

    return res.status(201).json({
      message: 'Ruangan berhasil ditambahkan.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// Mengubah ruangan
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: 'ID ruangan tidak valid.'
      });
    }

    const existingRoom = await roomModel.getRoomById(id);

    if (!existingRoom) {
      return res.status(404).json({
        message: 'Ruangan tidak ditemukan.'
      });
    }

    const room = await roomModel.updateRoom(id, req.body);

    return res.status(200).json({
      message: 'Ruangan berhasil diperbarui.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// Menonaktifkan ruangan
const deactivateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: 'ID ruangan tidak valid.'
      });
    }

    const existingRoom = await roomModel.getRoomById(id);

    if (!existingRoom) {
      return res.status(404).json({
        message: 'Ruangan tidak ditemukan.'
      });
    }

    const room = await roomModel.deactivateRoom(id);

    return res.status(200).json({
      message: 'Ruangan berhasil dinonaktifkan.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deactivateRoom
};