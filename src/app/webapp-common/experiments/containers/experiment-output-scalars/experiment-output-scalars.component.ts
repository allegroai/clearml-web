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
import {select, Store} from '@ngrx/store';
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
import {GroupByCharts, groupByCharts} from '../../reducers/common-experiment-output.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {isEqual} from 'lodash/fp';
import { EventsGetTaskSingleValueMetricsResponseValues } from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {ReportCodeEmbedService} from '@common/shared/services/report-code-embed.service';

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
  private experimentId: string;
  private routerParams$: Observable<any>;
  private selectedExperimentId$: Observable<any>;
  public refreshDisabled: boolean;
  public listOfHidden: Observable<Array<any>>;
  public scalars$: any;
  public experimentSettings$: Observable<any>;
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

  constructor(
    private store: Store<ExperimentInfoState>,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private changeDetection: ChangeDetectorRef,
    private reportEmbed: ReportCodeEmbedService
  ) {
    this.searchTerm$ = this.store.pipe(select(selectExperimentMetricsSearchTerm));
    this.splitSize$ = this.store.pipe(select(selectSplitSize));

    this.scalars$ = this.store.select(selectExperimentInfoHistograms)
      .pipe(
        filter((metrics) => !!metrics),
      );

    this.experimentSettings$ = this.store.pipe(
      select(selectSelectedExperimentSettings),
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedScalar : null),
      distinctUntilChanged()
    );
    this.smoothWeight$ = this.store.select(selectSelectedSettingsSmoothWeight);
    this.xAxisType$ = this.store.select(selectSelectedSettingsxAxisType);
    this.groupBy$ = this.store.select(selectSelectedSettingsGroupBy);
    this.singleValueData$  =  this.store.select(selectScalarSingleValue);

    this.routerParams$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.experimentId),
      tap(params => this.experimentId = params.experimentId),
      distinctUntilChanged()
    );

    this.selectIsExperimentPendingRunning = this.store.pipe(
      select(selectIsExperimentInProgress)
    );

    this.selectedExperimentId$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.experimentId),
      distinctUntilChanged()
    );

    this.subs.add(this.xAxisType$
      .pipe(filter(axis => !!axis && !!this.experimentId))
      .subscribe(() => {
        this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId}));
        this.experimentGraphs.prepareRedraw();
      })
    );

    this.subs.add(this.groupBy$
      .pipe(filter((groupBy) => !!groupBy))
      .subscribe(groupBy => {
        this.groupBy = groupBy;
        this.prepareGraphsAndUpdate(this.scalars);
      })
    );

    this.subs.add(this.singleValueData$
      .subscribe(data => {
        if(data?.length>0 && !this.scalarList['Summary']){
          this.scalarList['Summary'] = {};
        }
      })
    );

    this.subs.add(this.store.select(selectShowSettings)
      .subscribe((show) => this.showSettingsBar = show)
    );
  }

  ngOnInit() {
    this.minimized = this.activeRoute.snapshot.routeConfig.data.minimized;
    this.listOfHidden = this.store.select(selectSelectedSettingsHiddenScalar)
      .pipe(distinctUntilChanged(isEqual));

    this.subs.add(this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
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

    this.subs.add(this.experimentSettings$
      .subscribe((selectedScalar) => {
        this.selectedGraph = selectedScalar;
        this.experimentGraphs?.scrollToGraph(selectedScalar);
      })
    );

    this.subs.add(this.routerParams$
      .subscribe(params => {
        if (!this.experimentId || this.experimentId !== params.experimentId) {
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
      this.scalarList = {...this.scalarList, ...prepareScalarList(splittedScalars)};
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
        acc[metric + ' / ' + variant] = {[metric + ' / ' + variant]: graph};
      });
      return acc;
    }, {});
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[] }) {
    this.reportEmbed.createCode({
      type: 'scalar',
      tasks: [this.experimentId],
      ...event
    });
  }
}
