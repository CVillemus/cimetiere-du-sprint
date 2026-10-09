import { PixelGrid } from '../../shared/pixel-art/pixel-grid';
import { VoteScore } from './voting.model';

export interface VoteCard {
  readonly score: VoteScore;
  readonly label: string;
  readonly iconGrid: PixelGrid;
}

const TOMBSTONE_ICON: PixelGrid = [
  '..#####..',
  '.#######.',
  '#########',
  '####.####',
  '###...###',
  '####.####',
  '####.####',
  '#########',
  '#########',
  '#########',
];

const BAT_ICON: PixelGrid = [
  '#.........#',
  '##..#.#..##',
  '###.###.###',
  '###########',
  '.#########.',
  '..##.#.##..',
  '...#...#...',
];

const CANDLE_ICON: PixelGrid = [
  '...#...',
  '..###..',
  '..###..',
  '...#...',
  '.#####.',
  '.#####.',
  '.#####.',
  '.#####.',
  '.#####.',
  '#######',
  '#######',
];

const LANTERN_ICON: PixelGrid = [
  '...###...',
  '..#...#..',
  '.#######.',
  '.#.....#.',
  '.#.###.#.',
  '.#.###.#.',
  '.#.###.#.',
  '.#.....#.',
  '.#######.',
  '..#####..',
  '...#.#...',
];

const GHOST_ICON: PixelGrid = [
  '..#####..',
  '.#######.',
  '#########',
  '##..#..##',
  '##..#..##',
  '#########',
  '####.####',
  '#########',
  '#########',
  '#########',
  '#.##.##.#',
];

/** Les 5 cartes du poker planning de l'horreur, de la pire à la meilleure. */
export const VOTE_CARDS: readonly VoteCard[] = [
  { score: 1, label: 'Hors de question', iconGrid: TOMBSTONE_ICON },
  { score: 2, label: 'Bof', iconGrid: BAT_ICON },
  { score: 3, label: 'Ok', iconGrid: CANDLE_ICON },
  { score: 4, label: 'Cool !', iconGrid: LANTERN_ICON },
  { score: 5, label: 'OHHHHH OUI !', iconGrid: GHOST_ICON },
];

export function findVoteCard(score: VoteScore): VoteCard {
  return VOTE_CARDS[score - 1];
}
