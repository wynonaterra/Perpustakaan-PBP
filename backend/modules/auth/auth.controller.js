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

// 1. REGISTER PUBLIK (Otomatis sebagai 'anggota')
const register = async (req, res, next) => {
  try {
    const { nama, email, kata_sandi, alamat, no_telepon } = req.body;
    if (!nama || !email || !kata_sandi) {
      return res.status(400).json({ message: 'Nama, email, dan kata sandi wajib diisi.' });
    }

    const exists = await authModel.findUserByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);
    const data = await authModel.registerAnggota({ nama, email, hashedPassword, alamat, no_telepon });

    res.status(201).json({
      message: 'Registrasi berhasil. Silakan login.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 2. LOGIN UNIVERSAL (Otomatis cek peran dari database)
const login = async (req, res, next) => {
  try {
    const { email, kata_sandi } = req.body;
    if (!email || !kata_sandi) {
      return res.status(400).json({ message: 'Email dan kata sandi wajib diisi.' });
    }

    const user = await authModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau kata sandi salah.' });
    }

    const valid = await bcrypt.compare(kata_sandi, user.kata_sandi);
    if (!valid) {
      return res.status(401).json({ message: 'Email atau kata sandi salah.' });
    }

    // Cek status nonaktif hanya untuk anggota
    if (user.peran === 'anggota' && user.status_anggota === 'nonaktif') {
      return res.status(403).json({ message: 'Status keanggotaan Anda nonaktif.' });
    }

    const token = createToken(user);
    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id_pengguna: user.id_pengguna,
        id_anggota: user.id_anggota || null,
        nomor_anggota: user.nomor_anggota || null,
        nama: user.nama,
        email: user.email,
        peran: user.peran,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 3. TAMBAH ADMIN BARU (Hanya bisa diakses Admin yang login + ADMIN_SECRET_KEY)
const createAdmin = async (req, res, next) => {
  try {
    const { nama, email, kata_sandi, admin_key } = req.body;

    if (!nama || !email || !kata_sandi || !admin_key) {
      return res.status(400).json({ message: 'Nama, email, kata sandi, dan Admin Secret Key wajib diisi.' });
    }

    if (admin_key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Admin Secret Key tidak valid.' });
    }

    const exists = await authModel.findUserByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(kata_sandi, 10);
    const data = await authModel.registerAdmin({ nama, email, hashedPassword });

    res.status(201).json({
      message: `Akun admin ${data.nama} berhasil dibuat oleh ${req.user.email}.`,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 4. GET PROFILE (Pengguna yang sedang login)
const getProfile = async (req, res, next) => {
  try {
    const data = await authModel.getProfileById(req.user.id_pengguna);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// 5. LIST SEMUA ADMIN
const listAdmins = async (req, res, next) => {
  try {
    const data = await authModel.getAllAdmins();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, createAdmin, getProfile, listAdmins };