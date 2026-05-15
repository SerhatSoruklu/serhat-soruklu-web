import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { mdiEmailOutline, mdiNavigationVariantOutline, mdiSitemapOutline } from '@mdi/js';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';

interface FooterLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css'
})
export class SiteFooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly topNavigation = inject(TopNavigationService);
  readonly groupIconPaths = {
    navigate: mdiNavigationVariantOutline,
    reach: mdiEmailOutline,
    systems: mdiSitemapOutline
  };

  readonly navLinks: FooterLink[] = [
    { label: 'Home', path: '/' },
    { label: 'Work', path: '/work' },
    { label: 'Systems', path: '/systems' },
    { label: 'Writing', path: '/writing' },
    { label: 'GitHub', path: '/github' }
  ];

  readonly systemLinks: FooterLink[] = [
    { label: 'Coupyn', path: '/systems/coupyn' },
    { label: 'ChatPDM', path: '/systems/chatpdm' },
    { label: 'DBF', path: '/systems/deterministic-boundary-firewall' },
    { label: 'CIM', path: '/systems/continuity-identity-model' }
  ];

  readonly reachLinks: FooterLink[] = [
    { label: 'Contact', path: '/contact' }
  ];
}
