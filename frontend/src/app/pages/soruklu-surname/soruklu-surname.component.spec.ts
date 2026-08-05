import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { pageSeoMetadata } from '../../core/seo/seo.config';
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
    expect(text).toContain('1974');
    expect(text).toContain('A named tradition, not proven ancestry.');
    expect(text).toContain('The evidence has a clear boundary.');
    expect(text).not.toMatch(/has a coat of arms|is a noble|is a dynasty|are direct descendants/i);
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
    expect(nativeElement.textContent).toContain('Kayıtların gösterdiği');
    expect(nativeElement.textContent).toContain('Kanıtlanmamış noktalar');
    expect(button?.textContent).toContain('Read in English');
    expect(title.getTitle()).toBe('Soruklu Soyadı: Anlamı ve Kökeni | Serhat Soruklu');
    expect(document.documentElement.lang).toBe('tr-TR');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('tr');
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'tr_TR',
    );
  });

  it('uses safe external citations and clear internal cross-links', () => {
    const fixture = TestBed.createComponent(SorukluSurnameComponent);
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;
    const sources = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.surname-sources a'),
    );
    const orderLinks = nativeElement.querySelectorAll<HTMLAnchorElement>(
      'a[href="/soruklu-order"]',
    );

    expect(sources).toHaveLength(5);
    expect(sources.every((link) => link.target === '_blank')).toBe(true);
    expect(sources.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
    expect(orderLinks).toHaveLength(2);
    expect(nativeElement.querySelector('a[href="/"]')).not.toBeNull();
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
