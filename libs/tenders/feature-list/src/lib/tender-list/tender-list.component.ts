import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenderDataService } from '@org/tenders/data';
import {
  DashboardOverview,
  ScraperStatusSnapshot,
  SavedSearch,
  Tender,
  TenderFilter,
  TenderImportInput,
} from '@org/models';
import {
  SectionCardComponent,
  ErrorMessageComponent,
  LoadingSpinnerComponent,
  TenderGridComponent,
} from '@org/tenders/ui';

@Component({
  selector: 'tr-tender-list',
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    SectionCardComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    TenderGridComponent,
  ],
  template: `
    <div class="radar-page tr-page">
      <header class="hero">
        <div class="hero-copy">
          <p class="eyebrow">TenderRadar MK</p>
          <h1>Public tenders, filtered down to what your team can actually bid.</h1>
          <p>
            Saved searches, tender briefs, manual import, and change tracking for
            North Macedonia procurement workflows.
          </p>
        </div>

        <div class="overview-grid">
          <article class="overview-card">
            <span>New</span>
            <strong>{{ overview().newCount }}</strong>
          </article>
          <article class="overview-card">
            <span>Changed</span>
            <strong>{{ overview().changedCount }}</strong>
          </article>
          <article class="overview-card">
            <span>Closing Soon</span>
            <strong>{{ overview().closingSoonCount }}</strong>
          </article>
          <article class="overview-card">
            <span>Authorities</span>
            <strong>{{ overview().trackedAuthorities }}</strong>
          </article>
        </div>
      </header>

      <div class="content-grid">
        <aside class="sidebar">
          <tr-section-card title="Collector Status" [meta]="collectorMeta()">
            <button
              trSectionActions
              type="button"
              class="ghost-button"
              [disabled]="runningScraper()"
              (click)="runScraper()"
            >
              {{ runningScraper() ? 'Running...' : 'Run Collector' }}
            </button>

            @if (scraperStatus().latestRun; as latestRun) {
              <div
                class="collector-status-card"
                [class.collector-status-card--failure]="latestRun.status === 'failure'"
              >
                <div class="collector-topline">
                  <strong>Source</strong>
                  <span
                    class="collector-pill"
                    [class.collector-pill--failure]="latestRun.status === 'failure'"
                  >
                    {{ latestRun.status }}
                  </span>
                </div>

                <p class="collector-source">{{ latestRun.source }}</p>
                @if (latestRun.resolvedSource && latestRun.resolvedSource !== latestRun.source) {
                  <p class="collector-fallback">
                    Resolved via {{ latestRun.resolvedSource }}
                  </p>
                }

                <div class="collector-facts">
                  <div>
                    <span>Last Run</span>
                    <strong>{{ latestRun.runAt | date: 'd MMM y, HH:mm' }}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{{ latestRun.durationMs }} ms</strong>
                  </div>
                  <div>
                    <span>Created</span>
                    <strong>{{ latestRun.created }}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{{ latestRun.updated }}</strong>
                  </div>
                </div>

                @if (latestRun.errorMessage) {
                  <p class="collector-error">{{ latestRun.errorMessage }}</p>
                }

                @if (latestRun.fallbackReason) {
                  <p class="collector-fallback-reason">
                    Fallback: {{ latestRun.fallbackReason }}
                  </p>
                }
              </div>
            } @else {
              <p class="empty-copy">
                No collector runs recorded yet. Start the scraper to populate source health.
              </p>
            }

            @if (scraperStatus().recentRuns.length > 1) {
              <div class="collector-history">
                <h3>Recent Runs</h3>
                <div class="collector-history-list">
                  @for (run of scraperStatus().recentRuns.slice(0, 5); track run.runAt) {
                    <article class="collector-history-item">
                      <div>
                        <strong>{{ run.status }}</strong>
                        <span>{{ run.runAt | date: 'd MMM y, HH:mm' }}</span>
                      </div>
                      <p>{{ run.source }}</p>
                    </article>
                  }
                </div>
              </div>
            }
          </tr-section-card>

          <tr-section-card title="Saved Searches" [meta]="savedSearches().length.toString()">
            <div class="saved-search-list">
              @for (search of savedSearches(); track search.id) {
                <article class="saved-search-card">
                  <button
                    type="button"
                    class="saved-search"
                    (click)="applySavedSearch(search)"
                  >
                    <strong>{{ search.name }}</strong>
                    <span>
                      {{ search.searchTerm || 'All tenders' }}
                      @if (search.deadlineWithinDays) {
                        &middot; {{ search.deadlineWithinDays }}d
                      }
                    </span>
                  </button>
                  <button
                    type="button"
                    class="saved-search-remove"
                    (click)="removeSavedSearch(search.id)"
                    aria-label="Delete saved search"
                  >
                    Remove
                  </button>
                </article>
              } @empty {
                <p class="empty-copy">No saved searches yet.</p>
              }
            </div>

            <form class="saved-search-form" (ngSubmit)="saveCurrentSearch()">
              <label>
                <span>Save Current Filters</span>
                <input
                  [(ngModel)]="savedSearchName"
                  name="savedSearchName"
                  placeholder="Construction leads"
                />
              </label>
              <button class="primary-button" type="submit">Save Search</button>
            </form>
          </tr-section-card>

          <tr-section-card title="Manual Import" meta="MVP">
            <form class="import-form" (ngSubmit)="importTender()">
              <label>
                <span>Title</span>
                <input [(ngModel)]="importDraft.title" name="title" required />
              </label>
              <label>
                <span>Authority</span>
                <input [(ngModel)]="importDraft.authority" name="authority" required />
              </label>
              <label>
                <span>Deadline</span>
                <input [(ngModel)]="importDraft.deadline" name="deadline" type="date" required />
              </label>
              <label>
                <span>Official URL</span>
                <input
                  [(ngModel)]="importDraft.officialUrl"
                  name="officialUrl"
                  placeholder="https://..."
                  required
                />
              </label>

              <button class="primary-button" type="submit">Add Tender</button>
            </form>
          </tr-section-card>
        </aside>

        <main class="main-column">
          <tr-section-card title="Radar Filters">
            <button trSectionActions type="button" class="ghost-button" (click)="resetFilters()">
              Reset
            </button>

            <div class="filters-grid">
              <label>
                <span>Keywords</span>
                <input
                  [(ngModel)]="searchTerm"
                  name="searchTerm"
                  placeholder="software, cleaning, reconstruction"
                  (ngModelChange)="onFilterChange()"
                />
              </label>
              <label>
                <span>Authority</span>
                <select
                  [(ngModel)]="selectedAuthority"
                  name="selectedAuthority"
                  (ngModelChange)="onFilterChange()"
                >
                  <option value="">All authorities</option>
                  @for (authority of authorities(); track authority) {
                    <option [value]="authority">{{ authority }}</option>
                  }
                </select>
              </label>
              <label>
                <span>Category</span>
                <select
                  [(ngModel)]="selectedCategory"
                  name="selectedCategory"
                  (ngModelChange)="onFilterChange()"
                >
                  <option value="">All categories</option>
                  @for (category of categories(); track category) {
                    <option [value]="category">{{ category }}</option>
                  }
                </select>
              </label>
              <label>
                <span>Deadline Window</span>
                <select
                  [(ngModel)]="deadlineWithinDays"
                  name="deadlineWithinDays"
                  (ngModelChange)="onFilterChange()"
                >
                  <option [ngValue]="0">Any deadline</option>
                  <option [ngValue]="7">Next 7 days</option>
                  <option [ngValue]="21">Next 21 days</option>
                  <option [ngValue]="30">Next 30 days</option>
                  <option [ngValue]="45">Next 45 days</option>
                </select>
              </label>
            </div>
          </tr-section-card>

          @if (loading()) {
            <tr-loading-spinner />
          } @else if (error()) {
            <tr-error-message
              [title]="'Tender feed unavailable'"
              [message]="error() || undefined"
              (retry)="loadTenders()"
            />
          } @else {
            <div class="results-bar">
              <p><strong>{{ totalTenders() }}</strong> tenders matched your current radar.</p>
              <p>Alerts are simulated in-app for MVP v1.</p>
            </div>

            <tr-tender-grid
              [tenders]="tenders()"
              [emptyMessage]="'No tenders matched the current filters.'"
              (tenderSelect)="openTender($event.id)"
            />

            @if (hasMorePages()) {
              <div class="pagination">
                <button
                  class="ghost-button"
                  type="button"
                  [disabled]="currentPage() === 1"
                  (click)="previousPage()"
                >
                  Previous
                </button>
                <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
                <button
                  class="ghost-button"
                  type="button"
                  [disabled]="currentPage() === totalPages()"
                  (click)="nextPage()"
                >
                  Next
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .radar-page {
        padding: 32px 24px 48px;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
        gap: 24px;
        padding: 32px;
        margin-bottom: 28px;
        border-radius: 32px;
        background: var(--tr-hero-gradient);
        color: var(--tr-on-dark);
        box-shadow: var(--tr-shadow-strong);
      }

      .eyebrow {
        margin: 0 0 10px;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.8rem;
        color: var(--tr-on-dark-eyebrow);
      }

      h1 {
        margin: 0 0 14px;
        font-size: clamp(2.2rem, 4vw, 4rem);
        line-height: 0.98;
        max-width: 12ch;
      }

      .hero-copy p:last-child {
        max-width: 56ch;
        margin: 0;
        line-height: 1.6;
        color: var(--tr-on-dark-soft);
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        align-content: start;
      }

      .overview-card {
        border-radius: 24px;
        border: 1px solid var(--tr-border-soft);
        box-shadow: var(--tr-shadow-soft);
        padding: 18px;
        background: var(--tr-surface-glass);
        color: var(--tr-on-dark);
        backdrop-filter: blur(8px);
      }

      .overview-card span {
        display: block;
        margin-bottom: 6px;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--tr-on-dark-muted);
      }

      .overview-card strong {
        font-size: 2rem;
      }

      .content-grid {
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr);
        gap: 24px;
      }

      .sidebar,
      .main-column {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .saved-search-list,
      .import-form {
        display: grid;
        gap: 14px;
      }

      .collector-status-card {
        display: grid;
        gap: 14px;
        padding: 16px;
        border-radius: 18px;
        background: var(--tr-surface-soft);
        border: 1px solid var(--tr-border-soft);
      }

      .collector-status-card--failure {
        background: rgba(255, 216, 210, 0.28);
        border-color: rgba(139, 44, 29, 0.2);
      }

      .collector-topline,
      .collector-facts {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .collector-source,
      .collector-error,
      .collector-fallback,
      .collector-fallback-reason {
        margin: 0;
        color: var(--tr-copy);
      }

      .collector-error {
        color: var(--tr-brand-danger);
        font-weight: 600;
      }

      .collector-fallback-reason {
        color: var(--tr-brand-warning);
        font-weight: 600;
      }

      .collector-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        padding: 0 10px;
        border-radius: var(--tr-radius-pill);
        background: var(--tr-stage-new-bg);
        color: var(--tr-stage-new-fg);
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
      }

      .collector-pill--failure {
        background: var(--tr-stage-closing-bg);
        color: var(--tr-stage-closing-fg);
      }

      .collector-facts span {
        display: block;
        margin-bottom: 4px;
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--tr-muted-soft);
      }

      .collector-history {
        display: grid;
        gap: 10px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--tr-border-soft);
      }

      .collector-history h3 {
        margin: 0;
        color: var(--tr-ink);
      }

      .collector-history-list {
        display: grid;
        gap: 10px;
      }

      .collector-history-item {
        display: grid;
        gap: 4px;
        padding: 12px 14px;
        background: var(--tr-surface-warm);
      }

      .collector-history-item div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
      }

      .collector-history-item p {
        margin: 0;
        color: var(--tr-muted);
      }

      .saved-search-card {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: start;
      }

      .saved-search {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid var(--tr-border-softest);
        background: var(--tr-surface-warm);
        text-align: left;
        cursor: pointer;
      }

      .saved-search-form {
        display: grid;
        gap: 12px;
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid var(--tr-border-soft);
      }

      .saved-search-remove {
        min-height: 44px;
        padding: 0 12px;
        border-radius: 14px;
        border: 1px solid var(--tr-border);
        background: var(--tr-surface-strong);
        color: var(--tr-muted);
        font: inherit;
        cursor: pointer;
      }

      .saved-search strong {
        color: var(--tr-ink);
      }

      .saved-search span,
      .empty-copy,
      .results-bar {
        color: var(--tr-muted);
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .results-bar,
      .pagination {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        padding: 6px 0 0;
      }

      @media (max-width: 768px) {
        .radar-page {
          padding: 16px;
        }

        .hero,
        .content-grid,
        .filters-grid,
        .overview-grid,
        .saved-search-card {
          grid-template-columns: 1fr;
        }

        .results-bar,
        .pagination {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderListComponent implements OnInit {
  private readonly tenderDataService = inject(TenderDataService);
  private readonly router = inject(Router);

  readonly tenders = signal<Tender[]>([]);
  readonly totalTenders = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly categories = signal<string[]>([]);
  readonly authorities = signal<string[]>([]);
  readonly savedSearches = signal<SavedSearch[]>([]);
  readonly overview = signal<DashboardOverview>({
    newCount: 0,
    changedCount: 0,
    closingSoonCount: 0,
    trackedAuthorities: 0,
  });
  readonly scraperStatus = signal<ScraperStatusSnapshot>({
    latestRun: null,
    recentRuns: [],
  });
  readonly runningScraper = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMorePages = computed(() => this.totalPages() > 1);
  readonly collectorMeta = computed(() => {
    const latestRun = this.scraperStatus().latestRun;

    if (!latestRun) {
      return 'No runs';
    }

    return latestRun.status === 'success' ? 'Healthy' : 'Attention';
  });

  searchTerm = '';
  selectedAuthority = '';
  selectedCategory = '';
  deadlineWithinDays = 0;
  savedSearchName = '';
  importDraft: TenderImportInput = {
    title: '',
    authority: '',
    deadline: '',
    officialUrl: '',
  };

  ngOnInit(): void {
    this.loadCategories();
    this.loadAuthorities();
    this.loadSavedSearches();
    this.loadOverview();
    this.loadScraperStatus();
    this.loadTenders();
  }

  loadCategories(): void {
    this.tenderDataService.getCategories().subscribe((categories) => {
      this.categories.set(categories);
    });
  }

  loadAuthorities(): void {
    this.tenderDataService.getAuthorities().subscribe((authorities) => {
      this.authorities.set(authorities);
    });
  }

  loadSavedSearches(): void {
    this.tenderDataService.getSavedSearches().subscribe((searches) => {
      this.savedSearches.set(searches);
    });
  }

  loadOverview(): void {
    this.tenderDataService.getOverview().subscribe((overview) => {
      this.overview.set(overview);
    });
  }

  loadScraperStatus(): void {
    this.tenderDataService.getScraperStatus().subscribe((status) => {
      this.scraperStatus.set(status);
    });
  }

  runScraper(): void {
    this.runningScraper.set(true);

    this.tenderDataService.triggerScraperRun().subscribe(() => {
      this.runningScraper.set(false);
      this.loadScraperStatus();
      this.loadOverview();
      this.loadTenders();
    });
  }

  loadTenders(): void {
    this.loading.set(true);
    this.error.set(null);

    const filter: TenderFilter = {};

    if (this.searchTerm) {
      filter.searchTerm = this.searchTerm;
    }
    if (this.selectedAuthority) {
      filter.authority = this.selectedAuthority;
    }
    if (this.selectedCategory) {
      filter.category = this.selectedCategory;
    }
    if (this.deadlineWithinDays > 0) {
      filter.deadlineWithinDays = this.deadlineWithinDays;
    }

    this.tenderDataService
      .getTenders(filter, this.currentPage(), 12)
      .subscribe((response) => {
        this.tenders.set(response.items);
        this.totalTenders.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
        this.error.set(this.tenderDataService.error());
      });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadTenders();
  }

  applySavedSearch(search: SavedSearch): void {
    this.searchTerm = search.searchTerm;
    this.selectedAuthority = search.authority || '';
    this.selectedCategory = search.category || '';
    this.deadlineWithinDays = search.deadlineWithinDays || 0;
    this.currentPage.set(1);
    this.loadTenders();
  }

  saveCurrentSearch(): void {
    const name = this.savedSearchName.trim();

    if (!name) {
      return;
    }

    this.tenderDataService
      .createSavedSearch({
        name,
        searchTerm: this.searchTerm,
        authority: this.selectedAuthority || undefined,
        category: this.selectedCategory || undefined,
        deadlineWithinDays: this.deadlineWithinDays || undefined,
      })
      .subscribe((savedSearch) => {
        if (!savedSearch) {
          return;
        }

        this.savedSearchName = '';
        this.loadSavedSearches();
      });
  }

  removeSavedSearch(id: string): void {
    this.tenderDataService.deleteSavedSearch(id).subscribe((deleted) => {
      if (!deleted) {
        return;
      }

      this.loadSavedSearches();
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedAuthority = '';
    this.selectedCategory = '';
    this.deadlineWithinDays = 0;
    this.currentPage.set(1);
    this.loadTenders();
  }

  importTender(): void {
    if (
      !this.importDraft.title ||
      !this.importDraft.authority ||
      !this.importDraft.deadline ||
      !this.importDraft.officialUrl
    ) {
      return;
    }

    this.tenderDataService
      .importTender({
        ...this.importDraft,
        deadline: new Date(this.importDraft.deadline).toISOString(),
      })
      .subscribe((result) => {
        if (!result) {
          this.error.set(this.tenderDataService.error());
          return;
        }

        this.importDraft = {
          title: '',
          authority: '',
          deadline: '',
          officialUrl: '',
        };
        this.currentPage.set(1);
        this.loadAuthorities();
        this.loadOverview();
        this.loadTenders();
      });
  }

  openTender(id: string): void {
    this.router.navigate(['/tenders', id]);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadTenders();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadTenders();
    }
  }
}
