import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {AdminService} from '~/shared/services/admin.service';
import {selectS3BucketCredentials} from '../core/reducers/common-auth-reducer';
import {MatDialog} from '@angular/material/dialog';
import * as  debugActions from './debug-images-actions';
import {fetchExperiments, getDebugImagesMetrics, resetDebugImages} from './debug-images-actions';
import {
  ITaskOptionalMetrics,
  selectDebugImages,
  selectNoMore,
  selectOptionalMetrics,
  selectTaskNames,
  selectTimeIsNow
} from './debug-images-reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map, withLatestFrom} from 'rxjs/operators';
import {Task} from '~/business-logic/model/tasks/task';
import {ActivatedRoute} from '@angular/router';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {ImageViewerComponent} from '../shared/debug-sample/image-viewer/image-viewer.component';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {TaskMetric} from '~/business-logic/model/events/taskMetric';
import {get, isEqual} from 'lodash/fp';
import {ALL_IMAGES} from './debug-images-effects';
import {getSignedUrl} from '../core/actions/common-auth.actions';
import {addMessage} from '../core/actions/layout.actions';
import {RefreshService} from '@common/core/services/refresh.service';
import {selectBeginningOfTime} from '@common/shared/debug-sample/debug-sample.reducer';
import {ReportCodeEmbedService} from '@common/shared/services/report-code-embed.service';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';

export interface Event {
  timestamp: number;
  type?: string;
  task?: string;
  iter?: number;
  metric?: string;
  variant?: string;
  key?: string;
  url?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '@timestamp'?: string;
  worker?: string;
}

export interface Iteration {
  events: Event[];
  iter: number;
}

interface DebugSamples {
  metrics: string[];
  metric: string;
  scrollId: string;
  data: Iteration[];
}

@Component({
  selector: 'sm-debug-images',
  templateUrl: './debug-images.component.html',
  styleUrls: ['./debug-images.component.scss'],
})
export class DebugImagesComponent implements OnInit, OnDestroy, OnChanges {

  @Input() isDarkTheme = false;
  @Input() disableStatusRefreshFilter = false;
  @Input() selected: Task;
  @Output() copyIdClicked = new EventEmitter();

  private debugImagesSubscription: Subscription;
  private taskNamesSubscription: Subscription;
  private selectedExperimentSubscription: Subscription;
  private routerParamsSubscription: Subscription;
  private refreshingSubscription: Subscription;
  private optionalMetricsSubscription: Subscription;

  public debugImages$: Observable<any>;
  private routerParams$: Observable<any>;
  private tasks$: Observable<Partial<Task>[]>;
  public timeIsNow$: Observable<any>;
  public beginningOfTime$: Observable<any>;

  public mergeIterations: boolean;
  public debugImages: { [experimentId: string]: DebugSamples } = null;
  public experimentNames: { [id: string]: string } = {};
  public experimentIds: string[];
  public allowAutorefresh: boolean = false;

  public noMoreData$: Observable<boolean>;
  public optionalMetrics$: Observable<ITaskOptionalMetrics[]>;
  public optionalMetrics: { [experimentId: string]: string };
  public selectedMetrics: { [taskId: string]: string } = {};
  public beginningOfTime: any;
  private beginningOfTimeSubscription: Subscription;
  public timeIsNow: any;
  private timeIsNowSubscription: Subscription;
  minimized: boolean;
  readonly allImages = ALL_IMAGES;
  private selectedMetric: string;
  public modifiedExperimentsNames: { [id: string]: string } = {};
  public experiments: Partial<Task>[];
  public bindNavigationMode: boolean = false;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  LIMITED_VIEW_LIMIT = LIMITED_VIEW_LIMIT;

  constructor(
    private store: Store<ExperimentInfoState>,
    private adminService: AdminService,
    private dialog: MatDialog,
    private changeDetection: ChangeDetectorRef,
    private activeRoute: ActivatedRoute,
    private elRef: ElementRef,
    private refresh: RefreshService,
    private reportEmbed: ReportCodeEmbedService,
  ) {
    this.tasks$ = this.store.select(selectTaskNames);
    this.optionalMetrics$ = this.store.select(selectOptionalMetrics);
    this.noMoreData$ = this.store.select(selectNoMore);
    this.timeIsNow$ = this.store.select(selectTimeIsNow);
    this.beginningOfTime$ = this.store.select(selectBeginningOfTime);


    this.debugImagesSubscription = combineLatest([
      store.pipe(select(selectS3BucketCredentials)),
      store.pipe(select(selectDebugImages))]).pipe(
      map(([, debugImages]) => !debugImages ? null : Object.entries(debugImages).reduce(((acc, val: any) => {
        const id = val[0];
        const iterations = val[1].metrics.find(m => m.task === id).iterations;
        if (iterations?.length === 0) {
          return {[id]: {}};
        }
        acc[id] = {
          data: iterations.map(iteration => ({
            iter: iteration.iter,
            events: iteration.events.map(event => {
              this.store.dispatch(getSignedUrl({url: event.url, config: {disableCache: event.timestamp}}));
              return {
                ...event,
                url: event.url,
                variantAndMetric: this.selectedMetric === ALL_IMAGES ? `${event.metric}/${event.variant}` : ''
              };
            })
          }))
        };
        acc[id].metrics = val[1].metrics.map(metric => metric.metric || metric.iterations[0].events[0].metric);
        acc[id].metric = acc[id].metrics[0];
        acc[id].scrollId = val[1].scroll_id;
        return acc;
      }), {}))
    ).subscribe(debugImages => {
      this.debugImages = debugImages;
      if (debugImages === null) {
        return;
      }
      Object.keys(debugImages).forEach(key => {
        if (!this.selectedMetrics[key]) {
          this.selectedMetrics[key] = get('metric', debugImages[key]);
        }
      });
      this.changeDetection.markForCheck();
    });

    this.routerParams$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.ids || !!params.experimentId),
      distinctUntilChanged()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selected && !isEqual([changes.selected.currentValue.id], this.experimentIds)) {
      this.experimentNames = {[changes.selected.currentValue.id]: changes.selected.currentValue.name};
      this.experimentIds = [changes.selected.currentValue.id];
      this.selectMetric({value: this.allImages}, changes.selected.currentValue.id);
    }
  }

  ngOnInit() {
    this.mergeIterations = this.activeRoute.snapshot.routeConfig?.data?.mergeIterations;
    const multipleExperiments = !!this.activeRoute.snapshot.routeConfig?.data?.multiple;
    this.minimized = this.activeRoute.snapshot.routeConfig?.data?.minimized;

    this.beginningOfTimeSubscription = this.beginningOfTime$.subscribe(beginningOfTime => {
      this.beginningOfTime = beginningOfTime;
    });

    this.timeIsNowSubscription = this.timeIsNow$.subscribe(timeIsNow => {
      this.timeIsNow = timeIsNow;
    });


    if (multipleExperiments) {
      this.routerParamsSubscription = this.routerParams$
        .subscribe(params => {
          const experiments = (params.ids ? params.ids.split(',') : params.experimentId.split(','));
            this.experimentIds = experiments;
            this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds.slice(0, LIMITED_VIEW_LIMIT)}));
            this.store.dispatch(fetchExperiments({tasks: this.experimentIds.slice(0, LIMITED_VIEW_LIMIT)}));
        });

      this.taskNamesSubscription = this.tasks$
        .pipe(
          filter(tasks => tasks?.length > 0)
        )
        .subscribe((tasks) => {
          if (this.isTaskRunning(tasks) && (Object.keys(this.debugImages || {}).length > 0 || this.beginningOfTime[this.experimentIds[0]])) {
            this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
          }
          this.experiments = tasks;
          this.experimentNames = tasks.reduce((acc, task) => ({
            ...acc,
            [task.id]: task.name
          }), {}) as { [id: string]: string };
          tasks.forEach(task => {
              this.modifiedExperimentsNames[task.id] = Object.values(this.experimentNames).filter(name => name === task.name).length > 1 ? `${task.name}.${task.id.slice(0, 6)}` : task.name;
            }
          );
          this.changeDetection.detectChanges();
        });

    } else {
      this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
        .pipe(
          filter(experiment => !!experiment && !this.disableStatusRefreshFilter),
          distinctUntilChanged((previous, current) => previous?.id === current?.id)
        ).subscribe(experiment => {
          this.experimentNames = {[experiment.id]: experiment.name};
          this.experimentIds = [experiment.id];
          this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
        });
    }


    this.refreshingSubscription = this.refresh.tick
      .pipe(
        filter(auto =>
          auto !== null && (!this.disableStatusRefreshFilter || this.selected.status === TaskStatusEnum.InProgress)
        ),
        withLatestFrom(
          this.store.select(selectTimeIsNow),
        )
      )
      .subscribe(([auto, timeIsNow]) => {
        if (multipleExperiments) {
          this.store.dispatch(debugActions.refreshDebugImagesMetrics({tasks: this.experimentIds, autoRefresh: auto}));
        }
        this.experimentIds.forEach(experimentId => {
          if (experimentId && timeIsNow?.[experimentId] && this.debugImages[experimentId] && this.elRef.nativeElement.scrollTop < 40) {
            this.store.dispatch(debugActions.refreshMetric({
              payload: {
                task: experimentId,
                metric: this.debugImages[experimentId]?.metric,
              },
              autoRefresh: (auto !== false)
            }));
          }
        });
      });

    this.optionalMetricsSubscription = this.optionalMetrics$.subscribe(optionalMetrics => {
      const optionalMetricsDic = {};
      optionalMetrics.forEach(experimentMetrics => optionalMetricsDic[experimentMetrics.task] = experimentMetrics.metrics);
      if ((!isEqual(this.optionalMetrics, optionalMetricsDic)) && optionalMetrics.length > 0) {
        this.optionalMetrics = optionalMetricsDic;
        optionalMetrics.forEach(optionalMetric => {
          optionalMetric.metrics[0] && this.store.dispatch(debugActions.setSelectedMetric({
            payload: {
              task: optionalMetric.task,
              metric: optionalMetric.metrics[0]
            }
          }));
        });
        this.changeDetection.detectChanges();
      }
    });
  }


  ngOnDestroy(): void {
    this.routerParamsSubscription?.unsubscribe();
    this.taskNamesSubscription?.unsubscribe();
    this.selectedExperimentSubscription?.unsubscribe();
    this.refreshingSubscription?.unsubscribe();
    this.optionalMetricsSubscription?.unsubscribe();
    this.debugImagesSubscription?.unsubscribe();
    this.beginningOfTimeSubscription?.unsubscribe();
    this.timeIsNowSubscription?.unsubscribe();
    this.store.dispatch(resetDebugImages());
  }

  public urlError(/*{frame}*/) {
    // this.adminService.checkImgUrl(frame.oldSrc || frame.src);
  }

  imageClicked({frame}, experimentId: string) {
    const iterationSnippets = this.debugImages?.[experimentId]?.data.map(iter => iter.events).flat();
    const sources = iterationSnippets.map(img => img.url);
    const index = iterationSnippets.findIndex(img => img.url === frame.url);
    const isAllMetrics = this.selectedMetrics[experimentId] === ALL_IMAGES;
    this.dialog.open(ImageViewerComponent, {
      data: {imageSources: sources, index, snippetsMetaData: iterationSnippets, isAllMetrics},
      panelClass: ['image-viewer-dialog'],
      height: '100%',
      maxHeight: 'auto',
      width: '100%',
      maxWidth: 'auto'
    });
  }

  private isTaskRunning(tasks: Partial<Task>[]) {
    return tasks.some(task => [TaskStatusEnum.InProgress, TaskStatusEnum.Queued].includes(task.status));
  }

  trackExperiment(index: number, experimentID: string) {
    return experimentID;
  }

  selectMetric(change: any, task) {
    this.selectedMetric = change.value;
    if (this.bindNavigationMode) {
      this.experimentIds.forEach(experimentId => {
        this.selectedMetrics[experimentId] = change.value;
        this.store.dispatch(debugActions.setSelectedMetric({payload: {task: experimentId, metric: change.value}}));
      });
    } else {
      this.selectedMetrics[task] = change.value;
      this.store.dispatch(debugActions.setSelectedMetric({payload: {task, metric: change.value}}));
    }
  }

  nextBatch(taskMetric: TaskMetric) {
    if (this.bindNavigationMode) {
      this.experimentIds.forEach(experimentId => {
        if (!this.beginningOfTime[experimentId]) {
          this.store.dispatch(debugActions.getNextBatch({
            payload: {
              task: experimentId,
              metric: this.selectedMetrics[experimentId]
            }
          }));
        }
      });
    } else {
      if (!this.beginningOfTime[taskMetric.task]) {
        this.store.dispatch(debugActions.getNextBatch({payload: taskMetric}));
      }
    }
  }

  previousBatch(taskMetric: TaskMetric) {
    if (this.bindNavigationMode) {
      this.experimentIds.forEach(experimentId => {
        this.store.dispatch(debugActions.getPreviousBatch({
          payload: {
            task: experimentId,
            metric: this.selectedMetrics[experimentId]
          }
        }));
      });
    } else {
      this.store.dispatch(debugActions.getPreviousBatch({payload: taskMetric}));
    }
  }

  backToNow(taskMetric: TaskMetric) {
    if (this.bindNavigationMode) {
      this.experimentIds.forEach(experimentId => {
        this.store.dispatch(debugActions.setSelectedMetric({
          payload: {
            task: experimentId,
            metric: this.selectedMetrics[experimentId]
          }
        }));
      });
    } else {
      this.store.dispatch(debugActions.setSelectedMetric({payload: taskMetric}));
    }

  }

  thereAreNoMetrics(experiment) {
    return !(this.optionalMetrics && this.optionalMetrics[experiment] && this.optionalMetrics[experiment].length > 0);
  }

  thereAreNoDebugImages(experiment) {
    return !(this.debugImages && this.debugImages[experiment] && this.debugImages[experiment].data?.length > 0);
  }

  shouldShowNoImagesForExperiment(experiment: string) {
    return (this.thereAreNoMetrics(experiment) && this.optionalMetrics && this.optionalMetrics[experiment]) || (this.thereAreNoDebugImages(experiment) && this.debugImages && this.debugImages[experiment]);
  }

  copyIdToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }

  toggleConnectNavigation() {
    this.bindNavigationMode = !this.bindNavigationMode;
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[] }, experimentId: string) {
    this.reportEmbed.createCode({
      type: 'sample',
      tasks: [experimentId],
      ...event
    });
  }
}
