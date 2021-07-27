import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '../../features/experiments/reducers/experiment-info.reducer';
import {AdminService} from '../../features/admin/admin.service';
import {selectS3BucketCredentials} from '../core/reducers/common-auth-reducer';
import {MatDialog} from '@angular/material/dialog';
import * as  debugActions from './debug-images-actions';
import {FetchExperiments, GetDebugImagesMetrics, ResetDebugImages} from './debug-images-actions';
import {
  selectBeginningOfTime,
  selectDebugImages,
  selectNoMore,
  selectOptionalMetrics,
  selectTaskNames,
  selectTimeIsNow
} from './debug-images-reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map, publish, withLatestFrom} from 'rxjs/operators';
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

@Component({
  selector   : 'sm-debug-images',
  templateUrl: './debug-images.component.html',
  styleUrls  : ['./debug-images.component.scss'],
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
  private selectRefreshing$: Observable<{ refreshing: boolean; autoRefresh: boolean }>;
  private tasks$: Observable<Array<Partial<Task>>>;
  public timeIsNow$: Observable<any>;
  public beginningOfTime$: Observable<any>;

  public mergeIterations: boolean;
  public debugImages: Array<any>;
  public taskNames: { [id: string]: string } = {};
  public experimentIds: string[];
  public allowAutorefresh: boolean = false;

  // ConnectableObservable<any[ISelectedExperiment | any ]>;
  private delayedExperimentSelect$: any;
  public noMoreData$: Observable<boolean>;
  public optionalMetrics$: Observable<any>;
  public optionalMetrics: any;
  public selectedMetrics = {};
  public beginningOfTime: any;
  private beginningOfTimeSubscription: Subscription;
  public timeIsNow: any;
  private timeIsNowSubscription: Subscription;
  minimized: boolean;
  readonly ALL_IMAGES = ALL_IMAGES;
  private selectedMetric: string;

  constructor(
    private store: Store<IExperimentInfoState>,
    private adminService: AdminService,
    private dialog: MatDialog,
    private changeDetection: ChangeDetectorRef,
    private activeRoute: ActivatedRoute
  ) {
    this.tasks$ = this.store.select(selectTaskNames);
    this.optionalMetrics$ = this.store.select(selectOptionalMetrics);
    this.selectRefreshing$ = this.store.select(selectRefreshing);
    this.noMoreData$ = this.store.select(selectNoMore);
    this.timeIsNow$ = this.store.select(selectTimeIsNow);
    this.beginningOfTime$ = this.store.select(selectBeginningOfTime);

    this.debugImages$ = combineLatest([
      store.pipe(select(selectS3BucketCredentials)),
      store.pipe(select(selectDebugImages))])
      .pipe(
        map(([, debugImages]) => {
          const debugImagesP = Object.entries(debugImages).reduce(((previousValue, currentValue: any) => {
            previousValue[currentValue[0]] = currentValue[1].metrics.map(metric => metric.iterations.map(iteration => {
              const events = iteration.events.map(event => {
                const url = this.adminService.signUrlIfNeeded(event.url, {disableCache: event.timestamp});
                return {...event, oldSrc: event.url, url, variantAndMetric: this.selectedMetric === ALL_IMAGES ? `${event.metric}/${event.variant}` : ''};
              });
              return {...iteration, events};
            }));
            previousValue[currentValue[0]].metrics = currentValue[1].metrics.map( metric => metric.metric || metric.iterations[0].events[0].metric);
            previousValue[currentValue[0]].metric = previousValue[currentValue[0]].metrics[0];
            previousValue[currentValue[0]].scrollId = currentValue[1].scroll_id;
            return previousValue;
          }), {});
          return debugImagesP;
        })
      );
    this.debugImagesSubscription = this.debugImages$.subscribe(debugImages => {
      this.debugImages = debugImages;
      Object.keys(debugImages).forEach(key => {
        if (!this.selectedMetrics[key]) {
          this.selectedMetrics[key] = get('metric', debugImages[key]);
        }
      });
    });

    this.routerParams$ = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.ids || !!params.experimentId),
      distinctUntilChanged()
    );
  }

  ngOnInit() {
    this.mergeIterations = this.activeRoute.snapshot.routeConfig?.data?.mergeIterations;
    this.minimized = this.activeRoute.snapshot.routeConfig?.data?.minimized;

    this.delayedExperimentSelect$ = this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
        withLatestFrom(this.store.select(selectTimeIsNow), this.store.select(selectDebugImages)),
        publish()
      );
    this.selectedExperimentSubscription = this.delayedExperimentSelect$.subscribe(([experiment, timeIsNow, debugImages]) => {
      if (experiment) {
        this.refresh(experiment.id, timeIsNow, debugImages);
      }
    });

    this.beginningOfTimeSubscription = this.beginningOfTime$.subscribe(beginningOfTime => {
      this.beginningOfTime = beginningOfTime;
    });

    this.timeIsNowSubscription = this.timeIsNow$.subscribe(timeIsNow => {
      this.timeIsNow = timeIsNow;
    });

    this.routerParamsSubscription = this.routerParams$
      .subscribe(params => {
        const experiments = params.ids ? params.ids.split(',') : params.experimentId.split(',');
        if (!isEqual(experiments, this.experimentIds)) {
          this.experimentIds = experiments;
          this.store.dispatch(new FetchExperiments(this.experimentIds));
          this.store.dispatch(new GetDebugImagesMetrics({tasks: this.experimentIds}));
          this.delayedExperimentSelect$.connect(); // Wait for 5 seconds before starting refresh, hopefully avoiding a redundany api call
        }
      });
    this.taskNamesSubscription = this.tasks$
      .pipe(
        filter((tasks) => !!tasks)
      )
      .subscribe((tasks) => {
        this.allowAutorefresh = this.isTaskPendingRunning(tasks);
        this.taskNames = tasks.reduce((acc, task) => ({...acc, [task.id]: task.name}), {}) as { [id: string]: string };
        this.changeDetection.detectChanges();
      });
    // auto refresh subscription for compare only.
    this.refreshingSubscription = this.selectRefreshing$.pipe(
      filter(({refreshing}) => refreshing),
      withLatestFrom(this.store.select(selectTimeIsNow), this.store.select(selectDebugImages)),
    ).subscribe(([, timeIsNow, debugImages]) => {
        this.store.dispatch(new debugActions.RefreshDebugImagesMetrics({tasks: this.experimentIds}));
        this.experimentIds.forEach(experiment => {
          this.refresh(experiment, timeIsNow, debugImages);
        });
      }
    );

    this.optionalMetricsSubscription = this.optionalMetrics$.subscribe(optionalMetrics => {
      if ((!isEqual(this.optionalMetrics, optionalMetrics)) && optionalMetrics.length > 0) {
        const optionalMetricsDic = {};
        optionalMetrics.forEach(experimentMetrics => optionalMetricsDic[experimentMetrics.task] = experimentMetrics.metrics);
        this.optionalMetrics = optionalMetricsDic;
        optionalMetrics.forEach(optionalMetric => {
          optionalMetric.metrics[0] && this.store.dispatch(new debugActions.SelectMetric({task: optionalMetric.task, metric: optionalMetric.metrics[0]}));
        });
        this.changeDetection.detectChanges();
      }
    });
  }


  ngOnDestroy(): void {
    this.routerParamsSubscription.unsubscribe();
    this.taskNamesSubscription.unsubscribe();
    this.selectedExperimentSubscription.unsubscribe();
    this.refreshingSubscription.unsubscribe();
    this.optionalMetricsSubscription.unsubscribe();
    this.debugImagesSubscription.unsubscribe();
    this.beginningOfTimeSubscription.unsubscribe();
    this.timeIsNowSubscription.unsubscribe();
    this.store.dispatch(new ResetDebugImages());
  }

  public urlError(data) {
    const {frame} = data;
    this.adminService.checkImgUrl(frame.oldSrc || frame.src);
  }

  imageClicked(data) {
    const {frame, frames} = data;
    let iterationSnippets = [];
    Object.entries(frames).map(iteration => {
      iterationSnippets = iterationSnippets.concat(iteration[1]);
    });
    const sources = iterationSnippets.map(img => img.url);
    const index = iterationSnippets.findIndex(img => img.url === frame.url);
    this.dialog.open(ImageDisplayerComponent, {
      data      : {imageSources: sources, index, snippetsMetaData: iterationSnippets},
      panelClass: ['image-displayer-dialog'],
      height    : '100%',
      maxHeight : 'auto',
      width     : '100%',
      maxWidth  : 'auto'
    });
  }

  refresh(experimentId: string, timeIsNow, debugImages) {
    if (experimentId && timeIsNow && timeIsNow[experimentId] && debugImages[experimentId]) {
      this.store.dispatch(new debugActions.RefreshMetric({task: experimentId, metric: debugImages[experimentId].metrics[0].metric}));
    }
  }

  private isTaskPendingRunning(tasks: any) {
    if (!tasks[0]) {
      return false;
    }
    return tasks.length > 1 || [TaskStatusEnum.InProgress, 'Queued'].includes(tasks[0].status);
  }

  trackExperiment(index: number, experimentID: string) {
    return experimentID;
  }

  selectMetric(change: MatSelectChange, task) {
    this.selectedMetric = change.value;
    this.store.dispatch(new debugActions.SelectMetric({task, metric: change.value}));
  }

  nextBatch(taskMetric: TaskMetric) {
    if (!this.beginningOfTime[taskMetric.task]) {
      this.store.dispatch(new debugActions.GetNextBatch(taskMetric));
    }
  }

  previousBatch(taskMetric: TaskMetric) {
    this.store.dispatch(new debugActions.GetPreviousBatch(taskMetric));
  }

  backToNow(taskMetric: TaskMetric) {
    this.store.dispatch(new debugActions.SelectMetric(taskMetric));
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
