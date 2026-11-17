import { expect, test } from '@playwright/test';

test('belajar dengan saran Stockfish asli dan balasan Pemula pada layar kecil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByLabel('Level komputer').selectOption('pemula');
  await page.getByLabel('Mode Belajar').check();
  await expect(page.getByRole('button', { name: 'Minta saran langkah' })).toBeDisabled();
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: 'Minta saran langkah' }).click();
  await expect(page.getByTestId('coach-hint')).toContainText('Saran:', { timeout: 20000 });
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
  await expect(page.locator('.square.hinted')).toHaveCount(2);
  const from = page.locator('.square.hinted[aria-label*="putih"]');
  const to = page.locator('.square.hinted[aria-label*="kosong"]');
  await from.click();
  await to.click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await expect(page.locator('.move-history li')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Pelajaran dari langkah Anda' })).toBeVisible();
  await expect(page.locator('.square.hinted')).toHaveCount(0);
  await expect(page.getByText(/Level saat ini:/)).toContainText('Pemula');
  await page.getByLabel('Mode Belajar').uncheck();
  await expect(page.getByRole('heading', { name: 'Pelatih catur' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const { level, random, skills } of [
  { level: 'pemula', random: 0, skills: '' },
  { level: 'sangat-mudah', random: 0, skills: '' },
  { level: 'sangat-mudah', random: 0.9, skills: '0,' },
]) {
  test(`level ${level} membalas pemain Hitam dengan random ${random}`, async ({ page }) => {
    await page.addInitScript(({ random }) => {
      Math.random = () => random;
      document.addEventListener('DOMContentLoaded', () => { document.body.dataset.skills = ''; });
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        postMessage(message: string) {
          if (message.startsWith('setoption name Skill Level value ')) {
            document.body.dataset.skills += `${message.split(' ').pop()},`;
          }
          super.postMessage(message);
        }
      };
    }, { random });
    await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `onmessage=({data})=>{
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('go')) postMessage('bestmove e2e4');
      };`,
    }));
    await page.goto('/');
    await page.getByLabel('Warna Anda').selectOption('b');
    await page.getByLabel('Level komputer').selectOption(level);
    await page.getByLabel('Mode Belajar').check();
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
    await expect(page.locator('.move-history')).toContainText('Putih: pion');
    await expect(page.locator('body')).toHaveAttribute('data-skills', skills);
    await expect(page.getByRole('button', { name: 'Minta saran langkah' })).toBeEnabled();
  });
}

test('saran tidak sah menampilkan kesalahan dan coba lagi mempertahankan posisi', async ({ page }) => {
  let workers = 0;
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `onmessage=({data})=>{
      if(data==='uci') postMessage('uciok');
      else if(data==='isready') postMessage('readyok');
      else if(data.startsWith('go')) postMessage('bestmove ${++workers === 1 ? 'e2e5' : 'e2e4'}');
    };`,
  }));
  await page.goto('/');
  await page.getByLabel('Mode Belajar').check();
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: 'Minta saran langkah' }).click();
  await expect(page.getByRole('alert')).toContainText('tidak sah');
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expect(page.getByRole('button', { name: 'Minta saran langkah' })).toBeEnabled();
  await page.getByRole('button', { name: 'Minta saran langkah' }).click();
  await expect(page.getByTestId('coach-hint')).toContainText('e2 ke e4');
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
});

test('saran tidak memengaruhi level lawan dan dibersihkan saat permainan baru', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: string) {
        if (message.startsWith('setoption name Skill Level value ')) {
          document.body.dataset.skills = `${document.body.dataset.skills ?? ''}${message.split(' ').pop()},`;
        }
        super.postMessage(message);
      }
    };
  });
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `let searches=0;
      onmessage=({data})=>{
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('go')) setTimeout(()=>{
          postMessage('bestmove '+(++searches===1 ? 'e2e4' : 'e7e5'));
        }, 300);
      };`,
  }));
  await page.goto('/');
  await page.getByLabel('Level komputer').selectOption('mudah');
  await page.getByLabel('Mode Belajar').check();
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: 'Minta saran langkah' }).click();
  await expect(page.getByRole('button', { name: /e2 pion putih/ })).toBeDisabled();
  await expect(page.getByTestId('coach-hint')).toContainText('pusat');
  await page.getByRole('button', { name: /e2 pion putih/ }).click();
  await page.getByRole('button', { name: /e4 kosong/ }).click();
  await expect(page.getByRole('button', { name: /e5 pion hitam/ })).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-skills', '20,3,');
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
  await expect(page.getByTestId('coach-hint')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Pelajaran dari langkah Anda' })).toHaveCount(0);
});

test('hasil saran lama diabaikan saat mode belajar dimatikan atau permainan diulang', async ({ page }) => {
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `onmessage=({data})=>{
      if(data==='uci') postMessage('uciok');
      else if(data==='isready') postMessage('readyok');
      else if(data.startsWith('go')) setTimeout(()=>postMessage('bestmove e2e4'), 700);
    };`,
  }));
  await page.goto('/');
  await page.getByLabel('Mode Belajar').check();
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda/)).toBeVisible();
  await page.getByRole('button', { name: 'Minta saran langkah' }).click();
  await page.getByLabel('Mode Belajar').uncheck();
  await page.getByLabel('Mode Belajar').check();
  await expect(page.getByRole('button', { name: 'Minta saran langkah' })).toBeEnabled();
  await expect(page.getByTestId('coach-hint')).toHaveCount(0);
  await page.getByRole('button', { name: 'Minta saran langkah' }).click();
  await page.getByRole('button', { name: 'Permainan baru' }).click();
  await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
  await expect(page.getByRole('button', { name: 'Minta saran langkah' })).toBeEnabled();
  await expect(page.getByTestId('coach-hint')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const { level, skill } of [
  { level: 'mudah', skill: 3 },
  { level: 'sedang', skill: 10 },
  { level: 'sulit', skill: 18 },
]) {
  test(`pemain Hitam melawan level ${level} yang tetap`, async ({ page }) => {
    await page.addInitScript(() => {
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        postMessage(message: string) {
          if (message.startsWith('setoption name Skill Level value ')) {
            const level = message.split(' ').pop();
            document.body.dataset.skills = `${document.body.dataset.skills ?? ''}${level},`;
          }
          super.postMessage(message);
        }
      };
    });
    await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `let replies=0;
        onmessage = ({data}) => {
          if(data==='uci') postMessage('uciok');
          else if(data==='isready') postMessage('readyok');
          else if(data.startsWith('go')) {
            postMessage('info depth 1 score cp 0');
            postMessage('bestmove '+(++replies===1 ? 'e2e4' : 'g1f3'));
          }
        };`,
    }));
    await page.goto('/');
    await page.getByLabel('Warna Anda').selectOption('b');
    await page.getByLabel('Level komputer').selectOption(level);
    await expect(page.locator('.board > .square').first()).toHaveAttribute('aria-label', /h1/);
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
    await expect(page.getByRole('button', { name: /e4 pion putih/ })).toBeVisible();
    await expect(page.getByLabel('Waktu Anda')).toBeVisible();
    if (level === 'sulit') {
      await page.getByLabel('Warna Anda').selectOption('w');
      await page.getByLabel('Level komputer').selectOption('mudah');
    }
    await page.getByRole('button', { name: /e7 pion hitam/ }).click();
    await page.getByRole('button', { name: /e5 kosong/ }).click();
    await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
    await expect(page.getByRole('button', { name: /f3 kuda putih/ })).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-skills', `${skill},${skill},`);
    if (level === 'sulit') {
      await page.getByRole('button', { name: 'Permainan baru' }).click();
      await page.getByRole('button', { name: 'Batal' }).click();
      await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
      await expect(page.locator('.board > .square').first()).toHaveAttribute('aria-label', /h1/);
      await page.getByRole('button', { name: 'Permainan baru' }).click();
      await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
      await expect(page.getByText(/Giliran Anda.*Putih/)).toBeVisible();
      await expect(page.locator('.board > .square').first()).toHaveAttribute('aria-label', /a8/);
      await expect(page.getByText(/Level saat ini:/)).toContainText('Mudah');
    }
  });
}

for (const { description, afterScore, expectedLevel } of [
  { description: 'kuat', afterScore: -200, expectedLevel: 11 },
  { description: 'lemah', afterScore: 100, expectedLevel: 9 },
]) {
test(`mode adaptif menilai langkah ${description} pemain Hitam`, async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: string) {
        if (message.startsWith('setoption name Skill Level value ')) {
          document.body.dataset.skills = `${document.body.dataset.skills ?? ''}${message.split(' ').pop()},`;
        }
        super.postMessage(message);
      }
    };
  });
  await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `let skill=10, replies=0, analyses=0;
      const moves=['e2e4','g1f3','f1c4','d2d3','b1c3','a2a3'];
      onmessage = ({data}) => {
        if(data==='uci') postMessage('uciok');
        else if(data==='isready') postMessage('readyok');
        else if(data.startsWith('setoption')) skill=Number(data.split(' ').pop());
        else if(data.startsWith('go')) {
          const score = skill===20 ? (++analyses % 2 ? 200 : ${afterScore}) : 0;
          postMessage('info depth 1 score cp '+score);
          postMessage('bestmove '+(skill===20 ? 'e2e4' : moves[replies++]));
        }
      };`,
  }));
  await page.goto('/');
  await page.getByLabel('Warna Anda').selectOption('b');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  for (const [from, to] of [['e7', 'e5'], ['b8', 'c6'], ['g8', 'f6'], ['f8', 'c5'], ['d7', 'd6']]) {
    await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
    await page.getByRole('button', { name: new RegExp(`^${from}\\b`) }).click();
    await page.getByRole('button', { name: new RegExp(`^${to}\\b`) }).click();
    await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
  }
  await expect(page.locator('body')).toHaveAttribute('data-skills', `10,20,20,10,20,20,10,20,20,10,20,20,10,20,20,${expectedLevel},`);
});
}

test('coba ulang melanjutkan giliran komputer ketika pemain memilih Hitam', async ({ page }) => {
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
          postMessage('bestmove ${workers === 1 ? 'invalid' : 'e2e4'}');
        }
      };`,
    });
  });
  await page.goto('/');
  await page.getByLabel('Warna Anda').selectOption('b');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByRole('alert')).toContainText('tidak valid');
  await expect(page.getByTestId('last-move')).toHaveText('Belum ada');
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible();
  await expect(page.getByRole('button', { name: /e4 pion putih/ })).toBeVisible();
});

test('Stockfish asli membuka permainan saat pemain memilih Hitam', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByLabel('Warna Anda').selectOption('b');
  await page.getByRole('button', { name: 'Mulai permainan' }).click();
  await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId('last-move')).not.toHaveText('Belum ada');
  const pawn = page.getByRole('button', { name: /e7 pion hitam/ });
  if (await pawn.isVisible()) {
    await pawn.click();
    const destination = page.locator('.square[data-legal="true"]').first();
    await expect(destination).toBeVisible();
    await destination.click();
    await expect(page.getByText(/Giliran Anda.*Hitam/)).toBeVisible({ timeout: 20000 });
  } else {
    throw new Error('Pion Hitam e7 seharusnya masih berada di posisi awal.');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const color of ['w', 'b']) {
  test(`catatan dan penanda langkah mengikuti pemain ${color === 'w' ? 'Putih' : 'Hitam'}`, async ({ page }) => {
    await page.route('**/engine/stockfish-19-lite-single.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: `let replies=0;
        onmessage = ({data}) => {
          if(data==='uci') postMessage('uciok');
          else if(data==='isready') postMessage('readyok');
          else if(data.startsWith('go')) setTimeout(() => {
            postMessage('info depth 1 score cp 0');
            postMessage('bestmove '+(${JSON.stringify(color)}==='w' ? 'e7e5' : (++replies===1 ? 'e2e4' : 'g1f3')));
          }, 1000);
        };`,
    }));
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.getByLabel('Warna Anda').selectOption(color);
    await page.getByLabel('Level komputer').selectOption('mudah');
    await page.getByRole('button', { name: 'Mulai permainan' }).click();
    await expect(page.getByText(/Giliran Anda/)).toBeVisible();
    const from = color === 'w' ? 'e2' : 'e7';
    const to = color === 'w' ? 'e4' : 'e5';
    await page.getByRole('button', { name: new RegExp(`^${from}\\b`) }).click();
    await page.getByRole('button', { name: new RegExp(`^${to}\\b`) }).click();
    const playerMove = `${color === 'w' ? 'Putih' : 'Hitam'}: pion ${from} ke ${to}`;
    await expect(page.locator('.move-history')).toContainText(playerMove);
    await expect(page.locator(`.square.last-move[aria-label^="${from} "]`)).toHaveCount(1);
    await expect(page.locator(`.square.last-move[aria-label^="${to} "]`)).toHaveCount(1);
    await expect(page.getByText(/Giliran Anda/)).toBeVisible();
    const computerMove = color === 'w' ? 'Hitam: pion e7 ke e5' : 'Putih: kuda g1 ke f3';
    await expect(page.locator('.move-history li').first()).toContainText(computerMove);
    await expect(page.locator('.move-history')).toContainText(playerMove);
    await expect(page.locator('.square.last-move')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Permainan baru' }).click();
    await page.getByRole('button', { name: 'Batal' }).click();
    await expect(page.locator('.move-history')).toContainText(computerMove);
    await page.getByRole('button', { name: 'Permainan baru' }).click();
    await page.getByRole('button', { name: 'Ya, mulai baru' }).click();
    if (color === 'b') {
      await expect(page.locator('.move-history li')).toHaveCount(1);
      await expect(page.locator('.move-history')).toContainText('Putih: pion e2 ke e4');
      await expect(page.locator('.move-history')).not.toContainText(playerMove);
    } else {
      await expect(page.getByText('Belum ada langkah.')).toBeVisible();
      await expect(page.locator('.square.last-move')).toHaveCount(0);
    }
  });
}
