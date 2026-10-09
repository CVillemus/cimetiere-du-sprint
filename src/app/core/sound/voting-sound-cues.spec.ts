import { Participant } from '../voting/voting.model';
import { detectVotingSoundCues, VotingSoundCue, VotingSoundSnapshot } from './voting-sound-cues';

const MORTICIA: Participant = { id: 'participant-1', userId: 'user-1', pseudo: 'Morticia' };
const GOMEZ: Participant = { id: 'participant-2', userId: 'user-2', pseudo: 'Gomez' };

const EMPTY_SNAPSHOT: VotingSoundSnapshot = {
  participants: [],
  voteReceipts: [],
  revealedFilmIds: [],
};

describe('detectVotingSoundCues', () => {
  it('should stay silent when nothing changed', () => {
    const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(
      EMPTY_SNAPSHOT,
      EMPTY_SNAPSHOT,
    );

    expect(votingSoundCues).toEqual([]);
  });

  it('should play the music box when someone joins', () => {
    const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(EMPTY_SNAPSHOT, {
      ...EMPTY_SNAPSHOT,
      participants: [MORTICIA],
    });

    expect(votingSoundCues).toEqual(['participant-joined']);
  });

  it('should knock when a vote arrives but someone is still missing', () => {
    const beforeVote: VotingSoundSnapshot = { ...EMPTY_SNAPSHOT, participants: [MORTICIA, GOMEZ] };

    const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(beforeVote, {
      ...beforeVote,
      voteReceipts: [{ participantId: MORTICIA.id, filmId: 'mama' }],
    });

    expect(votingSoundCues).toEqual(['vote-received']);
  });

  it('should toll the bell when the last expected vote arrives', () => {
    const beforeLastVote: VotingSoundSnapshot = {
      ...EMPTY_SNAPSHOT,
      participants: [MORTICIA, GOMEZ],
      voteReceipts: [{ participantId: MORTICIA.id, filmId: 'mama' }],
    };

    const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(beforeLastVote, {
      ...beforeLastVote,
      voteReceipts: [...beforeLastVote.voteReceipts, { participantId: GOMEZ.id, filmId: 'mama' }],
    });

    expect(votingSoundCues).toEqual(['last-vote-received']);
  });

  it('should not toll the bell when the votes of another film are complete', () => {
    const beforeVote: VotingSoundSnapshot = {
      ...EMPTY_SNAPSHOT,
      participants: [MORTICIA, GOMEZ],
      voteReceipts: [
        { participantId: MORTICIA.id, filmId: 'mama' },
        { participantId: GOMEZ.id, filmId: 'mama' },
      ],
    };

    const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(beforeVote, {
      ...beforeVote,
      voteReceipts: [
        ...beforeVote.voteReceipts,
        { participantId: MORTICIA.id, filmId: 'sinister' },
      ],
    });

    expect(votingSoundCues).toEqual(['vote-received']);
  });

  it('should play the dramatic reveal when a film is revealed', () => {
    const votingSoundCues: readonly VotingSoundCue[] = detectVotingSoundCues(EMPTY_SNAPSHOT, {
      ...EMPTY_SNAPSHOT,
      revealedFilmIds: ['mama'],
    });

    expect(votingSoundCues).toEqual(['votes-revealed']);
  });
});
