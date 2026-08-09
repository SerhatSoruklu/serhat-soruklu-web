import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { IdentityLanguageService } from '../../core/identity/identity-language.service';
import { pageSeoMetadata } from '../../core/seo/seo.config';
import { AboutProfileDialogService } from './about-profile-dialog/about-profile-dialog.service';
import { aboutContent } from './about.content';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  const identityLanguageCookie = 'serhatsoruklu-identity-language';

  beforeEach(async () => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.document.cookie = `${identityLanguageCookie}=; Path=/; Max-Age=0; SameSite=Lax`;

    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    globalThis.document.cookie = `${identityLanguageCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
  });

  it('renders the complete documentary profile without a nested main landmark', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ') ?? '';
    const portrait = nativeElement.querySelector<HTMLImageElement>('.about-portrait img');
    const chapterLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.about-chapters a'),
    );
    const factLabels = Array.from(nativeElement.querySelectorAll('.about-hero__facts dt')).map(
      (element) => element.textContent?.trim(),
    );
    const factValues = Array.from(nativeElement.querySelectorAll('.about-hero__facts dd')).map(
      (element) => element.textContent?.trim(),
    );

    expect(nativeElement.querySelector('main')).toBeNull();
    expect(nativeElement.querySelectorAll('h1')).toHaveLength(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Serhat Soruklu');
    expect(text).toContain(
      'Founder & CEO of Coupyn · Systems Architect · Solo Full-Stack Developer',
    );
    expect(text).toContain('Between Osmancık and Tottenham');
    expect(text).toContain('The computer stopped being only a game machine');
    expect(text).toContain('A route outside the standard route');
    expect(text).toContain('Private servers became a practical education');
    expect(text).toContain('roughly one million company pages');
    expect(nativeElement.querySelectorAll('.about-history > li')).toHaveLength(4);
    expect(nativeElement.querySelectorAll('.about-system-card')).toHaveLength(4);
    expect(nativeElement.querySelectorAll('.about-principles > li')).toHaveLength(4);
    expect(factLabels).toEqual(['Born', 'Birthplace', 'Raised in', 'Primary work']);
    expect(factValues).toEqual([
      '22 February 1996',
      'Osmancık, Çorum, Turkey',
      'Tottenham, London',
      'Coupyn',
    ]);
    expect(chapterLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/about#origins',
      '/about#first-computer',
      '/about#education',
      '/about#private-servers',
      '/about#coupyn',
      '/about#systems',
      '/about#principles',
      '/about#public-identity',
    ]);
    expect(portrait?.getAttribute('src')).toBe(
      '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
    );
    expect(portrait?.width).toBe(1173);
    expect(portrait?.height).toBe(1341);
    expect(portrait?.getAttribute('loading')).toBe('eager');
    expect(portrait?.getAttribute('fetchpriority')).toBe('high');
  });

  it('keeps DevBest as brief historical context without publishing the former alias', () => {
    const allContent = JSON.stringify(aboutContent);

    expect(allContent).toContain('Public DevBest activity from around 2016');
    expect(allContent).toContain("Yaklaşık 2016'dan itibaren görülebilen DevBest paylaşımları");
    expect(allContent).not.toMatch(/\bSly\b/i);
  });

  it('opens in the saved shared Identity language', () => {
    globalThis.localStorage.setItem('serhatsoruklu-identity-language', 'tr');

    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.about-page')?.getAttribute('lang')).toBe('tr-TR');
    expect(nativeElement.textContent).toContain('Osmancık ile Tottenham arasında');
    expect(nativeElement.textContent).toContain('Portreyi ve profili aç');
    expect(nativeElement.textContent).not.toContain('Between Osmancık and Tottenham');
  });

  it('reacts immediately to a global Identity language change', () => {
    const language = TestBed.inject(IdentityLanguageService);
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();

    language.setLanguage('tr');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.querySelector('.about-page')?.getAttribute('lang')).toBe('tr-TR');
    expect(nativeElement.textContent).toContain('Aynı ilkeler açık sistemlere taşındı');
    expect(nativeElement.textContent).not.toContain(
      'The same principles moved into public systems',
    );
  });

  it('switches all copy, document metadata, and ProfilePage JSON-LD in place', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const document = TestBed.inject(DOCUMENT);
    const title = TestBed.inject(Title);
    const switchButton = nativeElement.querySelector<HTMLButtonElement>(
      '[data-testid="about-language-switch"]',
    );

    expect(nativeElement.querySelector('.about-page')?.getAttribute('lang')).toBe('en-GB');
    expect(switchButton?.textContent).toContain('Türkçe oku');
    expect(title.getTitle()).toBe(pageSeoMetadata.about.title);

    switchButton?.click();
    fixture.detectChanges();

    const jsonLd = JSON.parse(
      document.querySelector<HTMLScriptElement>('#page-json-ld')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const profilePage = jsonLd['@graph'].find((node) => node['@type'] === 'ProfilePage');

    expect(nativeElement.querySelector('.about-page')?.getAttribute('lang')).toBe('tr-TR');
    expect(document.documentElement.lang).toBe('tr-TR');
    expect(switchButton?.textContent).toContain('Read in English');
    expect(nativeElement.textContent).toContain('Standart yolun dışında bir eğitim');
    expect(nativeElement.textContent).not.toContain('A route outside the standard route');
    expect(title.getTitle()).toBe("Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su");
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      "Osmancık'ta doğup Tottenham'da büyüyen Serhat Soruklu'nun kendi kendine öğrendiği yazılım yolculuğunu ve Coupyn'i nasıl kurduğunu okuyun.",
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      "Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su",
    );
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    ).toContain("Serhat Soruklu'nun kendi kendine öğrendiği yazılım yolculuğunu");
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'tr_TR',
    );
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(
      "Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su",
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://serhatsoruklu.com/about',
    );
    expect(profilePage?.['@id']).toBe('https://serhatsoruklu.com/about#webpage');
    expect(profilePage?.['inLanguage']).toBe('tr-TR');
    expect(profilePage?.['name']).toBe("Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su");
    expect(profilePage?.['description']).toContain("Osmancık'ta doğup Tottenham'da büyüyen");

    switchButton?.click();
    fixture.detectChanges();

    expect(document.documentElement.lang).toBe('en-GB');
    expect(title.getTitle()).toBe(pageSeoMetadata.about.title);
  });

  it('opens the lazy profile dialog from an accessible portrait button', () => {
    const dialog = TestBed.inject(AboutProfileDialogService);
    const openSpy = vi.spyOn(dialog, 'open').mockResolvedValue();
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[data-testid="about-portrait-trigger"]',
    );

    expect(trigger?.type).toBe('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.hasAttribute('aria-label')).toBe(false);
    expect(trigger?.textContent).toContain('Open portrait and profile');
    expect(trigger?.querySelector('img')?.getAttribute('alt')).toBe(
      'Portrait of Serhat Soruklu, founder and CEO of Coupyn.',
    );
    trigger?.click();
    expect(openSpy).toHaveBeenCalledOnce();
  });

  it('uses verified public profiles with safe external relationships', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
        '.about-profiles a',
      ),
    );

    expect(links.map((link) => link.href)).toEqual([
      'https://github.com/SerhatSoruklu',
      'https://www.linkedin.com/in/serhatsoruklu/',
      'https://orcid.org/0009-0006-8963-5986',
      'https://dev.to/coupyn',
      'https://hashnode.com/@serhatsoruklu',
      'https://medium.com/@coupyn',
      'https://coupyn.com/',
    ]);
    expect(links.every((link) => link.target === '_blank')).toBe(true);
    expect(links.slice(0, 6).every((link) => link.rel === 'me noopener noreferrer')).toBe(true);
    expect(links[6]?.rel).toBe('noopener noreferrer');

    const zeroGlareLink = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      '.about-system-card a[target="_blank"]',
    );

    expect(zeroGlareLink?.getAttribute('aria-label')).toBe(
      'Open repository — ZeroGlare Continuity System on GitHub, opens in a new tab',
    );
  });
});
