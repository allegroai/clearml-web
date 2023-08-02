import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {GroupedList, mergeMultiMetrics, mergeMultiMetricsGroupedVariant} from '@common/tasks/tasks.utils';
import {getMultiScalarCharts, resetExperimentMetrics, setExperimentMetricsSearchTerm, setExperimentSettings, setSelectedExperiments} from '../../actions/experiments-compare-charts.actions';
import {
  selectCompareSelectedSettingsGroupBy, selectCompareSelectedSettingsSmoothWeight, selectCompareSelectedSettingsxAxisType, selectCompareTasksScalarCharts, selectExperimentMetricsSearchTerm,
  selectSelectedExperimentSettings, selectSelectedSettingsHiddenScalar, selectSelectedSettingsSmoothType
} from '../../reducers';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {toggleShowScalarOptions} from '../../actions/compare-header.actions';
import {GroupByCharts, groupByCharts} from '@common/experiments/reducers/experiment-output.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {RefreshService} from '@common/core/services/refresh.service';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {selectScalarsHoverMode} from '@common/experiments/reducers';
import {setScalarsHoverMode} from '@common/experiments/actions/common-experiment-output.actions';
import {ChartHoverModeEnum} from '@common/experiments/shared/common-experiments.const';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {ActivatedRoute} from '@angular/router';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {SmoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';


@Component({
  selector: 'sm-experiment-compare-scalar-charts',
  templateUrl: './experiment-compare-scalar-charts.component.html',
  styleUrls: ['./experiment-compare-scalar-charts.component.scss']
})
export class ExperimentCompareScalarChartsComponent implements OnInit, OnDestroy, AfterViewInit {

  public smoothWeight$: Observable<number>;
  public smoothWeightDelayed$: Observable<number>;
  public xAxisType$: Observable<ScalarKeyEnum>;
  public groupBy$: Observable<GroupByCharts>;
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
  public groupBy: GroupByCharts;
  private metrics: GroupedList;

  groupByOptions = [
    {
      name: 'Metric',
      value: groupByCharts.metric
    },
    {
      name: 'Metric + Variant',
      value: groupByCharts.none
    }
  ];

  @ViewChild(ExperimentGraphsComponent) graphsComponent: ExperimentGraphsComponent;
  public hoverMode$: Observable<ChartHoverModeEnum>;
  private entityType: EntityTypeEnum;
  public smoothType$: Observable<SmoothTypeEnum>;
  public modelsFeature: boolean;

  constructor(
    private store: Store,
    private changeDetection: ChangeDetectorRef,
    private route: ActivatedRoute,
    private refresh: RefreshService,
    private reportEmbed: ReportCodeEmbedService,
  ) {
    this.modelsFeature = this.route.snapshot?.parent.data?.setAllProject;
    this.listOfHidden = this.store.select(selectSelectedSettingsHiddenScalar)
      .pipe(distinctUntilChanged(isEqual));
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.smoothWeight$ = this.store.select(selectCompareSelectedSettingsSmoothWeight);
    this.smoothWeightDelayed$ = this.store.select(selectCompareSelectedSettingsSmoothWeight).pipe(debounceTime(75));
    this.smoothType$ = this.store.select(selectSelectedSettingsSmoothType);
    this.xAxisType$ = this.store.select(selectCompareSelectedSettingsxAxisType);
    this.hoverMode$ = this.store.select(selectScalarsHoverMode);
    this.groupBy$ = this.store.select(selectCompareSelectedSettingsGroupBy);
    this.metrics$ = this.store.select(selectCompareTasksScalarCharts).pipe(
      filter(metrics => !!metrics),
      distinctUntilChanged()
    );
    this.experimentSettings$ = this.store.select(selectSelectedExperimentSettings).pipe(

      filter(settings => !!settings),
      map(settings => settings ? settings.selectedScalar : null),
      filter(selectedPlot => selectedPlot !== undefined),
      distinctUntilChanged()
    );

    this.routerParams$ = this.store.select(selectRouterParams).pipe(

      filter(params => !!params.ids),
      distinctUntilChanged()
    );

    this.xAxisSub = this.xAxisType$
      .pipe(filter(axis => !!axis && this.taskIds?.length > 0))
      .subscribe(() => this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, cached: true})));

    this.groupBySub = this.groupBy$
      .subscribe(groupBy => {
        this.groupBy = groupBy;
        this.prepareGraphsAndUpdate(this.metrics);
      });
  }

  ngOnInit() {
    this.entityType = this.route.snapshot.parent.parent.data.entityType;
    this.metricsSubscription = this.metrics$
      .subscribe((metricsWrapped) => {
        const metrics = metricsWrapped.metrics || {};
        this.metrics = metrics;
        this.prepareGraphsAndUpdate(metrics);
      });

    this.routerParamsSubscription = this.routerParams$
      .subscribe((params) => {
          if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
            this.taskIds = params.ids.split(',');
            this.store.dispatch(setSelectedExperiments({selectedExperiments: this.taskIds}));
            this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType}));
          }
      });

    this.refreshingSubscription = this.refresh.tick
      .pipe(filter(auto => auto !== null && this.graphs !== null))
      .subscribe(autoRefresh => this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, autoRefresh})));
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
    this.metricsSubscription?.unsubscribe();
    this.settingsSubscription?.unsubscribe();
    this.routerParamsSubscription?.unsubscribe();
    this.xAxisSub?.unsubscribe();
    this.refreshingSubscription?.unsubscribe();
    this.resetMetrics();
  }

  metricSelected(id) {
    this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {selectedScalar: id}}));
  }

  hiddenListChanged(hiddenList) {
    this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {hiddenMetricsScalar: hiddenList}}));
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  changeSmoothness($event: any) {
    this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {smoothWeight: $event}}));
  }

  changeSmoothType($event: SmoothTypeEnum) {
    this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {smoothType: $event}}));
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {xAxisType: $event}}));
  }

  changeGroupBy($event: GroupByCharts) {
    this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {groupBy: $event}}));
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleShowScalarOptions());
  }

  hoverModeChanged(hoverMode: ChartHoverModeEnum) {
    this.store.dispatch(setScalarsHoverMode({hoverMode}));
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; domRect: DOMRect }) {
    const entityType = this.entityType === EntityTypeEnum.model ? 'model' : 'task';
    this.reportEmbed.createCode({
      type: 'scalar',
      objects: this.taskIds,
      objectType: entityType,
      ...event
    });
  }

  ngAfterViewInit(): void {
    this.settingsSubscription = this.experimentSettings$
      .pipe(filter(metric => !!metric))
      .subscribe(selectedMetric => {
        this.selectedGraph = selectedMetric;
        this.graphsComponent.scrollToGraph(selectedMetric);
        this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {selectedScalar: undefined}}));
      });
  }
}
