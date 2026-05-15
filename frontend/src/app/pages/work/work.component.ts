import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';

@Component({
  selector: 'app-work',
  imports: [RouterLink],
  templateUrl: './work.component.html',
  styleUrl: './work.component.css'
})
export class WorkComponent {
  readonly githubUrl = 'https://github.com/SerhatSoruklu';
  readonly topNavigation = inject(TopNavigationService);
}
