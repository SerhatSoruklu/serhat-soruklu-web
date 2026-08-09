import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiArrowRight,
  mdiBriefcaseOutline,
  mdiClipboardCheckOutline,
  mdiDatabaseOutline,
  mdiEmailOutline,
  mdiGithub,
  mdiHubOutline,
  mdiLockCheckOutline,
  mdiShieldCheckOutline,
  mdiSitemapOutline,
  mdiTimelineCheckOutline,
  mdiTransitConnectionVariant
} from '@mdi/js';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

interface SystemsMapColumn {
  title: string;
  description: string;
  systems: readonly string[];
}

interface SystemHubCard {
  icon: string;
  brand?: 'coupyn' | 'chatpdm';
  category: string;
  title: string;
  description: string;
  status: string;
  chips: readonly string[];
  primaryLabel: string;
  primaryPath: string;
  secondaryLabel: string;
  secondaryPath?: string;
  secondaryUrl?: string;
}

interface PrincipleTile {
  title: string;
  description: string;
}

interface NextRoute {
  icon: string;
  label: string;
  description: string;
  path: string;
}

interface ArchitectureNode {
  icon: string;
  index: string;
  label: string;
  description: string;
  group: string;
}

@Component({
  selector: 'app-systems',
  imports: [MatIconModule, RouterLink, TooltipDirective],
  templateUrl: './systems.component.html',
  styleUrl: './systems.component.css'
})
export class SystemsComponent {
  readonly topNavigation = inject(TopNavigationService);

  @ViewChild('systemCardsSection')
  private readonly systemCardsSection?: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly architectureNodes: readonly ArchitectureNode[] = [
    {
      icon: 'systems-stack-production',
      index: '01',
      label: 'Coupyn',
      description: 'Commerce infrastructure',
      group: 'Production'
    },
    {
      icon: 'systems-stack-governance',
      index: '02',
      label: 'ChatPDM',
      description: 'Deterministic governance runtime',
      group: 'Runtime'
    },
    {
      icon: 'systems-stack-boundary',
      index: '03',
      label: 'DBF',
      description: 'Boundary research',
      group: 'Research'
    },
    {
      icon: 'systems-stack-continuity',
      index: '04',
      label: 'CIM',
      description: 'Continuity model',
      group: 'Model'
    }
  ];

  readonly systemsMap: readonly SystemsMapColumn[] = [
    {
      title: 'Production Work',
      description: 'Live or product-facing work with operational surfaces, discovery paths, and long-term maintenance responsibilities.',
      systems: ['Coupyn', 'ChatPDM']
    },
    {
      title: 'Research / Architecture',
      description: 'Architecture models for deterministic boundaries, state continuity, and controlled failure.',
      systems: ['Deterministic Boundary Firewall', 'Continuity Identity Model']
    }
  ];

  readonly systemCards: readonly SystemHubCard[] = [
    {
      icon: 'systems-card-coupyn',
      brand: 'coupyn',
      category: 'Production System',
      title: 'Coupyn',
      description: 'Coupon and referral discovery infrastructure built around company pages, listings, trust signals, and durable SEO discovery.',
      status: 'Production platform',
      chips: ['950k+ company pages', 'Angular / Node / MongoDB', 'SEO-scale directory'],
      primaryLabel: 'View Coupyn System',
      primaryPath: '/systems/coupyn',
      secondaryLabel: 'Open Coupyn',
      secondaryUrl: 'https://coupyn.com'
    },
    {
      icon: 'systems-card-chatpdm',
      brand: 'chatpdm',
      category: 'Deterministic System',
      title: 'ChatPDM',
      description: 'A deterministic language governance runtime for keeping concepts bounded, explicit, and refusal-safe.',
      status: 'Live system / evolving runtime',
      chips: ['Meaning boundaries', 'Refusal-first logic', 'Governance layer'],
      primaryLabel: 'View ChatPDM System',
      primaryPath: '/systems/chatpdm',
      secondaryLabel: 'Open ChatPDM',
      secondaryUrl: 'https://chatpdm.com'
    },
    {
      icon: 'systems-card-dbf',
      category: 'Research System',
      title: 'Deterministic Boundary Firewall',
      description: 'A bounded pre-egress phrase-and-pattern gate that checks configured tripwires before model or tool calls and returns deterministic refusal payloads.',
      status: 'Research / architecture model',
      chips: ['Pre-egress checks', 'Refusal payloads', 'Safe failure'],
      primaryLabel: 'View DBF',
      primaryPath: '/systems/deterministic-boundary-firewall',
      secondaryLabel: 'View GitHub',
      secondaryPath: '/github'
    },
    {
      icon: 'systems-card-cim',
      category: 'Research System',
      title: 'Continuity Identity Model',
      description: 'A deterministic model for identity continuity, state preservation, and trust during system change.',
      status: 'Research / architecture model',
      chips: ['State continuity', 'Identity boundaries', 'Trust preservation'],
      primaryLabel: 'View CIM',
      primaryPath: '/systems/continuity-identity-model',
      secondaryLabel: 'View GitHub',
      secondaryPath: '/github'
    }
  ];

  readonly principles: readonly PrincipleTile[] = [
    {
      title: 'Explicit Boundaries',
      description: 'Systems should define what they accept, reject, and preserve.'
    },
    {
      title: 'Operational Discipline',
      description: 'Architecture has to survive deployment, maintenance, and failure.'
    },
    {
      title: 'Long-Horizon Structure',
      description: 'Build for years of iteration, not one launch.'
    },
    {
      title: 'Controlled Complexity',
      description: 'Complexity is acceptable when it stays visible, bounded, and testable.'
    },
    {
      title: 'Safe Failure',
      description: 'A serious system should refuse clearly before it drifts silently.'
    }
  ];

  readonly nextRoutes: readonly NextRoute[] = [
    {
      icon: 'systems-next-work',
      label: 'Work',
      description: 'Production execution and ownership.',
      path: '/work'
    },
    {
      icon: 'systems-next-github',
      label: 'GitHub',
      description: 'Repositories, specs, and public code.',
      path: '/github'
    },
    {
      icon: 'systems-next-contact',
      label: 'Contact',
      description: 'A direct route for opportunities and discussion.',
      path: '/contact'
    }
  ];

  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcons();
  }

  scrollToSystemCards(event: Event): void {
    event.preventDefault();

    const browserWindow = this.isBrowser ? this.document.defaultView : null;

    if (!browserWindow || !this.systemCardsSection) {
      return;
    }

    const headerHeight = this.document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
    const prefersReducedMotion = browserWindow.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetTop = this.systemCardsSection.nativeElement.getBoundingClientRect().top + browserWindow.scrollY;

    browserWindow.scrollTo({
      top: Math.max(0, targetTop - headerHeight - 20),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  private registerIcons(): void {
    const icons = {
      'systems-card-chatpdm': mdiHubOutline,
      'systems-card-cim': mdiTransitConnectionVariant,
      'systems-card-coupyn': mdiSitemapOutline,
      'systems-card-dbf': mdiLockCheckOutline,
      'systems-next-contact': mdiEmailOutline,
      'systems-next-github': mdiGithub,
      'systems-next-work': mdiBriefcaseOutline,
      'systems-next-arrow': mdiArrowRight,
      'systems-stack-boundary': mdiShieldCheckOutline,
      'systems-stack-continuity': mdiTimelineCheckOutline,
      'systems-stack-governance': mdiClipboardCheckOutline,
      'systems-stack-production': mdiDatabaseOutline
    };

    for (const [name, path] of Object.entries(icons)) {
      this.iconRegistry.addSvgIconLiteral(
        name,
        this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`) // NOSONAR: icon paths are compile-time constants from @mdi/js, not user input.
      );
    }
  }
}
