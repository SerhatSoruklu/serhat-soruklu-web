import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  SimpleChanges,
  inject,
} from '@angular/core';

/** Inspect the original artwork without changing the card's 3D rotor or tap action. */
@Directive({ selector: '[appCardMagnifier]' })
export class CardMagnifierDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) appCardMagnifier = '';
  @Input() magnifierEnabled = true;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly view = this.browser ? this.document.defaultView : null;
  private readonly cleanups: (() => void)[] = [];
  private source: HTMLImageElement | null = null;
  private lens: HTMLElement | null = null;
  private detail: HTMLImageElement | null = null;
  private active: 'mouse' | 'touch' | 'keyboard' | null = null;
  private point = { x: 0.5, y: 0.5 };
  private frame: number | null = null;
  private hold: number | null = null;
  private pointer: number | null = null;
  private start = { x: 0, y: 0 };
  private readyAt = 0;
  private hoverDelay: number | null = null;
  private suppressClickUntil = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.magnifierEnabled || changes['appCardMagnifier']) this.reset();
    if (this.view && changes['magnifierEnabled'] && !changes['magnifierEnabled'].firstChange) {
      const reduced = this.view.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.readyAt = this.view.performance.now() + (reduced ? 0 : 780);
    }
  }

  ngAfterViewInit(): void {
    if (!this.view) return;
    this.source = this.host.querySelector<HTMLImageElement>(':scope > img');
    if (!this.source) return;
    this.renderer.addClass(this.host, 'card-art--inspectable');
    this.zone.runOutsideAngular(() => {
      this.listen(this.host, 'pointerenter', (event) => this.mouse(event as PointerEvent));
      this.listen(this.host, 'pointermove', (event) => this.move(event as PointerEvent));
      this.listen(this.host, 'pointerdown', (event) => this.press(event as PointerEvent));
      this.listen(this.host, 'pointerup', (event) => this.release(event as PointerEvent));
      this.listen(this.host, 'pointercancel', () => this.reset());
      this.listen(this.host, 'lostpointercapture', () => this.reset());
      this.listen(this.host, 'pointerleave', () => {
        if (this.active !== 'touch' && this.active !== 'keyboard') this.reset();
      });
      this.listen(
        this.host,
        'touchmove',
        (event) => {
          if ((event as TouchEvent).touches.length > 1) this.reset();
          if (this.active === 'touch' && event.cancelable) event.preventDefault();
        },
        { passive: false },
      );
      this.listen(this.host, 'contextmenu', (event) => {
        if (this.hold !== null || this.active === 'touch') event.preventDefault();
      });
      this.listen(
        this.host,
        'click',
        (event) => {
          const click = event as MouseEvent;
          if (click.detail > 0 && this.view!.performance.now() < this.suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
            this.suppressClickUntil = 0;
          }
        },
        { capture: true },
      );
      const button = this.host.closest('button');
      if (button) {
        this.listen(button, 'keydown', (event) => this.key(event as KeyboardEvent));
        this.listen(button, 'blur', () => this.reset());
      }
      this.listen(this.view!, 'resize', () => this.reset());
      this.listen(this.view!, 'blur', () => this.reset());
      this.listen(this.view!, 'scroll', () => this.reset(), { passive: true, capture: true });
    });
  }

  ngOnDestroy(): void {
    this.reset();
    this.cleanups.forEach((cleanup) => cleanup());
    if (this.lens) this.renderer.removeChild(this.host, this.lens);
  }

  private listen(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, handler, options);
    this.cleanups.push(() => target.removeEventListener(type, handler, options));
  }

  private available(): boolean {
    return !!this.view && this.magnifierEnabled && this.view.performance.now() >= this.readyAt;
  }

  private mouse(event: PointerEvent): void {
    if (
      event.pointerType !== 'mouse' ||
      !this.view ||
      !this.magnifierEnabled ||
      !this.view!.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches
    )
      return;
    this.setPoint(event);
    if (!this.available()) {
      if (this.hoverDelay === null) {
        this.hoverDelay = this.view.setTimeout(
          () => {
            this.hoverDelay = null;
            if (this.available() && this.host.matches(':hover')) this.activate('mouse');
          },
          Math.max(0, this.readyAt - this.view.performance.now()) + 20,
        );
      }
      return;
    }
    this.activate('mouse');
  }

  private move(event: PointerEvent): void {
    if (event.pointerType === 'mouse') {
      this.mouse(event);
      return;
    }
    if (this.active === 'touch') {
      this.setPoint(event);
      this.schedule();
    } else if (
      this.hold !== null &&
      Math.hypot(event.clientX - this.start.x, event.clientY - this.start.y) > 8
    ) {
      this.cancelHold();
    }
  }

  private press(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' && !event.isPrimary) {
      this.reset();
      return;
    }
    if (!this.available() || event.pointerType === 'mouse') return;
    this.cancelHold();
    this.start = { x: event.clientX, y: event.clientY };
    this.setPoint(event);
    this.hold = this.view!.setTimeout(() => {
      this.hold = null;
      if (!this.available()) return;
      this.pointer = event.pointerId;
      try {
        this.host.setPointerCapture(event.pointerId);
      } catch {
        /* Pointer already released. */
      }
      this.activate('touch');
    }, 380);
  }

  private release(event: PointerEvent): void {
    if (this.active === 'touch') {
      this.suppressClickUntil = this.view!.performance.now() + 250;
      if (event.cancelable) event.preventDefault();
    }
    if (event.pointerType !== 'mouse') this.reset();
  }

  private key(event: KeyboardEvent): void {
    if (!this.available() || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.point = { x: 0.5, y: 0.5 };
      this.activate('keyboard');
      return;
    }
    if (this.active !== 'keyboard') return;
    if (event.key === 'Escape' || event.key === '-') {
      event.preventDefault();
      this.reset();
      return;
    }
    const directions: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -0.08, y: 0 },
      ArrowRight: { x: 0.08, y: 0 },
      ArrowUp: { x: 0, y: -0.08 },
      ArrowDown: { x: 0, y: 0.08 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    this.point = {
      x: this.clamp(this.point.x + direction.x, 0, 1),
      y: this.clamp(this.point.y + direction.y, 0, 1),
    };
    this.schedule();
  }

  private setPoint(event: PointerEvent): void {
    // Images/lens ignore hit testing, so offsets are in the untransformed artwork plane.
    this.point = {
      x: this.clamp(event.offsetX / this.host.clientWidth, 0, 1),
      y: this.clamp(event.offsetY / this.host.clientHeight, 0, 1),
    };
  }

  private activate(kind: 'mouse' | 'touch' | 'keyboard'): void {
    this.active = kind;
    if (!this.lens) {
      this.lens = this.renderer.createElement('span') as HTMLElement;
      this.detail = this.renderer.createElement('img') as HTMLImageElement;
      this.renderer.addClass(this.lens, 'card-magnifier');
      this.renderer.setAttribute(this.lens, 'aria-hidden', 'true');
      this.renderer.setAttribute(this.detail, 'alt', '');
      this.renderer.setAttribute(this.detail, 'draggable', 'false');
      this.listen(this.detail, 'load', () => {
        if (this.active) this.schedule();
      });
      this.listen(this.detail, 'error', () => this.reset());
      this.renderer.appendChild(this.host, this.lens);
    }
    if (this.detail!.getAttribute('src') !== this.appCardMagnifier) {
      this.renderer.setAttribute(this.detail, 'src', this.appCardMagnifier);
    }
    this.schedule();
  }

  private schedule(): void {
    if (this.frame !== null || !this.view) return;
    this.frame = this.view.requestAnimationFrame(() => {
      this.frame = null;
      this.paint();
    });
  }

  private paint(): void {
    if (
      !this.active ||
      !this.lens ||
      !this.detail ||
      !this.source ||
      !this.detail.complete ||
      !this.detail.naturalWidth
    )
      return;
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    if (!width || !height) return;
    const size = Math.min(148, width * 0.52, height * 0.82);
    const x = this.point.x * width;
    const y = this.point.y * height;
    const sourceStyle = this.view!.getComputedStyle(this.source);
    const styles: Record<string, string> = {
      width: `${size}px`,
      height: `${size}px`,
      left: `${this.clamp(x - size / 2, 2, width - size - 2)}px`,
      top: `${this.clamp(y - size / 2, 2, height - size - 2)}px`,
    };
    for (const [property, value] of Object.entries(styles))
      this.renderer.setStyle(this.lens, property, value);
    // Paint one background layer: nested oversized images can disappear in a 3D rotor.
    const imageStyles: Record<string, string> = {
      'background-image': `url("${this.appCardMagnifier}")`,
      'background-size': `${Number.parseFloat(sourceStyle.width) * 2.5}px auto`,
      'background-position': `${(size - 4) / 2 - (x - Number.parseFloat(sourceStyle.left)) * 2.5}px ${(size - 4) / 2 - (y - Number.parseFloat(sourceStyle.top)) * 2.5}px`,
    };
    for (const [property, value] of Object.entries(imageStyles))
      this.renderer.setStyle(this.lens, property, value);
    this.renderer.addClass(this.host, 'is-inspecting');
    this.renderer.addClass(this.host.parentElement, 'is-inspecting');
  }

  private reset(): void {
    this.active = null;
    this.cancelHold();
    if (this.hoverDelay !== null) this.view?.clearTimeout(this.hoverDelay);
    this.hoverDelay = null;
    if (this.frame !== null) this.view?.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.renderer.removeClass(this.host, 'is-inspecting');
    if (this.host.parentElement)
      this.renderer.removeClass(this.host.parentElement, 'is-inspecting');
    const pointer = this.pointer;
    this.pointer = null;
    if (pointer !== null && this.host.hasPointerCapture(pointer))
      this.host.releasePointerCapture(pointer);
  }

  private cancelHold(): void {
    if (this.hold !== null) this.view?.clearTimeout(this.hold);
    this.hold = null;
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(maximum, value));
  }
}
