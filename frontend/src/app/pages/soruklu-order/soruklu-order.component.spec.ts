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
    expect(text).toContain('Approximately 5–10 selected members');
    expect(text).toContain('May the Light guide us.');
    expect(text).toContain('Family is inherited. Membership is chosen.');
    expect(text).toContain('The Order Is Not the Entire Family');
    expect(text).toContain('potentially thousands of individuals');
    expect(text).toContain('Roles, Not Ranks');
    expect(text).toContain('Safeguarding, Evidence and Due Process');
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
    expect(emblems.every((emblem) => emblem.alt === 'The Soruklu Order emblem')).toBe(true);
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
        'mat-icon.order-section-icon',
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
    const domain = nativeElement.querySelector('.order-domain');
    const links = Array.from(nativeElement.querySelectorAll<HTMLAnchorElement>('a'));

    expect(domain?.textContent?.trim()).toBe('sorukluorder.org');
    expect(links.some((link) => {
      const hostname = new URL(link.href).hostname.toLowerCase();

      return hostname === 'sorukluorder.org' || hostname.endsWith('.sorukluorder.org');
    })).toBe(false);
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
