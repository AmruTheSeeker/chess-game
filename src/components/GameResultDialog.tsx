import { useEffect, useMemo, useRef } from 'react';
import type { Color } from 'chess.js';
import type { GameState } from '../game/game-state';
import { reviewGame, resultExplanations } from '../game/coaching';

export function GameResultDialog({ game, playerColor, onDismiss, onNewGame }: {
  game: GameState;
  playerColor: Color;
  onDismiss: () => void;
  onNewGame: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismissButton = useRef<HTMLButtonElement>(null);
  const lessons = useMemo(() => reviewGame(game, playerColor), [game, playerColor]);
  useEffect(() => {
    const element = dialog.current;
    const button = dismissButton.current;
    if (!element || !button) throw new Error('Dialog hasil pertandingan tidak tersedia.');
    element.showModal();
    button.focus({ preventScroll: true });
    return () => { element.close(); };
  }, []);
  const result = game.result;
  if (!result) throw new Error('Dialog hasil hanya tersedia setelah pertandingan selesai.');
  const outcome = result.winner === null ? 'draw' : result.winner === playerColor ? 'win' : 'loss';
  const titles = { win: 'Selamat, Anda menang!', loss: 'Anda kalah, tetapi bisa belajar!', draw: 'Pertandingan remis (seri)!' };
  const messages = {
    win: 'Rayakan kemenangan Anda! Mari kenali pola permainan ini untuk latihan berikutnya.',
    loss: 'Kekalahan adalah bahan latihan. Tinjau momen berikut tanpa menyerah.',
    draw: 'Pertandingan berakhir tanpa pemenang. Pelajari penyebab remis dan peluang yang bisa Anda cari berikutnya.',
  };
  const ownMoves = game.chess.history({ verbose: true }).filter(move => move.color === playerColor);
  return <dialog ref={dialog} className={`dialog result-dialog result-${outcome}`}
    aria-labelledby="game-result-title" aria-describedby="game-result-description"
    onCancel={event => { event.preventDefault(); onDismiss(); }}>
    <div className="result-content" role="region" aria-label="Pelajaran pertandingan" tabIndex={0}>
      <div className="result-banner">
        <p className="eyebrow">PERTANDINGAN SELESAI</p>
        <h2 id="game-result-title">{titles[outcome]}</h2>
        <p id="game-result-description">{messages[outcome]}</p>
        <p>{resultExplanations[result.reason]}</p>
        <p className="result-stats">Anda: {playerColor === 'w' ? 'Putih' : 'Hitam'} · {ownMoves.length} langkah · {ownMoves.filter(move => move.captured).length} tangkapan</p>
      </div>
      <section className="result-lessons" aria-labelledby="result-lessons-title">
        <h3 id="result-lessons-title">Saran, tips &amp; trik dari permainan Anda</h3>
        <p className="review-note">Berdasarkan riwayat langkah, bukan evaluasi mesin atau penilaian blunder. Semua diproses lokal.</p>
        <ol>{lessons.map(lesson => <li key={lesson.title}><h4>{lesson.title}</h4><p>{lesson.text}</p></li>)}</ol>
      </section>
    </div>
    <div className="actions result-actions">
      <button ref={dismissButton} onClick={onDismiss}>Lihat papan &amp; riwayat</button>
      <button className="primary" onClick={onNewGame}>Main lagi</button>
    </div>
  </dialog>;
}
