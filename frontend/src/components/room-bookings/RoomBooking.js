import React, { useState } from "react";
import "../../css/RoomBooking.css";

import BookingList from "./BookingList";
import BookingForm from "./BookingForm";
import BookingDetail from "./BookingDetail";

function RoomBooking() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      kode: "RSV-001",
      nama: "Andi Saputra",
      ruangan: "Ruang Diskusi A",
      kapasitas: 10,
      tanggal: "2026-11-29",
      sesi: "09.00 - 11.00",
      status: "Menunggu",
      keperluan: "Diskusi kelompok",
    },
    {
      id: 2,
      kode: "RSV-002",
      nama: "Budi Santoso",
      ruangan: "Ruang Seminar",
      kapasitas: 30,
      tanggal: "2026-11-30",
      sesi: "13.00 - 15.00",
      status: "Disetujui",
      keperluan: "Seminar mahasiswa",
    },
    {
      id: 3,
      kode: "RSV-003",
      nama: "Citra Amelia",
      ruangan: "Ruang Diskusi B",
      kapasitas: 8,
      tanggal: "2026-12-01",
      sesi: "10.00 - 12.00",
      status: "Ditolak",
      keperluan: "Belajar kelompok",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const totalBooking = bookings.length;
  const menunggu = bookings.filter(
    (item) => item.status === "Menunggu"
  ).length;
  const disetujui = bookings.filter(
    (item) => item.status === "Disetujui"
  ).length;
  const ditolak = bookings.filter(
    (item) => item.status === "Ditolak"
  ).length;

  const handleAddBooking = (formData) => {
    const newBooking = {
      id: Date.now(),
      kode: `RSV-${String(bookings.length + 1).padStart(3, "0")}`,
      ...formData,
      status: "Menunggu",
    };

    setBookings((prev) => [...prev, newBooking]);
    setShowForm(false);
  };

  const handleUpdateStatus = (id, status) => {
    setBookings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setSelectedBooking(null);
  };

  return (
    <div className="room-booking-page">
      <div className="room-booking-header">
        <div>
          <h1>Booking Ruangan</h1>
          <p>Kelola reservasi dan peminjaman ruang perpustakaan.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Tambah Reservasi
        </button>
      </div>

      <div className="rb-stat-grid">
        <div className="card">
          <span>Total Reservasi</span>
          <h2>{totalBooking}</h2>
        </div>

        <div className="card">
          <span>Menunggu</span>
          <h2>{menunggu}</h2>
        </div>

        <div className="card">
          <span>Disetujui</span>
          <h2>{disetujui}</h2>
        </div>

        <div className="card">
          <span>Ditolak</span>
          <h2>{ditolak}</h2>
        </div>
      </div>

      <BookingList
        bookings={bookings}
        onDetail={setSelectedBooking}
      />

      {showForm && (
        <BookingForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddBooking}
        />
      )}

      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default RoomBooking;
