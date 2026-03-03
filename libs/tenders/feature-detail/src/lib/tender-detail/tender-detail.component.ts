import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TenderDataService } from '@org/tenders/data';
import { Tender, TenderWorkspaceUpdateInput } from '@org/models';
import {
  ErrorMessageComponent,
  LoadingSpinnerComponent,
} from '@org/tenders/ui';
import { TenderBriefCardComponent } from '../tender-brief-card/tender-brief-card.component';
import { TenderWorkspacePanelComponent } from '../tender-workspace-panel/tender-workspace-panel.component';

@Component({
  selector: 'tr-tender-detail',
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    TenderBriefCardComponent,
    TenderWorkspacePanelComponent,
  ],
  template: `
    <div class="detail-page tr-page--compact">
      @if (loading()) {
        <tr-loading-spinner />
      } @else if (error()) {
        <tr-error-message
          [title]="'Tender not found'"
          [message]="error() || undefined"
          (retry)="loadTender()"
        />
      } @else if (tender()) {
        <div class="breadcrumb">
          <a routerLink="/tenders">Back to radar</a>
        </div>

        <div class="detail-grid">
          <tr-tender-brief-card [tender]="tender()!" />

          <tr-tender-workspace-panel
            [tender]="tender()!"
            (saveWorkspace)="saveWorkspace($event)"
            (goBack)="backToRadar()"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      padding: 32px 24px 48px;
    }

    .breadcrumb {
      margin-bottom: 24px;
    }

    .breadcrumb a {
      color: var(--tr-ink-soft);
      text-decoration: none;
      font-size: 0.95rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) 380px;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .detail-page {
        padding: 16px 16px 40px;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenderDataService = inject(TenderDataService);

  readonly tender = signal<Tender | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTender();
  }

  loadTender(): void {
    const tenderId = this.route.snapshot.paramMap.get('id');

    if (!tenderId) {
      this.error.set('Tender ID not provided');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.tenderDataService.getTenderById(tenderId).subscribe((tender) => {
      this.tender.set(tender);
      this.loading.set(false);
      this.error.set(tender ? null : this.tenderDataService.error() || 'Tender not found');
    });
  }

  saveWorkspace(payload: TenderWorkspaceUpdateInput): void {
    const currentTender = this.tender();

    if (!currentTender) {
      return;
    }

    this.tenderDataService
      .updateTenderWorkspace(currentTender.id, payload)
      .subscribe((tender) => {
        if (!tender) {
        this.error.set(this.tenderDataService.error() || 'Failed to update workspace');
        return;
      }

        this.tender.set(tender);
      });
  }

  backToRadar(): void {
    this.router.navigate(['/tenders']);
  }
}
