import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Tender } from '@org/models';
import { TenderDataService } from '@org/tenders/data';
import { TenderDetailComponent } from './tender-detail.component';

describe('TenderDetailComponent', () => {
  let fixture: ComponentFixture<TenderDetailComponent>;
  let component: TenderDetailComponent;

  const tender: Tender = {
    id: 'tn-001',
    title: 'Managed Network and Endpoint Support for Municipal Schools',
    description: 'Framework agreement for school infrastructure support.',
    authority: 'City of Skopje',
    region: 'Skopje',
    category: 'IT Services',
    cpvCode: '72700000',
    budgetEstimate: 185000,
    deadline: '2026-03-21T11:00:00.000Z',
    publishedAt: '2026-02-28T09:15:00.000Z',
    submissionMethod: 'ESPP electronic submission',
    bidBond: '2% bid guarantee required',
    requiredCertificates: ['Central Registry current status'],
    evaluationCriteria: '70% price, 30% technical quality',
    officialUrl: 'https://example.mk/tenders/tn-001',
    sourceType: 'espp-public',
    stage: 'new',
    lastSeenHash: 'tn001-v1',
    lastChangedAt: '2026-02-28T09:15:00.000Z',
    summary: ['Fit for SME MSP teams.'],
    changes: [],
    workspace: {
      internalDeadline: '2026-03-18T12:00:00.000Z',
      notes: 'Initial note',
      checklist: [
        {
          id: 'task-1',
          title: 'Review dossier',
          owner: 'Legal',
          status: 'todo',
        },
      ],
      documents: [
        {
          id: 'doc-1',
          name: 'Central Registry current status',
          status: 'ready',
          notes: 'Reusable',
        },
      ],
    },
  };

  const updatedTender: Tender = {
    ...tender,
    workspace: {
      internalDeadline: '2026-03-20T12:00:00.000Z',
      notes: 'Updated workspace note',
      checklist: [
        {
          id: 'task-1',
          title: 'Review dossier',
          owner: 'Legal',
          status: 'done',
        },
      ],
      documents: [
        {
          id: 'doc-1',
          name: 'Central Registry current status',
          status: 'ready',
          notes: 'Reusable',
        },
      ],
    },
  };

  const tenderDataService = {
    error: signal<string | null>(null),
    getTenderById: vi.fn(() => of(tender)),
    updateTenderWorkspace: vi.fn(() => of(updatedTender)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TenderDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'tn-001' : null),
              },
            },
          },
        },
        { provide: TenderDataService, useValue: tenderDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TenderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the tender workspace on init', () => {
    expect(tenderDataService.getTenderById).toHaveBeenCalledWith('tn-001');
    expect(component.workspaceNotes).toBe('Initial note');
    expect(component.checklist.length).toBe(1);
    expect(component.documents.length).toBe(1);
  });

  it('adds checklist items and documents to the draft workspace', () => {
    component.addTask();
    component.addDocument();

    expect(component.checklist.length).toBe(2);
    expect(component.documents.length).toBe(2);
  });

  it('persists the workspace through the data service', () => {
    component.workspaceNotes = 'Updated workspace note';
    component.checklist[0].status = 'done';

    component.saveWorkspace();

    expect(tenderDataService.updateTenderWorkspace).toHaveBeenCalledWith(
      'tn-001',
      expect.objectContaining({
        notes: 'Updated workspace note',
      })
    );
    expect(component.tender()?.workspace.notes).toBe('Updated workspace note');
    expect(component.checklist[0]?.status).toBe('done');
  });

  it('navigates back to the radar page', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.backToRadar();

    expect(navigateSpy).toHaveBeenCalledWith(['/tenders']);
  });
});
