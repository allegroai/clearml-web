import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {distinctUntilChanged, filter, take} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {createMultiSingleValuesChart, GroupedList, mergeMultiMetrics, mergeMultiMetricsGroupedVariant, prepareGraph} from '@common/tasks/tasks.utils';
import {getMultiScalarCharts, getMultiSinleScalars, resetExperimentMetrics, setExperimentMetricsSearchTerm, setExperimentSettings, setScalarsHoverMode, setSelectedExperiments} from '../../actions/experiments-compare-charts.actions';
import {selectCompareTasksScalarCharts, selectExperimentMetricsSearchTerm, selectMultiSingleValues, selectScalarsHoverMode, selectSelectedExperimentSettings} from '../../reducers';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {toggleShowScalarOptions} from '../../actions/compare-header.actions';
import {GroupByCharts, groupByCharts} from '@common/experiments/reducers/experiment-output.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {RefreshService} from '@common/core/services/refresh.service';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {ChartHoverModeEnum, singleValueChartTitle} from '@common/experiments/shared/common-experiments.const';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {ActivatedRoute, Params} from '@angular/router';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {smoothTypeEnum, SmoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';
import {EventsGetTaskSingleValueMetricsResponseTasks} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseTasks';
import {ExperimentCompareSettings} from "@common/experiments-compare/reducers/experiments-compare-charts.reducer";


@Component({
  selector: 'sm-experiment-compare-scalar-charts',
  templateUrl: './experiment-compare-scalar-charts.component.html',
  styleUrls: ['./experiment-compare-scalar-charts.component.scss'],
})
export class ExperimentCompareScalarChartsComponent implements OnInit, OnDestroy {

  private routerParams$: Observable<Params>;
  public metrics$: Observable<any>;
  public searchTerm$: Observable<string>;

  private subs = new Subscription();

  public graphList: GroupedList = {};
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
  public modelsFeature: boolean;
  private singleValues$: Observable<EventsGetTaskSingleValueMetricsResponseTasks[]>;
  public singleValues: ExtFrame;
  private settings$: Observable<ExperimentCompareSettings>;
  public settings: ExperimentCompareSettings = {} as ExperimentCompareSettings;
  private initialSettings = {
    groupBy: 'none',
    smoothWeight: 0,
    smoothType: smoothTypeEnum.exponential,
    xAxisType: ScalarKeyEnum.Iter,
    hiddenMetricsScalar: []
  }
  private originalSettings: ExperimentCompareSettings;

  @HostListener("window:beforeunload", ["$event"]) unloadHandler() {
    this.saveSettingsState();
  }

  constructor(
    private store: Store,
    private changeDetection: ChangeDetectorRef,
    private route: ActivatedRoute,
    private refresh: RefreshService,
    private reportEmbed: ReportCodeEmbedService,
  ) {
    this.modelsFeature = this.route.snapshot?.parent.data?.setAllProject;
    this.settings$ = this.store.select(selectSelectedExperimentSettings);
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.hoverMode$ = this.store.select(selectScalarsHoverMode).pipe(
      filter(h => !!h),
      distinctUntilChanged());
    this.singleValues$ = this.store.select(selectMultiSingleValues);
    this.metrics$ = this.store.select(selectCompareTasksScalarCharts).pipe(
      filter(metrics => !!metrics),
      distinctUntilChanged()
    );
    this.routerParams$ = this.store.select(selectRouterParams).pipe(
      filter(params => !!params.ids),
      distinctUntilChanged()
    );

  }

  ngOnInit() {
    this.entityType = this.route.snapshot.parent.parent.data.entityType;
    this.subs.add(combineLatest([this.metrics$, this.singleValues$])
      .subscribe(([metricsWrapped, singleValues]) => {
        const metrics = metricsWrapped.metrics || {};

        if (singleValues) {
          const visibles = this.graphsComponent.singleValueGraph.first?.chart.data.reduce((curr, data) => {
            curr[data.task] = data.visible
            return curr;
          }, {}) ?? {};
          const singleValuesData = createMultiSingleValuesChart(singleValues, visibles);
          this.singleValues = prepareGraph(singleValuesData.data, singleValuesData.layout, {}, {type: 'singleValue'});
        }
        this.metrics = metrics;
        this.prepareGraphsAndUpdate(metrics, this.singleValues);
      }));

    this.subs.add(this.routerParams$.subscribe((params) => {
      if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
        this.taskIds = params.ids.split(',');
        this.store.dispatch(setSelectedExperiments({selectedExperiments: this.taskIds}));

        window.setTimeout(() => {  // Waiting for this.settings to be updated.
          this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, xAxisType: this.settings.xAxisType}));
          this.store.dispatch(getMultiSinleScalars({taskIds: this.taskIds, entity: this.entityType}));
        })
      }
    }));

    this.subs.add(this.refresh.tick
      .pipe(filter(auto => auto !== null && this.graphs !== null))
      .subscribe(autoRefresh => {
        this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, xAxisType: this.settings.xAxisType}));
        this.store.dispatch(getMultiSinleScalars({taskIds: this.taskIds, entity: this.entityType, autoRefresh}));
      }));

    this.subs.add(this.settings$.pipe(take(1)).subscribe(settings => {
      this.originalSettings = settings;
      this.settings = settings ? {...this.initialSettings, ...settings} : {...this.initialSettings} as ExperimentCompareSettings;
    }));
  }

  private prepareGraphsAndUpdate(metrics, singleValues) {
    if (metrics || singleValues) {
      let merged = {};
      if (metrics) {
        merged = this.settings.groupBy === 'metric' ? mergeMultiMetricsGroupedVariant(metrics) : mergeMultiMetrics(metrics);
      }
      this.graphList = {...(this.settings.groupBy === 'metric' ? this.buildNestedListWithoutChildren(merged) : metrics), ...(singleValues?.data.length > 0 && {[singleValueChartTitle]: {}})};
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
    this.saveSettingsState();
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  metricSelected(id) {
    this.graphsComponent.scrollToGraph(id);
  }

  hiddenListChanged(hiddenList) {
    this.settings = {...this.settings, hiddenMetricsScalar: hiddenList ?? []};
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  changeSmoothness($event: number) {
    this.settings = {...this.settings, smoothWeight: $event};
  }

  changeSmoothType($event: SmoothTypeEnum) {
    this.settings = {...this.settings, smoothType: $event};
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.settings = {...this.settings, xAxisType: $event};
    this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, xAxisType: this.settings.xAxisType}));
  }

  changeGroupBy($event: GroupByCharts) {
    this.settings = {...this.settings, groupBy: $event};
    this.prepareGraphsAndUpdate(this.metrics, this.singleValues);
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
      type: event.metrics ? 'scalar' : 'single',
      objects: (!!event.metrics || this.taskIds.length > 1) ? this.taskIds : [...this.taskIds, ''],
      objectType: entityType,
      ...event
    });
  }

  private saveSettingsState() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, lastModified, hiddenMetricsPlot, ...cleanSettings} = this.settings;
    if (!isEqual(cleanSettings, this.originalSettings)) {
      this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: cleanSettings}));
    }
  }
}
