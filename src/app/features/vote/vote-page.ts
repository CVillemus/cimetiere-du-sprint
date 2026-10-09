import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Film } from '../../core/films/film.model';
import { FILMS } from '../../core/films/films.data';
import {
  PhoneVotingSessionStore,
  PhoneVotingStep,
  RevealedFilmVote,
} from '../../core/voting/phone-voting-session.store';
import { Participant, VoteScore } from '../../core/voting/voting.model';
import { TriggerWarningList } from '../../shared/components/trigger-warning-list/trigger-warning-list';
import { PseudoForm } from './pseudo-form/pseudo-form';
import { RevealedVotes } from './revealed-votes/revealed-votes';
import { VoteCardPicker } from './vote-card-picker/vote-card-picker';

/**
 * Page ouverte sur les téléphones via le QR code.
 * L'écran affiché suit la TV : pseudo → attente → vote → cartes révélées → podium.
 */
@Component({
  selector: 'app-vote-page',
  imports: [PseudoForm, VoteCardPicker, RevealedVotes, TriggerWarningList],
  templateUrl: './vote-page.html',
  styleUrl: './vote-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotePage {
  private readonly phoneVotingSessionStore: PhoneVotingSessionStore =
    inject(PhoneVotingSessionStore);

  protected readonly phoneVotingStep: Signal<PhoneVotingStep> =
    this.phoneVotingSessionStore.phoneVotingStep;
  protected readonly myParticipant: Signal<Participant | null> =
    this.phoneVotingSessionStore.myParticipant;
  protected readonly currentFilm: Signal<Film | null> = this.phoneVotingSessionStore.currentFilm;
  protected readonly myScoreForCurrentFilm: Signal<VoteScore | null> =
    this.phoneVotingSessionStore.myScoreForCurrentFilm;
  protected readonly revealedVotesForCurrentFilm: Signal<readonly RevealedFilmVote[]> =
    this.phoneVotingSessionStore.revealedVotesForCurrentFilm;

  protected readonly filmCount: number = FILMS.length;

  protected readonly currentTombNumber: Signal<number> = computed(
    (): number => FILMS.findIndex((film: Film): boolean => film === this.currentFilm()) + 1,
  );

  /** Paramètre d'URL `?sessionId=…` porté par le QR code de la TV (lié par le routeur). */
  readonly sessionId: InputSignal<string | undefined> = input<string>();

  constructor() {
    afterNextRender(() => void this.phoneVotingSessionStore.startVoting(this.sessionId() ?? null));
    inject(DestroyRef).onDestroy(() => this.phoneVotingSessionStore.stopVoting());
  }

  protected castFilmVote(score: VoteScore): void {
    void this.phoneVotingSessionStore.castFilmVote(score);
  }
}
