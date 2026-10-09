import { inject, Injectable } from '@angular/core';
import {
  PostgrestError,
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';
import { FilmId } from '../films/film.model';
import { FILMS } from '../films/films.data';
import {
  ParticipantRow,
  VoteReceiptRow,
  VoteRow,
  VotingSessionRow,
} from '../supabase/database.types';
import { CimetiereSupabaseClient, SUPABASE_CLIENT } from '../supabase/supabase-client';
import {
  FilmVote,
  FilmVoteToCast,
  Participant,
  PseudoAlreadyTakenError,
  VoteReceipt,
  VoteScore,
  VotingSession,
  VotingStage,
} from './voting.model';

/** Code PostgreSQL d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION_ERROR_CODE: string = '23505';

const KNOWN_FILM_IDS: ReadonlySet<string> = new Set(FILMS.map((film) => film.id));

function isFilmId(value: string): value is FilmId {
  return KNOWN_FILM_IDS.has(value);
}

function isVoteScore(value: number): value is VoteScore {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function toVotingSession(votingSessionRow: VotingSessionRow): VotingSession {
  const currentFilmId: string | null = votingSessionRow.current_film_id;
  return {
    id: votingSessionRow.id,
    hostUserId: votingSessionRow.host_user_id,
    stage: votingSessionRow.stage,
    currentFilmId: currentFilmId !== null && isFilmId(currentFilmId) ? currentFilmId : null,
    revealedFilmIds: votingSessionRow.revealed_film_ids.filter(isFilmId),
  };
}

function toParticipant(participantRow: ParticipantRow): Participant {
  return { id: participantRow.id, userId: participantRow.user_id, pseudo: participantRow.pseudo };
}

function toVoteReceipt(voteReceiptRow: VoteReceiptRow): VoteReceipt | null {
  return isFilmId(voteReceiptRow.film_id)
    ? { participantId: voteReceiptRow.participant_id, filmId: voteReceiptRow.film_id }
    : null;
}

function toFilmVote(voteRow: VoteRow): FilmVote | null {
  return isFilmId(voteRow.film_id) && isVoteScore(voteRow.score)
    ? { participantId: voteRow.participant_id, filmId: voteRow.film_id, score: voteRow.score }
    : null;
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

function throwIfPostgrestError(postgrestError: PostgrestError | null, context: string): void {
  if (postgrestError !== null) {
    throw new Error(`${context} : ${postgrestError.message}`);
  }
}

export interface VotingSessionChangeHandlers {
  readonly onVotingSessionUpdated: (votingSession: VotingSession) => void;
  readonly onParticipantJoined: (participant: Participant) => void;
  readonly onVoteReceiptCreated: (voteReceipt: VoteReceipt) => void;
  readonly onFilmVoteChanged: (filmVote: FilmVote) => void;
}

/**
 * Tous les appels à Supabase, isolés dans des méthodes au nom métier.
 * Les stores n'utilisent jamais le client Supabase directement.
 */
@Injectable({ providedIn: 'root' })
export class VotingApi {
  private readonly supabase: CimetiereSupabaseClient = inject(SUPABASE_CLIENT);

  /** Connexion anonyme : un identifiant stable par appareil, gardé dans le navigateur. */
  async signInAnonymously(): Promise<string> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    if (sessionData.session !== null) {
      return sessionData.session.user.id;
    }
    const { data: signInData, error: signInError } = await this.supabase.auth.signInAnonymously();
    if (signInError !== null || signInData.user === null) {
      throw new Error(
        `Connexion anonyme impossible : ${signInError?.message ?? 'aucun utilisateur'}`,
      );
    }
    return signInData.user.id;
  }

  async getLatestVotingSession(): Promise<VotingSession | null> {
    const { data: votingSessionRow, error } = await this.supabase
      .from('voting_session')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    throwIfPostgrestError(error, 'Lecture de la session');
    return votingSessionRow === null ? null : toVotingSession(votingSessionRow);
  }

  async getLatestVotingSessionHostedBy(hostUserId: string): Promise<VotingSession | null> {
    const { data: votingSessionRow, error } = await this.supabase
      .from('voting_session')
      .select('*')
      .eq('host_user_id', hostUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    throwIfPostgrestError(error, 'Lecture de la session de la TV');
    return votingSessionRow === null ? null : toVotingSession(votingSessionRow);
  }

  async createVotingSession(): Promise<VotingSession> {
    const { data: votingSessionRow, error } = await this.supabase
      .from('voting_session')
      .insert({})
      .select('*')
      .single();
    throwIfPostgrestError(error, 'Création de la session');
    if (votingSessionRow === null) {
      throw new Error('Création de la session : aucune ligne renvoyée');
    }
    return toVotingSession(votingSessionRow);
  }

  async updateVotingSessionStage(
    sessionId: string,
    stage: VotingStage,
    currentFilmId: FilmId | null,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('voting_session')
      .update({ stage, current_film_id: currentFilmId })
      .eq('id', sessionId);
    throwIfPostgrestError(error, "Changement d'étape de la session");
  }

  async updateRevealedFilmIds(
    sessionId: string,
    revealedFilmIds: readonly FilmId[],
  ): Promise<void> {
    const { error } = await this.supabase
      .from('voting_session')
      .update({ revealed_film_ids: [...revealedFilmIds] })
      .eq('id', sessionId);
    throwIfPostgrestError(error, 'Révélation des votes');
  }

  async getParticipants(sessionId: string): Promise<Participant[]> {
    const { data: participantRows, error } = await this.supabase
      .from('participant')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');
    throwIfPostgrestError(error, 'Lecture des participants');
    return (participantRows ?? []).map(toParticipant);
  }

  async createParticipant(sessionId: string, pseudo: string): Promise<Participant> {
    const { data: participantRow, error } = await this.supabase
      .from('participant')
      .insert({ session_id: sessionId, pseudo })
      .select('*')
      .single();
    if (error?.code === UNIQUE_VIOLATION_ERROR_CODE) {
      throw new PseudoAlreadyTakenError(pseudo);
    }
    throwIfPostgrestError(error, 'Inscription du participant');
    if (participantRow === null) {
      throw new Error('Inscription du participant : aucune ligne renvoyée');
    }
    return toParticipant(participantRow);
  }

  async getVoteReceipts(sessionId: string): Promise<VoteReceipt[]> {
    const { data: voteReceiptRows, error } = await this.supabase
      .from('vote_receipt')
      .select('*')
      .eq('session_id', sessionId);
    throwIfPostgrestError(error, 'Lecture des accusés de vote');
    return (voteReceiptRows ?? []).map(toVoteReceipt).filter(isPresent);
  }

  /** Les votes que la RLS nous laisse voir : les siens, et ceux des films révélés. */
  async getVisibleFilmVotes(sessionId: string): Promise<FilmVote[]> {
    const { data: voteRows, error } = await this.supabase
      .from('vote')
      .select('*')
      .eq('session_id', sessionId);
    throwIfPostgrestError(error, 'Lecture des votes');
    return (voteRows ?? []).map(toFilmVote).filter(isPresent);
  }

  /** Premier vote ou changement d'avis : une seule ligne par participant et par film. */
  async upsertFilmVote(filmVoteToCast: FilmVoteToCast): Promise<void> {
    const { error } = await this.supabase.from('vote').upsert(
      {
        session_id: filmVoteToCast.sessionId,
        participant_id: filmVoteToCast.participantId,
        film_id: filmVoteToCast.filmId,
        score: filmVoteToCast.score,
      },
      { onConflict: 'participant_id,film_id' },
    );
    throwIfPostgrestError(error, 'Enregistrement du vote');
  }

  /** Abonnement temps réel à tout ce qui bouge dans une session. Renvoie la fonction de désabonnement. */
  subscribeToVotingSessionChanges(
    sessionId: string,
    votingSessionChangeHandlers: VotingSessionChangeHandlers,
  ): () => void {
    const sessionFilter: string = `session_id=eq.${sessionId}`;
    const realtimeChannel: RealtimeChannel = this.supabase
      .channel(`voting-session-${sessionId}`)
      .on<VotingSessionRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'voting_session',
          filter: `id=eq.${sessionId}`,
        },
        (updatePayload: RealtimePostgresUpdatePayload<VotingSessionRow>) =>
          votingSessionChangeHandlers.onVotingSessionUpdated(toVotingSession(updatePayload.new)),
      )
      .on<ParticipantRow>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'participant', filter: sessionFilter },
        (insertPayload: RealtimePostgresInsertPayload<ParticipantRow>) =>
          votingSessionChangeHandlers.onParticipantJoined(toParticipant(insertPayload.new)),
      )
      .on<VoteReceiptRow>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vote_receipt', filter: sessionFilter },
        (insertPayload: RealtimePostgresInsertPayload<VoteReceiptRow>) => {
          const voteReceipt: VoteReceipt | null = toVoteReceipt(insertPayload.new);
          if (voteReceipt !== null) {
            votingSessionChangeHandlers.onVoteReceiptCreated(voteReceipt);
          }
        },
      )
      .on<VoteRow>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vote', filter: sessionFilter },
        (changePayload) => {
          if (changePayload.eventType === 'DELETE') {
            return;
          }
          const filmVote: FilmVote | null = toFilmVote(changePayload.new);
          if (filmVote !== null) {
            votingSessionChangeHandlers.onFilmVoteChanged(filmVote);
          }
        },
      )
      .subscribe();

    return (): void => {
      void this.supabase.removeChannel(realtimeChannel);
    };
  }

  /** Côté téléphone, avant que la TV ait créé sa session : on attend la première. */
  subscribeToNewVotingSessions(
    onVotingSessionCreated: (votingSession: VotingSession) => void,
  ): () => void {
    const realtimeChannel: RealtimeChannel = this.supabase
      .channel('new-voting-sessions')
      .on<VotingSessionRow>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'voting_session' },
        (insertPayload: RealtimePostgresInsertPayload<VotingSessionRow>) =>
          onVotingSessionCreated(toVotingSession(insertPayload.new)),
      )
      .subscribe();

    return (): void => {
      void this.supabase.removeChannel(realtimeChannel);
    };
  }
}
