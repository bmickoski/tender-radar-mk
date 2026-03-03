import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Tender } from '@org/models';

@Component({
  selector: 'tr-tender-card',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <article class="tender-card" (click)="tenderClick.emit(tender())">
      <div class="card-topline">
        <span class="stage">{{ stageLabel(tender().stage) }}</span>
        <span class="cpv">{{ tender().cpvCode }}</span>
      </div>
      <p class="authority">{{ tender().authority }}</p>
      <h3 class="title">{{ tender().title }}</h3>
      <p class="category">{{ tender().category }} · {{ tender().region }}</p>
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
      border: 1px solid rgba(12, 47, 57, 0.1);
      background: #fffef8;
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
    .stage,
    .cpv {
      color: #5f6f76;
    }

    .title {
      margin-top: 10px;
      color: #10292f;
    }

    .category {
      margin-top: 8px;
    }

    .fact-row {
      margin-top: 16px;
    }

    .stage,
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
