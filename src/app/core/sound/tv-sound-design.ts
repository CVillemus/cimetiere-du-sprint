import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FilmId } from '../films/film.model';
import { TvNavigationStore } from '../navigation/tv-navigation.store';
import { FilmVoteSummary } from '../voting/film-vote-summary';
import { PartyResultsStore } from '../voting/party-results.store';
import { chooseRevealMood } from './reveal-mood';
import { SpookySynth, StereoFlightDirection } from './spooky-synth';

const NORMAL_VOLUME: number = 0.6;
/** Pendant la bande-annonce, les autres sons restent audibles sans couvrir YouTube. */
const TRAILER_VOLUME: number = 0.2;
const VOLUME_FADE_TIME_CONSTANT_IN_SECONDS: number = 0.15;

/**
 * Sound design du site : sons 8 bits synthétisés, joués aux moments clés de la visite.
 *
 * Les navigateurs interdisent le son tant que personne n'a touché la page :
 * la TvPage appelle `wakeUp()` à la première touche ou au premier clic.
 */
@Injectable({ providedIn: 'root' })
export class TvSoundDesign {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly partyResultsStore: PartyResultsStore = inject(PartyResultsStore);

  private readonly isAwakeState: WritableSignal<boolean> = signal(false);
  private readonly isMutedState: WritableSignal<boolean> = signal(false);

  /** Faux tant que le navigateur n'a pas autorisé le son (aucune touche pressée). */
  readonly isAwake: Signal<boolean> = this.isAwakeState.asReadonly();
  readonly isMuted: Signal<boolean> = this.isMutedState.asReadonly();

  private readonly isTrailerShown: Signal<boolean> = computed(
    (): boolean =>
      this.tvNavigationStore.currentFilm() !== null &&
      this.tvNavigationStore.currentSlideKind() === 'trailer',
  );

  private audioContext: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private spookySynth: SpookySynth | null = null;

  constructor() {
    effect(() => {
      const targetVolume: number = this.computeTargetVolume(
        this.isAwakeState(),
        this.isMutedState(),
        this.isTrailerShown(),
      );
      if (this.audioContext !== null && this.masterVolume !== null) {
        this.masterVolume.gain.setTargetAtTime(
          targetVolume,
          this.audioContext.currentTime,
          VOLUME_FADE_TIME_CONSTANT_IN_SECONDS,
        );
      }
    });
  }

  /** À appeler depuis un geste de l'utilisateur (touche, clic) : le navigateur autorise alors le son. */
  wakeUp(): void {
    if (this.audioContext === null) {
      if (typeof AudioContext === 'undefined') {
        return;
      }
      this.audioContext = new AudioContext();
      this.masterVolume = this.audioContext.createGain();
      this.masterVolume.gain.value = this.computeTargetVolume(
        true,
        this.isMutedState(),
        this.isTrailerShown(),
      );
      this.masterVolume.connect(this.audioContext.destination);
      this.spookySynth = new SpookySynth(this.audioContext, this.masterVolume);
    }
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
    this.isAwakeState.set(true);
  }

  /** Touche M : couper ou remettre le son. */
  toggleMute(): void {
    this.isMutedState.update((isMuted: boolean): boolean => !isMuted);
  }

  playSectionChange(): void {
    this.spookySynth?.playCryptWind();
  }

  /** Changement d'onglet : le bruit d'ailes de la nuée de chauves-souris, dans le sens du vol. */
  playTabChange(direction: StereoFlightDirection): void {
    this.spookySynth?.playBatSwarm(direction);
  }

  /** En ouvrant les votes d'un film : le coup de théâtre, coloré par l'accueil que le film a reçu. */
  playVotesRevealed(filmId: FilmId): void {
    const filmVoteSummary: FilmVoteSummary = this.partyResultsStore.filmVoteSummary(filmId);
    this.spookySynth?.playDramaticReveal(
      chooseRevealMood(filmVoteSummary.averageScore, filmVoteSummary.revealedVoteCards),
    );
  }

  /** Le glas tombe 2,2 s après le début de l'orgue, plus le délai demandé. */
  playWinnerElected(startDelayInSeconds: number): void {
    this.spookySynth?.playCryptOrgan(startDelayInSeconds);
  }

  private computeTargetVolume(isAwake: boolean, isMuted: boolean, isTrailerShown: boolean): number {
    if (!isAwake || isMuted) {
      return 0;
    }
    return isTrailerShown ? TRAILER_VOLUME : NORMAL_VOLUME;
  }
}
