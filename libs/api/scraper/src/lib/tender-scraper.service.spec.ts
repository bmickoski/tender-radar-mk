import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createTenderFingerprint } from '@org/models';
import { TenderDataService } from '@org/api/tenders';
import { LocalEsppFixtureSource } from './local-espp-fixture.source';
import { TenderScraperService } from './tender-scraper.service';

describe('TenderScraperService', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tender-radar-scraper-'));
  const storageFilePath = path.join(tempRoot, 'tender-radar-db.json');
  const fixtureFilePath = path.join(tempRoot, 'fixture.json');

  afterEach(() => {
    if (fs.existsSync(storageFilePath)) {
      fs.rmSync(storageFilePath, { force: true });
    }

    if (fs.existsSync(fixtureFilePath)) {
      fs.rmSync(fixtureFilePath, { force: true });
    }
  });

  it('runs one collection pass and persists the synchronized tenders', async () => {
    const record = {
      sourceKey: 'espp-fixture',
      externalId: 'espp-1010',
      title: 'Municipal GIS Platform Support',
      description: 'Support and maintenance services for the municipal GIS platform.',
      authority: 'City of Skopje',
      region: 'Skopje',
      category: 'IT Services',
      cpvCode: '72250000',
      budgetEstimate: 88000,
      deadline: '2026-04-20T10:00:00.000Z',
      publishedAt: '2026-03-03T08:00:00.000Z',
      submissionMethod: 'ESPP electronic submission',
      bidBond: 'No bid bond required',
      requiredCertificates: ['Central Registry current status'],
      evaluationCriteria: 'Lowest compliant price',
      officialUrl: 'https://example.mk/tenders/espp-1010',
      summary: ['Fresh GIS support tender discovered by the scraper.'],
      fingerprint: createTenderFingerprint(
        'Municipal GIS Platform Support',
        'City of Skopje',
        '2026-04-20T10:00:00.000Z'
      ),
      collectedAt: '2026-03-03T09:00:00.000Z',
    };

    fs.writeFileSync(fixtureFilePath, JSON.stringify([record], null, 2), 'utf8');

    const source = new LocalEsppFixtureSource(fixtureFilePath);
    const store = new TenderDataService(storageFilePath);
    const service = new TenderScraperService(source, store);

    const report = await service.runOnce();

    expect(report.source).toBe('espp-fixture');
    expect(report.resolvedSource).toBe('espp-fixture');
    expect(report.created).toBe(1);
    expect(store.getAllTenders().items.some((tender) => tender.officialUrl === record.officialUrl)).toBe(true);
  });
});
