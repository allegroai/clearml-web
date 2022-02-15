import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {MESSAGES_SEVERITY} from '../../../../app.constants';
import {IExperimentInfoState} from '../../reducers/experiment-info.reducer';
import {selectExperimentInfoData, selectIsExperimentEditable, selectSelectedExperiment} from '../../reducers';
import {selectBackdropActive} from '../../../../webapp-common/core/reducers/view.reducer';
import {isReadOnly} from '../../../../webapp-common/shared/utils/shared-utils';
import {selectRouterConfig, selectRouterParams, selectRouterQueryParams} from '../../../../webapp-common/core/reducers/router-reducer';
import * as commonInfoActions from '../../../../webapp-common/experiments/actions/common-experiments-info.actions';
import {ExperimentDetailsUpdated} from '../../../../webapp-common/experiments/actions/common-experiments-info.actions';
import {addMessage} from '../../../../webapp-common/core/actions/layout.actions';
import {IExperimentInfo} from '../../shared/experiment-info.model';
import {selectSelectedTableExperiment} from '../../../../webapp-common/experiments/reducers';
import {ITableExperiment} from '../../../../webapp-common/experiments/shared/common-experiment-model.model';


@Component({
  selector: 'sm-experiment-info',
  templateUrl: './experiment-info.component.html',
  styleUrls: ['./experiment-info.component.scss']
})
export class ExperimentInfoComponent implements OnInit, OnDestroy {

  private paramsSubscription: Subscription;
  public selectedExperiment: IExperimentInfo;
  private selectedExperimentSubscription: Subscription;
  public editable$: Observable<boolean>;
  public infoData$: Observable<IExperimentInfo>;
  public backdropActive$: Observable<any>;
  public isExample: boolean;
  private projectId: string;
  private experimentId: string;
  public resultsTab: boolean;
  public queryParams$: Observable<Params>;
  public routerConfig: string[];
  private routerConfigSubscription: Subscription;
  public tableSelectedExperiment$: Observable<ITableExperiment>;
  private toMaximize = false;

  constructor(
    private router: Router,
    private store: Store<IExperimentInfoState>,
    private route: ActivatedRoute
  ) {
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.infoData$ = this.store.select(selectExperimentInfoData);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.queryParams$ = this.store.select(selectRouterQueryParams);
    this.tableSelectedExperiment$ = this.store.select(selectSelectedTableExperiment);
  }

  ngOnInit() {
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .subscribe(experiment => {
        this.selectedExperiment = experiment;
        this.isExample = isReadOnly(experiment);
      });
    this.routerConfigSubscription = this.store.select(selectRouterConfig).subscribe(routerConfig => {
      this.routerConfig = routerConfig;
    });

    this.paramsSubscription = this.store.select(selectRouterParams)
      .pipe(
        tap((params) => {
          this.projectId = get('projectId', params);
          this.resultsTab = 'info-output' === this.route.firstChild.routeConfig.path;
        }),
        debounceTime(150),
        map(params => get('experimentId', params)),
        filter(experimentId => !!experimentId),
        distinctUntilChanged()
      )
      .subscribe(experimentId => {
        this.experimentId = experimentId;

        // We already have GetExperimentInfo in output (results) component
        if (!this.resultsTab) {
          this.store.dispatch(new commonInfoActions.ResetExperimentInfo());
          this.store.dispatch(new commonInfoActions.GetExperimentInfo(experimentId));
        }
      });
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.selectedExperimentSubscription.unsubscribe();
    this.routerConfigSubscription.unsubscribe();
    if (!this.toMaximize) {
      this.store.dispatch(new commonInfoActions.SetExperiment(null));
      this.store.dispatch(new commonInfoActions.ResetExperimentInfo());
    }
  }

  updateExperimentName(name) {
    if (name.trim().length > 2) {
      this.store.dispatch(new ExperimentDetailsUpdated({id: this.selectedExperiment.id, changes: {name: name}}));
    } else {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.ERROR, 'Name must be more than three letters long'));
    }
  }

  deselectExperiment() {
    this.navigateAfterExperimentSelectionChanged();
  }

  navigateAfterExperimentSelectionChanged() {
    this.router.navigate([`projects/${this.projectId}/experiments`], {queryParamsHandling: 'merge'});
  }

  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
  }

  maximize() {
    if (window.location.pathname.includes('info-output')) {
      const resultsPath = this.route.firstChild?.firstChild?.routeConfig?.path || this.route.firstChild.routeConfig.path;
      this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this.experimentId}/output/${resultsPath}`);
    } else {
      const parts = window.location.pathname.split('/');
      parts.splice(5, 0, 'output');
      this.router.navigateByUrl(parts.join('/'));
    }
    this.toMaximize = true;
  }
}
