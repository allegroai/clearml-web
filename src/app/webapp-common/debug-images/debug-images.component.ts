import {
  ChangeDetectionStrategy,
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
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Params} from '@angular/router';
import {RefreshService} from '@common/core/services/refresh.service';
import {DebugSampleEvent, DebugSamples} from '@common/debug-images/debug-images-types';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';
import {isGoogleCloudUrl} from '@common/settings/admin/base-admin-utils';
import {selectBeginningOfTime} from '@common/shared/debug-sample/debug-sample.reducer';
import {concatLatestFrom} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {isEqual} from 'lodash-es';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, take, withLatestFrom} from 'rxjs/operators';
import {EventsDebugImagesResponse} from '~/business-logic/model/events/eventsDebugImagesResponse';
import {TaskMetric} from '~/business-logic/model/events/taskMetric';
import {Task} from '~/business-logic/model/tasks/task';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {getSignedUrl} from '../core/actions/common-auth.actions';
import {addMessage} from '../core/actions/layout.actions';
import {selectS3BucketCredentials} from '../core/reducers/common-auth-reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {ImageViewerComponent} from '../shared/debug-sample/image-viewer/image-viewer.component';
import * as  debugActions from './debug-images-actions';
import {fetchExperiments, getDebugImagesMetrics, resetDebugImages} from './debug-images-actions';
import {ALL_IMAGES} from './debug-images-effects';
import {
  ITaskOptionalMetrics,
  selectDebugImages,
  selectNoMore,
  selectOptionalMetrics,
  selectSelectedMetricForTask,
  selectTaskNames,
  selectTimeIsNow
} from './debug-images-reducer';

@Component({
  selector: 'sm-debug-images',
  templateUrl: './debug-images.component.html',
  styleUrls: ['./debug-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private routerParams$: Observable<Params>;
  private tasks$: Observable<Partial<Task>[]>;
  public timeIsNow$: Observable<boolean>;
  public beginningOfTime$: Observable<boolean>;

  public mergeIterations: boolean;
  public debugImages: { [experimentId: string]: DebugSamples } = null;
  public experimentNames: { [id: string]: string } = {};
  public experimentIds: string[];
  public allowAutorefresh: boolean = false;

  public noMoreData$: Observable<boolean>;
  public optionalMetrics$: Observable<ITaskOptionalMetrics[]>;
  public optionalMetrics: { [experimentId: string]: string };
  public selectedMetrics: { [taskId: string]: string } = {};
  minimized: boolean;
  readonly allImages = ALL_IMAGES;
  private selectedMetric: string;
  public modifiedExperimentsNames: { [id: string]: string } = {};
  public experiments: Partial<Task>[];
  public bindNavigationMode: boolean = false;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  LIMITED_VIEW_LIMIT = LIMITED_VIEW_LIMIT;

  constructor(
    private store: Store,
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
      store.select(selectS3BucketCredentials),
      store.select(selectDebugImages),
      store.select(selectSelectedMetricForTask)
    ])
      .pipe(
        map(([, debugImages, metricForTask]) => !debugImages ? {} : Object.entries(debugImages).reduce(((acc, val: [string, EventsDebugImagesResponse]) => {
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
                  variantAndMetric: (this.selectedMetric === ALL_IMAGES || metricForTask[id] === ALL_IMAGES ) ? `${event.metric}/${event.variant}` : ''
                };
              })
            }))
          };
          acc[id].metrics = val[1].metrics.map((metric: any) => metric.metric || metric.iterations[0].events[0].metric);
          acc[id].metric = acc[id].metrics[0];
          acc[id].scrollId = val[1].scroll_id;
          return acc;
        }), {}))
      )
      .subscribe(debugImages => {
        this.debugImages = debugImages;
        Object.keys(debugImages).forEach(key => {
          if (!this.selectedMetrics[key]) {
            this.selectedMetrics[key] = debugImages[key]?.metric;
          }
        });
        this.changeDetection.markForCheck();
      });

    this.routerParams$ = this.store.select(selectRouterParams)
      .pipe(
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

    if (multipleExperiments) {
      this.routerParamsSubscription = this.routerParams$
        .subscribe(params => {
          this.selectedMetric = null;
          this.experimentIds = (params.ids ? params.ids.split(',') : params.experimentId.split(','));
          this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds.slice(0, LIMITED_VIEW_LIMIT)}));
          this.store.dispatch(fetchExperiments({tasks: this.experimentIds.slice(0, LIMITED_VIEW_LIMIT)}));
          this.changeDetection.markForCheck();
        });

      this.taskNamesSubscription = this.tasks$
        .pipe(
          filter(tasks => tasks?.length > 0),
          withLatestFrom(this.beginningOfTime$)
        )
        .subscribe(([tasks, beginningOfTime]) => {
          if (this.isTaskRunning(tasks) && (Object.keys(this.debugImages || {}).length > 0 || beginningOfTime[this.experimentIds[0]])) {
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
          this.changeDetection.markForCheck();
        });

    } else {
      this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
        .pipe(
          filter(experiment => !!experiment && !this.disableStatusRefreshFilter),
          distinctUntilChanged((previous, current) => previous?.id === current?.id),
          withLatestFrom(this.store.select(selectSelectedMetricForTask))
        ).subscribe(([experiment, metricForTask]) => {
          this.selectedMetric = null;
          this.experimentNames = {[experiment.id]: experiment.name};
          this.experimentIds = [experiment.id];
          this.selectedMetrics[experiment.id] = metricForTask[experiment.id] ;
          this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
          this.changeDetection.markForCheck();
        });
    }


    this.refreshingSubscription = this.refresh.tick
      .pipe(
        filter(auto => auto !== null && !this.disableStatusRefreshFilter),
        concatLatestFrom(() => this.store.select(selectTimeIsNow))
      )
      .subscribe(([auto, timeIsNow]) => {
        if (multipleExperiments) {
          this.store.dispatch(debugActions.refreshDebugImagesMetrics({tasks: this.experimentIds, autoRefresh: auto}));
        }
        this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
        this.experimentIds.forEach(experimentId => {
          if (experimentId && !(timeIsNow?.[experimentId] === false) && this.elRef.nativeElement.scrollTop < 40) {
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

    this.optionalMetricsSubscription = this.optionalMetrics$
      .pipe(concatLatestFrom(() => [this.store.select(selectSelectedMetricForTask)]))
      .subscribe(([optionalMetrics, selectedMetricForTask ]) => {
        const optionalMetricsDic = {};
        optionalMetrics.forEach(experimentMetrics => optionalMetricsDic[experimentMetrics.task] = experimentMetrics.metrics);
        if ((!isEqual(this.optionalMetrics, optionalMetricsDic)) && optionalMetrics.length > 0) {
          this.optionalMetrics = optionalMetricsDic;
          if (!this.selectedMetric || !optionalMetrics?.[0].metrics.includes(this.selectedMetric)) {
            optionalMetrics.forEach(optionalMetric => {
              optionalMetric.metrics[0] && this.store.dispatch(debugActions.setSelectedMetric({
                payload: {
                  task: optionalMetric.task,
                  metric: selectedMetricForTask[optionalMetric.task] ?? optionalMetric.metrics[0]
                }
              }));
            });
          }
          this.changeDetection.markForCheck();
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
    this.store.dispatch(resetDebugImages());
  }

  public urlError({frame}: { frame: DebugSampleEvent; experimentId: string }) {
    const url = frame.url;
    if (isGoogleCloudUrl(url)) {
      this.store.dispatch(getSignedUrl({url, config: {error: true}}));
    }
    // this.adminService.checkImgUrl(frame.oldSrc || frame.src);
  }

  imageClicked({frame}, experimentId: string) {
    const iterationSnippets = this.debugImages?.[experimentId]?.data.map(iter => iter.events).flat();
    const sources = iterationSnippets.map(img => img.url);
    const index = iterationSnippets.findIndex(img => img.url === frame.url);
    const isAllMetrics = this.selectedMetrics[experimentId] === ALL_IMAGES;
    this.dialog.open(ImageViewerComponent, {
      data: {
        embedFunction: (rect: DOMRect, metric: string, variant: string) =>
          this.createEmbedCode({metrics: [metric], variants: [variant], domRect: rect}, experimentId),
        imageSources: sources, index, snippetsMetaData: iterationSnippets, isAllMetrics
      },
      panelClass: ['image-viewer-dialog', 'light-theme'],
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

  selectMetric(change: {value: string}, taskId) {
    this.selectedMetric = change.value;
    if (this.bindNavigationMode) {
      this.experimentIds.forEach(experimentId => {
        this.selectedMetrics[experimentId] = change.value;
        this.store.dispatch(debugActions.setSelectedMetric({payload: {task: experimentId, metric: change.value}}));
      });
    } else {
      this.selectedMetrics[taskId] = change.value;
      this.store.dispatch(debugActions.setSelectedMetric({payload: {task: taskId, metric: change.value}}));
    }
  }

  nextBatch(taskMetric: TaskMetric) {
    if (this.bindNavigationMode) {
      this.beginningOfTime$
        .pipe(take(1))
        .subscribe(beginningOfTime => {
          this.experimentIds.forEach(experimentId => {
            if (!beginningOfTime[experimentId]) {
              this.store.dispatch(debugActions.getNextBatch({
                payload: {
                  task: experimentId,
                  metric: this.selectedMetrics[experimentId]
                }
              }));
            }
          });
        });
    } else {
      this.store.dispatch(debugActions.getNextBatch({payload: taskMetric}));
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

  thereAreNoMetrics(experiment: string) {
    return !(this.optionalMetrics?.[experiment]?.length > 0);
  }

  thereAreNoDebugImages(experiment: string) {
    return !(this.debugImages?.[experiment]?.data?.length > 0);
  }

  shouldShowNoImagesForExperiment(experiment: string) {
    return this.thereAreNoMetrics(experiment) && this.thereAreNoDebugImages(experiment);
  }

  copyIdToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }

  toggleConnectNavigation() {
    this.bindNavigationMode = !this.bindNavigationMode;
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; domRect: DOMRect }, experimentId: string) {
    this.reportEmbed.createCode({
      type: 'sample',
      objects: [experimentId],
      objectType: 'task',
      ...event
    });
  }
}
