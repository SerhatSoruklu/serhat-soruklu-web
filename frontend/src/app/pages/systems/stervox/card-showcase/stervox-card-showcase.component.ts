import { Component, signal } from '@angular/core';
import { CardMagnifierDirective } from './card-magnifier.directive';

function artwork(id: string) {
  const prefix = `/assets/projects/stervox/cards/${id}`;
  return {
    front: `${prefix}-front.webp`,
    back: `${prefix}-back.webp`,
    frontSrcset: `${prefix}-front-600.webp 600w, ${prefix}-front.webp 1200w`,
    backSrcset: `${prefix}-back-600.webp 600w, ${prefix}-back.webp 1200w`,
  };
}

@Component({
  selector: 'app-stervox-card-showcase',
  imports: [CardMagnifierDirective],
  templateUrl: './stervox-card-showcase.component.html',
  styleUrl: './stervox-card-showcase.component.css',
})
export class StervoxCardShowcaseComponent {
  readonly reversedCards = signal<ReadonlySet<string>>(new Set());
  readonly imageSizes =
    '(min-width: 1440px) 400px, (min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw';
  readonly cards = [
    {
      id: 'everyday',
      name: 'Everyday',
      index: '01',
      backHeight: 676,
      description: 'Ice blue, with Stervox’s signature navy edge.',
      ...artwork('everyday'),
    },
    {
      id: 'gold',
      name: 'Gold',
      index: '02',
      backHeight: 675,
      description: 'Brushed gold. A warmer expression of the same identity.',
      ...artwork('gold'),
    },
    {
      id: 'business-reserve',
      name: 'Business Reserve',
      index: '03',
      backHeight: 675,
      description: 'Deep navy, ribbed detailing and a silver finish.',
      ...artwork('business-reserve'),
    },
  ] as const;

  rotate(id: string): void {
    this.reversedCards.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
