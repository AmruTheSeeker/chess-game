import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlayerInfo } from '../../src/components/PlayerInfo';
import { GameState } from '../../src/game/game-state';

afterEach(() => vi.useRealTimers());

describe('waktu dan buah tertangkap', () => {
  it('menghitung waktu hanya saat aktif, mempertahankannya ketika jeda, dan mereset pada permainan baru', () => {
    vi.useFakeTimers();
    const game = new GameState();
    const { rerender } = render(<PlayerInfo key="first" game={game} color="w" running />);
    act(() => vi.advanceTimersByTime(2100));
    expect(screen.getByLabelText('Waktu Anda').textContent).toBe('00:02');
    rerender(<PlayerInfo key="first" game={game} color="w" running={false} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByLabelText('Waktu Anda').textContent).toBe('00:02');
    rerender(<PlayerInfo key="first" game={game} color="w" running />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByLabelText('Waktu Anda').textContent).toBe('00:03');
    rerender(<PlayerInfo key="new" game={new GameState()} color="w" running={false} />);
    expect(screen.getByLabelText('Waktu Anda').textContent).toBe('00:00');
  });

  it('mengelompokkan buah berdasarkan pihak yang menangkapnya', () => {
    const game = new GameState();
    for (const [from, to] of [['e2', 'e4'], ['d7', 'd5'], ['e4', 'd5'], ['d8', 'd5']] as const) {
      expect(game.move({ from, to })).toBe(true);
    }
    render(<><PlayerInfo game={game} color="w" running={false} /><PlayerInfo game={game} color="b" running={false} /></>);
    expect(screen.getByRole('group', { name: 'Anda menangkap' }).querySelector('[aria-label="pion hitam"]')).not.toBeNull();
    expect(screen.getByRole('group', { name: 'Komputer menangkap' }).querySelector('[aria-label="pion putih"]')).not.toBeNull();
  });

  it('menampilkan tangkapan Hitam sebagai milik pemain yang memilih Hitam', () => {
    const game = new GameState();
    for (const [from, to] of [['e2', 'e4'], ['d7', 'd5'], ['e4', 'd5'], ['d8', 'd5']] as const) {
      expect(game.move({ from, to })).toBe(true);
    }
    render(<PlayerInfo game={game} color="b" playerColor="b" running={false} />);
    expect(screen.getByRole('group', { name: 'Anda menangkap' }).querySelector('[aria-label="pion putih"]')).not.toBeNull();
    expect(screen.getByLabelText('Waktu Anda')).toBeTruthy();
  });

  it('mencatat tangkapan en passant dan tangkapan saat promosi', () => {
    const enPassant = new GameState('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');
    expect(enPassant.move({ from: 'd7', to: 'd5' })).toBe(true);
    expect(enPassant.move({ from: 'e5', to: 'd6' })).toBe(true);
    const { rerender } = render(<PlayerInfo game={enPassant} color="w" running={false} />);
    expect(screen.getByLabelText('pion hitam')).toBeTruthy();

    const promotion = new GameState('1r2k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    expect(promotion.move({ from: 'a7', to: 'b8', promotion: 'q' })).toBe(true);
    rerender(<PlayerInfo game={promotion} color="w" running={false} />);
    expect(screen.getByLabelText('benteng hitam')).toBeTruthy();
    expect(screen.queryByLabelText('pion hitam')).toBeNull();
  });
});
