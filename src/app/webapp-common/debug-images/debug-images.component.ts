import {ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '../../features/experiments/reducers/experiment-info.reducer';
import {AdminService} from '~/shared/services/admin.service';
import {selectS3BucketCredentials} from '../core/reducers/common-auth-reducer';
import {MatDialog} from '@angular/material/dialog';
import * as  debugActions from './debug-images-actions';
import {fetchExperiments, getDebugImagesMetrics, resetDebugImages} from './debug-images-actions';
import {
  selectBeginningOfTime,
  selectDebugImages,
  selectNoMore,
  selectOptionalMetrics,
  selectTaskNames,
  selectTimeIsNow
} from './debug-images-reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map, withLatestFrom} from 'rxjs/operators';
import {Task} from '../../business-logic/model/tasks/task';
import {ActivatedRoute} from '@angular/router';
import {TaskStatusEnum} from '../../business-logic/model/tasks/taskStatusEnum';
import {ImageDisplayerComponent} from '../experiments/dumb/image-displayer/image-displayer.component';
import {selectSelectedExperiment} from '../../features/experiments/reducers';
import {selectRefreshing} from '../experiments-compare/reducers';
import {TaskMetric} from '../../business-logic/model/events/taskMetric';
import {get, isEqual} from 'lodash/fp';
import {ALL_IMAGES} from './debug-images-effects';
import {MatSelectChange} from '@angular/material/select';
import {getSignedUrl} from '../core/actions/common-auth.actions';

@Component({
  selector: 'sm-debug-images',
  templateUrl: './debug-images.component.html',
  styleUrls: ['./debug-images.component.scss'],
})
export class DebugImagesComponent implements OnInit, OnDestroy {

  @Input() isDarkTheme = false;
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
  public debugImages: { [experimentId: string]: any };
  public experimentNames: { [id: string]: string } = {};
  public experimentIds: string[];
  public allowAutorefresh: boolean = false;

  public noMoreData$: Observable<boolean>;
  public optionalMetrics$: Observable<any>;
  public optionalMetrics: any;
  public selectedMetrics: {[taskId: string] : string} = {};
  public beginningOfTime: any;
  private beginningOfTimeSubscription: Subscription;
  public timeIsNow: any;
  private timeIsNowSubscription: Subscription;
  minimized: boolean;
  readonly allImages = ALL_IMAGES;
  private selectedMetric: string;
  public modifiedExperimentsNames: { [id: string]: string } = {};

  constructor(
    private store: Store<IExperimentInfoState>,
    private adminService: AdminService,
    private dialog: MatDialog,
    private changeDetection: ChangeDetectorRef,
    private activeRoute: ActivatedRoute,
    private elRef: ElementRef
  ) {
    this.tasks$ = this.store.select(selectTaskNames);
    this.optionalMetrics$ = this.store.select(selectOptionalMetrics);
    this.noMoreData$ = this.store.select(selectNoMore);
    this.timeIsNow$ = this.store.select(selectTimeIsNow);
    this.beginningOfTime$ = this.store.select(selectBeginningOfTime);

    this.debugImagesSubscription = combineLatest([
      store.pipe(select(selectS3BucketCredentials)),
      store.pipe(select(selectDebugImages))]).pipe(
      map(([, debugImages]) => Object.entries(debugImages).reduce(((acc, val: any) => {
        acc[val[0]] = val[1].metrics.map(metric => metric.iterations.map(iteration => {
          const events = iteration.events.map(event => {
            this.store.dispatch(getSignedUrl({url: event.url, config: {disableCache: event.timestamp}}));
            return {
              ...event,
              url: event.url,
              variantAndMetric: this.selectedMetric === ALL_IMAGES ? `${event.metric}/${event.variant}` : ''
            };
          });
          return {...iteration, events};
        }));
        acc[val[0]].metrics = val[1].metrics.map(metric => metric.metric || metric.iterations[0].events[0].metric);
        acc[val[0]].metric = acc[val[0]].metrics[0];
        acc[val[0]].scrollId = val[1].scroll_id;
        return acc;
      }), {}))
    ).subscribe(debugImages => {
      this.debugImages = debugImages;
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

    let currentExperiment: string;

    if (multipleExperiments) {
      this.routerParamsSubscription = this.routerParams$
        .subscribe(params => {
          const experiments = params.ids ? params.ids.split(',') : params.experimentId.split(',');
          if (!isEqual(experiments, this.experimentIds)) {
            this.experimentIds = experiments;
            this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
            this.store.dispatch(fetchExperiments({tasks: this.experimentIds}));
          }
        });

      this.taskNamesSubscription = this.tasks$
        .pipe(
          filter(tasks => tasks?.length > 0)
        )
        .subscribe((tasks) => {
          if (this.isTaskRunning(tasks) && (Object.keys(this.debugImages || {}).length > 0 || this.beginningOfTime[this.experimentIds[0]])) {
            this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
          }

          this.experimentNames = tasks.reduce((acc, task) => ({
            ...acc,
            [task.id]: task.name
          }), {}) as { [id: string]: string };
          tasks.forEach(task => {
              this.modifiedExperimentsNames[task.id] = Object.values(this.experimentNames).filter(name => name === task.name).length > 1 ? `${task.name}.${task.id.substr(0, 6)}` : task.name;
            }
          );
          this.changeDetection.detectChanges();
        });

      // auto refresh subscription for compare only.
      this.refreshingSubscription = this.store.select(selectRefreshing).pipe(
        filter(({refreshing}) => refreshing),
        withLatestFrom(
          this.store.select(selectTimeIsNow),
        )
      ).subscribe(([, timeIsNow]) => {
          this.store.dispatch(debugActions.refreshDebugImagesMetrics({tasks: this.experimentIds}));
          this.experimentIds.forEach(experiment => {
            this.refresh(experiment, timeIsNow, this.debugImages);
          });
        }
      );
    } else {
      this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
        .pipe(
          filter(experiment => !!experiment),
          withLatestFrom(
            this.store.select(selectTimeIsNow),
          ),
        ).subscribe(([experiment, timeIsNow]) => {
          if (currentExperiment === experiment.id && Object.keys(this.debugImages || {}).length > 0) {
            this.refresh(experiment.id, timeIsNow, this.debugImages);
          } else {
            currentExperiment = experiment.id;
            this.experimentNames = {[experiment.id]: experiment.name};
            this.experimentIds = [experiment.id];
            this.store.dispatch(getDebugImagesMetrics({tasks: this.experimentIds}));
          }
        });
    }

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

  imageClicked({frame, frames}) {
    let iterationSnippets = [];
    Object.entries(frames).map(iteration => {
      iterationSnippets = iterationSnippets.concat(iteration[1]);
    });
    const sources = iterationSnippets.map(img => img.url);
    const index = iterationSnippets.findIndex(img => img.url === frame.url);
    this.dialog.open(ImageDisplayerComponent, {
      data: {imageSources: sources, index, snippetsMetaData: iterationSnippets},
      panelClass: ['image-displayer-dialog'],
      height: '100%',
      maxHeight: 'auto',
      width: '100%',
      maxWidth: 'auto'
    });
  }

  refresh(experimentId: string, timeIsNow, debugImages) {
    if (experimentId && timeIsNow?.[experimentId] && debugImages[experimentId] && this.elRef.nativeElement.scrollTop < 40) {
      this.store.dispatch(debugActions.refreshMetric({
        payload: {
          task: experimentId,
          metric: debugImages[experimentId].metric
        }
      }));
    }
  }

  private isTaskRunning(tasks: Partial<Task>[]) {
    return tasks.some(task => [TaskStatusEnum.InProgress, TaskStatusEnum.Queued].includes(task.status));
  }

  trackExperiment(index: number, experimentID: string) {
    return experimentID;
  }

  selectMetric(change: MatSelectChange, task) {
    this.selectedMetric = change.value;
    this.store.dispatch(debugActions.setSelectedMetric({payload: {task, metric: change.value}}));
  }

  nextBatch(taskMetric: TaskMetric) {
    if (!this.beginningOfTime[taskMetric.task]) {
      this.store.dispatch(debugActions.getNextBatch({payload: taskMetric}));
    }
  }

  previousBatch(taskMetric: TaskMetric) {
    this.store.dispatch(debugActions.getPreviousBatch({payload: taskMetric}));
  }

  backToNow(taskMetric: TaskMetric) {
    this.store.dispatch(debugActions.setSelectedMetric({payload: taskMetric}));
  }

  thereAreNoMetrics(experiment) {
    return !(this.optionalMetrics && this.optionalMetrics[experiment] && this.optionalMetrics[experiment].length > 0);
  }

  thereAreNoDebugImages(experiment) {
    return !(this.debugImages && this.debugImages[experiment] && this.debugImages[experiment].length > 0);
  }

  shouldShowNoImagesForExperiment(experiment: string) {
    return (this.thereAreNoMetrics(experiment) && this.optionalMetrics && this.optionalMetrics[experiment]) || (this.thereAreNoDebugImages(experiment) && this.debugImages && this.debugImages[experiment]);
  }

}
