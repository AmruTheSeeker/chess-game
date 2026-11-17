export class AdaptiveDifficulty {
  skillLevel = 10;
  recentMoveLosses: number[] = [];

  record(loss: number): void {
    if (!Number.isFinite(loss) || loss < 0) throw new Error('Nilai kualitas langkah tidak valid.');
    this.recentMoveLosses = [...this.recentMoveLosses, loss].slice(-5);
    if (this.recentMoveLosses.length < 5) return;
    const average = this.recentMoveLosses.reduce((sum, value) => sum + value, 0) / 5;
    if (average <= 50) this.skillLevel = Math.min(20, this.skillLevel + 1);
    else if (average >= 200) this.skillLevel = Math.max(0, this.skillLevel - 1);
  }
}
