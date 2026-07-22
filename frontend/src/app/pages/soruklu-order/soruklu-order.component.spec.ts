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

  it('renders the approved family stewardship identity within the first section', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const heroText = nativeElement
      .querySelector('.order-hero')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();

    expect(nativeElement.querySelectorAll('h1')).toHaveLength(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('The Soruklu Order');
    expect(heroText).toContain('A small, voluntary family stewardship initiative.');
    expect(heroText).toContain('Participation is voluntary and based on informed consent.');
    expect(heroText).toContain('does not represent the entire Soruklu family');
    expect(heroText).toContain('holds no authority over any person');
    expect(heroText).toContain('Discipline · Responsibility · Continuity');
    expect(heroText).not.toContain('Founder and Steward');
    expect(heroText).not.toContain('May the Light guide us.');
  });

  it('renders a compact and factual at-a-glance summary', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const labels = Array.from(nativeElement.querySelectorAll('.order-facts dt')).map((element) =>
      element.textContent?.trim(),
    );
    const values = Array.from(nativeElement.querySelectorAll('.order-facts dd')).map((element) =>
      element.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(labels).toEqual([
      'Established',
      'Purpose',
      'Participation',
      'Coordinated by',
      'Public channel',
    ]);
    expect(values).toEqual([
      '2025',
      'Family stewardship and continuity',
      'Small, voluntary, and consent-based',
      'Serhat Soruklu',
      '@SorukluOrder on X ↗',
    ]);
  });

  it('uses the unchanged emblem path with one neutral description and one decorative repeat', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const emblems = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        'img[src="/assets/brand/soruklu-order/the-soruklu-order-emblem.png"]',
      ),
    );

    expect(emblems).toHaveLength(2);
    expect(emblems[0].alt).toBe('Soruklu Order interwoven family emblem');
    expect(emblems[1].alt).toBe('');
    expect(emblems[1].closest('[aria-hidden="true"]')).not.toBeNull();
    expect(emblems.every((emblem) => emblem.getAttribute('width') === '400')).toBe(true);
    expect(emblems.every((emblem) => emblem.getAttribute('height') === '400')).toBe(true);
  });

  it('makes the work concrete without inventing counts or achievements', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const activities = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.order-activity-list li'),
    ).map((element) => element.textContent?.replace(/\s+/g, ' ').replace('✓', '').trim());

    expect(activities).toEqual([
      'Preserve authorised family photographs, documents, history, and contextual records',
      'Maintain useful continuity information with the consent of the people involved',
      'Encourage practical support during personal and family difficulties',
      'Document voluntary responsibilities and important shared decisions',
      'Preserve agreed principles and context for future generations',
      'Encourage lawful, responsible, and evidence-based conduct',
    ]);
  });

  it('uses the approved principles and non-hierarchical administrative responsibilities', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const principleNames = Array.from(nativeElement.querySelectorAll('.order-principles h3')).map(
      (heading) => heading.textContent?.trim(),
    );
    const responsibilityNames = Array.from(
      nativeElement.querySelectorAll('.order-responsibilities h3'),
    ).map((heading) => heading.textContent?.trim());

    expect(principleNames).toEqual([
      'Discipline',
      'Compassion',
      'Responsibility',
      'Truth',
      'Self-restraint',
      'Lawful conduct',
      'Continuity',
      'Mutual support',
    ]);
    expect(responsibilityNames).toEqual([
      'Project coordinator',
      'Family adviser',
      'Safeguarding contact',
      'Records custodian',
    ]);
    expect(text).toContain('These are informal administrative responsibilities, not ranks');
    expect(text).toContain('They apply only within the voluntary initiative.');
  });

  it('keeps the safeguarding boundary calm and delegates matters to independent services', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const sectionText = (fixture.nativeElement as HTMLElement)
      .querySelector('[aria-labelledby="order-safeguarding-title"]')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();

    expect(sectionText).toContain('respect individual autonomy');
    expect(sectionText).toContain('relevant independent authorities and qualified professionals');
    expect(sectionText).toContain('does not investigate offences, determine guilt');
    expect(sectionText?.toLowerCase()).not.toContain('sexual abuse');
  });

  it('keeps every official X action exact, external, and accessible', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('a[href="https://x.com/sorukluorder"]'),
    );
    const iconPaths = Array.from(
      nativeElement.querySelectorAll<SVGPathElement>('.order-x-icon path'),
    );

    expect(links).toHaveLength(3);
    expect(links.every((link) => link.target === '_blank')).toBe(true);
    expect(links.every((link) => link.rel === 'me noopener noreferrer')).toBe(true);
    expect(
      links.every(
        (link) =>
          link.getAttribute('aria-label') === 'Open the official Soruklu Order account on X',
      ),
    ).toBe(true);
    expect(iconPaths).toHaveLength(2);
    expect(iconPaths.every((path) => path.getAttribute('d') === siX.path)).toBe(true);
  });

  it('states the unaffiliated domain once as plain text without linking to it', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const domains = Array.from(nativeElement.querySelectorAll('.order-domain'));
    const links = Array.from(nativeElement.querySelectorAll<HTMLAnchorElement>('a'));

    expect(domains).toHaveLength(1);
    expect(domains[0].textContent?.trim()).toBe('sorukluorder.org');
    expect(
      links.some((link) => {
        const hostname = new URL(link.href).hostname.toLowerCase();

        return hostname === 'sorukluorder.org' || hostname.endsWith('.sorukluorder.org');
      }),
    ).toBe(false);
  });

  it('does not retain ceremonial, recruiting, enforcement, or threatening language', () => {
    const fixture = TestBed.createComponent(SorukluOrderComponent);
    fixture.detectChanges();

    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').toLowerCase();
    const prohibitedPhrases = [
      'may the light guide us',
      'the continuing charge',
      'official emblem',
      'founder and steward',
      'senior family adviser',
      'legal liaison',
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
