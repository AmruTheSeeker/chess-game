import { useState } from 'react';
import type { Color, PieceSymbol, Square } from 'chess.js';
import { GameState, type MoveInput } from '../game/game-state';
import { ChessSquare } from './ChessSquare';

const promotions: { piece: PieceSymbol; name: string }[] = [
  { piece: 'q', name: 'Ratu' }, { piece: 'r', name: 'Benteng' },
  { piece: 'b', name: 'Gajah' }, { piece: 'n', name: 'Kuda' },
];

export function ChessBoard({ game, disabled, onMove, playerColor = 'w', hint }: {
  game: GameState;
  disabled: boolean;
  onMove: (move: MoveInput) => void;
  playerColor?: Color;
  hint?: MoveInput;
}) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const legalMoves = selected ? game.chess.moves({ square: selected, verbose: true }) : [];

  function choose(square: Square) {
    if (disabled || promotion) return;
    const moves = legalMoves.filter(move => move.to === square);
    if (selected && moves.length) {
      if (moves.some(move => move.promotion)) setPromotion({ from: selected, to: square });
      else { onMove({ from: selected, to: square }); setSelected(null); }
      return;
    }
    const piece = game.chess.get(square);
    setSelected(piece?.color === playerColor && game.chess.turn() === playerColor ? square : null);
  }

  const rows = game.chess.board();
  const displayRows = playerColor === 'b' ? [...rows].reverse() : rows;
  const lastMove = game.chess.history({ verbose: true }).at(-1);
  return <>
    <div className="board" aria-label="Papan catur">
      {displayRows.flatMap((row, displayRank) => (playerColor === 'b' ? [...row].reverse() : row).map((piece, displayFile) => {
        const rank = playerColor === 'b' ? 7 - displayRank : displayRank;
        const file = playerColor === 'b' ? 7 - displayFile : displayFile;
        const square = `${'abcdefgh'[file]}${8 - rank}` as Square;
        return <ChessSquare key={square} square={square} piece={piece} light={(rank + file) % 2 === 0}
          selected={selected === square} legal={legalMoves.some(move => move.to === square)}
          lastMove={lastMove?.from === square || lastMove?.to === square}
          hinted={hint?.from === square || hint?.to === square}
          disabled={disabled || !!promotion} onClick={() => choose(square)} />;
      }))}
    </div>
    {promotion && <div className="dialog-backdrop">
      <section role="dialog" aria-modal="true" aria-labelledby="promotion-title" className="dialog">
        <h2 id="promotion-title">Pilih promosi pion</h2>
        <div className="actions">{promotions.map(({ piece, name }) =>
          <button key={piece} disabled={disabled} onClick={() => { onMove({ ...promotion, promotion: piece }); setPromotion(null); setSelected(null); }}>{name}</button>)}</div>
      </section>
    </div>}
  </>;
}
