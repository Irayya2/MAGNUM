const fs = require('fs');
const path = require('path');

// Ensure public/textures directory exists
const texturesDir = path.join(__dirname, '..', 'public', 'textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

const width = 512;
const height = 512;

// Generate 32-bit BMP file buffer for tileable water normal map
const waves = [
  { fx: 3, fy: 5, amp: 1.0, phase: 0.1 },
  { fx: 7, fy: 3, amp: 0.7, phase: 0.4 },
  { fx: 11, fy: 13, amp: 0.5, phase: 0.8 },
  { fx: 17, fy: 19, amp: 0.35, phase: 1.2 },
  { fx: 29, fy: 31, amp: 0.2, phase: 1.7 },
  { fx: 43, fy: 47, amp: 0.1, phase: 2.3 },
];

function getH(x, y) {
  let h = 0;
  const u = (x / width) * Math.PI * 2;
  const v = (y / height) * Math.PI * 2;
  for (let i = 0; i < waves.length; i++) {
    const w = waves[i];
    h += w.amp * Math.sin(u * w.fx + v * w.fy + w.phase);
    h += w.amp * Math.cos(u * w.fy - v * w.fx + w.phase * 1.5);
  }
  return h;
}

const headerSize = 54;
const pixelBytes = width * height * 4;
const fileSize = headerSize + pixelBytes;
const buf = Buffer.alloc(fileSize);

// BMP Header (14 bytes)
buf.write('BM', 0);
buf.writeUInt32LE(fileSize, 2);
buf.writeUInt32LE(0, 6);
buf.writeUInt32LE(headerSize, 10);

// DIB Header (BITMAPINFOHEADER - 40 bytes)
buf.writeUInt32LE(40, 14); // Header size
buf.writeInt32LE(width, 18);
buf.writeInt32LE(-height, 22); // Top-down
buf.writeUInt16LE(1, 26); // Planes
buf.writeUInt16LE(32, 28); // Bit count (32 bits RGBA/BGRA)
buf.writeUInt32LE(0, 30); // Compression (BI_RGB)
buf.writeUInt32LE(pixelBytes, 34);
buf.writeInt32LE(2835, 38);
buf.writeInt32LE(2835, 42);
buf.writeUInt32LE(0, 46);
buf.writeUInt32LE(0, 50);

let offset = headerSize;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const hL = getH((x - 1 + width) % width, y);
    const hR = getH((x + 1) % width, y);
    const hU = getH(x, (y - 1 + height) % height);
    const hD = getH(x, (y + 1) % height);

    const dx = (hR - hL) * 2.5;
    const dy = (hD - hU) * 2.5;
    const dz = 1.0;

    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const nx = dx / len;
    const ny = dy / len;
    const nz = dz / len;

    const r = Math.floor((nx * 0.5 + 0.5) * 255);
    const g = Math.floor((ny * 0.5 + 0.5) * 255);
    const b = Math.floor((nz * 0.5 + 0.5) * 255);

    // BMP format stores BGRA
    buf[offset] = b;
    buf[offset + 1] = g;
    buf[offset + 2] = r;
    buf[offset + 3] = 255;
    offset += 4;
  }
}

// Write as waternormals.bmp, waternormals.jpg and waternormals.png (BMP bytes read fine by image loaders or canvas)
const bmpPath = path.join(texturesDir, 'waternormals.bmp');
const jpgPath = path.join(texturesDir, 'waternormals.jpg');
const pngPath = path.join(texturesDir, 'waternormals.png');

fs.writeFileSync(bmpPath, buf);
fs.writeFileSync(jpgPath, buf);
fs.writeFileSync(pngPath, buf);

console.log('Successfully generated local waternormals textures at:', texturesDir);
