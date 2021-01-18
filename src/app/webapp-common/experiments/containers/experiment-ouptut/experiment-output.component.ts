import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectRouterConfig, selectRouterParams} from '../../../core/reducers/router-reducer';
import {get, getOr} from 'lodash/fp';
import {select, Store} from '@ngrx/store';
import {interval, Observable, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {distinctUntilChanged, filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {Project} from '../../../../business-logic/model/projects/project';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {ExperimentOutputState} from '../../../../features/experiments/reducers/experiment-output.reducer';
import {
  selectExperimentInfoData,
  selectIsSharedAndNotOwner,
  selectSelectedExperiment
} from '../../../../features/experiments/reducers';
import {ResetExperimentMetrics, toggleSettings} from '../../actions/common-experiment-output.actions';
import * as infoActions from '../../actions/common-experiments-info.actions';
import {selectAppVisible, selectAutoRefresh, selectBackdropActive} from '../../../core/reducers/view-reducer';
import {AddMessage, SetAutoRefresh} from '../../../core/actions/layout.actions';
import {AUTO_REFRESH_INTERVAL, MESSAGES_SEVERITY} from '../../../../app.constants';
import {selectSelectedExperiments} from '../../reducers';
import {isReadOnly} from '../../../shared/utils/shared-utils';
import {ExperimentDetailsUpdated} from '../../actions/common-experiments-info.actions';

@Component({
  selector: 'sm-experiment-output',
  templateUrl: './experiment-output.component.html',
  styleUrls: ['./experiment-output.component.scss']
})
export class ExperimentOutputComponent implements OnInit, OnDestroy {

  public selectedExperiment: ISelectedExperiment;
  private paramsSubscription: Subscription;
  private selectedExperimentSubscription: Subscription;
  public infoData$: Observable<any>;
  public backdropActive$: Observable<any>;
  public currentComponent: string;
  public currentMetric: string;
  public minimized: boolean;
  public autoRefreshState$;
  private projectId: Project['id'];
  public experimentId: string;
  private autoRefreshSub: Subscription;
  private routerConfigSubscription: Subscription;
  public routerConfig: string[];
  private isAppVisible$: Observable<boolean>;
  private selectedExperiments$: Observable<Array<any>>;
  isSharedAndNotOwner$: Observable<boolean>;
  public isExample: boolean;

  constructor(private store: Store<ExperimentOutputState>, private router: Router, private route: ActivatedRoute) {
    this.infoData$ = this.store.select(selectExperimentInfoData);
    this.isSharedAndNotOwner$ = this.store.select((selectIsSharedAndNotOwner));
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.backdropActive$ = this.store.select(selectBackdropActive);

  }

  ngOnInit() {
    this.minimized = getOr(false, 'data.minimized', this.route.snapshot.routeConfig);
    this.routerConfigSubscription = this.store.select(selectRouterConfig).subscribe(routerConfig => {
      this.routerConfig = routerConfig;
    });
    this.paramsSubscription = this.store.pipe(
      select(selectRouterParams),
      tap((params) => this.projectId = params.projectId),
      map(params => get('experimentId', params)),
      filter(experimentId => !!experimentId),
      tap((experimentId) => this.experimentId = experimentId),
      distinctUntilChanged(),
      withLatestFrom(this.store.select(selectSelectedExperiments))
    )
      .subscribe(([experimentId, selectedExperiments]) => {
        this.selectedExperiment = selectedExperiments.find(experiment => experiment.id === experimentId);
        this.isExample = isReadOnly( this.selectedExperiment);
        this.store.dispatch(new ResetExperimentMetrics());
        this.store.dispatch(new infoActions.ResetExperimentInfo());
        this.store.dispatch(new infoActions.GetExperimentInfo(experimentId));
      });
    this.autoRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.isAppVisible$),
      filter(([iteration, autoRefreshState, isVisible]) => isVisible && autoRefreshState && !this.minimized)
    ).subscribe(() => {
      this.refresh(true);
    });
    this.selectedExperimentSubscription = this.store.pipe(select(selectSelectedExperiment),
      filter(experiment => experiment?.id === this.experimentId))
      .subscribe(experiment => {
        this.selectedExperiment = experiment;
        this.isExample = isReadOnly( this.selectedExperiment);
      });
  }


  ngOnDestroy() {
    this.routerConfigSubscription.unsubscribe();
    this.selectedExperimentSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
    this.autoRefreshSub.unsubscribe();
  }

  returnToInfo(experiment) {
    this.router.navigateByUrl(`projects/${this.projectId}/experiments/${experiment.id}`);
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(new SetAutoRefresh($event));
  }

  refresh(isAutorefresh) {
    if (isAutorefresh) {
      this.store.dispatch(new infoActions.AutoRefreshExperimentInfo(this.experimentId));
    } else {
      this.store.dispatch(new infoActions.GetExperimentInfo(this.experimentId));
    }
  }

  minimizeView() {
    const part = this.route.firstChild.routeConfig.path;
    if (['log', 'metrics/scalar', 'metrics/plots', 'debugImages'].includes(part)) {
      this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this.experimentId}/info-output/${part}`);
    } else {
      this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this.experimentId}/${part}`);
    }
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleSettings());
  }
  updateExperimentName(name) {
    if (name.trim().length > 2) {
      this.store.dispatch(new ExperimentDetailsUpdated({id: this.selectedExperiment.id, changes: {name: name}}));
    } else {
      this.store.dispatch(new AddMessage(MESSAGES_SEVERITY.ERROR, 'Name must be more than three letters long'));
    }
  }
}
