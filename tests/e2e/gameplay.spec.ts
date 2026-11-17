import { expect, test, type Page } from '@playwright/test';

async function squareGeometry(page: Page) {
  const squares = await page.locator('.board > .square').evaluateAll(elements => {
    const board = elements[0].parentElement!.getBoundingClientRect();
    return elements.map(element => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x: x - board.x, y: y - board.y, width, height };
    });
  });
  expect(squares).toHaveLength(64);
  for (const [index, square] of squares.entries()) {
    expect(Math.abs(square.width - square.height), `petak ${index} harus persegi`).toBeLessThan(0.2);
    expect(Math.abs(square.width - squares[0].width), `lebar petak ${index}`).toBeLessThan(0.2);
    expect(Math.abs(square.height - squares[0].height), `tinggi petak ${index}`).toBeLessThan(0.2);
  }
  return squares;
}

function expectSameGeometry(before: Awaited<ReturnType<typeof squareGeometry>>, after: Awaited<ReturnType<typeof squareGeometry>>) {
  for (let i = 0; i < before.length; i++) {
    for (const field of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(before[i][field] - after[i][field]), `petak ${i}, ${field}`).toBeLessThan(0.2);
    }
  }
}

for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }, { width: 1280, height: 800 }]) {
  test(`melawan komputer pada ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const initial = await squareGeometry(page);
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    await expect(page.getByText('Giliran Anda', { exact: false })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /e2/ }).click();
    await page.getByRole('button', { name: /e4/ }).click();
    await expect(page.getByText('Komputer berpikir', { exact: false })).toBeVisible({ timeout: 1000 });
    expectSameGeometry(initial, await squareGeometry(page));
    await expect(page.getByText('Giliran Anda', { exact: false })).toBeVisible({ timeout: 20000 });
    expectSameGeometry(initial, await squareGeometry(page));
    await expect(page.getByTestId('last-move')).not.toHaveText('Belum ada');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) {
  test(`pembaruan kedua sisi dalam satu detik pada ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        constructor(url, options) {
          super(url, options);
          let bestMoves = 0;
          this.addEventListener('message', event => {
            if (typeof event.data !== 'string' || !event.data.startsWith('bestmove ')) return;
            bestMoves++;
            if (bestMoves % 3 !== 0) return;
            const start = performance.now();
            const previous = document.querySelector('[data-testid="last-move"]')?.textContent;
            const destination = event.data.split(/\s+/)[1].slice(2, 4);
            const update = () => {
              const last = document.querySelector('[data-testid="last-move"]')?.textContent;
              const status = document.querySelector('.status')?.textContent;
              const moved = document.querySelector(`[aria-label^="${destination} "][aria-label$=" hitam"]`);
              const elapsed = performance.now() - start;
              if (moved && last && last !== previous && status?.includes('Giliran Anda')) {
                document.body.dataset.blackMoveTime = String(elapsed);
              } else if (elapsed >= 2000) {
                document.body.dataset.blackMoveTime = 'Infinity';
              } else requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
          });
        }
      };
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    const measurements: number[] = [];
    const openingMoves = [['e2', 'e4'], ['d2', 'd4'], ['g1', 'f3'], ['c2', 'c4'], ['b1', 'c3']];
    for (let i = 0; i < 10; i++) {
      const [from, to] = openingMoves[i % openingMoves.length];
      await expect(page.getByText(/Giliran Anda/)).toBeVisible({ timeout: 20000 });
      await page.getByRole('button', { name: new RegExp(`^${from}\\b`) }).click();
      await page.evaluate(destination => {
        const target = document.querySelector<HTMLButtonElement>(`[aria-label="${destination} kosong"]`);
        if (!target) throw new Error('Petak tujuan tidak ditemukan.');
        target.addEventListener('click', () => {
          const start = performance.now();
          const update = () => {
            const elapsed = performance.now() - start;
            if (document.querySelector(`[aria-label^="${destination} "][aria-label$=" putih"]`) &&
                document.querySelector('.status')?.textContent?.includes('Komputer berpikir')) {
              document.body.dataset.whiteMoveTime = String(elapsed);
            } else if (elapsed >= 2000) {
              document.body.dataset.whiteMoveTime = 'Infinity';
            } else requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        }, { once: true });
      }, to);
      await page.getByRole('button', { name: new RegExp(`^${to}\\b`) }).click();
      await expect.poll(() => page.locator('body').getAttribute('data-white-move-time')).not.toBeNull();
      await expect.poll(() => page.locator('body').getAttribute('data-black-move-time'), { timeout: 20000 }).not.toBeNull();
      measurements.push(Number(await page.locator('body').getAttribute('data-white-move-time')));
      measurements.push(Number(await page.locator('body').getAttribute('data-black-move-time')));
      await page.evaluate(() => {
        delete document.body.dataset.whiteMoveTime;
        delete document.body.dataset.blackMoveTime;
      });
      if (i < 9) {
        await page.getByRole('button', { name: 'Permainan baru' }).click();
        await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
      }
    }
    const withinOneSecond = measurements.filter(time => time <= 1000).length;
    console.log(`${viewport.width}px: ${withinOneSecond}/${measurements.length} langkah dalam satu detik`);
    expect(withinOneSecond).toBeGreaterThanOrEqual(19);
  });
}
