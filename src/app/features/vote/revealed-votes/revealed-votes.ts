import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { RevealedFilmVote } from '../../../core/voting/phone-voting-session.store';
import { findVoteCard, VoteCard } from '../../../core/voting/vote-card.model';
import { PixelIcon } from '../../../shared/components/pixel-icon/pixel-icon';

interface RevealedVoteLine {
  readonly pseudo: string;
  readonly voteCard: VoteCard;
  readonly isMine: boolean;
}

/** Les cartes retournées sur le téléphone, après la révélation. */
@Component({
  selector: 'app-revealed-votes',
  imports: [PixelIcon],
  templateUrl: './revealed-votes.html',
  styleUrl: './revealed-votes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevealedVotes {
  readonly revealedVotes: InputSignal<readonly RevealedFilmVote[]> =
    input.required<readonly RevealedFilmVote[]>();

  protected readonly revealedVoteLines: Signal<readonly RevealedVoteLine[]> = computed(
    (): readonly RevealedVoteLine[] =>
      this.revealedVotes().map((revealedVote: RevealedFilmVote): RevealedVoteLine => ({
        pseudo: revealedVote.pseudo,
        voteCard: findVoteCard(revealedVote.score),
        isMine: revealedVote.isMine,
      })),
  );

  protected readonly formattedAverageScore: Signal<string> = computed((): string => {
    const revealedVotes: readonly RevealedFilmVote[] = this.revealedVotes();
    if (revealedVotes.length === 0) {
      return '–';
    }
    const scoreSum: number = revealedVotes.reduce(
      (sum: number, revealedVote: RevealedFilmVote): number => sum + revealedVote.score,
      0,
    );
    return (scoreSum / revealedVotes.length).toFixed(1).replace('.', ',');
  });
}
