import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {fromEvent, switchMap} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface IAutoCompleteScrollEvent {
  autoComplete: MatAutocomplete;
  scrollEvent: Event;
}

@Directive({
  standalone: true,
  selector: '[smOptionsScroll]'
})
export class OptionsScrollDirective {

  @Input() thresholdPercent = .95;
  @Output() smOptionsScroll = new EventEmitter<IAutoCompleteScrollEvent>();

  constructor(public autoComplete: MatAutocomplete) {
    this.autoComplete.opened.pipe(
      takeUntilDestroyed(),
      debounceTime(50),
      switchMap(() => fromEvent(this.autoComplete.panel.nativeElement, 'scroll').pipe(
        takeUntil(this.autoComplete.closed),
      )),
    ).subscribe((event: Event) => this.onScroll(event));
  }

  onScroll(event: Event) {
    if (this.thresholdPercent === undefined) {
      this.smOptionsScroll.emit({ autoComplete: this.autoComplete, scrollEvent: event });
    } else {
      const threshold = this.thresholdPercent * 100 * (<HTMLInputElement>event.target).scrollHeight / 100;
      const current = (<HTMLInputElement>event.target).scrollTop + (<HTMLInputElement>event.target).clientHeight;

      if (current > threshold) {
        this.smOptionsScroll.emit({ autoComplete: this.autoComplete, scrollEvent: event });
      }
    }
  }
}
