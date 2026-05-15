import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';

@Component({
  selector: 'app-continuity-identity-model-system',
  imports: [RouterLink],
  templateUrl: './continuity-identity-model-system.component.html',
  styleUrls: ['../research-system-page.css', './continuity-identity-model-system.component.css']
})
export class ContinuityIdentityModelSystemComponent {
  readonly githubUrl = 'https://github.com/SerhatSoruklu/continuity-identity-model';
  readonly topNavigation = inject(TopNavigationService);
}
