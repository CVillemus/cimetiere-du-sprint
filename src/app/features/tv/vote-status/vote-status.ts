import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { FilmId } from '../../../core/films/film.model';
import { FilmVoteSummary, formatAverageScore } from '../../../core/voting/film-vote-summary';
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';

/**
 * Progression du vote, dans le panneau texte des slides Résumé et Presse, au-dessus des onglets :
 * qui a voté (sans les scores), puis la moyenne une fois les cartes retournées.
 */
@Component({
  selector: 'app-vote-status',
  templateUrl: './vote-status.html',
  styleUrl: './vote-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteStatus {
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  readonly filmId: InputSignal<FilmId> = input.required<FilmId>();

  protected readonly filmVoteSummary: Signal<FilmVoteSummary> = computed((): FilmVoteSummary =>
    this.tvVotingSessionStore.filmVoteSummary(this.filmId()),
  );

  protected readonly formattedAverageScore: Signal<string> = computed((): string =>
    formatAverageScore(this.filmVoteSummary().averageScore),
  );
}
