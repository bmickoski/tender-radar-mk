import {
  TenderCollectorResult,
  TenderCollectorSource,
} from './local-espp-fixture.source';

export class FallbackTenderCollectorSource implements TenderCollectorSource {
  readonly name: string;

  constructor(
    private readonly primary: TenderCollectorSource,
    private readonly fallback: TenderCollectorSource
  ) {
    this.name = `${primary.name}->${fallback.name}`;
  }

  async fetchRecords(): Promise<TenderCollectorResult> {
    try {
      return await this.primary.fetchRecords();
    } catch (error) {
      const fallbackResult = await this.fallback.fetchRecords();

      return {
        ...fallbackResult,
        fallbackReason:
          error instanceof Error ? error.message : 'Primary collector source failed.',
      };
    }
  }
}
