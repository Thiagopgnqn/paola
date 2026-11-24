import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brandDir = path.resolve(__dirname, '../public/images/brand');
const publicDir = path.resolve(__dirname, '../public');

async function buildFavicons() {
  const iconSvg = (size) => Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#E6007E" />
      <rect x="2" y="2" width="60" height="60" rx="12" stroke="#FDE4F1" stroke-width="2" stroke-opacity="0.7" fill="none" />
      <text x="32" y="45" text-anchor="middle" fill="#FFFFFF" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="40" font-weight="700">P</text>
    </svg>
  `);

  const targets = [
    { file: 'favicon-16x16.png', size: 16 },
    { file: 'favicon-32x32.png', size: 32 },
    { file: 'favicon.png', size: 48 },
    { file: 'favicon.ico', size: 32 },
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'android-chrome-192x192.png', size: 192 },
    { file: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const t of targets) {
    await sharp(iconSvg(t.size))
      .resize(t.size, t.size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(publicDir, t.file));
  }
  console.log('[brand-images] Favicons e íconos PWA regenerados en /public.');
}

async function buildOgImage() {
  fs.mkdirSync(brandDir, { recursive: true });
  const ogSvg = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF7FB" />
          <stop offset="55%" stop-color="#FDE4F1" />
          <stop offset="100%" stop-color="#FFF7FB" />
        </linearGradient>
        <radialGradient id="pinkGlow" cx="78%" cy="32%" r="48%">
          <stop offset="0%" stop-color="#E6007E" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#FFF7FB" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#bg)" />
      <rect width="1200" height="630" fill="url(#pinkGlow)" />

      <!-- Marco suave -->
      <rect x="44" y="44" width="1112" height="542" rx="18" fill="#FFFFFF" fill-opacity="0.78" stroke="#F2C4DD" stroke-width="2" />

      <text
        x="600"
        y="178"
        text-anchor="middle"
        fill="#B80063"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="16"
        font-weight="700"
        letter-spacing="6"
      >CÓRDOBA, ARGENTINA  •  @PAOLA_CALZADOSS</text>

      <text
        x="600"
        y="292"
        text-anchor="middle"
        fill="#E6007E"
        font-family="Georgia, 'Times New Roman', serif"
        font-style="italic"
        font-size="108"
        font-weight="700"
      >Paola</text>

      <text
        x="600"
        y="366"
        text-anchor="middle"
        fill="#141014"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="40"
        font-weight="700"
        letter-spacing="14"
      >CALZADOS</text>

      <line x1="420" y1="416" x2="780" y2="416" stroke="#F2C4DD" stroke-width="2" />

      <rect x="355" y="454" width="490" height="52" rx="26" fill="#E6007E" />
      <text
        x="600"
        y="486"
        text-anchor="middle"
        fill="#FFFFFF"
        font-family="Segoe UI, Arial, Helvetica, sans-serif"
        font-size="17"
        font-weight="700"
        letter-spacing="3"
      >VENTA POR MAYOR Y POR MENOR</text>
    </svg>
  `);

  const ogBrandPath = path.join(brandDir, 'og-image.png');
  const ogRootPath = path.join(publicDir, 'og-image.png');

  await sharp(ogSvg).png({ compressionLevel: 9 }).toFile(ogBrandPath);
  await sharp(ogSvg).png({ compressionLevel: 9 }).toFile(ogRootPath);

  const ogSize = fs.statSync(ogBrandPath).size;
  console.log(
    `[brand-images] og-image.png (${(ogSize / 1024).toFixed(1)} KB, 1200x630) generado en /images/brand/og-image.png y /og-image.png.`
  );
}

export async function buildBrandImages() {
  await buildFavicons();
  await buildOgImage();
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  buildBrandImages().catch((err) => {
    console.error('[brand-images] Error:', err);
    process.exit(1);
  });
}
