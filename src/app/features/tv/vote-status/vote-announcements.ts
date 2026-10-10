/** Au-delà de trois retardataires, on ne les nomme pas : l'annonce resterait discrète. */
export const MAXIMUM_NAMED_STRAGGLERS: number = 3;

/**
 * « Plus que Hugo », « Plus que Hugo et Max », « Plus que Hugo, Inès et Max ».
 * `null` quand il n'y a personne à attendre, ou trop de monde pour les nommer.
 */
export function buildStragglersMessage(stragglerPseudos: readonly string[]): string | null {
  if (stragglerPseudos.length === 0 || stragglerPseudos.length > MAXIMUM_NAMED_STRAGGLERS) {
    return null;
  }
  if (stragglerPseudos.length === 1) {
    return `Plus que ${stragglerPseudos[0]}`;
  }
  const allButLast: string = stragglerPseudos.slice(0, -1).join(', ');
  return `Plus que ${allButLast} et ${stragglerPseudos[stragglerPseudos.length - 1]}`;
}
