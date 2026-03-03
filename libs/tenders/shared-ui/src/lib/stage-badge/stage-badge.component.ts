import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TenderStage } from '@org/models';

@Component({
  selector: 'tr-stage-badge',
  host: {
    '[class]': 'hostClass()',
  },
  template: `{{ label() }}`,
  styles: [`
    :host {
      white-space: nowrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageBadgeComponent {
  readonly stage = input.required<TenderStage>();
  readonly text = input<string>();

  readonly label = computed(() => this.text() || this.defaultLabel(this.stage()));
  readonly hostClass = computed(() => `tr-stage tr-stage-${this.stage()}`);

  private defaultLabel(stage: TenderStage): string {
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
