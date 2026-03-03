import {
  EsppConcessionAnnouncementsSource,
} from './espp-concession-announcements.source';
import { FallbackTenderCollectorSource } from './fallback-tender-collector.source';
import {
  LocalEsppFixtureSource,
  TenderCollectorSource,
} from './local-espp-fixture.source';

export function createTenderCollectorSource(
  sourceMode: string,
  fixturePath: string
): TenderCollectorSource {
  const fixtureSource = new LocalEsppFixtureSource(fixturePath);

  if (sourceMode === 'fixture') {
    return fixtureSource;
  }

  if (sourceMode === 'espp-concessions') {
    return new FallbackTenderCollectorSource(
      new EsppConcessionAnnouncementsSource(),
      fixtureSource
    );
  }

  throw new Error(`Unknown scraper source mode: ${sourceMode}`);
}
