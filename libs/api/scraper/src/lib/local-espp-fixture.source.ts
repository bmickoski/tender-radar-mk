import { CollectedTenderRecord } from '@org/models';
import * as fs from 'node:fs';

export interface TenderCollectorResult {
  source: string;
  records: CollectedTenderRecord[];
  fallbackReason?: string;
}

export interface TenderCollectorSource {
  readonly name: string;
  fetchRecords(): Promise<TenderCollectorResult>;
}

export class LocalEsppFixtureSource implements TenderCollectorSource {
  readonly name = 'espp-fixture';

  constructor(private readonly fixturePath: string) {}

  async fetchRecords(): Promise<TenderCollectorResult> {
    const raw = await fs.promises.readFile(this.fixturePath, 'utf8');
    return {
      source: this.name,
      records: JSON.parse(raw) as CollectedTenderRecord[],
    };
  }
}
