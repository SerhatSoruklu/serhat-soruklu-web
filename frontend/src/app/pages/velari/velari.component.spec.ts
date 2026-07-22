import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VelariComponent } from './velari.component';

describe('VelariComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VelariComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('presents Velari as an authored modern belief framework within the first section', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const heroText = nativeElement
      .querySelector('.velari-hero')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();

    expect(nativeElement.querySelectorAll('h1')).toHaveLength(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Velari');
    expect(heroText).toContain('A modern belief framework');
    expect(heroText).toContain('An evolving personal belief framework and writing project.');
    expect(heroText).toContain('Helio-pantheism');
    expect(heroText).toContain('Written by Serhat Soruklu');
    expect(heroText).toContain('not currently an organised religion or membership body');
    expect(heroText).toContain(
      'no claim to supernatural revelation or authority over other people',
    );
  });

  it('renders a compact and factual project summary', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const labels = Array.from(nativeElement.querySelectorAll('.velari-facts dt')).map((element) =>
      element.textContent?.trim(),
    );
    const values = Array.from(nativeElement.querySelectorAll('.velari-facts dd')).map((element) =>
      element.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(labels).toEqual(['Project', 'Author', 'Approach', 'Themes', 'Status', 'Instagram']);
    expect(values).toEqual([
      'Personal belief framework and writing',
      'Serhat Soruklu',
      'Helio-pantheism',
      'Light, discipline, compassion and responsibility',
      'Ongoing writing project',
      '@velarifaith ↗',
    ]);
  });

  it('preserves the original symbol sources and exact four-word compass', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const symbols = Array.from(
      nativeElement.querySelectorAll<HTMLImageElement>(
        'img[src="/assets/brand/velari/velari-faith-emblem.jpg"]',
      ),
    );
    const words = Array.from(nativeElement.querySelectorAll('.velari-symbol__word'));

    expect(symbols).toHaveLength(2);
    expect(symbols[0].alt).toBe('Velari symbol');
    expect(symbols[1].alt).toBe('');
    expect(symbols[1].closest('[aria-hidden="true"]')).not.toBeNull();
    expect(symbols.every((symbol) => symbol.getAttribute('width') === '1080')).toBe(true);
    expect(symbols.every((symbol) => symbol.getAttribute('height') === '1080')).toBe(true);
    expect(
      symbols.every(
        (symbol) =>
          symbol.getAttribute('srcset') ===
          '/assets/brand/velari/velari-faith-emblem-540.webp 540w, /assets/brand/velari/velari-faith-emblem-1080.webp 1080w',
      ),
    ).toBe(true);
    expect(words.map((word) => word.textContent?.trim())).toEqual([
      'Discipline',
      'Indomitable',
      'Resilience',
      'Equanimity',
    ]);
    expect(words.map((word) => word.className.split('--').at(-1))).toEqual([
      'north',
      'east',
      'south',
      'west',
    ]);
    expect(words.every((word) => word.tagName === 'BUTTON')).toBe(true);
  });

  it('uses editorial movements, core principles, and optional reflection prompts', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const movementNames = Array.from(nativeElement.querySelectorAll('.velari-movements h3')).map(
      (heading) => heading.textContent?.trim(),
    );
    const principleNames = Array.from(nativeElement.querySelectorAll('.velari-principles h3')).map(
      (heading) => heading.textContent?.trim(),
    );
    const reflectionNames = Array.from(
      nativeElement.querySelectorAll('.velari-reflections h3'),
    ).map((heading) => heading.textContent?.trim());

    expect(movementNames).toEqual(['Become', 'Refine', 'Understand']);
    expect(principleNames).toEqual([
      'Clarity',
      'Wisdom',
      'Humility',
      'Truth',
      'Discipline',
      'Compassion',
      'Responsibility',
      'Courage',
      'Resilience',
      'Peace',
      'Freedom',
      'Coexistence',
    ]);
    expect(reflectionNames).toEqual([
      'Set a deliberate direction for the day.',
      'Return attention to conduct while the day is underway.',
      'Review experience without performance or self-deception.',
    ]);
    expect(nativeElement.textContent).toContain('They are not rituals, obligations');
  });

  it('presents the three works as unnumbered developing manuscripts', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const section = nativeElement.querySelector<HTMLElement>('.velari-manuscripts');
    const entries = Array.from(section?.querySelectorAll('article') ?? []);

    expect(entries).toHaveLength(3);
    expect(entries.map((entry) => entry.querySelector('h3')?.textContent?.trim())).toEqual([
      'The Book of Light',
      'The Book of Shadow',
      'The Book of the Path',
    ]);
    expect(entries.every((entry) => entry.textContent?.includes('Developing manuscript'))).toBe(
      true,
    );
    expect(entries.every((entry) => entry.textContent?.includes('Not yet published'))).toBe(true);
    expect(section?.querySelectorAll('.velari-book')).toHaveLength(0);
    expect(section?.textContent).not.toMatch(/Book (I|II|III)(?:\s|$)/);
  });

  it('removes institutional language and every Soruklu Order association', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';
    const removedPhrases = [
      'Soruklu Order',
      'The Spiritual Framework of the Order',
      'Explore the Soruklu Order',
      'Founder and current steward',
      'prophet',
      'deity',
      'divine messenger',
      'infallible authority',
      'The Velarian Code',
      'The Velarian Path',
      'Official emblem',
      'Official channel',
    ];

    for (const phrase of removedPhrases) {
      expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
    }

    expect(text.match(/May the Light guide us\./g)).toHaveLength(1);
  });

  it('uses secure, accurately labelled Instagram links', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const profileLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>(
        'a[href="https://www.instagram.com/velarifaith/"]',
      ),
    );
    const manuscriptLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>('.velari-manuscripts a'),
    );

    expect(profileLinks).toHaveLength(4);
    expect(profileLinks.every((link) => link.target === '_blank')).toBe(true);
    expect(profileLinks.every((link) => link.rel === 'me noopener noreferrer')).toBe(true);
    expect(
      profileLinks.every((link) => link.getAttribute('aria-label') === 'Open Velari on Instagram'),
    ).toBe(true);
    expect(manuscriptLinks).toHaveLength(3);
    expect(manuscriptLinks.every((link) => link.target === '_blank')).toBe(true);
    expect(manuscriptLinks.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
  });
});
