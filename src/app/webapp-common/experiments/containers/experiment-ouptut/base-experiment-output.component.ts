import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/project';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {
  selectExperimentInfoData,
  selectIsSharedAndNotOwner,
  selectSelectedExperiment
} from '~/features/experiments/reducers';
import {
  groupByCharts,
  GroupByCharts,
  resetExperimentMetrics,
  setExperimentSettings,
  toggleMetricValuesView,
  toggleSettings
} from '../../actions/common-experiment-output.actions';
import * as infoActions from '../../actions/common-experiments-info.actions';
import {experimentDetailsUpdated} from '../../actions/common-experiments-info.actions';
import {selectAppVisible, selectBackdropActive} from '@common/core/reducers/view.reducer';
import {addMessage, setAutoRefresh} from '@common/core/actions/layout.actions';
import {
  selectIsExperimentInEditMode,
  selectMetricValuesView,
  selectSelectedExperiments,
  selectSelectedSettingsGroupBy,
  selectSelectedSettingsSmoothType,
  selectSelectedSettingsSmoothWeight,
  selectSelectedSettingsxAxisType,
  selectSplitSize
} from '../../reducers';
import {RefreshService} from '@common/core/services/refresh.service';
import {isDevelopment} from '~/features/experiments/shared/experiments.utils';
import * as experimentsActions from '../../actions/common-experiments-view.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {MESSAGES_SEVERITY} from '@common/constants';
import {setBreadcrumbsOptions} from '@common/core/actions/projects.actions';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {headerActions} from '@common/core/actions/router.actions';
import { SmoothTypeEnum } from '@common/shared/single-graph/single-graph.utils';
import { ScalarKeyEnum } from '~/business-logic/model/events/scalarKeyEnum';

@Component({
  selector: 'sm-base-experiment-output',
  template: ''
})
export abstract class BaseExperimentOutputComponent implements OnInit, OnDestroy {

  public selectedExperiment: IExperimentInfo;
  private subs = new Subscription();
  public infoData$: Observable<any>;
  public backdropActive$: Observable<any>;
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
  private selectedProject$: Observable<Project>;
  public metricValuesView$: Observable<boolean>;
  public smoothWeight$: Observable<number>;
  public smoothType$: Observable<SmoothTypeEnum>;
  public xAxisType$: Observable<ScalarKeyEnum>;
  public groupBy$: Observable<GroupByCharts>;

  groupByOptions = [
    {
      name: 'Metric',
      value: groupByCharts.metric
    },
    {
      name: 'None',
      value: groupByCharts.none
    }
  ];

  constructor(
    private store: Store,
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
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.metricValuesView$ = this.store.select(selectMetricValuesView);
    this.smoothWeight$ = this.store.select(selectSelectedSettingsSmoothWeight).pipe(filter(smooth => smooth !== null));
    this.smoothType$ = this.store.select(selectSelectedSettingsSmoothType);
    this.xAxisType$ = this.store.select(selectSelectedSettingsxAxisType(false));
    this.groupBy$ = this.store.select(selectSelectedSettingsGroupBy);
  }

  ngOnInit() {
    this.subs.add(this.store.select(selectRouterConfig).subscribe(routerConfig => {
      this.minimized = !routerConfig.includes('output');
      if (!this.minimized) {
        this.setupBreadcrumbsOptions();
      }
      this.routerConfig = routerConfig;
    }));

    this.subs.add(this.store.select(selectRouterParams)
      .pipe(
        tap((params) => this.projectId = params.projectId),
        map(params => params?.experimentId),
        filter(experimentId => !!experimentId),
        tap((experimentId) => this.experimentId = experimentId),
        distinctUntilChanged(),
        withLatestFrom(this.store.select(selectSelectedExperiments))
      ).subscribe(([experimentId, selectedExperiments]) => {
        this.selectedExperiment = selectedExperiments.find(experiment => experiment.id === experimentId) as unknown as IExperimentInfo;
        this.isExample = isReadOnly(this.selectedExperiment);
        this.isDevelopment = isDevelopment(this.selectedExperiment);
        this.store.dispatch(resetExperimentMetrics());
        this.store.dispatch(infoActions.resetExperimentInfo());
        this.store.dispatch(infoActions.getExperimentInfo({id: experimentId}));
      })
    );

    this.subs.add(this.refresh.tick
      .pipe(
        debounceTime(5000), // Fix loop - getExperimentInfo trigger tick
        withLatestFrom(this.isExperimentInEditMode$),
        filter(([, isExperimentInEditMode]) => !isExperimentInEditMode && !this.minimized)
      ).subscribe(([auto]) => {
        if (auto === null) {
          this.store.dispatch(infoActions.autoRefreshExperimentInfo({id: this.experimentId}));
        } else {
          this.store.dispatch(infoActions.getExperimentInfo({id: this.experimentId, autoRefresh: auto}));
        }
      })
    );

    this.subs.add(this.store.select(selectSelectedExperiment)
      .pipe(filter(experiment => experiment?.id === this.experimentId))
      .subscribe(experiment => {
        this.selectedExperiment = experiment;
        this.isExample = isReadOnly(this.selectedExperiment);
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

  toggleTableView() {
    this.store.dispatch(toggleMetricValuesView());
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
    this.store.dispatch(headerActions.reset());
    this.toMaximize = true;
  }

  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
  }

  closePanel() {
    this.store.dispatch(experimentsActions.setTableMode({mode: 'table'}));
    return this.router.navigate(['..'], {relativeTo: this.route, queryParamsHandling: 'merge'});
  }

  setupBreadcrumbsOptions() {
    this.subs.add(this.selectedProject$.pipe(
    ).subscribe((selectedProject) => {
      this.store.dispatch(setBreadcrumbsOptions({
        breadcrumbOptions: {
          showProjects: !!selectedProject,
          featureBreadcrumb: {
            name: 'PROJECTS',
            url: 'projects'
          },
          projectsOptions: {
            basePath: 'projects',
            filterBaseNameWith: null,
            compareModule: null,
            showSelectedProject: selectedProject?.id !== '*',
            ...(selectedProject && {selectedProjectBreadcrumb: {name: selectedProject?.id === '*' ? 'All Tasks' : selectedProject?.basename}})
          }
        }
      }));
    }));
  }

  changeSmoothness($event: number) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {smoothWeight: $event}}));
  }

  changeSmoothType($event: SmoothTypeEnum) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {smoothType: $event}}));
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {xAxisType: $event}}));
  }

  changeGroupBy($event: GroupByCharts) {
    this.store.dispatch(setExperimentSettings({id: this.experimentId, changes: {groupBy: $event}}));
  }

}
