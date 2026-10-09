/**
 * Génère public/og-teaser.png (1200×630), l'image d'aperçu affichée par Messenger et Facebook
 * quand on partage le lien du teaser.
 *
 * Le décor n'est pas redessiné à part : on réutilise les vraies fonctions de dessin du teaser
 * (ciel, paysage, animations figées à un instant choisi) sur un faux canvas en mémoire,
 * puis on ajoute la carte avec le titre et la date en police pixel 5×7.
 *
 * Usage : npx tsx scripts/generer-image-partage.ts
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import {
  paintTeaserLandscape,
  paintTeaserSky,
  TEASER_SCENE_HEIGHT,
  TEASER_SCENE_WIDTH,
} from '../src/app/features/teaser/teaser-graveyard.scene';
import { TeaserNightAnimator } from '../src/app/features/teaser/teaser-night-animator';
import { PixelPainter } from '../src/app/shared/pixel-art/pixel-painter';

type Rgba = [red: number, green: number, blue: number, alpha: number];

const OUTPUT_WIDTH: number = 1200;
const OUTPUT_HEIGHT: number = 630;
/** Chaque pixel « art » devient un carré de 4×4 : 320×180 → 1280×720, recadré au centre. */
const SCALE: number = 4;
/** Instant figé des animations : le serpent pointe le nez derrière la stèle, langue sortie. */
const FROZEN_ELAPSED_MILLISECONDS: number = 8_200;

// ---------------------------------------------------------------------------
// Faux canvas : juste ce dont PixelPainter a besoin (fillRect, clearRect, fillStyle, globalAlpha)
// ---------------------------------------------------------------------------

function parseColor(color: string): Rgba {
  if (color.startsWith('#')) {
    const hex: string = color.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      255,
    ];
  }
  const channels: number[] = (color.match(/[\d.]+/g) ?? []).map(Number);
  return [channels[0], channels[1], channels[2], Math.round((channels[3] ?? 1) * 255)];
}

class MemoryCanvasContext {
  fillStyle: string = '#000000';
  globalAlpha: number = 1;
  readonly pixels: Uint8ClampedArray;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.pixels = new Uint8ClampedArray(width * height * 4);
  }

  clearRect(): void {
    this.pixels.fill(0);
  }

  /** Mélange « source-over », comme un vrai canvas. */
  fillRect(x: number, y: number, rectWidth: number, rectHeight: number): void {
    const [red, green, blue, alpha]: Rgba = parseColor(this.fillStyle);
    const sourceAlpha: number = (alpha / 255) * this.globalAlpha;
    for (
      let pixelY: number = Math.max(0, y);
      pixelY < Math.min(this.height, y + rectHeight);
      pixelY++
    ) {
      for (
        let pixelX: number = Math.max(0, x);
        pixelX < Math.min(this.width, x + rectWidth);
        pixelX++
      ) {
        blendPixel(
          this.pixels,
          (pixelY * this.width + pixelX) * 4,
          [red, green, blue],
          sourceAlpha,
        );
      }
    }
  }
}

function blendPixel(
  pixels: Uint8ClampedArray,
  offset: number,
  [red, green, blue]: readonly number[],
  sourceAlpha: number,
): void {
  const destinationAlpha: number = pixels[offset + 3] / 255;
  const outputAlpha: number = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha === 0) {
    return;
  }
  const mix = (source: number, destination: number): number =>
    (source * sourceAlpha + destination * destinationAlpha * (1 - sourceAlpha)) / outputAlpha;
  pixels[offset] = mix(red, pixels[offset]);
  pixels[offset + 1] = mix(green, pixels[offset + 1]);
  pixels[offset + 2] = mix(blue, pixels[offset + 2]);
  pixels[offset + 3] = outputAlpha * 255;
}

function createLayer(): { painter: PixelPainter; context: MemoryCanvasContext } {
  const context: MemoryCanvasContext = new MemoryCanvasContext(
    TEASER_SCENE_WIDTH,
    TEASER_SCENE_HEIGHT,
  );
  const fakeCanvas = {
    width: TEASER_SCENE_WIDTH,
    height: TEASER_SCENE_HEIGHT,
    getContext: (): MemoryCanvasContext => context,
  } as unknown as HTMLCanvasElement;
  const painter: PixelPainter | null = PixelPainter.fromCanvas(fakeCanvas);
  if (painter === null) {
    throw new Error('Faux canvas inutilisable');
  }
  return { painter, context };
}

// ---------------------------------------------------------------------------
// Police pixel 5×7 pour le titre de la carte
// ---------------------------------------------------------------------------

const PIXEL_FONT_5X7: Readonly<Record<string, readonly string[]>> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  // Lettre accentuée : 2 lignes d'accent AU-DESSUS de la hauteur normale (dessinées plus haut).
  È: ['01000', '00100', '11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  '0': ['01110', '10011', '10101', '11001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00000', '00100'],
  '·': ['00000', '00000', '00000', '00100', '00000', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
const GLYPH_ADVANCE: number = 6;
const GLYPH_HEIGHT: number = 7;

function measurePixelText(text: string, scale: number): number {
  return (text.length * GLYPH_ADVANCE - 1) * scale;
}

function writeCenteredPixelText(
  painter: PixelPainter,
  text: string,
  centerX: number,
  y: number,
  scale: number,
  color: string,
): void {
  const startX: number = Math.round(centerX - measurePixelText(text, scale) / 2);
  [...text].forEach((character: string, characterIndex: number) => {
    const glyph: readonly string[] | undefined = PIXEL_FONT_5X7[character];
    if (glyph === undefined) {
      throw new Error(`Caractère absent de la police pixel : « ${character} »`);
    }
    glyph.forEach((glyphRow: string, rowIndex: number) => {
      [...glyphRow].forEach((glyphPixel: string, columnIndex: number) => {
        if (glyphPixel === '1') {
          painter.fillRect(
            startX + (characterIndex * GLYPH_ADVANCE + columnIndex) * scale,
            y + (rowIndex - (glyph.length - GLYPH_HEIGHT)) * scale,
            scale,
            scale,
            color,
          );
        }
      });
    });
  });
}

/** La carte opaque de la page, reproduite en pixels : titre, accroche, date. */
function paintTeaserCard(cardPainter: PixelPainter): void {
  const centerX: number = TEASER_SCENE_WIDTH / 2;
  cardPainter.fillRect(62, 22, 196, 80, '#0d0b14');
  cardPainter.fillRect(64, 24, 192, 76, '#3a3352');
  cardPainter.fillRect(66, 26, 188, 72, '#14121f');
  writeCenteredPixelText(cardPainter, 'LE CIMETIÈRE', centerX, 33, 2, '#e9e2cf');
  writeCenteredPixelText(cardPainter, 'DU SPRINT', centerX, 51, 2, '#e9e2cf');
  writeCenteredPixelText(cardPainter, '10 FILMS. 1 SEUL SURVIVRA.', centerX, 71, 1, '#e8a33d');
  cardPainter.fillRect(82, 82, 156, 12, '#e8a33d');
  cardPainter.fillRect(83, 83, 154, 10, '#0d0b14');
  writeCenteredPixelText(cardPainter, 'SAMEDI 10 OCTOBRE · 18H', centerX, 85, 1, '#e9e2cf');
}

// ---------------------------------------------------------------------------
// Encodage PNG minimal (RGB 8 bits, sans filtre)
// ---------------------------------------------------------------------------

const CRC_TABLE: readonly number[] = Array.from(
  { length: 256 },
  (_unused: unknown, tableIndex: number) => {
    let crc: number = tableIndex;
    for (let bit: number = 0; bit < 8; bit++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    return crc >>> 0;
  },
);

function crc32(buffer: Buffer): number {
  let crc: number = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length: Buffer = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData: Buffer = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc: Buffer = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(
  width: number,
  height: number,
  rgbAt: (x: number, y: number) => readonly number[],
): Buffer {
  const rows: Buffer[] = [];
  for (let y: number = 0; y < height; y++) {
    const row: Buffer = Buffer.alloc(1 + width * 3);
    for (let x: number = 0; x < width; x++) {
      const [red, green, blue] = rgbAt(x, y);
      row[1 + x * 3] = red;
      row[2 + x * 3] = green;
      row[3 + x * 3] = blue;
    }
    rows.push(row);
  }
  const header: Buffer = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.writeUInt8(8, 8);
  header.writeUInt8(2, 9); // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Assemblage : mêmes calques que la page, dans le même ordre
// ---------------------------------------------------------------------------

const sky = createLayer();
const skyAnimation = createLayer();
const landscape = createLayer();
const lights = createLayer();
const creatures = createLayer();
const card = createLayer();

paintTeaserSky(sky.painter);
paintTeaserLandscape(landscape.painter, lights.painter);
const teaserNightAnimator: TeaserNightAnimator = new TeaserNightAnimator();
teaserNightAnimator.paintSkyAnimation(skyAnimation.painter, FROZEN_ELAPSED_MILLISECONDS);
teaserNightAnimator.paintCreatures(creatures.painter, FROZEN_ELAPSED_MILLISECONDS);
paintTeaserCard(card.painter);

const composite: Uint8ClampedArray = new Uint8ClampedArray(
  TEASER_SCENE_WIDTH * TEASER_SCENE_HEIGHT * 4,
);
[sky, skyAnimation, landscape, lights, creatures, card].forEach(({ context }) => {
  for (let offset: number = 0; offset < composite.length; offset += 4) {
    const sourceAlpha: number = context.pixels[offset + 3] / 255;
    if (sourceAlpha > 0) {
      blendPixel(composite, offset, [...context.pixels.slice(offset, offset + 3)], sourceAlpha);
    }
  }
});

// Agrandissement ×4 au plus proche voisin, puis recadrage en 1200×630 :
// centré en largeur, décalé vers le bas pour garder le serpent en entier.
const CROP_TOP: number = 70;
const cropLeft: number = (TEASER_SCENE_WIDTH * SCALE - OUTPUT_WIDTH) / 2;
const cropTop: number = CROP_TOP;
const png: Buffer = encodePng(OUTPUT_WIDTH, OUTPUT_HEIGHT, (x: number, y: number) => {
  const sceneX: number = Math.floor((x + cropLeft) / SCALE);
  const sceneY: number = Math.floor((y + cropTop) / SCALE);
  const offset: number = (sceneY * TEASER_SCENE_WIDTH + sceneX) * 4;
  return [composite[offset], composite[offset + 1], composite[offset + 2]];
});
writeFileSync('public/og-teaser.png', png);
console.log(
  `Image de partage générée : public/og-teaser.png (${OUTPUT_WIDTH}×${OUTPUT_HEIGHT}, ${Math.round(png.length / 1024)} ko)`,
);
