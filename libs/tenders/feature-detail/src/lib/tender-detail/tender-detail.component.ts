import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenderDataService } from '@org/tenders/data';
import { Tender } from '@org/models';
import {
  ErrorMessageComponent,
  LoadingSpinnerComponent,
} from '@org/tenders/ui';

@Component({
  selector: 'tr-tender-detail',
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="detail-page">
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

        <section class="headline-card">
          <div class="headline-meta">
            <span class="stage" [class]="'stage stage-' + tender()!.stage">
              {{ stageLabel(tender()!.stage) }}
            </span>
            <span>{{ tender()!.authority }}</span>
            <span>{{ tender()!.cpvCode }}</span>
          </div>
          <h1>{{ tender()!.title }}</h1>
          <p>{{ tender()!.description }}</p>
        </section>

        <div class="detail-grid">
          <section class="brief-card">
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

          <aside class="workflow-card">
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
              <h3>Starter checklist</h3>
              <ul>
                <li>Validate amendment history and last seen hash.</li>
                <li>Assign legal, finance, and technical owners.</li>
                <li>Confirm reusable certificates from the document vault.</li>
                <li>Set an internal deadline before the official one.</li>
              </ul>
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
      max-width: 1240px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }

    .breadcrumb {
      margin-bottom: 24px;
    }

    .breadcrumb a {
      color: #244651;
      text-decoration: none;
      font-size: 0.95rem;
    }

    .headline-card,
    .brief-card,
    .workflow-card {
      border-radius: 28px;
      border: 1px solid rgba(12, 47, 57, 0.08);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 16px 40px rgba(12, 47, 57, 0.08);
    }

    .headline-card {
      padding: 28px;
      margin-bottom: 24px;
      background:
        radial-gradient(circle at top right, rgba(255, 234, 184, 0.55), transparent 28%),
        linear-gradient(180deg, #fffdf7 0%, #ffffff 100%);
    }

    .headline-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;
      color: #5f6f76;
      font-size: 0.86rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 4vw, 3.6rem);
      line-height: 1;
      color: #10292f;
    }

    .headline-card p {
      margin: 0;
      max-width: 70ch;
      color: #4d5f66;
      line-height: 1.65;
    }

    .stage {
      padding: 6px 10px;
      border-radius: 999px;
      font-weight: 700;
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

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) 340px;
      gap: 24px;
    }

    .brief-card,
    .workflow-card {
      padding: 24px;
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
      background: #f7fafb;
    }

    .facts-grid span {
      display: block;
      margin-bottom: 6px;
      font-size: 0.78rem;
      color: #70848c;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .section-block + .section-block {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid rgba(12, 47, 57, 0.08);
    }

    .section-block p {
      margin: 0;
      color: #4d5f66;
      line-height: 1.55;
    }

    ul {
      margin: 0;
      padding-left: 18px;
      color: #4d5f66;
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
      min-height: 46px;
      padding: 0 18px;
      border-radius: 999px;
      font: inherit;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }

    .primary-link {
      background: #10292f;
      color: #fffdf5;
    }

    .ghost-button {
      border: 1px solid rgba(12, 47, 57, 0.14);
      background: #ffffff;
      color: #10292f;
    }

    @media (max-width: 768px) {
      .detail-page {
        padding: 16px 16px 40px;
      }

      .detail-grid,
      .facts-grid {
        grid-template-columns: 1fr;
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
    });
  }

  backToRadar(): void {
    this.router.navigate(['/tenders']);
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
