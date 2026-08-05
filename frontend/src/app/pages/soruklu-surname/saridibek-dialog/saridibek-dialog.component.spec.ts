import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';

import { SorukluSurnameLanguageService } from '../soruklu-surname-language.service';
import { SaridibekDialogComponent } from './saridibek-dialog.component';

describe('SaridibekDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [SaridibekDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();
  });

  it('renders the optimized photograph and English record details', () => {
    const fixture = TestBed.createComponent(SaridibekDialogComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const dialog = nativeElement.querySelector<HTMLElement>('[data-testid="saridibek-dialog"]');
    const image = nativeElement.querySelector<HTMLImageElement>('img');
    const avif = nativeElement.querySelector<HTMLSourceElement>('source[type="image/avif"]');

    expect(dialog?.getAttribute('lang')).toBe('en-GB');
    expect(nativeElement.querySelector('h2')?.textContent?.trim()).toBe(
      'Vezirkopru Saridibek Village',
    );
    expect(nativeElement.textContent).toContain('File date');
    expect(nativeElement.textContent).toContain('13 November 2019');
    expect(nativeElement.textContent).toContain('Türkiye');
    expect(image?.width).toBe(1448);
    expect(image?.height).toBe(1086);
    expect(avif?.srcset).toContain('vezirkopru-saridibek-koyu-1200.avif');
  });

  it('reacts immediately when the surname page language changes', () => {
    const languageState = TestBed.inject(SorukluSurnameLanguageService);
    const fixture = TestBed.createComponent(SaridibekDialogComponent);
    fixture.detectChanges();

    languageState.language.set('tr');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const dialog = nativeElement.querySelector<HTMLElement>('[data-testid="saridibek-dialog"]');
    expect(dialog?.getAttribute('lang')).toBe('tr-TR');
    expect(nativeElement.querySelector('h2')?.textContent?.trim()).toBe(
      'Vezirköprü Sarıdibek Köyü',
    );
    expect(nativeElement.textContent).toContain('Dosyada belirtilen tarih');
    expect(nativeElement.textContent).toContain('13 Kasım 2019');
    expect(nativeElement.textContent).toContain('Tarihî bağlam');
    expect(nativeElement.querySelector('button')?.getAttribute('aria-label')).toBe(
      'Sarıdibek fotoğraf penceresini kapat',
    );
  });

  it('uses the same close interaction as the profile dialog', () => {
    const fixture = TestBed.createComponent(SaridibekDialogComponent);
    fixture.detectChanges();
    const iconRegistry = TestBed.inject(MatIconRegistry);

    expect(iconRegistry.getNamedSvgIcon('place-close')).toBeTruthy();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
