import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, resource, ResourceRef } from '@angular/core';
import QRCode from 'qrcode';

/**
 * Section 0 : l'accroche et le QR code qui mène vers /vote.
 * L'URL de vote est calculée depuis le `<base href>` : elle marche en local comme sur GitHub Pages.
 */
@Component({
  selector: 'app-intro-section',
  templateUrl: './intro-section.html',
  styleUrl: './intro-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroSection {
  private readonly document: Document = inject(DOCUMENT);

  protected readonly voteUrl: string = new URL('vote', this.document.baseURI).href;

  protected readonly voteQrCodeImage: ResourceRef<string | undefined> = resource({
    loader: (): Promise<string> => this.generateVoteQrCodeImage(),
  });

  /** Le QR code est une image PNG en data URL : chaque module reste un gros pixel net. */
  private generateVoteQrCodeImage(): Promise<string> {
    const rootStyles: CSSStyleDeclaration = getComputedStyle(this.document.documentElement);
    return QRCode.toDataURL(this.voteUrl, {
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
