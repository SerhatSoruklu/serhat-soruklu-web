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

  it('renders the complete approved framework and removes placeholder copy', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const text = nativeElement.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    expect(nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Velari');
    expect(text).toContain('A path of Light, wisdom and discipline.');
    expect(text).toContain('What Is Velari?');
    expect(text).toContain('Become. Refine. Awaken.');
    expect(text).toContain('Principles That Must Be Practised');
    expect(text).toContain('Freedom Carries Responsibility');
    expect(text).toContain('Many paths, one Light.');
    expect(text).toContain('May the Light guide us.');
    expect(text).not.toContain('Public material is being prepared.');
  });

  it('states the exact leadership and wider-family identity boundaries', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';

    expect(text).toContain(
      'He serves as its present leader and custodian, not as a prophet, deity, divine messenger or infallible authority.',
    );
    expect(text).toContain(
      'Velari is the spiritual and philosophical framework associated with the Soruklu Order. It does not define or represent the beliefs of the wider Soruklu family, and no person is assumed to follow Velari merely through family name or ancestry.',
    );
  });

  it('uses the original dimensioned emblem and exact official Instagram semantics', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const emblem = nativeElement.querySelector<HTMLImageElement>(
      'img[src="/assets/brand/velari/velari-faith-emblem.jpg"]',
    );
    const officialLinks = Array.from(
      nativeElement.querySelectorAll<HTMLAnchorElement>(
        'a[href="https://www.instagram.com/velarifaith/"]',
      ),
    );

    expect(emblem?.alt).toBe('Velari faith emblem');
    expect(emblem?.getAttribute('width')).toBe('1080');
    expect(emblem?.getAttribute('height')).toBe('1080');
    expect(emblem?.getAttribute('srcset')).toBe(
      '/assets/brand/velari/velari-faith-emblem-540.webp 540w, /assets/brand/velari/velari-faith-emblem-1080.webp 1080w',
    );
    expect(emblem?.getAttribute('sizes')).toBe('(min-width: 583px) 543px, calc(100vw - 40px)');
    expect(emblem?.getAttribute('loading')).toBe('eager');
    expect(emblem?.getAttribute('decoding')).toBe('async');
    expect(officialLinks.length).toBe(3);
    expect(officialLinks.every((link) => link.target === '_blank')).toBe(true);
    expect(officialLinks.every((link) => link.rel === 'me noopener noreferrer')).toBe(true);
    expect(
      officialLinks.every(
        (link) =>
          link.getAttribute('aria-label') === 'Open the official Velari Faith account on Instagram',
      ),
    ).toBe(true);
  });

  it('places four accessible philosophical principles around the hero emblem', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const compass = nativeElement.querySelector('.velari-emblem-principles');
    const principles = Array.from(
      compass?.querySelectorAll<HTMLElement>('.velari-emblem-principle') ?? [],
    );

    expect(compass?.getAttribute('aria-label')).toBe('Velari philosophical compass');
    expect(principles).toHaveLength(4);
    expect(principles.map((principle) => principle.textContent?.trim())).toEqual([
      'Discipline',
      'Indomitable',
      'Resilience',
      'Equanimity',
    ]);
    expect(principles.every((principle) => principle.tabIndex === 0)).toBe(true);
    expect(principles.map((principle) => principle.getAttribute('aria-label'))).toEqual([
      'Discipline: The practice of choosing what is right, repeatedly, even when it is difficult.',
      'Indomitable: A spirit that pressure may shape, but cannot conquer.',
      'Resilience: The strength to repair, return and continue after hardship.',
      'Equanimity: Calm judgement maintained through gain, loss and uncertainty.',
    ]);
    expect(principles.every((principle) => !principle.hasAttribute('title'))).toBe(true);
  });

  it('presents the developing texts as original book displays with exact source links', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const section = nativeElement.querySelector<HTMLElement>('.velari-section--texts');
    const bookEntries = section?.querySelectorAll('.velari-book-entry') ?? [];
    const sourceLinks = Array.from(
      section?.querySelectorAll<HTMLAnchorElement>('.velari-book-meta__link') ?? [],
    );
    const text = nativeElement.textContent?.replace(/\s+/g, ' ') ?? '';
    const expectedLinks = [
      'https://www.instagram.com/p/DZ47ZQ6oE2V',
      'https://www.instagram.com/p/DZ47fd0oBkf/',
      'https://www.instagram.com/p/DZ47lu4o3AF/',
    ];

    expect(bookEntries.length).toBe(3);
    expect(section?.querySelectorAll('.velari-book').length).toBe(3);
    expect(section?.querySelectorAll('svg.velari-book-art').length).toBe(3);
    expect(section?.querySelector('img')).toBeNull();
    expect(text).toContain('The Book of Light');
    expect(text).toContain('The Book of Shadow');
    expect(text).toContain('The Book of the Path');
    expect(text).toContain('Awakening · Sun · Virtue · Clarity');
    expect(text).toContain('Darkness · Fear · Ego · Illusion · Suffering');
    expect(text).toContain('Guidance Through Darkness · Carried by Light');
    expect(text).toContain(
      'A reflection on confusion, fear, error and the parts of the self that must be understood rather than denied.',
    );
    expect(section?.querySelectorAll('.velari-book-meta__status').length).toBe(3);
    expect(text).toContain('not completed or commercially available books');
    expect(sourceLinks.map((link) => link.getAttribute('href'))).toEqual(expectedLinks);
    expect(sourceLinks.every((link) => link.target === '_blank')).toBe(true);
    expect(sourceLinks.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
    expect(sourceLinks.map((link) => link.getAttribute('aria-label'))).toEqual([
      'View The Book of Light on Instagram',
      'View The Book of Shadow on Instagram',
      'View The Book of the Path on Instagram',
    ]);
  });

  it('scrolls to the framework without using a root-resolving fragment link', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const target = nativeElement.querySelector<HTMLElement>('#velari-framework');
    const action = nativeElement.querySelector<HTMLButtonElement>('button.velari-action--primary');
    const scrollIntoView = vi.fn();

    expect(target).not.toBeNull();
    expect(action?.textContent).toContain('Explore the Velarian Path');
    expect(nativeElement.querySelector('a[href="#velari-framework"]')).toBeNull();

    Object.defineProperty(target, 'scrollIntoView', { value: scrollIntoView });
    action?.click();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('excludes prohibited authority, dominance, and collective-belief claims', () => {
    const fixture = TestBed.createComponent(VelariComponent);
    fixture.detectChanges();

    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').toLowerCase();
    const prohibited = [
      'last religion',
      'largest religion',
      'replace all religions',
      'final truth',
      'millions of followers',
      'everyone will follow',
      'all soruklu family members follow',
      'divinely guaranteed',
    ];

    for (const phrase of prohibited) {
      expect(text).not.toContain(phrase);
    }
  });
});
