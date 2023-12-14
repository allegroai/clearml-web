import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  selectExperimentInfoHistograms,
  selectExperimentMetricsSearchTerm,
  selectIsExperimentInProgress,
  selectScalarSingleValue,
  selectSelectedExperimentSettings,
  selectSelectedSettingsGroupBy,
  selectSelectedSettingsHiddenScalar,
  selectSelectedSettingsSmoothWeight,
  selectSelectedSettingsxAxisType,
  selectShowSettings,
  selectSplitSize
} from '../../reducers';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {ActivatedRoute, Router} from '@angular/router';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {
  experimentScalarRequested,
  resetExperimentMetrics,
  setExperimentMetricsSearchTerm,
  setExperimentSettings,
  toggleSettings
} from '../../actions/common-experiment-output.actions';
import {convertScalars, GroupedList} from '@common/tasks/tasks.utils';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {GroupByCharts, groupByCharts} from '../../reducers/experiment-output.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {isEqual} from 'lodash-es';
import { EventsGetTaskSingleValueMetricsResponseValues } from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import { ReportCodeEmbedService } from '~/shared/services/report-code-embed.service';

export const prepareScalarList = (metricsScalar: GroupedList): GroupedList =>
  Object.keys(metricsScalar || []).reduce((acc, curr) => {
    acc[curr] = {};
    return acc;
  }, {});


@Component({
  selector: 'sm-experiment-output-scalars',
  templateUrl: './experiment-output-scalars.component.html',
  styleUrls: ['./experiment-output-scalars.component.scss', './shared-experiment-output.scss']
})
export class ExperimentOutputScalarsComponent implements OnInit, OnDestroy {
  public scalarList: GroupedList = {};
  public selectedGraph: string = null;

  private subs = new Subscription();
  protected experimentId: string;
  protected routerParams$: Observable<any>;
  public refreshDisabled: boolean;
  public listOfHidden$: Observable<Array<any>>;
  public scalars$: any;
  public settings$: Observable<any>;
  public searchTerm$: Observable<string>;
  public minimized: boolean = false;
  public graphs: { [key: string]: ExtFrame[] };
  public selectIsExperimentPendingRunning: Observable<boolean>;
  public smoothWeight$: Observable<number>;
  public showSettingsBar: boolean = false;
  public xAxisType$: Observable<ScalarKeyEnum>;
  public groupBy$: Observable<GroupByCharts>;
  public splitSize$: Observable<number>;
  public groupBy: GroupByCharts;
  protected entitySelector = this.store.select(selectSelectedExperiment) as Observable<{id?: string; name?: string}>;
  protected entityType: 'task' | 'model' = 'task';
  protected exportForReport = true;
  private scalars: any;

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
  public singleValueData$: Observable<Array<EventsGetTaskSingleValueMetricsResponseValues>>;
  public experimentName: string;
  private singleValueExists: boolean;

  constructor(
    protected store: Store<ExperimentInfoState>,
    protected router: Router,
    protected activeRoute: ActivatedRoute,
    protected changeDetection: ChangeDetectorRef,
    protected reportEmbed: ReportCodeEmbedService
  ) {
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.splitSize$ = this.store.select(selectSplitSize);

    this.scalars$ = this.store.select(selectExperimentInfoHistograms)
      .pipe(
        filter((metrics) => !!metrics),
      );

    this.settings$ = this.store.select(selectSelectedExperimentSettings)
      .pipe(
        filter(settings => !!settings),
        map(settings => settings ? settings.selectedScalar : null)
      );
    this.smoothWeight$ = this.store.select(selectSelectedSettingsSmoothWeight);
    this.xAxisType$ = this.store.select(selectSelectedSettingsxAxisType);
    this.groupBy$ = this.store.select(selectSelectedSettingsGroupBy);
    this.singleValueData$  =  this.store.select(selectScalarSingleValue)
      .pipe(tap( data => this.singleValueExists = data?.length > 0));
    this.listOfHidden$ = this.store.select(selectSelectedSettingsHiddenScalar)
      .pipe(distinctUntilChanged(isEqual));


    this.routerParams$ = this.store.select(selectRouterParams)
      .pipe(
        filter(params => !!params.experimentId),
        tap(params => this.experimentId = params.experimentId),
        distinctUntilChanged()
      );

    this.selectIsExperimentPendingRunning = this.store.select(selectIsExperimentInProgress);

    this.subs.add(this.store.select(selectShowSettings)
      .subscribe((show) => this.showSettingsBar = show)
    );
  }

  ngOnInit() {
    this.minimized = this.activeRoute.snapshot.routeConfig.data.minimized;

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

    this.subs.add(this.entitySelector
      .pipe(
        filter(experiment => !!experiment?.id),
        distinctUntilChanged()
      )
      .subscribe(experiment => {
        this.experimentId = experiment.id;
        this.experimentName = experiment.name;
        this.scalarList = {};
        this.refresh();
      })
    );

    this.subs.add(this.scalars$
      .subscribe(scalars => {
        this.refreshDisabled = false;
        this.scalars = scalars;
        this.prepareGraphsAndUpdate(scalars);
      })
    );

    this.subs.add(this.settings$
      .subscribe((selectedScalar) => {
        this.selectedGraph = selectedScalar;
        this.experimentGraphs?.scrollToGraph(selectedScalar);
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
  }

  private prepareGraphsAndUpdate(scalars: GroupedList) {
    if (scalars) {
      const splittedScalars = this.groupBy === 'metric' ? scalars : this.splitScalars(scalars);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      this.scalarList = {...(this.singleValueExists && {Summary: {}}), ...prepareScalarList(splittedScalars)};
      this.graphs = convertScalars(splittedScalars, this.experimentId);
      this.changeDetection.detectChanges();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  metricSelected(id) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {selectedScalar: id}}));
  }


  hiddenListChanged(hiddenList) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {hiddenMetricsScalar: hiddenList}}));
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

  changeSmoothness($event: any) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {smoothWeight: $event}}));
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

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; domRect: DOMRect}) {
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
}
