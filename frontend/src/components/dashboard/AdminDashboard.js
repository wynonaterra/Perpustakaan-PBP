
import React from "react";
import "./AdminDashboard.css";

const statistics = [
  {
    title: "Total Ruangan",
    value: "12",
    note: "Ruangan terdaftar",
    icon: "meeting_room"
  },
  {
    title: "Sedang Digunakan",
    value: "7",
    note: "Ruangan aktif",
    icon: "door_front"
  },
  {
    title: "Reservasi Hari Ini",
    value: "26",
    note: "Total pemesanan",
    icon: "event_available"
  },
  {
    title: "Menunggu Persetujuan",
    value: "5",
    note: "Perlu ditinjau",
    icon: "pending_actions"
  }
];

const rooms = [
  { name: "Ruang Diskusi A", capacity: "8 Orang", status: "Tersedia" },
  { name: "Ruang Diskusi B", capacity: "12 Orang", status: "Digunakan" },
  { name: "Ruang Seminar", capacity: "30 Orang", status: "Tersedia" },
  { name: "Ruang Multimedia", capacity: "15 Orang", status: "Digunakan" }
];

const reservations = [
  {
    code: "RSV001",
    name: "Andi Pratama",
    room: "Ruang Diskusi A",
    capacity: "8 Orang",
    date: "28 Nov 2026",
    session: "09.00 - 11.00",
    status: "Menunggu"
  },
  {
    code: "RSV002",
    name: "Siti Amelia",
    room: "Ruang Seminar",
    capacity: "30 Orang",
    date: "28 Nov 2026",
    session: "13.00 - 15.00",
    status: "Disetujui"
  },
  {
    code: "RSV003",
    name: "Budi Santoso",
    room: "Ruang Diskusi B",
    capacity: "12 Orang",
    date: "29 Nov 2026",
    session: "10.00 - 12.00",
    status: "Ditolak"
  }
];

function AdminDashboard() {
  return (
    <div className="admin-content">

      {/* WELCOME */}
      <section className="admin-welcome">
        <div>
          <span className="admin-breadcrumb">
            Dashboard / Overview
          </span>

          <h1>Selamat Datang, Admin!</h1>

          <p>
            Pantau dan kelola aktivitas perpustakaan melalui dashboard ini.
          </p>
        </div>

        <div className="admin-date">
          <span className="material-symbols-outlined">
            calendar_today
          </span>
          <span>28 November 2026</span>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="statistics-grid">
        {statistics.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-card-top">
              <span>{item.title}</span>

              <div className={`stat-icon icon-${index}`}>
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>
              </div>
            </div>

            <h2>{item.value}</h2>
            <p>{item.note}</p>
          </div>
        ))}
      </section>

      {/* ROOM AVAILABILITY */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Ketersediaan Ruangan</h2>
            <p>Informasi kondisi ruangan perpustakaan.</p>
          </div>

          <button className="text-button">
            Lihat Semua →
          </button>
        </div>

        <div className="room-grid">
          {rooms.map((room, index) => (
            <div className="room-card" key={index}>
              <div className="room-card-top">
                <span className="material-symbols-outlined room-icon">
                  meeting_room
                </span>

                <span className={`room-status ${
                  room.status === "Tersedia"
                    ? "available"
                    : "occupied"
                }`}>
                  {room.status}
                </span>
              </div>

              <h3>{room.name}</h3>
              <p>
                <span className="material-symbols-outlined">
                  groups
                </span>
                Kapasitas {room.capacity}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RESERVATION TABLE */}
      <section className="dashboard-section reservation-section">
        <div className="section-heading">
          <div>
            <h2>Daftar Reservasi & Peminjaman</h2>
            <p>Aktivitas reservasi dan peminjaman terbaru.</p>
          </div>

          <button className="text-button">
            Lihat Semua →
          </button>
        </div>

        <div className="table-toolbar">
          <input
            type="text"
            placeholder="Cari kode atau nama pemesan..."
          />

          <select defaultValue="Semua Status">
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Disetujui</option>
            <option>Ditolak</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Kode Reservasi</th>
                <th>Nama Pemesan</th>
                <th>Ruangan</th>
                <th>Jadwal Tanggal & Sesi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {reservations.map((item, index) => (
                <tr key={index}>
                  <td className="reservation-code">
                    {item.code}
                  </td>

                  <td>{item.name}</td>

                  <td>
                    {item.room}
                    <small>{item.capacity}</small>
                  </td>

                  <td>
                    {item.date}
                    <small>{item.session}</small>
                  </td>

                  <td>
                    <span className={`status-badge ${
                      item.status.toLowerCase()
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <button className="action-button">
                      <span className="material-symbols-outlined">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;