import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {selectModelPlots, selectSelectedModel, selectSplitSize} from '@common/models/reducers';
import {addMessage} from '@common/core/actions/layout.actions';
import {convertPlots, groupIterations, sortMetricsList} from '@common/tasks/tasks.utils';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {getPlots, setPlots} from '@common/models/actions/models-info.actions';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {selectModelSettingsHiddenPlot, selectModelSettingsHiddenScalar} from "@common/experiments/reducers";
import {isEqual} from "lodash-es";
import {setExperimentSettings} from "@common/experiments/actions/common-experiment-output.actions";
import {selectSelectedSettingsHiddenPlot} from "@common/experiments-compare/reducers";

@Component({
  selector: 'sm-model-info-plot',
  templateUrl: './model-info-plots.component.html',
  styleUrls: [
    './model-info-plots.component.scss',
    '../../../experiments/containers/experiment-output-scalars/shared-experiment-output.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelInfoPlotsComponent implements OnInit, OnDestroy {
  public graphs: { [key: string]: any[] };
  public plotsList: Array<SelectableListItem>;
  public searchTerm: string;
  public minimized = true;
  public dark = false;
  public splitSize$: Observable<number>;
  public modelsFeature = false;
  private sub = new Subscription();
  private refreshDisabled: boolean;
  private modelId: string;

  @ViewChild(ExperimentGraphsComponent) graphsComponent: ExperimentGraphsComponent;
  public listOfHidden$: Observable<any>;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private activeRoute: ActivatedRoute,
    private reportEmbed: ReportCodeEmbedService,
    private route: ActivatedRoute
    ) {
    // this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.splitSize$ = this.store.select(selectSplitSize);
    this.modelsFeature = !!this.route.snapshot?.parent?.parent?.data?.setAllProject;
    this.listOfHidden$ = this.store.select(selectModelSettingsHiddenPlot)
      .pipe(distinctUntilChanged(isEqual));
  }

  ngOnInit(): void {
    this.minimized = this.activeRoute.snapshot.routeConfig.data?.minimized;
    this.sub.add(this.store.select(selectSelectedModel)
      .pipe(
        filter(model => !!model),
        distinctUntilChanged()
      )
      .subscribe(model => {
        this.modelId = model.id;
        this.refresh();
      })
    );

    this.sub.add(this.store.select(selectRouterParams)
      .pipe(
        filter(params => !!params.modelId),
        distinctUntilChanged()
      )
      .subscribe(params => {
        if (!this.modelId || this.modelId !== params.modelId) {
          this.graphs = undefined;
          this.resetMetrics();
          this.searchTerm = '';
        }
        this.modelId = params.modelId;
      })
    );

    this.sub.add(this.store.select(selectModelPlots)
      .pipe(
        distinctUntilChanged(),
        filter(metrics => !!metrics),
      )
      .subscribe(metricsPlots => {
        this.refreshDisabled = false;
        const groupedPlots = groupIterations(metricsPlots);
        this.plotsList = this.preparePlotsList(groupedPlots);
        const {graphs, parsingError} = convertPlots({plots: groupedPlots, id: this.modelId});
        this.graphs = graphs;
        parsingError && this.store.dispatch(addMessage('warn', `Couldn't read all plots. Please make sure all plots are properly formatted (NaN & Inf aren't supported).`, [], true));
        this.cdr.detectChanges();
      })
    );
  }

  private preparePlotsList(groupedPlots: { [title: string]: MetricsPlotEvent[] }): Array<SelectableListItem> {
    const list = groupedPlots ? Object.keys(groupedPlots) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(getPlots({id: this.modelId}));
    }
  }

  metricSelected(id: string) {
    this.graphsComponent?.scrollToGraph(id);
  }

  hiddenListChanged(hiddenList: string[]) {
    this.store.dispatch(setExperimentSettings({id: this.modelId, changes: {hiddenMetricsPlot: hiddenList}}));
  }
  searchTermChanged(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  resetMetrics() {
    this.store.dispatch(setPlots({plots: null}));
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; domRect: DOMRect }) {
    this.reportEmbed.createCode({
      type: 'plot',
      objects: [this.modelId],
      objectType: 'model',
      ...event
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
