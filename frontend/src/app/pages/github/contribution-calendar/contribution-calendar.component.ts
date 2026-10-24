import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { TooltipDirective } from '../../../shared/tooltip/tooltip.directive';
import { githubActivitySnapshot } from '../github-activity.data';

@Component({
  selector: 'app-contribution-calendar',
  imports: [DatePipe, DecimalPipe, TooltipDirective],
  templateUrl: './contribution-calendar.component.html',
  styleUrl: './contribution-calendar.component.css',
})
export class ContributionCalendarComponent {
  readonly snapshot = githubActivitySnapshot;
  readonly years = this.snapshot.years;
  readonly selectedYear = signal(this.years.at(-1)!.year);
  readonly selectedDate = signal('');
  readonly current = computed(() => this.years.find(year => year.year === this.selectedYear())!);
  readonly activeDays = computed(() => this.current().days.filter(day => Number(day[1]) > 0).length);
  readonly maxTotal = Math.max(...this.years.map(year => year.total), 1);
  readonly calendar = computed(() => {
    const days = this.current().days.map(day => {
      const date = String(day[0]);
      const count = Number(day[1]);
      const formatted = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
      return { date, count, level: Number(day[2]), label: `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${formatted}` };
    });
    const offset = new Date(`${this.current().year}-01-01T00:00:00Z`).getUTCDay();
    const months = days.flatMap((day, index) => day.date.endsWith('-01') ? [{ label: new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`)), column: Math.floor((index + offset) / 7) + 1 }] : []);
    return { days, padding: Array.from({ length: offset }, (_, index) => index), months };
  });
  readonly focusedDate = computed(() => this.selectedDate() || this.calendar().days.at(-1)!.date);
  readonly dayDescription = computed(() => this.calendar().days.find(day => day.date === this.focusedDate())?.label ?? 'Hover, tap or focus a square to inspect its date.');

  chooseYear(year: number): void {
    this.selectedDate.set('');
    this.selectedYear.set(year);
  }

  navigateDay(event: KeyboardEvent, date: string): void {
    const offsets: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    const offset = offsets[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const days = this.calendar().days;
    const index = Math.max(0, Math.min(days.length - 1, days.findIndex(day => day.date === date) + offset));
    this.selectedDate.set(days[index].date);
    const target = event.currentTarget as HTMLElement;
    target.parentElement?.querySelector<HTMLButtonElement>(`[data-date="${days[index].date}"]`)?.focus();
  }
}
