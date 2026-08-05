import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { pageSeoMetadata } from '../../core/seo/seo.config';
import { SaridibekDialogService } from './saridibek-dialog/saridibek-dialog.service';
import { SorukluSurnameComponent } from './soruklu-surname.component';

describe('SorukluSurnameComponent', () => {
  beforeEach(async () => {
    globalThis.sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SorukluSurnameComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders one evidence-led English page by default', () => {
    const fixture = TestBed.createComponent(SorukluSurnameComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(nativeElement.querySelectorAll('h1')).toHaveLength(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('What does Soruklu mean?');
    expect(nativeElement.querySelector('.surname-formation__equation')?.textContent).toBe(
      'Soruk+-lu→Soruklu',
    );
    expect(text).toContain('c. 1520');
    expect(text).toContain('1576');
    expect(text).toContain('1648');
    expect(text).toContain('1786–87');
    expect(text).toContain('1959');
    expect(text).toContain('1974');
    expect(text).toContain('What we know in 30 seconds');
    expect(text).toContain('Direct modern descent remains unproven.');
    expect(text).toContain(
      'The Soruk place name and the Soruklu identifier appear in records across centuries.',
    );
    expect(text).toContain('A historical explanation survives—but its date does not.');
    expect(text).toContain('Two Soruk locations; one regional research corridor.');
    expect(text).toContain('The living footprint of a rare surname');
    expect(text).toContain('approximately 500 living people may carry the Soruklu surname today');
    expect(text).toContain('served as muhtar of Tekmen village in Osmancık');
    expect(text).toContain('Working estimate · low confidence');
    expect(text).toContain('may be in the low thousands');
    expect(text).toContain('The surname and the Soruklu Order are separate subjects.');
    expect(text).toContain('Vezirkopru Saridibek Village');
    expect(text).toContain('File date');
    expect(text).toContain('Year');
    expect(text).toContain('Research lead · not verified');
    expect(text).toContain('The evidence has a clear boundary.');
    expect(text).not.toMatch(/has a coat of arms|is a noble|is a dynasty|are direct descendants/i);
    expect(text).not.toMatch(/current muhtar|mayor/i);
    expect(nativeElement.querySelector('[src*="soruklu-order"]')).toBeNull();
  });

  it('switches the complete visible page and metadata to Turkish without navigation', () => {
    const fixture = TestBed.createComponent(SorukluSurnameComponent);
    const document = TestBed.inject(DOCUMENT);
    const title = TestBed.inject(Title);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[data-testid="surname-language-switch"]',
    );
    button?.click();
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe(
      'Soruklu ne anlama geliyor?',
    );
    expect(nativeElement.textContent).toContain('Kanıt değerlendirmesi');
    expect(nativeElement.textContent).toContain('30 saniyede bildiklerimiz');
    expect(nativeElement.textContent).toContain(
      'Soruk yer adı ve Soruklu kişi tanımı, yüzyıllara yayılan kayıtlarda görülür.',
    );
    expect(nativeElement.textContent).toContain(
      'İki Soruk yeri; tek bir bölgesel araştırma hattı.',
    );
    expect(nativeElement.textContent).toContain('Nadir bir soyadının yaşayan izi');
    expect(nativeElement.textContent).toContain(
      'Osmancık’ın Tekmen köyünde muhtarlık yapmış olan Servet Köroğlu',
    );
    expect(nativeElement.textContent).toContain('Çalışma tahmini · düşük güven');
    expect(nativeElement.textContent).toContain('birkaç bin düzeyinde olabileceğini');
    expect(nativeElement.textContent).toContain('Soyadı ile Soruklu Order ayrı konulardır.');
    expect(nativeElement.textContent).toContain('Vezirköprü Sarıdibek Köyü');
    expect(nativeElement.textContent).toContain('Dosyada belirtilen tarih');
    expect(nativeElement.textContent).toContain('Kanıtlanmamış noktalar');
    expect(nativeElement.textContent).not.toMatch(/güncel muhtar|belediye başkanı/i);
    expect(button?.textContent).toContain('Read in English');
    expect(title.getTitle()).toBe('Soruklu Soyadı: Anlamı ve Kökeni | Serhat Soruklu');
    expect(document.documentElement.lang).toBe('tr-TR');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('tr');
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'tr_TR',
    );

    button?.click();
    fixture.detectChanges();

    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('What does Soruklu mean?');
    expect(nativeElement.textContent).toContain('What we know in 30 seconds');
    expect(nativeElement.textContent).not.toContain('30 saniyede bildiklerimiz');
    expect(button?.textContent).toContain('Türkçe oku');
    expect(title.getTitle()).toBe(pageSeoMetadata.sorukluSurname.title);
    expect(document.documentElement.lang).toBe('en-GB');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('en');
  });

  it('uses safe external citations and clear internal cross-links', () => {
    const fixture = TestBed.createComponent(SorukluSurnameComponent);
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;
    const sourceTitles = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.surname-sources__title-link'),
    );
    const sourceActions = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.surname-sources__action'),
    );
    const sources = [...sourceTitles, ...sourceActions];
    const orderLinks = nativeElement.querySelectorAll<HTMLAnchorElement>(
      'a[href="/soruklu-order"]',
    );

    expect(sourceTitles).toHaveLength(14);
    expect(sourceActions).toHaveLength(14);
    expect(sources).toHaveLength(28);
    expect(sources.every((link) => link.target === '_blank')).toBe(true);
    expect(sources.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
    expect(sourceTitles.map((link) => link.href)).toEqual(sourceActions.map((link) => link.href));
    expect(sourceTitles[9]?.href).toBe(
      'https://www.corumozelidare.gov.tr/kurumlar/corumozelidare.gov.tr/GENEL-HABERLER/2025/CORUM-IL-OZEL-IDARESI-2024-YILI-FAALIYET-RAPORU.pdf',
    );
    expect(sourceTitles[13]?.href).toBe(
      'https://www.osmancik.gov.tr/arastirmaci-yazar-salim-savci-ve-tekmen-koyu-muhtari-servet-koroglu-sayin-kaymakamimizi-ziyaret-etti',
    );
    expect(orderLinks).toHaveLength(2);
    expect(nativeElement.querySelector('a[href="/"]')).not.toBeNull();
  });

  it('renders an optimized lazy photograph and opens its accessible dialog', () => {
    const dialog = TestBed.inject(SaridibekDialogService);
    const openSpy = vi.spyOn(dialog, 'open').mockResolvedValue();
    const fixture = TestBed.createComponent(SorukluSurnameComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const trigger = nativeElement.querySelector<HTMLButtonElement>(
      '[data-testid="saridibek-photo-trigger"]',
    );
    const image = nativeElement.querySelector<HTMLImageElement>('.surname-place-feature img');
    const avif = nativeElement.querySelector<HTMLSourceElement>(
      '.surname-place-feature source[type="image/avif"]',
    );

    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.width).toBe(1448);
    expect(image?.height).toBe(1086);
    expect(avif?.srcset).toContain('vezirkopru-saridibek-koyu-720.avif');

    trigger?.click();
    expect(openSpy).toHaveBeenCalledOnce();
  });

  it('uses the canonical English route metadata on first render', () => {
    const fixture = TestBed.createComponent(SorukluSurnameComponent);
    const title = TestBed.inject(Title);
    const document = TestBed.inject(DOCUMENT);
    fixture.detectChanges();

    expect(title.getTitle()).toBe(pageSeoMetadata.sorukluSurname.title);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://serhatsoruklu.com/soruklu-surname',
    );
    expect(document.documentElement.lang).toBe('en-GB');
  });
});
