import { PixelGrid } from './pixel-grid';

export type PixelPoint = readonly [x: number, y: number];

type PixelGlyph = readonly [string, string, string, string, string];

/** Police pixel 3×5, limitée aux lettres dont les décors ont besoin. */
const PIXEL_FONT: Readonly<Record<string, PixelGlyph>> = {
  O: ['111', '101', '101', '101', '111'],
  N: ['101', '111', '111', '111', '101'],
  A: ['010', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  R: ['110', '101', '110', '101', '101'],
  P: ['110', '101', '110', '100', '100'],
  ' ': ['000', '000', '000', '000', '000'],
};

const GLYPH_ADVANCE: number = 4;
const RANDOM_MODULUS: number = 2147483647;
const RANDOM_MULTIPLIER: number = 16807;
const INITIAL_RANDOM_SEED: number = 7;

/**
 * Pinceau de pixel art sur un `<canvas>` : chaque méthode dessine des pixels entiers.
 * Le hasard est « graine fixe » : un décor est identique à chaque affichage.
 */
export class PixelPainter {
  private randomSeed: number = INITIAL_RANDOM_SEED;

  private constructor(
    private readonly context: CanvasRenderingContext2D,
    readonly width: number,
    readonly height: number,
  ) {}

  /** `null` si le canvas n'a pas de contexte 2D (environnement de test, par exemple). */
  static fromCanvas(canvas: HTMLCanvasElement): PixelPainter | null {
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    return context === null ? null : new PixelPainter(context, canvas.width, canvas.height);
  }

  /** Nombre pseudo-aléatoire entre 0 et 1, toujours la même suite. */
  random(): number {
    this.randomSeed = (this.randomSeed * RANDOM_MULTIPLIER) % RANDOM_MODULUS;
    return this.randomSeed / RANDOM_MODULUS;
  }

  clear(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.randomSeed = INITIAL_RANDOM_SEED;
  }

  setOpacity(opacity: number): void {
    this.context.globalAlpha = opacity;
  }

  fillRect(x: number, y: number, width: number, height: number, color: string): void {
    this.context.fillStyle = color;
    this.context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }

  fillPixel(x: number, y: number, color: string): void {
    this.fillRect(x, y, 1, 1, color);
  }

  /** Dégradé en bandes horizontales, avec une ligne tramée entre deux bandes. */
  fillVerticalGradient(
    x: number,
    y: number,
    width: number,
    height: number,
    colors: readonly string[],
  ): void {
    const bandHeight: number = height / colors.length;
    colors.forEach((color: string, bandIndex: number) => {
      const bandTop: number = y + bandIndex * bandHeight;
      this.fillRect(x, bandTop, width, Math.ceil(bandHeight), color);
      if (bandIndex > 0) {
        for (let ditherX: number = x; ditherX < x + width; ditherX += 2) {
          this.fillPixel(ditherX + (bandIndex % 2), bandTop - 1, color);
        }
      }
    });
  }

  /** Saupoudre des pixels au hasard : grain, herbe, pierre. `density` = part de pixels touchés. */
  sprinkle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    density: number,
  ): void {
    const pixelCount: number = width * height * density;
    for (let pixelIndex: number = 0; pixelIndex < pixelCount; pixelIndex++) {
      this.fillPixel(
        x + Math.floor(this.random() * width),
        y + Math.floor(this.random() * height),
        color,
      );
    }
  }

  fillCircle(centerX: number, centerY: number, radius: number, color: string): void {
    for (let offsetY: number = -radius; offsetY <= radius; offsetY++) {
      const halfWidth: number = Math.floor(Math.sqrt(radius * radius - offsetY * offsetY));
      this.fillRect(centerX - halfWidth, centerY + offsetY, halfWidth * 2 + 1, 1, color);
    }
  }

  fillEllipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    color: string,
  ): void {
    for (let offsetY: number = -radiusY; offsetY <= radiusY; offsetY++) {
      const halfWidth: number = Math.round(
        radiusX * Math.sqrt(1 - (offsetY * offsetY) / (radiusY * radiusY)),
      );
      this.fillRect(centerX - halfWidth, centerY + offsetY, halfWidth * 2 + 1, 1, color);
    }
  }

  drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    thickness: number = 1,
  ): void {
    const stepCount: number = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
    for (let stepIndex: number = 0; stepIndex <= stepCount; stepIndex++) {
      const progress: number = stepCount === 0 ? 0 : stepIndex / stepCount;
      this.fillRect(
        startX + (endX - startX) * progress,
        startY + (endY - startY) * progress,
        thickness,
        thickness,
        color,
      );
    }
  }

  /** Remplissage de polygone ligne par ligne (scanline). */
  fillPolygon(points: readonly PixelPoint[], color: string): void {
    const pointYs: number[] = points.map((point: PixelPoint): number => point[1]);
    for (let scanY: number = Math.min(...pointYs); scanY <= Math.max(...pointYs); scanY++) {
      const crossingXs: number[] = [];
      points.forEach((startPoint: PixelPoint, pointIndex: number) => {
        const endPoint: PixelPoint = points[(pointIndex + 1) % points.length];
        const isCrossing: boolean =
          (startPoint[1] <= scanY && endPoint[1] > scanY) ||
          (endPoint[1] <= scanY && startPoint[1] > scanY);
        if (isCrossing) {
          crossingXs.push(
            startPoint[0] +
              ((scanY - startPoint[1]) * (endPoint[0] - startPoint[0])) /
                (endPoint[1] - startPoint[1]),
          );
        }
      });
      crossingXs.sort((firstX: number, secondX: number): number => firstX - secondX);
      for (let crossingIndex: number = 0; crossingIndex < crossingXs.length; crossingIndex += 2) {
        const segmentStartX: number = Math.round(crossingXs[crossingIndex]);
        const segmentEndX: number = Math.round(crossingXs[crossingIndex + 1]);
        this.fillRect(segmentStartX, scanY, segmentEndX - segmentStartX, 1, color);
      }
    }
  }

  /** Halo lumineux en 3 cercles concentriques semi-transparents. */
  paintGlow(
    centerX: number,
    centerY: number,
    radius: number,
    color: string,
    intensity: number = 0.16,
  ): void {
    [1, 0.7, 0.45].forEach((radiusRatio: number, ringIndex: number) => {
      this.setOpacity((intensity * (ringIndex + 1)) / 2.2);
      this.fillCircle(centerX, centerY, Math.round(radius * radiusRatio), color);
    });
    this.setOpacity(1);
  }

  paintPine(x: number, baseY: number, height: number, color: string): void {
    for (let rowIndex: number = 0; rowIndex < height; rowIndex++) {
      const isNotch: boolean = rowIndex % 5 === 4;
      const halfWidth: number = Math.floor(rowIndex / 2.2) + 1 - (isNotch ? 1 : 0);
      this.fillRect(x - halfWidth, baseY - height + rowIndex, halfWidth * 2 + 1, 1, color);
    }
    this.fillRect(x - 1, baseY, 3, 3, color);
  }

  paintStars(starCount: number, maximumY: number): void {
    for (let starIndex: number = 0; starIndex < starCount; starIndex++) {
      const starColor: string = this.random() > 0.7 ? '#e9e2cf' : '#8d86a3';
      this.fillPixel(this.random() * this.width, this.random() * maximumY, starColor);
    }
  }

  paintMoon(centerX: number, centerY: number, radius: number): void {
    this.paintGlow(centerX, centerY, radius + 6, '#e9e2cf', 0.1);
    this.fillCircle(centerX, centerY, radius, '#e9e2cf');
    this.fillCircle(centerX + 2, centerY + 1, radius - 2, '#d9d0bb');
    this.fillPixel(centerX - 2, centerY - 1, '#c8bfa9');
    this.fillPixel(centerX + 1, centerY + 2, '#c8bfa9');
    this.fillRect(centerX - 3, centerY + 2, 2, 1, '#c8bfa9');
  }

  paintNightSky(): void {
    this.fillVerticalGradient(0, 0, this.width, 72, [
      '#0b0916',
      '#100d22',
      '#15122b',
      '#1b1733',
      '#221c3c',
      '#2a2245',
    ]);
  }

  /** Bande de brume ondulée. */
  paintFog(centerY: number, opacity: number): void {
    this.setOpacity(opacity);
    for (let x: number = 0; x < this.width; x++) {
      const fogHeight: number = 3 + Math.round(2 * Math.sin(x / 9) + Math.sin(x / 4));
      this.fillRect(x, centerY - fogHeight / 2, 1, fogHeight, '#e9e2cf');
    }
    this.setOpacity(1);
  }

  /** Lattes de bois horizontales (murs, parquet). */
  paintPlanks(
    x: number,
    y: number,
    width: number,
    height: number,
    baseColor: string,
    jointColor: string,
    plankHeight: number = 3,
  ): void {
    this.fillRect(x, y, width, height, baseColor);
    for (let jointY: number = y + plankHeight - 1; jointY < y + height; jointY += plankHeight) {
      this.fillRect(x, jointY, width, 1, jointColor);
    }
    this.sprinkle(x, y, width, height, jointColor, 0.03);
  }

  /** Dessine une grille `#`/`.` (fonds animés, sprites) en silhouette, agrandie `scale` fois. */
  paintPixelGrid(pixelGrid: PixelGrid, x: number, y: number, scale: number, color: string): void {
    pixelGrid.forEach((pixelRow: string, rowIndex: number) => {
      [...pixelRow].forEach((pixel: string, columnIndex: number) => {
        if (pixel === '#') {
          this.fillRect(x + columnIndex * scale, y + rowIndex * scale, scale, scale, color);
        }
      });
    });
  }

  writePixelText(text: string, x: number, y: number, color: string): void {
    [...text].forEach((character: string, characterIndex: number) => {
      const glyph: PixelGlyph | undefined = PIXEL_FONT[character];
      glyph?.forEach((glyphRow: string, rowIndex: number) => {
        [...glyphRow].forEach((glyphPixel: string, columnIndex: number) => {
          if (glyphPixel === '1') {
            this.fillPixel(x + characterIndex * GLYPH_ADVANCE + columnIndex, y + rowIndex, color);
          }
        });
      });
    });
  }
}
