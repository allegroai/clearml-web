import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {debounce, filter, tap} from 'rxjs/operators';


@Component({
  selector: 'sm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnChanges {

  public value$ = new Subject();

  @Input() minimumChars = 3;
  @Input() debounceTime = 300;
  @Input() placeholder: string = 'Type to search';
  @Input() hideIcons: boolean = false;
  @Input() expandOnHover = false;
  @Input() enableJumpToNextResult = false;
  @Input() searchResultsCount = null;
  searchCounterIndex = -1;
  public empty = true;
  public active: boolean = true;
  public countResults: number;
  public focused: boolean;

  @Input() set value(value: string) {
    this.searchBarInput.nativeElement.value = value || '';
  }

  @Output() valueChanged = new EventEmitter<string>();
  @Output() jumpToResult = new EventEmitter<number>();
  @ViewChild('searchBar', {static: true}) searchBarInput;

  ngOnInit(): void {
    this.value$.pipe(
      tap((val: string) => this.empty = val?.length === 0),
      debounce((val: string) => val.length > 0 ? timer(this.debounceTime) : timer(0)),
      filter(val => val.length >= this.minimumChars || val.length === 0)
    )
      .subscribe((value: string) => {
        if(value.length>=this.minimumChars){
          this.valueChanged.emit(value);
          this.searchResultsCount > 0 && this.jump(true);
        } else {
          this.valueChanged.emit('');
          this.searchResultsCount = 0;
        }
      });
  }

  onChange(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.clear();
    } else {
      this.value$.next(this.searchBarInput.nativeElement.value);
      this.searchCounterIndex = -1;
    }
  }

  clear(focus=true) {
    this.value$.next('');
    this.searchBarInput.nativeElement.value = '';
    focus && this.searchBarInput.nativeElement.focus();
    this.searchCounterIndex = -1;
  }

  updateActive(active: boolean) {
    if (this.expandOnHover) {
      if (this.empty) {
        this.active = active;
      } else {
        this.active = true;
      }
    }
  }

  jump(next: boolean) {
    this.searchCounterIndex = next ? this.searchCounterIndex + 1 : this.searchCounterIndex - 1;
    this.jumpToResult.emit(this.searchCounterIndex);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandOnHover) {
      this.active = !changes.expandOnHover.currentValue;
    }
  }

  focusInput($event: boolean) {
    this.focused = $event;
  }
}
