import { isPlatformServer } from '@angular/common';
import {
  PLATFORM_ID,
  inject,
  Injectable,
  isDevMode,
  signal,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  ApiResponse,
  createSavedSearch,
  DashboardOverview,
  PaginatedResponse,
  SavedSearch,
  SavedSearchInput,
  ScraperStatusSnapshot,
  Tender,
  TenderFilter,
  TenderImportInput,
  TenderWorkspaceUpdateInput,
  cloneSavedSearches,
  cloneTenders,
  createImportedTender,
  filterTenders,
  getTenderAuthorities,
  getTenderCategories,
  getTenderOverview,
  updateTenderWorkspace,
} from '@org/models';

@Injectable({
  providedIn: 'root',
})
export class TenderDataService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://localhost:3333/api';
  private readonly useLocalData = isPlatformServer(this.platformId);
  private readonly localSavedSearches = signal<SavedSearch[]>(cloneSavedSearches());
  private readonly localTenders = signal<Tender[]>(cloneTenders());

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  getScraperStatus(): Observable<ScraperStatusSnapshot> {
    const fallbackStatus: ScraperStatusSnapshot = {
      latestRun: null,
      recentRuns: [],
    };

    if (this.useLocalData) {
      return of(fallbackStatus);
    }

    return this.http
      .get<ApiResponse<ScraperStatusSnapshot>>(`${this.apiUrl}/scraper/status`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load scraper status');
          }
          return response.data;
        }),
        catchError((error) =>
          this.recoverSilent(error, fallbackStatus, 'scraper status')
        )
      );
  }

  getTenders(
    filter?: TenderFilter,
    page = 1,
    pageSize = 12
  ): Observable<PaginatedResponse<Tender>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    if (this.useLocalData) {
      return this.resolveLocal(filterTenders(this.localTenders(), filter, page, pageSize));
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filter?.authority) {
      params = params.set('authority', filter.authority);
    }
    if (filter?.category) {
      params = params.set('category', filter.category);
    }
    if (filter?.region) {
      params = params.set('region', filter.region);
    }
    if (filter?.stage) {
      params = params.set('stage', filter.stage);
    }
    if (filter?.deadlineWithinDays !== undefined) {
      params = params.set(
        'deadlineWithinDays',
        filter.deadlineWithinDays.toString()
      );
    }
    if (filter?.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<Tender>>>(`${this.apiUrl}/tenders`, {
        params,
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load tenders');
          }
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError((error) => {
          return this.recoverWithLocalData(
            error,
            filterTenders(this.localTenders(), filter, page, pageSize),
            'tenders'
          );
        })
      );
  }

  getTenderById(id: string): Observable<Tender | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    if (this.useLocalData) {
      return this.resolveLocal(
        this.localTenders().find((tender) => tender.id === id) ?? null
      );
    }

    return this.http
      .get<ApiResponse<Tender>>(`${this.apiUrl}/tenders/${id}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load tender');
          }
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError((error) =>
          this.recoverWithLocalData(
            error,
            this.localTenders().find((tender) => tender.id === id) ?? null,
            'tender'
          )
        )
      );
  }

  getCategories(): Observable<string[]> {
    if (this.useLocalData) {
      return of(getTenderCategories(this.localTenders()));
    }

    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/tenders-metadata/categories`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load categories');
          }
          return response.data;
        }),
        catchError((error) =>
          this.recoverSilent(error, getTenderCategories(this.localTenders()), 'categories')
        )
      );
  }

  getAuthorities(): Observable<string[]> {
    if (this.useLocalData) {
      return of(getTenderAuthorities(this.localTenders()));
    }

    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/tenders-metadata/authorities`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load authorities');
          }
          return response.data;
        }),
        catchError((error) =>
          this.recoverSilent(error, getTenderAuthorities(this.localTenders()), 'authorities')
        )
      );
  }

  getSavedSearches(): Observable<SavedSearch[]> {
    if (this.useLocalData) {
      return of(cloneSavedSearches(this.localSavedSearches()));
    }

    return this.http
      .get<ApiResponse<SavedSearch[]>>(`${this.apiUrl}/saved-searches`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load saved searches');
          }
          return response.data;
        }),
        catchError((error) =>
          this.recoverSilent(
            error,
            cloneSavedSearches(this.localSavedSearches()),
            'saved searches'
          )
        )
      );
  }

  createSavedSearch(payload: SavedSearchInput): Observable<SavedSearch | null> {
    if (this.useLocalData) {
      const savedSearch = createSavedSearch(this.localSavedSearches(), payload);
      this.localSavedSearches.update((searches) => [savedSearch, ...searches]);
      return of(savedSearch);
    }

    return this.http
      .post<ApiResponse<SavedSearch>>(`${this.apiUrl}/saved-searches`, payload)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to save search');
          }
          return response.data;
        }),
        catchError((error) => {
          const savedSearch = createSavedSearch(this.localSavedSearches(), payload);
          this.localSavedSearches.update((searches) => [savedSearch, ...searches]);
          return this.recoverSilent(error, savedSearch, 'saved searches');
        })
      );
  }

  triggerScraperRun() {
    return this.http
      .post<ApiResponse<ScraperStatusSnapshot['latestRun']>>(
        `${this.apiUrl}/scraper/run`,
        {}
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to run scraper');
          }
          return response.data;
        }),
        catchError((error) => this.recoverSilent(error, null, 'scraper run'))
      );
  }

  deleteSavedSearch(id: string): Observable<boolean> {
    if (this.useLocalData) {
      this.localSavedSearches.update((searches) =>
        searches.filter((search) => search.id !== id)
      );
      return of(true);
    }

    return this.http
      .delete<ApiResponse<{ deleted: true }>>(`${this.apiUrl}/saved-searches/${id}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to delete saved search');
          }
          return true;
        }),
        catchError((error) => {
          this.localSavedSearches.update((searches) =>
            searches.filter((search) => search.id !== id)
          );
          return this.recoverSilent(error, true, 'saved searches');
        })
      );
  }

  getOverview(): Observable<DashboardOverview> {
    if (this.useLocalData) {
      return of(getTenderOverview(this.localTenders()));
    }

    return this.http
      .get<ApiResponse<DashboardOverview>>(`${this.apiUrl}/overview`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to load overview');
          }
          return response.data;
        }),
        catchError((error) =>
          this.recoverSilent(
            error,
            getTenderOverview(this.localTenders()),
            'overview'
          )
        )
      );
  }

  importTender(payload: TenderImportInput): Observable<Tender | null> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    if (this.useLocalData) {
      const tender = createImportedTender(this.localTenders(), payload);
      this.localTenders.update((tenders) => [tender, ...tenders]);
      return this.resolveLocal(tender);
    }

    return this.http
      .post<ApiResponse<Tender>>(`${this.apiUrl}/tenders/import`, payload)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to import tender');
          }
          this.loadingSignal.set(false);
          return response.data;
        }),
        catchError((error) => {
          const tender = createImportedTender(this.localTenders(), payload);
          this.localTenders.update((tenders) => [tender, ...tenders]);
          return this.recoverWithLocalData(error, tender, 'tender import');
        })
      );
  }

  updateTenderWorkspace(
    id: string,
    payload: TenderWorkspaceUpdateInput
  ): Observable<Tender | null> {
    if (this.useLocalData) {
      const currentTender = this.localTenders().find((tender) => tender.id === id);
      if (!currentTender) {
        return of(null);
      }

      const updatedTender = updateTenderWorkspace(currentTender, payload);
      this.localTenders.update((tenders) =>
        tenders.map((tender) => (tender.id === id ? updatedTender : tender))
      );
      return of(updatedTender);
    }

    return this.http
      .patch<ApiResponse<Tender>>(`${this.apiUrl}/tenders/${id}/workspace`, payload)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error || 'Failed to update tender workspace');
          }
          return response.data;
        }),
        catchError((error) => {
          const currentTender = this.localTenders().find((tender) => tender.id === id);
          if (!currentTender) {
            return this.recoverWithLocalData(error, null, 'tender workspace');
          }

          const updatedTender = updateTenderWorkspace(currentTender, payload);
          this.localTenders.update((tenders) =>
            tenders.map((tender) => (tender.id === id ? updatedTender : tender))
          );
          return this.recoverWithLocalData(error, updatedTender, 'tender workspace');
        })
      );
  }

  private resolveLocal<T>(value: T): Observable<T> {
    this.loadingSignal.set(false);
    return of(value);
  }

  private recoverWithLocalData<T>(
    error: unknown,
    value: T,
    context: string
  ): Observable<T> {
    this.loadingSignal.set(false);
    this.errorSignal.set(
      'Using local demo data because the API is unavailable.'
    );
    this.logFallback(error, context);
    return of(value);
  }

  private recoverSilent<T>(
    error: unknown,
    value: T,
    context: string
  ): Observable<T> {
    this.logFallback(error, context);
    return of(value);
  }

  private logFallback(error: unknown, context: string): void {
    if (this.useLocalData || !isDevMode()) {
      return;
    }

    console.warn(`Falling back to local ${context} data.`, error);
  }
}
