import { useEffect, useRef, useState } from 'react';
import type { Color } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { GameStatus, type EngineStatus } from './components/GameStatus';
import { MoveHistory } from './components/MoveHistory';
import { NewGameDialog } from './components/NewGameDialog';
import { PlayerInfo } from './components/PlayerInfo';
import { LearningPanel } from './components/LearningPanel';
import { GameResultDialog } from './components/GameResultDialog';
import { StockfishClient } from './engine/stockfish-client';
import { AdaptiveDifficulty } from './game/adaptive-difficulty';
import { GameState, type GameResult, type MoveInput } from './game/game-state';
import { beginnerReply, engineMove, fixedLevels, isLevel, levelDescriptions, levelNames, type Level } from './game/levels';
import { explainMove } from './game/coaching';

type Settings = { color: Color; level: Level };

export default function App() {
  const [game, setGame] = useState(() => new GameState());
  const [gameNumber, setGameNumber] = useState(0);
  const [started, setStarted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>('w');
  const [selectedLevel, setSelectedLevel] = useState<Level>('adaptif');
  const [settings, setSettings] = useState<Settings>({ color: 'w', level: 'adaptif' });
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('idle');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [learning, setLearning] = useState(false);
  const [hint, setHint] = useState<{ fen: string; move: MoveInput; text: string } | null>(null);
  const [hintBusy, setHintBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [dismissedResult, setDismissedResult] = useState<GameResult | null>(null);
  const [, redraw] = useState(0);
  const client = useRef<StockfishClient | null>(null);
  const difficulty = useRef(new AdaptiveDifficulty());
  const pendingAnalysis = useRef<string | null>(null);
  const generation = useRef(0);
  const confirmationOpen = useRef(false);
  const resumeConfirmation = useRef<(() => void) | null>(null);
  const searchingHint = useRef(false);
  const hintGeneration = useRef(0);

  function closeConfirmation() {
    confirmationOpen.current = false;
    setConfirming(false);
    resumeConfirmation.current?.();
    resumeConfirmation.current = null;
  }

  function waitForConfirmation(): Promise<void> {
    if (!confirmationOpen.current) return Promise.resolve();
    return new Promise(resolve => { resumeConfirmation.current = resolve; });
  }

  useEffect(() => () => {
    generation.current++;
    resumeConfirmation.current?.();
    client.current?.dispose();
  }, []);

  async function connect(currentGame: GameState, currentSettings: Settings, id: number) {
    const engine = new StockfishClient(undefined, undefined, reason => {
      if (id !== generation.current || client.current !== engine) return;
      setEngineStatus('error');
      setError(reason.message);
    });
    client.current = engine;
    setEngineStatus('loading');
    setError('');
    try {
      await engine.init();
      if (id !== generation.current) return;
      setEngineStatus('ready');
      if (currentGame.status === 'active' && currentGame.chess.turn() !== currentSettings.color) {
        await computerTurn(currentGame, currentSettings, engine, id);
      }
    } catch (reason) {
      if (id !== generation.current) return;
      engine.dispose();
      setEngineStatus('error');
      setError(reason instanceof Error ? reason.message : 'Mesin catur mengalami kesalahan.');
    }
  }

  async function computerTurn(currentGame: GameState, currentSettings: Settings, engine: StockfishClient, id: number) {
    setEngineStatus('thinking');
    if (pendingAnalysis.current) {
      const before = await engine.search(pendingAnalysis.current, 20, 200);
      if (id !== generation.current) return;
      const after = await engine.search(currentGame.chess.fen(), 20, 200);
      if (id !== generation.current) return;
      if (before.score === null || after.score === null) throw new Error('Mesin tidak memberikan evaluasi posisi.');
      await waitForConfirmation();
      if (id !== generation.current) return;
      if (engine.state !== 'ready') throw new Error('Mesin catur gagal dimuat.');
      difficulty.current.record(Math.max(0, before.score + after.score));
      pendingAnalysis.current = null;
    }
    let move = beginnerReply(currentGame.chess, currentSettings.level);
    if (!move) {
      const level = currentSettings.level === 'adaptif' ? difficulty.current.skillLevel : fixedLevels[currentSettings.level];
      const result = await engine.search(currentGame.chess.fen(), level, 350);
      if (id !== generation.current) return;
      move = engineMove(currentGame.chess, result.move);
    } else {
      // Keep the computer's turn visible even when no engine search is needed.
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    if (id !== generation.current) return;
    await waitForConfirmation();
    if (id !== generation.current) return;
    if (engine.state !== 'ready') throw new Error('Mesin catur gagal dimuat.');
    if (currentGame.status !== 'active' || currentGame.chess.turn() === currentSettings.color || !currentGame.move(move)) {
      throw new Error('Mesin mengirim langkah yang tidak sah.');
    }
    redraw(value => value + 1);
    setEngineStatus('ready');
  }

  function start() {
    generation.current++;
    closeConfirmation();
    client.current?.dispose();
    const next = new GameState();
    const nextSettings = { color: selectedColor, level: selectedLevel };
    difficulty.current = new AdaptiveDifficulty();
    pendingAnalysis.current = null;
    searchingHint.current = false;
    setHintBusy(false);
    setHint(null);
    setFeedback('');
    setDismissedResult(null);
    setGame(next);
    setSettings(nextSettings);
    setGameNumber(value => value + 1);
    setStarted(true);
    void connect(next, nextSettings, generation.current);
  }

  function move(input: MoveInput) {
    if (!started || searchingHint.current || engineStatus !== 'ready' || game.chess.turn() !== settings.color || game.status !== 'active') return;
    const previous = game.chess.fen();
    if (!game.move(input)) return;
    setHint(null);
    setFeedback(learning ? explainMove(previous, input) : '');
    redraw(value => value + 1);
    if (game.result) return;
    pendingAnalysis.current = settings.level === 'adaptif' ? previous : null;
    const engine = client.current;
    if (!engine) { setEngineStatus('error'); setError('Mesin catur belum tersedia.'); return; }
    const id = generation.current;
    void computerTurn(game, settings, engine, id).catch(reason => {
      if (id !== generation.current) return;
      engine.dispose();
      setEngineStatus('error');
      setError(reason instanceof Error ? reason.message : 'Mesin catur mengalami kesalahan.');
    });
  }

  async function requestHint() {
    const engine = client.current;
    if (!learning || !started || confirming || searchingHint.current || engineStatus !== 'ready' ||
      game.status !== 'active' || game.chess.turn() !== settings.color || !engine) return;
    const id = generation.current;
    const hintId = hintGeneration.current;
    const fen = game.chess.fen();
    searchingHint.current = true;
    setHintBusy(true);
    setHint(null);
    try {
      const result = await engine.search(fen, 20, 300);
      if (id !== generation.current) return;
      if (hintId !== hintGeneration.current || game.status !== 'active' || game.chess.fen() !== fen) return;
      const suggested = engineMove(game.chess, result.move);
      setHint({ fen, move: suggested, text: `Saran: ${explainMove(fen, suggested)}` });
    } catch (reason) {
      if (id !== generation.current) return;
      engine.dispose();
      setEngineStatus('error');
      setError(reason instanceof Error ? reason.message : 'Saran langkah gagal dimuat.');
    } finally {
      if (id === generation.current) {
        searchingHint.current = false;
        setHintBusy(false);
      }
    }
  }

  const history = game.chess.history({ verbose: true });
  const clockRunning = started && game.status === 'active' && !confirming &&
    (engineStatus === 'ready' || engineStatus === 'thinking');
  const playerColor = started ? settings.color : selectedColor;
  const computerColor = playerColor === 'w' ? 'b' : 'w';
  return <main className="app">
    <header><p className="eyebrow">BERMAIN &amp; BELAJAR</p><h1>Ruang Catur</h1><p>Anda bermain sebagai {playerColor === 'w' ? 'Putih' : 'Hitam'} melawan komputer.</p></header>
    <nav className="view-navigation" aria-label="Navigasi permainan">
      <a href="#play-area">Papan</a>
      <a href="#game-panel">Pengaturan &amp; belajar</a>
      {learning && <a href="#learning-panel">Pelatih catur</a>}
    </nav>
    <div className="layout">
      <div className="play-area" id="play-area">
        <PlayerInfo key={`computer-${gameNumber}`} game={game} color={computerColor} playerColor={playerColor} running={clockRunning && game.chess.turn() === computerColor} />
        <ChessBoard key={generation.current} game={game} playerColor={playerColor} hint={learning && hint?.fen === game.chess.fen() ? hint.move : undefined}
          disabled={!started || hintBusy || engineStatus !== 'ready' || game.status !== 'active' || game.chess.turn() !== playerColor} onMove={move} />
        <PlayerInfo key={`player-${gameNumber}`} game={game} color={playerColor} playerColor={playerColor} running={clockRunning && game.chess.turn() === playerColor} />
      </div>
      <aside className="panel" id="game-panel" aria-live="polite">
        <h2>Pertandingan</h2>
        <GameStatus game={game} started={started} engineStatus={engineStatus} playerColor={playerColor} onClaim={() => {
          if (game.chess.turn() === settings.color && game.claimDraw()) redraw(value => value + 1);
        }} />
        <p>Langkah terakhir: <strong data-testid="last-move">{history.at(-1)?.san ?? 'Belum ada'}</strong></p>
        <MoveHistory moves={history} />
        {started && <p>Level saat ini: <strong>{levelNames[settings.level]}</strong></p>}
        <label className="learning-toggle"><input type="checkbox" checked={learning} onChange={event => {
          setLearning(event.target.checked);
          hintGeneration.current++;
          setHint(null);
          setFeedback('');
        }} /> Mode Belajar</label>
        {learning && <LearningPanel game={game} playerColor={playerColor} started={started}
          canHint={started && !confirming && !hintBusy && engineStatus === 'ready' && game.status === 'active' && game.chess.turn() === playerColor}
          hintBusy={hintBusy} hint={hint?.fen === game.chess.fen() ? hint.text : ''} feedback={feedback} onHint={() => { void requestHint(); }} />}
        {error && <div className="error" role="alert"><p>{error}</p><button onClick={() => {
          generation.current++;
          searchingHint.current = false;
          setHintBusy(false);
          setHint(null);
          client.current?.dispose();
          void connect(game, settings, generation.current);
        }}>Coba lagi</button></div>}
        <fieldset className="game-settings">
          <legend>{started ? 'Pengaturan permainan berikutnya' : 'Pengaturan permainan'}</legend>
          <label htmlFor="player-color">Warna Anda</label>
          <select id="player-color" value={selectedColor} onChange={event => {
            const value = event.target.value;
            if (value !== 'w' && value !== 'b') throw new Error('Warna pemain tidak valid.');
            setSelectedColor(value);
          }}>
            <option value="w">Putih</option>
            <option value="b">Hitam</option>
          </select>
          <label htmlFor="computer-level">Level komputer</label>
          <select id="computer-level" value={selectedLevel} onChange={event => {
            const value = event.target.value;
            if (!isLevel(value)) {
              throw new Error('Level komputer tidak valid.');
            }
            setSelectedLevel(value);
          }}>
            <option value="pemula">Pemula (latihan dasar)</option>
            <option value="sangat-mudah">Sangat Mudah</option>
            <option value="adaptif">Adaptif</option>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
          <small>{levelDescriptions[selectedLevel]}</small>
          <small>Baru belajar catur? Mulai dari Pemula dan aktifkan Mode Belajar.</small>
          {started && <small>Perubahan berlaku saat permainan baru dimulai.</small>}
        </fieldset>
        {!started && <button className="primary" onClick={start}>Mulai permainan</button>}
        {started && <button onClick={() => {
          if (game.status === 'active') {
            confirmationOpen.current = true;
            setConfirming(true);
          } else start();
        }}>Permainan baru</button>}
        {started && game.result && <button className="review-button" onClick={() => setDismissedResult(null)}>Lihat hasil &amp; pelajaran</button>}
      </aside>
    </div>
    {confirming && <NewGameDialog onCancel={closeConfirmation} onConfirm={start} />}
    {started && game.result && dismissedResult !== game.result && <GameResultDialog
      game={game} playerColor={settings.color} onDismiss={() => setDismissedResult(game.result)} onNewGame={start} />}
  </main>;
}
