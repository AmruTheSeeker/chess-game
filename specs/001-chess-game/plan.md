# Implementation Plan: Aplikasi Permainan Catur

**Branch**: `001-chess-game` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-chess-game/spec.md`

## Summary

Bangun aplikasi web responsif yang berjalan sepenuhnya di browser, tanpa akun, server permainan, atau penyimpanan lintas sesi. React dan TypeScript mengelola antarmuka; `chess.js` menjadi sumber kebenaran untuk posisi dan aturan; Stockfish WASM memainkan warna lawan melalui Web Worker. Pemain memilih warna dan mode adaptif atau level tetap; mode adaptif menilai kualitas langkah pemain.

## Technical Context

**Language/Version**: TypeScript 5.9.3; Node.js 20.10.0; npm 10.2.3  
**Primary Dependencies**: React 19.3.1, Vite 6.4.6, `@vitejs/plugin-react` 4.7.0, `chess.js` 1.4.0, Stockfish.js 19.0.1 (`lite-single`)  
**Storage**: Tidak ada; posisi, riwayat singkat, dan status adaptasi hanya disimpan selama sesi aktif  
**Testing**: Vitest 3.2.7, jsdom 26.1.0, React Testing Library 16.3.3, Playwright 1.65.0  
**Target Platform**: Peramban modern pada ponsel dan komputer/laptop; aplikasi web statis  
**Project Type**: Aplikasi web sisi-klien  
**Performance Goals**: Memenuhi SC-003 (pembaruan papan dalam 1 detik pada 95% langkah) dan SC-007 (papan serta kendali dapat digunakan tanpa gulir mendatar); pencarian komputer berlangsung asinkron di Worker  
**Constraints**: Node dan npm dikunci ke versi terpasang pengguna; tidak memakai fitur WASM multi-thread yang memerlukan isolasi lintas-origin; aset engine lite harus disajikan dari origin aplikasi; catat dan penuhi lisensi GPL-3.0 Stockfish sebelum distribusi  
**Scale/Scope**: Satu pemain, satu pertandingan lokal aktif per sesi, tanpa layanan jaringan, akun, atau penyimpanan pertandingan

## Constitution Check

Konstitusi proyek menetapkan aturan permainan, pengalaman pemain, privasi, keandalan engine, dan validasi. Versi 2.0.0 mengizinkan level tetap selain mode adaptif sesuai permintaan lanjutan.

**Pre-design gate**: PASS — rancangan membatasi sistem pada satu aplikasi sisi-klien dan mempertahankan mode adaptif sebagai pilihan awal.

## Project Structure

### Documentation (this feature)

```text
specs/001-chess-game/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── engine-worker.md
│   └── user-interface.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
├── components/
├── game/
│   ├── game-state.ts
│   └── adaptive-difficulty.ts
├── engine/
│   └── stockfish-client.ts
└── styles/
public/
└── engine/
    ├── stockfish-19-lite-single.js
    └── stockfish-19-lite-single.wasm
tests/
├── unit/
├── components/
└── e2e/
```

**Structure Decision**: Repositori belum memiliki source code aplikasi. Gunakan satu proyek web dengan pemisahan antarmuka, aturan permainan/adaptasi, dan komunikasi engine. Worker dan pasangan aset Stockfish disajikan lokal agar tidak membutuhkan API atau layanan engine eksternal.

## Design Decisions

- Tetapkan `engines.node` ke `20.10.0`, `packageManager` ke `npm@10.2.3`, dan aktifkan `engine-strict` agar dependency baru yang tidak kompatibel gagal saat instalasi, bukan saat build.
- Gunakan Vite 6.4.6 dan plugin React 4.7.0. Vite 6 mendukung Node 20.0 ke atas; Vite 7 dan setelahnya memerlukan Node 20.19 atau lebih baru.
- Jalankan engine pada satu Worker agar pencarian tidak membekukan interaksi papan. Validasi setiap langkah engine kembali melalui `chess.js` sebelum mengubah posisi.
- Salin hanya pasangan `lite-single` dari paket Stockfish ke `public/engine/` melalui skrip build/setup yang dipin ke versi 19.0.1; jangan masukkan build engine lain ke keluaran produksi.
- Pada mode adaptif, awali `Skill Level` Stockfish pada 10 dari rentang 0–20. Nilai kualitas langkah pemain dengan kehilangan centipawn dari posisi sebelum dan sesudah langkahnya, simpan lima nilai terakhir, lalu naikkan satu tingkat bila rata-ratanya ≤50 cp atau turunkan satu tingkat bila ≥200 cp. Di rentang tengah, pertahankan tingkat; batasi pada 0–20. Ambang ini adalah nilai awal yang dapat dituning, bukan kontrak pengguna.
- Sediakan pilihan tetap mudah (3), sedang (10), dan sulit (18). Pengaturan warna dan level yang diubah saat pertandingan berlangsung berlaku pada permainan baru berikutnya.
- Jangan menambahkan backend, akun, penyimpanan, mode daring, atau service worker karena tidak diminta oleh spesifikasi.

## Constitution Check (Post-design)

**Post-design gate**: PASS — desain tetap satu proyek sisi-klien dan tidak memperkenalkan layanan, data persisten, atau kompleksitas lintas-proyek. Ketergantungan tambahan memiliki peran terpisah: `chess.js` menjaga aturan, sedangkan Stockfish menyediakan lawan dan evaluasi.

**Catatan distribusi**: Stockfish.js berlisensi GPL-3.0. Sebelum aplikasi dibagikan, sertakan pemberitahuan/lisensi serta sumber yang diwajibkan lisensi; tinjau kompatibilitas lisensi proyek saat keputusan distribusi dibuat.
