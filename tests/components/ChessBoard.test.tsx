import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChessBoard } from '../../src/components/ChessBoard';
import { GameState } from '../../src/game/game-state';

describe('papan catur', () => {
  it('menandai saran tanpa menjalankannya, lalu menghapus penanda', () => {
    const onMove = vi.fn();
    const game = new GameState();
    const { rerender } = render(<ChessBoard game={game} disabled={false} onMove={onMove} hint={{ from: 'e2', to: 'e4' }} />);
    expect(document.querySelectorAll('.square.hinted')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /e2.*saran langkah/ })).toBeDefined();
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /e2/ }));
    fireEvent.click(screen.getByRole('button', { name: /e4/ }));
    expect(onMove).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });
    rerender(<ChessBoard game={game} disabled={false} onMove={onMove} />);
    expect(document.querySelectorAll('.square.hinted')).toHaveLength(0);
  });
  it('menunjukkan tujuan legal dan menolak tujuan tidak sah', () => {
    const onMove = vi.fn();
    render(<ChessBoard game={new GameState()} disabled={false} onMove={onMove} />);
    fireEvent.click(screen.getByRole('button', { name: /e2/ }));
    expect(screen.getByRole('button', { name: /e4/ }).getAttribute('data-legal')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /e5/ }));
    expect(onMove).not.toHaveBeenCalled();
  });
  it('menonaktifkan papan ketika bukan giliran pemain', () => {
    render(<ChessBoard game={new GameState()} disabled onMove={vi.fn()} />);
    expect((screen.getByRole('button', { name: /e2/ }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('membalik papan dan memilih buah hitam saat pemain bermain Hitam', () => {
    const game = new GameState();
    expect(game.move({ from: 'e2', to: 'e4' })).toBe(true);
    const onMove = vi.fn();
    render(<ChessBoard game={game} playerColor="b" disabled={false} onMove={onMove} />);
    const squares = screen.getAllByRole('button');
    expect(squares[0].getAttribute('aria-label')).toContain('h1');
    expect(squares[63].getAttribute('aria-label')).toContain('a8');
    fireEvent.click(screen.getByRole('button', { name: /e7/ }));
    expect(screen.getByRole('button', { name: /e5/ }).getAttribute('data-legal')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /e5/ }));
    expect(onMove).toHaveBeenCalledWith({ from: 'e7', to: 'e5' });
  });

  it('menandai asal dan tujuan langkah terakhir pada papan terbalik dan menghapusnya saat reset', () => {
    const game = new GameState();
    game.move({ from: 'e2', to: 'e4' });
    const { rerender } = render(<ChessBoard game={game} playerColor="b" disabled={false} onMove={vi.fn()} />);
    expect(screen.getByRole('button', { name: /e2 kosong/ }).classList.contains('last-move')).toBe(true);
    expect(screen.getByRole('button', { name: /e4 pion putih/ }).classList.contains('last-move')).toBe(true);
    expect(screen.getByRole('button', { name: /e7 pion hitam/ }).classList.contains('last-move')).toBe(false);
    rerender(<ChessBoard game={new GameState()} playerColor="b" disabled={false} onMove={vi.fn()} />);
    expect(document.querySelectorAll('.square.last-move')).toHaveLength(0);
  });

  it.each(['q', 'r', 'b', 'n'])('memilih promosi %s', promotion => {
    const onMove = vi.fn();
    render(<ChessBoard game={new GameState('4k3/P7/8/8/8/8/8/4K3 w - - 0 1')} disabled={false} onMove={onMove} />);
    fireEvent.click(screen.getByRole('button', { name: /a7/ }));
    fireEvent.click(screen.getByRole('button', { name: /a8/ }));
    fireEvent.click(screen.getByRole('button', { name: ({ q: 'Ratu', r: 'Benteng', b: 'Gajah', n: 'Kuda' } as Record<string, string>)[promotion] }));
    expect(onMove).toHaveBeenCalledWith({ from: 'a7', to: 'a8', promotion });
  });

  it('menawarkan promosi ketika pemain Hitam mencapai baris pertama', () => {
    const game = new GameState('4k3/8/8/8/8/8/p7/4K3 b - - 0 1');
    const onMove = vi.fn();
    render(<ChessBoard game={game} playerColor="b" disabled={false} onMove={onMove} />);
    fireEvent.click(screen.getByRole('button', { name: /a2/ }));
    fireEvent.click(screen.getByRole('button', { name: /a1/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ratu' }));
    expect(onMove).toHaveBeenCalledWith({ from: 'a2', to: 'a1', promotion: 'q' });
  });
});
