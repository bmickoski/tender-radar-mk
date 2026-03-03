import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'tr-action-stack',
  host: {
    '[class]': 'hostClass()',
  },
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: grid;
        gap: 10px;
      }

      :host(.tr-action-stack--inline) {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionStackComponent {
  readonly layout = input<'stack' | 'inline'>('stack');

  readonly hostClass = computed(() =>
    this.layout() === 'inline' ? 'tr-action-stack tr-action-stack--inline' : 'tr-action-stack'
  );
}
