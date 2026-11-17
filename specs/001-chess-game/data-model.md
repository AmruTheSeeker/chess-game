# Data Model: Aplikasi Permainan Catur

Seluruh data pertandingan hidup di memori selama sesi aplikasi. Tidak ada akun, penyimpanan pertandingan, atau sinkronisasi.

## Game

Satu pertandingan aktif antara pemain dan komputer.

| Field | Bentuk | Aturan |
|---|---|---|
| `status` | idle, active, finished, engine-error | Hanya `active` menerima langkah pemain |
| `result` | putih-menang, hitam-menang, remis, kosong | Diisi saat pertandingan selesai |
| `resultReason` | skakmat, pat, materi-tidak-cukup, pengulangan, lima-puluh-langkah, kosong | Wajib untuk hasil akhir |
| `position` | Position | Satu posisi terkini |
| `moves` | Move[] | Urutan langkah sejak posisi awal |
| `adaptiveDifficulty` | AdaptiveDifficulty | Riwayat kualitas dan kekuatan engine saat ini |
| `playerColor` | putih atau hitam | Dipilih sebelum pertandingan; putih adalah pilihan awal |
| `difficultyMode` | adaptif, mudah, sedang, sulit | Dipilih sebelum pertandingan; adaptif adalah pilihan awal |

Komputer memainkan warna selain yang dipilih pemain; Putih selalu bergerak pertama. Memulai permainan baru membuat posisi awal dan adaptasi baru. Jika permainan aktif, reset memerlukan konfirmasi.

## Position

Posisi catur yang dikelola oleh `chess.js`, bukan salinan aturan buatan UI.

| Field | Bentuk | Aturan |
|---|---|---|
| `fen` | string | Representasi posisi terkini, termasuk giliran dan hak khusus |
| `sideToMove` | putih atau hitam | Harus cocok dengan giliran yang dikelola aturan |
| `checkStatus` | tidak-skak atau skak | Ditentukan dari posisi |
| `legalMoves` | Move[] | Langkah yang sah untuk sisi yang mendapat giliran |

Posisi tetap tidak berubah ketika gerakan tidak sah ditolak. Status skakmat, pat, materi tidak cukup, pengulangan tiga kali, dan aturan lima puluh langkah ditentukan sesuai aturan catur dan klaim remis yang tersedia.

## Move

Langkah sah yang dilakukan pemain atau komputer.

| Field | Bentuk | Aturan |
|---|---|---|
| `color` | putih atau hitam | Menentukan pelaku |
| `from`, `to` | petak catur | Harus sesuai langkah legal pada posisi sebelum langkah |
| `piece`, `captured` | jenis buah atau kosong | Berasal dari hasil validasi aturan |
| `promotion` | ratu, benteng, gajah, kuda, kosong | Wajib ketika pion dipromosikan |
| `notation` | notasi SAN | Untuk penanda langkah terakhir dan riwayat |
| `fenBefore`, `fenAfter` | string | Snapshot untuk evaluasi dan diagnosis |
| `centipawnLoss` | angka atau kosong | Hanya langkah pemain dalam mode adaptif; skor evaluasi sebelum dan sesudah langkah |

Langkah dari engine tidak diterapkan sebelum lolos validasi `chess.js`. Langkah dari pemain yang ditolak tidak menambah riwayat atau mengubah giliran.

## AdaptiveDifficulty

Status sementara untuk menyesuaikan tantangan komputer di satu pertandingan.

| Field | Bentuk | Aturan |
|---|---|---|
| `skillLevel` | integer 0–20 | Mulai dari 10; dipakai untuk langkah komputer berikutnya |
| `recentMoveLosses` | angka[] | Maksimum lima kehilangan centipawn terakhir dari langkah pemain |
| `averageLoss` | angka | Rata-rata jendela saat ini; belum tersedia sebelum ada evaluasi |
| `engineState` | loading, ready, thinking, error | Menentukan apakah langkah komputer dapat diminta |

Evaluasi tanpa nilai materi-mate dibatasi agar satu skor mate tidak mendominasi rata-rata. Setelah jendela terisi, rata-rata ≤50 cp menaikkan skill satu tingkat; ≥200 cp menurunkannya; nilai di antaranya tidak mengubah skill. Level tidak pernah melewati 0–20.

## Hubungan dan transisi status

- `Game` memiliki satu `Position`, urutan `Move`, dan satu `AdaptiveDifficulty`.
- `Game` mengalir dari `idle` ke `active`, lalu bergantian antara giliran pemain dan komputer.
- Langkah pemain yang sah memperbarui posisi dan, dalam mode adaptif, kualitas langkah; kemudian komputer mengirim satu langkah legal. Jika pemain memilih Hitam, komputer membuka sebagai Putih.
- Skakmat atau remis memindahkan permainan ke `finished`; tidak ada langkah berikutnya yang diterima.
- Kegagalan engine memindahkan permainan ke `engine-error`; papan terakhir dipertahankan dan UI memberi pilihan untuk mencoba ulang atau memulai permainan baru.
