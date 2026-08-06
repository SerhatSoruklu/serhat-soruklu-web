import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  mdiCalendarMonthOutline,
  mdiClose,
  mdiFlagOutline,
  mdiHistory,
  mdiImageOutline,
  mdiMapOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';

import { PathIconComponent } from '../../../shared/icons/path-icon.component';
import { saridibekPhotoAssets, saridibekPhotoContent } from '../saridibek-photo.content';
import type { SurnameImageDialogData } from '../surname-image-dialog.types';
import { SorukluSurnameLanguageService } from '../soruklu-surname-language.service';

@Component({
  selector: 'app-saridibek-dialog',
  imports: [PathIconComponent],
  templateUrl: './saridibek-dialog.component.html',
  styleUrl: './saridibek-dialog.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class SaridibekDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<SaridibekDialogComponent>>(MatDialogRef);
  private readonly languageState = inject(SorukluSurnameLanguageService);
  private readonly dialogData = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as SurnameImageDialogData | null;

  readonly assets = this.dialogData?.assets ?? saridibekPhotoAssets;
  readonly contentPackage = this.dialogData?.content ?? saridibekPhotoContent;
  readonly content = computed(() => this.contentPackage[this.languageState.language()]);
  readonly isDictionary = this.assets.presentation === 'dictionary';
  readonly isDocument = this.assets.presentation === 'document';
  readonly iconPaths: Readonly<Record<string, string>> = {
    'place-calendar': mdiCalendarMonthOutline,
    'place-close': mdiClose,
    'place-flag': mdiFlagOutline,
    'place-history': mdiHistory,
    'place-image': mdiImageOutline,
    'place-map': mdiMapOutline,
    'place-pin': mdiMapMarkerOutline,
  };

  close(): void {
    this.dialogRef.close();
  }
}
