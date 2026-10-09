/**
 * Les robes du serpent. Fichier d'illustration pixel art : la palette vit avec le dessin.
 * Les anneaux du corps se répètent dans l'ordre de `ringColors`, de la tête vers la queue.
 */
export interface SnakeSkin {
  readonly name: string;
  readonly ringColors: readonly string[];
  readonly headColor: string;
  readonly eyeColor: string;
  readonly tongueColor: string;
  /** Plus le poids est élevé, plus la robe sort souvent. */
  readonly appearanceWeight: number;
}

export const SNAKE_SKINS: readonly SnakeSkin[] = [
  {
    name: 'Serpent corail (rayé rouge, blanc, orange)',
    ringColors: ['#c0392b', '#f2ecdf', '#e8732a', '#f2ecdf'],
    headColor: '#1a1210',
    eyeColor: '#f2ecdf',
    tongueColor: '#e8a33d',
    appearanceWeight: 3,
  },
  {
    name: 'Couleuvre des marais',
    ringColors: ['#3d5230', '#4f6b3a'],
    headColor: '#5f7f45',
    eyeColor: '#e8a33d',
    tongueColor: '#8e2a2a',
    appearanceWeight: 2,
  },
  {
    name: 'Serpent d’os',
    ringColors: ['#cfc6ae', '#a89f8a'],
    headColor: '#e9e2cf',
    eyeColor: '#8e2a2a',
    tongueColor: '#8e2a2a',
    appearanceWeight: 1,
  },
  {
    name: 'Vipère de minuit',
    ringColors: ['#3a3352', '#4a4065', '#3a3352', '#e8a33d'],
    headColor: '#5a5080',
    eyeColor: '#e8a33d',
    tongueColor: '#c0392b',
    appearanceWeight: 1,
  },
];

/**
 * La mascotte des jeux (salle d'attente, spinner du téléphone) : un serpent corail
 * aux anneaux rouges, noirs et orange. Tête rouge sang, pour ne pas se perdre sur les fonds sombres.
 */
export const MASCOT_SNAKE_SKIN: SnakeSkin = {
  ...SNAKE_SKINS[0],
  ringColors: ['#c0392b', '#0a0707', '#e8732a', '#0a0707'],
  headColor: '#8e2a2a',
};

/** Tirage au sort pondéré : `randomValue` entre 0 et 1. */
export function pickSnakeSkin(randomValue: number): SnakeSkin {
  const totalWeight: number = SNAKE_SKINS.reduce(
    (weightSum: number, snakeSkin: SnakeSkin): number => weightSum + snakeSkin.appearanceWeight,
    0,
  );
  let remainingWeight: number = randomValue * totalWeight;
  for (const snakeSkin of SNAKE_SKINS) {
    remainingWeight -= snakeSkin.appearanceWeight;
    if (remainingWeight < 0) {
      return snakeSkin;
    }
  }
  return SNAKE_SKINS[SNAKE_SKINS.length - 1];
}
