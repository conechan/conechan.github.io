import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
// Publish only the original tracked public assets; ignored local CV photos stay private.
rmSync('public/img', { recursive: true, force: true });
for (const file of JSON.parse(readFileSync('scripts/assets.json', 'utf8'))) {
  const output = `public/${file}`;
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(file, output);
}
