import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Store} from '@ngrx/store';
import {SetIsSearching, setSearchQuery} from '../../common-search.actions';
import {ICommonSearchState, selectIsSearching, selectPlaceholder, selectSearchQuery} from '../../common-search.reducer';
import {Observable} from 'rxjs';
import {debounceTime, filter, tap} from 'rxjs/operators';
import {SearchComponent} from '../../../shared/ui-components/inputs/search/search.component';

@Component({
  selector   : 'sm-common-search',
  templateUrl: './common-search.component.html',
  styleUrls  : ['./common-search.component.scss']
})
export class CommonSearchComponent implements OnInit {
  public searchQuery$: Observable<ICommonSearchState['searchQuery']>;
  public isSearching$: Observable<boolean>;
  public searchPlaceholder$: Observable<string>;
  public searchActive: boolean;



  @ViewChild(SearchComponent) searchElem: SearchComponent;
  public regExp: boolean = false;
  private closeTimer: number;
  private queryString: string;
  minChars = 3;

  constructor(private store: Store<any>, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.searchQuery$       = this.store.select(selectSearchQuery).pipe(tap(searchQuery => this.regExp = searchQuery?.regExp));
    this.isSearching$       = this.store.select(selectIsSearching);
    this.searchPlaceholder$ = this.store.select(selectPlaceholder).pipe(debounceTime(0));
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setSearchActive();
      });
    setTimeout(this.setSearchActive.bind(this));
  }

  onSearchValueChanged(query) {
    this.queryString = query;
    this.store.dispatch(setSearchQuery({query, regExp: this.regExp}));
  }

  openSearch() {
    window.clearTimeout(this.closeTimer);
    this.searchElem.searchBarInput.nativeElement.focus();
    this.store.dispatch(new SetIsSearching(true));
  }

  onSearchFocusOut() {
    if (!this.searchElem.searchBarInput.nativeElement.value) {
      this.closeTimer = window.setTimeout(() => this.store.dispatch(new SetIsSearching(false)), 200);
    }
  }

  private setSearchActive() {
    let route      = this.route.snapshot;
    let showSearch = false;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.data.search !== undefined) {
        showSearch = route.data.search;
      }
    }
    this.searchActive = showSearch;
  }

  clearSearch() {
    this.searchElem.clear();
    this.store.dispatch(new SetIsSearching(false));
    document.body.focus();
  }

  toggleRegExp() {
    this.regExp = !this.regExp;
    window.clearTimeout(this.closeTimer);
    if (this.queryString?.length >= this.minChars) {
      this.store.dispatch(setSearchQuery({query: this.queryString, regExp: this.regExp}));
    }
  }
}
