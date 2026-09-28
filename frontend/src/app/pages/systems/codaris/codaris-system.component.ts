import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';

@Component({
  selector: 'app-codaris-system',
  imports: [RouterLink],
  templateUrl: './codaris-system.component.html',
  styleUrl: './codaris-system.component.css',
})
export class CodarisSystemComponent {
  readonly codarisUrl = 'https://codaris.org';
  readonly topNavigation = inject(TopNavigationService);
}
