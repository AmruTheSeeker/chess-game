<!--
Sync Impact Report
Version: 1.0.0 → 2.0.0 (pilihan level tetap selain mode adaptif)
Prinsip diubah: IV. Lawan Komputer yang Andal — izinkan pilihan level tetap.
Bagian ditambahkan: tidak ada.
Bagian dihapus: tidak ada.
Tindak lanjut placeholder: tidak ada.
-->

# Konstitusi Ruang Catur

## Core Principles

### I. Aturan Catur dan Keutuhan Pertandingan

- Perubahan posisi MUST divalidasi terhadap aturan catur yang menjadi sumber kebenaran tunggal,
  termasuk langkah komputer, promosi, skak, dan kondisi akhir yang didukung.
- Langkah yang tidak sah MUST NOT mengubah posisi, giliran, atau riwayat; pertandingan yang
  selesai MUST NOT menerima langkah baru.
- Mengganti pertandingan aktif MUST memerlukan konfirmasi; pembatalan MUST mempertahankan
  pertandingan yang ada.

Alasan: pemain harus dapat mempercayai hasil pertandingan tanpa wasit.

### II. Pengalaman Pemain yang Dapat Digunakan

- Antarmuka MUST menggunakan Bahasa Indonesia dan menampilkan papan, giliran, langkah terakhir,
  status penting, dan hasil secara jelas.
- Papan dan kendali MUST dapat digunakan pada ponsel dan komputer tanpa gulir mendatar.
- Pekerjaan komputer MUST berjalan tanpa memblokir interaksi antarmuka; kegagalan mesin MUST
  ditampilkan dengan cara pemulihan yang tidak menghapus posisi terakhir.

Alasan: pengguna harus dapat memahami dan memainkan pertandingan pada perangkat yang didukung.

### III. Privasi dan Cakupan Lokal

- Versi saat ini MUST dapat dimainkan satu orang melawan komputer tanpa akun atau server permainan.
- Data pertandingan MUST tetap dalam memori sesi; penyimpanan lintas sesi, akun, dan layanan
  daring MUST NOT ditambahkan tanpa perubahan spesifikasi yang disetujui.
- Ketergantungan dan akses jaringan baru MUST memiliki kebutuhan yang dijelaskan dalam rencana
  serta ditinjau sebelum diadopsi.

Alasan: desain lokal menjaga privasi dan membatasi kompleksitas sesuai kebutuhan pemain.

### IV. Lawan Komputer yang Andal

- Komputer MUST menghasilkan langkah legal dan MUST NOT mengubah papan langsung tanpa validasi
  aturan. Respons pencarian yang dibatalkan atau berasal dari pertandingan lama MUST diabaikan.
- Mode adaptif MUST menyesuaikan kualitas beberapa langkah terbaru pemain tanpa mengharuskan
  pemain memilih tingkat tetap; kebijakan adaptasi MUST dapat diuji secara deterministik.
  Pemain MAY memilih tingkat tetap sebelum memulai pertandingan.
- Kegagalan, batas waktu, dan respons mesin yang tidak valid MUST dilaporkan, bukan diperlakukan
  sebagai langkah berhasil.

Alasan: keputusan komputer tidak boleh merusak pertandingan atau menyembunyikan kesalahan.

### V. Perubahan yang Terverifikasi

- Perubahan perilaku MUST disertai tes yang memeriksa perilaku baru atau regresi yang diperbaiki;
  tulis dan jalankan tes sebelum implementasi jika dapat dilakukan.
- Perubahan pada aturan, adaptasi, atau integrasi mesin MUST diverifikasi dengan tes yang relevan;
  alur permainan dan tampilan responsif MUST memiliki pengujian browser.
- Kriteria terukur MUST diverifikasi pada ambang dan keluaran yang diminta. Hasil uji manusia
  MUST NOT diklaim tanpa peserta dan bukti pengujian nyata.
- Build dan tes yang relevan MUST lulus sebelum pekerjaan dinyatakan selesai; keterbatasan yang
  belum terselesaikan MUST dilaporkan secara eksplisit.

Alasan: hasil yang dapat diulang membedakan implementasi yang benar dari asumsi.

## Batasan Teknis dan Distribusi

- Aplikasi saat ini adalah web sisi-klien; aturan permainan dan komunikasi mesin dipisahkan dari
  antarmuka. Mesin catur berjalan di Worker dan aset yang dibutuhkan disajikan secara lokal.
- Toolchain Node.js dan npm MUST kompatibel dengan versi yang dimiliki pengguna. Versi saat ini
  adalah Node.js 20.10.0 dan npm 10.2.3; perubahan persyaratan versi MUST didokumentasikan dan
  disetujui sebelum diterapkan.
- Dependensi MUST memiliki versi yang dapat direproduksi dan lisensinya MUST ditinjau. Sebelum
  distribusi, pemberitahuan, lisensi, dan penyediaan kode sumber MUST memenuhi kewajiban yang
  berlaku, termasuk GPL-3.0 untuk Stockfish.

## Alur Kerja dan Gerbang Kualitas

- Setiap fitur MUST memiliki spesifikasi yang dapat diuji, rencana implementasi, dan tugas yang
  dapat ditelusuri sebelum pengerjaan; perubahan kecil dapat menggunakan artefak yang relevan
  dan sudah ada.
- Rencana MUST memeriksa kesesuaian dengan konstitusi sebelum dan sesudah desain. Penyimpangan
  MUST dicatat bersama alasan, dampak, dan persetujuan sebelum implementasi.
- Tugas MUST ditandai selesai hanya setelah implementasi dan validasi yang diminta selesai.
  Pengujian yang terblokir MUST tetap terbuka dan alasan blokir MUST dicatat.
- Perubahan yang memengaruhi cara menjalankan, menguji, atau mendistribusikan aplikasi MUST
  memperbarui dokumentasi terkait.

## Governance

- Konstitusi ini berlaku untuk pekerjaan proyek dan menjadi dasar pemeriksaan spesifikasi,
  rencana, tugas, implementasi, serta tinjauan. Jika terjadi konflik, catat konflik dan minta
  keputusan pemilik proyek sebelum melanjutkan.
- Amandemen MUST menjelaskan alasan, dampak, dan penyesuaian yang diperlukan, lalu disetujui
  pemilik proyek. Tinjauan perubahan MUST memeriksa kepatuhan terhadap versi yang berlaku.
- Versi mengikuti semantic versioning: MAJOR untuk penghapusan atau redefinisi prinsip yang
  tidak kompatibel; MINOR untuk prinsip baru atau perluasan substantif; PATCH untuk klarifikasi
  tanpa perubahan makna. Tanggal amandemen MUST diperbarui ketika konstitusi berubah.

**Version**: 2.0.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13
