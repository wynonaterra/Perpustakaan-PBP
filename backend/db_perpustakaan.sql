-- =========================================
-- DATABASE: db_perpustakaan
-- DBMS: PostgreSQL
-- =========================================


-- 1. TABEL PENGGUNA
CREATE TABLE IF NOT EXISTS pengguna (
    id_pengguna INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    kata_sandi VARCHAR(255) NOT NULL,
    peran VARCHAR(10) NOT NULL
        CHECK (peran IN ('admin', 'anggota')),
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. TABEL ANGGOTA
CREATE TABLE IF NOT EXISTS anggota (
    id_anggota INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pengguna INT NOT NULL UNIQUE,
    nomor_anggota VARCHAR(30) UNIQUE,
    alamat TEXT,
    no_telepon VARCHAR(20),
    tanggal_daftar DATE NOT NULL,
    status VARCHAR(10) DEFAULT 'aktif'
        CHECK (status IN ('aktif', 'nonaktif')),

    CONSTRAINT fk_anggota_pengguna
        FOREIGN KEY (id_pengguna)
        REFERENCES pengguna(id_pengguna)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- 3. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS kategori (
    id_kategori INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT
);


-- 4. TABEL BUKU
CREATE TABLE IF NOT EXISTS buku (
    id_buku INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_kategori INT,
    isbn VARCHAR(20) UNIQUE,
    judul VARCHAR(200) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150),
    tahun_terbit SMALLINT,
    deskripsi TEXT,
    gambar_sampul VARCHAR(255),
    stok_total INT DEFAULT 0,
    stok_tersedia INT DEFAULT 0,

    CONSTRAINT fk_buku_kategori
        FOREIGN KEY (id_kategori)
        REFERENCES kategori(id_kategori)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT cek_tahun_terbit
        CHECK (tahun_terbit IS NULL OR tahun_terbit BETWEEN 1000 AND 9999),

    CONSTRAINT cek_stok
        CHECK (
            stok_total >= 0
            AND stok_tersedia >= 0
            AND stok_tersedia <= stok_total
        )
);


-- 5. TABEL RUANG
CREATE TABLE IF NOT EXISTS ruang (
    id_ruang INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_ruang VARCHAR(100) NOT NULL,
    lokasi VARCHAR(100),
    kapasitas INT NOT NULL,
    fasilitas TEXT,
    status VARCHAR(10) DEFAULT 'aktif'
        CHECK (status IN ('aktif', 'nonaktif')),

    CONSTRAINT cek_kapasitas
        CHECK (kapasitas > 0)
);


-- 6. TABEL PEMINJAMAN
CREATE TABLE IF NOT EXISTS peminjaman (
    id_peminjaman INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_anggota INT NOT NULL,
    jenis_peminjaman VARCHAR(10) NOT NULL
        CHECK (jenis_peminjaman IN ('online', 'offline')),
    tanggal_peminjaman TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    waktu_pengambilan TIMESTAMP,
    batas_pengambilan TIMESTAMP,
    tanggal_jatuh_tempo DATE,
    status VARCHAR(20) NOT NULL
        CHECK (
            status IN (
                'menunggu',
                'disetujui',
                'siap_diambil',
                'dipinjam',
                'ditolak',
                'dibatalkan',
                'kedaluwarsa',
                'selesai'
            )
        ),
    catatan TEXT,

    CONSTRAINT fk_peminjaman_anggota
        FOREIGN KEY (id_anggota)
        REFERENCES anggota(id_anggota)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- 7. TABEL DETAIL PEMINJAMAN
CREATE TABLE IF NOT EXISTS detail_peminjaman (
    id_detail_peminjaman INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_peminjaman INT NOT NULL,
    id_buku INT NOT NULL,
    jumlah INT DEFAULT 1 NOT NULL,

    CONSTRAINT fk_detail_peminjaman
        FOREIGN KEY (id_peminjaman)
        REFERENCES peminjaman(id_peminjaman)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_detail_buku
        FOREIGN KEY (id_buku)
        REFERENCES buku(id_buku)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT cek_jumlah
        CHECK (jumlah > 0),

    CONSTRAINT unik_buku_per_peminjaman
        UNIQUE (id_peminjaman, id_buku)
);


-- 8. TABEL PEMINJAMAN RUANG
CREATE TABLE IF NOT EXISTS peminjaman_ruang (
    id_peminjaman_ruang INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ruang INT NOT NULL,
    id_anggota INT NOT NULL,
    tanggal_peminjaman DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    jumlah_orang INT NOT NULL,
    status VARCHAR(15) NOT NULL
        CHECK (
            status IN (
                'menunggu',
                'disetujui',
                'ditolak',
                'dibatalkan',
                'selesai'
            )
        ),
    catatan TEXT,

    CONSTRAINT fk_peminjaman_ruang
        FOREIGN KEY (id_ruang)
        REFERENCES ruang(id_ruang)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_peminjaman_ruang_anggota
        FOREIGN KEY (id_anggota)
        REFERENCES anggota(id_anggota)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT cek_jam_ruang
        CHECK (jam_selesai > jam_mulai),

    CONSTRAINT cek_jumlah_orang
        CHECK (jumlah_orang > 0)
);


-- 9. TABEL PENGEMBALIAN
CREATE TABLE IF NOT EXISTS pengembalian (
    id_pengembalian INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_detail_peminjaman INT NOT NULL UNIQUE,
    tanggal_pengembalian TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    kondisi_buku VARCHAR(10) NOT NULL
        CHECK (kondisi_buku IN ('baik', 'rusak', 'hilang')),
    catatan TEXT,

    CONSTRAINT fk_pengembalian_detail
        FOREIGN KEY (id_detail_peminjaman)
        REFERENCES detail_peminjaman(id_detail_peminjaman)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- 10. TABEL DENDA
CREATE TABLE IF NOT EXISTS denda (
    id_denda INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pengembalian INT NOT NULL UNIQUE,
    jumlah_denda DECIMAL(12,2) DEFAULT 0 NOT NULL,
    alasan VARCHAR(255) NOT NULL,
    status_pembayaran VARCHAR(25) DEFAULT 'belum_bayar'
        CHECK (
            status_pembayaran IN (
                'belum_bayar',
                'menunggu_verifikasi',
                'lunas'
            )
        ),
    tanggal_pembayaran TIMESTAMP,

    CONSTRAINT fk_denda_pengembalian
        FOREIGN KEY (id_pengembalian)
        REFERENCES pengembalian(id_pengembalian)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT cek_jumlah_denda
        CHECK (jumlah_denda >= 0)
);


-- =========================================
-- INDEX UNTUK OPTIMASI QUERY
-- =========================================

CREATE INDEX IF NOT EXISTS idx_peminjaman_anggota
ON peminjaman(id_anggota);

CREATE INDEX IF NOT EXISTS idx_peminjaman_status
ON peminjaman(status);

CREATE INDEX IF NOT EXISTS idx_detail_buku
ON detail_peminjaman(id_buku);

CREATE INDEX IF NOT EXISTS idx_peminjaman_ruang_anggota
ON peminjaman_ruang(id_anggota);

CREATE INDEX IF NOT EXISTS idx_peminjaman_ruang_jadwal
ON peminjaman_ruang(id_ruang, tanggal_peminjaman);

CREATE INDEX IF NOT EXISTS idx_pengembalian_tanggal
ON pengembalian(tanggal_pengembalian);

CREATE INDEX IF NOT EXISTS idx_denda_status
ON denda(status_pembayaran);
