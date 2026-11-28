
import React from "react";

function BookingList({ bookings, onDetail }) {
  const getBadgeClass = (status) => {
    if (status === "Disetujui") return "badge-success";
    if (status === "Menunggu") return "badge-warning";
    return "badge-danger";
  };

  return (
    <div className="card rb-table-section">
      <div className="rb-table-heading">
        <div>
          <h3>Daftar Reservasi Ruangan</h3>
          <p>Daftar pemesanan dan peminjaman ruang perpustakaan.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Kode Reservasi</th>
              <th>Nama Pemesan</th>
              <th>Ruangan</th>
              <th>Kapasitas</th>
              <th>Jadwal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.kode}</td>
                  <td>{booking.nama}</td>
                  <td>{booking.ruangan}</td>
                  <td>{booking.kapasitas} orang</td>
                  <td>
                    {booking.tanggal}
                    <br />
                    <small>{booking.sesi}</small>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => onDetail(booking)}
                    >
                      Kelola
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="rb-empty">
                  Belum ada data reservasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingList;