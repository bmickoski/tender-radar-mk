import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
});
