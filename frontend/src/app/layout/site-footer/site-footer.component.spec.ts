import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  mdiEmailOutline,
  mdiNavigationVariantOutline,
  mdiShieldOutline,
  mdiSitemapOutline,
} from '@mdi/js';

import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the brand, restrained route links, systems, and current year', () => {
    const fixture = TestBed.createComponent(SiteFooterComponent);
    const currentYear = new Date().getFullYear().toString();

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.site-footer__link'),
    ).map((link) => link.textContent?.trim());
    const groupTitles = Array.from(
      nativeElement.querySelectorAll<HTMLElement>('.site-footer__group-title'),
    ).map((title) => title.textContent?.trim().replace(/\s+/g, ' '));

    expect(nativeElement.querySelector('.site-footer__name')?.textContent?.trim()).toBe(
      'Serhat Soruklu',
    );
    expect(nativeElement.querySelector('.site-footer__role')?.textContent?.trim()).toBe(
      'SYSTEMS ARCHITECT',
    );
    expect(groupTitles).toEqual(['Navigate', 'Systems', 'Identity', 'Reach Us']);
    expect(links).toEqual([
      'Home',
      'Work',
      'Systems',
      'Writing',
      'GitHub',
      'Coupyn',
      'ChatPDM',
      'DBF',
      'CIM',
      'Soruklu Order',
      'Velari',
      'Contact',
    ]);
    expect(nativeElement.textContent).toContain(`© ${currentYear} Serhat Soruklu.`);
  });

  it('keeps all footer links on existing routes', () => {
    const fixture = TestBed.createComponent(SiteFooterComponent);
    const component = fixture.componentInstance;

    expect(component.navLinks.map((link) => link.path)).toEqual([
      '/',
      '/work',
      '/systems',
      '/writing',
      '/github',
    ]);
    expect(component.systemLinks.map((link) => link.path)).toEqual([
      '/systems/coupyn',
      '/systems/chatpdm',
      '/systems/deterministic-boundary-firewall',
      '/systems/continuity-identity-model',
    ]);
    expect(component.identityLinks.map((link) => link.path)).toEqual(['/soruklu-order', '/velari']);
    expect(component.reachLinks.map((link) => link.path)).toEqual(['/contact']);
  });

  it('uses static inline SVG icon paths for footer groups', () => {
    const fixture = TestBed.createComponent(SiteFooterComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const iconPaths = Array.from(
      nativeElement.querySelectorAll('.site-footer__group-title-icon path'),
    ).map((path) => path.getAttribute('d'));

    expect(component.groupIconPaths).toEqual({
      identity: mdiShieldOutline,
      navigate: mdiNavigationVariantOutline,
      reach: mdiEmailOutline,
      systems: mdiSitemapOutline,
    });
    expect(iconPaths).toEqual([
      mdiNavigationVariantOutline,
      mdiSitemapOutline,
      mdiShieldOutline,
      mdiEmailOutline,
    ]);
  });
});
