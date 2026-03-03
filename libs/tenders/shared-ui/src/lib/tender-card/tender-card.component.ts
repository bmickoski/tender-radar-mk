import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Tender } from '@org/models';
import { StageBadgeComponent } from '../stage-badge/stage-badge.component';

@Component({
  selector: 'tr-tender-card',
  imports: [CommonModule, CurrencyPipe, DatePipe, StageBadgeComponent],
  host: {
    'role': 'button',
    'tabindex': '0',
    '(click)': 'selectTender()',
    '(keydown.enter)': 'selectTender()',
    '(keydown.space)': 'handleSpace($event)',
  },
  template: `
    <article class="tender-card">
      <div class="card-topline">
        <tr-stage-badge [stage]="tender().stage" />
        <span class="cpv">{{ tender().cpvCode }}</span>
      </div>
      <p class="authority">{{ tender().authority }}</p>
      <h3 class="title">{{ tender().title }}</h3>
      <p class="category">{{ tender().category }} &middot; {{ tender().region }}</p>
      <p class="description">{{ tender().description }}</p>
      <div class="fact-row">
        <div>
          <span class="fact-label">Deadline</span>
          <strong>{{ tender().deadline | date: 'd MMM y, HH:mm' }}</strong>
        </div>
        <div>
          <span class="fact-label">Budget</span>
          <strong>
            @if (tender().budgetEstimate) {
              {{ tender().budgetEstimate | currency: 'EUR' : 'symbol' : '1.0-0' }}
            } @else {
              Review notice
            }
          </strong>
        </div>
      </div>
      <div class="summary-list">
        @for (point of tender().summary; track point) {
          <span>{{ point }}</span>
        }
      </div>
    </article>
  `,
  styles: [`
    .tender-card {
      display: block;
      height: 100%;
      padding: 20px;
      border-radius: 24px;
      border: 1px solid var(--tr-border-softest);
      background: var(--tr-panel-gradient);
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }

    .tender-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--tr-shadow-hover);
    }

    .card-topline,
    .fact-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .authority,
    .title,
    .category,
    .description {
      margin: 0;
    }

    .authority,
    .category,
    .cpv,
    .description {
      color: var(--tr-muted);
    }

    .title {
      margin-top: 10px;
      color: var(--tr-ink);
      font-size: 1.35rem;
      line-height: 1.15;
    }

    .category {
      margin-top: 8px;
    }

    .description {
      margin-top: 10px;
      line-height: 1.5;
    }

    .fact-row {
      margin-top: 16px;
      align-items: start;
    }

    .fact-label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tr-muted-soft);
    }

    .cpv {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }

    .summary-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .summary-list span {
      padding: 7px 10px;
      border-radius: var(--tr-radius-pill);
      background: var(--tr-surface-chip);
      color: var(--tr-ink-soft);
      font-size: 0.82rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderCardComponent {
  readonly tender = input.required<Tender>();
  readonly tenderClick = output<Tender>();

  selectTender(): void {
    this.tenderClick.emit(this.tender());
  }

  handleSpace(event: Event): void {
    event.preventDefault();
    this.selectTender();
  }
}
