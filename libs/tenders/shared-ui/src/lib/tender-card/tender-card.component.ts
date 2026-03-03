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
      <div class="fact-row">
        <span>{{ tender().deadline | date: 'd MMM y' }}</span>
        <strong>
          @if (tender().budgetEstimate) {
            {{ tender().budgetEstimate | currency: 'EUR' : 'symbol' : '1.0-0' }}
          } @else {
            Review notice
          }
        </strong>
      </div>
    </article>
  `,
  styles: [`
    .tender-card {
      display: block;
      height: 100%;
      padding: 18px;
      border-radius: 20px;
      border: 1px solid var(--tr-border-softest);
      background: var(--tr-surface-warm-strong);
      cursor: pointer;
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
    .category {
      margin: 0;
    }

    .authority,
    .category,
    .cpv {
      color: var(--tr-muted);
    }

    .title {
      margin-top: 10px;
      color: var(--tr-ink);
    }

    .category {
      margin-top: 8px;
    }

    .fact-row {
      margin-top: 16px;
    }

    .cpv {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
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
