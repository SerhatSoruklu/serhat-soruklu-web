import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HEADER_IDENTITY_ITEMS, HEADER_NAV_ITEMS } from '../../layout/site-header/header-icons';
import { PressComponent } from './press.component';

describe('PressComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PressComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the English editorial dossier with one heading and no nested main landmark', () => {
    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(nativeElement.querySelector('.press-page')?.getAttribute('lang')).toBe('en-GB');
    expect(nativeElement.querySelectorAll('main')).toHaveLength(0);
    expect(nativeElement.querySelectorAll('h1')).toHaveLength(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Serhat Soruklu & Coupyn');
    expect(text).toContain(
      'Verified facts, biographies, images and background material for journalists, researchers and media enquiries.',
    );
    expect(text).toContain('first-party reference material');
    expect(text).not.toMatch(/\bSly\b/i);
    expect(text).not.toContain('Press coverage');
    expect(nativeElement.querySelector('[data-testid="about-language-switch"]')).toBeNull();
  });

  it('keeps the press route English at document level and restores the global default on destroy', () => {
    const document = TestBed.inject(DOCUMENT);
    document.documentElement.lang = 'tr-TR';

    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();

    expect(document.documentElement.lang).toBe('en-GB');

    fixture.destroy();

    expect(document.documentElement.lang).toBe('en');
  });

  it('renders semantic fact sheets and both approved first-party biographies', () => {
    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const facts = nativeElement.querySelectorAll('.press-fact-sheet');
    const biographies = nativeElement.querySelectorAll('.press-bio-card');
    const text = nativeElement.textContent?.replace(/\s+/g, ' ') ?? '';
    const aboutLinks = Array.from(nativeElement.querySelectorAll<HTMLAnchorElement>('a')).filter(
      (link) => link.getAttribute('href') === '/about',
    );
    const contactLinks = Array.from(nativeElement.querySelectorAll<HTMLAnchorElement>('a')).filter(
      (link) => link.getAttribute('href') === '/contact',
    );

    expect(facts).toHaveLength(2);
    const factDefinitions = Array.from(
      nativeElement.querySelectorAll<HTMLDListElement>('.press-fact-sheet__facts > dl'),
    );
    expect(factDefinitions).toHaveLength(17);
    expect(
      factDefinitions.every(
        (definition) =>
          definition.children.item(0)?.tagName === 'DT' &&
          definition.children.item(1)?.tagName === 'DD',
      ),
    ).toBe(true);
    expect(text).toContain('Osmancık, Çorum, Turkey');
    expect(text).toContain('Coupyn Ltd');
    expect(text).toContain('Company number 16939840');
    expect(text).toContain('Roughly 1 million company pages');
    expect(biographies).toHaveLength(2);
    expect(text).toContain('50-WORD BIO');
    expect(text).toContain('100-WORD BIO');
    expect(aboutLinks.length).toBeGreaterThanOrEqual(2);
    expect(contactLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('uses the canonical local photography and Coupyn media assets with explicit metadata', () => {
    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const images = Array.from(
      nativeElement.querySelectorAll<HTMLImageElement>('.press-asset-card img'),
    );
    const imageSources = images.map((image) => image.getAttribute('src'));
    const downloadLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.press-asset-card a[download]'),
    );
    const fullResolutionLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>(
        '.press-asset-card__actions a[target="_blank"]',
      ),
    );
    const coupynPreview = nativeElement.querySelector<HTMLImageElement>(
      '.press-coupyn-asset__preview img',
    );
    const formatLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.press-format-list a'),
    );

    expect(images).toHaveLength(3);
    expect(imageSources).toEqual([
      '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
      '/assets/home/serhat-soruklu-founder-light.png',
      '/assets/home/serhat-soruklu-founder-dark.png',
    ]);
    expect(
      images.map((image) => [image.getAttribute('width'), image.getAttribute('height')]),
    ).toEqual([
      ['1173', '1341'],
      ['1448', '1086'],
      ['1448', '1086'],
    ]);
    expect(downloadLinks.map((link) => link.getAttribute('download'))).toEqual([
      'serhat-soruklu-ceo-founder-of-coupyn.png',
      'serhat-soruklu-founder-light.png',
      'serhat-soruklu-founder-dark.png',
    ]);
    expect(fullResolutionLinks.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Open full resolution ↗ — Portrait, opens in a new tab',
      'Open full resolution ↗ — Founder workstation visual — light, opens in a new tab',
      'Open full resolution ↗ — Founder workstation visual — dark, opens in a new tab',
    ]);
    expect(nativeElement.textContent).toContain('AI-ASSISTED PHOTOGRAPH');
    expect(nativeElement.textContent).toContain(
      'The person shown is Serhat Soruklu. Only his face was regenerated from his supplied portrait reference; the underlying body, workstation and background are real.',
    );
    expect(nativeElement.textContent).toContain(
      'Embedded Content Credentials identify trained algorithmic media created with gpt-image 2.0.',
    );
    expect(nativeElement.textContent).toContain(
      'The workstation images are AI-assisted edited photographs of Serhat Soruklu.',
    );
    expect(coupynPreview?.getAttribute('src')).toBe(
      '/assets/social/serhat-soruklu-systems-coupyn-og.png',
    );
    expect(coupynPreview?.getAttribute('width')).toBe('1200');
    expect(coupynPreview?.getAttribute('height')).toBe('630');
    expect(formatLinks.some((link) => link.href.endsWith('.png'))).toBe(true);
    expect(formatLinks.some((link) => link.href.endsWith('.svg'))).toBe(true);
  });

  it('renders selected systems and safe, accurately classified verification links', () => {
    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const systems = nativeElement.querySelectorAll('.press-system-card');
    const verificationLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.press-verification-list a'),
    );
    const sourceNames = verificationLinks.map((link) =>
      link.querySelector('strong')?.textContent?.trim(),
    );
    const companiesHouse = verificationLinks.find(
      (link) => link.querySelector('strong')?.textContent?.trim() === 'Companies House',
    );

    expect(systems).toHaveLength(4);
    expect(sourceNames).toEqual([
      'Companies House',
      'GitHub',
      'ORCID',
      'LinkedIn',
      'Coupyn',
      'SerhatSoruklu.com',
    ]);
    expect(companiesHouse?.href).toBe(
      'https://find-and-update.company-information.service.gov.uk/company/16939840',
    );
    expect(verificationLinks.every((link) => link.target === '_blank')).toBe(true);
    expect(verificationLinks.every((link) => link.rel.includes('noopener'))).toBe(true);
    expect(verificationLinks.every((link) => !link.hasAttribute('aria-label'))).toBe(true);
    expect(
      verificationLinks.every((link) => {
        const indicator = link.querySelector('.press-verification-list__arrow');

        return (
          indicator?.getAttribute('role') === 'img' &&
          indicator.getAttribute('aria-label') === '↗ — opens in a new tab'
        );
      }),
    ).toBe(true);
    expect(verificationLinks.find((link) => link.textContent?.includes('GitHub'))?.rel).toContain(
      'me',
    );
    expect(verificationLinks.find((link) => link.textContent?.includes('ORCID'))?.rel).toContain(
      'me',
    );
    expect(verificationLinks.find((link) => link.textContent?.includes('LinkedIn'))?.rel).toContain(
      'me',
    );
  });

  it('keeps Press out of both primary and Identity header navigation groups', () => {
    expect(
      [...HEADER_NAV_ITEMS, ...HEADER_IDENTITY_ITEMS].some((item) => item.path === '/press'),
    ).toBe(false);
  });
});
