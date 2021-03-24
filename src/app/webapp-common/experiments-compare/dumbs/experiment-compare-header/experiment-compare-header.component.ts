import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Action, Store} from '@ngrx/store';
import {selectHideIdenticalFields, selectRefreshing, selectShowAddExperimentsForCompare} from '../../reducers';
import {interval, Observable, Subscription} from 'rxjs';
import {refreshIfNeeded, setHideIdenticalFields, setNavigationPreferences, setRefreshing, setShowSearchExperimentsForCompare, toggleShowScalarOptions} from '../../actions/compare-header.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {selectRouterQueryParams, selectRouterUrl} from '../../../core/reducers/router-reducer';
import {get} from 'lodash/fp';
import {selectAutoRefresh} from '../../../core/reducers/view-reducer';
import {SetAutoRefresh} from '../../../core/actions/layout.actions';
import {AUTO_REFRESH_INTERVAL} from '../../../../app.constants';
import {filter, withLatestFrom} from 'rxjs/operators';

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
  public showAddExperimentsForCompare$: Observable<boolean>;

  public selectRefreshing$: Observable<{ refreshing: boolean; autoRefresh: boolean }>;
  public viewMode: string;
  public currentPage: string;
  public queryParamsViewMode: string;
  public autoRefreshState$: Observable<boolean>;
  private autorRefreshSub: Subscription;

  constructor(private store: Store<any>, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {
    this.selectHideIdenticalFields$ = this.store.select(selectHideIdenticalFields);
    this.showAddExperimentsForCompare$ = this.store.select(selectShowAddExperimentsForCompare);
    this.selectRefreshing$ = this.store.select(selectRefreshing);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
  }

  ngOnInit() {
    this.autorRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$),
      filter(([iteration, autoRefreshState]) => autoRefreshState)
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

  hideIdenticalFieldsToggled(val) {
    this.store.dispatch(setHideIdenticalFields({payload: val.checked}));
  }

  toggleSettings() {
    this.store.dispatch(toggleShowScalarOptions());
  }

  refreshList(isAutorefresh: boolean) {
    this.store.dispatch(refreshIfNeeded({payload: true, autoRefresh: isAutorefresh}));
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(new SetAutoRefresh($event));
  }

}
