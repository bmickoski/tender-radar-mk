import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr-loading-spinner',
  imports: [CommonModule],
  template: `
    <div class="panel tr-feedback spinner-container">
      <div class="tr-spinner"></div>
      <p>Loading...</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      min-height: 220px;
    }

    p {
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {}
