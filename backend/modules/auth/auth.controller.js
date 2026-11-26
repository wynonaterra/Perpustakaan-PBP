const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');

// =========================================================
// CREATE JWT TOKEN
// =========================================================
const createToken = (user) => {
  return jwt.sign(
    {
      id_pengguna: user.id_pengguna,
      email: user.email,
      peran: user.peran,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// =========================================================
// REGISTER ANGGOTA
// =========================================================
const register = async (req, res, next) => {
  try {
    const {
      nama,
      email,
      kata_sandi,
      alamat,
      no_telepon,
    } = req.body;

    if (!nama || !email || !kata_sandi) {
      return res.status(400).json({
        message: 'Nama, email, dan kata sandi wajib diisi.',
      });
    }

    const exists = await authModel.findUserByEmail(email);

    if (exists) {
      return res.status(409).json({
        message: 'Email sudah terdaftar.',
      });
    }

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);

    const data = await authModel.registerAnggota({
      nama,
      email,
      hashedPassword,
      alamat,
      no_telepon,
    });

    res.status(201).json({
      message: 'Registrasi berhasil. Silakan login.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================
// LOGIN UNIVERSAL
// Admin dan anggota login melalui endpoint yang sama
// =========================================================
const login = async (req, res, next) => {
  try {
    const {
      email,
      kata_sandi,
    } = req.body;

    if (!email || !kata_sandi) {
      return res.status(400).json({
        message: 'Email dan kata sandi wajib diisi.',
      });
    }

    const user = await authModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: 'Email atau kata sandi salah.',
      });
    }

    const valid = await bcrypt.compare(
      kata_sandi,
      user.kata_sandi
    );

    if (!valid) {
      return res.status(401).json({
        message: 'Email atau kata sandi salah.',
      });
    }

    if (user.status === 'nonaktif') {
      return res.status(403).json({
        message: 'Akun Anda berstatus nonaktif.',
      });
    }

    const token = createToken(user);

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id_pengguna: user.id_pengguna,
        nomor_anggota: user.nomor_anggota || null,
        nama: user.nama,
        email: user.email,
        peran: user.peran,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================
// TAMBAH ADMIN
// Hanya admin yang sudah login
// =========================================================
const createAdmin = async (req, res, next) => {
  try {
    const {
      nama,
      email,
      kata_sandi,
      alamat,
      no_telepon,
      admin_key,
    } = req.body;

    if (!nama || !email || !kata_sandi || !admin_key) {
      return res.status(400).json({
        message:
          'Nama, email, kata sandi, dan Admin Secret Key wajib diisi.',
      });
    }

    if (admin_key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({
        message: 'Admin Secret Key tidak valid.',
      });
    }

    const exists = await authModel.findUserByEmail(email);

    if (exists) {
      return res.status(409).json({
        message: 'Email sudah terdaftar.',
      });
    }

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);

    const data = await authModel.registerAdmin({
      nama,
      email,
      hashedPassword,
      alamat,
      no_telepon,
    });

    res.status(201).json({
      message: `Akun admin ${data.nama} berhasil dibuat.`,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================
// GET PROFILE USER YANG SEDANG LOGIN
// =========================================================
const getProfile = async (req, res, next) => {
  try {
    const user = await authModel.getUserById(
      req.user.id_pengguna
    );

    if (!user) {
      return res.status(404).json({
        message: 'Data pengguna tidak ditemukan.',
      });
    }

    res.json({
      message: 'Data profile berhasil diambil.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================
// GET SEMUA ADMIN
// Hanya admin
// =========================================================
const listAdmins = async (req, res, next) => {
  try {
    const admins = await authModel.getAllAdmins();

    res.json({
      message: 'Data admin berhasil diambil.',
      data: admins,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  createAdmin,
  getProfile,
  listAdmins,
};