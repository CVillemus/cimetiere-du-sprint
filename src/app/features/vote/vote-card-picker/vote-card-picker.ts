import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { VOTE_CARDS, VoteCard } from '../../../core/voting/vote-card.model';
import { VoteScore } from '../../../core/voting/voting.model';
import { PixelIcon } from '../../../shared/components/pixel-icon/pixel-icon';

/** Les 5 cartes du poker planning de l'horreur. */
@Component({
  selector: 'app-vote-card-picker',
  imports: [PixelIcon],
  templateUrl: './vote-card-picker.html',
  styleUrl: './vote-card-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteCardPicker {
  readonly selectedScore: InputSignal<VoteScore | null> = input.required<VoteScore | null>();
  readonly scoreSelected: OutputEmitterRef<VoteScore> = output<VoteScore>();

  /** De la meilleure à la pire : « OHHHHH OUI ! » en haut, sous le pouce. */
  protected readonly voteCards: readonly VoteCard[] = [...VOTE_CARDS].reverse();

  protected selectVoteCard(voteCard: VoteCard): void {
    this.scoreSelected.emit(voteCard.score);
  }
}
