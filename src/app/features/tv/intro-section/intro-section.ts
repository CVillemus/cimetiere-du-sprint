import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { FilmRanking } from '../../../core/voting/film-ranking';
import { formatAverageScore } from '../../../core/voting/film-vote-summary';
import { PartyResultsStore } from '../../../core/voting/party-results.store';
import { Participant } from '../../../core/voting/voting.model';
import { WanderingSnake } from '../../../shared/components/wandering-snake/wandering-snake';
import { FilmScene } from '../film-section/film-scene/film-scene';

/**
 * Section 0 : l'accueil des archives. Le souvenir de la soirée du 10 octobre :
 * les âmes présentes, le film élu, et l'invitation à visiter les tombes.
 */
@Component({
  selector: 'app-intro-section',
  imports: [WanderingSnake, FilmScene],
  templateUrl: './intro-section.html',
  styleUrl: './intro-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroSection {
  private readonly partyResultsStore: PartyResultsStore = inject(PartyResultsStore);

  readonly isCurrentSection: InputSignal<boolean> = input.required<boolean>();

  protected readonly participants: readonly Participant[] = this.partyResultsStore.participants;
  /** Le classement met le film élu en tête (les films vétoés sont relégués en bas). */
  protected readonly electedFilm: FilmRanking = this.partyResultsStore.filmRankings[0];
  protected readonly electedFilmAverage: string = formatAverageScore(this.electedFilm.averageScore);
}
