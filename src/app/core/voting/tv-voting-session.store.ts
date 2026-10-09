import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { FilmId } from '../films/film.model';
import { TvNavigationStore } from '../navigation/tv-navigation.store';
import { TvSection } from '../navigation/tv-section.model';
import { VotingApi } from './voting-api';
import { FilmVote, Participant, VoteReceipt, VotingSession, VotingStage } from './voting.model';

export type TvConnectionStatus = 'connecting' | 'connected' | 'failed';

interface VotingStageTarget {
  readonly stage: VotingStage;
  readonly currentFilmId: FilmId | null;
}

function toVotingStageTarget(tvSection: TvSection): VotingStageTarget {
  switch (tvSection.kind) {
    case 'intro':
      return { stage: 'lobby', currentFilmId: null };
    case 'film':
      return { stage: 'film', currentFilmId: tvSection.film.id };
    case 'sprint-review':
      return { stage: 'sprint-review', currentFilmId: null };
  }
}

/**
 * Côté TV (« Scrum Master ») : héberge la session de vote dans Supabase.
 * - crée ou reprend la session de cette TV ;
 * - publie la section affichée pour que les téléphones suivent ;
 * - écoute en temps réel les inscriptions et les votes ;
 * - révèle les votes du film courant.
 */
@Injectable({ providedIn: 'root' })
export class TvVotingSessionStore {
  private readonly votingApi: VotingApi = inject(VotingApi);
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);

  private readonly connectionStatusState: WritableSignal<TvConnectionStatus> = signal('connecting');
  private readonly votingSessionState: WritableSignal<VotingSession | null> = signal(null);
  private readonly participantsState: WritableSignal<readonly Participant[]> = signal([]);
  private readonly voteReceiptsState: WritableSignal<readonly VoteReceipt[]> = signal([]);
  private readonly visibleFilmVotesState: WritableSignal<readonly FilmVote[]> = signal([]);

  readonly connectionStatus: Signal<TvConnectionStatus> = this.connectionStatusState.asReadonly();
  readonly votingSession: Signal<VotingSession | null> = this.votingSessionState.asReadonly();
  readonly participants: Signal<readonly Participant[]> = this.participantsState.asReadonly();
  readonly voteReceipts: Signal<readonly VoteReceipt[]> = this.voteReceiptsState.asReadonly();
  readonly visibleFilmVotes: Signal<readonly FilmVote[]> = this.visibleFilmVotesState.asReadonly();

  readonly revealedFilmIds: Signal<readonly FilmId[]> = computed(
    (): readonly FilmId[] => this.votingSessionState()?.revealedFilmIds ?? [],
  );

  private hasStartedHosting: boolean = false;
  private unsubscribeFromVotingSessionChanges: (() => void) | null = null;

  constructor() {
    // La section affichée sur la TV devient l'étape de la session : les téléphones suivent.
    effect(() => {
      const votingSession: VotingSession | null = this.votingSessionState();
      const votingStageTarget: VotingStageTarget = toVotingStageTarget(
        this.tvNavigationStore.currentSection(),
      );
      if (votingSession === null) {
        return;
      }
      const isAlreadyPublished: boolean =
        votingSession.stage === votingStageTarget.stage &&
        votingSession.currentFilmId === votingStageTarget.currentFilmId;
      if (!isAlreadyPublished) {
        untracked(() => void this.publishVotingStage(votingSession, votingStageTarget));
      }
    });
  }

  /** Appelé une fois par la TvPage : connexion, reprise ou création de la session, abonnement. */
  async startHosting(): Promise<void> {
    if (this.hasStartedHosting) {
      return;
    }
    this.hasStartedHosting = true;
    try {
      const hostUserId: string = await this.votingApi.signInAnonymously();
      const votingSession: VotingSession =
        (await this.votingApi.getLatestVotingSessionHostedBy(hostUserId)) ??
        (await this.votingApi.createVotingSession());

      const [participants, voteReceipts, visibleFilmVotes] = await Promise.all([
        this.votingApi.getParticipants(votingSession.id),
        this.votingApi.getVoteReceipts(votingSession.id),
        this.votingApi.getVisibleFilmVotes(votingSession.id),
      ]);
      this.participantsState.set(participants);
      this.voteReceiptsState.set(voteReceipts);
      this.visibleFilmVotesState.set(visibleFilmVotes);
      this.votingSessionState.set(votingSession);

      this.unsubscribeFromVotingSessionChanges = this.votingApi.subscribeToVotingSessionChanges(
        votingSession.id,
        {
          onVotingSessionUpdated: (updatedVotingSession: VotingSession) =>
            this.handleVotingSessionUpdated(updatedVotingSession),
          onParticipantJoined: (participant: Participant) =>
            this.participantsState.update((participants: readonly Participant[]) =>
              participants.some(
                (knownParticipant: Participant): boolean => knownParticipant.id === participant.id,
              )
                ? participants
                : [...participants, participant],
            ),
          onVoteReceiptCreated: (voteReceipt: VoteReceipt) =>
            this.voteReceiptsState.update((voteReceipts: readonly VoteReceipt[]) => [
              ...voteReceipts,
              voteReceipt,
            ]),
          onFilmVoteChanged: (filmVote: FilmVote) => this.storeVisibleFilmVote(filmVote),
        },
      );
      this.connectionStatusState.set('connected');
    } catch (hostingError: unknown) {
      console.error(hostingError);
      this.connectionStatusState.set('failed');
    }
  }

  stopHosting(): void {
    this.unsubscribeFromVotingSessionChanges?.();
    this.unsubscribeFromVotingSessionChanges = null;
    this.hasStartedHosting = false;
  }

  /** Touche R : on retourne les cartes du film affiché. */
  async revealCurrentFilmVotes(): Promise<void> {
    const votingSession: VotingSession | null = this.votingSessionState();
    const currentFilmId: FilmId | null = votingSession?.currentFilmId ?? null;
    if (
      votingSession === null ||
      currentFilmId === null ||
      votingSession.revealedFilmIds.includes(currentFilmId)
    ) {
      return;
    }
    try {
      await this.votingApi.updateRevealedFilmIds(votingSession.id, [
        ...votingSession.revealedFilmIds,
        currentFilmId,
      ]);
    } catch (revealError: unknown) {
      console.error(revealError);
    }
  }

  private async publishVotingStage(
    votingSession: VotingSession,
    votingStageTarget: VotingStageTarget,
  ): Promise<void> {
    // Mise à jour locale immédiate : l'effet ne republie pas en boucle.
    this.votingSessionState.set({ ...votingSession, ...votingStageTarget });
    try {
      await this.votingApi.updateVotingSessionStage(
        votingSession.id,
        votingStageTarget.stage,
        votingStageTarget.currentFilmId,
      );
    } catch (publishError: unknown) {
      console.error(publishError);
    }
  }

  /** Après une révélation, la RLS nous laisse lire de nouveaux votes : on les recharge. */
  private async handleVotingSessionUpdated(updatedVotingSession: VotingSession): Promise<void> {
    this.votingSessionState.set(updatedVotingSession);
    try {
      this.visibleFilmVotesState.set(
        await this.votingApi.getVisibleFilmVotes(updatedVotingSession.id),
      );
    } catch (reloadError: unknown) {
      console.error(reloadError);
    }
  }

  private storeVisibleFilmVote(filmVote: FilmVote): void {
    this.visibleFilmVotesState.update((filmVotes: readonly FilmVote[]) => [
      ...filmVotes.filter(
        (knownFilmVote: FilmVote) =>
          knownFilmVote.participantId !== filmVote.participantId ||
          knownFilmVote.filmId !== filmVote.filmId,
      ),
      filmVote,
    ]);
  }
}
