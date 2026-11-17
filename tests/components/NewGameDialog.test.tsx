import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NewGameDialog } from '../../src/components/NewGameDialog';

describe('konfirmasi permainan baru', () => {
  it('menawarkan pembatalan dan konfirmasi secara terpisah', () => {
    const cancel = vi.fn();
    const confirm = vi.fn();
    render(<NewGameDialog onCancel={cancel} onConfirm={confirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ya, mulai baru' }));
    expect(confirm).toHaveBeenCalledOnce();
  });
});
