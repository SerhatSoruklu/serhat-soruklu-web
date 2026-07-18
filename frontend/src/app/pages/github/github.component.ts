import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  mdiArrowRight,
  mdiArrowTopRight,
  mdiFileCodeOutline,
  mdiFlaskOutline,
  mdiGithub,
  mdiShieldLockOutline,
  mdiSourceRepository,
  mdiWeb,
} from '@mdi/js';

interface PublicRepository {
  slug: string;
  category: string;
  title: string;
  description: string;
  technologies: readonly string[];
  githubUrl: string;
  systemPath?: string;
}

@Component({
  selector: 'app-github-page',
  imports: [MatIconModule, RouterLink],
  templateUrl: './github.component.html',
  styleUrl: './github.component.css',
})
export class GitHubComponent {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  readonly profileUrl = 'https://github.com/SerhatSoruklu';
  readonly coupynUrl = 'https://coupyn.com';

  readonly flagshipRepository: PublicRepository = {
    slug: 'chatpdm',
    category: 'Flagship system',
    title: 'ChatPDM',
    description:
      'A deterministic language-governance runtime built to keep concepts bounded, make unsupported requests explicit, and fail safely before meaning drifts.',
    technologies: ['Node.js', 'Deterministic systems', 'Language governance'],
    githubUrl: 'https://github.com/SerhatSoruklu/chatpdm',
    systemPath: '/systems/chatpdm',
  };

  readonly researchRepositories: readonly PublicRepository[] = [
    {
      slug: 'deterministic-boundary-firewall',
      category: 'Research system / DBF',
      title: 'Deterministic Boundary Firewall',
      description:
        'A boundary-enforcement model for checking claims before egress, refusing unsupported transitions, and preserving deterministic behaviour across tool boundaries.',
      technologies: ['Python', 'Boundary enforcement', 'Refusal-safe'],
      githubUrl: 'https://github.com/SerhatSoruklu/deterministic-boundary-firewall',
      systemPath: '/systems/deterministic-boundary-firewall',
    },
    {
      slug: 'continuity-identity-model',
      category: 'Research protocol / CIM',
      title: 'Continuity Identity Model',
      description:
        'A protocol for deciding whether identity, authority, and responsibility survive a state change instead of assuming that continuity is automatic.',
      technologies: ['TypeScript', 'Identity continuity', 'State transitions'],
      githubUrl: 'https://github.com/SerhatSoruklu/continuity-identity-model',
      systemPath: '/systems/continuity-identity-model',
    },
  ];

  readonly supportingRepositories: readonly PublicRepository[] = [
    {
      slug: 'serhat-soruklu-web',
      category: 'Portfolio architecture',
      title: 'serhat-soruklu-web',
      description:
        'The source for this portfolio: an Angular SSR frontend, a restrained responsive system, and the engineering decisions behind the public surface.',
      technologies: ['Angular', 'SSR', 'Responsive UI'],
      githubUrl: 'https://github.com/SerhatSoruklu/serhat-soruklu-web',
    },
    {
      slug: 'zeroglare-continuity-system',
      category: 'Concept laboratory',
      title: 'ZeroGlare Continuity System',
      description:
        'A smaller continuity-system repository exploring how a clear operating model can outlive individual tools, interfaces, and implementation choices.',
      technologies: ['JavaScript', 'Continuity', 'System model'],
      githubUrl: 'https://github.com/SerhatSoruklu/zeroglare-continuity-system',
    },
  ];

  constructor() {
    this.registerIcons();
  }

  private registerIcons(): void {
    const icons = {
      'github-arrow': mdiArrowRight,
      'github-external': mdiArrowTopRight,
      'github-code': mdiFileCodeOutline,
      'github-mark': mdiGithub,
      'github-private': mdiShieldLockOutline,
      'github-research': mdiFlaskOutline,
      'github-repository': mdiSourceRepository,
      'github-web': mdiWeb,
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
