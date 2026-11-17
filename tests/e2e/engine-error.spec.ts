import { expect, test } from '@playwright/test';

test('kesalahan mesin mempertahankan papan dan dapat dicoba ulang', async ({ page }) => {
  let workers = 0;
  await page.route('**/engine/stockfish-19-lite-single.js', route => {
    workers++;
    return route.fulfill({
      contentType: 'application/javascript',
      body: `onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('go')) {
          postMessage('info depth 1 score cp 0');
          postMessage('bestmove ${workers === 1 ? 'invalid' : 'e7e5'}');
        }
      };`,
    });

  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: /e2/ }).click();
  await page.getByRole('button', { name: /e4/ }).click();
  await expect(page.getByRole('alert')).toContainText('tidak valid');
  await expect(page.getByRole('button', { name: /e4 pion putih/ })).toBeVisible();
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByRole('button', { name: /e5 pion hitam/ })).toBeVisible();
});

test('kegagalan worker saat siap segera ditampilkan dan dapat dipulihkan', async ({ page }) => {
  let workers = 0;
  await page.route('**/engine/stockfish-19-lite-single.js', route => {
    workers++;
    return route.fulfill({
      contentType: 'application/javascript',
      body: `onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') {
          postMessage('readyok');
          ${workers === 1 ? "setTimeout(() => { throw new Error('worker failure'); }, 1500);" : ''}
        } else if(data.startsWith('go')) {
          postMessage('info depth 1 score cp 0');
          postMessage('bestmove e7e5');
        }
      };`,
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByLabel('Waktu Anda')).not.toHaveText('00:00');
  await expect(page.getByRole('alert')).toContainText('gagal');
  const stoppedTime = await page.getByLabel('Waktu Anda').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByLabel('Waktu Anda')).toHaveText(stoppedTime!);
  await expect(page.getByRole('button', { name: /e2 pion putih/ })).toBeVisible();
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  const seconds = (value: string) => value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  expect(seconds((await page.getByLabel('Waktu Anda').textContent())!)).toBeGreaterThanOrEqual(seconds(stoppedTime!));
  await page.getByRole('button', { name: /e2/ }).click();
  await page.getByRole('button', { name: /e4/ }).click();
  await expect(page.getByRole('button', { name: /e5 pion hitam/ })).toBeVisible();
});
