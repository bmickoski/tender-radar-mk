import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenderDataService } from '@org/tenders/data';
import {
  Tender,
  TenderDocument,
  TenderTask,
  TenderWorkspaceUpdateInput,
} from '@org/models';
import {
  ErrorMessageComponent,
  LoadingSpinnerComponent,
  StageBadgeComponent,
} from '@org/tenders/ui';

@Component({
  selector: 'tr-tender-detail',
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    StageBadgeComponent,
  ],
  template: `
    <div class="detail-page tr-page--compact">
      @if (loading()) {
        <tr-loading-spinner />
      } @else if (error()) {
        <tr-error-message
          [title]="'Tender not found'"
          [message]="error() || undefined"
          (retry)="loadTender()"
        />
      } @else if (tender()) {
        <div class="breadcrumb">
          <a routerLink="/tenders">Back to radar</a>
        </div>

        <section class="headline-card tr-card tr-card--warm">
          <div class="headline-meta">
            <tr-stage-badge [stage]="tender()!.stage" />
            <span>{{ tender()!.authority }}</span>
            <span>{{ tender()!.cpvCode }}</span>
          </div>
          <h1>{{ tender()!.title }}</h1>
          <p>{{ tender()!.description }}</p>
        </section>

        <div class="detail-grid">
          <section class="brief-card tr-card">
            <h2>One-page brief</h2>

            <div class="facts-grid">
              <article>
                <span>Deadline</span>
                <strong>{{ tender()!.deadline | date: 'd MMM y, HH:mm' }}</strong>
              </article>
              <article>
                <span>Category</span>
                <strong>{{ tender()!.category }}</strong>
              </article>
              <article>
                <span>Submission</span>
                <strong>{{ tender()!.submissionMethod }}</strong>
              </article>
              <article>
                <span>Budget</span>
                <strong>
                  @if (tender()!.budgetEstimate) {
                    {{ tender()!.budgetEstimate | currency: 'EUR' : 'symbol' : '1.0-0' }}
                  } @else {
                    Review official notice
                  }
                </strong>
              </article>
            </div>

            <div class="section-block">
              <h3>Bid bond</h3>
              <p>{{ tender()!.bidBond }}</p>
            </div>

            <div class="section-block">
              <h3>Evaluation criteria</h3>
              <p>{{ tender()!.evaluationCriteria }}</p>
            </div>

            <div class="section-block">
              <h3>Required certificates</h3>
              <ul>
                @for (certificate of tender()!.requiredCertificates; track certificate) {
                  <li>{{ certificate }}</li>
                }
              </ul>
            </div>

            <div class="section-block">
              <h3>Radar summary</h3>
              <ul>
                @for (point of tender()!.summary; track point) {
                  <li>{{ point }}</li>
                }
              </ul>
            </div>
          </section>

          <aside class="workflow-card tr-card">
            <div class="action-stack">
              <a
                class="primary-link"
                [href]="tender()!.officialUrl"
                target="_blank"
                rel="noreferrer"
              >
                Open official notice
              </a>
              <button class="ghost-button" type="button" (click)="backToRadar()">
                Return to tender list
              </button>
            </div>

            <div class="section-block">
              <div class="section-heading">
                <h3>Bid workspace</h3>
                <button class="tr-button" type="button" (click)="saveWorkspace()">
                  Save workspace
                </button>
              </div>

              <label class="field">
                <span>Internal deadline</span>
                <input [(ngModel)]="internalDeadline" type="datetime-local" />
              </label>

              <label class="field">
                <span>Bid notes</span>
                <textarea [(ngModel)]="workspaceNotes" rows="4"></textarea>
              </label>
            </div>

            <div class="section-block">
              <div class="section-heading">
                <h3>Checklist</h3>
                <button class="tr-button--ghost" type="button" (click)="addTask()">
                  Add task
                </button>
              </div>

              <div class="workspace-list">
                @for (task of checklist; track task.id) {
                  <article class="workspace-card">
                    <label class="field compact">
                      <span>Task</span>
                      <input [(ngModel)]="task.title" />
                    </label>
                    <label class="field compact">
                      <span>Owner</span>
                      <input [(ngModel)]="task.owner" />
                    </label>
                    <label class="field compact">
                      <span>Status</span>
                      <select [(ngModel)]="task.status">
                        <option value="todo">To do</option>
                        <option value="in-progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </label>
                    <button
                      class="tr-button--quiet remove-inline"
                      type="button"
                      (click)="removeTask(task.id)"
                    >
                      Remove
                    </button>
                  </article>
                }
              </div>
            </div>

            <div class="section-block">
              <div class="section-heading">
                <h3>Document vault</h3>
                <button class="tr-button--ghost" type="button" (click)="addDocument()">
                  Add document
                </button>
              </div>

              <div class="workspace-list">
                @for (document of documents; track document.id) {
                  <article class="workspace-card">
                    <label class="field compact">
                      <span>Document</span>
                      <input [(ngModel)]="document.name" />
                    </label>
                    <label class="field compact">
                      <span>Status</span>
                      <select [(ngModel)]="document.status">
                        <option value="missing">Missing</option>
                        <option value="ready">Ready</option>
                        <option value="expiring">Expiring</option>
                      </select>
                    </label>
                    <label class="field compact">
                      <span>Expires</span>
                      <input [(ngModel)]="document.expiresAt" type="date" />
                    </label>
                    <label class="field compact full">
                      <span>Notes</span>
                      <input [(ngModel)]="document.notes" />
                    </label>
                    <button
                      class="tr-button--quiet remove-inline"
                      type="button"
                      (click)="removeDocument(document.id)"
                    >
                      Remove
                    </button>
                  </article>
                }
              </div>
            </div>

            <div class="section-block">
              <h3>Change tracking</h3>
              <p>Last seen hash: {{ tender()!.lastSeenHash }}</p>
              <p>Last changed: {{ tender()!.lastChangedAt | date: 'd MMM y, HH:mm' }}</p>

              @if (tender()!.changes.length) {
                <ul>
                  @for (change of tender()!.changes; track change.id) {
                    <li>
                      <strong>{{ change.label }}</strong>
                      <span>{{ change.summary }}</span>
                    </li>
                  }
                </ul>
              } @else {
                <p>No amendments tracked for this tender yet.</p>
              }
            </div>

            <div class="section-block">
              <h3>Source</h3>
              <p>
                {{
                  tender()!.sourceType === 'manual-import'
                    ? 'Manual import'
                    : 'Public ESPP view'
                }}
              </p>
              <p>Published: {{ tender()!.publishedAt | date: 'd MMM y, HH:mm' }}</p>
            </div>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      padding: 32px 24px 48px;
    }

    .breadcrumb {
      margin-bottom: 24px;
    }

    .breadcrumb a {
      color: var(--tr-ink-soft);
      text-decoration: none;
      font-size: 0.95rem;
    }

    .headline-card {
      padding: 28px;
      margin-bottom: 24px;
      background: var(--tr-hero-card-gradient);
    }

    .headline-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;
      color: var(--tr-muted);
      font-size: 0.86rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 4vw, 3.6rem);
      line-height: 1;
      color: var(--tr-ink);
    }

    .headline-card p {
      margin: 0;
      max-width: 70ch;
      color: var(--tr-copy);
      line-height: 1.65;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) 380px;
      gap: 24px;
    }

    h2,
    h3 {
      margin: 0 0 12px;
      color: #10292f;
    }

    .facts-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }

    .facts-grid article {
      padding: 16px;
      border-radius: 18px;
      background: var(--tr-surface-soft);
    }

    .facts-grid span {
      display: block;
      margin-bottom: 6px;
      font-size: 0.78rem;
      color: var(--tr-muted-soft);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .section-block + .section-block {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid var(--tr-border-soft);
    }

    .section-block p {
      margin: 0;
      color: var(--tr-copy);
      line-height: 1.55;
    }

    ul {
      margin: 0;
      padding-left: 18px;
      color: var(--tr-copy);
    }

    li + li {
      margin-top: 8px;
    }

    .action-stack {
      display: grid;
      gap: 10px;
      margin-bottom: 20px;
    }

    .primary-link,
    .ghost-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 0 14px;
      border-radius: 999px;
      font: inherit;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }

    .primary-link {
      background: #10292f;
      color: #fffdf5;
      border: none;
    }

    .ghost-button {
      border: 1px solid rgba(12, 47, 57, 0.14);
      background: #ffffff;
      color: #10292f;
    }

    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    .field + .field {
      margin-top: 12px;
    }

    .field span {
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #70848c;
      font-weight: 700;
    }

    input,
    select,
    textarea {
      min-height: 44px;
    }

    .workspace-list {
      display: grid;
      gap: 12px;
    }

    .workspace-card {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding: 14px;
      border-radius: 18px;
      background: var(--tr-surface-soft);
    }

    .compact {
      margin-top: 0;
    }

    .full {
      grid-column: 1 / -1;
    }

    .remove-inline {
      grid-column: 1 / -1;
    }

    @media (max-width: 768px) {
      .detail-page {
        padding: 16px 16px 40px;
      }

      .detail-grid,
      .facts-grid,
      .workspace-card {
        grid-template-columns: 1fr;
      }

      .section-heading {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenderDataService = inject(TenderDataService);

  readonly tender = signal<Tender | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  internalDeadline = '';
  workspaceNotes = '';
  checklist: TenderTask[] = [];
  documents: TenderDocument[] = [];

  ngOnInit(): void {
    this.loadTender();
  }

  loadTender(): void {
    const tenderId = this.route.snapshot.paramMap.get('id');

    if (!tenderId) {
      this.error.set('Tender ID not provided');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.tenderDataService.getTenderById(tenderId).subscribe((tender) => {
      this.tender.set(tender);
      this.loading.set(false);
      this.error.set(tender ? null : this.tenderDataService.error() || 'Tender not found');

      if (tender) {
        this.syncWorkspaceDraft(tender);
      }
    });
  }

  saveWorkspace(): void {
    const currentTender = this.tender();

    if (!currentTender) {
      return;
    }

    const payload: TenderWorkspaceUpdateInput = {
      internalDeadline: this.internalDeadline
        ? new Date(this.internalDeadline).toISOString()
        : undefined,
      notes: this.workspaceNotes.trim(),
      checklist: this.checklist
        .filter((task) => task.title.trim())
        .map((task) => ({
          ...task,
          title: task.title.trim(),
          owner: task.owner.trim(),
        })),
      documents: this.documents
        .filter((document) => document.name.trim())
        .map((document) => ({
          ...document,
          name: document.name.trim(),
          notes: document.notes?.trim() || undefined,
          expiresAt: document.expiresAt
            ? new Date(document.expiresAt).toISOString()
            : undefined,
        })),
    };

    this.tenderDataService
      .updateTenderWorkspace(currentTender.id, payload)
      .subscribe((tender) => {
        if (!tender) {
          this.error.set(this.tenderDataService.error() || 'Failed to update workspace');
          return;
        }

        this.tender.set(tender);
        this.syncWorkspaceDraft(tender);
      });
  }

  addTask(): void {
    this.checklist = [
      ...this.checklist,
      {
        id: this.createWorkspaceId('task'),
        title: '',
        owner: '',
        status: 'todo',
      },
    ];
  }

  removeTask(id: string): void {
    this.checklist = this.checklist.filter((task) => task.id !== id);
  }

  addDocument(): void {
    this.documents = [
      ...this.documents,
      {
        id: this.createWorkspaceId('doc'),
        name: '',
        status: 'missing',
        expiresAt: '',
        notes: '',
      },
    ];
  }

  removeDocument(id: string): void {
    this.documents = this.documents.filter((document) => document.id !== id);
  }

  backToRadar(): void {
    this.router.navigate(['/tenders']);
  }

  private syncWorkspaceDraft(tender: Tender): void {
    this.internalDeadline = tender.workspace.internalDeadline
      ? this.toLocalDateTime(tender.workspace.internalDeadline)
      : '';
    this.workspaceNotes = tender.workspace.notes;
    this.checklist = tender.workspace.checklist.map((task) => ({ ...task }));
    this.documents = tender.workspace.documents.map((document) => ({
      ...document,
      expiresAt: document.expiresAt ? this.toDateInput(document.expiresAt) : '',
      notes: document.notes || '',
    }));
  }

  private createWorkspaceId(prefix: 'task' | 'doc'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toDateInput(value: string): string {
    return value.slice(0, 10);
  }
}
