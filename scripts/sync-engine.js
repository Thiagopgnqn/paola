import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const canonicalPath = path.join(rootDir, 'packages', 'pricing-engine', 'index.js');
const targets = [
  path.join(rootDir, 'frontend', 'src', 'pricing-engine', 'index.js'),
  path.join(rootDir, 'backend', 'src', 'pricing-engine', 'index.js')
];

const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(canonicalPath)) {
  console.error(`Error: Canonical pricing engine not found at ${canonicalPath}`);
  process.exit(1);
}

const canonicalContent = fs.readFileSync(canonicalPath, 'utf8');

let hasDiff = false;

for (const target of targets) {
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (fs.existsSync(target)) {
    const targetContent = fs.readFileSync(target, 'utf8');
    if (targetContent !== canonicalContent) {
      if (checkOnly) {
        console.error(`Diff detected in ${path.relative(rootDir, target)}`);
        hasDiff = true;
      } else {
        fs.writeFileSync(target, canonicalContent, 'utf8');
        console.log(`Synced: ${path.relative(rootDir, target)}`);
      }
    } else {
      console.log(`Up-to-date: ${path.relative(rootDir, target)}`);
    }
  } else {
    if (checkOnly) {
      console.error(`Target missing: ${path.relative(rootDir, target)}`);
      hasDiff = true;
    } else {
      fs.writeFileSync(target, canonicalContent, 'utf8');
      console.log(`Created & Synced: ${path.relative(rootDir, target)}`);
    }
  }
}

if (checkOnly && hasDiff) {
  console.error('Pricing engine files are out of sync! Run "npm run sync:engine"');
  process.exit(1);
}

console.log('Pricing engine synchronization complete.');
