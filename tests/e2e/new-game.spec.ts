import { expect, test } from '@playwright/test';

test('batal mempertahankan papan dan konfirmasi membatalkan pencarian', async ({ page }) => {
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `onmessage = ({data}) => {
      if(data==='uci') postMessage('uciok');
      else if(data==='isready') postMessage('readyok');
      else if(data.startsWith('go')) setTimeout(() => { postMessage('info depth 1 score cp 0'); postMessage('bestmove e7e5'); }, 2500);
    };`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: /e2/ }).click();
  await page.getByRole('button', { name: /e4/ }).click();
  await expect(page.getByText(/Komputer berpikir/)).toBeVisible();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.getByRole('button', { name: 'Batal' }).click();
  await expect(page.getByRole('button', { name: /e4 pion putih/ })).toBeVisible();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByRole('button', { name: /e2 pion putih/ })).toBeVisible();
  await page.waitForTimeout(3000);
  await expect(page.getByRole('button', { name: /e7 pion hitam/ })).toBeVisible();
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
});

test('hasil komputer menunggu sampai konfirmasi dibatalkan', async ({ page }) => {
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `onmessage = ({data}) => {
      if(data==='uci') postMessage('uciok');
      else if(data==='isready') postMessage('readyok');
      else if(data.startsWith('go')) setTimeout(() => { postMessage('info depth 1 score cp 0'); postMessage('bestmove e7e5'); }, 250);
    };`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: /e2/ }).click();
  await page.getByRole('button', { name: /e4/ }).click();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByRole('button', { name: /e7 pion hitam/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /e5 kosong/ })).toBeVisible();
  await expect(page.getByTestId('last-move')).toHaveText('e4');
  await expect(page.getByText(/Komputer berpikir/)).toBeVisible();
  await page.getByRole('button', { name: 'Batal' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByTestId('last-move')).toHaveText('e5');
});

test('konfirmasi reset membuang hasil komputer yang sedang menunggu', async ({ page }) => {
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `onmessage = ({data}) => {
      if(data==='uci') postMessage('uciok');
      else if(data==='isready') postMessage('readyok');
      else if(data.startsWith('go')) setTimeout(() => { postMessage('info depth 1 score cp 0'); postMessage('bestmove e7e5'); }, 250);
    };`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: /e2/ }).click();
  await page.getByRole('button', { name: /e4/ }).click();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('last-move')).toHaveText('e4');
  await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
  await expect(page.getByRole('button', { name: /e2 pion putih/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /e7 pion hitam/ })).toBeVisible();
});
