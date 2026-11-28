
import React, { useState } from "react";

function BookingForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nama: "",
    ruangan: "",
    kapasitas: "",
    tanggal: "",
    jamMulai: "",
    jamSelesai: "",
    keperluan: "",
  });

  const [jamError, setJamError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "jamMulai" || name === "jamSelesai") {
      setJamError("");
    }
  };

  const validasiJam = () => {
    const { jamMulai, jamSelesai } = formData;

    if (!jamMulai || !jamSelesai) {
      setJamError("Jam mulai dan jam selesai wajib diisi.");
      return false;
    }

    if (jamMulai < "07:00" || jamMulai > "19:00") {
      setJamError("Jam mulai harus berada antara 07.00–19.00.");
      return false;
    }

    if (jamSelesai < "07:00" || jamSelesai > "19:00") {
      setJamError("Jam selesai harus berada antara 07.00–19.00.");
      return false;
    }

    if (jamSelesai <= jamMulai) {
      setJamError("Jam selesai harus lebih besar dari jam mulai.");
      return false;
    }

    setJamError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validasiJam()) return;

    const dataReservasi = {
      nama: formData.nama,
      ruangan: formData.ruangan,
      kapasitas: Number(formData.kapasitas),
      tanggal: formData.tanggal,
      sesi: `${formData.jamMulai} - ${formData.jamSelesai}`,
      keperluan: formData.keperluan,
    };

    onSubmit(dataReservasi);
  };

  return (
    <div className="rb-modal-overlay">
      <div className="rb-modal">
        <div className="rb-modal-header">
          <div>
            <h2>Tambah Reservasi</h2>
            <p>Masukkan informasi pemesanan ruangan.</p>
          </div>

          <button
            className="rb-close"
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Pemesan</label>
            <input
              type="text"
              name="nama"
              className="form-control"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Masukkan nama pemesan"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ruangan</label>
            <select
              name="ruangan"
              className="form-control"
              value={formData.ruangan}
              onChange={handleChange}
              required
            >
              <option value="">Pilih ruangan</option>
              <option value="Ruang Diskusi A">Ruang Diskusi A</option>
              <option value="Ruang Diskusi B">Ruang Diskusi B</option>
              <option value="Ruang Seminar">Ruang Seminar</option>
              <option value="Ruang Multimedia">Ruang Multimedia</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Kapasitas</label>
            <input
              type="number"
              name="kapasitas"
              className="form-control"
              value={formData.kapasitas}
              onChange={handleChange}
              placeholder="Jumlah peserta"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Reservasi</label>
            <input
              type="date"
              name="tanggal"
              className="form-control"
              value={formData.tanggal}
              onChange={handleChange}
              required
            />
          </div>

          {/* Input Jam Manual */}
          <div className="form-group">
            <label className="form-label">Sesi Waktu Reservasi</label>

            <div className="rb-time-inputs">
              <div>
                <label className="rb-time-label">Jam Mulai</label>
                <input
                  type="time"
                  name="jamMulai"
                  className="form-control"
                  value={formData.jamMulai}
                  onChange={handleChange}
                  min="07:00"
                  max="19:00"
                  required
                />
              </div>

              <div>
                <label className="rb-time-label">Jam Selesai</label>
                <input
                  type="time"
                  name="jamSelesai"
                  className="form-control"
                  value={formData.jamSelesai}
                  onChange={handleChange}
                  min="07:00"
                  max="19:00"
                  required
                />
              </div>
            </div>

            <p className="rb-time-info">
              Jam operasional reservasi: 07.00–19.00 WIB.
            </p>

            {jamError && (
              <p className="rb-time-error">
                {jamError}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Keperluan</label>
            <textarea
              name="keperluan"
              className="form-control"
              value={formData.keperluan}
              onChange={handleChange}
              placeholder="Tuliskan keperluan reservasi"
              rows="3"
              required
            />
          </div>

          <div className="rb-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Batal
            </button>

            <button type="submit" className="btn btn-primary">
              Simpan Reservasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;