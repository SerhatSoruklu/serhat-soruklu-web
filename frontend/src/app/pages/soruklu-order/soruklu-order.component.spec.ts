import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { siX } from 'simple-icons';

import { SorukluOrderComponent } from './soruklu-order.component';

describe('SorukluOrderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SorukluOrderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the approved public identity and family boundary', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('The Soruklu Order');
    expect(text).toContain('Established 2024');
    expect(text).toContain('Serhat Soruklu');
    expect(text).toContain('Small voluntary membership');
    expect(text).toContain('May the Light guide us.');
    expect(text).toContain('Family is inherited. Membership is chosen.');
    expect(text).toContain('Official Website Clarification');
    expect(text).toContain('A Small, Voluntary Family Initiative');
    expect(text).toContain(
      'The Order is not a government, police force, court, legal authority, military organisation or public institution.',
    );
    expect(text).toContain('The Order Is Not the Entire Family');
    expect(text).toContain(
      'The wider family is not centrally controlled and is not collectively represented by this initiative.',
    );
    expect(text).toContain('Roles, Not Ranks');
    expect(text).toContain('Safeguarding, Evidence and Due Process');
    expect(text).toContain('Official Identity Clarification');
    expect(text).not.toContain('Approximately 5–10 selected members');
  });

  it('uses the official emblem with meaningful, dimensioned image markup', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const emblems = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        'img[src="/assets/brand/soruklu-order/the-soruklu-order-emblem.png"]',
      ),
    );

    expect(emblems.length).toBe(2);
    expect(emblems[0].alt).toBe(
      'Soruklu Order emblem: an interwoven gold family sigil within a circular seal',
    );
    expect(emblems[1].alt).toBe('');
    expect(emblems[1].getAttribute('aria-hidden')).toBe('true');
    expect(emblems.every((emblem) => emblem.getAttribute('width') === '400')).toBe(true);
    expect(emblems.every((emblem) => emblem.getAttribute('height') === '400')).toBe(true);
  });

  it('keeps Explore the Order on-page and scrolls to the selective initiative section', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const target = nativeElement.querySelector<HTMLElement>('#the-order');
    const action = nativeElement.querySelector<HTMLButtonElement>('button.order-action--primary');
    const scrollIntoView = vi.fn();

    expect(target).not.toBeNull();
    expect(action?.textContent).toContain('Explore the Order');
    expect(action?.getAttribute('type')).toBe('button');
    expect(nativeElement.querySelector('a[href="#the-order"]')).toBeNull();

    Object.defineProperty(target, 'scrollIntoView', { value: scrollIntoView });
    action?.click();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('uses four restrained material icons for key identity sections', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const icons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'app-path-icon.order-section-icon',
      ),
    );

    expect(icons.map((icon) => icon.getAttribute('data-mat-icon-name'))).toEqual([
      'order-family',
      'order-purpose',
      'order-safeguarding',
      'order-identity',
    ]);
  });

  it('keeps every official X action exact, external, and accessible', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('a[href="https://x.com/sorukluorder"]'),
    );
    const iconPaths = Array.from(
      nativeElement.querySelectorAll<SVGPathElement>(
        '.order-x-icon path, .order-communications__icon path',
      ),
    );

    expect(links.length).toBe(3);
    expect(links.every((link) => link.target === '_blank')).toBe(true);
    expect(links.every((link) => link.rel === 'me noopener noreferrer')).toBe(true);
    expect(
      links.every(
        (link) =>
          link.getAttribute('aria-label') === 'Open the official Soruklu Order account on X',
      ),
    ).toBe(true);
    expect(iconPaths.length).toBe(3);
    expect(iconPaths.every((path) => path.getAttribute('d') === siX.path)).toBe(true);
  });

  it('states the unaffiliated domain as plain text without linking to it', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const domains = Array.from(nativeElement.querySelectorAll('.order-domain'));
    const links = Array.from(nativeElement.querySelectorAll<HTMLAnchorElement>('a'));

    expect(domains).toHaveLength(2);
    expect(domains.every((domain) => domain.textContent?.trim() === 'sorukluorder.org')).toBe(true);
    expect(
      links.some((link) => {
        const hostname = new URL(link.href).hostname.toLowerCase();

        return hostname === 'sorukluorder.org' || hostname.endsWith('.sorukluorder.org');
      }),
    ).toBe(false);
  });

  it('uses responsibility-based role names and preserves their authority boundaries', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const roleNames = Array.from(nativeElement.querySelectorAll('.order-role-grid h3')).map(
      (heading) => heading.textContent?.trim(),
    );

    expect(roleNames).toEqual([
      'Founder and Steward',
      'Senior Family Adviser',
      'Safeguarding and Preparedness',
      'Family Adviser',
      'Legal Liaison',
      'Records and Continuity',
    ]);
    expect(text).toContain('They are not hereditary offices, professional licences');
    expect(text).toContain('does not automatically create a solicitor-client relationship');
    expect(text).toContain('The Order does not replace them or investigate offences itself.');

    for (const oldRole of [
      'Founder and Leader',
      'Patriarch',
      'Protector',
      'Legal Perspective',
      'Future-Generation Stewardship',
    ]) {
      expect(text).not.toContain(oldRole);
    }
  });

  it('does not introduce recruiting, enforcement, or threatening language', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').toLowerCase();
    const prohibitedPhrases = [
      'blacklist',
      'join us',
      'apply for membership',
      'enlist',
      'enemy',
      'punish',
      'retaliat',
      'vigilante',
    ];

    for (const phrase of prohibitedPhrases) {
      expect(text).not.toContain(phrase);
    }
  });
});
