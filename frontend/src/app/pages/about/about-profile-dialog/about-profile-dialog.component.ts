import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { mdiArrowTopRight, mdiClose } from '@mdi/js';

import { IdentityLanguageService } from '../../../core/identity/identity-language.service';
import { PathIconComponent } from '../../../shared/icons/path-icon.component';
import { ORIGINAL_PORTRAIT } from '../../../shared/portraits/original-portrait.config';
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
  readonly portrait = ORIGINAL_PORTRAIT;
  readonly portraitPath = ORIGINAL_PORTRAIT.src;
  readonly iconPaths = {
    close: mdiClose,
    external: mdiArrowTopRight,
  } as const;

  close(): void {
    this.dialogRef.close();
  }
}
