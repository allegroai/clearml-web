import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {debounce, filter, tap} from 'rxjs/operators';


@Component({
  selector: 'sm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {

  public value$ = new Subject();

  @Input() minimumChars = 3;
  @Input() debounceTime = 300;
  @Input() placeholder: string = 'Type to search';
  @Input() hideIcons: boolean = false;
  @Input() expandOnHover = false;
  public empty = true;

  @Input() set value(value: string) {
    this.searchBarInput.nativeElement.value = value || '';
  }

  @Output() valueChanged = new EventEmitter<string>();
  @ViewChild('searchBar', {static: true}) searchBarInput;

  ngOnInit(): void {
    this.value$.pipe(
      tap((val: string) => this.empty = val?.length === 0),
      debounce((val: string) => val.length > 0 ? timer(this.debounceTime) : timer(0)),
      filter(val => val.length >= this.minimumChars || val.length === 0)
    )
      .subscribe((value: string) => {
        this.valueChanged.emit(value);
      });
  }

  onChange(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.clear();
    } else {
      this.value$.next(this.searchBarInput.nativeElement.value);
    }
  }

  clear() {
    this.value$.next('');
    this.searchBarInput.nativeElement.value = '';
    this.searchBarInput.nativeElement.focus();
  }
}
