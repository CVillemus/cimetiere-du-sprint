import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { FilmId } from '../films/film.model';
import { TvNavigationStore } from '../navigation/tv-navigation.store';
import { FilmVoteSummary } from '../voting/film-vote-summary';
import { TvVotingSessionStore } from '../voting/tv-voting-session.store';
import { chooseRevealMood } from './reveal-mood';
import { SpookySynth, StereoFlightDirection } from './spooky-synth';
import { detectVotingSoundCues, VotingSoundCue, VotingSoundSnapshot } from './voting-sound-cues';

const NORMAL_VOLUME: number = 0.6;
/** Pendant la bande-annonce, les sons de vote restent audibles sans couvrir YouTube. */
const TRAILER_VOLUME: number = 0.2;
const VOLUME_FADE_TIME_CONSTANT_IN_SECONDS: number = 0.15;
/**
 * Les scores arrivent juste après la révélation (la RLS ne les rend lisibles qu'à ce moment).
 * S'ils tardent, on joue quand même le coup de théâtre, version « suspense ».
 */
const REVEAL_SCORES_MAXIMUM_WAIT_IN_MILLISECONDS: number = 1_200;

/**
 * Sound design de la TV (les téléphones restent muets : dix téléphones qui sonnent, c'est la cacophonie).
 *
 * Les navigateurs interdisent le son tant que personne n'a touché la page :
 * la TvPage appelle `wakeUp()` à la première touche ou au premier clic.
 */
@Injectable({ providedIn: 'root' })
export class TvSoundDesign {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

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
  private previousVotingSoundSnapshot: VotingSoundSnapshot | null = null;

  /** Film qui vient d'être révélé, dont on attend les scores pour choisir la couleur du son. */
  private readonly filmAwaitingRevealSoundState: WritableSignal<FilmId | null> = signal(null);
  private revealSoundFallbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

    // On compare la session avant / après chaque changement temps réel pour savoir quoi jouer.
    effect(() => {
      const isConnected: boolean = this.tvVotingSessionStore.connectionStatus() === 'connected';
      const currentVotingSoundSnapshot: VotingSoundSnapshot = {
        participants: this.tvVotingSessionStore.participants(),
        voteReceipts: this.tvVotingSessionStore.voteReceipts(),
        revealedFilmIds: this.tvVotingSessionStore.revealedFilmIds(),
      };
      if (!isConnected) {
        return;
      }
      // Premier passage : c'est l'état chargé au démarrage, pas un événement à sonoriser.
      if (this.previousVotingSoundSnapshot !== null) {
        const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(
          this.previousVotingSoundSnapshot,
          currentVotingSoundSnapshot,
        );
        untracked(() =>
          votingSoundCues.forEach((votingSoundCue: VotingSoundCue) =>
            this.playVotingSoundCue(votingSoundCue),
          ),
        );
      }
      this.previousVotingSoundSnapshot = currentVotingSoundSnapshot;
    });

    // Dès que les scores du film révélé sont lisibles, on joue le coup de théâtre à sa couleur.
    effect(() => {
      const filmAwaitingRevealSound: FilmId | null = this.filmAwaitingRevealSoundState();
      if (filmAwaitingRevealSound === null) {
        return;
      }
      const filmVoteSummary: FilmVoteSummary =
        this.tvVotingSessionStore.filmVoteSummary(filmAwaitingRevealSound);
      if (filmVoteSummary.revealedVoteCards.length > 0) {
        untracked(() => this.playRevealSound(filmVoteSummary));
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

  /** Touche M : couper ou remettre le son en pleine soirée. */
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

  /** Le glas tombe 2,2 s après le début de l'orgue, plus le délai demandé. */
  playWinnerElected(startDelayInSeconds: number): void {
    this.spookySynth?.playCryptOrgan(startDelayInSeconds);
  }

  private playVotingSoundCue(votingSoundCue: VotingSoundCue): void {
    switch (votingSoundCue) {
      case 'participant-joined':
        this.spookySynth?.playHauntedMusicBox();
        break;
      case 'vote-received':
        this.spookySynth?.playCoffinKnock();
        break;
      case 'last-vote-received':
        this.spookySynth?.playFuneralBell();
        break;
      case 'votes-revealed':
        this.waitForRevealedScores();
        break;
    }
  }

  private waitForRevealedScores(): void {
    const revealedFilmIds: readonly FilmId[] = this.tvVotingSessionStore.revealedFilmIds();
    const lastRevealedFilmId: FilmId | undefined = revealedFilmIds[revealedFilmIds.length - 1];
    if (lastRevealedFilmId === undefined) {
      return;
    }
    this.filmAwaitingRevealSoundState.set(lastRevealedFilmId);
    this.clearRevealSoundFallback();
    this.revealSoundFallbackTimeoutId = setTimeout(() => {
      if (this.filmAwaitingRevealSoundState() !== null) {
        this.filmAwaitingRevealSoundState.set(null);
        this.spookySynth?.playDramaticReveal('suspense');
      }
    }, REVEAL_SCORES_MAXIMUM_WAIT_IN_MILLISECONDS);
  }

  private playRevealSound(filmVoteSummary: FilmVoteSummary): void {
    this.filmAwaitingRevealSoundState.set(null);
    this.clearRevealSoundFallback();
    this.spookySynth?.playDramaticReveal(
      chooseRevealMood(filmVoteSummary.averageScore, filmVoteSummary.revealedVoteCards),
    );
  }

  private clearRevealSoundFallback(): void {
    if (this.revealSoundFallbackTimeoutId !== null) {
      clearTimeout(this.revealSoundFallbackTimeoutId);
      this.revealSoundFallbackTimeoutId = null;
    }
  }

  private computeTargetVolume(isAwake: boolean, isMuted: boolean, isTrailerShown: boolean): number {
    if (!isAwake || isMuted) {
      return 0;
    }
    return isTrailerShown ? TRAILER_VOLUME : NORMAL_VOLUME;
  }
}
