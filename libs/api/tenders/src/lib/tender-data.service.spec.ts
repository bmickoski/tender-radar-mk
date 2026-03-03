import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTenderFingerprint } from '@org/models';
import { TenderDataService } from './tender-data.service';

describe('TenderDataService', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tender-radar-api-'));
  const storageFilePath = path.join(tempRoot, 'tender-radar-db.json');

  afterEach(() => {
    if (fs.existsSync(storageFilePath)) {
      fs.rmSync(storageFilePath, { force: true });
    }
  });

  it('creates the storage file from seeded data on first boot', () => {
    const service = new TenderDataService(storageFilePath);

    expect(service.getAllTenders().total).toBeGreaterThan(0);
    expect(service.getSavedSearches().length).toBeGreaterThan(0);
    expect(fs.existsSync(storageFilePath)).toBe(true);
  });

  it('persists imported tenders and saved searches across service instances', () => {
    const firstService = new TenderDataService(storageFilePath);

    const importedTender = firstService.importTender({
      title: 'Persistent Imported Tender',
      authority: 'Persistence Authority',
      deadline: '2026-04-15T10:00:00.000Z',
      officialUrl: 'https://example.mk/persistent-import',
    });
    const savedSearch = firstService.saveSearch({
      name: 'Persistent Search',
      searchTerm: 'persistent',
      authority: 'Persistence Authority',
    });

    const secondService = new TenderDataService(storageFilePath);

    expect(secondService.getTenderById(importedTender.id)?.title).toBe(
      'Persistent Imported Tender'
    );
    expect(
      secondService.getSavedSearches().some((search) => search.id === savedSearch.id)
    ).toBe(true);
  });

  it('deletes saved searches and persists the change', () => {
    const firstService = new TenderDataService(storageFilePath);
    const savedSearch = firstService.saveSearch({
      name: 'Disposable Search',
      searchTerm: 'disposable',
    });

    expect(firstService.deleteSavedSearch(savedSearch.id)).toBe(true);

    const secondService = new TenderDataService(storageFilePath);

    expect(
      secondService.getSavedSearches().some((search) => search.id === savedSearch.id)
    ).toBe(false);
  });

  it('persists tender workspace updates across service instances', () => {
    const firstService = new TenderDataService(storageFilePath);

    const updatedTender = firstService.updateTenderWorkspace('tn-001', {
      internalDeadline: '2026-03-19T09:00:00.000Z',
      notes: 'Workspace persisted for the bid team.',
      checklist: [
        {
          id: 'task-tn-001-custom',
          title: 'Finalize pricing sheet',
          owner: 'Finance',
          status: 'in-progress',
        },
      ],
      documents: [
        {
          id: 'doc-tn-001-custom',
          name: 'Pricing workbook',
          status: 'ready',
          notes: 'Final draft in shared drive.',
        },
      ],
    });

    const secondService = new TenderDataService(storageFilePath);

    expect(updatedTender?.workspace.notes).toBe('Workspace persisted for the bid team.');
    expect(secondService.getTenderById('tn-001')?.workspace.checklist[0]?.title).toBe(
      'Finalize pricing sheet'
    );
    expect(secondService.getTenderById('tn-001')?.workspace.documents[0]?.name).toBe(
      'Pricing workbook'
    );
  });

  it('upserts collected tenders and tracks changed notices', () => {
    const firstService = new TenderDataService(storageFilePath);

    const createdFingerprint = createTenderFingerprint(
      'Digital Archive and Registry Upgrade',
      'Ministry of Culture',
      '2026-04-18T10:00:00.000Z'
    );
    const changedFingerprint = createTenderFingerprint(
      'Clinical Imaging Equipment Maintenance and Spare Parts',
      'University Clinic for Radiology',
      '2026-03-14T10:00:00.000Z'
    );

    const result = firstService.syncCollectedTenders([
      {
        sourceKey: 'espp-fixture',
        externalId: 'espp-1001',
        title: 'Digital Archive and Registry Upgrade',
        description: 'Platform upgrade for archive workflows and registry records.',
        authority: 'Ministry of Culture',
        region: 'Skopje',
        category: 'IT Services',
        cpvCode: '72200000',
        budgetEstimate: 210000,
        deadline: '2026-04-18T10:00:00.000Z',
        publishedAt: '2026-03-03T09:00:00.000Z',
        submissionMethod: 'ESPP electronic submission',
        bidBond: '2% bid guarantee required',
        requiredCertificates: ['Central Registry current status'],
        evaluationCriteria: 'Lowest compliant price',
        officialUrl: 'https://example.mk/tenders/espp-1001',
        summary: ['New IT services opportunity for records modernization.'],
        fingerprint: createdFingerprint,
        collectedAt: '2026-03-03T10:00:00.000Z',
      },
      {
        sourceKey: 'espp-fixture',
        externalId: 'espp-tn-002',
        title: 'Clinical Imaging Equipment Maintenance and Spare Parts',
        description:
          'Preventive and corrective maintenance for imaging equipment with clarified spare-parts coverage.',
        authority: 'University Clinic for Radiology',
        region: 'Skopje',
        category: 'Medical Equipment',
        cpvCode: '50421000',
        budgetEstimate: 320000,
        deadline: '2026-03-14T10:00:00.000Z',
        publishedAt: '2026-02-15T08:00:00.000Z',
        submissionMethod: 'ESPP electronic submission',
        bidBond: 'Bank guarantee of 5,000 EUR',
        requiredCertificates: [
          'Authorized service partner confirmation',
          'Tax clearance certificate',
          'Engineers CVs',
        ],
        evaluationCriteria: 'Lowest compliant price',
        officialUrl: 'https://example.mk/tenders/tn-002',
        summary: ['Deadline amendment detected by the collector.'],
        fingerprint: changedFingerprint,
        collectedAt: '2026-03-03T10:00:00.000Z',
      },
    ]);

    const secondService = new TenderDataService(storageFilePath);
    const createdTender = secondService
      .getAllTenders()
      .items.find((tender) => tender.officialUrl === 'https://example.mk/tenders/espp-1001');
    const changedTender = secondService.getTenderById('tn-002');

    expect(result.created).toBe(1);
    expect(result.updated).toBe(1);
    expect(createdTender?.title).toBe('Digital Archive and Registry Upgrade');
    expect(changedTender?.stage).toBe('changed');
    expect(changedTender?.changes[0]?.label).toBe('Collector update');
  });
});
