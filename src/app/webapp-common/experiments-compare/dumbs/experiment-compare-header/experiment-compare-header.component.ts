import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {Store} from '@ngrx/store';
import {selectHideIdenticalFields} from '../../reducers';
import {Observable, Subscription} from 'rxjs';
import {refreshIfNeeded, setHideIdenticalFields, setNavigationPreferences, setShowSearchExperimentsForCompare, toggleShowScalarOptions} from '../../actions/compare-header.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {selectRouterParams, selectRouterQueryParams, selectRouterUrl} from '@common/core/reducers/router-reducer';
import {setAutoRefresh} from '@common/core/actions/layout.actions';
import {filter, map} from 'rxjs/operators';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {compareLimitations} from '@common/shared/entity-page/footer-items/compare-footer-item';
import {allowAddExperiment$, SelectExperimentsForCompareComponent} from '../../containers/select-experiments-for-compare/select-experiments-for-compare.component';
import {MatDialog} from '@angular/material/dialog';
import {RefreshService} from '@common/core/services/refresh.service';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {SelectModelComponent} from '@common/select-model/select-model.component';

@Component({
  selector: 'sm-experiment-compare-header',
  templateUrl: './experiment-compare-header.component.html',
  styleUrls: ['./experiment-compare-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareHeaderComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  public selectHideIdenticalFields$: Observable<boolean>;

  public viewMode: string;
  public currentPage: string;
  public compareLimitations = compareLimitations;
  public allowAddExperiment$: Observable<boolean>;
  public queryParamsViewMode$: Observable<string>;
  private autorRefreshSub: Subscription;
  private showMenuSub: Subscription;

  private selectedIds: string;

  @Input() entityType: EntityTypeEnum;
  @Output() selectionChanged = new EventEmitter<string[]>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private refresh: RefreshService
  ) {
    this.selectHideIdenticalFields$ = this.store.select(selectHideIdenticalFields);
    this.queryParamsViewMode$ = this.store.select(selectRouterQueryParams)
      .pipe(map(params => params[this.currentPage]));
  }

  ngOnInit() {
    this.autorRefreshSub = this.refresh.tick
      .pipe(filter(auto => auto === null))
      .subscribe(() => this.store.dispatch(refreshIfNeeded({payload: true, autoRefresh: true, entityType: this.entityType})));

    this.routerSubscription = this.store.select(selectRouterUrl).subscribe(() => {
      this.currentPage = this.route?.snapshot?.firstChild?.url?.[0]?.path;
      this.viewMode = this.route?.snapshot?.firstChild?.url?.[1]?.path;
      this.cdr.detectChanges();
    });

    this.routerSubscription = this.store.select(selectRouterParams).subscribe((params) => {
      this.selectedIds = params.ids;
    })

    this.allowAddExperiment$ = allowAddExperiment$(this.store.select(selectRouterParams));
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.autorRefreshSub.unsubscribe();
    this.showMenuSub?.unsubscribe();
  }

  changeView($event: MatSelectChange) {
    const queryParam = {[this.currentPage]: $event.value};
    const page = $event.value.replace(/.*_/, '');
    this.store.dispatch(setNavigationPreferences({navigationPreferences: queryParam}));
    this.router.navigate([`./${this.currentPage}/${page}`], {
      queryParams: queryParam,
      relativeTo: this.route,
      queryParamsHandling: 'merge'
    });
  }

  openAddExperimentSearch() {
    if (this.entityType === EntityTypeEnum.model) {
      const selectedIds = this.selectedIds?.split(',') ?? [];
      this.dialog.open(SelectModelComponent, {
        data: {
          selectionMode: 'multiple',
          selectedModels: selectedIds,
        header: 'Select compared model'},
        height: '94vh',
        width: '98%',
        maxWidth: '100%'
      }).afterClosed().pipe(filter(ids => !!ids)).subscribe(ids => this.selectionChanged.emit(ids));
    } else {
      this.dialog.open(SelectExperimentsForCompareComponent, {
        data: {entityType: this.entityType},
        height: '94vh',
        width: '98%',
        maxWidth: '100%'
      }).afterClosed().pipe(filter(ids => !!ids)).subscribe(ids => this.selectionChanged.emit(ids));
    }
  }

  hideIdenticalFieldsToggled(event: MatSlideToggleChange) {
    this.store.dispatch(setHideIdenticalFields({payload: event.checked}));
  }

  toggleSettings() {
    this.store.dispatch(toggleShowScalarOptions());
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  menuClosed() {
    this.store.dispatch(setShowSearchExperimentsForCompare({payload: false}));
  }
}
