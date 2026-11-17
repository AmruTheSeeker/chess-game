import { describe, expect, it, vi } from 'vitest';
import { StockfishClient } from '../../src/engine/stockfish-client';

class FakeWorker {
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  sent: string[] = [];
  postMessage(message: string) { this.sent.push(message); }
  emit(message: string) { this.onmessage?.({ data: message } as MessageEvent<string>); }
  terminate = vi.fn();
}

describe('Stockfish worker', () => {
  it('melakukan handshake dan mengembalikan langkah', async () => {
    const worker = new FakeWorker();
    const client = new StockfishClient(() => worker as unknown as Worker);
    const ready = client.init();
    expect(worker.sent).toContain('uci');
    worker.emit('uciok');
    await Promise.resolve();
    worker.emit('readyok');
    await ready;
    const search = client.search('startpos', 10);
    worker.emit('info depth 4 score cp 20');
    worker.emit('bestmove e7e5');
    await expect(search).resolves.toMatchObject({ move: 'e7e5', score: 20 });
    client.dispose();
  });
  it('melaporkan timeout dan menghentikan worker', async () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = new StockfishClient(() => worker as unknown as Worker, 100);
    const result = client.init();
    const assertion = expect(result).rejects.toThrow(/waktu/i);
    await vi.advanceTimersByTimeAsync(101);
    await assertion;
    expect(worker.terminate).toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('melaporkan kesalahan worker dan mengabaikan pesan worker lama', async () => {
    const first = new FakeWorker();
    const second = new FakeWorker();
    const client = new StockfishClient(() => (first.terminate.mock.calls.length ? second : first) as unknown as Worker);
    const initial = client.init();
    first.onerror?.({} as ErrorEvent);
    await expect(initial).rejects.toThrow(/gagal/i);
    expect(client.state).toBe('error');
    const retry = client.init();
    first.emit('uciok');
    expect(second.sent).toEqual(['uci']);
    second.emit('uciok');
    await Promise.resolve();
    second.emit('readyok');
    await retry;
    expect(client.state).toBe('ready');
    client.dispose();
  });
  it('memberitahukan kesalahan worker setelah siap tanpa permintaan aktif', async () => {
    const worker = new FakeWorker();
    const onError = vi.fn();
    const client = new StockfishClient(() => worker as unknown as Worker, 1000, onError);
    const ready = client.init();
    worker.emit('uciok');
    await Promise.resolve();
    worker.emit('readyok');
    await ready;
    worker.onerror?.({} as ErrorEvent);
    expect(client.state).toBe('error');
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it('tidak melaporkan siap jika worker gagal sesaat setelah hasil pencarian', async () => {
    const worker = new FakeWorker();
    const onError = vi.fn();
    const client = new StockfishClient(() => worker as unknown as Worker, 1000, onError);
    const ready = client.init();
    worker.emit('uciok');
    await Promise.resolve();
    worker.emit('readyok');
    await ready;
    const search = client.search('startpos', 10);
    worker.emit('bestmove e2e4');
    worker.onerror?.({} as ErrorEvent);
    await expect(search).rejects.toThrow(/gagal/i);
    expect(client.state).toBe('error');
    expect(onError).toHaveBeenCalledOnce();
  });
});
