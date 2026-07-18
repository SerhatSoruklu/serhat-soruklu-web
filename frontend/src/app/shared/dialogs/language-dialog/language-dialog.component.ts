import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiClose,
  mdiEarth,
  mdiTranslate,
  mdiWeb,
} from '@mdi/js';

import { PathIconComponent } from '../../icons/path-icon.component';

@Component({
  selector: 'app-language-dialog',
  imports: [PathIconComponent],
  templateUrl: './language-dialog.component.html',
  styleUrl: './language-dialog.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class LanguageDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<LanguageDialogComponent>>(MatDialogRef);

  readonly iconPaths = {
    check: mdiCheckCircleOutline,
    clock: mdiClockOutline,
    close: mdiClose,
    earth: mdiEarth,
    translate: mdiTranslate,
    web: mdiWeb,
  };

  readonly languageCodes = ['EN', 'TR', 'ES', 'DE', 'FR', 'JA'];
  readonly rolloutPoints = [
    'Carefully localized content',
    'Consistent systems experience',
    'Responsive across every screen',
  ];

  close(): void {
    this.dialogRef.close();
  }
}
