import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {setSearching, setSearchQuery} from '../../common-search.actions';
import {SearchState, selectIsSearching, selectPlaceholder, selectSearchQuery} from '../../common-search.reducer';
import {Observable} from 'rxjs';
import {debounceTime, filter, tap} from 'rxjs/operators';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';

@Component({
  selector: 'sm-common-search',
  templateUrl: './common-search.component.html',
  styleUrls: ['./common-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonSearchComponent implements OnInit {
  public searchQuery$: Observable<SearchState['searchQuery']>;
  public isSearching$: Observable<boolean>;
  public searchPlaceholder$: Observable<string>;
  public searchActive: boolean;


  @ViewChild(SearchComponent) searchElem: SearchComponent;
  public regExp: boolean = false;
  private closeTimer: number;
  private queryString: string;
  minChars = 3;
  public regexError: boolean;

  constructor(private store: Store<any>, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.searchQuery$ = this.store.select(selectSearchQuery).pipe(tap(searchQuery => this.regExp = searchQuery?.regExp));
    this.isSearching$ = this.store.select(selectIsSearching);
    this.searchPlaceholder$ = this.store.select(selectPlaceholder).pipe(debounceTime(0));
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setSearchActive();
      });
    setTimeout(this.setSearchActive.bind(this));
  }

  onSearchValueChanged(query: string) {
    this.queryString = query;
    this.search();
    this.cdr.detectChanges();
  }

  private search() {
    try {
      if (this.regExp) {
        new RegExp(this.queryString);
      }
      this.regexError = null;
      this.store.dispatch(setSearchQuery({
        query: this.regExp ? this.queryString : this.queryString.trim(),
        regExp: this.regExp,
        original: this.queryString
      }));
    } catch (e) {
      this.regexError = e.message?.replace(/:.+:/, ':');
    }
  }

  openSearch() {
    window.clearTimeout(this.closeTimer);
    this.searchElem.searchBarInput.nativeElement.focus();
    this.store.dispatch(setSearching({payload: true}));
  }

  onSearchFocusOut() {
    if (!this.searchElem.searchBarInput.nativeElement.value) {
      this.closeTimer = window.setTimeout(() => this.store.dispatch(setSearching({payload: false})), 200);
    }
  }

  private setSearchActive() {
    let route = this.route.snapshot;
    let showSearch = false;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.data.search !== undefined) {
        showSearch = route.data.search;
      }
    }
    this.searchActive = showSearch;
    this.cdr.detectChanges();
  }

  clearSearch() {
    this.searchElem.clear();
    this.store.dispatch(setSearching({payload: false}));
    document.body.focus();
  }

  toggleRegExp() {
    this.regExp = !this.regExp;
    window.clearTimeout(this.closeTimer);
    if (this.queryString?.length >= this.minChars) {
      this.search();
    }
  }
}
