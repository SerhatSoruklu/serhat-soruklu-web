import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import {
  mdiCalendarMonthOutline,
  mdiClose,
  mdiFlagOutline,
  mdiHistory,
  mdiImageOutline,
  mdiMapOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';

import { saridibekPhotoAssets, saridibekPhotoContent } from '../saridibek-photo.content';
import type { SurnameImageDialogData } from '../surname-image-dialog.types';
import { SorukluSurnameLanguageService } from '../soruklu-surname-language.service';

@Component({
  selector: 'app-saridibek-dialog',
  imports: [MatIconModule],
  templateUrl: './saridibek-dialog.component.html',
  styleUrl: './saridibek-dialog.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class SaridibekDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<SaridibekDialogComponent>>(MatDialogRef);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly languageState = inject(SorukluSurnameLanguageService);
  private readonly dialogData = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as SurnameImageDialogData | null;

  readonly assets = this.dialogData?.assets ?? saridibekPhotoAssets;
  readonly contentPackage = this.dialogData?.content ?? saridibekPhotoContent;
  readonly content = computed(() => this.contentPackage[this.languageState.language()]);
  readonly isDictionary = this.assets.presentation === 'dictionary';
  readonly isDocument = this.assets.presentation === 'document';

  constructor() {
    this.registerIcons();
  }

  close(): void {
    this.dialogRef.close();
  }

  private registerIcons(): void {
    const icons = {
      'place-calendar': mdiCalendarMonthOutline,
      'place-close': mdiClose,
      'place-flag': mdiFlagOutline,
      'place-history': mdiHistory,
      'place-image': mdiImageOutline,
      'place-map': mdiMapOutline,
      'place-pin': mdiMapMarkerOutline,
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
