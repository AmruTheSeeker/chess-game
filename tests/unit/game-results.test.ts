import { describe, expect, it } from 'vitest';
import { GameState } from '../../src/game/game-state';

describe('hasil pertandingan', () => {
  it.each([
    ['7k/6Q1/6K1/8/8/8/8/8 b - - 0 1', 'skakmat', 'w'],
    ['7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', 'pat', null],
    ['7k/8/6K1/8/8/8/8/8 w - - 0 1', 'materi-tidak-cukup', null],
  ] as const)('mengakhiri posisi %s', (fen, reason, winner) => {
    const game = new GameState(fen);
    expect(game.result).toEqual({ reason, winner });
    const before = game.chess.fen();
    expect(game.move({ from: 'g6', to: 'g5' })).toBe(false);
    expect(game.chess.fen()).toBe(before);
  });
  it('menunggu klaim setelah tiga kali pengulangan', () => {
    const game = new GameState();
    for (let i = 0; i < 2; i++) {
      for (const [from, to] of [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']] as const) {
        expect(game.move({ from, to })).toBe(true);
      }
    }
    expect(game.status).toBe('active');
    expect(game.claimable()).toBe('pengulangan');
    expect(game.claimDraw()).toBe(true);
    expect(game.result?.reason).toBe('pengulangan');
    expect(game.move({ from: 'e2', to: 'e4' })).toBe(false);
  });
  it('menunggu klaim aturan lima puluh langkah', () => {
    const game = new GameState('7k/8/8/8/8/8/R7/6K1 w - - 100 51');
    expect(game.claimable()).toBe('lima-puluh-langkah');
    expect(game.status).toBe('active');
    expect(game.claimDraw()).toBe(true);
    expect(game.result?.reason).toBe('lima-puluh-langkah');
  });
});
