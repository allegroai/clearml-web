import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {setSearching, setSearchQuery} from '../../common-search.actions';
import {SearchState, selectIsSearching, selectPlaceholder, selectSearchQuery} from '../../common-search.reducer';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, tap} from 'rxjs/operators';
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
  minChars = 3;
  public regexError: boolean;

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged((pe: NavigationEnd, ce: NavigationEnd) => {
          const pURL = new URLSearchParams(pe.url.split('?')?.[1]);
          const cURL = new URLSearchParams(ce.url.split('?')?.[1]);
          return pURL.get('q') === cURL.get('q') && pURL.get('qreg') === cURL.get('qreg');
        })
      ).subscribe(() => {
      const query = this.route.snapshot.queryParams?.q ?? '';
      const qregex = this.route.snapshot.queryParams?.qreg === 'true';
      this.store.dispatch(setSearchQuery({
        query: qregex ? query : query.trim(),
        regExp: qregex,
        original: query
      }));
      if (query) {
        this.openSearch();
      } else {
        if (document.activeElement !== this.searchElem.searchBarInput.nativeElement) {
          this.store.dispatch(setSearching({payload: false}))
        }
      }
    })
    if( this.route.snapshot.queryParams.q) {
      const query = this.route.snapshot.queryParams?.q ?? '';
      const qregex = this.route.snapshot.queryParams?.qreg ?? false;
      this.store.dispatch(setSearchQuery({
        query: qregex ? query : query.trim(),
        regExp: qregex,
        original: query
      }));
      setTimeout( () => this.openSearch());
    }
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



  public search(query: string) {
    try {
      if (this.regExp) {
        new RegExp(query);
      }
      this.regexError = null;
      this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
        queryParamsHandling: "merge",
        queryParams: {
          q: query || undefined
        }
      })

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
    setTimeout( () =>this.searchElem.searchBarInput.nativeElement.blur(), 100);
  }

  toggleRegExp() {
    this.regExp = !this.regExp;
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParamsHandling: "merge",
      queryParams: {
        qreg: this.regExp ? this.regExp : undefined}
    })
  }
}
