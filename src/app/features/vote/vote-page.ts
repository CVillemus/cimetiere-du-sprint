import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  DestroyRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { Film } from '../../core/films/film.model';
import { FILMS } from '../../core/films/films.data';
import {
  PhoneVotingSessionStore,
  PhoneVotingStep,
  RevealedFilmVote,
} from '../../core/voting/phone-voting-session.store';
import { Participant, VoteScore } from '../../core/voting/voting.model';
import { TriggerWarningList } from '../../shared/components/trigger-warning-list/trigger-warning-list';
import { WanderingSnake } from '../../shared/components/wandering-snake/wandering-snake';
import { PixelDripTransition } from '../../shared/components/pixel-drip-transition/pixel-drip-transition';
import { PixelDripTransitionService } from '../../shared/components/pixel-drip-transition/pixel-drip-transition.service';
import { PseudoForm } from './pseudo-form/pseudo-form';
import { RevealedVotes } from './revealed-votes/revealed-votes';
import { VoteCardPicker } from './vote-card-picker/vote-card-picker';

/** Un écran du téléphone : l'étape, et le film concerné s'il y en a un. */
interface PhoneScreen {
  readonly step: PhoneVotingStep;
  readonly film: Film | null;
}

/**
 * Page ouverte sur les téléphones via le QR code.
 * L'écran affiché suit la TV : pseudo → attente → vote → cartes révélées → podium,
 * avec la même coulure de pixels que sur la TV entre deux écrans.
 */
@Component({
  selector: 'app-vote-page',
  imports: [
    PseudoForm,
    VoteCardPicker,
    RevealedVotes,
    TriggerWarningList,
    PixelDripTransition,
    WanderingSnake,
  ],
  templateUrl: './vote-page.html',
  styleUrl: './vote-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotePage {
  /** Sur le téléphone, le serpent arrive vite et ne s'absente pas longtemps : la zone ne reste pas vide. */
  protected readonly snakeFirstAppearanceDelayInMilliseconds: number = 1_500;
  protected readonly snakeMaximumHiddenDurationInMilliseconds: number = 5_000;

  private readonly phoneVotingSessionStore: PhoneVotingSessionStore =
    inject(PhoneVotingSessionStore);

  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );

  protected readonly myParticipant: Signal<Participant | null> =
    this.phoneVotingSessionStore.myParticipant;
  protected readonly myScoreForCurrentFilm: Signal<VoteScore | null> =
    this.phoneVotingSessionStore.myScoreForCurrentFilm;
  protected readonly revealedVotesForCurrentFilm: Signal<readonly RevealedFilmVote[]> =
    this.phoneVotingSessionStore.revealedVotesForCurrentFilm;

  /**
   * L'écran réellement affiché. Il suit l'écran demandé par la TV, mais avec un temps de retard :
   * on ne le change qu'au moment où la coulure de pixels recouvre tout le téléphone.
   */
  private readonly displayedPhoneScreenState: WritableSignal<PhoneScreen> = signal({
    step: 'loading',
    film: null,
  });
  protected readonly displayedPhoneScreen: Signal<PhoneScreen> =
    this.displayedPhoneScreenState.asReadonly();

  protected readonly filmCount: number = FILMS.length;

  protected readonly displayedTombNumber: Signal<number> = computed(
    (): number =>
      FILMS.findIndex((film: Film): boolean => film === this.displayedPhoneScreen().film) + 1,
  );

  /** Paramètre d'URL `?sessionId=…` porté par le QR code de la TV (lié par le routeur). */
  readonly sessionId: InputSignal<string | undefined> = input<string>();

  constructor() {
    afterNextRender(() => void this.phoneVotingSessionStore.startVoting(this.sessionId() ?? null));
    inject(DestroyRef).onDestroy(() => this.phoneVotingSessionStore.stopVoting());

    // Dès que l'écran demandé diffère de l'écran affiché, on joue la coulure de pixels.
    // On relit aussi `isPlaying` : un changement arrivé pendant une coulure est rattrapé juste après.
    effect(() => {
      const requestedPhoneScreen: PhoneScreen = this.readRequestedPhoneScreen();
      const displayedPhoneScreen: PhoneScreen = this.displayedPhoneScreenState();
      const isSameScreen: boolean =
        requestedPhoneScreen.step === displayedPhoneScreen.step &&
        requestedPhoneScreen.film === displayedPhoneScreen.film;
      if (isSameScreen || this.pixelDripTransitionService.isPlaying()) {
        return;
      }
      const showRequestedPhoneScreen = (): void =>
        this.displayedPhoneScreenState.set(this.readRequestedPhoneScreen());
      untracked(() => {
        // Pas de coulure au tout premier affichage, juste après le chargement.
        if (displayedPhoneScreen.step === 'loading') {
          showRequestedPhoneScreen();
        } else {
          this.pixelDripTransitionService.playTransition(showRequestedPhoneScreen);
        }
      });
    });
  }

  private readRequestedPhoneScreen(): PhoneScreen {
    return {
      step: this.phoneVotingSessionStore.phoneVotingStep(),
      film: this.phoneVotingSessionStore.currentFilm(),
    };
  }

  protected castFilmVote(score: VoteScore): void {
    void this.phoneVotingSessionStore.castFilmVote(score);
  }
}
