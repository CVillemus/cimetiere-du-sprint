import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  untracked,
} from '@angular/core';
import { Film } from '../../../../core/films/film.model';
import { TvSoundDesign } from '../../../../core/sound/tv-sound-design';
import { FilmVoteSummary, formatAverageScore } from '../../../../core/voting/film-vote-summary';
import { PartyResultsStore } from '../../../../core/voting/party-results.store';
import { PixelIcon } from '../../../../shared/components/pixel-icon/pixel-icon';

/**
 * Slide Vote : les cartes retournées le soir de la fête, et la moyenne du film.
 * En arrivant sur la slide, le coup de théâtre sonne, coloré par l'accueil du film.
 */
@Component({
  selector: 'app-vote-slide',
  imports: [PixelIcon],
  templateUrl: './vote-slide.html',
  styleUrl: './vote-slide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteSlide {
  private readonly partyResultsStore: PartyResultsStore = inject(PartyResultsStore);
  private readonly tvSoundDesign: TvSoundDesign = inject(TvSoundDesign);

  readonly film: InputSignal<Film> = input.required<Film>();
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  protected readonly filmVoteSummary: Signal<FilmVoteSummary> = computed((): FilmVoteSummary =>
    this.partyResultsStore.filmVoteSummary(this.film().id),
  );

  protected readonly formattedAverageScore: Signal<string> = computed((): string =>
    formatAverageScore(this.filmVoteSummary().averageScore),
  );

  constructor() {
    effect(() => {
      if (this.isActive()) {
        untracked(() => this.tvSoundDesign.playVotesRevealed(this.film().id));
      }
    });
  }
}
