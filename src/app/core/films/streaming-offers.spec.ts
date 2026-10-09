import { describeStreamingOffers, StreamingOffer } from './streaming-offers';

describe('describeStreamingOffers', () => {
  it('should list the subscription first, then the rental with its starting price', () => {
    const streamingOffers: readonly StreamingOffer[] = describeStreamingOffers({
      justWatchSlug: 'get-out',
      subscriptionPlatforms: ['Prime Video'],
      rentalPlatforms: ['Canal VOD', 'Apple TV'],
      rentalStartingPriceInEuros: 2.99,
    });

    expect(streamingOffers).toEqual([
      { label: 'À voir sur', platforms: ['Prime Video'] },
      { label: 'En location dès 2,99 €', platforms: ['Canal VOD', 'Apple TV'] },
    ]);
  });

  it('should only show the subscription when the film cannot be rented', () => {
    const streamingOffers: readonly StreamingOffer[] = describeStreamingOffers({
      justWatchSlug: 'his-house',
      subscriptionPlatforms: ['Netflix'],
      rentalPlatforms: [],
      rentalStartingPriceInEuros: null,
    });

    expect(streamingOffers).toEqual([{ label: 'À voir sur', platforms: ['Netflix'] }]);
  });

  it('should say when the film is nowhere to be found', () => {
    const streamingOffers: readonly StreamingOffer[] = describeStreamingOffers({
      justWatchSlug: 'introuvable',
      subscriptionPlatforms: [],
      rentalPlatforms: [],
      rentalStartingPriceInEuros: null,
    });

    expect(streamingOffers).toEqual([{ label: 'Introuvable en streaming', platforms: [] }]);
  });
});
