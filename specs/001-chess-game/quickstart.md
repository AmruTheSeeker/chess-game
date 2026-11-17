# Quickstart Validasi

Panduan ini menjelaskan cara menjalankan dan memvalidasi aplikasi catur lokal.

## Prasyarat

- Node.js `v20.10.0`
- npm `10.2.3`
- Browser modern dengan dukungan Web Worker dan WebAssembly

Pastikan versi:

```powershell
node --version
npm --version
```

Hasil yang diharapkan: `v20.10.0` dan `10.2.3`.

## Pasang dan jalankan

```powershell
npm ci
npm run dev
```

Buka URL lokal yang dicetak Vite. Gunakan server tersebut; jangan membuka berkas HTML dengan `file://`, karena Worker dan aset WASM perlu disajikan melalui HTTP lokal.
Pilih warna dan level sebelum menekan **Mulai permainan**. Putih dan level Adaptif adalah pilihan awal; level tetap Mudah, Sedang, dan Sulit juga tersedia. Untuk pemula, pilih **Pemula** (semua balasan komputer dipilih acak dari langkah legal) atau **Sangat Mudah** (60% balasan acak, 40% mesin Skill Level 0). Level ini tidak menjamin kemenangan: komputer tetap bisa menangkap buah, memberi skak, dan skakmat. Adaptif dimulai pada kekuatan menengah, sehingga bukan pilihan latihan dasar. Jika memilih Hitam, komputer bergerak lebih dulu. Pilih buah milik Anda dan petak tujuannya; komputer membalas secara otomatis. Pengaturan warna/level yang diubah selama permainan berlaku pada **Permainan baru**, yang meminta konfirmasi selama pertandingan aktif.

Aktifkan **Mode Belajar** kapan saja, tanpa memulai ulang pertandingan. Pelatih menampilkan tips sesuai posisi (pembukaan, ancaman buah, skak, atau akhir permainan), penjelasan langkah Anda, dan referensi strategi dasar. **Minta saran langkah** mencari satu langkah legal dengan mesin lokal level 20 dan menandai asal/tujuannya dengan garis biru. Papan dikunci sebentar selama pencarian agar posisi tidak berubah; saran tidak dijalankan otomatis dan tidak mengubah level lawan maupun riwayat adaptasi. Klik buah dan tujuan sendiri untuk mencoba; promosi tetap dipilih lewat dialog. Saran hilang setelah langkah atau permainan baru. Penjelasan bersifat pengenalan pola/ancaman, bukan evaluasi mendalam atau jaminan langkah terbaik. Mode Belajar awalnya nonaktif; menonaktifkannya menyembunyikan pelatih dan penanda saran. Semua analisis tetap lokal, tanpa layanan eksternal.
Waktu masing-masing sisi dihitung selama gilirannya tanpa batas waktu. Jam berhenti saat konfirmasi
permainan baru, gangguan mesin, atau akhir pertandingan. Buah yang ditangkap ditampilkan di atas
dan di bawah papan untuk masing-masing pihak; permainan baru mengatur ulang jam dan tangkapan.
Panel pertandingan menampilkan warna, jenis buah, petak asal, dan tujuan untuk langkah terakhir
serta catatan langkah Putih dan Hitam (terbaru di atas). Petak asal dan tujuan langkah terakhir
ditandai pada papan. Permainan baru menghapus catatan langkah.

Saat pertandingan selesai, pop-up otomatis menampilkan **menang**, **kalah**, atau **remis (seri)**
dari sudut pandang Anda, termasuk penyebab hasil dan ringkasan langkah/tangkapan. Fitur ini tetap
tersedia tanpa Mode Belajar. Saran, tips, dan trik di dalamnya menggunakan riwayat permainan Anda:
rokade, pengembangan kuda/gajah pada enam langkah awal, tangkapan Anda, dan buah bernilai tertinggi
yang ditangkap komputer. Saran bersifat latihan berbasis fakta langkah, bukan evaluasi mesin,
penilaian blunder, atau jaminan langkah terbaik; pengorbanan tidak otomatis dianggap kesalahan.
Seluruhnya diproses lokal. Pilih **Lihat papan & riwayat** atau tekan Escape untuk menutup pop-up,
kemudian **Lihat hasil & pelajaran** untuk membukanya kembali. **Main lagi** memulai pertandingan
dengan pengaturan permainan berikutnya dan menghapus riwayat serta pelajaran sebelumnya.

## Tampilan responsif

- Di layar di bawah 960px, papan dan panel ditumpuk. Gunakan navigasi **Papan** dan
  **Pengaturan & belajar** untuk berpindah tanpa mencari bagian halaman secara manual.
- Pada desktop, panel berada di samping papan. Ukuran papan dan buah menyesuaikan ruang
  yang tersedia; pada desktop yang cukup tinggi, ukuran papan juga memperhitungkan tinggi layar.
- Layar kecil dan landscape tetap dapat digulir vertikal. Konten tidak disembunyikan atau
  dipaksa muat dalam satu layar dengan teks yang terlalu kecil; tidak diperlukan gulir horizontal.
- Tombol, pilihan pengaturan, dan label Mode Belajar memiliki tinggi sentuh minimal 44px.
  Petak papan tetap persegi dan mengikuti lebar layar. Pembesaran browser tidak dinonaktifkan;
  ukuran teks pada pilihan pengaturan minimal 16px agar iPhone tidak perlu zoom otomatis saat memilih.
- Area aman perangkat (notch/home indicator) diperhitungkan. Pop-up mengikuti tinggi viewport
  dinamis; pelajaran dapat digulir terpisah dari tombol aksi yang selalu terlihat.
  Gunakan Shift+Tab dari tombol penutup untuk memfokuskan pelajaran, lalu tombol panah/End
  untuk menggulir dengan keyboard.

Mode Belajar menggunakan kartu terpisah untuk **Saran langkah**, **Pelajaran dari langkah Anda**,
dan **Tips sesuai posisi**. Kontrol saran berada sebelum teks pelajaran yang panjang.
Kartu bertumpuk saat ruang sempit dan menjadi kolom sejajar jika lebar panel mencukupi;
strategi dasar tetap bisa dibuka/tutup dengan sentuhan atau keyboard. Teks utama minimal
16px dan mengikuti pembesaran browser, tanpa batas tinggi yang memotong pelajaran.
Pada layar kecil, navigasi **Pelatih catur** langsung menuju pelatih. Setelah meminta
saran, gunakan **Kembali ke papan** untuk mencoba petak yang ditandai biru.
Pergantian orientasi tidak menghapus saran atau mengubah posisi permainan.

Validasi otomatis mencakup viewport 280x653, 320x568, 390x844, 844x390,
768x1024, 1024x768, dan 1440x900 pada Chromium, Firefox, serta WebKit.
Tes memeriksa geometri 64 petak, ukuran buah, kontrol sentuh, seluruh aksi pop-up,
pergantian orientasi, gulir keyboard, dan teks 200% pada desktop. Pengujian Mode Belajar
juga memeriksa tips, saran yang dapat dicoba, umpan balik langkah untuk kedua warna,
strategi dasar, dan penonaktifan mode tanpa mengubah aturan saran yang sudah ada.
Ini adalah simulasi viewport/input sentuh di Windows, bukan sertifikasi setiap perangkat
Android/iPhone/tablet atau browser lama. Target kompatibilitas adalah browser modern
dengan Web Worker, WebAssembly, CSS Grid, dan elemen dialog.

## Validasi otomatis

```powershell
npm test
npx playwright install chromium firefox webkit
npm run test:e2e
npm run build
```

Hasil yang diharapkan:

- Tes unit mencakup validasi langkah, skak/skakmat/pat, rokade, en passant, promosi, remis, serta pemetaan kehilangan centipawn ke tingkat kesulitan.
- Tes browser membuktikan Worker/WASM dapat dimuat, komputer mengirim langkah legal, permainan baru meminta konfirmasi, dan alur selesai/remis mencegah langkah berikutnya.
- Tes viewport ponsel dan desktop memastikan papan/aksi terlihat tanpa gulir mendatar.
- Suite responsif dijalankan pada tiga mesin browser; tes fitur lainnya tetap menggunakan Chromium.
- Build produksi selesai dan menyertakan pasangan aset mesin `lite-single` yang digunakan serta pemberitahuan lisensi di `dist/engine/`. Pendistribusian aplikasi tetap harus memenuhi ketentuan GPL-3.0, termasuk ketersediaan kode sumber yang sesuai.

Pengukuran browser menggunakan Worker Stockfish lokal dan lima langkah awal berbeda. Pada setiap
viewport, tes memeriksa 10 langkah Putih dan 10 balasan Hitam, dengan batas minimal 19 dari 20
pembaruan papan dan giliran dalam satu detik. Waktu balasan Hitam diukur sejak pesan `bestmove`
diterima, tidak termasuk waktu pencarian komputer. Pada pengujian terakhir, kedua viewport mencapai
20 dari 20.

## Validasi usability manual

- Minta 10 pengguna baru mencoba memulai permainan dan melakukan satu langkah Putih; hitung percobaan sebagai berhasil jika komputer membalas dengan langkah legal sebelum satu menit. Kriteria lulus: sedikitnya 9 dari 10 berhasil tanpa bantuan.
- Minta 20 pengguna mencoba memulai permainan baru ketika pertandingan aktif. Sebelum mereka memilih, minta mereka menjelaskan dampak konfirmasi; setelah memilih batal, cocokkan FEN, giliran, dan riwayat adaptasi sebelum/sesudah. Kriteria lulus: sedikitnya 19 dari 20 memahami konfirmasi dan permainan tetap utuh setelah dibatalkan.

Pengujian dengan peserta manusia belum dilakukan; hasil dan ambang usability tersebut belum terverifikasi.

Lihat [model data](./data-model.md) dan [kontrak antarmuka](./contracts/user-interface.md) untuk keadaan serta hasil yang harus diperiksa.
