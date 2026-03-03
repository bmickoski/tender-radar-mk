import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tender } from '@org/models';
import { SectionCardComponent, StageBadgeComponent } from '@org/tenders/ui';

@Component({
  selector: 'tr-tender-brief-card',
  host: {
    'class': 'brief-column',
  },
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    SectionCardComponent,
    StageBadgeComponent,
  ],
  template: `
    <section class="headline-card tr-card tr-card--warm">
      <div class="headline-meta">
        <tr-stage-badge [stage]="tender().stage" />
        <span>{{ tender().authority }}</span>
        <span>{{ tender().cpvCode }}</span>
      </div>
      <h1>{{ tender().title }}</h1>
      <p>{{ tender().description }}</p>
    </section>

    <tr-section-card title="One-page brief">
      <div class="facts-grid">
        <article>
          <span>Deadline</span>
          <strong>{{ tender().deadline | date: 'd MMM y, HH:mm' }}</strong>
        </article>
        <article>
          <span>Category</span>
          <strong>{{ tender().category }}</strong>
        </article>
        <article>
          <span>Submission</span>
          <strong>{{ tender().submissionMethod }}</strong>
        </article>
        <article>
          <span>Budget</span>
          <strong>
            @if (tender().budgetEstimate) {
              {{ tender().budgetEstimate | currency: 'EUR' : 'symbol' : '1.0-0' }}
            } @else {
              Review official notice
            }
          </strong>
        </article>
      </div>

      <div class="section-block">
        <h3>Bid bond</h3>
        <p>{{ tender().bidBond }}</p>
      </div>

      <div class="section-block">
        <h3>Evaluation criteria</h3>
        <p>{{ tender().evaluationCriteria }}</p>
      </div>

      <div class="section-block">
        <h3>Required certificates</h3>
        <ul>
          @for (certificate of tender().requiredCertificates; track certificate) {
            <li>{{ certificate }}</li>
          }
        </ul>
      </div>

      <div class="section-block">
        <h3>Radar summary</h3>
        <ul>
          @for (point of tender().summary; track point) {
            <li>{{ point }}</li>
          }
        </ul>
      </div>
    </tr-section-card>
  `,
  styles: [
    `
      :host {
        display: block;
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

      h3 {
        margin: 0 0 12px;
        color: var(--tr-ink);
      }

      ul {
        margin: 0;
        padding-left: 18px;
        color: var(--tr-copy);
      }

      li + li {
        margin-top: 8px;
      }

      @media (max-width: 768px) {
        .facts-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderBriefCardComponent {
  readonly tender = input.required<Tender>();
}
