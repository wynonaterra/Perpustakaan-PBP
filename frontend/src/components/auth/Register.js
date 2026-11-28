import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthVisualPanel from './AuthVisualPanel';
import '../../css/Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kata_sandi: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const el = e.currentTarget.elements;
    const payload = {
      nama: el.nama.value.trim(),
      email: el.email.value.trim(),
      no_telepon: el.no_telepon.value.trim(),
      alamat: el.alamat.value.trim(),
      kata_sandi: el.kata_sandi.value,
    };

    if (!payload.nama || !payload.email || !payload.kata_sandi) {
      setErrorMsg('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    if (payload.kata_sandi.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal dilakukan.');
      }

      setSuccessMsg(`${data.message || 'Registrasi berhasil!'} Mengalihkan ke halaman masuk...`);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthVisualPanel
        title="Bergabung Menjadi Anggota Perpustakaan"
        subtitle="Daftarkan diri Anda secara gratis untuk mendapatkan nomor anggota otomatis dan akses penuh ke peminjaman koleksi."
      />

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1>Buat Akun Anggota</h1>
            <p>Lengkapi data diri Anda untuk mendaftar sebagai anggota perpustakaan.</p>
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

          {successMsg && (
            <div className="auth-alert auth-alert-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="nama">Nama Lengkap</label>
              <input
                id="nama"
                type="text"
                name="nama"
                autoComplete="name"
                className="form-control"
                placeholder="Contoh: Mentari Cahya"
                value={formData.nama}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Alamat Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="form-control"
                  placeholder="nama@student.uksw.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="no_telepon">Nomor Telepon</label>
                <input
                  id="no_telepon"
                  type="tel"
                  name="no_telepon"
                  autoComplete="tel"
                  className="form-control"
                  placeholder="081234567890"
                  value={formData.no_telepon}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="alamat">Alamat Domisili</label>
              <input
                id="alamat"
                type="text"
                name="alamat"
                autoComplete="street-address"
                className="form-control"
                placeholder="Jl. Bahagia No. 123, Kota Contoh"
                value={formData.alamat}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="kata_sandi">Kata Sandi</label>
              <div className="password-wrapper">
                <input
                  id="kata_sandi"
                  type={showPassword ? 'text' : 'password'}
                  name="kata_sandi"
                  autoComplete="new-password"
                  className="form-control"
                  placeholder="Minimal 6 karakter"
                  value={formData.kata_sandi}
                  onChange={handleChange}
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
              {loading ? 'Mendaftarkan Akun...' : 'Daftar Sebagai Anggota'}
            </button>
          </form>

          <p className="auth-switch-text">
            Sudah punya akun?
            <Link to="/login" className="auth-switch-link">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}