import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  resource,
  ResourceRef,
  Signal,
} from '@angular/core';
import QRCode from 'qrcode';
import {
  TvConnectionStatus,
  TvVotingSessionStore,
} from '../../../core/voting/tv-voting-session.store';
import { Participant } from '../../../core/voting/voting.model';
import { IntroSnake } from './intro-snake/intro-snake';

/**
 * Section 0 : l'accroche et le QR code qui mène vers /vote.
 * L'URL de vote est calculée depuis le `<base href>` : elle marche en local comme sur GitHub Pages.
 */
@Component({
  selector: 'app-intro-section',
  imports: [IntroSnake],
  templateUrl: './intro-section.html',
  styleUrl: './intro-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroSection {
  private readonly document: Document = inject(DOCUMENT);

  readonly isCurrentSection: InputSignal<boolean> = input.required<boolean>();
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  protected readonly participants: Signal<readonly Participant[]> =
    this.tvVotingSessionStore.participants;
  protected readonly connectionStatus: Signal<TvConnectionStatus> =
    this.tvVotingSessionStore.connectionStatus;

  /** L'URL de vote porte l'identifiant de la séance : les téléphones rejoignent exactement celle-ci. */
  protected readonly voteUrl: Signal<string | null> = computed((): string | null => {
    const votingSessionId: string | undefined = this.tvVotingSessionStore.votingSession()?.id;
    const voteUrl: URL = new URL('vote', this.document.baseURI);
    if (votingSessionId !== undefined) {
      voteUrl.searchParams.set('sessionId', votingSessionId);
      return voteUrl.href;
    }
    // Sans séance (Supabase injoignable), on affiche quand même l'adresse simple.
    return this.connectionStatus() === 'failed' ? voteUrl.href : null;
  });

  /** Se régénère dès que l'URL change (séance créée ou reprise). */
  protected readonly voteQrCodeImage: ResourceRef<string | undefined> = resource({
    params: (): string | undefined => this.voteUrl() ?? undefined,
    loader: ({ params: voteUrl }: { params: string }): Promise<string> =>
      this.generateVoteQrCodeImage(voteUrl),
  });

  /** Le QR code est une image PNG en data URL : chaque module reste un gros pixel net. */
  private generateVoteQrCodeImage(voteUrl: string): Promise<string> {
    const rootStyles: CSSStyleDeclaration = getComputedStyle(this.document.documentElement);
    return QRCode.toDataURL(voteUrl, {
      margin: 2,
      scale: 12,
      errorCorrectionLevel: 'M',
      color: {
        dark: rootStyles.getPropertyValue('--color-night').trim(),
        light: rootStyles.getPropertyValue('--color-bone').trim(),
      },
    });
  }
}
