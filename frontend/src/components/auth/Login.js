import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthVisualPanel from './AuthVisualPanel';
import '../../css/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formElements = e.currentTarget.elements;
    const finalEmail = formElements.email.value.trim();
    const finalKataSandi = formElements.kata_sandi.value;

    if (!finalEmail || !finalKataSandi) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: finalEmail,
          kata_sandi: finalKataSandi,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email atau kata sandi salah.');
      }

      // Normalisasi data user agar kompatibel dengan backend (nama, peran) & layout (nama_lengkap, role)
      const normalizedUser = {
        ...data.user,
        nama_lengkap: data.user.nama,
        role: data.user.peran,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      // Redirect berdasarkan 'peran' dari backend
      if (data.user.peran === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/katalog');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthVisualPanel
        title="Jelajahi Ribuan Koleksi Literasi dalam Satu Tempat"
        subtitle="Masuk untuk meminjam buku, memantau tenggat pengembalian, dan memesan ruang diskusi perpustakaan dengan mudah."
      />

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1>Selamat Datang Kembali</h1>
            <p>Masukkan email dan kata sandi akun perpustakaan Anda.</p>
          </div>

          {errorMsg && (
            <div className="auth-alert auth-alert-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Alamat Email</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                className="form-control"
                placeholder="nama@student.uksw.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="kata_sandi">Kata Sandi</label>
              <div className="password-wrapper">
                <input
                  id="kata_sandi"
                  type={showPassword ? 'text' : 'password'}
                  name="kata_sandi"
                  autoComplete="current-password"
                  className="form-control"
                  placeholder="Masukkan kata sandi"
                  value={kataSandi}
                  onChange={(e) => {
                    setKataSandi(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan kata sandi"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-auth-submit"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk ke Akun'}
            </button>
          </form>

          <p className="auth-switch-text">
            Belum memiliki akun anggota?
            <Link to="/register" className="auth-switch-link">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}