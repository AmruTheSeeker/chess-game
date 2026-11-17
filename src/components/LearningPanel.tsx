import type { Color } from 'chess.js';
import type { GameState } from '../game/game-state';
import { positionLessons } from '../game/coaching';

export function LearningPanel({ game, playerColor, started, canHint, hintBusy, hint, feedback, onHint }: {
  game: GameState; playerColor: Color; started: boolean; canHint: boolean; hintBusy: boolean;
  hint: string; feedback: string; onHint: () => void;
}) {
  return <section className="learning-panel" id="learning-panel" aria-labelledby="learning-title">
    <h2 id="learning-title">Pelatih catur</h2>
    <p>{started ? 'Belajar dari posisi di papan:' : 'Baru belajar? Pilih level Pemula untuk berlatih gerak buah tanpa lawan yang mencari langkah terkuat.'}</p>
    <section className="learning-card learning-hints" aria-labelledby="learning-hint-title" aria-busy={hintBusy}>
      <h3 id="learning-hint-title">Saran langkah</h3>
      <div className="learning-actions">
        <button type="button" disabled={!canHint} aria-describedby="hint-help" onClick={onHint}>{hintBusy ? 'Mencari saran...' : 'Minta saran langkah'}</button>
        {started && <a className="learning-board-link" href="#play-area">Kembali ke papan</a>}
      </div>
      <p id="hint-help" className="hint-help">Saran tersedia saat giliran Anda. Petak asal dan tujuan ditandai biru; klik sendiri untuk mencoba. Saran bukan jaminan kemenangan.</p>
      {hint && <p className="coach-message" data-testid="coach-hint">{hint}</p>}
    </section>
    <div className="learning-grid">
      {feedback && <section className="learning-card" aria-labelledby="learning-feedback-title">
        <h3 id="learning-feedback-title">Pelajaran dari langkah Anda</h3>
        <p>{feedback}</p>
        <small>Ini penjelasan pola dan ancaman, bukan penilaian bahwa langkah Anda pasti terbaik.</small>
      </section>}
      <section className="learning-card" aria-labelledby="learning-position-title">
        <h3 id="learning-position-title">Tips sesuai posisi</h3>
        <ul>{positionLessons(game.chess, playerColor).map(lesson => <li key={lesson}>{lesson}</li>)}</ul>
      </section>
    </div>
    <details className="learning-card learning-strategies">
      <summary>Kenali strategi dasar</summary>
      <dl>
        <div><dt>Pusat dan pengembangan</dt><dd>Gerakkan pion pusat, keluarkan kuda dan gajah. Hindari terlalu sering menggerakkan buah yang sama saat pembukaan.</dd></div>
        <div><dt>Keamanan raja</dt><dd>Pertimbangkan rokade; jangan membuka pion pelindung raja tanpa alasan. Saat skak, keselamatan raja wajib didahulukan.</dd></div>
        <div><dt>Garpu</dt><dd>Satu buah menyerang dua sasaran sekaligus. Kuda sering membuat garpu terhadap raja dan ratu.</dd></div>
        <div><dt>Ikatan</dt><dd>Buah berada di depan sasaran penting pada satu jalur serangan. Jika sasaran di belakangnya raja, buah tidak boleh bergerak sampai rajanya aman.</dd></div>
        <div><dt>Pertukaran dan buah tergantung</dt><dd>Hitung tangkapan balik, bukan hanya tangkapan pertama. Buah yang diserang tanpa pelindung perlu perhatian.</dd></div>
        <div><dt>Akhir permainan</dt><dd>Aktifkan raja dengan aman dan bantu pion promosi. Saat unggul, hindari pat: lawan tanpa langkah legal tetapi tidak skak menghasilkan remis.</dd></div>
      </dl>
    </details>
  </section>;
}
