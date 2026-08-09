import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { IdentityLanguageService } from '../../../core/identity/identity-language.service';
import { AboutProfileDialogComponent } from './about-profile-dialog.component';

describe('AboutProfileDialogComponent', () => {
  const identityLanguageCookie = 'serhatsoruklu-identity-language';
  const dialogRef = { close: vi.fn() };

  beforeEach(async () => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.document.cookie = `${identityLanguageCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
    dialogRef.close.mockClear();

    await TestBed.configureTestingModule({
      imports: [AboutProfileDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();
  });

  afterEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.document.cookie = `${identityLanguageCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
  });

  it('renders the full portrait and grounded English profile details', () => {
    const fixture = TestBed.createComponent(AboutProfileDialogComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const dialog = nativeElement.querySelector<HTMLElement>('[data-testid="about-profile-dialog"]');
    const image = nativeElement.querySelector<HTMLImageElement>(
      '[data-testid="about-profile-dialog-image"]',
    );

    expect(dialog?.getAttribute('lang')).toBe('en-GB');
    expect(nativeElement.querySelector('h2')?.textContent?.trim()).toBe('Serhat Soruklu');
    expect(nativeElement.textContent).toContain('Founder and CEO of Coupyn');
    expect(nativeElement.textContent).toContain('Osmancık, Çorum, Turkey');
    expect(image?.getAttribute('src')).toBe(
      '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
    );
    expect(image?.width).toBe(1173);
    expect(image?.height).toBe(1341);
    expect(image?.alt).toBe('Portrait of Serhat Soruklu, founder and CEO of Coupyn.');
  });

  it('updates the dialog language and accessible close label immediately', () => {
    const language = TestBed.inject(IdentityLanguageService);
    const fixture = TestBed.createComponent(AboutProfileDialogComponent);
    fixture.detectChanges();

    language.setLanguage('tr');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(
      nativeElement
        .querySelector<HTMLElement>('[data-testid="about-profile-dialog"]')
        ?.getAttribute('lang'),
    ).toBe('tr-TR');
    expect(nativeElement.textContent).toContain("Londra'da yaşayan Coupyn kurucusu ve CEO'su");
    expect(nativeElement.textContent).toContain('Yaşadığı yer');
    expect(nativeElement.querySelector('button')?.getAttribute('aria-label')).toBe(
      'Serhat Soruklu profil penceresini kapat',
    );
  });

  it('links to Coupyn safely', () => {
    const fixture = TestBed.createComponent(AboutProfileDialogComponent);
    fixture.detectChanges();

    const action = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      '.about-profile-dialog__action',
    );

    expect(action?.href).toBe('https://coupyn.com/');
    expect(action?.target).toBe('_blank');
    expect(action?.rel).toBe('noopener noreferrer');
    expect(action?.getAttribute('aria-label')).toBe('Open Coupyn in a new tab');
  });

  it('closes through the visible close control', () => {
    const fixture = TestBed.createComponent(AboutProfileDialogComponent);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();

    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
