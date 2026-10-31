import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicIconsDir = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

// 1. High-resolution SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="112" height="112" rx="28" fill="url(#grad)" filter="url(#shadow)"/>
  <path d="M36 40 L92 40 L64 96 Z" fill="none" stroke="#ffffff" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" opacity="0.3"/>
  <!-- Paper airplane / Pilot wing form -->
  <path d="M32 64 L96 36 L68 92 L60 68 Z" fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 68 L96 36" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/>
</svg>`;

fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), svgIcon, 'utf8');

// Helper to create a minimal uncompressed valid PNG with RGBA buffer
function createSimplePng(size, r, g, b, a) {
  // We can write a valid PNG buffer using zlib deflate
  import('zlib').then(zlib => {
    const width = size;
    const height = size;
    // RGBA raw scanlines: each row starts with filter byte 0
    const rowSize = 1 + width * 4;
    const rawData = Buffer.alloc(rowSize * height);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * rowSize;
      rawData[rowOffset] = 0; // Filter type None
      for (let x = 0; x < width; x++) {
        const pxOffset = rowOffset + 1 + x * 4;
        // Rounded corner check
        const radius = Math.floor(size * 0.22);
        const inCorner =
          (x < radius && y < radius && (x - radius) ** 2 + (y - radius) ** 2 > radius ** 2) ||
          (x >= width - radius && y < radius && (x - (width - radius)) ** 2 + (y - radius) ** 2 > radius ** 2) ||
          (x < radius && y >= height - radius && (x - radius) ** 2 + (y - (height - radius)) ** 2 > radius ** 2) ||
          (x >= width - radius && y >= height - radius && (x - (width - radius)) ** 2 + (y - (height - radius)) ** 2 > radius ** 2);

        if (inCorner) {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
        } else {
          // Center symbol highlight
          const cx = width / 2;
          const cy = height / 2;
          const dist = Math.hypot(x - cx, y - cy);
          if (dist < size * 0.28) {
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 255;
            rawData[pxOffset + 2] = 255;
            rawData[pxOffset + 3] = 255;
          } else {
            rawData[pxOffset] = r;
            rawData[pxOffset + 1] = g;
            rawData[pxOffset + 2] = b;
            rawData[pxOffset + 3] = a;
          }
        }
      }
    }

    const compressed = zlib.deflateSync(rawData);

    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // color type RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    function makeChunk(type, data) {
      const len = data.length;
      const buf = Buffer.alloc(12 + len);
      buf.writeUInt32BE(len, 0);
      buf.write(type, 4, 4, 'ascii');
      data.copy(buf, 8);
      // CRC
      const crc = crc32(buf.subarray(4, 8 + len));
      buf.writeInt32BE(crc, 8 + len);
      return buf;
    }

    // Standard CRC32 table
    const crcTable = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[i] = c;
    }
    function crc32(buf) {
      let crc = -1;
      for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
      }
      return ~crc;
    }

    const ihdrChunk = makeChunk('IHDR', ihdr);
    const idatChunk = makeChunk('IDAT', compressed);
    const iendChunk = makeChunk('IEND', Buffer.alloc(0));

    const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
    fs.writeFileSync(path.join(publicIconsDir, `icon${size}.png`), png);
    console.log(`Generated icon${size}.png (${png.length} bytes)`);
  });
}

createSimplePng(16, 79, 70, 229, 255);
createSimplePng(48, 79, 70, 229, 255);
createSimplePng(128, 79, 70, 229, 255);
