import { Chess, type Color, type Piece, type PieceSymbol, type Square } from 'chess.js';
import type { GameState, MoveInput, ResultReason } from './game-state';

const names: Record<PieceSymbol, string> = { k: 'raja', q: 'ratu', r: 'benteng', b: 'gajah', n: 'kuda', p: 'pion' };
const center = ['d4', 'e4', 'd5', 'e5'];

export const resultExplanations: Record<ResultReason, string> = {
  skakmat: 'Skakmat: raja diserang dan tidak ada langkah legal untuk menyelamatkannya.',
  pat: 'Pat: pihak yang mendapat giliran tidak punya langkah legal, tetapi rajanya tidak sedang skak.',
  'materi-tidak-cukup': 'Remis karena materi yang tersisa tidak cukup untuk menghasilkan skakmat.',
  pengulangan: 'Remis diklaim karena posisi yang sama, dengan giliran dan hak langkah yang sama, berulang tiga kali.',
  'lima-puluh-langkah': 'Remis diklaim setelah lima puluh langkah tiap pihak tanpa tangkapan atau langkah pion.',
};

export type ReviewLesson = { title: string; text: string };

export function reviewGame(game: GameState, color: Color): ReviewLesson[] {
  if (!game.result) throw new Error('Pelajaran akhir hanya tersedia setelah pertandingan selesai.');
  const moves = game.chess.history({ verbose: true });
  const own = moves.filter(move => move.color === color);
  const label = (move: (typeof moves)[number]) =>
    `${new Chess(move.before).moveNumber()}${move.color === 'w' ? '.' : '...'} ${move.san}`;
  const lessons: ReviewLesson[] = [];
  const last = moves.at(-1);
  lessons.push({
    title: 'Mengapa pertandingan berakhir?',
    text: `${resultExplanations[game.result.reason]}${last ? ` Langkah terakhir: ${label(last)} (${last.color === color ? 'Anda' : 'komputer'}).` : ''} ${
      game.result.reason === 'pat' ? 'Saat unggul, pastikan lawan masih punya langkah legal jika Anda belum memberi skakmat.' :
      game.result.reason === 'skakmat' ? 'Latihan berikutnya: tinjau jalur serangan ke raja dan cari skak, tangkapan, serta ancaman sebelum melangkah.' :
      'Latihan berikutnya: pelajari kapan posisi tidak bisa dimenangkan dan kapan aturan remis dapat diklaim.'
    }`,
  });
  if (!own.length) {
    lessons.push({ title: 'Belum ada langkah Anda', text: 'Riwayat ini belum memuat langkah pemain manusia. Mulai pertandingan baru untuk mendapatkan pelajaran dari permainan Anda sendiri.' });
    return lessons;
  }
  const castle = own.find(move => move.isKingsideCastle() || move.isQueensideCastle());
  if (castle) {
    lessons.push({ title: 'Keamanan raja', text: `Anda melakukan rokade pada ${label(castle)}. ${explainMove(castle.before, castle)} Tetap periksa apakah pion pelindung raja dan petak di sekitarnya aman.` });
  } else {
    lessons.push({ title: 'Keamanan raja', text: `Dalam ${own.length} langkah Anda, belum ada rokade. Saat meninjau pembukaan, cari kesempatan mengembangkan kuda dan gajah serta rokade jika legal dan aman; tidak setiap posisi mengharuskan rokade.` });
  }
  const values: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const losses = moves.filter(move => move.color !== color && move.captured);
  let largestLoss: (typeof moves)[number] | undefined;
  for (const move of losses) {
    if (move.captured && (!largestLoss?.captured || values[move.captured] > values[largestLoss.captured])) {
      largestLoss = move;
    }
  }
  if (largestLoss?.captured) {
    const capturedSquare = largestLoss.isEnPassant() ? `${largestLoss.to[0]}${largestLoss.from[1]}` : largestLoss.to;
    lessons.push({
      title: 'Tinjau buah yang tertangkap',
      text: `Pada ${label(largestLoss)}, komputer menangkap ${names[largestLoss.captured]} Anda di ${capturedSquare}${largestLoss.isEnPassant() ? ' lewat en passant' : ''}. Anda kehilangan ${losses.length} buah sepanjang permainan. Tinjau posisi sebelum tangkapan: bisakah buah dipindahkan, dilindungi, atau ditukar secara menguntungkan? Tangkapan ini belum tentu kesalahan; pengorbanan bisa disengaja.`,
    });
  }
  const capture = own.find(move => move.captured);
  if (capture) {
    lessons.push({ title: 'Belajar dari tangkapan Anda', text: `Tinjau ${label(capture)}: ${explainMove(capture.before, capture)} Untuk latihan, hitung rangkaian tangkap-balik dan bandingkan nilainya, bukan hanya buah pertama yang didapat.` });
  }
  const opening = own.slice(0, 6);
  const development = opening.filter(move => (move.piece === 'n' || move.piece === 'b') &&
    move.from[1] === (color === 'w' ? '1' : '8') && move.to[1] !== move.from[1]);
  lessons.push({
    title: 'Latihan pembukaan berikutnya',
    text: development.length
      ? `Dalam ${opening.length} langkah awal Anda, pengembangan kuda/gajah terlihat pada ${development.map(label).join(', ')}. Lanjutkan dengan mengaktifkan buah yang belum berkembang dan menguasai pusat; hindari memindahkan buah yang sama berkali-kali tanpa alasan taktis.`
      : `Dalam ${opening.length} langkah awal Anda (${opening.map(label).join(', ')}), belum ada kuda/gajah yang keluar dari baris awal. Coba kembangkan buah ringan sambil menguasai pusat, kecuali ada skak atau ancaman yang harus ditangani lebih dulu.`,
  });
  return lessons;
}

export function positionLessons(chess: Chess, color: Color): string[] {
  if (chess.isCheckmate()) return ['Skakmat: raja diserang dan tidak ada langkah legal untuk menyelamatkannya. Tinjau kembali perlindungan raja sebelum serangan terakhir.'];
  if (chess.isStalemate()) return ['Pat: tidak ada langkah legal, tetapi raja tidak sedang skak. Hasilnya remis, bukan kemenangan.'];
  if (chess.isInsufficientMaterial()) return ['Materi tidak cukup untuk skakmat. Raja saja, misalnya, tidak bisa mematikan raja lawan.'];
  if (chess.turn() !== color) return ['Sambil menunggu lawan, periksa buah yang belum terlindungi dan rencanakan jawaban terhadap skak, tangkapan, atau ancaman.'];
  if (chess.isCheck()) return ['Raja Anda sedang skak. Pilih langkah legal untuk memindahkan raja, menangkap penyerang, atau menutup jalur serangan. Skak kuda tidak bisa ditutup.'];
  const opponent = color === 'w' ? 'b' : 'w';
  const threatened = chess.board().flat().filter((piece): piece is Piece & { square: Square } =>
    piece !== null && piece.color === color && piece.type !== 'k' &&
    chess.isAttacked(piece.square, opponent) && !chess.isAttacked(piece.square, color));
  const lessons: string[] = [];
  if (threatened.length) lessons.push(`Waspada: ${threatened.map(piece => `${names[piece.type]} di ${piece.square}`).join(', ')} diserang dan tidak dijaga buah Anda. Pertimbangkan memindahkan, melindungi, atau membuat ancaman balasan; serangan belum tentu tangkapan legal jika penyerang terikat menjaga rajanya.`);
  if (chess.history().length < 16) {
    lessons.push('Pembukaan: rebut pusat d4, e4, d5, e5 dengan pion atau serangan buah. Kembangkan kuda dan gajah, lalu pertimbangkan rokade agar raja lebih aman.');
  } else if (chess.board().flat().filter(piece => piece && piece.type !== 'k' && piece.type !== 'p').length <= 4) {
    lessons.push('Akhir permainan: aktifkan raja jika aman, bantu pion menuju promosi, dan cegah pion lawan maju tanpa pengawasan.');
  } else {
    lessons.push('Tengah permainan: sebelum melangkah, periksa skak, tangkapan, dan ancaman kedua pihak. Cari garpu (satu buah menyerang dua sasaran) atau ikatan (buah sulit bergerak karena melindungi sasaran di belakangnya).');
  }
  lessons.push('Jangan hanya mengejar tangkapan. Bandingkan nilai buah: pion 1, kuda/gajah sekitar 3, benteng 5, ratu 9; keamanan raja lebih penting.');
  return lessons;
}

export function explainMove(fen: string, input: MoveInput): string {
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true }).find(move =>
    move.from === input.from && move.to === input.to && move.promotion === input.promotion);
  if (!legal) throw new Error('Langkah pengajaran tidak sah untuk posisi ini.');
  const wasCheck = chess.isCheck();
  const move = chess.move(input);
  const reasons: string[] = [];
  if (chess.isCheckmate()) reasons.push('Langkah ini menghasilkan skakmat: lawan tidak dapat menyelamatkan rajanya.');
  else if (chess.isStalemate()) reasons.push('Langkah ini menghasilkan pat: lawan tidak punya langkah legal tanpa sedang skak, sehingga remis.');
  else {
    if (wasCheck) reasons.push('Langkah ini menyelamatkan raja dari skak.');
    if (move.isKingsideCastle() || move.isQueensideCastle()) reasons.push('Rokade memindahkan raja dan benteng sekaligus untuk membantu keamanan raja dan mengaktifkan benteng.');
    if (move.promotion) reasons.push(`Pion mencapai baris terakhir dan dipromosikan menjadi ${names[move.promotion]}.`);
    if (move.captured) reasons.push(`Langkah ini menangkap ${names[move.captured]}${move.isEnPassant() ? ' lewat en passant: pion yang baru maju dua petak dapat ditangkap seolah maju satu petak' : ''}. Periksa kemungkinan lawan menangkap balik.`);
    if (chess.isCheck()) reasons.push('Langkah ini memberi skak, sehingga lawan harus menangani ancaman terhadap rajanya.');
    if (center.includes(move.to)) reasons.push('Buah menempati pusat, tempat yang membantu menguasai lebih banyak petak.');
    const homeRank = move.color === 'w' ? '1' : '8';
    if ((move.piece === 'n' || move.piece === 'b') && move.from[1] === homeRank && move.to[1] !== homeRank) {
      reasons.push(`Anda mengembangkan ${names[move.piece]} dari baris awal agar lebih aktif.`);
    }
    if (chess.moves({ verbose: true }).some(reply => reply.to === move.to && reply.captured)) {
      reasons.push(`Hati-hati: lawan punya tangkapan legal terhadap ${names[move.piece]} di ${move.to}. Periksa apakah pertukaran atau pengorbanan ini menguntungkan.`);
    }
  }
  if (!reasons.length) reasons.push('Perubahan posisi ini perlu dinilai bersama rencana berikutnya. Periksa keamanan buah dan ancaman lawan sebelum melanjutkan.');
  return `${names[move.piece]} ${move.from} ke ${move.to} (${move.san}). ${reasons.join(' ')}`;
}
