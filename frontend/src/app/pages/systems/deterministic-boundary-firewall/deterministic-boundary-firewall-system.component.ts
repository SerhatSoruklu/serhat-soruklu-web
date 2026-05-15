import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';

@Component({
  selector: 'app-deterministic-boundary-firewall-system',
  imports: [RouterLink],
  templateUrl: './deterministic-boundary-firewall-system.component.html',
  styleUrls: ['../research-system-page.css', './deterministic-boundary-firewall-system.component.css']
})
export class DeterministicBoundaryFirewallSystemComponent {
  readonly githubUrl = 'https://github.com/SerhatSoruklu/deterministic-boundary-firewall';
  readonly topNavigation = inject(TopNavigationService);
}
