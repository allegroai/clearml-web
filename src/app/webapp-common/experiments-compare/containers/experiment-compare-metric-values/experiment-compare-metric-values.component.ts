import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {selectRouterParams, selectRouterQueryParams} from '../../../core/reducers/router-reducer';
import {select, Store} from '@ngrx/store';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {get, has} from 'lodash/fp';
import {Observable, Subscription} from 'rxjs';
import * as metricsValuesActions from '../../actions/experiments-compare-metrics-values.actions';
import {selectCompareMetricsValuesExperiments, selectCompareMetricsValuesSortConfig, selectRefreshing} from '../../reducers';
import {Router} from '@angular/router';
import {addMessage} from '../../../core/actions/layout.actions';
import {TreeNode} from '../../shared/experiments-compare-details.model';
import {createDiffObjectScalars, getAllKeysEmptyObject} from '../../jsonToDiffConvertor';

interface ValueMode {
  key: string;
  name: string;
}

const VALUE_MODES: { [mode: string]: ValueMode } = {
  'min_values': {
    key: 'min_value',
    name: 'Min Value'
  },
  'max_values': {
    key: 'max_value',
    name: 'Max Value'
  },
  'values': {
    key: 'value',
    name: 'Last Value'
  },
};

@Component({
  selector: 'sm-experiment-compare-metric-values',
  templateUrl: './experiment-compare-metric-values.component.html',
  styleUrls: ['./experiment-compare-metric-values.component.scss', '../../cdk-drag.scss']
})
export class ExperimentCompareMetricValuesComponent implements OnInit, OnDestroy {
  public sortOrder$: Observable<any>;
  public comparedTasks$: Observable<any>;
  private selectRefreshing$: Observable<{ refreshing: boolean; autoRefresh: boolean }>;

  private comparedTasksSubscription: Subscription;
  private refreshingSubscription: Subscription;
  private paramsSubscription: Subscription;
  private queryParamsSubscription: Subscription;

  public comparedTasks: TreeNode<any>;
  public allKeysEmptyObject = {};
  public refreshDisabled: boolean = false;
  private paths = [];
  public experiments = [];
  private taskIds: string;
  public valuesMode: ValueMode;

  constructor(private router: Router, public store: Store<any>, private changeDetection: ChangeDetectorRef) {
    this.comparedTasks$ = this.store.pipe(select(selectCompareMetricsValuesExperiments));
    this.sortOrder$ = this.store.pipe(select(selectCompareMetricsValuesSortConfig));
    this.selectRefreshing$ = this.store.select(selectRefreshing);
  }

  ngOnInit() {
    this.queryParamsSubscription = this.store.pipe(
      select(selectRouterQueryParams),
      map(params => get('scalars', params)),
      distinctUntilChanged()
    ).subscribe((valuesMode) => {
      this.valuesMode = VALUE_MODES[valuesMode] || VALUE_MODES['values'];
      this.convertExperimentsToNodes(this.experiments.map(exp => exp.last_metrics));
    });

    this.paramsSubscription = this.store.pipe(
      select(selectRouterParams),
      map(params => get('ids', params)),
      tap(taskIds => this.taskIds = taskIds),
      filter(taskIds => !!taskIds && taskIds !== this.getExperimentIdsParams(this.experiments))
    )
      .subscribe((experimentIds: string) => {
        this.store.dispatch(new metricsValuesActions.GetComparedExperimentsMetricsValues({taskIds: experimentIds.split(',')}));
      });

    this.comparedTasksSubscription = this.comparedTasks$
      .pipe(
        filter(exp => !!exp),
        tap(experiments => this.experiments = experiments),
        tap(experiments => this.syncUrl(experiments, this.taskIds)),
        map(experiments => experiments.map(exp => exp.last_metrics)))
      .subscribe(experimentsLastMetrics => {
        this.refreshDisabled = false;
        this.convertExperimentsToNodes(experimentsLastMetrics);
        this.changeDetection.detectChanges();
      });

    this.refreshingSubscription = this.selectRefreshing$.pipe(filter(({refreshing}) => refreshing))
      .subscribe(({autoRefresh}) => this.store.dispatch(
        new metricsValuesActions.GetComparedExperimentsMetricsValues({taskIds: this.taskIds.split(','), autoRefresh})
      ));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new metricsValuesActions.ResetState());
    this.paramsSubscription.unsubscribe();
    this.queryParamsSubscription.unsubscribe();
    this.comparedTasksSubscription.unsubscribe();
    this.refreshingSubscription.unsubscribe();
  }

  convertExperimentsToNodes(experiments) {
    if (experiments) {
      experiments = experiments.map(experiment => {
        if (experiment) {
          const convertedExperiment = {};
          Object.keys(experiment).map(key => {
            convertedExperiment[Object.values(experiment[key])[0]['metric']] = experiment[key];
          });
          return convertedExperiment;
        }
      });
      this.allKeysEmptyObject = getAllKeysEmptyObject(experiments);
      this.comparedTasks = experiments.map(experiment => createDiffObjectScalars(this.allKeysEmptyObject, experiments[0], experiment, this.metaDataTransformer, ''),);
    }
  }

  public metaDataTransformer = (data, key, path, extraParams) => {
    const fullPath = path.concat([key]);
    const keyExists = has(fullPath, extraParams.comparedObject);
    return {
      classStyle: keyExists ? 'key-exists' : 'key-not-exists',
    };
  };

  trackByFn(index, item) {
    return item.id;
  }

  realIsNodeOpen(node) {
    return this.paths.includes(node.data.key);
  }

  collapsedToggled(node) {
    if (!this.realIsNodeOpen(node)) {
      this.paths.push(node.data.key);
    } else {
      this.paths = this.paths.filter(path => path !== node.data.key);
    }
  }

  metricSortChanged(event, nodeData) {
    const orderedKeys = (this.sortByKeyOrValue(event.keyOrValue, event.keyValueArray, event.order)).map(keyValue => keyValue.key);
    this.store.dispatch(new metricsValuesActions.SetMetricValuesSortBy(nodeData.key, event.keyOrValue, event.order, orderedKeys));
  }

  sortByKeyOrValue(sortBy, keyValueArray, order) {
    if (sortBy === 'key') {
      return keyValueArray.sort(function (a, b) {
        if (order === 'asc') {
          return a.key.toLowerCase().localeCompare(b.key.toLowerCase());
        } else {
          return b.key.toLowerCase().localeCompare(a.key.toLowerCase());
        }
      });
    } else {
      return keyValueArray.sort(function (a, b) {
        if (order === 'asc') {
          return a.value - b.value;
        } else {
          return b.value - a.value;
        }
      });
    }
  }

  experimentListChanged(experiments: Array<any>) {
    this.store.dispatch(new metricsValuesActions.SetComparedExperiments(experiments));
  }

  private syncUrl(experiments: Array<any>, urlParams: string) {
    const newParams = this.getExperimentIdsParams(experiments);
    if (newParams !== urlParams) {
      this.router.navigateByUrl(this.router.url.replace(urlParams, newParams));
    }
  }

  private getExperimentIdsParams(experiments: Array<any>): string {
    return experiments ? experiments.map(e => e.id).toString() : '';
  }

  copyIdToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }
}
