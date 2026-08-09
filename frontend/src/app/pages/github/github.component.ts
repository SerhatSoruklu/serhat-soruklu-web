import { Component } from '@angular/core';
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

import { PathIconComponent } from '../../shared/icons/path-icon.component';

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
  imports: [PathIconComponent, RouterLink],
  templateUrl: './github.component.html',
  styleUrl: './github.component.css',
})
export class GitHubComponent {
  readonly profileUrl = 'https://github.com/SerhatSoruklu';
  readonly coupynUrl = 'https://coupyn.com';
  readonly iconPaths: Readonly<Record<string, string>> = {
    'github-arrow': mdiArrowRight,
    'github-external': mdiArrowTopRight,
    'github-code': mdiFileCodeOutline,
    'github-mark': mdiGithub,
    'github-private': mdiShieldLockOutline,
    'github-research': mdiFlaskOutline,
    'github-repository': mdiSourceRepository,
    'github-web': mdiWeb,
  };

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
        'A bounded pre-egress phrase-and-pattern gate that checks configured tripwires before model or tool calls and returns deterministic refusal payloads.',
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
}
