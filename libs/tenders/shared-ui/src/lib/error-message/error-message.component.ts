import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr-error-message',
  imports: [CommonModule],
  template: `
    <div class="panel tr-feedback error-container">
      <div class="tr-feedback-icon">!</div>
      <h3>{{ title() || 'Oops! Something went wrong' }}</h3>
      <p>{{ message() || 'An unexpected error occurred. Please try again later.' }}</p>
      @if (showRetry()) {
        <button class="tr-button" (click)="retry.emit()">
          Try Again
        </button>
      }
    </div>
  `,
  styles: [`
    .error-container {
      min-height: 240px;
    }

    h3 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--tr-ink);
    }

    p {
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  readonly title = input<string>();
  readonly message = input<string>();
  readonly showRetry = input(true);
  readonly retry = output<void>();
}
