import {
  createTenderCollectorSource,
  ScraperRunHistoryService,
  TenderScraperService,
} from '@org/api/scraper';
import { ScraperRunReport } from '@org/models';
import { TenderDataService } from '@org/api/tenders';
import * as path from 'node:path';

async function main(): Promise<void> {
  const fixturePath =
    process.env['TENDER_RADAR_SCRAPER_FIXTURE'] ||
    path.join(process.cwd(), 'data', 'fixtures', 'espp-public-feed.json');
  const storagePath = process.env['TENDER_RADAR_STORAGE_PATH'];
  const sourceMode = process.env['TENDER_RADAR_SCRAPER_SOURCE'] || 'espp-concessions';

  const store = new TenderDataService(storagePath);
  const runHistory = new ScraperRunHistoryService();
  const source = createTenderCollectorSource(sourceMode, fixturePath);
  const scraper = new TenderScraperService(source, store);
  const report = await scraper.runOnce().catch((error) => {
    const failureReport: ScraperRunReport = {
      source: source.name,
      resolvedSource: source.name,
      runAt: new Date().toISOString(),
      total: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      status: 'failure',
      durationMs: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown scraper failure',
    };

    runHistory.recordRun(failureReport);
    throw error;
  });

  runHistory.recordRun(report);

  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error) => {
  console.error('Scraper run failed.', error);
  process.exitCode = 1;
});
