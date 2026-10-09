import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

/** Ce que doit savoir faire le composant qui dessine la transition. */
export interface PixelDripTransitionPlayer {
  /** Couvre l'écran, appelle `swapContent` une fois l'écran caché, puis découvre l'écran. */
  playDripTransition(swapContent: () => void): Promise<void>;
}

/**
 * Point d'entrée unique pour changer de contenu « derrière » la coulure de pixels.
 * Le composant overlay s'enregistre ici ; sans lui (tests, autre page), le contenu change directement.
 */
@Injectable({ providedIn: 'root' })
export class PixelDripTransitionService {
  private readonly isPlayingState: WritableSignal<boolean> = signal(false);
  readonly isPlaying: Signal<boolean> = this.isPlayingState.asReadonly();

  private transitionPlayer: PixelDripTransitionPlayer | null = null;

  registerTransitionPlayer(transitionPlayer: PixelDripTransitionPlayer): void {
    this.transitionPlayer = transitionPlayer;
  }

  unregisterTransitionPlayer(transitionPlayer: PixelDripTransitionPlayer): void {
    if (this.transitionPlayer === transitionPlayer) {
      this.transitionPlayer = null;
    }
  }

  /** Une seule transition à la fois : les demandes pendant une coulure sont ignorées. */
  playTransition(swapContent: () => void): void {
    if (this.isPlayingState()) {
      return;
    }
    if (this.transitionPlayer === null) {
      swapContent();
      return;
    }
    this.isPlayingState.set(true);
    this.transitionPlayer
      .playDripTransition(swapContent)
      .finally(() => this.isPlayingState.set(false));
  }
}
