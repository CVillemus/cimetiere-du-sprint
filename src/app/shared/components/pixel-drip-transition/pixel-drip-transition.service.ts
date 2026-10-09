import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

/** Sens de la nuée de chauves-souris : vers la droite pour l'onglet suivant, vers la gauche sinon. */
export type BatSwarmDirection = 'to-right' | 'to-left';

/** Ce que doit savoir faire le composant qui dessine la nuée de chauves-souris (TV uniquement). */
export interface BatSwarmTransitionPlayer {
  /** Couvre l'écran en passant, appelle `swapContent` une fois l'écran caché, puis le découvre. */
  playBatSwarmTransition(swapContent: () => void, direction: BatSwarmDirection): Promise<void>;
}

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
  private batSwarmTransitionPlayer: BatSwarmTransitionPlayer | null = null;

  registerTransitionPlayer(transitionPlayer: PixelDripTransitionPlayer): void {
    this.transitionPlayer = transitionPlayer;
  }

  unregisterTransitionPlayer(transitionPlayer: PixelDripTransitionPlayer): void {
    if (this.transitionPlayer === transitionPlayer) {
      this.transitionPlayer = null;
    }
  }

  registerBatSwarmTransitionPlayer(batSwarmTransitionPlayer: BatSwarmTransitionPlayer): void {
    this.batSwarmTransitionPlayer = batSwarmTransitionPlayer;
  }

  unregisterBatSwarmTransitionPlayer(batSwarmTransitionPlayer: BatSwarmTransitionPlayer): void {
    if (this.batSwarmTransitionPlayer === batSwarmTransitionPlayer) {
      this.batSwarmTransitionPlayer = null;
    }
  }

  /** Une seule transition à la fois : les demandes pendant une coulure sont ignorées. */
  playTransition(swapContent: () => void): void {
    const transitionPlayer: PixelDripTransitionPlayer | null = this.transitionPlayer;
    this.playExclusively(
      swapContent,
      transitionPlayer === null
        ? null
        : (): Promise<void> => transitionPlayer.playDripTransition(swapContent),
    );
  }

  /** Changement d'onglet sur la TV : la nuée de chauves-souris, avec le même verrou que la coulure. */
  playBatSwarmTransition(swapContent: () => void, direction: BatSwarmDirection): void {
    const batSwarmTransitionPlayer: BatSwarmTransitionPlayer | null = this.batSwarmTransitionPlayer;
    this.playExclusively(
      swapContent,
      batSwarmTransitionPlayer === null
        ? null
        : (): Promise<void> =>
            batSwarmTransitionPlayer.playBatSwarmTransition(swapContent, direction),
    );
  }

  /** Sans composant enregistré (tests, autre page), le contenu change directement. */
  private playExclusively(
    swapContent: () => void,
    playAnimation: (() => Promise<void>) | null,
  ): void {
    if (this.isPlayingState()) {
      return;
    }
    if (playAnimation === null) {
      swapContent();
      return;
    }
    this.isPlayingState.set(true);
    playAnimation().finally(() => this.isPlayingState.set(false));
  }
}
