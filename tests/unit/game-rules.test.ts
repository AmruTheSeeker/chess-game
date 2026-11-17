import { describe, expect, it } from 'vitest';
import type { Square } from 'chess.js';
import { GameState } from '../../src/game/game-state';

const squares = '12345678'.split('').flatMap(rank => 'abcdefgh'.split('').map(file => `${file}${rank}` as Square));

describe('aturan langkah', () => {
  const cases = [
    ...squares.map(to => ({ from: 'e2' as Square, to, legal: to === 'e3' || to === 'e4' })),
    ...squares.slice(0, 36).map(to => ({ from: 'g1' as Square, to, legal: to === 'f3' || to === 'h3' })),
  ];
  it.each(cases)('$from ke $to', ({ from, to, legal }) => {
    const game = new GameState();
    const before = game.chess.fen();
    expect(game.move({ from, to })).toBe(legal);
    if (!legal) {
      expect(game.chess.fen()).toBe(before);
      expect(game.chess.history()).toHaveLength(0);
    }
  });

  it('menolak rokade melewati petak terancam', () => {
    const game = new GameState('4kr2/8/8/8/8/8/8/4K2R w K - 0 1');
    expect(game.move({ from: 'e1', to: 'g1' })).toBe(false);
  });
  it('memungkinkan en passant langsung setelah langkah pion dua petak', () => {
    const game = new GameState('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');
    expect(game.move({ from: 'd7', to: 'd5' })).toBe(true);
    expect(game.move({ from: 'e5', to: 'd6' })).toBe(true);
    expect(game.chess.get('d5')).toBeUndefined();
  });
  it('mewajibkan pilihan promosi yang sah', () => {
    const game = new GameState('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    expect(game.move({ from: 'a7', to: 'a8' })).toBe(false);
    expect(game.move({ from: 'a7', to: 'a8', promotion: 'n' })).toBe(true);
    expect(game.chess.get('a8')?.type).toBe('n');
  });
  it('menolak langkah yang meninggalkan raja dalam keadaan skak', () => {
    const game = new GameState('4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1');
    expect(game.move({ from: 'e2', to: 'd2' })).toBe(false);
  });
});
