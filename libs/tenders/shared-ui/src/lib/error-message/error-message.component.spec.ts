import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
  });

  it('renders the provided title and message', () => {
    fixture.componentRef.setInput('title', 'Tender feed unavailable');
    fixture.componentRef.setInput('message', 'Using local demo data because the API is unavailable.');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Tender feed unavailable');
    expect(host.textContent).toContain('Using local demo data because the API is unavailable.');
  });

  it('emits retry when the action button is clicked', () => {
    const retrySpy = vi.fn();

    fixture.componentInstance.retry.subscribe(retrySpy);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();

    expect(retrySpy).toHaveBeenCalledTimes(1);
  });
});
