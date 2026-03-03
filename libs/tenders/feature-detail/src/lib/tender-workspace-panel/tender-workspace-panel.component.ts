import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Tender,
  TenderDocument,
  TenderTask,
  TenderWorkspaceUpdateInput,
} from '@org/models';
import { ActionStackComponent, SectionCardComponent } from '@org/tenders/ui';

@Component({
  selector: 'tr-tender-workspace-panel',
  imports: [CommonModule, FormsModule, DatePipe, ActionStackComponent, SectionCardComponent],
  template: `
    <tr-section-card>
      <tr-action-stack>
        <a
          class="tr-button"
          [href]="tender()?.officialUrl ?? '#'"
          target="_blank"
          rel="noreferrer"
        >
          Open official notice
        </a>
        <button class="tr-button--ghost" type="button" (click)="goBack.emit()">
          Return to tender list
        </button>
      </tr-action-stack>

      <div class="section-block">
        <div class="section-heading">
          <h3>Bid workspace</h3>
          <button class="tr-button" type="button" (click)="emitSave()">
            Save workspace
          </button>
        </div>

        <label class="tr-field">
          <span class="tr-field-label">Internal deadline</span>
          <input class="tr-control" [(ngModel)]="internalDeadline" type="datetime-local" />
        </label>

        <label class="tr-field field-gap">
          <span class="tr-field-label">Bid notes</span>
          <textarea class="tr-control" [(ngModel)]="workspaceNotes" rows="4"></textarea>
        </label>
      </div>

      <div class="section-block">
        <div class="section-heading">
          <h3>Checklist</h3>
          <button class="tr-button--ghost" type="button" (click)="addTask()">
            Add task
          </button>
        </div>

        <div class="workspace-list">
          @for (task of checklist; track task.id) {
            <article class="workspace-card">
              <label class="tr-field compact">
                <span class="tr-field-label">Task</span>
                <input class="tr-control" [(ngModel)]="task.title" />
              </label>
              <label class="tr-field compact">
                <span class="tr-field-label">Owner</span>
                <input class="tr-control" [(ngModel)]="task.owner" />
              </label>
              <label class="tr-field compact">
                <span class="tr-field-label">Status</span>
                <select class="tr-control" [(ngModel)]="task.status">
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <button
                class="tr-button--quiet remove-inline"
                type="button"
                (click)="removeTask(task.id)"
              >
                Remove
              </button>
            </article>
          }
        </div>
      </div>

      <div class="section-block">
        <div class="section-heading">
          <h3>Document vault</h3>
          <button class="tr-button--ghost" type="button" (click)="addDocument()">
            Add document
          </button>
        </div>

        <div class="workspace-list">
          @for (document of documents; track document.id) {
            <article class="workspace-card">
              <label class="tr-field compact">
                <span class="tr-field-label">Document</span>
                <input class="tr-control" [(ngModel)]="document.name" />
              </label>
              <label class="tr-field compact">
                <span class="tr-field-label">Status</span>
                <select class="tr-control" [(ngModel)]="document.status">
                  <option value="missing">Missing</option>
                  <option value="ready">Ready</option>
                  <option value="expiring">Expiring</option>
                </select>
              </label>
              <label class="tr-field compact">
                <span class="tr-field-label">Expires</span>
                <input class="tr-control" [(ngModel)]="document.expiresAt" type="date" />
              </label>
              <label class="tr-field compact full">
                <span class="tr-field-label">Notes</span>
                <input class="tr-control" [(ngModel)]="document.notes" />
              </label>
              <button
                class="tr-button--quiet remove-inline"
                type="button"
                (click)="removeDocument(document.id)"
              >
                Remove
              </button>
            </article>
          }
        </div>
      </div>

      <div class="section-block">
        <h3>Change tracking</h3>
        <p>Last seen hash: {{ tender()?.lastSeenHash }}</p>
        <p>Last changed: {{ tender()?.lastChangedAt | date: 'd MMM y, HH:mm' }}</p>

        @if (tender()?.changes?.length) {
          <ul>
            @for (change of tender()?.changes ?? []; track change.id) {
              <li>
                <strong>{{ change.label }}</strong>
                <span>{{ change.summary }}</span>
              </li>
            }
          </ul>
        } @else {
          <p>No amendments tracked for this tender yet.</p>
        }
      </div>

      <div class="section-block">
        <h3>Source</h3>
        <p>
          {{ tender()?.sourceType === 'manual-import' ? 'Manual import' : 'Public ESPP view' }}
        </p>
        <p>Published: {{ tender()?.publishedAt | date: 'd MMM y, HH:mm' }}</p>
      </div>
    </tr-section-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .section-block + .section-block {
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid var(--tr-border-soft);
      }

      .section-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .field-gap {
        margin-top: 12px;
      }

      .workspace-list {
        display: grid;
        gap: 12px;
      }

      .workspace-card {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        padding: 14px;
        border-radius: 18px;
        background: var(--tr-surface-soft);
      }

      .compact {
        margin-top: 0;
      }

      .full,
      .remove-inline {
        grid-column: 1 / -1;
      }

      h3 {
        margin: 0 0 12px;
        color: var(--tr-ink);
      }

      p {
        margin: 0;
        color: var(--tr-copy);
        line-height: 1.55;
      }

      ul {
        margin: 12px 0 0;
        padding-left: 18px;
        color: var(--tr-copy);
      }

      li + li {
        margin-top: 8px;
      }

      @media (max-width: 768px) {
        .workspace-card {
          grid-template-columns: 1fr;
        }

        .section-heading {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenderWorkspacePanelComponent {
  readonly tender = input<Tender | null>(null);
  readonly saveWorkspace = output<TenderWorkspaceUpdateInput>();
  readonly goBack = output<void>();

  internalDeadline = '';
  workspaceNotes = '';
  checklist: TenderTask[] = [];
  documents: TenderDocument[] = [];

  constructor() {
    effect(() => {
      const tender = this.tender();

      if (tender) {
        this.syncWorkspaceDraft(tender);
      }
    });
  }

  emitSave(): void {
    this.saveWorkspace.emit({
      internalDeadline: this.internalDeadline
        ? new Date(this.internalDeadline).toISOString()
        : undefined,
      notes: this.workspaceNotes.trim(),
      checklist: this.checklist
        .filter((task) => task.title.trim())
        .map((task) => ({
          ...task,
          title: task.title.trim(),
          owner: task.owner.trim(),
        })),
      documents: this.documents
        .filter((document) => document.name.trim())
        .map((document) => ({
          ...document,
          name: document.name.trim(),
          notes: document.notes?.trim() || undefined,
          expiresAt: document.expiresAt
            ? new Date(document.expiresAt).toISOString()
            : undefined,
        })),
    });
  }

  addTask(): void {
    this.checklist = [
      ...this.checklist,
      {
        id: this.createWorkspaceId('task'),
        title: '',
        owner: '',
        status: 'todo',
      },
    ];
  }

  removeTask(id: string): void {
    this.checklist = this.checklist.filter((task) => task.id !== id);
  }

  addDocument(): void {
    this.documents = [
      ...this.documents,
      {
        id: this.createWorkspaceId('doc'),
        name: '',
        status: 'missing',
        expiresAt: '',
        notes: '',
      },
    ];
  }

  removeDocument(id: string): void {
    this.documents = this.documents.filter((document) => document.id !== id);
  }

  private syncWorkspaceDraft(tender: Tender): void {
    this.internalDeadline = tender.workspace.internalDeadline
      ? this.toLocalDateTime(tender.workspace.internalDeadline)
      : '';
    this.workspaceNotes = tender.workspace.notes;
    this.checklist = tender.workspace.checklist.map((task) => ({ ...task }));
    this.documents = tender.workspace.documents.map((document) => ({
      ...document,
      expiresAt: document.expiresAt ? this.toDateInput(document.expiresAt) : '',
      notes: document.notes || '',
    }));
  }

  private createWorkspaceId(prefix: 'task' | 'doc'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toDateInput(value: string): string {
    return value.slice(0, 10);
  }
}
