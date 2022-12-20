import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {get} from 'lodash/fp';
import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {distinctUntilChanged, filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/project';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentOutputState} from '~/features/experiments/reducers/experiment-output.reducer';
import {
  selectExperimentInfoData,
  selectIsSharedAndNotOwner,
  selectSelectedExperiment
} from '~/features/experiments/reducers';
import {resetExperimentMetrics, toggleSettings} from '../../actions/common-experiment-output.actions';
import * as infoActions from '../../actions/common-experiments-info.actions';
import {selectAppVisible, selectBackdropActive} from '@common/core/reducers/view.reducer';
import {addMessage, setAutoRefresh} from '@common/core/actions/layout.actions';
import {selectIsExperimentInEditMode, selectSelectedExperiments, selectSplitSize} from '../../reducers';
import {experimentDetailsUpdated} from '../../actions/common-experiments-info.actions';
import {RefreshService} from '@common/core/services/refresh.service';
import { isDevelopment } from '~/features/experiments/shared/experiments.utils';
import * as experimentsActions from '../../actions/common-experiments-view.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {MESSAGES_SEVERITY} from '@common/constants';

@Component({
  selector: 'sm-base-experiment-output',
  template: ''
})
export abstract class BaseExperimentOutputComponent implements OnInit, OnDestroy {

  public selectedExperiment: IExperimentInfo;
  private subs = new Subscription();
  public infoData$: Observable<any>;
  public backdropActive$: Observable<any>;
  public currentComponent: string;
  public currentMetric: string;
  public minimized: boolean;
  private isExperimentInEditMode$: Observable<boolean>;
  private projectId: Project['id'];
  public experimentId: string;
  public routerConfig: string[];
  private isAppVisible$: Observable<boolean>;
  isSharedAndNotOwner$: Observable<boolean>;
  public isExample: boolean;
  public isDevelopment: boolean;
  private toMaximize = false;
  public selectSplitSize$: Observable<number>;


  constructor(
    private store: Store<ExperimentOutputState>,
    private router: Router,
    private route: ActivatedRoute,
    private refresh: RefreshService
  ) {
    this.infoData$ = this.store.select(selectExperimentInfoData);
    this.isSharedAndNotOwner$ = this.store.select((selectIsSharedAndNotOwner));
    this.isExperimentInEditMode$ = this.store.select(selectIsExperimentInEditMode);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.selectSplitSize$ = this.store.select(selectSplitSize);


  }

  ngOnInit() {
    this.subs.add(this.store.select(selectRouterConfig).subscribe(routerConfig => {
      this.minimized = !routerConfig.includes('output');
      this.routerConfig = routerConfig;
    }));

    this.subs.add(this.store.pipe(
        select(selectRouterParams),
        tap((params) => this.projectId = params.projectId),
        map(params => get('experimentId', params)),
        filter(experimentId => !!experimentId),
        tap((experimentId) => this.experimentId = experimentId),
        distinctUntilChanged(),
        withLatestFrom(this.store.select(selectSelectedExperiments))
      ).subscribe(([experimentId, selectedExperiments]) => {
        this.selectedExperiment = selectedExperiments.find(experiment => experiment.id === experimentId);
        this.isExample = isReadOnly( this.selectedExperiment);
        this.isDevelopment = isDevelopment(this.selectedExperiment);
        this.store.dispatch(resetExperimentMetrics());
        this.store.dispatch(infoActions.resetExperimentInfo());
        this.store.dispatch(infoActions.getExperimentInfo({id: experimentId}));
      })
    );

    this.subs.add(this.refresh.tick
      .pipe(
        withLatestFrom(this.isExperimentInEditMode$),
        filter(([, isExperimentInEditMode]) => !isExperimentInEditMode && !this.minimized)
      ).subscribe(([auto]) => {
        if (auto === null) {
          this.store.dispatch(infoActions.autoRefreshExperimentInfo({id: this.experimentId}));
        } else {
          this.store.dispatch(infoActions.getExperimentInfo({id: this.experimentId}));
        }
      })
    );

    this.subs.add(this.store.pipe(select(selectSelectedExperiment),
      filter(experiment => experiment?.id === this.experimentId))
      .subscribe(experiment => {
        this.selectedExperiment = experiment;
        this.isExample = isReadOnly( this.selectedExperiment);
        this.isDevelopment = isDevelopment(this.selectedExperiment);
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  minimizeView() {
    const part = this.route.firstChild.routeConfig.path;
    if (['log', 'metrics/scalar', 'metrics/plots', 'debugImages'].includes(part)) {
      this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this.experimentId}/info-output/${part}`);
    } else {
      const parts = this.router ? this.router.url.split('/') : window.location.pathname.split('/');
      parts.splice(5, 1);
      this.router.navigateByUrl(parts.join('/'));
    }
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleSettings());
  }
  updateExperimentName(name) {
    if (name.trim().length > 2) {
      this.store.dispatch(experimentDetailsUpdated({id: this.selectedExperiment.id, changes: {name}}));
    } else {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.ERROR, 'Name must be more than three letters long'));
    }
  }
  maximize() {
    if (window.location.pathname.includes('info-output')) {
      const resultsPath = this.route.firstChild?.firstChild?.routeConfig?.path || this.route.firstChild.routeConfig.path;
      this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this.experimentId}/output/${resultsPath}`);
    } else {
      const parts = this.router.url.split('/');
      parts.splice(5, 0, 'output');
      this.router.navigateByUrl(parts.join('/'));
    }
    this.toMaximize = true;
  }
  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
  }
  closePanel() {
    this.store.dispatch(experimentsActions.setTableMode({mode: 'table'}));
    return this.router.navigate(['..'], {relativeTo: this.route, queryParamsHandling: 'merge'});
  }
}
