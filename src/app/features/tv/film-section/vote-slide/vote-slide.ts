import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { Film } from '../../../../core/films/film.model';
import { FilmVoteSummary, formatAverageScore } from '../../../../core/voting/film-vote-summary';
import { TvVotingSessionStore } from '../../../../core/voting/tv-voting-session.store';
import { PixelIcon } from '../../../../shared/components/pixel-icon/pixel-icon';

const COUNTDOWN_DURATION_IN_SECONDS: number = 5;
const ONE_SECOND_IN_MILLISECONDS: number = 1000;

/**
 * Slide Vote : en arrivant dessus, un compte à rebours de 5 s, puis les cartes se retournent
 * (sur la TV et sur tous les téléphones). Si le film est déjà révélé, les résultats s'affichent directement.
 */
@Component({
  selector: 'app-vote-slide',
  imports: [PixelIcon],
  templateUrl: './vote-slide.html',
  styleUrl: './vote-slide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteSlide {
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  readonly film: InputSignal<Film> = input.required<Film>();
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  protected readonly filmVoteSummary: Signal<FilmVoteSummary> = computed((): FilmVoteSummary =>
    this.tvVotingSessionStore.filmVoteSummary(this.film().id),
  );

  protected readonly formattedAverageScore: Signal<string> = computed((): string =>
    formatAverageScore(this.filmVoteSummary().averageScore),
  );

  private readonly countdownSecondsLeftState: WritableSignal<number> = signal(
    COUNTDOWN_DURATION_IN_SECONDS,
  );
  protected readonly countdownSecondsLeft: Signal<number> =
    this.countdownSecondsLeftState.asReadonly();

  constructor() {
    // Le compte à rebours ne dépend que de l'arrivée sur la slide (isActive).
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      if (!this.isActive() || untracked(() => this.filmVoteSummary().isRevealed)) {
        return;
      }
      this.countdownSecondsLeftState.set(COUNTDOWN_DURATION_IN_SECONDS);
      const countdownIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
        const secondsLeft: number = this.countdownSecondsLeftState() - 1;
        this.countdownSecondsLeftState.set(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(countdownIntervalId);
          void this.tvVotingSessionStore.revealCurrentFilmVotes();
        }
      }, ONE_SECOND_IN_MILLISECONDS);
      // On quitte la slide avant la fin : on annule, rien n'est révélé.
      onCleanup(() => clearInterval(countdownIntervalId));
    });
  }
}
