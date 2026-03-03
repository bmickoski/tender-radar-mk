import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tender } from '@org/models';
import { TenderCardComponent } from './tender-card.component';

describe('TenderCardComponent', () => {
  let fixture: ComponentFixture<TenderCardComponent>;

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
      notes: '',
      checklist: [],
      documents: [],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenderCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TenderCardComponent);
    fixture.componentRef.setInput('tender', tender);
    fixture.detectChanges();
  });

  it('renders the tender overview details', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Managed Network and Endpoint Support for Municipal Schools');
    expect(host.textContent).toContain('Framework agreement for school infrastructure support.');
    expect(host.textContent).toContain('Fit for SME MSP teams.');
  });

  it('emits the selected tender on click', () => {
    const selectedSpy = vi.fn();

    fixture.componentInstance.tenderClick.subscribe(selectedSpy);
    (fixture.nativeElement as HTMLElement).click();

    expect(selectedSpy).toHaveBeenCalledWith(tender);
  });
});
