const pool = require('./config/database');

const seedBuku = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('=== SEED BUKU DIMULAI ===');

    // =========================================================
    // 1. DATA BUKU
    // =========================================================
    const bukuList = [
      {
        id_kategori: 1,
        isbn: '978-602-001',
        judul: 'Clean Code',
        penulis: 'Robert C. Martin',
        penerbit: 'Prentice Hall',
        tahun_terbit: 2008,
        deskripsi:
          'Panduan menulis kode yang rapi dan mudah dipelihara.',
        gambar_sampul:
          'https://m.media-amazon.com/images/I/51E2055ZGUL.jpg',
        stok: 5,
      },
      {
        id_kategori: 1,
        isbn: '9786022345678',
        judul: 'Belajar Node.js dan Express',
        penulis: 'Andi Wijaya',
        penerbit: 'Elex Media Komputindo',
        tahun_terbit: 2025,
        deskripsi:
          'Panduan membangun REST API menggunakan Node.js dan Express.',
        gambar_sampul: null,
        stok: 3,
      },
      {
        id_kategori: 1,
        isbn: '9786023456789',
        judul: 'Database PostgreSQL untuk Pemula',
        penulis: 'Rina Pratama',
        penerbit: 'Gramedia',
        tahun_terbit: 2023,
        deskripsi:
          'Dasar-dasar penggunaan database PostgreSQL.',
        gambar_sampul: null,
        stok: 4,
      },
      {
        id_kategori: 2,
        isbn: '9786024567890',
        judul: 'Metode Belajar Efektif',
        penulis: 'Dewi Lestari',
        penerbit: 'Prenada Media',
        tahun_terbit: 2022,
        deskripsi:
          'Strategi belajar efektif untuk mahasiswa.',
        gambar_sampul: null,
        stok: 2,
      },
      {
        id_kategori: 3,
        isbn: '9786025678901',
        judul: 'Senja di Perpustakaan',
        penulis: 'Arif Nugroho',
        penerbit: 'Bentang',
        tahun_terbit: 2024,
        deskripsi:
          'Novel tentang kehidupan mahasiswa dan perpustakaan.',
        gambar_sampul: null,
        stok: 6,
      },
    ];

    // =========================================================
    // 2. INSERT BUKU + EKSEMPLAR
    // =========================================================
    for (const buku of bukuList) {
      const bukuResult = await client.query(
        `
        INSERT INTO buku (
          id_kategori,
          isbn,
          judul,
          penulis,
          penerbit,
          tahun_terbit,
          deskripsi,
          gambar_sampul,
          stok_total,
          stok_tersedia
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
        RETURNING id_buku, judul
        `,
        [
          buku.id_kategori,
          buku.isbn,
          buku.judul,
          buku.penulis,
          buku.penerbit,
          buku.tahun_terbit,
          buku.deskripsi,
          buku.gambar_sampul,
          buku.stok,
        ]
      );

      const idBuku = bukuResult.rows[0].id_buku;

      console.log(
        `✓ Buku dibuat: ${bukuResult.rows[0].judul} (ID: ${idBuku})`
      );

      // =======================================================
      // 3. BUAT EKSEMPLAR SESUAI STOK
      // =======================================================
      for (let nomorUrut = 1; nomorUrut <= buku.stok; nomorUrut++) {
        /*
         * Format:
         * ID buku 1 -> 6712341, 6712342, dst.
         * ID buku 2 -> 6723451, 6723452, dst.
         */
        const idEksemplar =
          `${idBuku}${String(12340 + nomorUrut)}`;

        await client.query(
          `
          INSERT INTO eksemplar_buku (
            id_eksemplar,
            id_buku,
            nomor_urut,
            status
          )
          VALUES ($1, $2, $3, 'tersedia')
          `,
          [
            idEksemplar,
            idBuku,
            nomorUrut,
          ]
        );
      }

      console.log(
        `  → ${buku.stok} eksemplar dibuat`
      );
    }

    await client.query('COMMIT');

    console.log('');
    console.log('=== SEED BUKU BERHASIL ===');
    console.log('Total buku      : 5');
    console.log('Total eksemplar : 20');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('');
    console.error('=== SEED BUKU GAGAL ===');
    console.error(error.message);
    console.error('Semua perubahan telah di-rollback.');
  } finally {
    client.release();
    await pool.end();
  }
};

seedBuku();