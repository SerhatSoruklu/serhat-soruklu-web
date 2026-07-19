import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  mdiAccountGroupOutline,
  mdiBookOpenPageVariantOutline,
  mdiFingerprint,
  mdiScaleBalance,
} from '@mdi/js';
import { siX } from 'simple-icons';

import { PathIconComponent } from '../../shared/icons/path-icon.component';

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
  clarification?: string;
}

@Component({
  selector: 'app-soruklu-order',
  imports: [PathIconComponent, RouterLink],
  templateUrl: './soruklu-order.component.html',
  styleUrl: './soruklu-order.component.css',
})
export class SorukluOrderComponent {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.png';
  readonly officialXUrl = 'https://x.com/sorukluorder';
  readonly xIconPath = siX.path;
  readonly iconPaths: Readonly<Record<string, string>> = {
    'order-family': mdiAccountGroupOutline,
    'order-purpose': mdiBookOpenPageVariantOutline,
    'order-safeguarding': mdiScaleBalance,
    'order-identity': mdiFingerprint,
  };

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
        'Preserve authorised family context, historical records and shared principles with enough context to remain useful.',
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
        'Maintain a durable digital record of the initiative’s authorised materials, boundaries and principles.',
    },
    {
      index: '05',
      title: 'Future generations',
      description:
        'Preserve authorised context and values so future family members may understand them rather than repeatedly reconstructing them.',
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
      description: 'Accept ownership for decisions, obligations and their consequences.',
    },
    {
      title: 'Loyalty',
      description: 'Support one another honestly without excusing harmful or unlawful conduct.',
    },
    {
      title: 'Truth',
      description: 'Prefer evidence, accuracy and correction over convenience or appearance.',
    },
    {
      title: 'Self-mastery',
      description: 'Develop judgement, restraint and the ability to govern one’s own conduct.',
    },
    {
      title: 'Lawful conduct',
      description:
        'Act within the law and respect due process, individual rights and public institutions.',
    },
    {
      title: 'Continuity',
      description: 'Carry useful knowledge forward without turning inheritance into entitlement.',
    },
  ];

  readonly roles: readonly OrderRole[] = [
    {
      title: 'Founder and Steward',
      description:
        'Maintains the initiative’s purpose, boundaries, authorised records and long-term direction.',
    },
    {
      title: 'Senior Family Adviser',
      description: 'Provides family perspective, historical context and measured counsel.',
    },
    {
      title: 'Safeguarding and Preparedness',
      description:
        'Supports wellbeing, lawful safeguarding, responsible preparedness and practical emergency planning.',
    },
    {
      title: 'Family Adviser',
      description:
        'Offers considered advice and helps members examine difficult decisions without holding binding authority.',
    },
    {
      title: 'Legal Liaison',
      description:
        'Encourages lawful process and identifies when qualified independent legal advice may be needed.',
      clarification:
        'This role does not automatically create a solicitor-client relationship, represent the wider family, replace independent qualified legal advice, or confer judicial or enforcement authority.',
    },
    {
      title: 'Records and Continuity',
      description:
        'Preserves authorised records and context for members who may carry the initiative’s work forward.',
    },
  ];
}
