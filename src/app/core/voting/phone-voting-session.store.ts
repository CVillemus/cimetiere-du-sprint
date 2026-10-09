import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Film, FilmId } from '../films/film.model';
import { FILMS } from '../films/films.data';
import { VotingApi } from './voting-api';
import { FilmVote, Participant, VoteScore, VotingSession } from './voting.model';

/** L'écran à afficher sur le téléphone, déduit de l'état de la session. */
export type PhoneVotingStep =
  | 'loading'
  | 'connection-failed'
  | 'waiting-for-tv'
  | 'pseudo'
  | 'lobby'
  | 'voting'
  | 'revealed'
  | 'sprint-review';

export interface RevealedFilmVote {
  readonly pseudo: string;
  readonly score: VoteScore;
  readonly isMine: boolean;
}

/**
 * Côté téléphone : rejoint la dernière session créée par la TV, inscrit le pseudo,
 * et vote pour le film affiché sur la TV.
 */
@Injectable({ providedIn: 'root' })
export class PhoneVotingSessionStore {
  private readonly votingApi: VotingApi = inject(VotingApi);

  private readonly isLoadingState: WritableSignal<boolean> = signal(true);
  private readonly hasConnectionFailedState: WritableSignal<boolean> = signal(false);
  private readonly userIdState: WritableSignal<string | null> = signal(null);
  private readonly votingSessionState: WritableSignal<VotingSession | null> = signal(null);
  private readonly participantsState: WritableSignal<readonly Participant[]> = signal([]);
  private readonly visibleFilmVotesState: WritableSignal<readonly FilmVote[]> = signal([]);

  readonly votingSession: Signal<VotingSession | null> = this.votingSessionState.asReadonly();

  readonly myParticipant: Signal<Participant | null> = computed(
    (): Participant | null =>
      this.participantsState().find(
        (participant: Participant): boolean => participant.userId === this.userIdState(),
      ) ?? null,
  );

  readonly currentFilm: Signal<Film | null> = computed((): Film | null => {
    const currentFilmId: FilmId | null = this.votingSessionState()?.currentFilmId ?? null;
    return FILMS.find((film: Film): boolean => film.id === currentFilmId) ?? null;
  });

  readonly isCurrentFilmRevealed: Signal<boolean> = computed((): boolean => {
    const currentFilm: Film | null = this.currentFilm();
    return (
      currentFilm !== null &&
      (this.votingSessionState()?.revealedFilmIds.includes(currentFilm.id) ?? false)
    );
  });

  readonly myScoreForCurrentFilm: Signal<VoteScore | null> = computed((): VoteScore | null => {
    const myParticipant: Participant | null = this.myParticipant();
    const currentFilm: Film | null = this.currentFilm();
    if (myParticipant === null || currentFilm === null) {
      return null;
    }
    return (
      this.visibleFilmVotesState().find(
        (filmVote: FilmVote): boolean =>
          filmVote.participantId === myParticipant.id && filmVote.filmId === currentFilm.id,
      )?.score ?? null
    );
  });

  readonly revealedVotesForCurrentFilm: Signal<readonly RevealedFilmVote[]> = computed(
    (): readonly RevealedFilmVote[] => {
      const currentFilm: Film | null = this.currentFilm();
      if (currentFilm === null || !this.isCurrentFilmRevealed()) {
        return [];
      }
      return this.visibleFilmVotesState()
        .filter((filmVote: FilmVote): boolean => filmVote.filmId === currentFilm.id)
        .map((filmVote: FilmVote): RevealedFilmVote => ({
          pseudo:
            this.participantsState().find(
              (participant: Participant): boolean => participant.id === filmVote.participantId,
            )?.pseudo ?? '???',
          score: filmVote.score,
          isMine: filmVote.participantId === this.myParticipant()?.id,
        }))
        .sort(
          (firstVote: RevealedFilmVote, secondVote: RevealedFilmVote): number =>
            secondVote.score - firstVote.score,
        );
    },
  );

  readonly phoneVotingStep: Signal<PhoneVotingStep> = computed((): PhoneVotingStep => {
    const votingSession: VotingSession | null = this.votingSessionState();
    if (this.isLoadingState()) {
      return 'loading';
    }
    if (this.hasConnectionFailedState()) {
      return 'connection-failed';
    }
    if (votingSession === null) {
      return 'waiting-for-tv';
    }
    if (this.myParticipant() === null) {
      return 'pseudo';
    }
    switch (votingSession.stage) {
      case 'lobby':
        return 'lobby';
      case 'sprint-review':
        return 'sprint-review';
      case 'film':
        return this.isCurrentFilmRevealed() ? 'revealed' : 'voting';
    }
  });

  private hasStartedVoting: boolean = false;
  private unsubscribeFromVotingSessionChanges: (() => void) | null = null;
  private unsubscribeFromNewVotingSessions: (() => void) | null = null;

  /**
   * Appelé une fois par la VotePage.
   * `requestedSessionId` vient du QR code de la TV : on rejoint exactement sa séance.
   * Sans identifiant (adresse tapée à la main), on se rabat sur la séance la plus récente.
   */
  async startVoting(requestedSessionId: string | null): Promise<void> {
    if (this.hasStartedVoting) {
      return;
    }
    this.hasStartedVoting = true;
    try {
      this.userIdState.set(await this.votingApi.signInAnonymously());
      const requestedVotingSession: VotingSession | null =
        requestedSessionId === null
          ? null
          : await this.votingApi.getVotingSessionById(requestedSessionId);
      if (requestedVotingSession !== null) {
        await this.followVotingSession(requestedVotingSession);
        return;
      }

      // Si la TV crée sa séance plus tard, on la rejoint automatiquement.
      this.unsubscribeFromNewVotingSessions = this.votingApi.subscribeToNewVotingSessions(
        (votingSession: VotingSession) => void this.followVotingSession(votingSession),
      );
      const latestVotingSession: VotingSession | null =
        await this.votingApi.getLatestVotingSession();
      if (latestVotingSession !== null) {
        await this.followVotingSession(latestVotingSession);
      }
    } catch (startError: unknown) {
      console.error(startError);
      this.hasConnectionFailedState.set(true);
    } finally {
      this.isLoadingState.set(false);
    }
  }

  stopVoting(): void {
    this.unsubscribeFromVotingSessionChanges?.();
    this.unsubscribeFromNewVotingSessions?.();
    this.unsubscribeFromVotingSessionChanges = null;
    this.unsubscribeFromNewVotingSessions = null;
    this.hasStartedVoting = false;
  }

  /** Peut lever `PseudoAlreadyTakenError` : le formulaire l'affiche sous le champ. */
  async joinVotingSession(pseudo: string): Promise<void> {
    const votingSession: VotingSession | null = this.votingSessionState();
    if (votingSession === null) {
      return;
    }
    const participant: Participant = await this.votingApi.createParticipant(
      votingSession.id,
      pseudo.trim(),
    );
    this.storeParticipant(participant);
  }

  /** Vote (ou change d'avis) pour le film affiché sur la TV. */
  async castFilmVote(score: VoteScore): Promise<void> {
    const votingSession: VotingSession | null = this.votingSessionState();
    const myParticipant: Participant | null = this.myParticipant();
    const currentFilm: Film | null = this.currentFilm();
    if (votingSession === null || myParticipant === null || currentFilm === null) {
      return;
    }
    const previousScore: VoteScore | null = this.myScoreForCurrentFilm();
    const filmVote: FilmVote = {
      participantId: myParticipant.id,
      filmId: currentFilm.id,
      score,
    };
    // Affichage optimiste : la carte est sélectionnée tout de suite, on annule si Supabase refuse.
    this.storeVisibleFilmVote(filmVote);
    try {
      await this.votingApi.upsertFilmVote({ sessionId: votingSession.id, ...filmVote });
    } catch (voteError: unknown) {
      console.error(voteError);
      this.removeMyVoteForFilm(myParticipant.id, currentFilm.id, previousScore);
    }
  }

  private async followVotingSession(votingSession: VotingSession): Promise<void> {
    this.unsubscribeFromVotingSessionChanges?.();
    const [participants, visibleFilmVotes] = await Promise.all([
      this.votingApi.getParticipants(votingSession.id),
      this.votingApi.getVisibleFilmVotes(votingSession.id),
    ]);
    this.participantsState.set(participants);
    this.visibleFilmVotesState.set(visibleFilmVotes);
    this.votingSessionState.set(votingSession);

    this.unsubscribeFromVotingSessionChanges = this.votingApi.subscribeToVotingSessionChanges(
      votingSession.id,
      {
        onVotingSessionUpdated: (updatedVotingSession: VotingSession) =>
          void this.handleVotingSessionUpdated(updatedVotingSession),
        onParticipantJoined: (participant: Participant) => this.storeParticipant(participant),
        onVoteReceiptCreated: () => undefined,
        onFilmVoteChanged: (filmVote: FilmVote) => this.storeVisibleFilmVote(filmVote),
      },
    );
  }

  /**
   * On ne recharge les votes qu'après une révélation : c'est le seul moment où la RLS
   * nous en montre de nouveaux. Recharger à chaque changement de film pourrait écraser
   * un vote tout juste lancé (requête partie avant le vote, réponse arrivée après).
   */
  private async handleVotingSessionUpdated(updatedVotingSession: VotingSession): Promise<void> {
    const previousRevealedFilmCount: number =
      this.votingSessionState()?.revealedFilmIds.length ?? 0;
    this.votingSessionState.set(updatedVotingSession);
    if (updatedVotingSession.revealedFilmIds.length === previousRevealedFilmCount) {
      return;
    }
    try {
      this.visibleFilmVotesState.set(
        await this.votingApi.getVisibleFilmVotes(updatedVotingSession.id),
      );
    } catch (reloadError: unknown) {
      console.error(reloadError);
    }
  }

  private storeParticipant(participant: Participant): void {
    this.participantsState.update((participants: readonly Participant[]) =>
      participants.some(
        (knownParticipant: Participant): boolean => knownParticipant.id === participant.id,
      )
        ? participants
        : [...participants, participant],
    );
  }

  private storeVisibleFilmVote(filmVote: FilmVote): void {
    this.visibleFilmVotesState.update((filmVotes: readonly FilmVote[]) => [
      ...filmVotes.filter(
        (knownFilmVote: FilmVote): boolean =>
          knownFilmVote.participantId !== filmVote.participantId ||
          knownFilmVote.filmId !== filmVote.filmId,
      ),
      filmVote,
    ]);
  }

  private removeMyVoteForFilm(
    participantId: string,
    filmId: FilmId,
    previousScore: VoteScore | null,
  ): void {
    if (previousScore !== null) {
      this.storeVisibleFilmVote({ participantId, filmId, score: previousScore });
      return;
    }
    this.visibleFilmVotesState.update((filmVotes: readonly FilmVote[]) =>
      filmVotes.filter(
        (filmVote: FilmVote): boolean =>
          filmVote.participantId !== participantId || filmVote.filmId !== filmId,
      ),
    );
  }
}
