import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, withLatestFrom} from 'rxjs/operators';
import {BehaviorSubject, interval, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventsGetDebugImageIterationsResponse} from '~/business-logic/model/events/eventsGetDebugImageIterationsResponse';
import {selectAppVisible, selectAutoRefresh} from '@common/core/reducers/view.reducer';
import {BaseImageViewerComponent} from '@common/shared/debug-sample/image-viewer/base-image-viewer.component';
import {getDebugImageSample, getNextDebugImageSample, setDebugImageViewerScrollId, setViewerEndOfTime} from '@common/shared/debug-sample/debug-sample.actions';
import {selectMinMaxIterations, selectViewerBeginningOfTime, selectViewerEndOfTime} from '@common/shared/debug-sample/debug-sample.reducer';

const VIEWER_AUTO_REFRESH_INTERVAL = 60 * 1000;

@Component({
  selector: 'sm-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerComponent extends BaseImageViewerComponent implements OnInit, OnDestroy {

  public minMaxIterations$: Observable<EventsGetDebugImageIterationsResponse>;
  public beginningOfTime$: Observable<boolean>;
  public endOfTime$: Observable<boolean>;
  private autoRefreshState$: Observable<boolean>;
  private isAppVisible$: Observable<boolean>;
  private autoRefreshSub: Subscription;
  private beginningOfTime = false;
  private endOfTime = false;
  private begOfTimeSub: Subscription;
  private endOfTimeSub: Subscription;
  change$: BehaviorSubject<number>;
  private sub = new Subscription();
  public embedFunction: (DOMRect, metric: string, variant: string) => null;


  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
      case 'ArrowUp':
        this.nextIteration();
        break;
      case 'ArrowDown':
        this.previousIteration();
        break;
      default:
        this.baseOnKeyDown(e);
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public override data: {
      index: number;
      isAllMetrics: boolean;
      snippetsMetaData: Array<{task: string; metric: string; variant: string; iter: number}>;
      url: string;
      withoutNavigation: boolean;
      embedFunction: () => null;
    },
    public override dialogRef: MatDialogRef<ImageViewerComponent>,
    public override changeDetector: ChangeDetectorRef,
    public override store: Store<any>
  ) {
    super(data, dialogRef, changeDetector, store);
    if(data.url) {
      this.url = data.url;
      this.isPlayer = false;
      this.change$ = new BehaviorSubject<number>(0);
    } else {
      const reqData = {
        task: data.snippetsMetaData[data.index].task,
        metric: data.snippetsMetaData[data.index].metric,
        variant: data.snippetsMetaData[data.index].variant,
        iteration: data.snippetsMetaData[data.index].iter,
        isAllMetrics: data.isAllMetrics
      };
      this.store.dispatch(getDebugImageSample(reqData));
      this.change$ = new BehaviorSubject<number>(reqData.iteration);
    }
    this.minMaxIterations$ = this.store.select(selectMinMaxIterations);
    this.beginningOfTime$ = this.store.select(selectViewerBeginningOfTime);
    this.endOfTime$ = this.store.select(selectViewerEndOfTime);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.embedFunction = data.embedFunction;
    this.autoRefreshSub = interval(VIEWER_AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.isAppVisible$),
      filter(([, autoRefreshState, isVisible]) => isVisible && autoRefreshState)
    ).subscribe(() => {
      if (this.currentDebugImage) {
        this.store.dispatch(setViewerEndOfTime({endOfTime: false}));
        this.store.dispatch(setDebugImageViewerScrollId({scrollId: null}));
        this.store.dispatch(getDebugImageSample({
          task: this.currentDebugImage.task,
          metric: this.currentDebugImage.metric,
          variant: this.currentDebugImage.variant,
          iteration: this.currentDebugImage.iter,
          isAllMetrics: this.data.isAllMetrics
        }));
      }
    });

    this.sub.add(this.change$
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(val => this.changeIteration(val)));
  }

  canGoNext() {
    return !this.endOfTime;
  }

  canGoBack() {
    return !this.beginningOfTime;
  }

  next() {
    if (this.canGoNext() && this.currentDebugImage) {
      this.imageHeight = null;
      this.imageWidth = null;
      this.imageLoaded = false;
      this.store.dispatch(getNextDebugImageSample({task: this.currentDebugImage.task, navigateEarlier: false}));
    }
  }

  previous() {
    if (this.canGoBack() && this.currentDebugImage) {
      this.imageHeight = null;
      this.imageWidth = null;
      this.imageLoaded = false;
      this.store.dispatch(getNextDebugImageSample({task: this.currentDebugImage.task, navigateEarlier: true}));
    }
  }

  private nextIteration() {
    if (this.canGoNext() && this.currentDebugImage) {
      this.imageLoaded = false;
      this.store.dispatch(getNextDebugImageSample({task: this.currentDebugImage.task, navigateEarlier: false, iteration: true}));
    }
  }

  previousIteration() {
    if (this.canGoBack() && this.currentDebugImage) {
      this.imageLoaded = false;
      this.store.dispatch(getNextDebugImageSample({task: this.currentDebugImage.task, navigateEarlier: true, iteration: true}));
    }
  }

  changeIteration(value: number) {
    if (this.iteration === value || this.data.withoutNavigation) {
      return;
    }
    this.iteration = value;
    if (this.currentDebugImage) {
      const reqData = {
        task: this.currentDebugImage.task,
        metric: this.currentDebugImage.metric,
        variant: this.currentDebugImage.variant,
        iteration: value,
        isAllMetrics: this.data.isAllMetrics
      };
      this.store.dispatch(getDebugImageSample(reqData));
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.begOfTimeSub = this.beginningOfTime$.subscribe(beg => {
      this.beginningOfTime = beg;
      if (beg) {
        this.fitToScreen();
        this.imageLoaded = true;
      }
    });
    this.endOfTimeSub = this.endOfTime$.subscribe(end => {
      this.endOfTime = end;
      if (end) {
        this.fitToScreen();
        this.imageLoaded = true;
      }
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(setDebugImageViewerScrollId({scrollId: null}));
    this.begOfTimeSub.unsubscribe();
    this.endOfTimeSub.unsubscribe();
    this.autoRefreshSub?.unsubscribe();
    this.sub.unsubscribe();
  }

  embedCodeClick($event: MouseEvent) {
    $event && this.embedFunction(($event?.currentTarget as HTMLElement).getBoundingClientRect(), this.currentDebugImage?.metric, this.currentDebugImage?.variant);
  }
}
