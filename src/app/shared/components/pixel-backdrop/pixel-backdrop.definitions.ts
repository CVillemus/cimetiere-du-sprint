import {
  fillPixelGridCells,
  insertEmptyPixelGridRow,
  PixelGrid,
  shiftPixelGridRows,
} from '../../pixel-art/pixel-grid';

export type PixelBackdropKind = 'skull' | 'jolly-roger' | 'dead-tree' | 'raven' | 'spider';

export interface PixelBackdropStep {
  readonly frameIndex: number;
  readonly durationInMilliseconds: number;
}

export interface PixelBackdropDefinition {
  readonly frames: readonly PixelGrid[];
  /** Séquence jouée en boucle. */
  readonly steps: readonly PixelBackdropStep[];
  /** L'araignée pend au bout d'un fil et monte/descend en continu (animation CSS). */
  readonly hangsFromThread: boolean;
}

/** Ordre d'alternance des fonds, film après film. */
export const PIXEL_BACKDROP_ROTATION: readonly PixelBackdropKind[] = [
  'skull',
  'jolly-roger',
  'dead-tree',
  'raven',
  'spider',
];

const SKULL: PixelGrid = [
  '....#####....',
  '..#########..',
  '.###########.',
  '.###########.',
  '#############',
  '###...#...###',
  '###...#...###',
  '###...#...###',
  '#############',
  '.#####.#####.',
  '..####.####..',
  '...#.#.#.#...',
  '...#########.',
  '....#.#.#....',
];
const SKULL_EYE_COLUMNS: readonly number[] = [3, 4, 5, 7, 8, 9];

const JOLLY_ROGER: PixelGrid = [
  '##.............##',
  '###...#####...###',
  '.###.#######.###.',
  '..#.#########.#..',
  '....#########....',
  '....##..#..##....',
  '....##..#..##....',
  '....#########....',
  '.....###.###.....',
  '......#.#.#......',
  '......#####......',
  '..#...........#..',
  '.###.........###.',
  '###...........###',
  '##.............##',
];
const JOLLY_ROGER_JAW_ROW: number = 9;

const DEAD_TREE: PixelGrid = [
  '..#.........#....#...',
  '...#...#....#...#....',
  '#...#..#...#...#...#.',
  '.#...#.#...#..#...#..',
  '..#...##..#..#...#...',
  '...##..##.#.#...#....',
  '.....#..###.#..#.....',
  '......#..####.#......',
  '.......#..####.......',
  '........#.###........',
  '.........####........',
  '.........###.........',
  '.........###.........',
  '.........####........',
  '........#####........',
  '........####.........',
  '.........####........',
  '........#####........',
  '.......#######.......',
  '......#########......',
  '....#############....',
  '..#################..',
];
const DEAD_TREE_BRANCH_ROWS: readonly number[] = [0, 1, 2, 3];

const RAVEN_LOOKING_LEFT: PixelGrid = [
  '......####........',
  '.....######.......',
  '..####.#####......',
  '....#########.....',
  '.....##########...',
  '......###########.',
  '......##########..',
  '.......#######....',
  '........##.##.....',
  '........#..#......',
  '##################',
  '...........#......',
];
const RAVEN_LOOKING_RIGHT: PixelGrid = [
  '........####......',
  '.......######.....',
  '......#####.####..',
  '.....#########....',
  '.....##########...',
  '......###########.',
  '......##########..',
  '.......#######....',
  '........##.##.....',
  '........#..#......',
  '##################',
  '...........#......',
];

const SPIDER: PixelGrid = [
  '.....#.....',
  '#...###...#',
  '.#.#####.#.',
  '..#######..',
  '.#.#####.#.',
  '#...###...#',
  '....#.#....',
];
const SPIDER_LEGS_MOVED: PixelGrid = [
  '.....#.....',
  '.#..###..#.',
  '#..#####..#',
  '..#######..',
  '#..#####..#',
  '.#..###..#.',
  '....#.#....',
];

export const PIXEL_BACKDROP_DEFINITIONS: Readonly<
  Record<PixelBackdropKind, PixelBackdropDefinition>
> = {
  skull: {
    frames: [
      SKULL,
      fillPixelGridCells(SKULL, [5], SKULL_EYE_COLUMNS),
      fillPixelGridCells(SKULL, [5, 6], SKULL_EYE_COLUMNS),
      fillPixelGridCells(SKULL, [5, 6, 7], SKULL_EYE_COLUMNS),
    ],
    // Paupières qui descendent, restent fermées un instant, puis remontent.
    steps: [
      { frameIndex: 0, durationInMilliseconds: 4200 },
      { frameIndex: 1, durationInMilliseconds: 50 },
      { frameIndex: 2, durationInMilliseconds: 50 },
      { frameIndex: 3, durationInMilliseconds: 110 },
      { frameIndex: 2, durationInMilliseconds: 50 },
      { frameIndex: 1, durationInMilliseconds: 50 },
    ],
    hangsFromThread: false,
  },
  'jolly-roger': {
    frames: [JOLLY_ROGER, insertEmptyPixelGridRow(JOLLY_ROGER, JOLLY_ROGER_JAW_ROW)],
    steps: [
      { frameIndex: 0, durationInMilliseconds: 3000 },
      { frameIndex: 1, durationInMilliseconds: 120 },
      { frameIndex: 0, durationInMilliseconds: 120 },
      { frameIndex: 1, durationInMilliseconds: 120 },
      { frameIndex: 0, durationInMilliseconds: 2500 },
    ],
    hangsFromThread: false,
  },
  'dead-tree': {
    frames: [
      DEAD_TREE,
      shiftPixelGridRows(DEAD_TREE, DEAD_TREE_BRANCH_ROWS, 1),
      shiftPixelGridRows(DEAD_TREE, DEAD_TREE_BRANCH_ROWS, -1),
    ],
    steps: [
      { frameIndex: 0, durationInMilliseconds: 900 },
      { frameIndex: 1, durationInMilliseconds: 900 },
      { frameIndex: 0, durationInMilliseconds: 900 },
      { frameIndex: 2, durationInMilliseconds: 900 },
    ],
    hangsFromThread: false,
  },
  raven: {
    frames: [RAVEN_LOOKING_LEFT, RAVEN_LOOKING_RIGHT],
    steps: [
      { frameIndex: 0, durationInMilliseconds: 3500 },
      { frameIndex: 1, durationInMilliseconds: 1800 },
    ],
    hangsFromThread: false,
  },
  spider: {
    frames: [SPIDER, SPIDER_LEGS_MOVED],
    steps: [
      { frameIndex: 0, durationInMilliseconds: 400 },
      { frameIndex: 1, durationInMilliseconds: 400 },
    ],
    hangsFromThread: true,
  },
};
