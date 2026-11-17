# Kontrak Worker Stockfish

Worker lokal menjalankan Stockfish.js 19.0.1 `lite-single` dan berkomunikasi menggunakan UCI melalui pesan browser. Aset JavaScript dan WASM harus berada berdampingan di `public/engine/`.

## Urutan awal

1. Buat Worker lokal dari `stockfish-19-lite-single.js`.
2. Kirim `uci`; tunggu `uciok`.
3. Kirim `isready`; tunggu `readyok`.
4. Atur `Skill Level` ke bilangan 0–20 sebelum pencarian langkah komputer.

## Pencarian dan evaluasi

- Kirim posisi saat ini sebagai `position fen <FEN>`.
- Gunakan pencarian berbatas waktu agar pemikiran engine tidak memblokir UI.
- Untuk langkah komputer, kirim perintah pencarian dan tunggu `bestmove`.
- Dalam mode adaptif, nilai langkah pemain dari skor UCI `info score cp` sebelum dan sesudah langkah. Skor sebelum dari sisi pemain dan skor sesudah dari sisi lawan; normalisasikan perspektif sebelum menghitung kehilangan centipawn dan batasi skor mate.
- Pada level tetap gunakan `Skill Level` 3, 10, atau 18 untuk mudah, sedang, atau sulit tanpa mengubahnya berdasarkan kualitas langkah.
- Abaikan keluaran `info` yang lama setelah pencarian dihentikan atau posisi baru dimulai.

## Validasi dan kegagalan

- Parsing `bestmove` tidak mengubah papan. UI memvalidasinya melalui `chess.js`; hanya langkah legal yang dapat diterapkan.
- Jika Worker tidak mengirim `uciok`, `readyok`, atau `bestmove` dalam batas waktu, hentikan pencarian dan pindahkan UI ke keadaan engine gagal.
- Jangan mengirim langkah baru saat engine berpikir. Setelah kegagalan, papan terakhir harus tetap utuh.
- Worker bersifat single-threaded; tidak mensyaratkan `SharedArrayBuffer`, `COOP`, atau `COEP`.
