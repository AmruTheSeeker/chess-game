import type { PieceSymbol, Color, Square } from 'chess.js';

export const pieces: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
export const names: Record<PieceSymbol, string> = { k: 'raja', q: 'ratu', r: 'benteng', b: 'gajah', n: 'kuda', p: 'pion' };

export function ChessSquare({ square, piece, light, selected, legal, lastMove = false, hinted = false, disabled, onClick }: {
  square: Square;
  piece: { color: Color; type: PieceSymbol } | null;
  light: boolean;
  selected: boolean;
  legal: boolean;
  lastMove?: boolean;
  hinted?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return <button type="button" className={`square ${light ? 'light' : 'dark'} ${lastMove ? 'last-move' : ''} ${selected ? 'selected' : ''} ${legal ? 'legal' : ''} ${hinted ? 'hinted' : ''}`}
    aria-label={`${square}${piece ? ` ${names[piece.type]} ${piece.color === 'w' ? 'putih' : 'hitam'}` : ' kosong'}${hinted ? ' saran langkah' : ''}`}
    aria-pressed={selected} data-legal={legal} disabled={disabled} onClick={onClick}>
    {piece && <span className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>{pieces[piece.color][piece.type]}</span>}
    <span className="coordinate">{square}</span>
  </button>;
}
