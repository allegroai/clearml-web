import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {convertMultiPlots, prepareMultiPlots, sortMetricsList} from '@common/tasks/tasks.utils';
import {isEqual} from 'lodash/fp';
import {scrollToElement} from '@common/shared/utils/shared-utils';
import {GetMultiPlotCharts, ResetExperimentMetrics, SetExperimentMetricsSearchTerm, SetExperimentSettings, SetSelectedExperiments} from '../../actions/experiments-compare-charts.actions';
import {selectCompareTasksPlotCharts, selectExperimentMetricsSearchTerm, selectSelectedExperimentSettings, selectSelectedSettingsHiddenPlot} from '../../reducers';
import {ExtFrame} from '@common/shared/experiment-graphs/single-graph/plotly-graph-base';
import {RefreshService} from '@common/core/services/refresh.service';

@Component({
  selector: 'sm-experiment-compare-plots',
  templateUrl: './experiment-compare-plots.component.html',
  styleUrls: ['./experiment-compare-plots.component.scss']
})
export class ExperimentComparePlotsComponent implements OnInit, OnDestroy {

  private routerParams$: Observable<any>;
  public listOfHidden: Observable<Array<any>>;
  public plots$: Observable<any>;
  public experimentSettings$: Observable<any>;
  public searchTerm$: Observable<string>;

  private plotsSubscription: Subscription;
  private settingsSubscription: Subscription;
  private routerParamsSubscription: Subscription;
  private refreshingSubscription: Subscription;

  public graphList: SelectableListItem[] = [];
  public selectedGraph: string = null;
  private taskIds: Array<string>;
  public graphs: { [key: string]: ExtFrame[] };
  public refreshDisabled: boolean;


  constructor(private store: Store<IExperimentInfoState>, private changeDetection: ChangeDetectorRef, private refresh: RefreshService) {
    this.listOfHidden = this.store.pipe(select(selectSelectedSettingsHiddenPlot));
    this.searchTerm$ = this.store.pipe(select(selectExperimentMetricsSearchTerm));
    this.plots$ = this.store.pipe(
      select(selectCompareTasksPlotCharts),
      filter(metrics => !!metrics),
      distinctUntilChanged()
    );
    this.experimentSettings$ = this.store.pipe(
      select(selectSelectedExperimentSettings),
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedPlot : null),
      distinctUntilChanged()
    );

    this.routerParams$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.ids),
      distinctUntilChanged(),
      tap(() => this.refreshDisabled = true)
    );

  }

  ngOnInit() {
    this.plotsSubscription = this.plots$
      .subscribe((metricsPlots) => {
        this.refreshDisabled = false;
        const merged = prepareMultiPlots(metricsPlots);
        this.graphList = this.prepareList(merged);
        const newGraphs = convertMultiPlots(merged);
        if (!this.graphs || !isEqual(newGraphs, this.graphs)) {
          this.graphs = newGraphs;
        }
        this.changeDetection.detectChanges();
      });

    this.settingsSubscription = this.experimentSettings$
      .subscribe((selectedPlot) => {
        this.selectedGraph = selectedPlot;
        scrollToElement(this.selectedGraph);
      });

    this.routerParamsSubscription = this.routerParams$
      .subscribe(params => {
        if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
          this.taskIds = params.ids.split(',');
          this.store.dispatch(new SetSelectedExperiments({selectedExperiments: this.taskIds}));
          this.store.dispatch(new GetMultiPlotCharts({taskIds: this.taskIds}));
        }
      });

    this.refreshingSubscription = this.refresh.tick
      .pipe(filter(auto => auto !== null))
    .subscribe(autoRefresh =>
      this.store.dispatch(new GetMultiPlotCharts({taskIds: this.taskIds, autoRefresh}))
    );
  }

  ngOnDestroy() {
    this.plotsSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    this.routerParamsSubscription.unsubscribe();
    this.refreshingSubscription.unsubscribe();
    this.resetMetrics();
  }

  private prepareList(metricsScalar: Object): Array<SelectableListItem> {
    const list = metricsScalar ? Object.keys(metricsScalar) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  metricSelected(id) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {selectedPlot: id}}));
  }

  hiddenListChanged(hiddenList) {
    this.store.dispatch(new SetExperimentSettings({id: this.taskIds, changes: {hiddenMetricsPlot: hiddenList}}));
  }


  searchTermChanged(searchTerm: string) {
    this.store.dispatch(new SetExperimentMetricsSearchTerm({searchTerm: searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(new ResetExperimentMetrics());
  }
}
