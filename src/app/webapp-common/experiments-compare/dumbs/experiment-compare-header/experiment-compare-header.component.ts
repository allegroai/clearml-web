import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Store} from '@ngrx/store';
import {selectHideIdenticalFields, selectRefreshing, selectShowAddExperimentsForCompare} from '../../reducers';
import {interval, Observable, Subscription} from 'rxjs';
import {
  refreshIfNeeded, setHideIdenticalFields, setNavigationPreferences,
  setShowSearchExperimentsForCompare, toggleShowScalarOptions
} from '../../actions/compare-header.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {selectRouterQueryParams, selectRouterUrl} from '../../../core/reducers/router-reducer';
import {get} from 'lodash/fp';
import {selectAppVisible, selectAutoRefresh} from '../../../core/reducers/view-reducer';
import {setAutoRefresh} from '../../../core/actions/layout.actions';
import {AUTO_REFRESH_INTERVAL} from '../../../../app.constants';
import {filter, withLatestFrom} from 'rxjs/operators';
import {MatMenuTrigger} from '@angular/material/menu';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';

@Component({
  selector       : 'sm-experiment-compare-header',
  templateUrl    : './experiment-compare-header.component.html',
  styleUrls      : ['./experiment-compare-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareHeaderComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  private queryParamsSubscription: Subscription;
  public selectHideIdenticalFields$: Observable<boolean>;

  public selectRefreshing$: Observable<{ refreshing: boolean; autoRefresh: boolean }>;
  public viewMode: string;
  public currentPage: string;
  public queryParamsViewMode: string;
  public autoRefreshState$: Observable<boolean>;
  private autorRefreshSub: Subscription;
  private showMenuSub: Subscription;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  private isAppVisible$: Observable<boolean>;

  constructor(private store: Store<any>, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {
    this.selectHideIdenticalFields$ = this.store.select(selectHideIdenticalFields);
    this.selectRefreshing$ = this.store.select(selectRefreshing);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.showMenuSub = this.store.select(selectShowAddExperimentsForCompare).subscribe(open => open ? this.trigger?.openMenu() : this.trigger?.closeMenu());
  }

  ngOnInit() {
    this.autorRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.isAppVisible$),
      filter(([, autoRefreshState, isAppVisible]) => autoRefreshState && isAppVisible)
    ).subscribe(() => {
      this.refreshList(true);
    });
    this.routerSubscription = this.store.select(selectRouterUrl).subscribe(() => {
      this.currentPage = get('snapshot.firstChild.url[0].path', this.route);
      this.viewMode = get('snapshot.firstChild.url[1].path', this.route);
      this.cdr.detectChanges();
    });

    this.queryParamsSubscription = this.store.select(selectRouterQueryParams)
      .subscribe((queryParams) => this.queryParamsViewMode = queryParams[this.currentPage]);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.autorRefreshSub.unsubscribe();
    this.showMenuSub?.unsubscribe();
  }

  refresh({isAutoRefresh}: { isAutoRefresh: boolean }) {
    this.store.dispatch(refreshIfNeeded({payload: true, autoRefresh: isAutoRefresh}));
  }

  changeView($event: MatSelectChange) {
    const queryParam = {[this.currentPage]: $event.value};
    const page = $event.value.replace(/.*_/, '');
    this.store.dispatch(setNavigationPreferences({navigationPreferences: queryParam}));
    this.router.navigate([`./${this.currentPage}/${page}`], {
      queryParams        : queryParam,
      relativeTo         : this.route,
      queryParamsHandling: 'merge'
    });
  }

  openAddExperimentSearch() {
    this.store.dispatch(setShowSearchExperimentsForCompare({payload: true}));
  }

  hideIdenticalFieldsToggled(event: MatSlideToggleChange) {
    this.store.dispatch(setHideIdenticalFields({payload: event.checked}));
  }

  toggleSettings() {
    this.store.dispatch(toggleShowScalarOptions());
  }

  refreshList(isAutorefresh: boolean) {
    this.store.dispatch(refreshIfNeeded({payload: true, autoRefresh: isAutorefresh}));
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  menuClosed() {
    this.store.dispatch(setShowSearchExperimentsForCompare({payload: false}));
  }
}
