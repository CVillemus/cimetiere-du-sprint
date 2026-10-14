import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

/**
 * Écran « compact » : téléphone, tablette tactile ou petite fenêtre.
 * Même requête que les `@media` des composants (voir COMPACT_VIEWPORT_MEDIA_QUERY) :
 * on y défile au doigt au lieu de piloter au clavier, et les écrans s'empilent.
 */
export const COMPACT_VIEWPORT_MEDIA_QUERY: string =
  '(max-width: 760px), (hover: none) and (pointer: coarse)';

@Injectable({ providedIn: 'root' })
export class CompactViewport {
  private readonly isCompactState: WritableSignal<boolean> = signal(false);
  readonly isCompact: Signal<boolean> = this.isCompactState.asReadonly();

  constructor() {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const compactMediaQueryList: MediaQueryList = window.matchMedia(COMPACT_VIEWPORT_MEDIA_QUERY);
    this.isCompactState.set(compactMediaQueryList.matches);
    const updateCompactState = (mediaQueryListEvent: MediaQueryListEvent): void =>
      this.isCompactState.set(mediaQueryListEvent.matches);
    compactMediaQueryList.addEventListener('change', updateCompactState);
    inject(DestroyRef).onDestroy(() =>
      compactMediaQueryList.removeEventListener('change', updateCompactState),
    );
  }
}
