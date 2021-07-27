import {Component, HostListener, OnDestroy, OnInit, ElementRef, ViewChild} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {get, has} from 'lodash/fp';
import {SetExperimentSettings, SetSelectedExperiments} from '../../actions/experiments-compare-charts.actions';
import {selectRefreshing, selectScalarsGraphHyperParams, selectScalarsGraphMetrics, selectScalarsGraphShowIdenticalHyperParams, selectScalarsGraphTasks, selectMetricValueType, selectSelectedSettigsHyperParams, selectSelectedSettigsMetric} from '../../reducers';
import {getExperimentsHyperParams, setShowIdenticalHyperParams, setvalueType} from '../../actions/experiments-compare-scalars-graph.actions';
import {GroupedHyperParams, MetricOption, MetricValueType, SelectedMetric, VariantOption} from '../../reducers/experiments-compare-charts.reducer';
import {MatRadioChange} from '@angular/material/radio';
import {selectPlotlyReady} from '../../../core/reducers/view-reducer';
import {ExtFrame} from '../../../shared/experiment-graphs/single-graph/plotly-graph-base';


export const _filter = (opt: VariantOption[], value: string): VariantOption[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.name.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'sm-experiment-compare-hyper-params-graph',
  templateUrl: './experiment-compare-hyper-params-graph.component.html',
  styleUrls: ['./experiment-compare-hyper-params-graph.component.scss']
})
export class ExperimentCompareHyperParamsGraphComponent implements OnInit, OnDestroy {
  private routerParamsSubscription: Subscription;
  private hyperParamsSubscription: Subscription;
  private metricSubscription: Subscription;
  private selectMetricSubscription: Subscription;
  private refreshingSubscription: Subscription;

  public selectShowIdenticalHyperParams$: Observable<boolean>;
  public hyperParams$: Observable<GroupedHyperParams>;
  public metrics$: Observable<MetricOption[]>;
  public selectedHyperParams$: Observable<string[]>;
  private selectedMetric$: Observable<SelectedMetric>;
  private selectRefreshing$: Observable<{ refreshing: boolean, autoRefresh: boolean }>;
  public experiments$: Observable<any[]>;

  public graphs: { [key: string]: ExtFrame };
  public selectedHyperParams: string[];
  public selectedMetric: SelectedMetric;
  public hyperParams: { [section: string]:  any};
  public showIdenticalParamsActive: boolean;
  public plotlyReady$ = this.store.select(selectPlotlyReady);

  public metrics: MetricOption[];
  public metricsOptions: MetricOption[];
  public listOpen = true;
  private initView = true;
  private taskIds: string[];

  public metricValueType$: Observable<MetricValueType>;
  @ViewChild('searchMetric') searchMetricRef: ElementRef;

  @HostListener('document:click', [])
  clickOut() {
    if (!this.initView) {
      this.listOpen = false;
    }
  }

  constructor(private store: Store<IExperimentInfoState>) {
    this.metrics$ = this.store.pipe(select(selectScalarsGraphMetrics));
    this.hyperParams$ = this.store.pipe(select(selectScalarsGraphHyperParams));
    this.selectedHyperParams$ = this.store.pipe(select(selectSelectedSettigsHyperParams));
    this.selectedMetric$ = this.store.pipe(select(selectSelectedSettigsMetric));
    this.selectShowIdenticalHyperParams$ = this.store.pipe(select(selectScalarsGraphShowIdenticalHyperParams));
    this.selectRefreshing$ = this.store.select(selectRefreshing);
    this.experiments$ = this.store.pipe(select(selectScalarsGraphTasks));
    this.metricValueType$ = this.store.pipe(select(selectMetricValueType));

  }

  ngOnInit() {
    this.selectMetricSubscription = this.selectedMetric$.pipe(
      distinctUntilChanged((x, y) => x?.path === y?.path)
    ).subscribe((selectedMetric: SelectedMetric) => this.selectedMetric = selectedMetric?.name? {...selectedMetric} : null);

    this.metricSubscription = this.metrics$.pipe(filter(metrics => !!metrics)).subscribe(metrics => {
      this.metrics = metrics;
      this.metricsOptions = [...metrics];

      if (this.selectedMetric && this.metrics.every(metric => metric.variants.every(variant => this.selectedMetric.name !== variant.value.name))) {
        this.selectedMetric = null;
      }
    });

    this.hyperParamsSubscription = combineLatest([this.selectedHyperParams$, this.hyperParams$, this.selectShowIdenticalHyperParams$])
      .pipe(
        filter(([selectedParams, allParams, filterActive]) => !!allParams),
      )
      .subscribe(([selectedParams, allParams, showIdentical]) => {
        this.showIdenticalParamsActive = showIdentical;
        this.hyperParams = Object.entries(allParams)
          .reduce((acc, [sectionKey, params]) => {
            const section = Object.keys(params)
              .sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1)
              .reduce((acc2, paramKey) => {
                if (showIdentical || params[paramKey]) {
                  acc2[paramKey] = true;
                }
                return acc2;
              }, {});
            if (Object.keys(section).length > 0) {
              acc[sectionKey] = section;
            }
            return acc;
          }, {});
        this.selectedHyperParams = selectedParams.filter(selectedParam => has(selectedParam, this.hyperParams));
      });

    this.routerParamsSubscription = this.store.pipe(
      select(selectRouterParams),
      map(params => get('ids', params)),
      distinctUntilChanged(),
      filter(ids => !!ids),
    )
      .subscribe(ids => {
        this.taskIds = ids.split(',');
        this.store.dispatch(new SetSelectedExperiments({selectedExperiments: ['hyper-param-graph']}));
        this.store.dispatch(getExperimentsHyperParams({experimentsIds: this.taskIds}));
      });

    this.refreshingSubscription = this.selectRefreshing$.pipe(filter(({refreshing}) => refreshing)).subscribe(({autoRefresh}) =>
      this.store.dispatch(getExperimentsHyperParams({experimentsIds: this.taskIds, autoRefresh})));

    this.listOpen = true;
    window.setTimeout(() => {
      this.searchMetricRef.nativeElement.focus();
      this.initView = false;
    }, 200);
  }

  ngOnDestroy() {
    this.routerParamsSubscription.unsubscribe();
    this.hyperParamsSubscription.unsubscribe();
    this.metricSubscription.unsubscribe();
    this.selectMetricSubscription.unsubscribe();
    this.refreshingSubscription.unsubscribe();
  }

  private _filterGroup(value: string): MetricOption[] {
    if (value) {
      return this.metrics
        .map(group => ({metricName: group.metricName, variants: _filter(group.variants, value)}))
        .filter(group => group.variants.length > 0);
    }

    return this.metrics;
  }

  metricSelected(metric: VariantOption) {
    this.updateServer(metric.value, this.selectedHyperParams);
    this.listOpen = false;
  }

  selectedParamsChanged({param, value}) {
    const newSelectedParamsList = this.selectedHyperParams.includes(param) ? this.selectedHyperParams.filter(i => i !== param) : [...this.selectedHyperParams, param];
    this.updateServer(this.selectedMetric, newSelectedParamsList);
  }

  clearSelection() {
    this.updateServer(null, this.selectedHyperParams);
    this.updateServer(this.selectedMetric, []);
  }

  showIdenticalParamsToggled() {
    this.store.dispatch(setShowIdenticalHyperParams());
  }

  updateServer(selectedMetric, selectedParams) {
    this.store.dispatch(new SetExperimentSettings({id: ['hyper-param-graph'], changes: {selectedMetric: selectedMetric, selectedHyperParams: selectedParams}}));

  }

  updateMetricsList(event: Event) {
    this.metricsOptions = this._filterGroup((event.target as HTMLInputElement).value);
  }

  clearMetricSearchAndSelected() {
    this.updateServer(null, this.selectedHyperParams);
    this.selectedMetric = null;
    this.metricsOptions = this._filterGroup('');
  }

  clearMetricSearch() {
    this.metricsOptions = this._filterGroup('');
  }

  openList() {
    this.listOpen = true;
  }

  trackMetricByFn(index: number, item: MetricOption): string {
    return item.metricName;
  }

  trackVariantByFn(index: number, item: VariantOption): string {
    // TODO: validate with @nirla
    return item.value.path;
  }

  valueTypeChange($event: MatRadioChange) {
    this.store.dispatch(setvalueType({valueType: $event.value}));
  }
}
