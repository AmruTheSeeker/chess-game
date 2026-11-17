import type { Color } from 'chess.js';
import { GameState } from '../game/game-state';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'thinking' | 'error';

export function GameStatus({ game, started, engineStatus, onClaim, playerColor = 'w' }: {
  game: GameState;
  started: boolean;
  engineStatus: EngineStatus;
  onClaim: () => void;
  playerColor?: Color;
}) {
  const result = game.result;
  const reasons = {
    pat: 'pat', 'materi-tidak-cukup': 'materi tidak cukup',
    pengulangan: 'pengulangan tiga kali', 'lima-puluh-langkah': 'aturan lima puluh langkah',
  };
  let text = 'Siap bermain?';
  if (started && result) {
    text = result.reason === 'skakmat'
      ? `Skakmat — ${result.winner === 'w' ? 'Putih' : 'Hitam'} menang`
      : `Remis — ${reasons[result.reason]}`;
  } else if (started) {
    text = engineStatus === 'loading' ? 'Menyiapkan komputer…' : engineStatus === 'thinking' ? 'Komputer berpikir…' :
      engineStatus === 'error' ? 'Komputer tidak tersedia' : `Giliran Anda — ${playerColor === 'w' ? 'Putih' : 'Hitam'}`;
  }
  const claimable = started && game.chess.turn() === playerColor && game.claimable();
  return <>
    <p className="status">{text}</p>
    {started && game.status === 'active' && game.chess.isCheck() && <p>Skak!</p>}
    {claimable && <button onClick={onClaim}>Klaim remis ({claimable === 'pengulangan' ? 'pengulangan tiga kali' : 'lima puluh langkah'})</button>}
  </>;
}
