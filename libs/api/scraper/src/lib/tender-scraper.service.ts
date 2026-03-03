import { TenderDataService } from '@org/api/tenders';
import { ScraperRunReport } from '@org/models';
import { TenderCollectorSource } from './local-espp-fixture.source';

export class TenderScraperService {
  constructor(
    private readonly source: TenderCollectorSource,
    private readonly tenderDataService: TenderDataService
  ) {}

  async runOnce(): Promise<ScraperRunReport> {
    const startedAt = Date.now();
    const collected = await this.source.fetchRecords();
    const result = this.tenderDataService.syncCollectedTenders(collected.records);

    return {
      source: this.source.name,
      resolvedSource: collected.source,
      runAt: new Date().toISOString(),
      total: result.total,
      created: result.created,
      updated: result.updated,
      unchanged: result.unchanged,
      status: 'success',
      durationMs: Date.now() - startedAt,
      fallbackReason: collected.fallbackReason,
    };
  }
}
