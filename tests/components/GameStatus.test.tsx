import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameStatus } from '../../src/components/GameStatus';
import { GameState } from '../../src/game/game-state';

describe('status permainan', () => {
  it('menampilkan pemenang saat skakmat', () => {
    render(<GameStatus game={new GameState('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1')} started engineStatus="ready" onClaim={vi.fn()} />);
    expect(screen.getByText(/skakmat.*putih menang/i)).toBeTruthy();
  });
  it('menawarkan klaim remis pada giliran pemain', () => {
    const claim = vi.fn();
    render(<GameStatus game={new GameState('7k/8/8/8/8/8/R7/6K1 w - - 100 51')} started engineStatus="ready" onClaim={claim} />);
    fireEvent.click(screen.getByRole('button', { name: /klaim remis/i }));
    expect(claim).toHaveBeenCalledOnce();
  });
  it('menunjukkan alasan remis dan tidak menawarkan klaim setelah selesai', () => {
    render(<GameStatus game={new GameState('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')} started engineStatus="ready" onClaim={vi.fn()} />);
    expect(screen.getByText(/remis.*pat/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /klaim remis/i })).toBeNull();
  });
  it('mengizinkan pemain Hitam mengklaim remis pada gilirannya', () => {
    const claim = vi.fn();
    render(<GameStatus game={new GameState('7k/8/8/8/8/8/R7/6K1 b - - 100 51')} playerColor="b" started engineStatus="ready" onClaim={claim} />);
    expect(screen.getByText(/Giliran Anda.*Hitam/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /klaim remis/i }));
    expect(claim).toHaveBeenCalledOnce();
  });
});
