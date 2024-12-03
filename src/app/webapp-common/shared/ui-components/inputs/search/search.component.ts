import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  OnChanges, OnDestroy,
  OnInit, SimpleChanges,
  ViewChild, input, output, effect,
  inject
} from '@angular/core';
import {Subject, Subscription, timer} from 'rxjs';
import {debounce, distinctUntilChanged, filter, tap} from 'rxjs/operators';
import {NgTemplateOutlet} from '@angular/common';



@Component({
  selector: 'sm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgTemplateOutlet
  ]
})
export class SearchComponent implements OnInit, OnChanges, OnDestroy {

  private cdr = inject(ChangeDetectorRef);
  public value$ = new Subject();
  public empty = true;
  public active = true;
  public focused: boolean;
  private subs = new Subscription();

  minimumChars = input(3);
  debounceTime = input(300);
  placeholder = input<string>('Type to search');
  hideIcons = input<boolean>(false);
  expandOnHover = input(false);
  enableNavigation = input(false);
  searchResultsCount = input(null);
  searchCounterIndex = input(-1);
  value = input<string>('');

  valueChanged = output<string>();
  @ViewChild('searchBar', {static: true}) searchBarInput;

  constructor() {
    effect(() => {
      this.searchBarInput.nativeElement.value = this.value() || '';
    });
  }

  ngOnInit(): void {
    this.subs.add(this.value$.pipe(
      tap((val: string) => this.empty = val?.length === 0),
      distinctUntilChanged(),
      debounce((val: string) => val.length > 0 ? timer(this.debounceTime()) : timer(0)),
      filter(val => val.length >= this.minimumChars() || val.length === 0)
    )
      .subscribe((value: string) => {
        if (value.length >= this.minimumChars()) {
          this.valueChanged.emit(value);
        } else {
          // in case user backspace all chars
          this.valueChanged.emit('');
          this.clear(true);
        }
        this.cdr.detectChanges();
      }));
  }

  ngOnDestroy() {
    this.subs?.unsubscribe();
  }

  onKeyDown(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.clear();
    } else if (event.key === 'Enter' &&
      (!this.enableNavigation() || (this.searchCounterIndex() + 1 < this.searchResultsCount())) &&
      this.searchBarInput.nativeElement.value.length > 0
    ) {
      this.valueChanged.emit(this.searchBarInput.nativeElement.value);
    }
  }

  onValueChange() {
    this.value$.next(this.searchBarInput.nativeElement.value);
  }

  clear(focus = true) {
    this.value$.next('');
    this.searchBarInput.nativeElement.value = '';
    if (focus) {
      this.searchBarInput.nativeElement.focus();
    }
  }

  updateActive(active: boolean) {
    if (this.expandOnHover()) {
      if (this.empty) {
        this.active = active;
        this.searchBarInput.nativeElement.focus();
      } else {
        this.active = true;
      }
    }
  }

  findNext(backward?: boolean) {
    this.valueChanged.emit(backward ? null : this.searchBarInput.nativeElement.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandOnHover) {
      this.active = !changes.expandOnHover.currentValue;
    }
  }

  focusInput($event: boolean) {
    this.focused = $event;
  }

  getFocus() {
    this.searchBarInput.nativeElement.focus();
  }
}
