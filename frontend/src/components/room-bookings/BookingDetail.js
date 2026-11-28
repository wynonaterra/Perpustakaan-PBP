
import React from "react";

function BookingDetail({ booking, onClose, onUpdateStatus }) {
  return (
    <div className="rb-modal-overlay">
      <div className="rb-modal">

        {/* Header */}
        <div className="rb-modal-header">
          <div>
            <h2>Detail Reservasi</h2>
            <p>Informasi lengkap pemesanan ruangan.</p>
          </div>

          <button
            className="rb-close"
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Informasi Reservasi */}
        <div className="rb-detail-list">
          <div>
            <span>Kode Reservasi</span>
            <strong>{booking.kode}</strong>
          </div>

          <div>
            <span>Nama Pemesan</span>
            <strong>{booking.nama}</strong>
          </div>

          <div>
            <span>Ruangan</span>
            <strong>{booking.ruangan}</strong>
          </div>

          <div>
            <span>Kapasitas</span>
            <strong>{booking.kapasitas} orang</strong>
          </div>

          <div>
            <span>Tanggal Reservasi</span>
            <strong>{booking.tanggal}</strong>
          </div>

          <div>
            <span>Sesi Waktu</span>
            <strong>{booking.sesi}</strong>
          </div>

          <div>
            <span>Keperluan</span>
            <strong>{booking.keperluan}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{booking.status}</strong>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="rb-detail-actions">

          {booking.status === "Menunggu" && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  onUpdateStatus(booking.id, "Ditolak")
                }
              >
                Tolak
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  onUpdateStatus(booking.id, "Disetujui")
                }
              >
                Setujui
              </button>
            </>
          )}

          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Tutup
          </button>

        </div>
      </div>
    </div>
  );
}

export default BookingDetail;
