import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenderDataService } from '@org/tenders/data';
import {
  DashboardOverview,
  SavedSearch,
  Tender,
  TenderFilter,
  TenderImportInput,
} from '@org/models';
import {
  ErrorMessageComponent,
  LoadingSpinnerComponent,
} from '@org/tenders/ui';

@Component({
  selector: 'tr-tender-list',
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="radar-page">
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
          <section class="panel">
            <div class="panel-header">
              <h2>Saved Searches</h2>
              <span>{{ savedSearches().length }}</span>
            </div>

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
          </section>

          <section class="panel">
            <div class="panel-header">
              <h2>Manual Import</h2>
              <span>MVP</span>
            </div>

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
          </section>
        </aside>

        <main class="main-column">
          <section class="panel">
            <div class="panel-header">
              <h2>Radar Filters</h2>
              <button type="button" class="ghost-button" (click)="resetFilters()">
                Reset
              </button>
            </div>

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
          </section>

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

            <div class="tender-list">
              @for (tender of tenders(); track tender.id) {
                <article class="tender-card" (click)="openTender(tender.id)">
                  <div class="card-topline">
                    <span class="stage" [class]="'stage stage-' + tender.stage">
                      {{ stageLabel(tender.stage) }}
                    </span>
                    <span class="cpv">{{ tender.cpvCode }}</span>
                  </div>

                  <p class="authority">{{ tender.authority }}</p>
                  <h3>{{ tender.title }}</h3>
                  <p class="meta">{{ tender.category }} &middot; {{ tender.region }}</p>
                  <p class="description">{{ tender.description }}</p>

                  <div class="fact-grid">
                    <div>
                      <span>Deadline</span>
                      <strong>{{ tender.deadline | date: 'd MMM y, HH:mm' }}</strong>
                    </div>
                    <div>
                      <span>Budget</span>
                      <strong>
                        @if (tender.budgetEstimate) {
                          {{ tender.budgetEstimate | currency: 'EUR' : 'symbol' : '1.0-0' }}
                        } @else {
                          Review notice
                        }
                      </strong>
                    </div>
                  </div>

                  <div class="summary-list">
                    @for (point of tender.summary; track point) {
                      <span>{{ point }}</span>
                    }
                  </div>
                </article>
              } @empty {
                <section class="panel empty-state">
                  <p>No tenders matched the current filters.</p>
                </section>
              }
            </div>

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
  styles: [`
    .radar-page {
      max-width: 1320px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
      gap: 24px;
      padding: 32px;
      margin-bottom: 28px;
      border-radius: 32px;
      background:
        radial-gradient(circle at top left, rgba(255, 234, 184, 0.8), transparent 35%),
        linear-gradient(135deg, #0c2f39 0%, #154b54 62%, #fff7e0 140%);
      color: #fffdf5;
      box-shadow: 0 24px 60px rgba(12, 47, 57, 0.22);
    }

    .eyebrow {
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.8rem;
      color: rgba(255, 253, 245, 0.78);
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
      color: rgba(255, 253, 245, 0.82);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      align-content: start;
    }

    .overview-card,
    .tender-card {
      border-radius: 24px;
      border: 1px solid rgba(12, 47, 57, 0.08);
      box-shadow: 0 16px 40px rgba(12, 47, 57, 0.08);
    }

    .overview-card {
      padding: 18px;
      background: rgba(255, 255, 255, 0.12);
      color: #fffdf5;
      backdrop-filter: blur(8px);
    }

    .overview-card span {
      display: block;
      margin-bottom: 6px;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 253, 245, 0.75);
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
    .import-form,
    .tender-list {
      display: grid;
      gap: 14px;
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
      border: 1px solid rgba(12, 47, 57, 0.1);
      background: #fffdf7;
      text-align: left;
      cursor: pointer;
    }

    .saved-search-form {
      display: grid;
      gap: 12px;
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid rgba(12, 47, 57, 0.08);
    }

    .saved-search-remove {
      min-height: 44px;
      padding: 0 12px;
      border-radius: 14px;
      border: 1px solid rgba(12, 47, 57, 0.12);
      background: #ffffff;
      color: #5f6f76;
      font: inherit;
      cursor: pointer;
    }

    .saved-search strong,
    .tender-card h3 {
      color: #10292f;
    }

    .saved-search span,
    .empty-copy,
    .results-bar,
    .meta,
    .description {
      color: #5f6f76;
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

    .tender-card {
      padding: 20px;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      background: linear-gradient(180deg, #fffef7 0%, #ffffff 100%);
    }

    .tender-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 44px rgba(12, 47, 57, 0.12);
    }

    .card-topline {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
      align-items: center;
    }

    .stage,
    .cpv {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .stage {
      padding: 6px 10px;
      border-radius: 999px;
    }

    .stage-new {
      background: #d6f5df;
      color: #176336;
    }

    .stage-changed {
      background: #fff1c9;
      color: #7a5700;
    }

    .stage-tracked {
      background: #dbeeff;
      color: #0e5278;
    }

    .stage-closing-soon {
      background: #ffd8d2;
      color: #8b2c1d;
    }

    .authority,
    .tender-card h3,
    .meta,
    .description {
      margin: 0;
    }

    .authority {
      font-weight: 600;
      color: #244651;
    }

    .tender-card h3 {
      font-size: 1.35rem;
      line-height: 1.15;
      margin-top: 8px;
    }

    .description {
      margin-top: 10px;
      line-height: 1.5;
    }

    .fact-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 16px;
    }

    .fact-grid span {
      display: block;
      margin-bottom: 4px;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #70848c;
    }

    .fact-grid strong {
      color: #10292f;
    }

    .summary-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .summary-list span {
      padding: 7px 10px;
      border-radius: 999px;
      background: #eef5f7;
      color: #244651;
      font-size: 0.82rem;
    }

    .empty-state {
      text-align: center;
    }

    @media (max-width: 768px) {
      .radar-page {
        padding: 16px;
      }

      .hero,
      .content-grid,
      .filters-grid,
      .overview-grid,
      .fact-grid,
      .saved-search-card {
        grid-template-columns: 1fr;
      }

      .results-bar,
      .pagination {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
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
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMorePages = computed(() => this.totalPages() > 1);

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

  stageLabel(stage: Tender['stage']): string {
    switch (stage) {
      case 'new':
        return 'New';
      case 'changed':
        return 'Changed';
      case 'closing-soon':
        return 'Closing Soon';
      default:
        return 'Tracked';
    }
  }
}
