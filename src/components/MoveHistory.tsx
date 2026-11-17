import type { Move } from 'chess.js';
import { names } from './ChessSquare';

function describeMove(move: Move): string {
  const color = move.color === 'w' ? 'Putih' : 'Hitam';
  let description = `${color}: ${names[move.piece]} ${move.from} ke ${move.to}`;
  if (move.captured) description += `, menangkap ${names[move.captured]}`;
  if (move.promotion) description += `, promosi menjadi ${names[move.promotion]}`;
  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    const rank = move.color === 'w' ? '1' : '8';
    const rookFrom = move.isKingsideCastle() ? `h${rank}` : `a${rank}`;
    const rookTo = move.isKingsideCastle() ? `f${rank}` : `d${rank}`;
    description += `, rokade: benteng ${rookFrom} ke ${rookTo}`;
  }
  return description;
}

export function MoveHistory({ moves }: { moves: Move[] }) {
  const lastMove = moves.at(-1);
  return <section aria-labelledby="move-history-title">
    <p>Rincian langkah terakhir: <strong>{lastMove ? describeMove(lastMove) : 'Belum ada'}</strong></p>
    <h3 id="move-history-title">Catatan langkah</h3>
    {moves.length === 0 ? <p>Belum ada langkah.</p> :
      <ol className="move-history" reversed start={moves.length}>
        {[...moves].reverse().map((move, index) =>
          <li key={moves.length - index}>{describeMove(move)} <span className="move-notation">({move.san})</span></li>)}
      </ol>}
  </section>;
}
