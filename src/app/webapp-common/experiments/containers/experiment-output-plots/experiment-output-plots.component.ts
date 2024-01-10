import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {addMessage} from '@common/core/actions/layout.actions';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {RefreshService} from '@common/core/services/refresh.service';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {convertPlots, groupIterations, sortMetricsList} from '@common/tasks/tasks.utils';
import {Store} from '@ngrx/store';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, distinctUntilKeyChanged, filter, map} from 'rxjs/operators';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {
  experimentPlotsRequested,
  resetExperimentMetrics,
  setExperimentMetricsSearchTerm,
  setExperimentSettings
} from '../../actions/common-experiment-output.actions';
import {
  selectExperimentInfoPlots,
  selectExperimentMetricsSearchTerm,
  selectIsExperimentInProgress,
  selectSelectedSettingsHiddenPlot,
  selectSplitSize
} from '../../reducers';

@Component({
  selector: 'sm-experiment-output-plots',
  templateUrl: './experiment-output-plots.component.html',
  styleUrls: ['./experiment-output-plots.component.scss', '../experiment-output-scalars/shared-experiment-output.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentOutputPlotsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isDatasetVersionPreview = false;
  @Input() selected: {id: string};
  @ViewChild(ExperimentGraphsComponent) graphsComponent: ExperimentGraphsComponent;

  public plotsList: Array<SelectableListItem>;
  private experimentId: string;
  private routerParams$: Observable<{[para: string]: string}>;
  public listOfHidden$: Observable<Array<string>>;
  public searchTerm$: Observable<string>;
  public minimized: boolean = false;
  public graphs: { [key: string]: ExtFrame[] };
  public refreshDisabled: boolean;
  public selectIsExperimentPendingRunning: Observable<boolean>;
  public splitSize$: Observable<number>;
  public dark: boolean;
  private subs = new Subscription();
  private plots$: Observable<MetricsPlotEvent[]>;
  public selectedMetrics: string[];


  constructor(
    private store: Store,
    private activeRoute: ActivatedRoute,
    private changeDetection: ChangeDetectorRef,
    private reportEmbed: ReportCodeEmbedService,
    protected refreshService: RefreshService
  ) {
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.splitSize$ = this.store.select(selectSplitSize);
    this.listOfHidden$ = this.store.select(selectSelectedSettingsHiddenPlot);
    this.plots$ = this.store.select(selectExperimentInfoPlots).pipe(
      filter((metrics) => !!metrics),
    );

    this.routerParams$ = this.store.select(selectRouterParams)
      .pipe(
        filter(params => !!params.experimentId && !this.isDatasetVersionPreview),
        distinctUntilChanged()
      );

    this.selectIsExperimentPendingRunning = this.store.select(selectIsExperimentInProgress);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.selected && this.experimentId !== changes.selected.currentValue.id ){
      this.dark = true;
      this.experimentId = changes.selected.currentValue.id;
      this.refresh();
    }
  }

  ngOnInit() {
    this.minimized = this.activeRoute.snapshot.routeConfig.data?.minimized;
    this.subs.add(this.store.select(selectExperimentInfoPlots)
      .pipe(
        distinctUntilChanged(),
        filter(metrics => !!metrics),
        map(plots => this.isDatasetVersionPreview ? plots.filter(plot => !plot.metric.startsWith('_')).filter(plot=> !['Execution Flow', 'Execution Details'].includes(plot.variant)) : plots),
      )
      .subscribe(metricsPlots => {
        this.refreshDisabled = false;
        const groupedPlots = groupIterations(metricsPlots);
        this.plotsList = this.preparePlotsList(groupedPlots);
        const {graphs, parsingError} = convertPlots({plots: groupedPlots, id: this.experimentId});
        this.graphs = graphs;
        parsingError && this.store.dispatch(addMessage('warn', `Couldn't read all plots. Please make sure all plots are properly formatted (NaN & Inf aren't supported).`, [], true));
        this.changeDetection.markForCheck();
      }));

    this.subs.add(this.routerParams$
      .subscribe(params => {
        if (!this.experimentId || this.experimentId !== params.experimentId) {
          this.graphs = undefined;
          this.resetMetrics();
          // this.store.dispatch(new ExperimentPlotsRequested(params.experimentId));
          this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm: ''}));
        }
        this.experimentId = params.experimentId;
        this.changeDetection.markForCheck();
      }));

    this.subs.add(this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment && !this.isDatasetVersionPreview),
        distinctUntilKeyChanged('id')
      )
      .subscribe(experiment => {
        this.experimentId = experiment.id;
        this.refresh();
        this.changeDetection.markForCheck();
      }));

    this.subs.add(this.refreshService.tick
      .pipe(filter(autoRefresh => autoRefresh !== null && !!this.experimentId))
      .subscribe(() => {
        this.refresh();
        this.changeDetection.markForCheck();
      })
    );

    this.subs.add(combineLatest([this.listOfHidden$, this.plots$])
      .subscribe(([hiddenList]) => {
        this.selectedMetrics = hiddenList.length === 0 ?
          this.plotsList.map( name => name.name) :
          this.plotsList.map( name => name.name).filter(metric => !hiddenList.includes(metric));
        this.changeDetection.markForCheck();
    }));
  }

  ngOnDestroy() {
    this.resetMetrics();
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  private preparePlotsList(groupedPlots: { [title: string]: MetricsPlotEvent[] }): Array<SelectableListItem> {
    const list = groupedPlots ? Object.keys(groupedPlots) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  metricSelected(id: string) {
    this.graphsComponent?.scrollToGraph(id);
  }

  hiddenListChanged(hiddenList: string[]) {
    this.store.dispatch(setExperimentSettings({
      id: this.experimentId,
      changes: {hiddenMetricsPlot: this.plotsList.map( name => name.name).filter(metric => !hiddenList.includes(metric))}}));
  }

  refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(experimentPlotsRequested({task: this.experimentId}));
    }
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; domRect: DOMRect }) {
    this.reportEmbed.createCode({
      type: 'plot',
      objects: [this.experimentId],
      objectType: 'task',
      ...event
    });
  }
}
