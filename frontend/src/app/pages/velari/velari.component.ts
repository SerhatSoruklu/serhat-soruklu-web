import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mdiArrowRight, mdiArrowTopRight, mdiInstagram } from '@mdi/js';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { PathIconComponent } from '../../shared/icons/path-icon.component';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

interface VelariEmblemPrinciple {
  title: string;
  definition: string;
  position: 'north' | 'east' | 'south' | 'west';
  tooltipPlacement: 'top' | 'right' | 'bottom';
}

interface VelariFact {
  label: string;
  value: string;
}

interface VelariMovement {
  number: string;
  title: string;
  statement: string;
  themes: readonly string[];
}

interface VelariPrinciple {
  title: string;
  description: string;
}

interface VelariReflection {
  phase: string;
  introduction: string;
  prompts: readonly string[];
}

interface VelariManuscript {
  title: string;
  themes: string;
  description: string;
  instagramUrl: string;
}

@Component({
  selector: 'app-velari',
  imports: [PathIconComponent, RouterLink, TooltipDirective],
  templateUrl: './velari.component.html',
  styleUrl: './velari.component.css',
})
export class VelariComponent {
  readonly topNavigation = inject(TopNavigationService);
  readonly emblemPath = '/assets/brand/velari/velari-faith-emblem.jpg';
  readonly emblemSrcset =
    '/assets/brand/velari/velari-faith-emblem-540.webp 540w, /assets/brand/velari/velari-faith-emblem-1080.webp 1080w';
  readonly instagramUrl = 'https://www.instagram.com/velarifaith/';
  readonly iconPaths: Readonly<Record<string, string>> = {
    'velari-arrow': mdiArrowRight,
    'velari-external': mdiArrowTopRight,
    'velari-instagram': mdiInstagram,
  };

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

  readonly facts: readonly VelariFact[] = [
    { label: 'Project', value: 'Personal belief framework and writing' },
    { label: 'Author', value: 'Serhat Soruklu' },
    { label: 'Approach', value: 'Helio-pantheism' },
    { label: 'Themes', value: 'Light, discipline, compassion and responsibility' },
    { label: 'Status', value: 'Ongoing writing project' },
  ];

  readonly movements: readonly VelariMovement[] = [
    {
      number: '1',
      title: 'Become',
      statement: 'Choose a direction and begin acting deliberately.',
      themes: ['Awareness', 'Intention', 'Responsibility', 'Beginning'],
    },
    {
      number: '2',
      title: 'Refine',
      statement: 'Improve conduct through discipline, honesty, learning and correction.',
      themes: ['Self-restraint', 'Learning', 'Repair', 'Repeated practice'],
    },
    {
      number: '3',
      title: 'Understand',
      statement:
        'See situations more clearly and act with greater wisdom, humility and compassion.',
      themes: ['Clarity', 'Perspective', 'Humility', 'Service beyond ego'],
    },
  ];

  readonly principles: readonly VelariPrinciple[] = [
    { title: 'Clarity', description: 'Seek understanding rather than comfortable confusion.' },
    {
      title: 'Wisdom',
      description: 'Learn before judging and remain willing to correct yourself.',
    },
    {
      title: 'Humility',
      description: 'Recognise the limits of personal knowledge, certainty and power.',
    },
    { title: 'Truth', description: 'Speak honestly and correct falsehood when discovered.' },
    {
      title: 'Discipline',
      description: 'Develop character through repeated deliberate action.',
    },
    { title: 'Compassion', description: 'Strength without care can become cruelty.' },
    {
      title: 'Responsibility',
      description: 'Choices carry consequences for the chooser and for other people.',
    },
    { title: 'Courage', description: 'Act responsibly even when fear remains.' },
    {
      title: 'Resilience',
      description:
        'Continue through difficulty without treating suffering as proof of superiority.',
    },
    {
      title: 'Peace',
      description: 'Prefer repair, dialogue, boundaries and restraint over revenge.',
    },
    {
      title: 'Freedom',
      description: 'Independent choice matters, and responsibility follows choice.',
    },
    {
      title: 'Coexistence',
      description:
        'Different beliefs and philosophies can coexist without being treated as identical.',
    },
  ];

  readonly reflections: readonly VelariReflection[] = [
    {
      phase: 'Morning',
      introduction: 'Set a deliberate direction for the day.',
      prompts: [
        'Choose one clear intention',
        'Identify one responsible action',
        'Remember what matters today',
      ],
    },
    {
      phase: 'Day',
      introduction: 'Return attention to conduct while the day is underway.',
      prompts: [
        'Speak truthfully',
        'Work honestly',
        'Act with compassion',
        'Maintain proportion',
        'Choose restraint where possible',
      ],
    },
    {
      phase: 'Night',
      introduction: 'Review experience without performance or self-deception.',
      prompts: [
        'Review the day',
        'Recognise mistakes',
        'Repair what can be repaired',
        'Record what was learned',
        'Begin again tomorrow',
      ],
    },
  ];

  readonly manuscripts: readonly VelariManuscript[] = [
    {
      title: 'The Book of Light',
      themes: 'Clarity · Sun · Virtue · Awareness',
      description:
        'Developing writing on awareness, wisdom, discipline and the life-giving symbolism of Light.',
      instagramUrl: 'https://www.instagram.com/p/DZ47ZQ6oE2V',
    },
    {
      title: 'The Book of Shadow',
      themes: 'Fear · Ego · Error · Self-deception',
      description:
        'A developing reflection on confusion, fear and the parts of the self that need to be understood rather than denied.',
      instagramUrl: 'https://www.instagram.com/p/DZ47fd0oBkf/',
    },
    {
      title: 'The Book of the Path',
      themes: 'Choice · Repair · Practice · Continuation',
      description:
        'Developing practical writing about choosing, repairing, learning and continuing with greater clarity.',
      instagramUrl: 'https://www.instagram.com/p/DZ47lu4o3AF/',
    },
  ];
}
