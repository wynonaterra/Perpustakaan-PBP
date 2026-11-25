const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');

const createToken = (user) => {
  return jwt.sign(
    {
      id_pengguna: user.id_pengguna,
      id_anggota: user.id_anggota || null,
      email: user.email,
      peran: user.peran,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 1. Admin Register
const registerAdmin = async (req, res, next) => {
  try {
    const { nama, email, kata_sandi, admin_key } = req.body;
    if (!nama || !email || !kata_sandi) {
      return res.status(400).json({ message: 'Nama, email, dan kata sandi wajib diisi.' });
    }
    if (admin_key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Kode rahasia admin salah.' });
    }

    const exists = await authModel.findUserByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);
    const data = await authModel.registerAdmin({ nama, email, hashedPassword });
    res.status(201).json({ message: 'Registrasi admin berhasil.', data });
  } catch (err) {
    next(err);
  }
};

// 2. Admin Login
const loginAdmin = async (req, res, next) => {
  try {
    const { email, kata_sandi } = req.body;
    const user = await authModel.findUserByEmail(email);

    if (!user || user.peran !== 'admin') {
      return res.status(401).json({ message: 'Akun admin tidak ditemukan.' });
    }
    const valid = await bcrypt.compare(kata_sandi, user.kata_sandi);
    if (!valid) return res.status(401).json({ message: 'Kata sandi salah.' });

    const token = createToken(user);
    res.json({
      message: 'Login admin berhasil.',
      token,
      user: { id_pengguna: user.id_pengguna, nama: user.nama, email: user.email, peran: user.peran },
    });
  } catch (err) {
    next(err);
  }
};

// 4. Pengguna (Anggota) Register
const registerPengguna = async (req, res, next) => {
  try {
    const { nama, email, kata_sandi, alamat, no_telepon } = req.body;
    if (!nama || !email || !kata_sandi) {
      return res.status(400).json({ message: 'Nama, email, dan kata sandi wajib diisi.' });
    }

    const exists = await authModel.findUserByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);
    const data = await authModel.registerAnggota({ nama, email, hashedPassword, alamat, no_telepon });
    res.status(201).json({ message: 'Registrasi pengguna berhasil.', data });
  } catch (err) {
    next(err);
  }
};

// 5. Pengguna (Anggota) Login
const loginPengguna = async (req, res, next) => {
  try {
    const { email, kata_sandi } = req.body;
    const user = await authModel.findUserByEmail(email);

    if (!user || user.peran !== 'anggota') {
      return res.status(401).json({ message: 'Akun pengguna tidak ditemukan.' });
    }
    const valid = await bcrypt.compare(kata_sandi, user.kata_sandi);
    if (!valid) return res.status(401).json({ message: 'Kata sandi salah.' });

    if (user.status_anggota === 'nonaktif') {
      return res.status(403).json({ message: 'Status keanggotaan Anda nonaktif.' });
    }

    const token = createToken(user);
    res.json({
      message: 'Login pengguna berhasil.',
      token,
      user: {
        id_pengguna: user.id_pengguna,
        id_anggota: user.id_anggota,
        nama: user.nama,
        email: user.email,
        peran: user.peran,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const data = await authModel.getProfileById(req.user.id_pengguna);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerAdmin, loginAdmin, registerPengguna, loginPengguna, getProfile };