export type SearchResult = { move: string; score: number | null };
type Pending = { resolve: (value: string) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout>; target: string };

export class StockfishClient {
  state: 'loading' | 'ready' | 'thinking' | 'error' = 'loading';
  private worker: Worker | null = null;
  private pending: Pending | null = null;
  private score: number | null = null;

  constructor(
    private readonly createWorker: () => Worker = () => new Worker(`${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`),
    private readonly timeout = 20_000,
    private readonly onIdleError?: (error: Error) => void,
  ) {}

  async init(): Promise<void> {
    if (this.worker) throw new Error('Mesin catur sudah dimulai.');
    this.state = 'loading';
    try {
      this.worker = this.createWorker();
    } catch (error) {
      this.state = 'error';
      throw error;
    }
    const worker = this.worker;
    worker.onmessage = event => { if (this.worker === worker) this.receive(String(event.data)); };
    worker.onerror = () => {
      if (this.worker !== worker) return;
      const error = new Error('Mesin catur gagal dimuat.');
      const idle = this.pending === null;
      this.fail(error);
      if (idle) this.onIdleError?.(error);
    };
    await this.command('uci', 'uciok');
    await this.command('isready', 'readyok');
    if (this.worker !== worker) throw new Error('Mesin catur gagal dimuat.');
    this.state = 'ready';
  }

  async search(fen: string, level: number, milliseconds = 300): Promise<SearchResult> {
    if (!Number.isInteger(level) || level < 0 || level > 20) throw new Error('Tingkat mesin tidak valid.');
    if (!this.worker || this.state !== 'ready') throw new Error('Mesin catur belum siap.');
    const worker = this.worker;
    this.state = 'thinking';
    this.worker.postMessage(`setoption name Skill Level value ${level}`);
    this.worker.postMessage(fen === 'startpos' ? 'position startpos' : `position fen ${fen}`);
    this.score = null;
    const line = await this.command(`go movetime ${milliseconds}`, 'bestmove ');
    if (this.worker !== worker) throw new Error('Mesin catur gagal dimuat.');
    const move = line.split(/\s+/)[1];
    if (!move || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) {
      const error = new Error('Mesin mengirim langkah yang tidak valid.');
      this.fail(error);
      throw error;
    }
    this.state = 'ready';
    return { move, score: this.score };
  }

  dispose(): void {
    this.fail(new Error('Pencarian mesin dibatalkan.'));
  }

  private command(message: string, target: string): Promise<string> {
    if (!this.worker || this.pending) return Promise.reject(new Error('Mesin catur belum siap atau sedang bekerja.'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => this.fail(new Error('Waktu tunggu mesin catur habis.')), this.timeout);
      this.pending = { resolve, reject, timer, target };
      this.worker!.postMessage(message);
    });
  }

  private receive(line: string): void {
    if (this.pending?.target === 'bestmove ') {
      const match = line.match(/\bscore (cp|mate) (-?\d+)/);
      if (match) this.score = match[1] === 'mate' ? Math.sign(Number(match[2])) * 1000 : Math.max(-1000, Math.min(1000, Number(match[2])));
    }
    if (this.pending && line.startsWith(this.pending.target)) {
      const pending = this.pending;
      this.pending = null;
      clearTimeout(pending.timer);
      pending.resolve(line);
    }
  }

  private fail(error: Error): void {
    this.state = 'error';
    const pending = this.pending;
    this.pending = null;
    if (pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.worker?.terminate();
    this.worker = null;
  }
}
