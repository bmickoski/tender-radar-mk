import { ScraperRunReport, ScraperStatusSnapshot } from '@org/models';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface ScraperRunHistoryState {
  runs: ScraperRunReport[];
}

export class ScraperRunHistoryService {
  private readonly storageFilePath: string;
  private runs: ScraperRunReport[] = [];

  constructor(
    storageFilePath = process.env['TENDER_RADAR_SCRAPER_RUNS_PATH'] ||
      path.join(process.cwd(), 'data', 'runtime', 'scraper-runs.json')
  ) {
    this.storageFilePath = storageFilePath;
    this.loadState();
  }

  recordRun(report: ScraperRunReport): ScraperRunReport {
    this.runs = [report, ...this.runs].slice(0, 50);
    this.persistState();
    return report;
  }

  getStatus(limit = 10): ScraperStatusSnapshot {
    return {
      latestRun: this.runs[0] ?? null,
      recentRuns: this.runs.slice(0, limit).map((run) => ({ ...run })),
    };
  }

  private loadState(): void {
    try {
      if (!fs.existsSync(this.storageFilePath)) {
        this.persistState();
        return;
      }

      const raw = fs.readFileSync(this.storageFilePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<ScraperRunHistoryState>;
      this.runs = Array.isArray(parsed.runs)
        ? parsed.runs.map((run) => ({ ...run }))
        : [];
    } catch {
      this.runs = [];
      this.persistState();
    }
  }

  private persistState(): void {
    fs.mkdirSync(path.dirname(this.storageFilePath), { recursive: true });
    fs.writeFileSync(
      this.storageFilePath,
      JSON.stringify({ runs: this.runs }, null, 2),
      'utf8'
    );
  }
}
