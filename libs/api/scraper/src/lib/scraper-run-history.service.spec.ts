import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ScraperRunHistoryService } from './scraper-run-history.service';

describe('ScraperRunHistoryService', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tender-radar-runs-'));
  const storageFilePath = path.join(tempRoot, 'scraper-runs.json');

  afterEach(() => {
    if (fs.existsSync(storageFilePath)) {
      fs.rmSync(storageFilePath, { force: true });
    }
  });

  it('persists recent scraper runs and exposes the latest snapshot', () => {
    const firstService = new ScraperRunHistoryService(storageFilePath);

    firstService.recordRun({
      source: 'espp-fixture',
      runAt: '2026-03-03T16:00:00.000Z',
      total: 2,
      created: 1,
      updated: 1,
      unchanged: 0,
      status: 'success',
      durationMs: 1240,
    });
    firstService.recordRun({
      source: 'espp-concessions',
      runAt: '2026-03-03T18:00:00.000Z',
      total: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      status: 'failure',
      durationMs: 312,
      errorMessage: 'Network timeout',
    });

    const secondService = new ScraperRunHistoryService(storageFilePath);
    const snapshot = secondService.getStatus();

    expect(snapshot.latestRun?.status).toBe('failure');
    expect(snapshot.latestRun?.errorMessage).toBe('Network timeout');
    expect(snapshot.recentRuns).toHaveLength(2);
    expect(snapshot.recentRuns[1]?.source).toBe('espp-fixture');
  });
});
