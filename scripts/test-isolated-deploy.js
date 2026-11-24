import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tempDir = path.join(os.tmpdir(), 'nocturna-isolated-' + Date.now());
console.log('Isolated test temp directory:', tempDir);
fs.mkdirSync(tempDir, { recursive: true });

function copyDir(src, dest, ignore = ['node_modules', 'dist', '.git']) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, ignore);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Test Frontend Isolation
console.log('\n--- 1. Testing Isolated Frontend ---');
const feTemp = path.join(tempDir, 'frontend');
console.log('Copying frontend to:', feTemp);
copyDir(path.join(rootDir, 'frontend'), feTemp);

console.log('Running npm install in isolated frontend...');
execSync('npm install --prefer-offline --no-audit', { cwd: feTemp, stdio: 'inherit' });

console.log('Running npm run build with VITE_DEMO_MODE=true in isolated frontend...');
const env = { ...process.env, VITE_DEMO_MODE: 'true' };
execSync('npm run build', { cwd: feTemp, env, stdio: 'inherit' });
console.log('Isolated frontend build SUCCEEDED!');

// 2. Test Backend Isolation
console.log('\n--- 2. Testing Isolated Backend ---');
const beTemp = path.join(tempDir, 'backend');
console.log('Copying backend to:', beTemp);
copyDir(path.join(rootDir, 'backend'), beTemp);

console.log('Running npm install in isolated backend...');
execSync('npm install --prefer-offline --no-audit', { cwd: beTemp, stdio: 'inherit' });

console.log('Running npx prisma generate in isolated backend...');
execSync('npx prisma generate', { cwd: beTemp, stdio: 'inherit' });
console.log('Isolated backend prisma generate SUCCEEDED!');

console.log('\nVerifying isolated backend startup syntax check...');
execSync('node --check src/index.js', { cwd: beTemp, stdio: 'inherit' });
console.log('Isolated backend syntax check SUCCEEDED!');

console.log('\nALL ISOLATION TESTS PASSED! Neither frontend nor backend depends on parent folder.');
