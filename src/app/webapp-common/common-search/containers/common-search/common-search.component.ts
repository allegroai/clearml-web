import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Store} from '@ngrx/store';
import {SetIsSearching, SetSearchQuery} from '../../common-search.actions';
import {selectIsSearching, selectPlaceholder, selectSearchQuery} from '../../common-search.reducer';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

@Component({
  selector   : 'sm-common-search',
  templateUrl: './common-search.component.html',
  styleUrls  : ['./common-search.component.scss']
})
export class CommonSearchComponent implements OnInit {
  public searchQuery$: Observable<string>;
  public isSearching$: Observable<boolean>;
  public searchPlaceholder$: Observable<string>;
  public searchActive: boolean;



  @ViewChild('search', { static: true }) searchElem;

  constructor(private store: Store<any>, private router: Router, private route: ActivatedRoute) {}

  onSearchValueChanged(query) {
    this.store.dispatch(new SetSearchQuery(query));
  }

  openSearch() {
    this.searchElem.searchBarInput.nativeElement.focus();
    this.store.dispatch(new SetIsSearching(true));
  }

  onSearchFocusOut() {
    if (!this.searchElem.searchBarInput.nativeElement.value) {
      this.store.dispatch(new SetIsSearching(false));
    }
  }

  ngOnInit() {
    this.searchQuery$       = this.store.select(selectSearchQuery);
    this.isSearching$       = this.store.select(selectIsSearching);
    this.searchPlaceholder$ = this.store.select(selectPlaceholder);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setSearchActive();
      });
    setTimeout(this.setSearchActive.bind(this));
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
    this.store.dispatch(new SetSearchQuery(''));
    this.searchElem.searchBarInput.nativeElement.focus();
  }
}
