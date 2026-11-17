import { expect, test, type Page } from '@playwright/test';

test.use({ hasTouch: true });

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
}

async function expectLearningFits(page: Page) {
  const layout = await page.locator('.learning-panel').evaluate(panel => {
    const bounds = panel.getBoundingClientRect();
    const elements = Array.from(panel.querySelectorAll('h2, h3, p, li, dt, dd, summary, button, a'))
      .filter(element => element.getClientRects().length > 0)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName, left: rect.left, right: rect.right, height: rect.height,
          fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
        };
      });
    return { left: bounds.left, right: bounds.right, elements };
  });
  for (const element of layout.elements) {
    expect(element.left).toBeGreaterThanOrEqual(layout.left);
    expect(element.right).toBeLessThanOrEqual(layout.right + 1);
    if (['P', 'LI', 'DD'].includes(element.tag)) expect(element.fontSize).toBeGreaterThanOrEqual(16);
    if (['BUTTON', 'A', 'SUMMARY'].includes(element.tag)) expect(element.height).toBeGreaterThanOrEqual(44);
  }
  await expectNoHorizontalOverflow(page);
}

async function expectBoardFits(page: Page) {
  const geometry = await page.locator('.board').evaluate(board => {
    const rect = board.getBoundingClientRect();
    return {
      width: rect.width, height: rect.height, left: rect.left, right: rect.right,
      viewportWidth: window.innerWidth,
      squares: Array.from(board.querySelectorAll('.square'), square => {
        const cell = square.getBoundingClientRect();
        const piece = square.querySelector('.piece')?.getBoundingClientRect();
        return { width: cell.width, height: cell.height, pieceWidth: piece?.width, pieceHeight: piece?.height };
      }),
    };
  });
  expect(Math.abs(geometry.width - geometry.height)).toBeLessThan(1);
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.squares).toHaveLength(64);
  for (const square of geometry.squares) {
    expect(square.width).toBeGreaterThanOrEqual(24);
    expect(Math.abs(square.width - square.height)).toBeLessThan(1);
    if (square.pieceWidth !== undefined && square.pieceHeight !== undefined) {
      expect(square.pieceWidth).toBeLessThanOrEqual(square.width);
      expect(square.pieceHeight).toBeLessThanOrEqual(square.height);
    }
  }
}

const viewports = [
  { width: 280, height: 653 },
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`papan, kontrol dan dialog tetap terjangkau pada ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `let replies=0;
        onmessage=({data})=>{
          if(data==='uci') postMessage('uciok');
          else if(data==='isready') postMessage('readyok');
          else if(data.startsWith('go')) {
            postMessage('info depth 1 score cp 0');
            postMessage('bestmove '+(++replies===1?'e7e5':'d8h4'));
          }
        };`,
    }));
    await page.goto('/');
    await expectBoardFits(page);
    await expectNoHorizontalOverflow(page);
    if (viewport.width >= 960) await expect(page.locator('.play-area')).toBeInViewport({ ratio: 1 });
    if (viewport.width < 960) {
      await page.getByRole('link', { name: 'Pengaturan & belajar' }).click();
      await expect(page.getByRole('heading', { name: 'Pertandingan', exact: true })).toBeInViewport();
    }
    await page.getByLabel('Level komputer').selectOption('mudah');
    await page.getByLabel('Mode Belajar').check();
    await page.getByText('Kenali strategi dasar', { exact: true }).click();
    await page.getByText('Saat unggul, hindari pat:', { exact: false }).scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
    const controls = await page.locator('.panel button, .panel select, .learning-toggle, .learning-panel summary').evaluateAll(elements =>
      elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, height: rect.height };
      }));
    for (const control of controls) {
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(viewport.width);
      expect(control.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    await expect(page.getByText(/Giliran Anda/)).toBeVisible();
    await page.getByRole('button', { name: 'Permainan baru', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Mulai permainan baru?' });
    await expect(confirmation).toBeInViewport({ ratio: 1 });
    await expect(confirmation.getByRole('button', { name: 'Batal' })).toBeInViewport({ ratio: 1 });
    await expect(confirmation.getByRole('button', { name: 'Ya, mulai baru' })).toBeInViewport({ ratio: 1 });
    await confirmation.getByRole('button', { name: 'Batal' }).click();
    if (viewport.width < 960) {
      await page.getByRole('link', { name: 'Papan', exact: true }).click();
      await expect(page.getByRole('region', { name: 'Komputer', exact: true })).toBeInViewport();
    }
    for (const [from, to] of [['f2', 'f3'], ['g2', 'g4']]) {
      await expect(page.getByText(/Giliran Anda/)).toBeVisible();
      await page.getByRole('button', { name: new RegExp(`^${from} `) }).tap();
      await page.getByRole('button', { name: new RegExp(`^${to} `) }).tap();
    }
    const result = page.getByRole('dialog', { name: 'Anda kalah, tetapi bisa belajar!' });
    await expect(result).toBeInViewport({ ratio: 1 });
    await expect(result.getByRole('heading', { name: 'Anda kalah, tetapi bisa belajar!' })).toBeInViewport();
    for (const name of ['Lihat papan & riwayat', 'Main lagi']) {
      await expect(result.getByRole('button', { name })).toBeInViewport({ ratio: 1 });
    }
    await expect(result.getByRole('button', { name: 'Lihat papan & riwayat' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    const content = result.getByRole('region', { name: 'Pelajaran pertandingan' });
    await expect(content).toBeFocused();
    await page.keyboard.press('End');
    await expect.poll(() => content.evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThanOrEqual(2);
    await result.getByRole('heading', { name: 'Latihan pembukaan berikutnya' }).scrollIntoViewIfNeeded();
    await content.evaluate(element => { element.scrollTop = element.scrollHeight; });
    expect(await content.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    await expectNoHorizontalOverflow(page);
    await result.getByRole('button', { name: 'Lihat papan & riwayat' }).click();
    await expectBoardFits(page);
    if (viewport.width === 390) {
      await page.setViewportSize({ width: 844, height: 390 });
      await expectBoardFits(page);
      await expectNoHorizontalOverflow(page);
    }
    if (viewport.width === 1440) {
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      await expectNoHorizontalOverflow(page);
      await page.getByRole('button', { name: 'Lihat hasil & pelajaran' }).click();
      const enlargedResult = page.getByRole('dialog', { name: 'Anda kalah, tetapi bisa belajar!' });
      await expect(enlargedResult).toBeInViewport({ ratio: 1 });
      await expect(enlargedResult.getByRole('button', { name: 'Lihat papan & riwayat' })).toBeInViewport({ ratio: 1 });
    }
  });
}

for (const viewport of viewports) {
  test(`mode belajar tetap terbaca dan saran bisa dicoba pada ${viewport.width}x${viewport.height}`, async ({ page }) => {
    const black = viewport.width === 1440;
    await page.setViewportSize(viewport);
    await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `let fen='';
        onmessage=({data})=>{
          if(data==='uci') postMessage('uciok');
          else if(data==='isready') postMessage('readyok');
          else if(data.startsWith('position fen ')) fen=data.slice(13);
          else if(data.startsWith('go')) {
            const rows=fen.split(' ')[0].split('/');
            const move=fen.includes(' w ')
              ? (rows[6]==='PPPPPPPP'?'e2e4':'g1f3')
              : (rows[1]==='pppppppp'?'e7e5':'g8f6');
            setTimeout(()=>postMessage('bestmove '+move), 400);
          }
        };`,
    }));
    await page.goto('/');
    if (black) await page.getByLabel('Warna Anda').selectOption('b');
    await page.getByLabel('Level komputer').selectOption('mudah');
    await page.getByLabel('Mode Belajar').check();
    const coach = page.getByRole('region', { name: 'Pelatih catur', exact: true });
    await expect(coach.getByRole('button', { name: 'Minta saran langkah' })).toBeDisabled();
    if (viewport.width < 960) {
      await page.getByRole('link', { name: 'Pelatih catur', exact: true }).tap();
      await expect(coach.getByRole('heading', { name: 'Pelatih catur' })).toBeInViewport();
    }
    await expectLearningFits(page);
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    await expect(page.getByText(/Giliran Anda/)).toBeVisible();
    await coach.getByRole('button', { name: 'Minta saran langkah' }).tap();
    await expect(coach.getByRole('button', { name: 'Mencari saran...' })).toBeDisabled();
    await expect(page.getByTestId('coach-hint')).toContainText(black ? 'e7 ke e5' : 'e2 ke e4');
    await expect(page.locator('.square.hinted')).toHaveCount(2);
    await expectLearningFits(page);
    if (viewport.width === 390) {
      await page.setViewportSize({ width: 844, height: 390 });
      await expectLearningFits(page);
      await expect(page.locator('.square.hinted')).toHaveCount(2);
    }
    await coach.getByRole('link', { name: 'Kembali ke papan' }).tap();
    await expect(page.getByRole('region', { name: 'Komputer', exact: true })).toBeInViewport();
    for (const square of black ? ['e7', 'e5'] : ['e2', 'e4']) {
      await page.getByRole('button', { name: new RegExp(`^${square} `) }).tap();
    }
    await expect(page.getByText(/Giliran Anda/)).toBeVisible();
    await expect(coach.getByRole('heading', { name: 'Pelajaran dari langkah Anda' })).toBeVisible();
    await expect(page.getByTestId('coach-hint')).toHaveCount(0);
    const feedback = await coach.getByRole('region', { name: 'Pelajaran dari langkah Anda' }).boundingBox();
    const tips = await coach.getByRole('region', { name: 'Tips sesuai posisi' }).boundingBox();
    if (!feedback || !tips) throw new Error('Kartu pelajaran tidak terlihat.');
    if (viewport.width <= 320) expect(tips.y).toBeGreaterThan(feedback.y + feedback.height);
    if (viewport.width === 768) {
      expect(Math.abs(tips.y - feedback.y)).toBeLessThan(1);
      expect(tips.x).toBeGreaterThan(feedback.x);
    }
    const strategies = coach.locator('summary');
    await strategies.focus();
    await page.keyboard.press('Enter');
    await expect(coach.locator('details')).toHaveAttribute('open', '');
    await coach.getByText(/Saat unggul, hindari pat:/).scrollIntoViewIfNeeded();
    await expectLearningFits(page);
    if (black) {
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      await expectLearningFits(page);
    }
    await coach.getByRole('button', { name: 'Minta saran langkah' }).tap();
    await expect(page.getByTestId('coach-hint')).toContainText(black ? 'g8 ke f6' : 'g1 ke f3');
    await expectLearningFits(page);
    await page.getByLabel('Mode Belajar').uncheck();
    await expect(coach).toHaveCount(0);
    await expect(page.locator('.square.hinted')).toHaveCount(0);
    if (viewport.width < 960) await expect(page.getByRole('link', { name: 'Pelatih catur', exact: true })).toHaveCount(0);
  });
}
