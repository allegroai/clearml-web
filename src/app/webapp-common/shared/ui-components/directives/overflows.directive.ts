import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {from, fromEvent, Subject, timer} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

const isElementOverflow = ({clientWidth, clientHeight, scrollWidth, scrollHeight}) =>
  Math.abs(scrollHeight - clientHeight) > 30 || Math.abs(scrollWidth - clientWidth) > 30;

@Directive({
  selector: '[smOverflows]'
})
export class OverflowsDirective implements AfterViewInit, OnDestroy {
  @Output() onOverflows = new EventEmitter<boolean>();

  @Input() set smOverflows(name) {
    this.isEllipsisWithTimeDelay();
  }

  private onDestroySubscription$ = new Subject();
  private readonly host: Element;
  public lastResult;

  constructor(_host: ElementRef) {
    this.host = _host.nativeElement;
  }

  ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(50),
        takeUntil(this.onDestroySubscription$)
      )
      .subscribe(() => {
        this.isEllipsis();
      });
  }

  private isEllipsisWithTimeDelay(delay = 100) {
    from([delay]).pipe(debounceTime(delay)).subscribe(() => {
      this.isEllipsis()
    });
  }

  private isEllipsis() {
    const hasOverflow = isElementOverflow(this.host);
    if (hasOverflow !== this.lastResult) {
      this.onOverflows.emit(hasOverflow);
      this.lastResult = hasOverflow;
    }
  }

  ngOnDestroy() {
    this.onDestroySubscription$.next(false);
  }
}
