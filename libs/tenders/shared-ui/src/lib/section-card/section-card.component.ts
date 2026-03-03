import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'tr-section-card',
  host: {
    '[class]': 'hostClass()',
  },
  template: `
    @if (title() || meta()) {
      <header class="tr-section-head">
        <div class="tr-stack">
          @if (title()) {
            <h2>{{ title() }}</h2>
          }
          @if (meta()) {
            <span class="tr-section-meta">{{ meta() }}</span>
          }
        </div>

        <div class="tr-section-actions">
          <ng-content select="[trSectionActions]" />
        </div>
      </header>
    }

    <ng-content />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .tr-section-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardComponent {
  readonly title = input<string>();
  readonly meta = input<string>();
  readonly tone = input<'default' | 'soft' | 'warm'>('default');

  readonly hostClass = computed(() => {
    const tone = this.tone();
    return tone === 'default' ? 'tr-card' : `tr-card tr-card--${tone}`;
  });
}
