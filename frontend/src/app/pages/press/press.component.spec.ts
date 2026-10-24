import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ThemeService } from '../../core/theme/theme.service';
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
      'Reference facts, biographies, images and background material for journalists, researchers and media enquiries.',
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

    expect(facts).toHaveLength(4);
    const factDefinitions = Array.from(
      nativeElement.querySelectorAll<HTMLDListElement>('.press-fact-sheet__facts > dl'),
    );
    expect(factDefinitions).toHaveLength(32);
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

  it('publishes the approved Stervox reference facts without addresses or claims of live regulated services', () => {
    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelectorAll('.press-fact-sheet')[2];
    const text = card.textContent?.replace(/\s+/g, ' ') ?? '';
    const fields = Array.from(card.querySelectorAll('dt')).map(field => field.textContent?.trim());
    expect(card.querySelector('h3')?.textContent).toBe('STERVOX');
    expect(fields).toEqual(['Name', 'Legal entity', 'Company number', 'Incorporated', 'Country', 'Founder', 'Status', 'Focus', 'Website']);
    expect(fields.length).toBe((fixture.nativeElement as HTMLElement).querySelectorAll('.press-fact-sheet')[1].querySelectorAll('dt').length);
    for (const value of ['STERVOX LIMITED', '17514320', '12 October 2026', 'Serhat Soruklu', 'Pre launch · Architecture and foundation development', 'Financial technology, open finance and financial infrastructure']) {
      expect(text).toContain(value);
    }
    expect(card.querySelector('a')?.getAttribute('href')).toBe('https://stervox.com');
    expect(text).not.toMatch(/registered office|postal address|street address|postcode|Thredd|Enfuce|Paynetics|Marqeta|TransactPay|Modulr|Visa|Mastercard|cryptocurrency|blockchain|DeFi|Web3|token system|authorised financial institution|is a bank/i);
  });

  it('places the Stervox overview after Coupyn with internal and official-site actions', () => {
    const fixture = TestBed.createComponent(PressComponent);
    fixture.detectChanges();
    const native = fixture.nativeElement as HTMLElement;
    const coupyn = native.querySelector('.press-coupyn-overview')!;
    const stervox = native.querySelector('.press-stervox-overview')!;
    expect(coupyn.nextElementSibling).toBe(stervox);
    expect(stervox.textContent).toContain('pre-launch financial technology company');
    expect(stervox.textContent).toContain('planned capabilities rather than live services');
    expect(stervox.querySelector('a[href="/systems/stervox"]')?.hasAttribute('target')).toBe(false);
    expect(stervox.querySelector('a[href="https://stervox.com/"]')?.getAttribute('target')).toBe('_blank');
    const references = Array.from(native.querySelectorAll<HTMLAnchorElement>('.press-verification-list a'));
    expect(references[1].href).toBe('https://find-and-update.company-information.service.gov.uk/company/17514320');
    expect(references[1].textContent).toContain('STERVOX LIMITED');
    expect(references[6].href).toBe('https://stervox.com/');
    expect(references[7].href).toBe('https://codaris.org/');
  });

  it('uses the canonical local photography and Coupyn and CODARIS media assets with explicit metadata', () => {
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
    const codarisPreview = nativeElement.querySelector<HTMLImageElement>(
      '.press-codaris-asset .press-coupyn-asset__preview img',
    );
    const formatLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.press-format-list a'),
    );

    expect(images).toHaveLength(3);
    expect(imageSources).toEqual([
      '/assets/portraits/serhat-soruklu-real-selfie-1022.webp',
      '/assets/portraits/serhat-soruklu-office-light-1846.webp',
      '/assets/portraits/serhat-soruklu-office-dark-1846.webp',
    ]);
    expect(
      images.map((image) => [image.getAttribute('width'), image.getAttribute('height')]),
    ).toEqual([
      ['1022', '1533'],
      ['1846', '852'],
      ['1846', '852'],
    ]);
    expect(downloadLinks.map((link) => link.getAttribute('download'))).toEqual([
      'serhat-soruklu-real-selfie.png',
      'serhat-soruklu-office-light-native.png',
      'serhat-soruklu-office-light-8k.png',
      'serhat-soruklu-office-dark-native.png',
      'serhat-soruklu-office-dark-8k.png',
    ]);
    expect(fullResolutionLinks.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Open full resolution ↗ — Original selfie, opens in a new tab',
      'Open full resolution ↗ — Founder workstation visual — light, opens in a new tab',
      'Open full resolution ↗ — Founder workstation visual — dark, opens in a new tab',
    ]);
    expect(nativeElement.textContent).toContain('AI-ASSISTED PHOTOGRAPH');
    expect(nativeElement.textContent).toContain(
      'AI-assisted office composite, created on 24 October 2026 with OpenAI image generation using Serhat’s original selfie and real workspace. Native output: 1846 × 852; not an unaltered photograph.',
    );
    expect(nativeElement.textContent).not.toContain('gpt-image 2.0');
    expect(nativeElement.textContent).not.toContain('gpt-image 2.5');
    expect(nativeElement.textContent?.replace(/\s+/g, ' ')).toContain(
      'The original selfie is an unedited photograph.',
    );
    expect(nativeElement.textContent?.replace(/\s+/g, ' ')).toContain(
      'are enlarged exports and add no native detail.',
    );
    expect(nativeElement.querySelectorAll('.press-asset-card picture source[type="image/avif"]')).toHaveLength(3);
    expect(fullResolutionLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/assets/portraits/serhat-soruklu-real-selfie.png',
      '/assets/portraits/serhat-soruklu-office-light-native.png',
      '/assets/portraits/serhat-soruklu-office-dark-native.png',
    ]);
    expect(coupynPreview?.getAttribute('src')).toBe(
      '/assets/social/serhat-soruklu-systems-coupyn-og.png',
    );
    expect(coupynPreview?.getAttribute('width')).toBe('1200');
    expect(coupynPreview?.getAttribute('height')).toBe('630');
    expect(codarisPreview?.getAttribute('src')).toBe('/assets/social/serhat-soruklu-systems-codaris-og.png');
    expect(codarisPreview?.getAttribute('width')).toBe('1200');
    expect(codarisPreview?.getAttribute('height')).toBe('630');
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

    expect(systems).toHaveLength(6);
    expect(sourceNames).toEqual([
      'Companies House',
      'Companies House',
      'GitHub',
      'ORCID',
      'LinkedIn',
      'Coupyn',
      'Stervox',
      'CODARIS',
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

  it('switches system artwork and its downloads with the theme while preserving dark assets', () => {
    const fixture = TestBed.createComponent(PressComponent);
    const theme = TestBed.inject(ThemeService);
    theme.setTheme('dark');
    fixture.detectChanges();
    const native = fixture.nativeElement as HTMLElement;
    const previewPaths = () => Array.from(native.querySelectorAll('.press-coupyn-asset__preview img'))
      .map(image => image.getAttribute('src'));
    const darkPaths = previewPaths();
    expect(darkPaths).toHaveLength(3);
    theme.setTheme('light');
    fixture.detectChanges();
    expect(previewPaths()).toEqual(darkPaths.map(path => path?.replace('.png', '-light.png')));
    const downloads = Array.from(native.querySelectorAll<HTMLAnchorElement>('.press-coupyn-asset .press-format-list a'));
    expect(downloads).toHaveLength(9);
    expect(downloads.every(link => /-light\.(png|svg)$/.test(link.getAttribute('href') ?? ''))).toBe(true);
    expect(downloads.filter(link => link.hasAttribute('download')).every(link => /-light\.(png|svg)$/.test(link.download))).toBe(true);
    theme.setTheme('dark');
    fixture.detectChanges();
    expect(previewPaths()).toEqual(darkPaths);
  });
});
