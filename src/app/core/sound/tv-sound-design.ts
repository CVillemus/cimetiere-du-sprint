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
import { TvNavigationStore } from '../navigation/tv-navigation.store';
import { TvVotingSessionStore } from '../voting/tv-voting-session.store';
import { SpookySynth } from './spooky-synth';
import { detectVotingSoundCues, VotingSoundCue, VotingSoundSnapshot } from './voting-sound-cues';

const NORMAL_VOLUME: number = 0.6;
/** Pendant la bande-annonce, les sons de vote restent audibles sans couvrir YouTube. */
const TRAILER_VOLUME: number = 0.2;
const VOLUME_FADE_TIME_CONSTANT_IN_SECONDS: number = 0.15;

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
        this.spookySynth?.playDramaticReveal();
        break;
    }
  }

  private computeTargetVolume(isAwake: boolean, isMuted: boolean, isTrailerShown: boolean): number {
    if (!isAwake || isMuted) {
      return 0;
    }
    return isTrailerShown ? TRAILER_VOLUME : NORMAL_VOLUME;
  }
}
