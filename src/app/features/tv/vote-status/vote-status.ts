import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { FilmId } from '../../../core/films/film.model';
import {
  FilmVoteSummary,
  formatAverageScore,
  ParticipantVoteStatus,
} from '../../../core/voting/film-vote-summary';
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';
import { buildStragglersMessage } from './vote-announcements';

/** Une annonce « Untel a voté », affichée quelques secondes. */
interface VoteAnnouncement {
  readonly participantId: string;
  readonly text: string;
}

const ANNOUNCEMENT_DURATION_IN_MILLISECONDS: number = 3_000;
/** Au plus trois annonces à l'écran : si tout le monde vote d'un coup, les plus anciennes partent. */
const MAXIMUM_VISIBLE_ANNOUNCEMENTS: number = 3;

/**
 * Annonces de vote, discrètes, pendant le parcours d'un film (y compris la bande-annonce) :
 * - à chaque vote, « ✓ Untel a voté » passe 3 secondes, sans jamais montrer le score ;
 * - quand il ne manque plus qu'une à trois personnes, une ligne les nomme ;
 * - quand tout le monde a voté, puis quand les cartes sont retournées, une ligne le dit.
 * Pas de compteur ni de jauge en permanence.
 */
@Component({
  selector: 'app-vote-status',
  templateUrl: './vote-status.html',
  styleUrl: './vote-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteStatus {
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  readonly filmId: InputSignal<FilmId> = input.required<FilmId>();

  protected readonly filmVoteSummary: Signal<FilmVoteSummary> = computed((): FilmVoteSummary =>
    this.tvVotingSessionStore.filmVoteSummary(this.filmId()),
  );

  protected readonly formattedAverageScore: Signal<string> = computed((): string =>
    formatAverageScore(this.filmVoteSummary().averageScore),
  );

  /** « Plus que Hugo et Max », seulement si quelqu'un a déjà voté et qu'il en manque trois au plus. */
  protected readonly stragglersMessage: Signal<string | null> = computed((): string | null => {
    const filmVoteSummary: FilmVoteSummary = this.filmVoteSummary();
    if (filmVoteSummary.votedCount === 0) {
      return null;
    }
    return buildStragglersMessage(
      filmVoteSummary.participantVoteStatuses
        .filter(
          (participantVoteStatus: ParticipantVoteStatus): boolean =>
            !participantVoteStatus.hasVoted,
        )
        .map(
          (participantVoteStatus: ParticipantVoteStatus): string =>
            participantVoteStatus.participant.pseudo,
        ),
    );
  });

  private readonly announcementsState: WritableSignal<readonly VoteAnnouncement[]> = signal([]);
  protected readonly announcements: Signal<readonly VoteAnnouncement[]> =
    this.announcementsState.asReadonly();

  /** Qui avait déjà voté au passage précédent : `null` au premier passage (pas d'annonce pour l'existant). */
  private previouslyVotedParticipantIds: ReadonlySet<string> | null = null;
  private readonly announcementTimeoutIds: Set<ReturnType<typeof setTimeout>> = new Set();

  constructor() {
    effect(() => {
      const votedParticipantStatuses: readonly ParticipantVoteStatus[] =
        this.filmVoteSummary().participantVoteStatuses.filter(
          (participantVoteStatus: ParticipantVoteStatus): boolean => participantVoteStatus.hasVoted,
        );
      const votedParticipantIds: ReadonlySet<string> = new Set(
        votedParticipantStatuses.map(
          (participantVoteStatus: ParticipantVoteStatus): string =>
            participantVoteStatus.participant.id,
        ),
      );
      const previouslyVotedParticipantIds: ReadonlySet<string> | null =
        this.previouslyVotedParticipantIds;
      this.previouslyVotedParticipantIds = votedParticipantIds;
      if (previouslyVotedParticipantIds === null) {
        return;
      }
      votedParticipantStatuses
        .filter(
          (participantVoteStatus: ParticipantVoteStatus): boolean =>
            !previouslyVotedParticipantIds.has(participantVoteStatus.participant.id),
        )
        .forEach((participantVoteStatus: ParticipantVoteStatus) =>
          untracked(() =>
            this.announce({
              participantId: participantVoteStatus.participant.id,
              text: `${participantVoteStatus.participant.pseudo} a voté`,
            }),
          ),
        );
    });
    inject(DestroyRef).onDestroy(() =>
      this.announcementTimeoutIds.forEach((timeoutId: ReturnType<typeof setTimeout>) =>
        clearTimeout(timeoutId),
      ),
    );
  }

  private announce(voteAnnouncement: VoteAnnouncement): void {
    this.announcementsState.update((announcements: readonly VoteAnnouncement[]) =>
      [...announcements, voteAnnouncement].slice(-MAXIMUM_VISIBLE_ANNOUNCEMENTS),
    );
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      this.announcementTimeoutIds.delete(timeoutId);
      this.announcementsState.update((announcements: readonly VoteAnnouncement[]) =>
        announcements.filter(
          (announcement: VoteAnnouncement): boolean => announcement !== voteAnnouncement,
        ),
      );
    }, ANNOUNCEMENT_DURATION_IN_MILLISECONDS);
    this.announcementTimeoutIds.add(timeoutId);
  }
}
