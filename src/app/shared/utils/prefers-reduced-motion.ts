/** `true` si l'utilisateur a demandé à réduire les animations dans son système. */
export function prefersReducedMotion(): boolean {
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
