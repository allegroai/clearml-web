import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {isEqual} from 'lodash/fp';
import {mergeMultiMetrics, mergeMultiMetricsGroupedVariant} from '../../../tasks/tasks.utils';
import {scrollToElement} from '../../../shared/utils/shared-utils';
import {GetMultiScalarCharts, ResetExperimentMetrics, SetExperimentMetricsSearchTerm, SetExperimentSettings, SetSelectedExperiments} from '../../actions/experiments-compare-charts.actions';
import {selectCompareSelectedSettingsGroupBy, selectCompareSelectedSettingsSmoothWeight, selectCompareSelectedSettingsxAxisType, selectCompareTasksScalarCharts, selectExperimentMetricsSearchTerm, selectRefreshing, selectSelectedExperimentSettings, selectSelectedSettingsHiddenScalar, selectShowScalarsOptions} from '../../reducers';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';
import {toggleShowScalarOptions} from '../../actions/compare-header.actions';
import {GroupByCharts} from '../../../experiments/reducers/common-experiment-output.reducer';
import {GroupedList} from '../../../shared/ui-components/data/selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {ExtFrame} from '../../../shared/experiment-graphs/single-graph/plotly-graph-base';


@Component({
  selector   : 'sm-experiment-compare-scalar-charts',
  templateUrl: './experiment-compare-scalar-charts.component.html',
  styleUrls  : ['./experiment-compare-scalar-charts.component.scss']
})
export class ExperimentCompareScalarChartsComponent implements OnInit, OnDestroy {

  public smoothWeight$: Observable<number>;
  public xAxisType$: Observable<ScalarKeyEnum>;
  public groupBy$: Observable<GroupByCharts>;
  public showSettingsBar$: Observable<boolean>;
  private selectRefreshing$: Observable<{ refreshing: boolean, autoRefresh: boolean }>;
  private routerParams$: Observable<any>;
  public metrics$: Observable<any>;
  public experimentSettings$: Observable<any>;
  public searchTerm$: Observable<string>;
  public listOfHidden: Observable<Array<any>>;

  private metricsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private routerParamsSubscription: Subscription;
  private refreshingSubscription: Subscription;
  private xAxisSub: Subscription;
  private groupBySub: Subscription;

  public graphList: GroupedList = {};
  public selectedGraph: string = null;
  private taskIds: Array<string>;
  public graphs: { [key: string]: ExtFrame[] };
  public refreshDisabled = false;
  public showSettingsBar: boolean = false;
  public groupBy: GroupByCharts;
  private metrics: GroupedList;

  groupByOptions = [
    {
      name: 'Metric',
      value: GroupByCharts.Metric
    },
    {
      name: 'Metric + Variant',
      value: GroupByCharts.None
    }
  ];

  constructor(private store: Store<IExperimentInfoState>, private changeDetection: ChangeDetectorRef) {
    this.listOfHidden = this.store.pipe(select(selectSelectedSettingsHiddenScalar));
    this.searchTerm$ = this.store.pipe(select(selectExperimentMetricsSearchTerm));
    this.showSettingsBar$ = this.store.pipe(select(selectShowScalarsOptions));
    this.smoothWeight$ = this.store.select(selectCompareSelectedSettingsSmoothWeight);
    this.xAxisType$ = this.store.select(selectCompareSelectedSettingsxAxisType);
    this.groupBy$ = this.store.select(selectCompareSelectedSettingsGroupBy);
    this.selectRefreshing$ = this.store.select(selectRefreshing);
    this.metrics$ = this.store.pipe(
      select(selectCompareTasksScalarCharts),
      filter(metrics => !!metrics),
      distinctUntilChanged()
    );
    this.experimentSettings$ = this.store.pipe(
      select(selectSelectedExperimentSettings),
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedScalar : null),
      distinctUntilChanged()
    );

    this.routerParams$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.ids),
      distinctUntilChanged(),
      tap(() => this.refreshDisabled = true)
    );

    this.xAxisSub = this.xAxisType$
      .pipe(filter((axis) => !!axis))
      .subscribe((axis) => this.store.dispatch(new GetMultiScalarCharts({taskIds: this.taskIds, cached: true})));

    this.groupBySub = this.groupBy$
      .subscribe(groupBy => {
        this.groupBy = groupBy;
        this.prepareGraphsAndUpdate(this.metrics);
      });
  }

  ngOnInit() {
    this.metricsSubscription = this.metrics$
      .subscribe((metricsWrapped) => {
        this.refreshDisabled = false;
        const metrics = metricsWrapped.metrics || {};
        this.metrics = metrics;
        this.prepareGraphsAndUpdate(metrics);
      });

    this.settingsSubscription = this.experimentSettings$
      .subscribe((selectedMetric) => {
        this.selectedGraph = selectedMetric;
        scrollToElement(this.selectedGraph);
      });

    this.routerParamsSubscription = this.routerParams$
      .subscribe(params => {
        if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
          this.taskIds = params.ids.split(',');
          this.store.dispatch(new SetSelectedExperiments({selectedExperiments: this.taskIds}));
          this.store.dispatch(new GetMultiScalarCharts({taskIds: this.taskIds}));
        }
      });

    this.refreshingSubscription = this.selectRefreshing$.pipe(filter(({refreshing}) => refreshing))
      .subscribe(({autoRefresh}) => this.store.dispatch(new GetMultiScalarCharts({taskIds: this.taskIds, autoRefresh})));
  }

  private prepareGraphsAndUpdate(metrics) {
    if (metrics) {
      const merged = this.groupBy === 'metric' ? mergeMultiMetricsGroupedVariant(metrics) : mergeMultiMetrics(metrics);
      this.graphList = this.groupBy === 'metric' ? this.buildNestedListWithoutChildren(merged) : metrics;
      if (!this.graphs || !isEqual(merged, this.graphs)) {
        this.graphs = merged;
      }
      this.changeDetection.detectChanges();
    }
  }

  private buildNestedListWithoutChildren(merged: { [p: string]: ExtFrame[] }) {
    return Object.keys(merged).reduce((acc, metric) => {
      acc[metric] = {};
      return acc;
    }, {});
  }

  ngOnDestroy() {
    this.metricsSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    this.routerParamsSubscription.unsubscribe();
    this.xAxisSub.unsubscribe();
    this.refreshingSubscription.unsubscribe();
    this.resetMetrics();
  }

  metricSelected(id) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {selectedScalar: id}}));
  }

  hiddenListChanged(hiddenList) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {hiddenMetricsScalar: hiddenList}}));
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(new SetExperimentMetricsSearchTerm({searchTerm: searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(new ResetExperimentMetrics());
  }

  changeSmoothness($event: any) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {smoothWeight: $event}}));
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {xAxisType: $event}}));
  }

  changeGroupBy($event: GroupByCharts) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {groupBy: $event}}));
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleShowScalarOptions());
  }
}
