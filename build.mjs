// Vercel-Build: kopiert die Seite nach dist/ und zeichnet die App-Icons (PNG) – ohne Abhängigkeiten.
// Das Icon besteht nur aus Rechtecken: Messing-Fläche, Heftrücken mit Bindung, Buchstabe „L“.
import { mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const FILES = ['index.html', 'hub.css', 'tokens.css', 'links.js', 'sw.js', 'manifest.webmanifest', 'robots.txt'];
const BRASS = [184, 134, 43], DARK = [138, 95, 18], STRIPE = [205, 165, 90], CREAM = [251, 248, 241];

// Rechtecke in Einheiten 0..1: [x0, y0, x1, y1, Farbe]
function shapes(size) {
  const r = [[0.20, 0.14, 0.28, 0.86, DARK]];
  if (size >= 64) for (let y = 0.17; y < 0.86; y += 0.06) r.push([0.20, y, 0.28, y + 0.012, STRIPE]);
  r.push([0.44, 0.31, 0.53, 0.70, CREAM]);  // Stamm
  r.push([0.39, 0.29, 0.58, 0.335, CREAM]); // Serife oben
  r.push([0.39, 0.665, 0.80, 0.72, CREAM]); // Fuß
  r.push([0.755, 0.58, 0.80, 0.72, CREAM]); // Serife rechts
  return r;
}

function icon(size, scale = 1) {
  const px = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) px.set(BRASS, i * 3);
  const off = (1 - scale) / 2;
  for (const [x0, y0, x1, y1, c] of shapes(size)) {
    const X0 = Math.round((off + x0 * scale) * size), X1 = Math.round((off + x1 * scale) * size);
    const Y0 = Math.round((off + y0 * scale) * size), Y1 = Math.round((off + y1 * scale) * size);
    for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) px.set(c, (y * size + x) * 3);
  }
  return png(size, px);
}

// Minimaler PNG-Encoder (RGB, 8 Bit)
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) px.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/icons', { recursive: true });
for (const f of FILES) copyFileSync(f, `dist/${f}`);
const ICONS = { 'icon-192.png': [192], 'icon-512.png': [512], 'maskable-512.png': [512, 0.78], 'apple-touch-icon.png': [180], 'favicon-32.png': [32] };
for (const [name, [size, scale]] of Object.entries(ICONS)) writeFileSync(`dist/icons/${name}`, icon(size, scale));
console.log(`dist/: ${FILES.length} Dateien, ${Object.keys(ICONS).length} Icons`);
