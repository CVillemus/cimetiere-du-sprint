import { TestBed } from '@angular/core/testing';
import { PhoneVotingSessionStore } from './phone-voting-session.store';
import { VotingApi, VotingSessionChangeHandlers } from './voting-api';
import { FilmVote, FilmVoteToCast, Participant, VotingSession } from './voting.model';

const PHONE_USER_ID: string = 'phone-user';

const LOBBY_VOTING_SESSION: VotingSession = {
  id: 'session-1',
  hostUserId: 'tv-user',
  stage: 'lobby',
  currentFilmId: null,
  revealedFilmIds: [],
};

/** Fausse API : pas de réseau, on pilote les changements « temps réel » à la main. */
class FakeVotingApi implements Partial<VotingApi> {
  latestVotingSession: VotingSession | null = LOBBY_VOTING_SESSION;
  participants: Participant[] = [];
  castFilmVotes: FilmVoteToCast[] = [];
  votingSessionChangeHandlers: VotingSessionChangeHandlers | null = null;

  signInAnonymously = async (): Promise<string> => PHONE_USER_ID;
  getLatestVotingSession = async (): Promise<VotingSession | null> => this.latestVotingSession;
  getParticipants = async (): Promise<Participant[]> => this.participants;
  getVisibleFilmVotes = async (): Promise<FilmVote[]> => [];
  createParticipant = async (sessionId: string, pseudo: string): Promise<Participant> => ({
    id: 'participant-1',
    userId: PHONE_USER_ID,
    pseudo,
  });
  upsertFilmVote = async (filmVoteToCast: FilmVoteToCast): Promise<void> => {
    this.castFilmVotes.push(filmVoteToCast);
  };
  subscribeToVotingSessionChanges = (
    sessionId: string,
    votingSessionChangeHandlers: VotingSessionChangeHandlers,
  ): (() => void) => {
    this.votingSessionChangeHandlers = votingSessionChangeHandlers;
    return () => undefined;
  };
  subscribeToNewVotingSessions = (): (() => void) => () => undefined;
}

describe('PhoneVotingSessionStore', () => {
  let fakeVotingApi: FakeVotingApi;
  let phoneVotingSessionStore: PhoneVotingSessionStore;

  beforeEach(() => {
    fakeVotingApi = new FakeVotingApi();
    TestBed.configureTestingModule({
      providers: [{ provide: VotingApi, useValue: fakeVotingApi }],
    });
    phoneVotingSessionStore = TestBed.inject(PhoneVotingSessionStore);
  });

  it('should wait for the TV when no session exists yet', async () => {
    fakeVotingApi.latestVotingSession = null;

    await phoneVotingSessionStore.startVoting(null);

    expect(phoneVotingSessionStore.phoneVotingStep()).toBe('waiting-for-tv');
  });

  it('should ask for a pseudo, then wait in the lobby', async () => {
    await phoneVotingSessionStore.startVoting(null);
    expect(phoneVotingSessionStore.phoneVotingStep()).toBe('pseudo');

    await phoneVotingSessionStore.joinVotingSession('  Morticia ');

    expect(phoneVotingSessionStore.phoneVotingStep()).toBe('lobby');
    expect(phoneVotingSessionStore.myParticipant()?.pseudo).toBe('Morticia');
  });

  it('should follow the TV to a film, vote, then show the revealed cards', async () => {
    await phoneVotingSessionStore.startVoting(null);
    await phoneVotingSessionStore.joinVotingSession('Morticia');

    fakeVotingApi.votingSessionChangeHandlers?.onVotingSessionUpdated({
      ...LOBBY_VOTING_SESSION,
      stage: 'film',
      currentFilmId: 'mama',
    });
    expect(phoneVotingSessionStore.phoneVotingStep()).toBe('voting');

    await phoneVotingSessionStore.castFilmVote(5, 'mama');
    expect(phoneVotingSessionStore.myScoreForCurrentFilm()).toBe(5);
    expect(fakeVotingApi.castFilmVotes[0]).toEqual({
      sessionId: 'session-1',
      participantId: 'participant-1',
      filmId: 'mama',
      score: 5,
    });

    fakeVotingApi.votingSessionChangeHandlers?.onVotingSessionUpdated({
      ...LOBBY_VOTING_SESSION,
      stage: 'film',
      currentFilmId: 'mama',
      revealedFilmIds: ['mama'],
    });
    expect(phoneVotingSessionStore.phoneVotingStep()).toBe('revealed');
  });

  it('should keep the vote of each film apart, and ignore a card tapped on an outdated film', async () => {
    await phoneVotingSessionStore.startVoting(null);
    await phoneVotingSessionStore.joinVotingSession('Morticia');
    fakeVotingApi.votingSessionChangeHandlers?.onVotingSessionUpdated({
      ...LOBBY_VOTING_SESSION,
      stage: 'film',
      currentFilmId: 'mama',
    });
    await phoneVotingSessionStore.castFilmVote(5, 'mama');

    // La TV revient au film précédent : le téléphone affiche encore Mama pendant la coulure.
    fakeVotingApi.votingSessionChangeHandlers?.onVotingSessionUpdated({
      ...LOBBY_VOTING_SESSION,
      stage: 'film',
      currentFilmId: 'conjuring',
    });

    expect(phoneVotingSessionStore.myScoreForFilm('mama')).toBe(5);
    expect(phoneVotingSessionStore.myScoreForFilm('conjuring')).toBeNull();

    await phoneVotingSessionStore.castFilmVote(1, 'mama');
    expect(fakeVotingApi.castFilmVotes.length).toBe(1);
  });
});
