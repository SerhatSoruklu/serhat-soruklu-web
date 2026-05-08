import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SeoService } from './seo.service';

@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seoService = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.seoService.applyRouteMetadata(snapshot.root);
  }
}
