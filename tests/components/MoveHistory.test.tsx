import { render, screen, within } from '@testing-library/react';
import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { MoveHistory } from '../../src/components/MoveHistory';

describe('catatan langkah', () => {
  it('menampilkan kedua warna dari terbaru dan mengosongkan catatan setelah reset', () => {
    const chess = new Chess();
    const { rerender } = render(<MoveHistory moves={chess.history({ verbose: true })} />);
    expect(screen.getByText('Belum ada langkah.')).toBeTruthy();
    chess.move('e4');
    chess.move('d5');
    chess.move('exd5');
    rerender(<MoveHistory moves={chess.history({ verbose: true })} />);
    const list = screen.getByRole('list');
    const entries = within(list).getAllByRole('listitem');
    expect(entries.map(entry => entry.textContent)).toEqual([
      'Putih: pion e4 ke d5, menangkap pion (exd5)',
      'Hitam: pion d7 ke d5 (d5)',
      'Putih: pion e2 ke e4 (e4)',
    ]);
    expect(screen.getByText('Putih: pion e4 ke d5, menangkap pion', { selector: 'strong' })).toBeTruthy();
    rerender(<MoveHistory moves={[]} />);
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByText('Belum ada langkah.')).toBeTruthy();
  });

  it('menjelaskan perpindahan benteng saat rokade dan buah hasil promosi', () => {
    const castle = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    castle.move('O-O');
    const { rerender } = render(<MoveHistory moves={castle.history({ verbose: true })} />);
    expect(screen.getByText('Putih: raja e1 ke g1, rokade: benteng h1 ke f1', { selector: 'strong' })).toBeTruthy();
    const promotion = new Chess('4k3/8/8/8/8/8/p7/4K3 b - - 0 1');
    promotion.move({ from: 'a2', to: 'a1', promotion: 'n' });
    rerender(<MoveHistory moves={promotion.history({ verbose: true })} />);
    expect(screen.getByText('Hitam: pion a2 ke a1, promosi menjadi kuda', { selector: 'strong' })).toBeTruthy();
  });
});
