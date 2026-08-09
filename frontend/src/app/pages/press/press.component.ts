import { DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { pressContent } from './press.content';

@Component({
  selector: 'app-press',
  imports: [RouterLink],
  templateUrl: './press.component.html',
  styleUrl: './press.component.css',
})
export class PressComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly content = pressContent;

  constructor() {
    this.document.documentElement.lang = 'en-GB';
  }

  ngOnDestroy(): void {
    this.document.documentElement.lang = 'en';
  }
}
