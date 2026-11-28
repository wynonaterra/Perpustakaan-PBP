import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  // State statistik & aktivitass
  const [stats, setStats] = useState({
    totalBuku: 1240,
    totalAnggota: 385,
    sedangDipinjam: 64,
    totalDendaBelumLunas: 75000,
  });

  const [recentLoans, setRecentLoans] = useState([
    {
      id: 'PJM-001',
      nama_anggota: 'Nadia Putri',
      judul_buku: 'Clean Architecture',
      tgl_kembali: '30 Nov 2026',
      status: 'Dipinjam',
    },
    {
      id: 'PJM-002',
      nama_anggota: 'Dimas Pratama',
      judul_buku: 'Designing Data-Intensive Applications',
      tgl_kembali: '25 Nov 2026',
      status: 'Terlambat',
    },
    {
      id: 'PJM-003',
      nama_anggota: 'Salsabila Ayu',
      judul_buku: 'Atomic Habits',
      tgl_kembali: '27 Nov 2026',
      status: 'Dikembalikan',
    },
    {
      id: 'PJM-004',
      nama_anggota: 'Raka Wijaya',
      judul_buku: 'PostgreSQL Up & Running',
      tgl_kembali: '02 Des 2026',
      status: 'Dipinjam',
    },
  ]);

  const [roomBookings, setRoomBookings] = useState([
    {
      id: 1,
      nama_ruang: 'Ruang Diskusi A',
      peminjam: 'Kelompok PBP-04',
      waktu: '13:00 - 15:00 WIB',
      status: 'Digunakan',
    },
    {
      id: 2,
      nama_ruang: 'Ruang Multimedia 2',
      peminjam: 'Himpunan FTI',
      waktu: '15:30 - 17:00 WIB',
      status: 'Terjadwal',
    },
  ]);

  // Contoh fetch ke backend API dashboard kamu (uncomment jika endpoint sudah siap)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.recentLoans) setRecentLoans(data.recentLoans);
          if (data.roomBookings) setRoomBookings(data.roomBookings);
        }
      } catch (err) {
        // Tetap gunakan data fallback jika server belum menyala
        console.log('Menggunakan data preview dashboard');
      }
    };
    fetchDashboard();
  }, []);

  const renderStatusBadge = (status) => {
    if (status === 'Dikembalikan') return <span className="badge badge-success">{status}</span>;
    if (status === 'Terlambat') return <span className="badge badge-danger">{status}</span>;
    return <span className="badge badge-info">{status}</span>;
  };

  return (
    <div className="dashboard-container">
      {/* BANNER UTAMA */}
      <div className="dashboard-banner">
        <div>
          <h1>Halo, {storedUser.nama_lengkap || 'Admin Pustakawan'}</h1>
          <p>Ringkasan sirkulasi koleksi buku, keanggotaan, dan reservasi ruang perpustakaan hari ini.</p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn btn-banner-light"
            onClick={() => navigate('/admin/peminjaman')}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Catat Peminjaman
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/buku')}
          >
            <span className="material-symbols-outlined">menu_book</span>
            Tambah Buku
          </button>
        </div>
      </div>

      {/* 4 KARTU STATISTIK */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon olive">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Koleksi Buku</span>
            <span className="stat-value">{stats.totalBuku.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ocean">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Anggota Aktif</span>
            <span className="stat-value">{stats.totalAnggota.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sand">
            <span className="material-symbols-outlined">swap_horiz</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Buku Dipinjam</span>
            <span className="stat-value">{stats.sedangDipinjam}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Denda Belum Lunas</span>
            <span className="stat-value">
              Rp {stats.totalDendaBelumLunas.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* TABEL SIRKULASI TERBARU & JADWAL RUANGAN */}
      <div className="dashboard-main-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sirkulasi Peminjaman Terbaru</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/admin/peminjaman')}
            >
              Lihat Semua
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Anggota</th>
                  <th>Judul Buku</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td><strong>{loan.id}</strong></td>
                    <td>{loan.nama_anggota}</td>
                    <td>{loan.judul_buku}</td>
                    <td>{loan.tgl_kembali}</td>
                    <td>{renderStatusBadge(loan.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ruangan Hari Ini</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/admin/booking-ruang')}
            >
              Kelola
            </button>
          </div>

          <div className="room-list">
            {roomBookings.map((room) => (
              <div key={room.id} className="room-item">
                <div className="room-item-top">
                  <span className="room-name">{room.nama_ruang}</span>
                  <span className={`badge ${room.status === 'Digunakan' ? 'badge-warning' : 'badge-info'}`}>
                    {room.status}
                  </span>
                </div>
                <div className="room-meta">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person</span>
                  {room.peminjam}
                </div>
                <div className="room-meta">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>schedule</span>
                  {room.waktu}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}