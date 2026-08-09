import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { mdiArrowTopRight, mdiClose } from '@mdi/js';

import { IdentityLanguageService } from '../../../core/identity/identity-language.service';
import { PathIconComponent } from '../../../shared/icons/path-icon.component';
import { aboutContent } from '../about.content';

@Component({
  selector: 'app-about-profile-dialog',
  imports: [PathIconComponent],
  templateUrl: './about-profile-dialog.component.html',
  styleUrl: './about-profile-dialog.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AboutProfileDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<AboutProfileDialogComponent>>(MatDialogRef);
  private readonly identityLanguage = inject(IdentityLanguageService);

  readonly content = computed(() => aboutContent[this.identityLanguage.language()]);
  readonly portraitPath = '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png';
  readonly iconPaths = {
    close: mdiClose,
    external: mdiArrowTopRight,
  } as const;

  close(): void {
    this.dialogRef.close();
  }
}
