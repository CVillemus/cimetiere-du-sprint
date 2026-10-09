import { PIXEL_BACKDROP_DEFINITIONS } from '../../shared/components/pixel-backdrop/pixel-backdrop.definitions';
import { PixelGrid } from '../../shared/pixel-art/pixel-grid';
import { PixelPainter } from '../../shared/pixel-art/pixel-painter';
import { TEASER_GROUND_Y, TEASER_SCENE_WIDTH } from './teaser-graveyard.scene';

/**
 * Tout ce qui bouge sur la page teaser, dessiné image par image en fonction du temps écoulé :
 * - calque « ciel animé » : étoiles qui scintillent, étoile filante, deux couches de nuages en parallaxe ;
 * - calque « créatures » : l'arbre mort qui se balance, le corbeau qui tourne la tête, le serpent qui rampe.
 * Fichier d'illustration pixel art : la palette vit avec le dessin.
 */

interface TwinklingStar {
  readonly x: number;
  readonly y: number;
  readonly periodInMilliseconds: number;
  readonly phase: number;
  readonly isBright: boolean;
}

interface DriftingCloud {
  readonly startX: number;
  readonly y: number;
  readonly width: number;
  readonly speedInPixelsPerMillisecond: number;
  readonly color: string;
  readonly opacity: number;
}

const STAR_COUNT: number = 90;
/** Zone de la lune : pas d'étoile devant elle. */
const MOON_AREA = { left: 250, right: 292, top: 8, bottom: 52 } as const;

const SHOOTING_STAR_PERIOD_IN_MILLISECONDS: number = 13_000;
const SHOOTING_STAR_DURATION_IN_MILLISECONDS: number = 700;
const SHOOTING_STAR_TRAIL_LENGTH: number = 10;

const TREE_SCALE: number = 3;
const TREE_X: number = 2;
const TREE_FRAME_DURATION_IN_MILLISECONDS: number = 900;
/** Image de base, penché à droite, base, penché à gauche : un balancement doux. */
const TREE_SWAY_SEQUENCE: readonly number[] = [0, 1, 0, 2];
const RAVEN_X: number = 42;
const RAVEN_Y: number = 83;
const RAVEN_CYCLE_IN_MILLISECONDS: number = 6_000;
const RAVEN_LOOKING_LEFT_DURATION_IN_MILLISECONDS: number = 4_200;
const SILHOUETTE_COLOR: string = '#0c0a16';

/** Robe rayée volontairement sourde : sang séché, os sale, rouille. */
const SNAKE_RING_COLORS: readonly string[] = ['#6e3530', '#a89c84', '#7a5030', '#a89c84'];
const SNAKE_HEAD_COLOR: string = '#1a1210';
const SNAKE_EYE_COLOR: string = '#cfc6ae';
const SNAKE_TONGUE_COLOR: string = '#8e2a2a';
const SNAKE_SEGMENT_COUNT: number = 18;
const SNAKE_SEGMENT_SPACING: number = 2;
const SNAKE_BASE_Y: number = 166;
const SNAKE_SPEED_IN_PIXELS_PER_MILLISECOND: number = 0.008;
const SNAKE_OFFSCREEN_MARGIN: number = SNAKE_SEGMENT_COUNT * SNAKE_SEGMENT_SPACING + 10;

/** Hasard à graine fixe : le ciel est le même à chaque visite. */
function createSeededRandom(seed: number): () => number {
  let randomSeed: number = seed;
  return (): number => {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return randomSeed / 2147483647;
  };
}

function isInsideMoonArea(x: number, y: number): boolean {
  return x >= MOON_AREA.left && x <= MOON_AREA.right && y >= MOON_AREA.top && y <= MOON_AREA.bottom;
}

export class TeaserNightAnimator {
  private readonly stars: readonly TwinklingStar[];
  private readonly clouds: readonly DriftingCloud[];

  constructor() {
    const random: () => number = createSeededRandom(13);
    const stars: TwinklingStar[] = [];
    while (stars.length < STAR_COUNT) {
      const x: number = Math.floor(random() * TEASER_SCENE_WIDTH);
      const y: number = Math.floor(random() * 120);
      if (!isInsideMoonArea(x, y)) {
        stars.push({
          x,
          y,
          periodInMilliseconds: 1500 + random() * 3500,
          phase: random() * Math.PI * 2,
          isBright: random() > 0.75,
        });
      }
    }
    this.stars = stars;

    // Deux couches : les nuages lointains, sombres et lents ; les proches, plus clairs et plus rapides.
    this.clouds = [
      {
        startX: 20,
        y: 22,
        width: 70,
        speedInPixelsPerMillisecond: 0.003,
        color: '#1d1832',
        opacity: 0.8,
      },
      {
        startX: 190,
        y: 40,
        width: 90,
        speedInPixelsPerMillisecond: 0.003,
        color: '#1d1832',
        opacity: 0.8,
      },
      {
        startX: 120,
        y: 58,
        width: 60,
        speedInPixelsPerMillisecond: 0.007,
        color: '#2c2640',
        opacity: 0.6,
      },
      {
        startX: 280,
        y: 30,
        width: 50,
        speedInPixelsPerMillisecond: 0.007,
        color: '#2c2640',
        opacity: 0.6,
      },
    ];
  }

  paintSkyAnimation(skyAnimationPainter: PixelPainter, elapsedMilliseconds: number): void {
    skyAnimationPainter.clear();
    this.paintTwinklingStars(skyAnimationPainter, elapsedMilliseconds);
    this.paintShootingStar(skyAnimationPainter, elapsedMilliseconds);
    this.clouds.forEach((cloud: DriftingCloud) =>
      this.paintCloud(skyAnimationPainter, cloud, elapsedMilliseconds),
    );
  }

  paintCreatures(creaturesPainter: PixelPainter, elapsedMilliseconds: number): void {
    creaturesPainter.clear();
    this.paintSwayingTree(creaturesPainter, elapsedMilliseconds);
    this.paintCrawlingSnake(creaturesPainter, elapsedMilliseconds);
  }

  private paintTwinklingStars(painter: PixelPainter, elapsedMilliseconds: number): void {
    this.stars.forEach((star: TwinklingStar) => {
      const brightness: number =
        (Math.sin((elapsedMilliseconds / star.periodInMilliseconds) * Math.PI * 2 + star.phase) +
          1) /
        2;
      if (brightness < 0.3) {
        painter.fillPixel(star.x, star.y, '#2c2640');
        return;
      }
      painter.fillPixel(star.x, star.y, star.isBright || brightness > 0.8 ? '#e9e2cf' : '#8d86a3');
      // Les étoiles les plus vives scintillent en petite croix.
      if (star.isBright && brightness > 0.85) {
        [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ].forEach(([offsetX, offsetY]: number[]) =>
          painter.fillPixel(star.x + offsetX, star.y + offsetY, '#8d86a3'),
        );
      }
    });
  }

  private paintShootingStar(painter: PixelPainter, elapsedMilliseconds: number): void {
    const cycleIndex: number = Math.floor(
      elapsedMilliseconds / SHOOTING_STAR_PERIOD_IN_MILLISECONDS,
    );
    const timeInCycle: number = elapsedMilliseconds % SHOOTING_STAR_PERIOD_IN_MILLISECONDS;
    if (timeInCycle > SHOOTING_STAR_DURATION_IN_MILLISECONDS) {
      return;
    }
    // Départ différent à chaque passage, mais toujours le même pour un passage donné.
    const startX: number = 40 + ((cycleIndex * 97) % 160);
    const startY: number = 8 + ((cycleIndex * 31) % 30);
    const progress: number = timeInCycle / SHOOTING_STAR_DURATION_IN_MILLISECONDS;
    const headX: number = Math.round(startX + progress * 70);
    const headY: number = Math.round(startY + progress * 24);
    for (let trailIndex: number = 0; trailIndex < SHOOTING_STAR_TRAIL_LENGTH; trailIndex++) {
      painter.setOpacity(1 - trailIndex / SHOOTING_STAR_TRAIL_LENGTH);
      painter.fillPixel(headX - trailIndex * 3, headY - trailIndex, '#e9e2cf');
    }
    painter.setOpacity(1);
  }

  /** Un nuage pixel : trois ellipses empilées, qui défile et revient par la gauche. */
  private paintCloud(
    painter: PixelPainter,
    cloud: DriftingCloud,
    elapsedMilliseconds: number,
  ): void {
    const travelWidth: number = TEASER_SCENE_WIDTH + cloud.width;
    const x: number =
      ((cloud.startX + elapsedMilliseconds * cloud.speedInPixelsPerMillisecond) % travelWidth) -
      cloud.width;
    const halfWidth: number = Math.round(cloud.width / 2);
    painter.setOpacity(cloud.opacity);
    painter.fillEllipse(Math.round(x + halfWidth), cloud.y, halfWidth, 4, cloud.color);
    painter.fillEllipse(
      Math.round(x + cloud.width * 0.35),
      cloud.y - 3,
      Math.round(cloud.width * 0.22),
      4,
      cloud.color,
    );
    painter.fillEllipse(
      Math.round(x + cloud.width * 0.62),
      cloud.y - 4,
      Math.round(cloud.width * 0.18),
      4,
      cloud.color,
    );
    painter.setOpacity(1);
  }

  private paintSwayingTree(painter: PixelPainter, elapsedMilliseconds: number): void {
    const treeFrames: readonly PixelGrid[] = PIXEL_BACKDROP_DEFINITIONS['dead-tree'].frames;
    const swayStep: number =
      Math.floor(elapsedMilliseconds / TREE_FRAME_DURATION_IN_MILLISECONDS) %
      TREE_SWAY_SEQUENCE.length;
    const treeFrame: PixelGrid = treeFrames[TREE_SWAY_SEQUENCE[swayStep]];
    const treeTopY: number = TEASER_GROUND_Y - treeFrame.length * TREE_SCALE + TREE_SCALE;
    painter.paintPixelGrid(treeFrame, TREE_X, treeTopY, TREE_SCALE, SILHOUETTE_COLOR);

    const ravenFrames: readonly PixelGrid[] = PIXEL_BACKDROP_DEFINITIONS.raven.frames;
    const isLookingLeft: boolean =
      elapsedMilliseconds % RAVEN_CYCLE_IN_MILLISECONDS <
      RAVEN_LOOKING_LEFT_DURATION_IN_MILLISECONDS;
    painter.paintPixelGrid(
      ravenFrames[isLookingLeft ? 0 : 1],
      RAVEN_X,
      RAVEN_Y,
      1,
      SILHOUETTE_COLOR,
    );
  }

  /** Le serpent traverse lentement le cimetière en ondulant, et sort la langue de temps en temps. */
  private paintCrawlingSnake(painter: PixelPainter, elapsedMilliseconds: number): void {
    const travelWidth: number = TEASER_SCENE_WIDTH + SNAKE_OFFSCREEN_MARGIN * 2;
    const headX: number = Math.round(
      ((elapsedMilliseconds * SNAKE_SPEED_IN_PIXELS_PER_MILLISECOND) % travelWidth) -
        SNAKE_OFFSCREEN_MARGIN,
    );
    const bodyYAt = (x: number): number =>
      SNAKE_BASE_Y + Math.round(2 * Math.sin(x / 5 - elapsedMilliseconds / 250));

    for (let segmentIndex: number = SNAKE_SEGMENT_COUNT; segmentIndex >= 1; segmentIndex--) {
      const segmentX: number = headX - segmentIndex * SNAKE_SEGMENT_SPACING;
      const isTailTip: boolean = segmentIndex >= SNAKE_SEGMENT_COUNT - 1;
      painter.fillRect(
        segmentX,
        bodyYAt(segmentX),
        SNAKE_SEGMENT_SPACING,
        isTailTip ? 1 : 2,
        SNAKE_RING_COLORS[segmentIndex % SNAKE_RING_COLORS.length],
      );
    }

    const headY: number = bodyYAt(headX) - 1;
    painter.fillRect(headX, headY, 4, 3, SNAKE_HEAD_COLOR);
    painter.fillPixel(headX + 2, headY, SNAKE_EYE_COLOR);
    const isTongueOut: boolean = Math.floor(elapsedMilliseconds / 150) % 7 === 0;
    if (isTongueOut) {
      painter.fillPixel(headX + 4, headY + 1, SNAKE_TONGUE_COLOR);
      painter.fillPixel(headX + 5, headY, SNAKE_TONGUE_COLOR);
      painter.fillPixel(headX + 5, headY + 2, SNAKE_TONGUE_COLOR);
    }
  }
}
