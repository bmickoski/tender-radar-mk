import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the TenderRadar MK title in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('TenderRadar MK');
  });

  it('should render the tender radar navigation link', () => {
    const navLinks = fixture.debugElement.queryAll(By.css('nav a'));
    expect(navLinks.length).toBeGreaterThan(0);
    expect(navLinks[0].nativeElement.textContent).toContain('Tender Radar');
    expect(navLinks[0].nativeElement.getAttribute('routerLink')).toBe('/tenders');
  });

  it('should render the TenderRadar footer copy', () => {
    const footer = fixture.nativeElement.querySelector('.app-footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toContain(
      'Tender discovery, manual import, change tracking'
    );
    expect(footer?.textContent).toContain('Nx Angular + Express MVP');
  });

  it('should have a router outlet for routed pages', () => {
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should apply OnPush change detection', () => {
    const metadata = (App as unknown as { ɵcmp: { onPush: boolean } }).ɵcmp;
    expect(metadata.onPush).toBeTruthy();
  });
});
