export function NewGameDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="dialog-backdrop">
    <section role="dialog" aria-modal="true" aria-labelledby="new-game-title" aria-describedby="new-game-description" className="dialog">
      <h2 id="new-game-title">Mulai permainan baru?</h2>
      <p id="new-game-description">Pertandingan saat ini akan berakhir dan posisi akan dihapus.</p>
      <div className="actions">
        <button autoFocus onClick={onCancel}>Batal</button>
        <button onClick={onConfirm}>Ya, mulai baru</button>
      </div>
    </section>
  </div>;
}
