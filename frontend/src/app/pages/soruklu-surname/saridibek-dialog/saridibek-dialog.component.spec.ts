import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';

import { evliyaDocumentDialogData } from '../evliya-document.content';
import { kamusDictionaryDialogData } from '../kamus-dictionary.content';
import { SorukluSurnameLanguageService } from '../soruklu-surname-language.service';
import { SaridibekDialogComponent } from './saridibek-dialog.component';

describe('SaridibekDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [SaridibekDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
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

  it('renders a supplied historical document without duplicating the dialog system', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: evliyaDocumentDialogData });
    const fixture = TestBed.createComponent(SaridibekDialogComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const dialog = nativeElement.querySelector<HTMLElement>('[data-testid="saridibek-dialog"]');
    const image = nativeElement.querySelector<HTMLImageElement>('img');

    expect(dialog?.classList.contains('saridibek-dialog--document')).toBe(true);
    expect(nativeElement.querySelector('h2')?.textContent?.trim()).toBe(
      'Soruk in the Ottoman-script Seyahatname',
    );
    expect(nativeElement.textContent).toContain('printed page 402');
    expect(nativeElement.textContent).toContain('does not date Soruk Bey');
    expect(image?.width).toBe(2158);
    expect(image?.height).toBe(3432);
  });

  it('renders the supplied dictionary facsimile with a safe source link', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: kamusDictionaryDialogData });
    const fixture = TestBed.createComponent(SaridibekDialogComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const dialog = nativeElement.querySelector<HTMLElement>('[data-testid="saridibek-dialog"]');
    const image = nativeElement.querySelector<HTMLImageElement>('img');
    const sourceLink = nativeElement.querySelector<HTMLAnchorElement>('.saridibek-dialog__source');

    expect(dialog?.classList.contains('saridibek-dialog--dictionary')).toBe(true);
    expect(nativeElement.querySelector('h2')?.textContent?.trim()).toBe(
      'Kâmûs-ı Türkî: the historical word soruk',
    );
    expect(nativeElement.textContent).toContain('does not establish that this meaning produced');
    expect(image?.width).toBe(1536);
    expect(image?.height).toBe(1024);
    expect(nativeElement.querySelector('source')).toBeNull();
    expect(sourceLink?.href).toBe(
      'https://www.osmanlicasozlukler.com/kamusiturki/tafsil-262580-cv2.html',
    );
    expect(sourceLink?.target).toBe('_blank');
    expect(sourceLink?.rel).toBe('noopener noreferrer');
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
