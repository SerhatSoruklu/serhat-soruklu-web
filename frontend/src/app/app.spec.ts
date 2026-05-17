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

    await router.navigateByUrl('/systems/continuity-identity-model');
    fixture.detectChanges();
    expect(app.usesDetailAtmosphere()).toBe(true);
    expect(app.usesSystemsAtmosphere()).toBe(false);
  });
});
