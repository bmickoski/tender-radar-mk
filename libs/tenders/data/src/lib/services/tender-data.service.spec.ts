import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { TenderDataService } from './tender-data.service';

describe('TenderDataService', () => {
  describe('server-side local data mode', () => {
    let service: TenderDataService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          TenderDataService,
          provideHttpClient(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      service = TestBed.inject(TenderDataService);
    });

    it('returns filtered tender data without reaching the API', async () => {
      const response = await firstValueFrom(
        service.getTenders({ category: 'IT Services' })
      );

      expect(response.total).toBe(2);
      expect(response.items.map((tender) => tender.id)).toEqual([
        'tn-001',
        'tn-005',
      ]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    });
  });

  describe('browser fallback mode', () => {
    let service: TenderDataService;
    let httpMock: HttpTestingController;
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      TestBed.configureTestingModule({
        providers: [
          TenderDataService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      });

      service = TestBed.inject(TenderDataService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
      warnSpy.mockRestore();
    });

    it('falls back to local tenders when the API request fails', async () => {
      const responsePromise = firstValueFrom(
        service.getTenders({ authority: 'City of Skopje' })
      );

      const request = httpMock.expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === 'http://localhost:3333/api/tenders' &&
          req.params.get('authority') === 'City of Skopje'
      );
      request.flush('offline', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      const response = await responsePromise;

      expect(response.total).toBe(1);
      expect(response.items[0]?.id).toBe('tn-001');
      expect(service.error()).toBe(
        'Using local demo data because the API is unavailable.'
      );
      expect(service.loading()).toBe(false);
    });

    it('keeps imported tenders in the local fallback store after a failed API import', async () => {
      const payload = {
        title: 'Imported Fallback Tender',
        authority: 'Custom Authority',
        deadline: '2026-03-31T10:00:00.000Z',
        officialUrl: 'https://example.mk/imported-fallback',
      };

      const importPromise = firstValueFrom(service.importTender(payload));

      const importRequest = httpMock.expectOne(
        'http://localhost:3333/api/tenders/import'
      );
      expect(importRequest.request.method).toBe('POST');
      importRequest.flush('offline', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      const importedTender = await importPromise;

      const searchPromise = firstValueFrom(
        service.getTenders({ searchTerm: payload.title })
      );
      const searchRequest = httpMock.expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === 'http://localhost:3333/api/tenders' &&
          req.params.get('searchTerm') === payload.title
      );
      searchRequest.flush('offline', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      const searchResponse = await searchPromise;

      expect(importedTender?.title).toBe(payload.title);
      expect(importedTender?.sourceType).toBe('manual-import');
      expect(searchResponse.total).toBe(1);
      expect(searchResponse.items[0]?.officialUrl).toBe(payload.officialUrl);
    });

    it('updates the local tender workspace when the API workspace update fails', async () => {
      const updatePromise = firstValueFrom(
        service.updateTenderWorkspace('tn-001', {
          internalDeadline: '2026-03-20T12:00:00.000Z',
          notes: 'Fallback workspace update',
          checklist: [
            {
              id: 'task-updated',
              title: 'Confirm final pricing',
              owner: 'Finance',
              status: 'done',
            },
          ],
          documents: [
            {
              id: 'doc-updated',
              name: 'Pricing workbook',
              status: 'ready',
            },
          ],
        })
      );

      const request = httpMock.expectOne(
        'http://localhost:3333/api/tenders/tn-001/workspace'
      );
      expect(request.request.method).toBe('PATCH');
      request.flush('offline', {
        status: 503,
        statusText: 'Service Unavailable',
      });

      const updatedTender = await updatePromise;

      expect(updatedTender?.workspace.notes).toBe('Fallback workspace update');
      expect(updatedTender?.workspace.checklist[0]?.title).toBe('Confirm final pricing');
    });
  });
});
