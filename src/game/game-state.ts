import { Chess, type Square, type PieceSymbol } from 'chess.js';

export type ResultReason = 'skakmat' | 'pat' | 'materi-tidak-cukup' | 'pengulangan' | 'lima-puluh-langkah';
export type GameResult = { winner: 'w' | 'b' | null; reason: ResultReason };
export type MoveInput = { from: Square; to: Square; promotion?: PieceSymbol };

export class GameState {
  readonly chess: Chess;
  status: 'active' | 'finished' = 'active';
  result: GameResult | null = null;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
    this.updateResult();
  }

  move(input: MoveInput): boolean {
    if (this.status !== 'active') return false;
    const options = this.chess.moves({ square: input.from, verbose: true }).filter(move => move.to === input.to);
    if (!options.some(move => move.promotion === input.promotion)) return false;
    this.chess.move(input);
    this.updateResult();
    return true;
  }

  claimable(): ResultReason | null {
    if (this.status !== 'active') return null;
    if (this.chess.isThreefoldRepetition()) return 'pengulangan';
    if (this.chess.isDrawByFiftyMoves()) return 'lima-puluh-langkah';
    return null;
  }

  claimDraw(): boolean {
    const reason = this.claimable();
    if (!reason) return false;
    this.result = { winner: null, reason };
    this.status = 'finished';
    return true;
  }

  private updateResult(): void {
    if (this.chess.isCheckmate()) {
      this.result = { winner: this.chess.turn() === 'w' ? 'b' : 'w', reason: 'skakmat' };
    } else if (this.chess.isStalemate()) {
      this.result = { winner: null, reason: 'pat' };
    } else if (this.chess.isInsufficientMaterial()) {
      this.result = { winner: null, reason: 'materi-tidak-cukup' };
    }
    if (this.result) this.status = 'finished';
  }
}
