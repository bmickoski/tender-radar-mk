import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StageBadgeComponent } from './stage-badge.component';

describe('StageBadgeComponent', () => {
  let fixture: ComponentFixture<StageBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StageBadgeComponent);
  });

  it('renders the default stage label and class', () => {
    fixture.componentRef.setInput('stage', 'closing-soon');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent?.trim()).toBe('Closing Soon');
    expect(host.className).toContain('tr-stage');
    expect(host.className).toContain('tr-stage-closing-soon');
  });

  it('allows overriding the badge text', () => {
    fixture.componentRef.setInput('stage', 'changed');
    fixture.componentRef.setInput('text', 'Updated');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe(
      'Updated'
    );
  });
});
