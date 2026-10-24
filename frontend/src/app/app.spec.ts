import { ViewportScroller } from '@angular/common';
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

  it('keeps routed anchors clear of the fixed header', () => {
    const viewportScroller = TestBed.inject(ViewportScroller);
    const setOffsetSpy = vi.spyOn(viewportScroller, 'setOffset');

    TestBed.createComponent(App);

    expect(setOffsetSpy).toHaveBeenCalledWith([0, 120]);
  });

  it('initialises Stervox as a detail page after initial navigation and restores Home on return', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/systems/stervox');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.isHomeRoute()).toBe(false);
    expect(fixture.componentInstance.usesStervoxAtmosphere()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('app-stervox-system')).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-home')).toBeNull();

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.componentInstance.isHomeRoute()).toBe(true);
    expect(fixture.componentInstance.usesStervoxAtmosphere()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('.site-stervox-landscape')).toBeNull();
  });

  it('tracks home and detail atmosphere route state', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(app.isHomeRoute()).toBe(true);
    expect(app.usesDetailAtmosphere()).toBe(false);
    expect(app.usesAboutAtmosphere()).toBe(false);

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
    expect(app.usesPressAtmosphere()).toBe(false);
    expect(app.usesAboutAtmosphere()).toBe(false);
    expect(app.usesOrderAtmosphere()).toBe(false);
    expect(app.usesSurnameAtmosphere()).toBe(false);
    expect(app.usesVelariAtmosphere()).toBe(false);

    await router.navigateByUrl('/press?from=test#founder-photography');
    fixture.detectChanges();
    expect(app.usesContactAtmosphere()).toBe(false);
    expect(app.usesPressAtmosphere()).toBe(true);
    expect(app.usesAboutAtmosphere()).toBe(false);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.site-main')
        ?.classList.contains('site-main--press-atmosphere'),
    ).toBe(true);

    await router.navigateByUrl('/soruklu-surname?from=test#meaning');
    fixture.detectChanges();
    expect(app.usesContactAtmosphere()).toBe(false);
    expect(app.usesPressAtmosphere()).toBe(false);
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

    await router.navigateByUrl('/about?from=test#origins');
    fixture.detectChanges();
    expect(app.usesAboutAtmosphere()).toBe(true);
    expect(app.usesContactAtmosphere()).toBe(false);
    expect(app.usesOrderAtmosphere()).toBe(false);
    expect(app.usesSurnameAtmosphere()).toBe(false);
    expect(app.usesVelariAtmosphere()).toBe(false);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.site-main')
        ?.classList.contains('site-main--about-atmosphere'),
    ).toBe(true);
  });
});
