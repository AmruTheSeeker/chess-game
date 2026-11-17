# Research: Aplikasi Permainan Catur

**Date**: 2026-11-13

## Decision: Aplikasi web sisi-klien responsif

- **Decision**: Satu aplikasi React + TypeScript yang dibangun dengan Vite; permainan dan engine berjalan pada perangkat pemain, tanpa backend.
- **Rationale**: Memenuhi sasaran ponsel dan komputer/laptop serta cakupan satu pemain melawan komputer. Tidak ada akun, permainan daring, atau penyimpanan lintas sesi yang memerlukan layanan.
- **Alternatives considered**: Aplikasi native terpisah untuk ponsel dan komputer ditolak karena menambah proyek dan distribusi yang tidak diperlukan untuk permainan lokal.

## Decision: Versi toolchain mengikuti instalasi pengguna

- **Decision**: Node.js **20.10.0**, npm **10.2.3**, Vite **6.4.6**, `@vitejs/plugin-react` **4.7.0**, React **19.3.1**, TypeScript **5.9.3**.
- **Rationale**: Metadata registry untuk Vite 6.4.6 menyatakan `engines.node` mencakup `^20.0.0`; plugin React 4.7.0 menerima Vite 6. Keduanya kompatibel dengan Node 20.10.0. Node dan npm yang terpasang diverifikasi langsung sebagai `v20.10.0` dan `10.2.3`.
- **Alternatives considered**: Vite 7+ dan plugin React 5+ ditolak karena mensyaratkan Node 20.19.0 atau lebih baru. Versi `latest` tidak dipakai tanpa pin karena dapat menaikkan kebutuhan runtime.
- **Source**: [Vite 6.4.6 registry metadata](https://registry.npmjs.org/vite/6.4.6), [Vite 7 registry metadata](https://registry.npmjs.org/vite/7.0.0), [plugin-react 4.7.0 registry metadata](https://registry.npmjs.org/@vitejs%2fplugin-react/4.7.0), [React 19.3.1 registry metadata](https://registry.npmjs.org/react/19.3.1), [TypeScript 5.9.3 registry metadata](https://registry.npmjs.org/typescript/5.9.3), [Vite guide](https://vite.dev/guide/).

## Decision: `chess.js` sebagai sumber kebenaran aturan

- **Decision**: Gunakan `chess.js` **1.4.0** untuk posisi, langkah legal, status skak/skakmat/pat, promosi, dan kondisi remis.
- **Rationale**: Library ini khusus untuk validasi dan aturan catur, memiliki tipe TypeScript, serta lisensi BSD-2-Clause. Semua input pemain dan keluaran engine diverifikasi melalui instance permainan yang sama.
- **Alternatives considered**: `js-chess-engine` 1.0.3 berlisensi MIT mendukung browser tetapi API publiknya tidak menyediakan skor kualitas langkah; seri 2.x mensyaratkan Node 24, dan dukungan kondisi remis yang diperlukan belum terkonfirmasi. Menggunakannya akan memerlukan penilaian langkah dan aturan remis tambahan.
- **Source**: [chess.js repository and documentation](https://github.com/jhlywa/chess.js), [chess.js 1.4.0 registry metadata](https://registry.npmjs.org/chess.js/1.4.0), [js-chess-engine registry metadata](https://registry.npmjs.org/js-chess-engine).

## Decision: Stockfish.js lite single-threaded untuk lawan dan evaluasi

- **Decision**: Gunakan Stockfish.js **19.0.1**, build `lite-single`, pada satu Web Worker. Kirim posisi melalui FEN/UCI; gunakan evaluasi engine untuk mengukur kehilangan centipawn langkah pemain dan `Skill Level` (0–20) untuk mengatur tantangan.
- **Rationale**: Engine berjalan di browser dengan WebAssembly dan antarmuka UCI melalui pesan Worker. Build single-threaded tidak memerlukan `SharedArrayBuffer` atau header isolasi lintas-origin. Pasangan JS/WASM lite sekitar 1.7 MB, jauh lebih kecil daripada build penuh.
- **Alternatives considered**: Build multi-threaded ditolak karena memerlukan `COOP`/`COEP`; build penuh ditolak karena ukuran unduhan jauh lebih besar. `js-chess-engine` v1 tidak menyediakan skor langkah melalui API publik.
- **Tradeoff**: Paket npm Stockfish.js mencakup beberapa build dan berukuran sekitar 205 MB setelah diekstrak, walaupun aplikasi hanya menyajikan pasangan lite. Lisensi engine adalah GPL-3.0; kewajiban pemberitahuan dan sumber harus dipenuhi sebelum distribusi.
- **Source**: [Stockfish.js README and engine flavors](https://github.com/nmrugg/stockfish.js#readme), [Stockfish.js package metadata](https://registry.npmjs.org/stockfish/19.0.1), [Stockfish engine UCI options](https://github.com/official-stockfish/Stockfish/blob/master/src/engine.cpp).

## Decision: Adaptasi berdasarkan kehilangan centipawn yang diratakan

- **Decision**: Dalam mode adaptif, catat skor kualitas lima langkah pemain terakhir. Mulai dari `Skill Level` 10; naikkan satu tingkat jika rata-rata kehilangan ≤50 centipawn, turunkan satu tingkat jika ≥200 centipawn, dan pertahankan tingkat di antara ambang. Batasi nilai 0–20.
- **Rationale**: Nilai satu langkah dapat berfluktuasi karena taktik; jendela lima langkah dan rentang netral mengurangi perubahan tingkat yang mendadak. Logika pemetaan dibuat sebagai fungsi murni agar ambang dan batas dapat diuji tanpa menjalankan engine.
- **Alternatives considered**: Semula tingkat tetap ditolak untuk memenuhi keputusan adaptasi. Permintaan lanjutan menambahkan pilihan tetap mudah, sedang, dan sulit tanpa menghapus mode adaptif; menyimpan hasil antarpertandingan tetap tidak diperlukan.
- **Source**: Opsi `Skill Level` dan skor UCI pada [Stockfish engine source](https://github.com/official-stockfish/Stockfish/blob/master/src/engine.cpp). Nilai awal ambang adalah keputusan desain yang perlu dikalibrasi dari pengujian, bukan nilai resmi Stockfish.

## Decision: Pengujian Vite-native dan end-to-end

- **Decision**: Gunakan Vitest **3.2.7** dengan jsdom **26.1.0** dan React Testing Library **16.3.3** untuk unit/komponen; Playwright **1.65.0** untuk alur browser dan viewport. Pemasangan Vitest 4.1.12 gagal pada npm 10.2.3 dengan kesalahan resolusi peer dependency.
- **Rationale**: Versi terpilih memenuhi Node 20.10.0; Vitest memakai konfigurasi Vite dan Playwright menguji Worker, WASM, serta tata letak ponsel/desktop pada browser sebenarnya.
- **Alternatives considered**: Jest ditolak karena menambah konfigurasi terpisah untuk proyek Vite.
- **Source**: [Vitest 4.1.12 registry metadata](https://registry.npmjs.org/vitest/4.1.12), [Vitest guide](https://vitest.dev/guide/), [React Testing Library 16.3.3 registry metadata](https://registry.npmjs.org/@testing-library%2freact/16.3.3), [jsdom 26.1.0 registry metadata](https://registry.npmjs.org/jsdom/26.1.0), [Playwright 1.65.0 registry metadata](https://registry.npmjs.org/@playwright%2ftest/1.65.0), [Playwright docs](https://playwright.dev/docs/intro).
