import { useEffect, useRef, useState } from 'react';
import type { Color } from 'chess.js';
import { GameState } from '../game/game-state';
import { names, pieces } from './ChessSquare';

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = seconds % 60;
  const twoDigits = (value: number) => String(value).padStart(2, '0');
  return hours > 0
    ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(remainder)}`
    : `${twoDigits(minutes)}:${twoDigits(remainder)}`;
}

export function PlayerInfo({ game, color, running, playerColor = 'w' }: { game: GameState; color: Color; running: boolean; playerColor?: Color }) {
  const [elapsed, setElapsed] = useState(0);
  const accumulated = useRef(0);
  const label = color === playerColor ? 'Anda' : 'Komputer';
  const opponent = color === 'w' ? 'b' : 'w';
  const captured = game.chess.history({ verbose: true }).flatMap(move =>
    move.color === color && move.captured ? [move.captured] : []);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const timer = setInterval(() => setElapsed(accumulated.current + performance.now() - start), 250);
    return () => {
      clearInterval(timer);
      accumulated.current += performance.now() - start;
      setElapsed(accumulated.current);
    };
  }, [running]);

  return <section className={`player-info ${running ? 'player-active' : ''}`} aria-label={label}>
    <div className="player-line">
      <strong>{label} <span className="player-color">({color === 'w' ? 'Putih' : 'Hitam'})</span></strong>
      <time className="player-clock" aria-label={`Waktu ${label}`}>{formatTime(elapsed)}</time>
    </div>
    <div className="captured" role="group" aria-label={`${label} menangkap`}>
      <span className="captured-label">Ditangkap:</span>
      {captured.length === 0 ? <span className="captured-empty">Belum ada</span> :
        captured.map((piece, index) => <span key={`${index}-${piece}`} role="img"
          aria-label={`${names[piece]} ${opponent === 'w' ? 'putih' : 'hitam'}`}
          className={`captured-piece ${opponent === 'w' ? 'white-piece' : 'black-piece'}`}>{pieces[opponent][piece]}</span>)}
    </div>
  </section>;
}
