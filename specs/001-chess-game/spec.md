# Feature Specification: Aplikasi Permainan Catur

**Feature Branch**: `001-chess-game`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "bikinkan aplikasi permainan catur"

## Clarifications

### Session 2026-11-13

- Q: Apakah pemain akan bertanding hanya dengan pemain lain di perangkat yang sama, melawan komputer, atau keduanya? → A: Satu pemain melawan komputer.
- Q: Bagaimana pemain sebaiknya memilih tingkat kesulitan lawan komputer? → A: Kesulitan menyesuaikan diri otomatis selama bermain.
- Q: Apa yang sebaiknya menjadi dasar komputer menyesuaikan kekuatannya di tengah pertandingan? → A: Kualitas beberapa langkah terakhir pemain dalam pertandingan ini.
- Q: Di perangkat apa pemain seharusnya dapat memainkan aplikasi catur ini? → A: Ponsel dan komputer atau laptop.
- Permintaan lanjutan: pemain dapat memilih warna dan level saat memulai. Putih dan mode adaptif
  tetap menjadi pilihan awal; tersedia pula level tetap mudah, sedang, dan sulit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Memulai dan memainkan pertandingan melawan komputer (Priority: P1)

Pemain memainkan catur melawan komputer dari posisi awal standar. Aplikasi menunjukkan giliran, langkah yang sah, dan keadaan papan setelah setiap langkah.

**Why this priority**: Bermain melawan komputer adalah nilai utama aplikasi dan tidak memerlukan lawan lain.

**Independent Test**: Mulai pertandingan baru, lakukan langkah legal sebagai pemain, dan pastikan komputer membalas dengan langkah legal serta papan dan indikator giliran berubah dengan benar.

**Acceptance Scenarios**:

1. **Given** aplikasi dibuka tanpa pertandingan aktif dan pilihan bawaan digunakan, **When** pemain memulai permainan, **Then** papan posisi awal ditampilkan, pemain bermain sebagai Putih, dan giliran Putih ditandai.
2. **Given** giliran pemain, **When** pemain memilih langkah yang sah, **Then** langkah diterapkan dan komputer membalas dengan langkah sah sebelum giliran pemain berikutnya.
3. **Given** sebuah buah catur pemain dipilih, **When** pemain memilih petak tujuan yang tidak sah, **Then** posisi papan dan giliran tidak berubah.
4. **Given** Raja pemain sedang terancam, **When** pemain mencoba langkah yang tidak menghilangkan ancaman terhadap Rajanya, **Then** langkah ditolak.
5. **Given** pion pemain mencapai baris terakhir, **When** pemain memilih promosi, **Then** pion diganti dengan buah pilihan pemain dan permainan berlanjut sesuai aturan.
6. **Given** pertandingan dalam mode adaptif, **When** kualitas beberapa langkah terakhir pemain meningkat atau menurun, **Then** komputer meningkatkan atau mengurangi tantangan secara otomatis.
7. **Given** pemain menggunakan ponsel atau komputer, **When** pemain melihat papan dan melakukan langkah, **Then** papan dan kendali permainan tetap dapat digunakan tanpa menggulir halaman secara mendatar.
8. **Given** pemain memilih Hitam, **When** pertandingan dimulai, **Then** komputer bergerak pertama sebagai Putih dan papan ditampilkan dari sisi Hitam.
9. **Given** pemain memilih level tetap, **When** pertandingan dimulai, **Then** komputer menggunakan level tersebut selama pertandingan.

### User Story 2 - Menyelesaikan pertandingan dan mengetahui hasilnya (Priority: P1)

Pemain dapat melihat kapan pertandingan melawan komputer berakhir dan memahami hasilnya, termasuk skakmat atau remis.

**Why this priority**: Hasil yang benar diperlukan agar permainan dapat diselesaikan tanpa wasit.

**Independent Test**: Jalankan posisi uji yang berakhir dengan skakmat, pat, atau kondisi remis yang didukung, lalu pastikan hasil dan status akhir ditampilkan serta komputer tidak melanjutkan langkah.

**Acceptance Scenarios**:

1. **Given** Raja pemain sedang skak dan tidak ada langkah sah, **When** posisi tersebut tercapai, **Then** permainan dinyatakan skakmat dan pemenang ditampilkan.
2. **Given** pemain tidak sedang skak tetapi tidak memiliki langkah sah, **When** posisi tersebut tercapai, **Then** permainan dinyatakan remis karena pat.
3. **Given** materi yang tersisa tidak memungkinkan skakmat menurut aturan, **When** posisi tersebut tercapai, **Then** permainan berakhir remis.
4. **Given** posisi yang sama telah terjadi tiga kali atau aturan lima puluh langkah terpenuhi, **When** pemain yang berhak mengklaim remis melakukannya, **Then** permainan berakhir remis.
5. **Given** permainan telah berakhir, **When** pemain mencoba melakukan langkah, **Then** posisi dan hasil akhir tetap tidak berubah.

### User Story 3 - Memulai pertandingan baru (Priority: P2)

Pemain dapat memulai pertandingan baru melawan komputer setelah pertandingan selesai atau ketika ingin bermain lagi.

**Why this priority**: Memungkinkan permainan berulang tanpa harus memuat ulang aplikasi.

**Independent Test**: Selesaikan atau tinggalkan satu permainan, pilih permainan baru, dan pastikan papan kembali ke posisi awal dengan Putih mendapat giliran.

**Acceptance Scenarios**:

1. **Given** tidak ada permainan yang sedang berlangsung, **When** pemain memilih permainan baru, **Then** pertandingan baru dimulai dari posisi standar.
2. **Given** permainan sedang berlangsung, **When** pemain meminta permainan baru, **Then** aplikasi meminta konfirmasi sebelum menghapus permainan saat ini.
3. **Given** pemain membatalkan konfirmasi permainan baru, **When** kembali ke papan, **Then** permainan sebelumnya tetap utuh.

### Edge Cases

- Langkah yang membuat atau membiarkan Raja sendiri dalam keadaan skak harus ditolak.
- Rokade tidak tersedia jika Raja atau Benteng terkait pernah bergerak, Raja sedang skak, atau jalur geraknya terancam atau terhalang.
- En passant hanya dapat dilakukan segera setelah lawan melakukan langkah pion dua petak yang memenuhi syarat.
- Promosi pion harus meminta pilihan buah dan tidak boleh meninggalkan pion di baris terakhir.
- Aplikasi harus membedakan pat dari skakmat ketika pemain tidak memiliki langkah sah.
- Langkah berulang, klik tujuan tanpa memilih buah, atau interaksi setelah pertandingan berakhir tidak boleh mengubah posisi secara tidak sah.
- Permintaan memulai ulang saat permainan berlangsung tidak boleh menghapus posisi tanpa konfirmasi.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Aplikasi MUST memungkinkan satu pemain bermain melawan komputer tanpa membuat akun.
- **FR-002**: Aplikasi MUST memulai permainan dari posisi awal standar dengan Putih bergerak terlebih dahulu.
- **FR-003**: Aplikasi MUST menampilkan papan, buah catur, giliran pemain atau komputer, dan langkah terakhir.
- **FR-004**: Aplikasi MUST menerima hanya langkah legal sesuai aturan catur standar, termasuk gerak setiap buah, skak, perlindungan Raja, rokade, en passant, dan promosi pion.
- **FR-005**: Aplikasi MUST membiarkan pemain memilih buah promosi pion dari pilihan yang sah.
- **FR-006**: Aplikasi MUST mendeteksi skak, skakmat, dan pat serta menampilkan status permainan dan pemenang atau hasil remis yang sesuai.
- **FR-007**: Aplikasi MUST mengakhiri permainan sebagai remis ketika materi tidak mencukupi untuk skakmat, serta mengizinkan pemain yang berhak mengklaim remis setelah pengulangan posisi tiga kali atau terpenuhinya aturan lima puluh langkah.
- **FR-008**: Aplikasi MUST mencegah langkah setelah permainan selesai.
- **FR-009**: Aplikasi MUST memungkinkan pemain memulai permainan baru dan meminta konfirmasi jika permainan masih berlangsung.
- **FR-010**: Aplikasi MUST mempertahankan posisi dan giliran tanpa perubahan ketika pemain membatalkan langkah yang tidak sah atau membatalkan permintaan permainan baru.
- **FR-011**: Aplikasi MUST membuat komputer membalas setiap langkah sah pemain dengan satu langkah legal, kecuali permainan sudah berakhir.
- **FR-012**: Dalam mode adaptif, aplikasi MUST menyesuaikan kekuatan komputer secara otomatis berdasarkan kualitas beberapa langkah terakhir pemain: meningkatkan tantangan setelah permainan kuat dan menguranginya setelah permainan lemah.
- **FR-013**: Aplikasi MUST memungkinkan pemain melihat papan dan melakukan langkah pada ponsel maupun komputer atau laptop tanpa kehilangan akses ke kendali permainan.
- **FR-014**: Aplikasi MUST memungkinkan pemain memilih Putih atau Hitam; Putih selalu bergerak pertama dan papan ditampilkan dari sisi pemain.
- **FR-015**: Aplikasi MUST menyediakan pilihan level adaptif, mudah, sedang, dan sulit sebelum permainan dimulai; pilihan level tetap berlaku sepanjang pertandingan.

### Key Entities

- **Pertandingan**: Permainan antara Putih dan Hitam, termasuk status aktif atau selesai serta hasilnya.
- **Posisi**: Susunan buah pada papan dan pemain yang mendapat giliran.
- **Langkah**: Perubahan posisi oleh pemain, termasuk langkah terakhir, promosi, rokade, atau en passant.
- **Pemain**: Orang yang memilih Putih atau Hitam dan melakukan langkah saat gilirannya.
- **Komputer**: Lawan otomatis yang memainkan warna lainnya dan melakukan langkah legal saat gilirannya.
- **Tingkat kesulitan**: Mode adaptif berdasarkan kinerja pemain atau level tetap yang dipilih.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dalam seluruh 100 skenario uji aturan yang mencakup langkah legal dan tidak legal, aplikasi menerima dan menolak langkah sesuai aturan catur standar.
- **SC-002**: Sedikitnya 90% pengguna baru dapat memulai permainan dan melakukan satu langkah legal untuk kedua sisi dalam waktu satu menit tanpa bantuan.
- **SC-003**: Setelah langkah sah, pengguna melihat posisi papan dan indikator giliran yang diperbarui dalam satu detik pada sedikitnya 95% percobaan.
- **SC-004**: Seluruh skenario uji skakmat, pat, dan kondisi remis yang didukung berakhir dengan status dan hasil yang benar.
- **SC-005**: Dalam sedikitnya 95% pengujian permainan baru saat pertandingan berlangsung, pemain dapat memahami bahwa konfirmasi diperlukan dan pertandingan lama tetap utuh jika dibatalkan.
- **SC-006**: Dalam seluruh 100 skenario uji adaptasi yang mencakup rangkaian permainan kuat dan lemah, kekuatan komputer meningkat atau menurun sesuai kualitas langkah pemain.
- **SC-007**: Pada ponsel maupun komputer atau laptop, pengguna dapat melihat seluruh papan dan menggunakan kendali permainan tanpa menggulir halaman secara mendatar.

## Assumptions

- Versi awal ditujukan untuk satu pemain yang bermain melawan komputer pada satu perangkat.
- Permainan dapat digunakan pada ponsel maupun komputer atau laptop.
- Pemain memilih warna; Putih adalah pilihan awal dan komputer memainkan warna lainnya.
- Mode adaptif adalah pilihan awal; pemain juga dapat memilih level tetap.
- Aplikasi mengikuti aturan catur standar dan tidak menyediakan permainan daring, akun, jam catur dengan batas waktu, atau penyimpanan permainan lintas sesi.
- Klaim remis karena pengulangan posisi tiga kali atau aturan lima puluh langkah tersedia ketika syarat aturan terpenuhi.
- Bahasa antarmuka awal mengikuti bahasa yang digunakan pengguna, yaitu Bahasa Indonesia.
