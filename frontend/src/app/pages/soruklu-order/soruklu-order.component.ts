import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  mdiAccountGroupOutline,
  mdiBookOpenPageVariantOutline,
  mdiFingerprint,
  mdiScaleBalance,
} from '@mdi/js';
import { siX } from 'simple-icons';

interface OrderPurpose {
  index: string;
  title: string;
  description: string;
}

interface OrderPrinciple {
  title: string;
  description: string;
}

interface OrderRole {
  title: string;
  description: string;
}

@Component({
  selector: 'app-soruklu-order',
  imports: [MatIconModule, RouterLink],
  templateUrl: './soruklu-order.component.html',
  styleUrl: './soruklu-order.component.css',
})
export class SorukluOrderComponent {
  private readonly document = inject(DOCUMENT);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sanitizer = inject(DomSanitizer);

  readonly emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.png';
  readonly officialXUrl = 'https://x.com/sorukluorder';
  readonly xIconPath = siX.path;

  constructor() {
    this.registerIcons();
  }

  scrollToOrder(): void {
    if (!this.isBrowser) {
      return;
    }

    const target = this.document.getElementById('the-order');
    const prefersReducedMotion =
      this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    target?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  readonly purposes: readonly OrderPurpose[] = [
    {
      index: '01',
      title: 'Family continuity',
      description:
        'Preserve history, shared principles, and long-term records with enough context to remain useful.',
    },
    {
      index: '02',
      title: 'Responsibility',
      description:
        'Define voluntary responsibilities and clear standards among the selected members of the initiative.',
    },
    {
      index: '03',
      title: 'Mutual support',
      description:
        'Encourage constructive support during personal, family, and practical difficulties.',
    },
    {
      index: '04',
      title: 'Digital preservation',
      description:
        'Maintain a durable digital record of the initiative, its boundaries, and its principles.',
    },
    {
      index: '05',
      title: 'Future generations',
      description:
        'Preserve context and values so they can be understood rather than repeatedly reinvented.',
    },
  ];

  readonly principles: readonly OrderPrinciple[] = [
    {
      title: 'Discipline',
      description: 'Choose deliberate action over impulse and keep commitments visible.',
    },
    {
      title: 'Compassion',
      description: 'Meet difficulty with humanity while preserving clear personal boundaries.',
    },
    {
      title: 'Responsibility',
      description: 'Accept ownership for decisions, obligations, and their consequences.',
    },
    {
      title: 'Loyalty',
      description: 'Support one another honestly without excusing harmful or unlawful conduct.',
    },
    {
      title: 'Truth',
      description: 'Prefer evidence, accuracy, and correction over convenience or appearance.',
    },
    {
      title: 'Self-mastery',
      description: 'Develop judgment, restraint, and the ability to govern one’s own conduct.',
    },
    {
      title: 'Lawful conduct',
      description: 'Act within the law and respect due process, rights, and public institutions.',
    },
    {
      title: 'Continuity',
      description: 'Carry useful knowledge forward without turning inheritance into entitlement.',
    },
  ];

  readonly roles: readonly OrderRole[] = [
    {
      title: 'Founder and Leader',
      description: 'Maintains the initiative’s purpose, boundaries, and long-term direction.',
    },
    {
      title: 'Patriarch',
      description: 'Provides family perspective, historical context, and measured counsel.',
    },
    {
      title: 'Protector',
      description: 'Supports wellbeing, preparedness, and responsible safeguarding practices.',
    },
    {
      title: 'Counsel',
      description: 'Offers considered advice and helps members examine difficult decisions.',
    },
    {
      title: 'Legal Perspective',
      description:
        'Encourages lawful process and identifies when qualified professional advice is needed.',
    },
    {
      title: 'Future-Generation Stewardship',
      description: 'Preserves records and context for those who may carry the work forward.',
    },
  ];

  private registerIcons(): void {
    const icons = {
      'order-family': mdiAccountGroupOutline,
      'order-purpose': mdiBookOpenPageVariantOutline,
      'order-safeguarding': mdiScaleBalance,
      'order-identity': mdiFingerprint,
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
