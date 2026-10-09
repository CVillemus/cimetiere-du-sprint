import { StreamingAvailability } from './film.model';

/** Une ligne d'information « où regarder » : un libellé et ses plateformes. */
export interface StreamingOffer {
  readonly label: string;
  readonly platforms: readonly string[];
}

/** « 2,99 € » : le prix à la française, virgule et espace insécable. */
function formatEuros(priceInEuros: number): string {
  return `${priceInEuros.toFixed(2).replace('.', ',')} €`;
}

/**
 * Où regarder un film : d'abord l'abonnement, puis la location à l'unité (avec son prix de départ).
 * Si aucune offre n'existe, une seule ligne « Introuvable en streaming ».
 */
export function describeStreamingOffers(
  streamingAvailability: StreamingAvailability,
): readonly StreamingOffer[] {
  const { subscriptionPlatforms, rentalPlatforms, rentalStartingPriceInEuros } =
    streamingAvailability;
  const streamingOffers: StreamingOffer[] = [];
  if (subscriptionPlatforms.length > 0) {
    streamingOffers.push({ label: 'À voir sur', platforms: subscriptionPlatforms });
  }
  if (rentalPlatforms.length > 0) {
    streamingOffers.push({
      label:
        rentalStartingPriceInEuros === null
          ? 'En location'
          : `En location dès ${formatEuros(rentalStartingPriceInEuros)}`,
      platforms: rentalPlatforms,
    });
  }
  if (streamingOffers.length === 0) {
    streamingOffers.push({ label: 'Introuvable en streaming', platforms: [] });
  }
  return streamingOffers;
}
