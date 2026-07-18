import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  mdiAccountGroupOutline,
  mdiArrowRight,
  mdiArrowTopRight,
  mdiBookOpenPageVariantOutline,
  mdiCompassOutline,
  mdiEyeOutline,
  mdiInfinity,
  mdiInstagram,
  mdiLightbulbOnOutline,
  mdiScaleBalance,
  mdiShieldCheckOutline,
  mdiTuneVariant,
  mdiWeatherSunsetDown,
  mdiWeatherSunsetUp,
  mdiWhiteBalanceSunny,
} from '@mdi/js';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

interface VelariEmblemPrinciple {
  title: string;
  definition: string;
  position: 'north' | 'east' | 'south' | 'west';
  tooltipPlacement: 'top' | 'right' | 'bottom';
}

interface VelariMovement {
  index: string;
  title: string;
  statement: string;
  themes: readonly string[];
  icon: string;
}

interface VelariPrinciple {
  title: string;
  description: string;
}

interface VelariPrincipleGroup {
  label: string;
  principles: readonly VelariPrinciple[];
}

interface VelariPractice {
  phase: string;
  statement: string;
  practices: readonly string[];
  icon: string;
}

interface VelariText {
  label: string;
  title: string;
  keywords: string;
  description: string;
  instagramUrl: string;
  illustration: 'light' | 'shadow' | 'path';
}

@Component({
  selector: 'app-velari',
  imports: [MatIconModule, RouterLink, TooltipDirective],
  templateUrl: './velari.component.html',
  styleUrl: './velari.component.css',
})
export class VelariComponent {
  private readonly document = inject(DOCUMENT);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sanitizer = inject(DomSanitizer);

  readonly topNavigation = inject(TopNavigationService);
  readonly emblemPath = '/assets/brand/velari/velari-faith-emblem.jpg';
  readonly instagramUrl = 'https://www.instagram.com/velarifaith/';

  readonly emblemPrinciples: readonly VelariEmblemPrinciple[] = [
    {
      title: 'Discipline',
      definition: 'The practice of choosing what is right, repeatedly, even when it is difficult.',
      position: 'north',
      tooltipPlacement: 'top',
    },
    {
      title: 'Indomitable',
      definition: 'A spirit that pressure may shape, but cannot conquer.',
      position: 'east',
      tooltipPlacement: 'right',
    },
    {
      title: 'Resilience',
      definition: 'The strength to repair, return and continue after hardship.',
      position: 'south',
      tooltipPlacement: 'bottom',
    },
    {
      title: 'Equanimity',
      definition: 'Calm judgement maintained through gain, loss and uncertainty.',
      position: 'west',
      tooltipPlacement: 'top',
    },
  ];

  readonly movements: readonly VelariMovement[] = [
    {
      index: 'I',
      title: 'Become',
      statement: 'Choose a direction and begin to live deliberately.',
      themes: ['Awareness', 'Intention', 'Responsibility', 'Beginning the path'],
      icon: 'velari-become',
    },
    {
      index: 'II',
      title: 'Refine',
      statement: 'Strengthen character through discipline, honesty and correction.',
      themes: ['Self-mastery', 'Learning', 'Repair', 'Repeated practice'],
      icon: 'velari-refine',
    },
    {
      index: 'III',
      title: 'Awaken',
      statement: 'See more clearly and act with greater wisdom and compassion.',
      themes: ['Clarity', 'Perspective', 'Humility', 'Service beyond ego'],
      icon: 'velari-awaken',
    },
  ];

  readonly principleGroups: readonly VelariPrincipleGroup[] = [
    {
      label: 'Inner clarity',
      principles: [
        { title: 'Light', description: 'Seek clarity rather than comfortable confusion.' },
        {
          title: 'Wisdom',
          description: 'Learn before judging and remain willing to correct yourself.',
        },
        {
          title: 'Humility',
          description: 'Recognise the limits of your knowledge and power.',
        },
        { title: 'Truth', description: 'Speak honestly and repair falsehood when discovered.' },
      ],
    },
    {
      label: 'Disciplined conduct',
      principles: [
        {
          title: 'Discipline',
          description: 'Build character through repeated conscious action.',
        },
        { title: 'Compassion', description: 'Strength without care becomes cruelty.' },
        {
          title: 'Free will',
          description: 'Choices matter, and responsibility follows choice.',
        },
        { title: 'Courage', description: 'Act rightly even when fear remains.' },
      ],
    },
    {
      label: 'Life with others',
      principles: [
        {
          title: 'Karma',
          description:
            'Actions create consequences within ourselves, our relationships and the world.',
        },
        {
          title: 'Resilience',
          description: 'Pressure may shape character without being allowed to destroy it.',
        },
        { title: 'Peace', description: 'Prefer repair, dialogue and restraint over revenge.' },
        {
          title: 'Unity',
          description: 'Different paths can coexist without erasing their differences.',
        },
      ],
    },
  ];

  readonly dailyPractices: readonly VelariPractice[] = [
    {
      phase: 'Morning',
      statement: 'Choose the Light.',
      practices: ['Set an intention', 'Remember the principles', 'Choose one disciplined action'],
      icon: 'velari-morning',
    },
    {
      phase: 'Day',
      statement: 'Act with wisdom.',
      practices: [
        'Tell the truth',
        'Act with compassion',
        'Work honestly',
        'Stay disciplined',
        'Choose peace where possible',
      ],
      icon: 'velari-day',
    },
    {
      phase: 'Night',
      statement: 'Reflect and return.',
      practices: [
        'Review the day',
        'Recognise mistakes',
        'Repair what can be repaired',
        'Learn without self-deception',
        'Begin again tomorrow',
      ],
      icon: 'velari-night',
    },
  ];

  readonly developingTexts: readonly VelariText[] = [
    {
      label: 'Book I',
      title: 'The Book of Light',
      keywords: 'Awakening · Sun · Virtue · Clarity',
      description:
        'Principles of awareness, wisdom, discipline and the life-giving symbol of Light.',
      instagramUrl: 'https://www.instagram.com/p/DZ47ZQ6oE2V',
      illustration: 'light',
    },
    {
      label: 'Book II',
      title: 'The Book of Shadow',
      keywords: 'Darkness · Fear · Ego · Illusion · Suffering',
      description:
        'A reflection on confusion, fear, error and the parts of the self that must be understood rather than denied.',
      instagramUrl: 'https://www.instagram.com/p/DZ47fd0oBkf/',
      illustration: 'shadow',
    },
    {
      label: 'Book III',
      title: 'The Book of the Path',
      keywords: 'Guidance Through Darkness · Carried by Light',
      description: 'Practical guidance for living, choosing, repairing and continuing.',
      instagramUrl: 'https://www.instagram.com/p/DZ47lu4o3AF/',
      illustration: 'path',
    },
  ];

  readonly coexistenceCommitments = [
    'Respect religious freedom and the freedom not to believe.',
    'Never force conversion or harass a person for leaving.',
    'Study other traditions without declaring them worthless.',
    'Keep legal rights and personal autonomy above doctrinal pressure.',
  ] as const;

  readonly authorityBoundaries = [
    'Leadership concerns structure, preservation and interpretation.',
    'Principles remain open to reasoned discussion and correction.',
    'No individual stands above civil law or lawful accountability.',
    'Disagreement is not betrayal, and leaving is not punishable.',
    'No person should surrender finances, medical decisions or legal rights to leadership.',
  ] as const;

  constructor() {
    this.registerIcons();
  }

  scrollToFramework(): void {
    if (!this.isBrowser) {
      return;
    }

    const target = this.document.getElementById('velari-framework');
    const prefersReducedMotion =
      this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    target?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  private registerIcons(): void {
    const icons = {
      'velari-arrow': mdiArrowRight,
      'velari-awaken': mdiEyeOutline,
      'velari-become': mdiCompassOutline,
      'velari-choice': mdiScaleBalance,
      'velari-day': mdiWhiteBalanceSunny,
      'velari-external': mdiArrowTopRight,
      'velari-future': mdiInfinity,
      'velari-instagram': mdiInstagram,
      'velari-light': mdiLightbulbOnOutline,
      'velari-morning': mdiWeatherSunsetUp,
      'velari-night': mdiWeatherSunsetDown,
      'velari-order': mdiAccountGroupOutline,
      'velari-refine': mdiTuneVariant,
      'velari-stewardship': mdiShieldCheckOutline,
      'velari-text': mdiBookOpenPageVariantOutline,
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`,
        ), // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
