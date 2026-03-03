import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  DashboardOverview,
  PaginatedResponse,
  SavedSearch,
  Tender,
} from '@org/models';
import { TenderDataService } from '@org/tenders/data';
import { TenderListComponent } from './tender-list.component';

describe('TenderListComponent', () => {
  let fixture: ComponentFixture<TenderListComponent>;
  let component: TenderListComponent;

  const overview: DashboardOverview = {
    newCount: 3,
    changedCount: 1,
    closingSoonCount: 2,
    trackedAuthorities: 4,
  };

  const savedSearches: SavedSearch[] = [
    {
      id: 'search-it',
      name: 'IT Services',
      searchTerm: 'software support',
      category: 'IT Services',
      deadlineWithinDays: 30,
    },
  ];

  const tenders: Tender[] = [
    {
      id: 'tn-001',
      title: 'Managed Network and Endpoint Support for Municipal Schools',
      description: 'Framework agreement for school infrastructure support.',
      authority: 'City of Skopje',
      region: 'Skopje',
      category: 'IT Services',
      cpvCode: '72700000',
      budgetEstimate: 185000,
      deadline: '2026-03-21T11:00:00.000Z',
      publishedAt: '2026-02-28T09:15:00.000Z',
      submissionMethod: 'ESPP electronic submission',
      bidBond: '2% bid guarantee required',
      requiredCertificates: ['Central Registry current status'],
      evaluationCriteria: '70% price, 30% technical quality',
      officialUrl: 'https://example.mk/tenders/tn-001',
      sourceType: 'espp-public',
      stage: 'new',
      lastSeenHash: 'tn001-v1',
      lastChangedAt: '2026-02-28T09:15:00.000Z',
      summary: ['Fit for SME MSP teams.'],
      changes: [],
    },
  ];

  const paginatedTenders: PaginatedResponse<Tender> = {
    items: tenders,
    total: 1,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  };

  const router = {
    navigate: vi.fn(),
  };

  const tenderDataService = {
    error: signal<string | null>(null),
    getCategories: vi.fn(() => of(['IT Services', 'Construction'])),
    getAuthorities: vi.fn(() => of(['City of Skopje'])),
    getSavedSearches: vi.fn(() => of(savedSearches)),
    createSavedSearch: vi.fn((payload) => of({ id: 'search-002', ...payload })),
    deleteSavedSearch: vi.fn(() => of(true)),
    getOverview: vi.fn(() => of(overview)),
    getTenders: vi.fn(() => of(paginatedTenders)),
    importTender: vi.fn(() => of(tenders[0])),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    router.navigate.mockReset();

    await TestBed.configureTestingModule({
      imports: [TenderListComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: TenderDataService, useValue: tenderDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TenderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads overview, saved searches, and tender results on init', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(tenderDataService.getCategories).toHaveBeenCalledTimes(1);
    expect(tenderDataService.getAuthorities).toHaveBeenCalledTimes(1);
    expect(tenderDataService.getSavedSearches).toHaveBeenCalledTimes(1);
    expect(tenderDataService.getOverview).toHaveBeenCalledTimes(1);
    expect(tenderDataService.getTenders).toHaveBeenCalledWith({}, 1, 12);
    expect(host.querySelector('h1')?.textContent).toContain('Public tenders');
    expect(host.textContent).toContain('Saved Searches');
    expect(host.textContent).toContain(
      'Managed Network and Endpoint Support for Municipal Schools'
    );
  });

  it('applies a saved search and reloads tenders with the saved filter', () => {
    const savedSearchButton = fixture.debugElement.query(By.css('.saved-search'))
      .nativeElement as HTMLButtonElement;

    savedSearchButton.click();
    fixture.detectChanges();

    expect(component.searchTerm).toBe('software support');
    expect(component.selectedCategory).toBe('IT Services');
    expect(component.deadlineWithinDays).toBe(30);
    expect(tenderDataService.getTenders).toHaveBeenLastCalledWith(
      {
        category: 'IT Services',
        deadlineWithinDays: 30,
        searchTerm: 'software support',
      },
      1,
      12
    );
  });

  it('creates a saved search from the current filters', () => {
    component.savedSearchName = 'Pipeline Search';
    component.searchTerm = 'software support';
    component.selectedAuthority = 'City of Skopje';
    component.selectedCategory = 'IT Services';
    component.deadlineWithinDays = 30;

    component.saveCurrentSearch();

    expect(tenderDataService.createSavedSearch).toHaveBeenCalledWith({
      name: 'Pipeline Search',
      searchTerm: 'software support',
      authority: 'City of Skopje',
      category: 'IT Services',
      deadlineWithinDays: 30,
    });
    expect(tenderDataService.getSavedSearches).toHaveBeenCalledTimes(2);
    expect(component.savedSearchName).toBe('');
  });

  it('removes a saved search and refreshes the list', () => {
    component.removeSavedSearch('search-it');

    expect(tenderDataService.deleteSavedSearch).toHaveBeenCalledWith('search-it');
    expect(tenderDataService.getSavedSearches).toHaveBeenCalledTimes(2);
  });

  it('navigates to the tender detail route when a card is clicked', () => {
    const tenderCard = fixture.debugElement.query(
      By.css('.tender-card')
    ).nativeElement as HTMLElement;

    tenderCard.click();

    expect(router.navigate).toHaveBeenCalledWith(['/tenders', 'tn-001']);
  });
});
