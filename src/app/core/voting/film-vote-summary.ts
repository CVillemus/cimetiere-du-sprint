import { FilmId } from '../films/film.model';
import { findVoteCard, VoteCard } from './vote-card.model';
import { FilmVote, Participant, VoteReceipt } from './voting.model';

export interface ParticipantVoteStatus {
  readonly participant: Participant;
  readonly hasVoted: boolean;
}

export interface RevealedVoteCard {
  readonly pseudo: string;
  readonly voteCard: VoteCard;
}

/** Tout ce que la TV doit savoir sur le vote d'un film, à un instant donné. */
export interface FilmVoteSummary {
  readonly participantVoteStatuses: readonly ParticipantVoteStatus[];
  readonly votedCount: number;
  readonly participantCount: number;
  /** Au moins un participant, et tous ont voté : la slide Vote se déverrouille. */
  readonly hasEveryoneVoted: boolean;
  readonly isRevealed: boolean;
  /** Vide tant que le film n'est pas révélé (la RLS cache les scores). */
  readonly revealedVoteCards: readonly RevealedVoteCard[];
  readonly averageScore: number | null;
}

export interface FilmVoteSummarySources {
  readonly participants: readonly Participant[];
  readonly voteReceipts: readonly VoteReceipt[];
  readonly visibleFilmVotes: readonly FilmVote[];
  readonly revealedFilmIds: readonly FilmId[];
}

export function buildFilmVoteSummary(
  filmId: FilmId,
  filmVoteSummarySources: FilmVoteSummarySources,
): FilmVoteSummary {
  const { participants, voteReceipts, visibleFilmVotes, revealedFilmIds }: FilmVoteSummarySources =
    filmVoteSummarySources;

  const votedParticipantIds: ReadonlySet<string> = new Set(
    voteReceipts
      .filter((voteReceipt: VoteReceipt): boolean => voteReceipt.filmId === filmId)
      .map((voteReceipt: VoteReceipt): string => voteReceipt.participantId),
  );
  const participantVoteStatuses: ParticipantVoteStatus[] = participants.map(
    (participant: Participant): ParticipantVoteStatus => ({
      participant,
      hasVoted: votedParticipantIds.has(participant.id),
    }),
  );
  const votedCount: number = participantVoteStatuses.filter(
    (participantVoteStatus: ParticipantVoteStatus): boolean => participantVoteStatus.hasVoted,
  ).length;

  const isRevealed: boolean = revealedFilmIds.includes(filmId);
  const filmVotes: FilmVote[] = isRevealed
    ? visibleFilmVotes.filter((filmVote: FilmVote): boolean => filmVote.filmId === filmId)
    : [];
  const revealedVoteCards: RevealedVoteCard[] = filmVotes
    .map((filmVote: FilmVote): RevealedVoteCard => ({
      pseudo:
        participants.find(
          (participant: Participant): boolean => participant.id === filmVote.participantId,
        )?.pseudo ?? '???',
      voteCard: findVoteCard(filmVote.score),
    }))
    .sort(
      (firstCard: RevealedVoteCard, secondCard: RevealedVoteCard): number =>
        secondCard.voteCard.score - firstCard.voteCard.score,
    );
  const scoreSum: number = filmVotes.reduce(
    (sum: number, filmVote: FilmVote): number => sum + filmVote.score,
    0,
  );

  return {
    participantVoteStatuses,
    votedCount,
    participantCount: participants.length,
    hasEveryoneVoted: participants.length > 0 && votedCount === participants.length,
    isRevealed,
    revealedVoteCards,
    averageScore: filmVotes.length > 0 ? scoreSum / filmVotes.length : null,
  };
}

export function formatAverageScore(averageScore: number | null): string {
  return averageScore === null ? '–' : averageScore.toFixed(1).replace('.', ',');
}
