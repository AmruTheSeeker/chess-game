import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Color } from 'chess.js';
import { GameResultDialog } from '../../src/components/GameResultDialog';
import { GameState } from '../../src/game/game-state';

describe('pop-up hasil pertandingan', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.open = true; }),
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.open = false; }),
    });
  });

  it.each([
    ['7k/6Q1/6K1/8/8/8/8/8 b - - 0 1', 'w', 'Selamat, Anda menang!'],
    ['7k/6Q1/6K1/8/8/8/8/8 b - - 0 1', 'b', 'Anda kalah, tetapi bisa belajar!'],
    ['7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', 'b', 'Pertandingan remis (seri)!'],
  ] as const)('menampilkan hasil dari sisi manusia: %s / %s', (fen, color: Color, title) => {
    render(<GameResultDialog game={new GameState(fen)} playerColor={color} onDismiss={vi.fn()} onNewGame={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: title })).toBeTruthy();
    expect(screen.getByText(/Berdasarkan riwayat langkah/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Belum ada langkah Anda' })).toBeTruthy();
  });

  it('memisahkan penutupan, Escape, dan permainan baru', () => {
    const dismiss = vi.fn();
    const start = vi.fn();
    render(<GameResultDialog game={new GameState('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')}
      playerColor="w" onDismiss={dismiss} onNewGame={start} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat papan & riwayat' }));
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(dismiss).toHaveBeenCalledTimes(2);
    expect(start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Main lagi' }));
    expect(start).toHaveBeenCalledOnce();
  });
});
