import { Chess } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';
import { beginnerReply, engineMove } from '../../src/game/levels';
import { explainMove, positionLessons, reviewGame } from '../../src/game/coaching';
import { GameState } from '../../src/game/game-state';

describe('level ramah pemula', () => {
  it('memilih dari semua langkah legal, bukan hasil mesin, tanpa mengubah papan', () => {
    const chess = new Chess();
    const fen = chess.fen();
    const moves = chess.moves({ verbose: true });
    for (let index = 0; index < moves.length; index++) {
      const result = beginnerReply(chess, 'pemula', () => (index + 0.5) / moves.length);
      expect(result).toEqual({ from: moves[index].from, to: moves[index].to, promotion: moves[index].promotion });
    }
    expect(chess.fen()).toBe(fen);
  });

  describe('pelajaran dari pertandingan selesai', () => {
    function scholarsMate() {
      const game = new GameState();
      for (const san of ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#']) {
        const move = game.chess.moves({ verbose: true }).find(candidate => candidate.san === san)!;
        game.move(move);
      }
      return game;
    }

    it('menggunakan langkah dan tangkapan manusia sesuai warna tanpa mengubah riwayat', () => {
      const game = scholarsMate();
      const fen = game.chess.fen();
      const history = game.chess.history();
      const white = reviewGame(game, 'w');
      const black = reviewGame(game, 'b');
      expect(white.find(lesson => lesson.title === 'Belajar dari tangkapan Anda')?.text).toContain('4. Qxf7#');
      expect(white.find(lesson => lesson.title === 'Latihan pembukaan berikutnya')?.text).toContain('2. Bc4');
      expect(black.find(lesson => lesson.title === 'Tinjau buah yang tertangkap')?.text).toContain('pion Anda di f7');
      expect(black.find(lesson => lesson.title === 'Belajar dari tangkapan Anda')).toBeUndefined();
      expect(black.find(lesson => lesson.title === 'Latihan pembukaan berikutnya')?.text).toContain('2... Nc6');
      expect(game.chess.fen()).toBe(fen);
      expect(game.chess.history()).toEqual(history);
    });

    it('menjelaskan pat dan materi tidak cukup, tanpa mengarang langkah', () => {
      const pat = new GameState('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
      const material = new GameState('7k/8/6K1/8/8/8/8/8 w - - 0 1');
      expect(reviewGame(pat, 'b')[0].text).toContain('belum memberi skakmat');
      expect(reviewGame(material, 'w')[0].text).toContain('materi yang tersisa');
      expect(reviewGame(pat, 'b')[1].title).toBe('Belum ada langkah Anda');
      expect(() => reviewGame(new GameState(), 'w')).toThrow(/setelah pertandingan selesai/);
    });

    it('menunjukkan petak pion yang tertangkap en passant, bukan petak tujuan penyerang', () => {
      const game = new GameState('6k1/8/8/3pP3/8/8/8/R5K1 w - d6 0 2');
      for (const san of ['exd6', 'Kh7', 'Kh2', 'Kg8', 'Kg1', 'Kh7', 'Kh2', 'Kg8', 'Kg1']) {
        const move = game.chess.moves({ verbose: true }).find(candidate => candidate.san === san)!;
        expect(game.move(move)).toBe(true);
      }
      expect(game.claimDraw()).toBe(true);
      expect(reviewGame(game, 'b').find(lesson => lesson.title === 'Tinjau buah yang tertangkap')?.text)
        .toContain('pion Anda di d5 lewat en passant');
    });

    it('mengenali rokade dan remis yang diklaim dari riwayat sebenarnya', () => {
      const game = new GameState('r3k2r/ppp2ppp/8/8/8/8/PPP2PPP/R3K2R w KQkq - 0 1');
      for (const san of ['O-O', 'O-O', 'Kh1', 'Kh8', 'Kg1', 'Kg8', 'Kh1', 'Kh8', 'Kg1', 'Kg8']) {
        const move = game.chess.moves({ verbose: true }).find(candidate => candidate.san === san)!;
        expect(game.move(move)).toBe(true);
      }
      expect(game.claimDraw()).toBe(true);
      const lessons = reviewGame(game, 'w');
      expect(lessons[0].text).toContain('berulang tiga kali');
      expect(lessons.find(lesson => lesson.title === 'Keamanan raja')?.text).toContain('1. O-O');
      const fifty = new GameState('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 100 51');
      expect(fifty.claimDraw()).toBe(true);
      expect(reviewGame(fifty, 'w')[0].text).toContain('lima puluh langkah tiap pihak');
    });
  });

  it('menerapkan batas 60% acak dan hanya memakai level lama lewat mesin', () => {
    const chess = new Chess();
    expect(beginnerReply(chess, 'sangat-mudah', vi.fn().mockReturnValueOnce(0.599).mockReturnValueOnce(0))).not.toBeNull();
    expect(beginnerReply(chess, 'sangat-mudah', () => 0.6)).toBeNull();
    for (const level of ['adaptif', 'mudah', 'sedang', 'sulit'] as const) {
      const random = vi.fn();
      expect(beginnerReply(chess, level, random)).toBeNull();
      expect(random).not.toHaveBeenCalled();
    }
  });

  it('menjaga legalitas saat skak dan menyertakan pilihan promosi', () => {
    const checked = new Chess('4r1k1/8/8/8/8/8/8/4K3 w - - 0 1');
    const reply = beginnerReply(checked, 'pemula', () => 0)!;
    checked.move(reply);
    expect(checked.isAttacked(checked.findPiece({ type: 'k', color: 'w' })[0], 'b')).toBe(false);
    const promotion = new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    expect(engineMove(promotion, 'a7a8n')).toEqual({ from: 'a7', to: 'a8', promotion: 'n' });
    expect(() => engineMove(promotion, 'a7a8')).toThrow(/tidak sah/);
    expect(() => engineMove(new Chess(), 'e2e5')).toThrow(/tidak sah/);
  });
});

describe('pelajaran sesuai posisi', () => {
  it('menjelaskan pusat/pengembangan bagi kedua warna tanpa mengubah posisi', () => {
    const chess = new Chess();
    const fen = chess.fen();
    expect(explainMove(fen, { from: 'e2', to: 'e4' })).toContain('pusat');
    expect(explainMove(fen, { from: 'g1', to: 'f3' })).toContain('mengembangkan kuda');
    expect(chess.fen()).toBe(fen);
    chess.move('e4');
    expect(explainMove(chess.fen(), { from: 'g8', to: 'f6' })).toContain('mengembangkan kuda');
    expect(positionLessons(chess, 'b').join(' ')).toContain('Pembukaan');
  });

  it('mendahulukan penyelamatan raja dan mendeteksi buah tidak dijaga', () => {
    const checked = new Chess('4r1k1/8/8/8/8/8/8/4K3 w - - 0 1');
    expect(positionLessons(checked, 'w')[0]).toContain('sedang skak');
    expect(explainMove(checked.fen(), { from: 'e1', to: 'd1' })).toContain('menyelamatkan raja');
    const threatened = new Chess('6k1/8/8/8/8/2b5/8/R5K1 w - - 0 1');
    expect(positionLessons(threatened, 'w')[0]).toContain('benteng di a1');
  });

  it('memperingatkan tangkapan balik, bukan memuji langkah berbahaya', () => {
    const chess = new Chess('6k1/8/8/8/3p4/8/4P3/6K1 w - - 0 1');
    expect(explainMove(chess.fen(), { from: 'e2', to: 'e3' })).toContain('tangkapan legal terhadap pion di e3');
  });

  it('menjelaskan rokade, en passant, promosi, dan skakmat', () => {
    expect(explainMove('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', { from: 'e1', to: 'g1' })).toContain('Rokade');
    expect(explainMove('6k1/8/8/3pP3/8/8/8/6K1 w - d6 0 2', { from: 'e5', to: 'd6' })).toContain('en passant');
    expect(explainMove('4k3/P7/8/8/8/8/8/4K3 w - - 0 1', { from: 'a7', to: 'a8', promotion: 'q' })).toContain('dipromosikan menjadi ratu');
    const chess = new Chess();
    chess.move('f3'); chess.move('e5'); chess.move('g4');
    expect(explainMove(chess.fen(), { from: 'd8', to: 'h4' })).toContain('skakmat');
    chess.move('Qh4#');
    expect(positionLessons(chess, 'w')[0]).toContain('Skakmat');
  });
});
