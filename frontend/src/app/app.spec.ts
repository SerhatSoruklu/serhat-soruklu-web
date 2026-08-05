import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('main')).toHaveLength(1);
  });

  it('tracks home and detail atmosphere route state', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(app.isHomeRoute()).toBe(true);
    expect(app.usesDetailAtmosphere()).toBe(false);

    await router.navigateByUrl('/work?from=test#top');
    fixture.detectChanges();
    expect(app.isHomeRoute()).toBe(false);
    expect(app.usesDetailAtmosphere()).toBe(true);
    expect(app.usesSystemsAtmosphere()).toBe(false);

    await router.navigateByUrl('/systems');
    fixture.detectChanges();
    expect(app.isHomeRoute()).toBe(false);
    expect(app.usesDetailAtmosphere()).toBe(false);
    expect(app.usesSystemsAtmosphere()).toBe(true);
    expect(app.usesContactAtmosphere()).toBe(false);

    await router.navigateByUrl('/systems/continuity-identity-model');
    fixture.detectChanges();
    expect(app.usesDetailAtmosphere()).toBe(true);
    expect(app.usesSystemsAtmosphere()).toBe(false);
    expect(app.usesContactAtmosphere()).toBe(false);

    await router.navigateByUrl('/contact');
    fixture.detectChanges();
    expect(app.usesDetailAtmosphere()).toBe(false);
    expect(app.usesSystemsAtmosphere()).toBe(false);
    expect(app.usesContactAtmosphere()).toBe(true);
    expect(app.usesOrderAtmosphere()).toBe(false);
    expect(app.usesSurnameAtmosphere()).toBe(false);
    expect(app.usesVelariAtmosphere()).toBe(false);

    await router.navigateByUrl('/soruklu-surname?from=test#meaning');
    fixture.detectChanges();
    expect(app.usesContactAtmosphere()).toBe(false);
    expect(app.usesOrderAtmosphere()).toBe(false);
    expect(app.usesSurnameAtmosphere()).toBe(true);
    expect(app.usesVelariAtmosphere()).toBe(false);

    await router.navigateByUrl('/soruklu-order?from=test#the-order');
    fixture.detectChanges();
    expect(app.usesContactAtmosphere()).toBe(false);
    expect(app.usesOrderAtmosphere()).toBe(true);
    expect(app.usesSurnameAtmosphere()).toBe(false);
    expect(app.usesVelariAtmosphere()).toBe(false);

    await router.navigateByUrl('/velari?from=test#velari-framework');
    fixture.detectChanges();
    expect(app.usesOrderAtmosphere()).toBe(false);
    expect(app.usesSurnameAtmosphere()).toBe(false);
    expect(app.usesVelariAtmosphere()).toBe(true);
  });
});
