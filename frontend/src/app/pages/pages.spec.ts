import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ThemeService } from '../core/theme/theme.service';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { GitHubComponent } from './github/github.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PressComponent } from './press/press.component';
import { SorukluOrderComponent } from './soruklu-order/soruklu-order.component';
import { SorukluSurnameComponent } from './soruklu-surname/soruklu-surname.component';
import { ChatpdmSystemComponent } from './systems/chatpdm/chatpdm-system.component';
import { ContinuityIdentityModelSystemComponent } from './systems/continuity-identity-model/continuity-identity-model-system.component';
import { CoupynSystemComponent } from './systems/coupyn/coupyn-system.component';
import { DeterministicBoundaryFirewallSystemComponent } from './systems/deterministic-boundary-firewall/deterministic-boundary-firewall-system.component';
import { SystemsComponent } from './systems/systems.component';
import { WorkComponent } from './work/work.component';
import { WritingComponent } from './writing/writing.component';
import { VelariComponent } from './velari/velari.component';

const pages: readonly { component: Type<unknown>; heading: string }[] = [
  { component: HomeComponent, heading: 'Serhat Soruklu' },
  { component: WorkComponent, heading: 'Work' },
  { component: SystemsComponent, heading: 'Systems' },
  { component: CoupynSystemComponent, heading: 'Coupyn' },
  { component: ChatpdmSystemComponent, heading: 'ChatPDM' },
  {
    component: DeterministicBoundaryFirewallSystemComponent,
    heading: 'Deterministic Boundary Firewall',
  },
  { component: ContinuityIdentityModelSystemComponent, heading: 'Continuity Identity Model' },
  { component: WritingComponent, heading: 'Writing' },
  { component: GitHubComponent, heading: 'GitHub' },
  { component: AboutComponent, heading: 'Serhat Soruklu' },
  { component: SorukluSurnameComponent, heading: 'What does Soruklu mean?' },
  { component: SorukluOrderComponent, heading: 'The Soruklu Order' },
  { component: VelariComponent, heading: 'Velari' },
  { component: ContactComponent, heading: 'Start With a Clear Message' },
  { component: PressComponent, heading: 'Serhat Soruklu & Coupyn' },
  { component: NotFoundComponent, heading: 'Page not found' },
];

describe('page components', () => {
  for (const page of pages) {
    it(`renders ${page.heading}`, async () => {
      await TestBed.configureTestingModule({
        imports: [page.component],
        providers: [provideRouter([])],
      }).compileComponents();

      const fixture = TestBed.createComponent(page.component);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(page.heading);
      expect((fixture.nativeElement as HTMLElement).querySelectorAll('main')).toHaveLength(0);
    });
  }

  it('states Serhat Soruklu’s Coupyn relationship and links the homepage to About', async () => {
    globalThis.localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const statement = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.home-hero__coupyn-role',
    );
    const normalizedStatement = statement?.textContent?.replace(/\s+/g, ' ').trim();
    const coupynLink = statement?.querySelector<HTMLAnchorElement>('a');
    const subtitle = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.home-hero__subtitle',
    );
    const aboutLink = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
        '.home-hero__actions a',
      ),
    ).find((link) => link.textContent?.trim() === 'About Serhat');
    const portrait = (fixture.nativeElement as HTMLElement).querySelector<HTMLImageElement>(
      '[data-testid="home-hero-portrait-image"]',
    );
    const portraitTrigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[data-testid="home-hero-portrait-trigger"]',
    );
    const portraitSources = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSourceElement>(
        '.home-hero__portrait-picture source',
      ),
    );

    expect(normalizedStatement).toBe(
      'I founded Coupyn, a coupon, referral and affiliate intelligence platform that I build and operate independently.',
    );
    expect(subtitle?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Founder & CEO of Coupyn. Systems architect and solo full-stack developer building production platforms, deterministic systems and self-managed infrastructure.',
    );
    expect(coupynLink?.href).toBe('https://coupyn.com/');
    expect(coupynLink?.target).toBe('_blank');
    expect(coupynLink?.rel).toContain('noopener');
    expect(aboutLink?.getAttribute('href')).toBe('/about');
    expect(portraitTrigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(portraitSources.map((source) => source.getAttribute('srcset'))).toEqual([
      '/assets/home/serhat-soruklu-founder-light.png',
      '/assets/home/serhat-soruklu-founder-dark.png',
    ]);
    expect(portraitSources.map((source) => source.getAttribute('media'))).toEqual([
      'not all',
      'all',
    ]);
    expect(portrait?.getAttribute('src')).toBe('/assets/home/serhat-soruklu-founder-dark.png');
    expect(portrait?.getAttribute('data-portrait-theme')).toBe('dark');
    expect(portrait?.getAttribute('data-portrait-ready-theme')).toBeNull();
    expect(portrait?.getAttribute('width')).toBe('1448');
    expect(portrait?.getAttribute('height')).toBe('1086');
    expect(portrait?.getAttribute('decoding')).toBe('async');
    expect(portrait?.getAttribute('fetchpriority')).toBe('high');
    expect(portrait?.getAttribute('loading')).toBe('eager');
    expect(portrait?.alt).toBe('Serhat Soruklu seated at his workstation in a dark office.');

    portrait?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(portrait?.getAttribute('data-portrait-ready-theme')).toBe('dark');

    TestBed.inject(ThemeService).setTheme('light');
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(portrait?.getAttribute('src')).toBe('/assets/home/serhat-soruklu-founder-light.png');
    expect(portrait?.getAttribute('data-portrait-theme')).toBe('light');
    expect(portrait?.getAttribute('data-portrait-ready-theme')).toBe('dark');
    expect(portrait?.alt).toBe('Serhat Soruklu seated at his workstation in a bright office.');
    expect(portraitSources.map((source) => source.getAttribute('media'))).toEqual([
      'all',
      'not all',
    ]);

    portrait?.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(portrait?.getAttribute('data-portrait-ready-theme')).toBe('light');

    globalThis.localStorage.clear();
  });

  it('links the ChatPDM systems card to the live product', async () => {
    await TestBed.configureTestingModule({
      imports: [SystemsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(SystemsComponent);
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a'),
    );
    const chatpdmLink = links.find((link) => link.textContent?.trim() === 'Open ChatPDM');

    expect(chatpdmLink?.href).toBe('https://chatpdm.com/');
    expect(chatpdmLink?.target).toBe('_blank');
    expect(chatpdmLink?.rel).toContain('noopener');
  });
});
