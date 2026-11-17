import type { Chess } from 'chess.js';
import type { MoveInput } from './game-state';

export const levelNames = {
  pemula: 'Pemula', 'sangat-mudah': 'Sangat Mudah', adaptif: 'Adaptif',
  mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit',
} as const;
export type Level = keyof typeof levelNames;
export const fixedLevels = { pemula: 0, 'sangat-mudah': 0, mudah: 3, sedang: 10, sulit: 18 } as const;
export const levelDescriptions: Record<Level, string> = {
  pemula: 'Latihan dasar: komputer memilih langkah legal secara acak, tanpa mencari langkah terkuat. Tetap bisa menang atau memberi skak.',
  'sangat-mudah': '60% balasan acak, 40% balasan mesin pada level terendah. Cocok setelah nyaman dengan gerak buah.',
  adaptif: 'Kekuatan komputer menyesuaikan permainan Anda; awalnya setara tingkat menengah.',
  mudah: 'Mesin level 3. Cocok jika sudah memahami aturan dan ancaman dasar.',
  sedang: 'Mesin level 10 untuk latihan yang lebih menantang.',
  sulit: 'Mesin level 18 untuk pemain berpengalaman.',
};

export function isLevel(value: string): value is Level {
  return Object.prototype.hasOwnProperty.call(levelNames, value);
}

export function beginnerReply(chess: Chess, level: Level, random = Math.random): MoveInput | null {
  if (level !== 'pemula' && level !== 'sangat-mudah') return null;
  if (level === 'sangat-mudah' && random() >= 0.6) return null;
  const moves = chess.moves({ verbose: true });
  if (!moves.length) throw new Error('Tidak ada langkah legal untuk komputer.');
  const move = moves[Math.floor(random() * moves.length)];
  return { from: move.from, to: move.to, promotion: move.promotion };
}

export function engineMove(chess: Chess, uci: string): MoveInput {
  const move = chess.moves({ verbose: true }).find(candidate =>
    `${candidate.from}${candidate.to}${candidate.promotion ?? ''}` === uci);
  if (!move) throw new Error('Mesin mengirim langkah yang tidak sah.');
  return { from: move.from, to: move.to, promotion: move.promotion };
}
