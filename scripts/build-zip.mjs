import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function sanitizeFilePart(input) {
  return String(input || 'app')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-') // Windows illegal chars
    .replace(/\s+/g, '-');
}

const pkgPath = path.resolve('public/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const name = sanitizeFilePart(pkg.name);
const version = sanitizeFilePart(pkg.version);

const zipName = `${name}-v${version}.zip`;
const zipPath = path.resolve(process.cwd(), zipName);

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log(`[build:zip] creating ${zipName} ...`);
execFileSync('tar', ['-a', '-c', '-f', zipName, 'dist'], { stdio: 'inherit' });
console.log(`[build:zip] done: ${zipName}`);

