import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GitHubComponent } from './github.component';

describe('GitHubComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GitHubComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the complete GitHub page instead of the placeholder', () => {
    const fixture = TestBed.createComponent(GitHubComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const sectionHeadings = Array.from(
      compiled.querySelectorAll<HTMLElement>('section h1, section h2'),
    ).map((heading) => heading.textContent?.trim());

    expect(compiled.querySelector('.page-placeholder')).toBeNull();
    expect(sectionHeadings).toEqual([
      'GitHub',
      'The system at the centre of the public work.',
      'Boundaries first. Continuity second.',
      'Smaller surfaces, specific purposes.',
      'Coupyn production code remains private.',
      'Follow the repositories, not a scoreboard.',
    ]);
  });

  it('uses exact external URLs and safe new-tab attributes for every repository action', () => {
    const fixture = TestBed.createComponent(GitHubComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const expectedLinks = new Map([
      ['repository-chatpdm-link', 'https://github.com/SerhatSoruklu/chatpdm'],
      [
        'repository-deterministic-boundary-firewall-link',
        'https://github.com/SerhatSoruklu/deterministic-boundary-firewall',
      ],
      [
        'repository-continuity-identity-model-link',
        'https://github.com/SerhatSoruklu/continuity-identity-model',
      ],
      ['repository-serhat-soruklu-web-link', 'https://github.com/SerhatSoruklu/serhat-soruklu-web'],
      [
        'repository-zeroglare-continuity-system-link',
        'https://github.com/SerhatSoruklu/zeroglare-continuity-system',
      ],
    ]);

    for (const [testId, expectedUrl] of expectedLinks) {
      const link = compiled.querySelector<HTMLAnchorElement>(`[data-testid="${testId}"]`);

      expect(link?.getAttribute('href')).toBe(expectedUrl);
      expect(link?.target).toBe('_blank');
      expect(link?.rel).toBe('noopener noreferrer');
      expect(link?.hasAttribute('routerlink')).toBe(false);
    }
  });

  it('keeps profile links external and architecture links internal', () => {
    const fixture = TestBed.createComponent(GitHubComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const profileLinks = compiled.querySelectorAll<HTMLAnchorElement>(
      '[data-testid="github-profile-hero-link"], [data-testid="github-profile-footer-link"]',
    );
    const internalPaths = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[href^="/systems/"]'),
    ).map((link) => link.getAttribute('href'));

    expect(profileLinks.length).toBe(2);
    expect(
      Array.from(profileLinks).every(
        (link) => link.getAttribute('href') === 'https://github.com/SerhatSoruklu',
      ),
    ).toBe(true);
    expect(
      Array.from(profileLinks).every(
        (link) => link.target === '_blank' && link.rel === 'noopener noreferrer',
      ),
    ).toBe(true);
    expect(internalPaths).toEqual([
      '/systems/chatpdm',
      '/systems/deterministic-boundary-firewall',
      '/systems/continuity-identity-model',
      '/systems/coupyn',
    ]);
  });

  it('links the repository CTA to the fragment on the GitHub route', () => {
    const fixture = TestBed.createComponent(GitHubComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const action = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('a')).find((link) =>
      link.textContent?.includes('Explore Repositories'),
    );

    expect(action?.getAttribute('href')).toBe('/github#repositories');
    expect(compiled.querySelector('#repositories')).not.toBeNull();
  });

  it('explains private Coupyn production code without exposing a GitHub action', () => {
    const fixture = TestBed.createComponent(GitHubComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const coupynSection = compiled.querySelector<HTMLElement>(
      '[data-testid="coupyn-private-section"]',
    );
    const coupynLinks = Array.from(coupynSection?.querySelectorAll<HTMLAnchorElement>('a') ?? []);

    expect(coupynSection?.textContent).toContain('proprietary implementation details');
    expect(coupynSection?.textContent).toContain('operational infrastructure');
    expect(coupynSection?.textContent).toContain('security-sensitive system behaviour');
    expect(coupynSection?.textContent).not.toContain('View GitHub');
    expect(coupynLinks.some((link) => {
      const hostname = new URL(link.href).hostname.toLowerCase();

      return hostname === 'github.com' || hostname.endsWith('.github.com');
    })).toBe(false);
    expect(coupynLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/systems/coupyn',
      'https://coupyn.com',
    ]);
  });
});
