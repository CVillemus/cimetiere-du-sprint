import { FilmId } from '../films/film.model';
import { Participant, VoteReceipt } from '../voting/voting.model';

/** Les événements de vote qui déclenchent un son sur la TV. */
export type VotingSoundCue =
  'participant-joined' | 'vote-received' | 'last-vote-received' | 'votes-revealed';

/** Photo de la session à un instant donné : on compare deux photos pour savoir quoi jouer. */
export interface VotingSoundSnapshot {
  readonly participants: readonly Participant[];
  readonly voteReceipts: readonly VoteReceipt[];
  readonly revealedFilmIds: readonly FilmId[];
}

/**
 * Compare deux photos de la session et renvoie les sons à jouer.
 * Plusieurs votes arrivés d'un coup ne donnent qu'un seul son : le glas l'emporte sur le toc
 * si l'un d'eux est le dernier vote attendu pour son film.
 */
export function detectVotingSoundCues(
  previousSnapshot: VotingSoundSnapshot,
  currentSnapshot: VotingSoundSnapshot,
): readonly VotingSoundCue[] {
  const votingSoundCues: VotingSoundCue[] = [];

  if (currentSnapshot.participants.length > previousSnapshot.participants.length) {
    votingSoundCues.push('participant-joined');
  }

  const newVoteReceipts: readonly VoteReceipt[] = currentSnapshot.voteReceipts.slice(
    previousSnapshot.voteReceipts.length,
  );
  if (newVoteReceipts.length > 0) {
    const completesAFilm: boolean = newVoteReceipts.some((newVoteReceipt: VoteReceipt): boolean =>
      hasEveryoneVotedForFilm(newVoteReceipt.filmId, currentSnapshot),
    );
    votingSoundCues.push(completesAFilm ? 'last-vote-received' : 'vote-received');
  }

  if (currentSnapshot.revealedFilmIds.length > previousSnapshot.revealedFilmIds.length) {
    votingSoundCues.push('votes-revealed');
  }

  return votingSoundCues;
}

function hasEveryoneVotedForFilm(
  filmId: FilmId,
  votingSoundSnapshot: VotingSoundSnapshot,
): boolean {
  const votedParticipantIds: ReadonlySet<string> = new Set(
    votingSoundSnapshot.voteReceipts
      .filter((voteReceipt: VoteReceipt): boolean => voteReceipt.filmId === filmId)
      .map((voteReceipt: VoteReceipt): string => voteReceipt.participantId),
  );
  return (
    votingSoundSnapshot.participants.length > 0 &&
    votingSoundSnapshot.participants.every((participant: Participant): boolean =>
      votedParticipantIds.has(participant.id),
    )
  );
}
