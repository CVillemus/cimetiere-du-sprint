/**
 * Génère la favicon pixel art (un crâne aux yeux de bougie) en deux formats,
 * à partir d'une seule grille dessinée à la main :
 * - public/favicon.svg : nette à toutes les tailles, utilisée par les navigateurs récents ;
 * - public/favicon.ico : PNG 16×16 et 32×32 emballés en .ico, pour les autres.
 *
 * Usage : node scripts/generer-favicon.mjs
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// b = os, s = os ombré, e = braise au fond de l'orbite, n = orbites, nez et dents, . = transparent.
// Orbites noires et braise orange : sur l'os clair, un œil tout orange se perdait (luminosités trop proches).
// Le contour sombre (k) est calculé automatiquement autour du crâne.
const SKULL_GRID = [
  '................',
  '.....bbbbbb.....',
  '...bbbbbbbbbb...',
  '..bbbbbbbbbbbs..',
  '..bbbbbbbbbbbs..',
  '..bbnnnbbnnnbs..',
  '..bbnenbbnenbs..',
  '..bbnnnbbnnnbs..',
  '..bbbbbnnbbbbs..',
  '...bbbbnnbbbs...',
  '....bbbbbbbs....',
  '....bnbnbnbs....',
  '....bbbbbbbs....',
  '.....nbnbnb.....',
  '................',
  '................',
];

const PALETTE = {
  b: [233, 226, 207, 255],
  s: [184, 176, 201, 255],
  e: [245, 194, 107, 255],
  n: [20, 18, 31, 255],
  k: [13, 11, 20, 255],
};

const GRID_SIZE = SKULL_GRID.length;

/** Ajoute un contour d'un pixel autour de tout ce qui n'est pas transparent. */
function withOutline(grid) {
  const isFilled = (row, column) =>
    row >= 0 && row < GRID_SIZE && column >= 0 && column < GRID_SIZE && grid[row][column] !== '.';
  return grid.map((pixelRow, row) =>
    [...pixelRow]
      .map((pixel, column) => {
        if (pixel !== '.') {
          return pixel;
        }
        const touchesSkull = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ].some(([rowOffset, columnOffset]) => isFilled(row + rowOffset, column + columnOffset));
        return touchesSkull ? 'k' : '.';
      })
      .join(''),
  );
}

const OUTLINED_GRID = withOutline(SKULL_GRID);

function buildSvg(grid) {
  const rects = grid
    .flatMap((pixelRow, row) =>
      [...pixelRow].map((pixel, column) => {
        if (pixel === '.') {
          return '';
        }
        const [red, green, blue] = PALETTE[pixel];
        return `<rect x="${column}" y="${row}" width="1" height="1" fill="rgb(${red},${green},${blue})"/>`;
      }),
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}" shape-rendering="crispEdges">${rects}</svg>\n`;
}

// --- Encodage PNG minimal (RGBA 8 bits, sans filtre) ---

const CRC_TABLE = Array.from({ length: 256 }, (_unused, tableIndex) => {
  let crc = tableIndex;
  for (let bit = 0; bit < 8; bit++) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

/** PNG de `size`×`size` pixels : chaque case de la grille devient un carré de `size / 16`. */
function buildPng(grid, size) {
  const scale = size / GRID_SIZE;
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    const rowBytes = [0]; // octet de filtre « aucun »
    for (let x = 0; x < size; x++) {
      const pixel = grid[Math.floor(y / scale)][Math.floor(x / scale)];
      rowBytes.push(...(pixel === '.' ? [0, 0, 0, 0] : PALETTE[pixel]));
    }
    rawRows.push(Buffer.from(rowBytes));
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.writeUInt8(8, 8); // 8 bits par canal
  header.writeUInt8(6, 9); // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rawRows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Fichier .ico contenant directement des images PNG (format accepté depuis Windows Vista). */
function buildIco(pngImages) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type icône
  header.writeUInt16LE(pngImages.length, 4);
  let imageOffset = 6 + 16 * pngImages.length;
  const directory = pngImages.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4); // plans de couleur
    entry.writeUInt16LE(32, 6); // bits par pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(imageOffset, 12);
    imageOffset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...directory, ...pngImages.map(({ png }) => png)]);
}

writeFileSync('public/favicon.svg', buildSvg(OUTLINED_GRID));
writeFileSync(
  'public/favicon.ico',
  buildIco([16, 32].map((size) => ({ size, png: buildPng(OUTLINED_GRID, size) }))),
);
writeFileSync('public/apple-touch-icon.png', buildPng(OUTLINED_GRID, 176));
console.log(
  'Favicon générée : public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png',
);
