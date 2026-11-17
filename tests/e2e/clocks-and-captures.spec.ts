import { expect, test } from '@playwright/test';

test('jam berganti giliran dan tangkapan tetap sampai permainan direset', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `let skill=10, replies=0;
      onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('setoption')) skill=Number(data.split(' ').pop());
        else if(data.startsWith('go')) setTimeout(() => {
          postMessage('info depth 1 score cp 0');
          postMessage('bestmove '+(skill===20 ? 'e2e4' : (++replies===1 ? 'd7d5' : 'd8d5')));
        }, 400);
      };`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByLabel('Waktu Anda')).not.toHaveText('00:00', { timeout: 5000 });
  await page.getByRole('button', { name: /^e2\b/ }).click();
  await page.getByRole('button', { name: /^e4\b/ }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Waktu Komputer')).not.toHaveText('00:00');
  await page.getByRole('button', { name: /^e4\b/ }).click();
  await page.getByRole('button', { name: /^d5\b/ }).click();
  await expect(page.getByRole('group', { name: 'Anda menangkap' }).getByLabel('pion hitam')).toBeVisible();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('group', { name: 'Komputer menangkap' }).getByLabel('pion putih')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole('button', { name: 'Permainan baru' }).click();
  const whiteTime = await page.getByLabel('Waktu Anda').textContent();
  const blackTime = await page.getByLabel('Waktu Komputer').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByLabel('Waktu Anda')).toHaveText(whiteTime!);
  await expect(page.getByLabel('Waktu Komputer')).toHaveText(blackTime!);
  await page.getByRole('button', { name: 'Batal' }).click();
  await expect(page.getByRole('group', { name: 'Anda menangkap' }).getByLabel('pion hitam')).toBeVisible();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
  await expect(page.getByLabel('Waktu Anda')).toHaveText('00:00');
  await expect(page.getByLabel('Waktu Komputer')).toHaveText('00:00');
  await expect(page.getByRole('group', { name: 'Anda menangkap' })).toContainText('Belum ada');
  await expect(page.getByRole('group', { name: 'Komputer menangkap' })).toContainText('Belum ada');
});
