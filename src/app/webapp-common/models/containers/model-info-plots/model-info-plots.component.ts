import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectModelPlots, selectSelectedModel, selectSplitSize} from '@common/models/reducers';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {addMessage} from '@common/core/actions/layout.actions';
import {convertPlots, groupIterations, sortMetricsList} from '@common/tasks/tasks.utils';
import { MetricsPlotEvent } from '~/business-logic/model/events/metricsPlotEvent';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {getPlots, setPlots} from '@common/models/actions/models-info.actions';

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
  public selectedGraph: string = null;
  public listOfHidden = [] as string[];
  public searchTerm: string;
  public minimized = true;
  public dark = false;
  public splitSize$: Observable<number>;
  private sub = new Subscription();
  private refreshDisabled: boolean;
  private modelId: string;

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    // this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.splitSize$ = this.store.select(selectSplitSize);
  }

  ngOnInit(): void {
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
    this.selectedGraph = id;
  }

  hiddenListChanged(hiddenList: string[]) {
    this.listOfHidden = hiddenList;
  }
  searchTermChanged(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  resetMetrics() {
    this.store.dispatch(setPlots({plots: null}));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
