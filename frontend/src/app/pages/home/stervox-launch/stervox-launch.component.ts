import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  TransferState,
  afterNextRender,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { StervoxBrandComponent } from '../../../shared/stervox-brand/stervox-brand.component';

// Midnight in the UK on 5 January 2027 (GMT). An absolute deadline survives restarts.
export const STERVOX_RELEASE_AT = Date.UTC(2027, 0, 5);
const CLOCK_SNAPSHOT = makeStateKey<number>('stervox-launch-clock');

export function countdownParts(now: number) {
  const remaining = Math.max(0, Math.ceil((STERVOX_RELEASE_AT - now) / 1000));
  return [
    { label: 'Days', value: Math.floor(remaining / 86400) },
    { label: 'Hours', value: Math.floor(remaining / 3600) % 24 },
    { label: 'Minutes', value: Math.floor(remaining / 60) % 60 },
    { label: 'Seconds', value: remaining % 60 },
  ];
}

export function countdownDigits(value: number, previous: number) {
  const width = Math.max(2, String(value).length, String(previous).length);
  const before = String(previous).padStart(width, '0');
  return [...String(value).padStart(width, '0')].map((digit, index) => ({
    value: digit,
    previous: before[index],
    changed: digit !== before[index],
    odd: Number(digit) % 2 === 1,
  }));
}

@Component({
  selector: 'app-stervox-launch',
  imports: [StervoxBrandComponent, RouterLink],
  templateUrl: './stervox-launch.component.html',
  styleUrl: './stervox-launch.component.css',
})
export class StervoxLaunchComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transfer = inject(TransferState);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly view = this.browser ? this.document.defaultView : null;
  private readonly now = signal(this.transfer.get(CLOCK_SNAPSHOT, Date.now()));
  private timer: number | null = null;

  readonly reachedTarget = computed(() => this.now() >= STERVOX_RELEASE_AT);
  readonly units = computed(() => {
    const previous = countdownParts(this.now() - 1000);
    return countdownParts(this.now()).map((part, index) => ({
      label: part.label,
      value: String(part.value).padStart(2, '0'),
      digits: countdownDigits(part.value, previous[index].value),
    }));
  });
  readonly accessibleTime = computed(() =>
    this.reachedTarget()
      ? 'The planned release date has been reached. Check Stervox for the latest status.'
      : countdownParts(this.now())
          .map((part) => `${part.value} ${part.label.toLowerCase()}`)
          .join(', ') + ' until the planned Stervox release on 5 January 2027.',
  );

  constructor() {
    if (!this.browser) this.transfer.set(CLOCK_SNAPSHOT, this.now());
    afterNextRender(() => {
      if (!this.view) return;
      this.transfer.remove(CLOCK_SNAPSHOT);
      const update = () => {
        if (this.timer !== null) this.view!.clearTimeout(this.timer);
        this.timer = null;
        this.now.set(Date.now());
        if (!this.document.hidden && !this.reachedTarget()) {
          this.timer = this.view!.setTimeout(update, 1000 - (Date.now() % 1000));
        }
      };
      this.document.addEventListener('visibilitychange', update);
      update();
      this.destroyRef.onDestroy(() => {
        if (this.timer !== null) this.view?.clearTimeout(this.timer);
        this.document.removeEventListener('visibilitychange', update);
      });
    });
  }
}
