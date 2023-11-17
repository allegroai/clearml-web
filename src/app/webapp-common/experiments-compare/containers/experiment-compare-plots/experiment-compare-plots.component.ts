import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {distinctUntilChanged, filter, take, tap} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {convertMultiPlots, prepareMultiPlots, sortMetricsList} from '@common/tasks/tasks.utils';
import {isEqual} from 'lodash-es';
import {
  getMultiPlotCharts,
  resetExperimentMetrics,
  setExperimentMetricsSearchTerm,
  setExperimentSettings,
  setSelectedExperiments
} from '../../actions/experiments-compare-charts.actions';
import {
  selectCompareTasksPlotCharts,
  selectExperimentMetricsSearchTerm,
  selectGlobalLegendData,
  selectSelectedSettingsHiddenPlot,
} from '../../reducers';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {RefreshService} from '@common/core/services/refresh.service';
import {addMessage} from '@common/core/actions/layout.actions';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import { ReportCodeEmbedService } from '~/shared/services/report-code-embed.service';
import {ActivatedRoute} from '@angular/router';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ExperimentCompareSettings} from "@common/experiments-compare/reducers/experiments-compare-charts.reducer";

@Component({
  selector: 'sm-experiment-compare-plots',
  templateUrl: './experiment-compare-plots.component.html',
  styleUrls: ['./experiment-compare-plots.component.scss']
})
export class ExperimentComparePlotsComponent implements OnInit, OnDestroy {

  private routerParams$: Observable<any>;
  private listOfHidden$: Observable<any[]>;
  public plots$: Observable<any>;
  public searchTerm$: Observable<string>;

  private subs = new Subscription();

  public graphList: SelectableListItem[] = [];
  private taskIds: Array<string>;
  public graphs: { [key: string]: ExtFrame[] };
  public refreshDisabled: boolean;

  @ViewChild(ExperimentGraphsComponent) graphsComponent: ExperimentGraphsComponent;
  private entityType: EntityTypeEnum;
  public modelsFeature: boolean;
  public settings: ExperimentCompareSettings = {} as ExperimentCompareSettings;
  private initialSettings = {
    hiddenMetricsPlot: []
  } as ExperimentCompareSettings;
  private originalSettings: any[];

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
    this.listOfHidden$ = this.store.pipe(select(selectSelectedSettingsHiddenPlot));
    this.searchTerm$ = this.store.pipe(select(selectExperimentMetricsSearchTerm));
    this.plots$ = this.store.pipe(
      select(selectCompareTasksPlotCharts),
      filter(metrics => !!metrics),
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
    this.entityType = this.route.snapshot.parent.parent.data.entityType;
    this.subs.add(combineLatest([this.plots$, this.store.select(selectGlobalLegendData)])
      .subscribe(([metricsPlots, globalLegend]) => {
        this.refreshDisabled = false;
        const {merged, parsingError} = prepareMultiPlots(metricsPlots, globalLegend);
        this.graphList = this.prepareList(merged);
        const tagsLists = globalLegend.reduce((acc, task) => {
          acc[task.id] = task.tags ?? [];
          return acc;
        }, {} as {[id:string]: string[]});
        const newGraphs = convertMultiPlots(merged, tagsLists);
        if (!this.graphs || !isEqual(newGraphs, this.graphs)) {
          this.graphs = newGraphs;
        }
        this.changeDetection.detectChanges();
        parsingError && this.store.dispatch(addMessage('warn', `Couldn't read all plots. Please make sure all plots are properly formatted (NaN & Inf aren't supported).`, [], true));
      }));

    this.subs.add(this.routerParams$
      .subscribe((params) => {
        if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
          this.taskIds = params.ids.split(',');
          this.store.dispatch(setSelectedExperiments({selectedExperiments: this.taskIds}));
          this.store.dispatch(getMultiPlotCharts({taskIds: this.taskIds, entity: this.entityType}));
        }
      }));

    this.subs.add(this.refresh.tick
      .pipe(filter(auto => auto !== null))
      .subscribe(autoRefresh =>
        this.store.dispatch(getMultiPlotCharts({taskIds: this.taskIds, entity: this.entityType, autoRefresh}))
      ));

    this.subs.add(this.listOfHidden$.pipe(take(1)).subscribe(hiddenPlots => {
      this.originalSettings = hiddenPlots;
      this.settings = hiddenPlots ? {...this.initialSettings, hiddenMetricsPlot: hiddenPlots} : {...this.initialSettings} as ExperimentCompareSettings;
    }));
  }

  ngOnDestroy() {
    this.saveSettingsState();
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  private prepareList(metricsScalar): Array<SelectableListItem> {
    const list = metricsScalar ? Object.keys(metricsScalar) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  metricSelected(id) {
    this.graphsComponent?.scrollToGraph(id);
  }

  hiddenListChanged(hiddenList) {
    this.settings = {...this.settings, hiddenMetricsPlot: hiddenList};
  }


  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; originalObject?: string; domRect: DOMRect }) {
    const entityType = this.entityType === EntityTypeEnum.model ? 'model' : 'task';
    const idsOriginalFirst = event.originalObject ? [event.originalObject, ...this.taskIds.filter(id => id !== event.originalObject)] : this.taskIds;
    this.reportEmbed.createCode({
      type: 'plot',
      objects: idsOriginalFirst,
      objectType: entityType,
      ...event
    });
  }

  private saveSettingsState() {
    if (!isEqual(this.settings.hiddenMetricsPlot, this.originalSettings)) {
      this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {hiddenMetricsPlot: this.settings.hiddenMetricsPlot}}));
    }
  }
}
