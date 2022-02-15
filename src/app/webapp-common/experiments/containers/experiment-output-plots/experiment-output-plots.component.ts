import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {
  selectExperimentInfoPlots, selectExperimentMetricsSearchTerm,
  selectIsExperimentInProgress, selectSelectedExperimentSettings,
  selectSelectedSettingsHiddenPlot, selectSplitSize
} from '../../reducers';
import {Observable, of, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {SelectableListItem} from '../../../shared/ui-components/data/selectable-list/selectable-list.model';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {scrollToElement} from '../../../shared/utils/shared-utils';
import {ActivatedRoute, Router} from '@angular/router';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {
  experimentPlotsRequested, ResetExperimentMetrics, SetExperimentMetricsSearchTerm,
  SetExperimentSettings
} from '../../actions/common-experiment-output.actions';
import {convertPlots, groupIterations, sortMetricsList} from '../../../tasks/tasks.utils';
import {selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {ExtFrame} from '@common/shared/experiment-graphs/single-graph/plotly-graph-base';
import {MetricsPlotEvent} from '../../../../business-logic/model/events/metricsPlotEvent';

@Component({
  selector: 'sm-experiment-output-plots',
  templateUrl: './experiment-output-plots.component.html',
  styleUrls: ['./experiment-output-plots.component.scss']
})
export class ExperimentOutputPlotsComponent implements OnInit, OnDestroy {

  public plotsList: Array<SelectableListItem> = [];
  public selectedGraph: string = null;

  private plotsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private routerParamsSubscription: Subscription;
  private experimentId: string;
  private routerParams$: Observable<any>;
  public listOfHidden: Observable<Array<any>>;
  public plots$: Observable<MetricsPlotEvent[]>;
  public experimentSettings$: Observable<any>;
  public searchTerm$: Observable<string>;
  public minimized: boolean = false;
  public graphs: { [key: string]: ExtFrame[] };
  public refreshDisabled: boolean;
  public selectIsExperimentPendingRunning: Observable<boolean>;
  private selectedExperimentSubscription: Subscription;
  public splitSize$: Observable<number>;


  constructor(private store: Store<IExperimentInfoState>, private router: Router, private activeRoute: ActivatedRoute, private changeDetection: ChangeDetectorRef) {
    this.searchTerm$ = this.store.pipe(select(selectExperimentMetricsSearchTerm));
    this.splitSize$ = this.store.pipe(select(selectSplitSize));

    this.plots$ = this.store.pipe(
      select(selectExperimentInfoPlots),
      distinctUntilChanged(),
      filter(metrics => !!metrics)
    );

    this.experimentSettings$ = this.store.pipe(
      select(selectSelectedExperimentSettings),
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedPlot : null),
      distinctUntilChanged()
    );

    this.routerParams$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.experimentId),
      distinctUntilChanged()
    );

    this.selectIsExperimentPendingRunning = this.store.pipe(
      select(selectIsExperimentInProgress)
    );
  }

  ngOnInit() {
    this.minimized = this.activeRoute.snapshot.routeConfig.data.minimized;
    this.listOfHidden = this.minimized ? of([]) : this.store.select(selectSelectedSettingsHiddenPlot);
    this.plotsSubscription = this.plots$
      .subscribe((metricsPlots) => {
        this.refreshDisabled = false;
        const groupedPlots = groupIterations(metricsPlots);
        this.plotsList = this.preparePlotsList(groupedPlots);
        this.graphs = convertPlots({plots: groupedPlots, experimentId: this.experimentId});
        this.changeDetection.detectChanges();
      });

    this.settingsSubscription = this.experimentSettings$
      .subscribe((selectedPlot) => {
        this.selectedGraph = selectedPlot;
        scrollToElement(this.selectedGraph);
      });

    this.routerParamsSubscription = this.routerParams$
      .subscribe(params => {
        if (!this.experimentId || this.experimentId !== params.experimentId) {
          this.graphs = undefined;
          this.resetMetrics();
          // this.store.dispatch(new ExperimentPlotsRequested(params.experimentId));
          this.store.dispatch(new SetExperimentMetricsSearchTerm({searchTerm: ''}));
        }
        this.experimentId = params.experimentId;
      });

    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
        distinctUntilChanged()
      )
      .subscribe(experiment => {
        this.experimentId = experiment.id;
        this.refresh();
      });

  }

  ngOnDestroy() {
    this.resetMetrics();
    this.plotsSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    this.routerParamsSubscription.unsubscribe();
    this.selectedExperimentSubscription.unsubscribe();
    this.resetMetrics();
  }

  private preparePlotsList(groupedPlots: {[title: string]: MetricsPlotEvent[]}): Array<SelectableListItem> {
    const list = groupedPlots ? Object.keys(groupedPlots) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  metricSelected(id: string) {
    this.store.dispatch(new SetExperimentSettings({id: this.experimentId, changes: {selectedPlot: id}}));
  }

  hiddenListChanged(hiddenList: string[]) {
    this.store.dispatch(new SetExperimentSettings({id: this.experimentId, changes: {hiddenMetricsPlot: hiddenList}}));
  }

  refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(experimentPlotsRequested({task: this.experimentId}));
    }
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(new SetExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(new ResetExperimentMetrics());
  }

}
