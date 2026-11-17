import { describe, expect, it } from 'vitest';
import { AdaptiveDifficulty } from '../../src/game/adaptive-difficulty';

describe('kesulitan adaptif', () => {
  it.each(Array.from({ length: 100 }, (_, i) => i * 3))('menilai lima langkah dengan kehilangan %i cp', loss => {
    const policy = new AdaptiveDifficulty();
    expect(policy.skillLevel).toBe(10);
    for (let i = 0; i < 4; i++) policy.record(loss);
    expect(policy.skillLevel).toBe(10);
    policy.record(loss);
    expect(policy.skillLevel).toBe(loss <= 50 ? 11 : loss >= 200 ? 9 : 10);
  });

  it('menyimpan lima nilai terakhir dan membatasi tingkat 0–20', () => {
    const policy = new AdaptiveDifficulty();
    for (let i = 0; i < 30; i++) policy.record(0);
    expect(policy.skillLevel).toBe(20);
    for (let i = 0; i < 40; i++) policy.record(300);
    expect(policy.skillLevel).toBe(0);
    expect(policy.recentMoveLosses).toEqual([300, 300, 300, 300, 300]);
  });

  it.each([
    { losses: [0, 25, 50, 75, 100], average: 50, level: 11 },
    { losses: [0, 25, 50, 75, 105], average: 51, level: 10 },
    { losses: [100, 150, 200, 250, 295], average: 199, level: 10 },
    { losses: [100, 150, 200, 250, 300], average: 200, level: 9 },
  ])('menerapkan ambang inklusif pada rata-rata $average cp', ({ losses, level }) => {
    const policy = new AdaptiveDifficulty();
    losses.forEach(loss => policy.record(loss));
    expect(policy.skillLevel).toBe(level);
    expect(policy.recentMoveLosses).toEqual(losses);
  });

  it('menilai jendela campuran setelah nilai terlama keluar', () => {
    const policy = new AdaptiveDifficulty();
    [300, 0, 0, 0, 0].forEach(loss => policy.record(loss));
    expect(policy.skillLevel).toBe(10);
    policy.record(0);
    expect(policy.recentMoveLosses).toEqual([0, 0, 0, 0, 0]);
    expect(policy.skillLevel).toBe(11);
  });
});
