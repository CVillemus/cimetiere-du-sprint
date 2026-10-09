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
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';
import { findVoteCard, VoteCard } from '../../../core/voting/vote-card.model';
import { FilmVote, Participant, VoteReceipt } from '../../../core/voting/voting.model';
import { PixelIcon } from '../../../shared/components/pixel-icon/pixel-icon';

interface ParticipantVoteStatus {
  readonly participant: Participant;
  readonly hasVoted: boolean;
}

interface RevealedVoteCard {
  readonly pseudo: string;
  readonly voteCard: VoteCard;
}

/**
 * Encart de vote d'un film sur la TV.
 * Avant la révélation : qui a voté (sans les scores). Après : les cartes retournées.
 */
@Component({
  selector: 'app-vote-status',
  imports: [PixelIcon],
  templateUrl: './vote-status.html',
  styleUrl: './vote-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteStatus {
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  readonly filmId: InputSignal<FilmId> = input.required<FilmId>();

  protected readonly isRevealed: Signal<boolean> = computed((): boolean =>
    this.tvVotingSessionStore.revealedFilmIds().includes(this.filmId()),
  );

  protected readonly participantVoteStatuses: Signal<readonly ParticipantVoteStatus[]> = computed(
    (): readonly ParticipantVoteStatus[] => {
      const votedParticipantIds: ReadonlySet<string> = new Set(
        this.tvVotingSessionStore
          .voteReceipts()
          .filter((voteReceipt: VoteReceipt): boolean => voteReceipt.filmId === this.filmId())
          .map((voteReceipt: VoteReceipt): string => voteReceipt.participantId),
      );
      return this.tvVotingSessionStore
        .participants()
        .map((participant: Participant): ParticipantVoteStatus => ({
          participant,
          hasVoted: votedParticipantIds.has(participant.id),
        }));
    },
  );

  protected readonly votedCount: Signal<number> = computed(
    (): number =>
      this.participantVoteStatuses().filter(
        (participantVoteStatus: ParticipantVoteStatus): boolean => participantVoteStatus.hasVoted,
      ).length,
  );

  protected readonly revealedVoteCards: Signal<readonly RevealedVoteCard[]> = computed(
    (): readonly RevealedVoteCard[] =>
      this.tvVotingSessionStore
        .visibleFilmVotes()
        .filter((filmVote: FilmVote): boolean => filmVote.filmId === this.filmId())
        .map((filmVote: FilmVote): RevealedVoteCard => ({
          pseudo:
            this.tvVotingSessionStore
              .participants()
              .find(
                (participant: Participant): boolean => participant.id === filmVote.participantId,
              )?.pseudo ?? '???',
          voteCard: findVoteCard(filmVote.score),
        }))
        .sort(
          (firstCard: RevealedVoteCard, secondCard: RevealedVoteCard): number =>
            secondCard.voteCard.score - firstCard.voteCard.score,
        ),
  );

  protected readonly formattedAverageScore: Signal<string> = computed((): string => {
    const revealedVoteCards: readonly RevealedVoteCard[] = this.revealedVoteCards();
    if (revealedVoteCards.length === 0) {
      return '–';
    }
    const scoreSum: number = revealedVoteCards.reduce(
      (sum: number, revealedVoteCard: RevealedVoteCard): number =>
        sum + revealedVoteCard.voteCard.score,
      0,
    );
    return (scoreSum / revealedVoteCards.length).toFixed(1).replace('.', ',');
  });
}
