import { Component, input } from '@angular/core';

@Component({
  selector: 'app-path-icon',
  template: `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path [attr.d]="path()"></path>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 24px;
      height: 24px;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      line-height: 1;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `,
  host: {
    'aria-hidden': 'true',
    class: 'mat-icon mat-icon-no-color',
    '[attr.data-mat-icon-name]': 'name()',
  },
})
export class PathIconComponent {
  readonly path = input.required<string>();
  readonly name = input('');
}
