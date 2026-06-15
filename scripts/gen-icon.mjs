// Generate a 1024x1024 PNG icon for FView Power (a stylized "FVP" monogram on a dark rounded card)
import { writeFileSync } from "fs";
import { deflateSync } from "zlib";

const SIZE = 1024;
const r2 = 192; // corner radius

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, c]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type RGB
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

function bgColor(t) {
  // Vertical gradient #1e293b -> #0f172a
  const r1 = 30, g1 = 41, b1 = 59;
  const r2 = 15, g2 = 23, b2 = 42;
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
}

function fgColor(t) {
  // Subtle gradient slate-50 -> slate-300
  const r1 = 248, g1 = 250, b1 = 252;
  const r2 = 203, g2 = 213, b2 = 225;
  return [
    Math.round(r1 + (r2 - r1) * t),
    Math.round(g1 + (g2 - g1) * t),
    Math.round(b1 + (b2 - b1) * t),
  ];
}

const cellW = 200;
const cellH = 480;
const gap = 50;
const startX = (SIZE - (3 * cellW + 2 * gap)) / 2;
const startY = (SIZE - cellH) / 2;
const stroke = 80;

const fX = startX;
const vX = startX + cellW + gap;
const pX = startX + 2 * (cellW + gap);
const lY = startY;
const midY = lY + cellH / 2;

const inRect = (x, y, rx, ry, rw, rh) =>
  x >= rx && x < rx + rw && y >= ry && y < ry + rh;

const rows = [];
for (let y = 0; y < SIZE; y++) {
  const row = Buffer.alloc(SIZE * 3 + 1);
  row[0] = 0;
  const bg = bgColor(y / SIZE);
  const fg = fgColor(y / SIZE);

  for (let x = 0; x < SIZE; x++) {
    const i = 1 + x * 3;

    const inside = !(
      (x < r2 && y < r2 && (r2 - x) ** 2 + (r2 - y) ** 2 > r2 ** 2) ||
      (x > SIZE - r2 && y < r2 && (x - (SIZE - r2)) ** 2 + (r2 - y) ** 2 > r2 ** 2) ||
      (x < r2 && y > SIZE - r2 && (r2 - x) ** 2 + (y - (SIZE - r2)) ** 2 > r2 ** 2) ||
      (x > SIZE - r2 && y > SIZE - r2 && (x - (SIZE - r2)) ** 2 + (y - (SIZE - r2)) ** 2 > r2 ** 2)
    );

    let r, g, b;
    if (!inside) {
      r = 0; g = 0; b = 0;
    } else {
      r = bg[0]; g = bg[1]; b = bg[2];
    }

    if (inside) {
      // F: vertical bar + top bar + middle bar (shorter)
      if (
        inRect(x, y, fX, lY, stroke, cellH) ||
        inRect(x, y, fX, lY, cellW, stroke) ||
        inRect(x, y, fX, lY + cellH * 0.45, cellW * 0.72, stroke)
      ) {
        r = fg[0]; g = fg[1]; b = fg[2];
      }
      // V: stepped diagonal (two strokes meeting at the bottom)
      else if (y >= lY && y < lY + cellH) {
        const progress = (y - lY) / cellH;
        const offset = (progress - 0.5) * (cellW - stroke);
        const leftEdge = vX + Math.abs(offset);
        const rightEdge = vX + cellW - Math.abs(offset);
        if (
          (x >= leftEdge && x < leftEdge + stroke) ||
          (x >= rightEdge - stroke && x < rightEdge)
        ) {
          r = fg[0]; g = fg[1]; b = fg[2];
        }
      }
      // P: left vertical + top bar + middle bar + right vertical (top half only)
      else if (
        inRect(x, y, pX, lY, stroke, cellH) ||
        inRect(x, y, pX, lY, cellW, stroke) ||
        inRect(x, y, pX, midY - stroke / 2, cellW, stroke) ||
        inRect(x, y, pX + cellW - stroke, lY, stroke, cellH / 2)
      ) {
        r = fg[0]; g = fg[1]; b = fg[2];
      }
    }

    row[i] = r;
    row[i + 1] = g;
    row[i + 2] = b;
  }
  rows.push(row);
}
const raw = Buffer.concat(rows);
const idat = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync("src-tauri/icons/source.png", png);
console.log("Created src-tauri/icons/source.png", png.length, "bytes");
