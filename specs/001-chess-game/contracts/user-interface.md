# Kontrak Antarmuka Pengguna

## Sasaran

Antarmuka Bahasa Indonesia yang dapat digunakan pada ponsel dan komputer/laptop. Seluruh papan harus terlihat dan kendali permainan tetap dapat diakses tanpa gulir halaman mendatar.

## Keadaan layar

| Keadaan | Tampilan dan perilaku |
|---|---|
| Belum bermain | Papan awal, pilihan warna dan level, serta aksi untuk memulai pertandingan |
| Giliran pemain | Papan dari sisi warna pemain, giliran pemain, langkah terakhir, dan aksi klaim remis jika tersedia |
| Promosi | Pilihan ratu, benteng, gajah, atau kuda; langkah belum selesai sampai pilihan dibuat |
| Komputer berpikir | Langkah pemain sudah ditampilkan; status “Komputer berpikir”; input langkah baru dinonaktifkan |
| Selesai | Hasil skakmat atau remis; tidak menerima langkah baru; sediakan aksi permainan baru |
| Konfirmasi permainan baru | Minta konfirmasi saat pertandingan aktif; membatalkan mempertahankan papan dan riwayat |
| Engine gagal | Jelaskan bahwa komputer tidak dapat bergerak; pertahankan papan dan sediakan coba ulang atau permainan baru |

## Interaksi dan keluaran

- Pemain memilih warna dan level sebelum pertandingan; Putih dan adaptif adalah pilihan awal. Perubahan selama pertandingan berlaku untuk permainan berikutnya.
- Pemain memilih buah dengan warna pilihannya dan petak tujuan; hanya langkah legal yang diterapkan.
- Langkah Stockfish untuk warna lawan divalidasi kembali sebelum diterapkan. Komputer bergerak pertama jika pemain memilih Hitam.
- Aplikasi menunjukkan giliran, langkah terakhir, skak, hasil akhir, dan klaim remis yang tersedia.
- Catatan langkah menampilkan warna, jenis buah, petak asal dan tujuan untuk kedua sisi, dengan langkah terbaru di atas. Papan menandai asal dan tujuan langkah terakhir; permainan baru menghapus catatan.
- Memulai permainan baru saat pertandingan aktif selalu meminta konfirmasi.
- Papan dan aksi dapat digunakan dengan input sentuh maupun penunjuk pada ukuran ponsel dan desktop.

## Tidak disediakan

Tidak ada endpoint publik, akun, mode daring, penyimpanan permainan lintas sesi, atau integrasi server. Kontrak engine internal didokumentasikan di [engine-worker.md](./engine-worker.md).
