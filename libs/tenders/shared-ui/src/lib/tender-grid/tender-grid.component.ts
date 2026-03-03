import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tender } from '@org/models';
import { TenderCardComponent } from '../tender-card/tender-card.component';

@Component({
  selector: 'tr-tender-grid',
  imports: [CommonModule, TenderCardComponent],
  template: `
    <div class="grid">
      @for (tender of tenders(); track tender.id) {
        <tr-tender-card
          [tender]="tender"
          (tenderClick)="tenderSelect.emit($event)"
        />
      } @empty {
        <div class="empty">{{ emptyMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .empty {
      grid-column: 1 / -1;
      padding: 32px;
      text-align: center;
      color: var(--tr-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderGridComponent {
  readonly tenders = input.required<Tender[]>();
  readonly emptyMessage = input('No tenders found.');
  readonly tenderSelect = output<Tender>();
}
