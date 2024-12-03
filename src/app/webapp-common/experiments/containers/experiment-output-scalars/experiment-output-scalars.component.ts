import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {RefreshService} from '@common/core/services/refresh.service';
import {
  selectExperimentInfoHistograms,
  selectExperimentMetricsSearchTerm,
  selectIsExperimentInProgress,
  selectLastMetricsValues,
  selectMetricValuesView,
  selectScalarSingleValue,
  selectSelectedSettingsGroupBy,
  selectSelectedSettingsHiddenScalar,
  selectSelectedSettingsSmoothType,
  selectSelectedSettingsSmoothWeight, selectSelectedSettingsTableMetric,
  selectSelectedSettingsxAxisType,
  selectShowSettings,
  selectSplitSize
} from '../../reducers';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, distinctUntilKeyChanged, filter, tap} from 'rxjs/operators';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {ActivatedRoute, Params} from '@angular/router';
import {
  experimentScalarRequested,
  GroupByCharts,
  groupByCharts,
  resetExperimentMetrics,
  setExperimentMetricsSearchTerm,
  setExperimentSettings,
  toggleSettings
} from '../../actions/common-experiment-output.actions';
import {convertScalars, sortMetricsList} from '@common/tasks/tasks.utils';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import { EventsGetTaskSingleValueMetricsResponseValues } from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import { ReportCodeEmbedService } from '~/shared/services/report-code-embed.service';
import {SmoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';
import {singleValueChartTitle} from '@common/experiments/shared/common-experiments.const';
import {GroupedList} from '@common/tasks/tasks.model';

export const prepareScalarList = (metricsScalar: GroupedList): GroupedList =>
  sortMetricsList(Object.keys(metricsScalar || [])).reduce((acc, curr) => {
    acc[curr] = {};
    return acc;
  }, {});


@Component({
  selector: 'sm-experiment-output-scalars',
  templateUrl: './experiment-output-scalars.component.html',
  styleUrls: ['./experiment-output-scalars.component.scss', './shared-experiment-output.scss']
})
export class ExperimentOutputScalarsComponent implements OnInit, OnDestroy {
  protected store = inject(Store);
  private activeRoute = inject(ActivatedRoute);
  private changeDetection = inject(ChangeDetectorRef);
  private reportEmbed = inject(ReportCodeEmbedService);
  private refreshService = inject(RefreshService);

  public scalarList: GroupedList = {};

  private subs = new Subscription();
  protected experimentId: string;
  protected routerParams$: Observable<Params>;
  public refreshDisabled: boolean;
  public listOfHidden$: Observable<string[]>;
  public scalars$: Observable<any>;
  public searchTerm$: Observable<string>;
  public minimized = false;
  public graphs: Record<string, ExtFrame[]>;
  public selectIsExperimentPendingRunning: Observable<boolean>;
  public smoothWeight$: Observable<number>;
  public smoothWeightDelayed$: Observable<number>;
  public smoothType$: Observable<SmoothTypeEnum>;
  public showSettingsBar$ = this.store.select(selectShowSettings);
  public xAxisType$: Observable<ScalarKeyEnum>;
  public groupBy$: Observable<GroupByCharts>;
  public splitSize$: Observable<number>;
  public groupBy: GroupByCharts;
  protected entityType: 'task' | 'model' = 'task';
  protected exportForReport = true;
  private scalars: GroupedList;

  @ViewChild(ExperimentGraphsComponent) experimentGraphs;
  groupByOptions = [
    {
      name: 'Metric',
      value: groupByCharts.metric
    },
    {
      name: 'None',
      value: groupByCharts.none
    }
  ];
  public singleValueData$: Observable<EventsGetTaskSingleValueMetricsResponseValues[]>;
  public experimentName: string;
  public singleValueExists: boolean;
  protected entitySelector: Observable<{ id?: string; name?: string }>;
  protected selectedMetrics: string[] = [];
  private originalScalarList: {metric: string; variant: string}[];
  public metricValuesView$: Observable<boolean>;
  public lastMetricsValues$: Observable<Record<string, any>>;
  private firstTime = true;
  public tableSelectedMetrics$: Observable<string[]>;

  constructor() {
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.metricValuesView$ = this.store.select(selectMetricValuesView);
    this.lastMetricsValues$ = this.store.select(selectLastMetricsValues);
    this.tableSelectedMetrics$ = this.store.select(selectSelectedSettingsTableMetric);
    this.splitSize$ = this.store.select(selectSplitSize);
    this.entitySelector = this.store.select(selectSelectedExperiment);

    this.scalars$ = this.store.select(selectExperimentInfoHistograms)
      .pipe(
        filter((metrics) => !!metrics),
      );

    this.smoothWeight$ = this.store.select(selectSelectedSettingsSmoothWeight).pipe(filter(smooth => smooth !== null));
    this.smoothWeightDelayed$ = this.store.select(selectSelectedSettingsSmoothWeight).pipe(debounceTime(75));
    this.smoothType$ = this.store.select(selectSelectedSettingsSmoothType);
    this.xAxisType$ = this.store.select(selectSelectedSettingsxAxisType(false));
    this.groupBy$ = this.store.select(selectSelectedSettingsGroupBy);
    this.singleValueData$  =  this.store.select(selectScalarSingleValue)
      .pipe(tap( data => this.singleValueExists = data?.length > 0));
    this.listOfHidden$ = this.store.select(selectSelectedSettingsHiddenScalar);


    this.routerParams$ = this.store.select(selectRouterParams)
      .pipe(
        filter(params => !!params.experimentId),
        tap(params => this.experimentId = params.experimentId),
        distinctUntilChanged()
      );

    this.selectIsExperimentPendingRunning = this.store.select(selectIsExperimentInProgress);
  }

  ngOnInit() {
    this.minimized = this.activeRoute.snapshot.routeConfig.data?.minimized;
    this.subs.add(this.groupBy$
      .pipe(filter((groupBy) => !!groupBy))
      .subscribe(groupBy => {
        this.groupBy = groupBy;
        this.prepareGraphsAndUpdate(this.scalars);
      })
    );

    this.subs.add(this.xAxisType$
      .pipe(filter(axis => !!axis && !!this.experimentId))
      .subscribe(() => this.axisChanged())
    );
    this.subs.add(this.singleValueData$.subscribe((data)=> this.singleValueExists = data?.length > 0))

    this.subs.add(this.entitySelector
      .pipe(
        filter(experiment => !!experiment?.id),
        distinctUntilKeyChanged('id')
      )
      .subscribe(experiment => {
        this.experimentId = experiment.id;
        this.experimentName = experiment.name;
        this.scalarList = {};
        this.refresh();
      })
    );

    this.subs.add(this.refreshService.tick
      .pipe(filter(autoRefresh => autoRefresh !== null && !!this.experimentId))
      .subscribe(() => this.refresh())
    );

    this.subs.add(this.scalars$
      .subscribe(scalars => {
        this.refreshDisabled = false;
        this.scalars = scalars;
        this.originalScalarList = [
          ...(this.singleValueExists ? [{metric: singleValueChartTitle, variant: null}] : []),
          ...Object.entries(scalars).map(([metric, value]) => Object.keys(value).map((variant) => ({
            metric,
            variant
          }))).flat()
        ];
        this.prepareGraphsAndUpdate(scalars);
        this.changeDetection.markForCheck();
      })
    );


    this.subs.add(this.routerParams$
      .subscribe(params => {
        if (!this.experimentId || ![params.experimentId, params.modelId].includes(this.experimentId)) {
          this.graphs = undefined;
          this.resetMetrics();
          // this.store.dispatch(new ExperimentScalarRequested(params.experimentId));
          this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm: ''}));
        }
      })
    );

    this.subs.add(combineLatest([this.listOfHidden$, this.scalars$])
      .pipe(debounceTime(50))
      .subscribe(([hiddenList]) => {
        const selectedMetric = (this.firstTime && hiddenList.length === Object.keys(this.scalarList).length) ?
          this.originalScalarList.slice(0, 9) :
          this.groupBy === 'metric' ?
            this.originalScalarList.filter(({metric}) => !hiddenList.includes(metric)) :
            this.originalScalarList.filter(({metric, variant}) => variant !== null ?
              !hiddenList.includes(`${metric} / ${variant}`) && !hiddenList.includes(metric) :
              !hiddenList.includes(metric)
            );
        this.firstTime = false;
        const metricsWithoutVariants = selectedMetric
          .map(({metric}) => metric)
          .filter(m => !!m);
        this.selectedMetrics = Array.from(new Set([
          ...selectedMetric.map(({metric, variant}) => `${metric} / ${variant}`),
          ...metricsWithoutVariants
        ]));
        this.changeDetection.detectChanges();
      }));
  }

  private prepareGraphsAndUpdate(scalars: GroupedList) {
    if (scalars) {
      const splitScalars = this.groupBy === 'metric' ? scalars : this.splitScalars(scalars);
      this.scalarList = {...(this.singleValueExists && {[singleValueChartTitle]: {}}), ...prepareScalarList(splitScalars)};
      this.graphs = convertScalars(splitScalars, this.experimentId);
      this.changeDetection.markForCheck();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  metricSelected(id) {
    this.experimentGraphs?.scrollToGraph(id);
  }


  hiddenListChanged(hiddenList: string[]) {
    this.store.dispatch(setExperimentSettings({
      id: this.experimentId,
      changes: {
        hiddenMetricsScalar: Object.keys(this.scalarList)
          .filter(metric => !hiddenList.includes(metric))
      }
    }));
  }

  refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId}));
    }
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  changeSmoothness($event: number) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {smoothWeight: $event}}));
  }

  changeSmoothType($event: SmoothTypeEnum) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {smoothType: $event}}));
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {xAxisType: $event}}));
  }

  changeGroupBy($event: GroupByCharts) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {groupBy: $event}}));
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleSettings());
  }

  private splitScalars(scalars: GroupedList): GroupedList {
    return Object.entries(scalars).reduce((acc, [metric, variantGraph]) => {
      Object.entries(variantGraph).forEach(([variant, graph]) => {
        acc[metric + ' / ' + variant] = {[metric + ' / ' + variant]: {...graph, originalMetric: metric}};
      });
      return acc;
    }, {});
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; xaxis?: ScalarKeyEnum; domRect: DOMRect }) {
    this.reportEmbed.createCode({
      type: (!event.metrics && !event.variants) ? 'single' : 'scalar',
      objects: [this.experimentId],
      objectType: this.entityType,
      ...event
    });
  }

  protected axisChanged() {
    this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId}));
    this.experimentGraphs.prepareRedraw();
  }

  selectedMetricsChanged(selectedMetrics: string[]) {
    this.store.dispatch(setExperimentSettings({
      id: this.experimentId,
      changes: {selectedMetricTable: selectedMetrics}
    }));
  }
}
