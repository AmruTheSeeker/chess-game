import { expect, test } from '@playwright/test';

test('skakmat mengunci papan dan menampilkan pemenang', async ({ page }) => {
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `let skill=10, replies=0;
      onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('setoption')) skill=Number(data.split(' ').pop());
        else if(data.startsWith('go')) {
          postMessage('info depth 1 score cp 0');
          postMessage('bestmove '+(skill===20 ? 'e2e4' : (++replies===1 ? 'e7e5' : 'd8h4')));
        }
      };`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  for (const [from, to] of [['f2', 'f3'], ['g2', 'g4']]) {
    await page.getByRole('button', { name: new RegExp(from) }).click();
    await page.getByRole('button', { name: new RegExp(to) }).click();
    if (to === 'f3') await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  }
  const result = page.getByRole('dialog', { name: 'Anda kalah, tetapi bisa belajar!' });
  await expect(result).toBeVisible();
  await expect(result.getByText(/Anda: Putih.*2 langkah/)).toBeVisible();
  await expect(result.getByRole('heading', { name: 'Latihan pembukaan berikutnya' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(result).not.toBeVisible();
  await expect(page.getByText(/skakmat.*hitam menang/i)).toBeVisible();
  await page.getByRole('button', { name: 'Lihat hasil & pelajaran' }).click();
  await expect(result).toBeVisible();
  await result.getByRole('button', { name: 'Lihat papan & riwayat' }).click();
  await expect(page.getByRole('button', { name: /e2/ })).toBeDisabled();
  const whiteTime = await page.getByLabel('Waktu Anda').textContent();
  const blackTime = await page.getByLabel('Waktu Komputer').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByLabel('Waktu Anda')).toHaveText(whiteTime!);
  await expect(page.getByLabel('Waktu Komputer')).toHaveText(blackTime!);
  const before = await page.locator('.board').innerHTML();
  await page.getByRole('button', { name: /e2/ }).dispatchEvent('click');
  await expect(page.locator('.board')).toHaveJSProperty('innerHTML', before);
  await expect(page.getByText(/skakmat.*hitam menang/i)).toBeVisible();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByRole('button', { name: /e2 pion putih/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Lihat hasil & pelajaran' })).toHaveCount(0);
});

test('kemenangan manusia Hitam menawarkan main lagi dengan hasil baru yang bersih', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `let replies=0;
      onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('go')) {
          postMessage('info depth 1 score cp 0');
          postMessage('bestmove '+(++replies===1 ? 'f2f3' : 'g2g4'));
        }
      };`,
  }));
  await page.goto('/');
  await page.getByLabel('Warna Anda').selectOption('b');
  await page.getByLabel('Level komputer').selectOption('mudah');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: /e7 pion hitam/ }).click();
  await page.getByRole('button', { name: /^e5 / }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: /d8 ratu hitam/ }).click();
  await page.getByRole('button', { name: /^h4 / }).click();
  const result = page.getByRole('dialog', { name: 'Selamat, Anda menang!' });
  await expect(result).toBeVisible();
  await expect(result.getByText(/Anda: Hitam/)).toBeVisible();
  await expect(result.getByText(/Langkah terakhir: 2\.\.\. Qh4#/)).toBeVisible();
  await expect(result.getByRole('heading', { name: 'Selamat, Anda menang!' })).toBeInViewport();
  await expect(result.getByRole('button', { name: 'Lihat papan & riwayat' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(result.getByRole('button', { name: 'Main lagi' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(result.getByRole('button', { name: 'Lihat papan & riwayat' })).toBeFocused();
  await result.getByRole('button', { name: 'Main lagi' }).click();
  await expect(result).not.toBeVisible();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lihat hasil & pelajaran' })).toHaveCount(0);
});

test('klaim pengulangan membuka pop-up remis beserta penyebabnya', async ({ page }) => {
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `let replies=0;
      onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('go')) {
          postMessage('info depth 1 score cp 0');
          postMessage('bestmove '+(++replies%2 ? 'g8f6' : 'f6g8'));
        }
      };`,
  }));
  await page.goto('/');
  await page.getByLabel('Level komputer').selectOption('mudah');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  for (const [from, to] of [['g1', 'f3'], ['f3', 'g1'], ['g1', 'f3'], ['f3', 'g1']]) {
    await expect(page.getByText(/Giliran Anda/)).toBeVisible();
    await page.getByRole('button', { name: new RegExp(`${from} kuda putih`) }).click();
    await page.getByRole('button', { name: new RegExp(`^${to} `) }).click();
  }
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: 'Klaim remis (pengulangan tiga kali)' }).click();
  const result = page.getByRole('dialog', { name: 'Pertandingan remis (seri)!' });
  await expect(result).toBeVisible();
  await expect(result.locator('.result-banner').getByText(/berulang tiga kali/)).toBeVisible();
  await result.getByRole('button', { name: 'Lihat papan & riwayat' }).click();
  await expect(page.getByText('Remis — pengulangan tiga kali')).toBeVisible();
  await expect(page.getByRole('button', { name: /g1 kuda putih/ })).toBeDisabled();
});
