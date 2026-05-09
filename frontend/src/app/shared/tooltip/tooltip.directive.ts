import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  RendererStyleFlags2
} from '@angular/core';

type TooltipPlacement = 'top' | 'right' | 'bottom';

let tooltipId = 0;

function createTooltipId(): string {
  tooltipId += 1;
  return `app-tooltip-${tooltipId}`;
}

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;
  private readonly id = createTooltipId();
  private tooltipElement: HTMLElement | null = null;
  private hideTimer: number | null = null;

  readonly appTooltip = input('');
  readonly appTooltipPlacement = input<TooltipPlacement>('bottom');

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    if (!this.isBrowser || !this.appTooltip().trim()) {
      return;
    }

    if (this.hideTimer !== null) {
      this.browserWindow?.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (!this.tooltipElement) {
      this.tooltipElement = this.renderer.createElement('span');
      this.renderer.setAttribute(this.tooltipElement, 'id', this.id);
      this.renderer.setAttribute(this.tooltipElement, 'role', 'tooltip');
      this.renderer.addClass(this.tooltipElement, 'app-tooltip');
      this.renderer.appendChild(this.document.body, this.tooltipElement);
    }

    this.applyPlacementClass();
    this.renderer.setProperty(this.tooltipElement, 'textContent', this.appTooltip());
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-describedby', this.id);
    this.positionTooltip();
    this.renderer.addClass(this.tooltipElement, 'app-tooltip--visible');
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide(): void {
    if (!this.tooltipElement || !this.isBrowser) {
      return;
    }

    this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
    this.renderer.removeClass(this.tooltipElement, 'app-tooltip--visible');
    this.hideTimer = this.browserWindow?.setTimeout(() => this.destroyTooltip(), 180) ?? null;
  }

  @HostListener('click')
  @HostListener('keydown.escape')
  hideImmediately(): void {
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
    this.destroyTooltip();
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) {
      return;
    }

    const triggerBox = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipBox = this.tooltipElement.getBoundingClientRect();
    const gap = 10;
    const viewportPadding = 12;
    const arrowPadding = 14;
    const viewportWidth = this.document.documentElement.clientWidth;
    const viewportHeight = this.document.documentElement.clientHeight;
    const placement = this.appTooltipPlacement();
    const centeredLeft = triggerBox.left + (triggerBox.width / 2) - (tooltipBox.width / 2);
    const centeredTop = triggerBox.top + (triggerBox.height / 2) - (tooltipBox.height / 2);
    const horizontalLeft = Math.min(Math.max(centeredLeft, viewportPadding), viewportWidth - tooltipBox.width - viewportPadding);
    const rightLeft = Math.min(
      Math.max(triggerBox.right + gap, viewportPadding),
      viewportWidth - tooltipBox.width - viewportPadding
    );
    const left = placement === 'right' ? rightLeft : horizontalLeft;
    const top = placement === 'right'
      ? Math.min(Math.max(centeredTop, viewportPadding), viewportHeight - tooltipBox.height - viewportPadding)
      : placement === 'top'
        ? triggerBox.top - tooltipBox.height - gap
        : triggerBox.bottom + gap;
    const triggerCenterX = triggerBox.left + (triggerBox.width / 2);
    const triggerCenterY = triggerBox.top + (triggerBox.height / 2);
    const arrowOffset = placement === 'right'
      ? Math.min(Math.max(triggerCenterY - top, arrowPadding), tooltipBox.height - arrowPadding)
      : Math.min(Math.max(triggerCenterX - left, arrowPadding), tooltipBox.width - arrowPadding);

    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'top', `${Math.max(top, viewportPadding)}px`);
    this.renderer.setStyle(this.tooltipElement, '--tooltip-arrow-left', `${arrowOffset}px`, RendererStyleFlags2.DashCase);
    this.renderer.setStyle(this.tooltipElement, '--tooltip-arrow-top', `${arrowOffset}px`, RendererStyleFlags2.DashCase);
  }

  private applyPlacementClass(): void {
    if (!this.tooltipElement) {
      return;
    }

    this.renderer.removeClass(this.tooltipElement, 'app-tooltip--top');
    this.renderer.removeClass(this.tooltipElement, 'app-tooltip--right');
    this.renderer.removeClass(this.tooltipElement, 'app-tooltip--bottom');
    this.renderer.addClass(this.tooltipElement, `app-tooltip--${this.appTooltipPlacement()}`);
  }

  private destroyTooltip(): void {
    if (this.hideTimer !== null) {
      this.browserWindow?.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.tooltipElement) {
      this.renderer.removeChild(this.document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
