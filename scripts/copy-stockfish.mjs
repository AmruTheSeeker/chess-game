import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const source = join('node_modules', 'stockfish', 'bin');
const target = join('public', 'engine');
await mkdir(target, { recursive: true });
for (const name of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  await copyFile(join(source, name), join(target, name));
}
await copyFile(join('node_modules', 'stockfish', 'Copying.txt'), join(target, 'STOCKFISH-LICENSE.txt'));
await copyFile(join('node_modules', 'chess.js', 'LICENSE'), join(target, 'CHESS-JS-LICENSE.txt'));
await copyFile('THIRD_PARTY_NOTICES.md', join(target, 'THIRD_PARTY_NOTICES.md'));
