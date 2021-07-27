import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {last} from 'lodash/fp';
import {select, Store} from '@ngrx/store';
import {
  getDebugImageSample,
  getNextDebugImageSample,
  resetDisplayer,
  setDebugImageViewerScrollId,
  setDisplayerEndOfTime
} from '../../../debug-images/debug-images-actions';
import {
  selectCurrentImageViewerDebugImage,
  selectDisplayerBeginningOfTime,
  selectDisplayerEndOfTime,
  selectMinMaxIterations
} from '../../../debug-images/debug-images-reducer';
import {combineLatest, interval, Observable, Subscription} from 'rxjs';
import {EventsGetDebugImageIterationsResponse} from '../../../../business-logic/model/events/eventsGetDebugImageIterationsResponse';
import {selectS3BucketCredentials} from '../../../core/reducers/common-auth-reducer';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {AdminService} from '../../../../features/admin/admin.service';
import {selectAppVisible, selectAutoRefresh} from '../../../core/reducers/view-reducer';
import {isFileserverUrl} from '../../../../shared/utils/url';

@Component({
  selector: 'sm-image-displayer',
  templateUrl: './image-displayer.component.html',
  styleUrls: ['./image-displayer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDisplayerComponent implements OnInit, OnDestroy {

  public imageSources: Array<any>;
  public xCord: number;
  public yCord: number;
  public scale = 1;
  readonly scaleStep = 0.1;
  public autoFitScale: number;
  @ViewChild('imageContainer', {static: true}) imageContainer: ElementRef;
  @ViewChild('debugImage', {static: true}) debugImage: ElementRef;
  @ViewChild('sizeCont', {static: true}) sizeCont: ElementRef;
  public imageHeight: number;
  public imageWidth: number;
  public imageTop: string | number;
  public imageLeft: number;
  public imageTranslateY = 0;
  public imageTranslateX = 0;
  public dragging: boolean;
  public minMaxIterations$: Observable<EventsGetDebugImageIterationsResponse>;
  public currentDebugImage$: Observable<any>;
  public currentDebugImage: any;
  public iteration: number;
  public beginningOfTime$: Observable<boolean>;
  public endOfTime$: Observable<boolean>;
  private currentDebugImageSubscription: Subscription;
  private autoRefreshState$: Observable<boolean>;
  private isAppVisible$: Observable<boolean>;
  private autoRefreshSub: Subscription;
  readonly DISPLAYER_AUTO_REFRESH_INTERVAL = 60 * 1000;
  public imageLoaded: boolean = false;
  private beginningOfTime: boolean = false;
  private endOfTime: boolean = false;
  private begOfTimeSub: Subscription;
  private endOfTimeSub: Subscription;


  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
      case '+':
        this.calculateNewScale(true);
        break;
      case '-':
        this.calculateNewScale(false);
        break;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageSources: Array<any>; index: number; snippetsMetaData: any },
    public dialogRef: MatDialogRef<ImageDisplayerComponent>,
    public changeDetector: ChangeDetectorRef,
    private store: Store<any>,
    private adminService: AdminService
  ) {
    const reqData = {
      task: data.snippetsMetaData[data.index].task,
      metric: data.snippetsMetaData[data.index].metric,
      variant: data.snippetsMetaData[data.index].variant,
      iteration: data.snippetsMetaData[data.index].iter
    };
    this.store.dispatch(getDebugImageSample(reqData));
    this.minMaxIterations$ = this.store.select(selectMinMaxIterations);
    this.beginningOfTime$ = this.store.select(selectDisplayerBeginningOfTime);
    this.endOfTime$ = this.store.select(selectDisplayerEndOfTime);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.currentDebugImage$ = combineLatest([
      store.pipe(select(selectS3BucketCredentials)),
      store.pipe(select(selectCurrentImageViewerDebugImage))])
      .pipe(
        filter(([bucketCredentials, event]) => !!event),
        map(([bucketCredentials, event]) => {
          const signedUrl = this.adminService.signUrlIfNeeded(event.url, {disableCache: event.timestamp});
          return {...event, oldSrc: event.url, url: signedUrl};
        })
      );


    this.autoRefreshSub = interval(this.DISPLAYER_AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.isAppVisible$),
      filter(([iteration, autoRefreshState, isVisible]) => isVisible && autoRefreshState)
    ).subscribe(() => {
      if (this.currentDebugImage) {
        this.store.dispatch(setDisplayerEndOfTime({endOfTime: false}));
        this.store.dispatch(setDebugImageViewerScrollId({scrollId: null}));
        this.store.dispatch(getDebugImageSample({
          task: this.currentDebugImage.task,
          metric: this.currentDebugImage.metric,
          variant: this.currentDebugImage.variant,
          iteration: this.currentDebugImage.iter
        }));
      }
      }
    );
  }

  canGoNext() {
    return !this.endOfTime;
  }

  canGoBack() {
    return !this.beginningOfTime;
  }

  calculateNewScale(scaleUp: boolean) {
    const scaleFactor = scaleUp ? 1 : -1;
    this.scale = Math.max(this.scale + (this.scale * scaleFactor * this.scaleStep), 0.1);
    this.changeScale();
  }

  changeScale() {
    this.imageHeight = Math.floor(this.debugImage.nativeElement.naturalHeight * this.scale);
    this.imageWidth = Math.floor(this.debugImage.nativeElement.naturalWidth * this.scale);
  }

  resetScale() {
    this.scale = 1;
    this.resetDrag();
    this.changeScale();
  }

  changeCords($event: MouseEvent) {
    this.xCord = Math.floor($event.offsetX / this.scale);
    this.yCord = Math.floor($event.offsetY / this.scale);
  }

  next() {
    if (this.canGoNext() && this.currentDebugImage) {
      this.imageLoaded = false;
      this.store.dispatch(getNextDebugImageSample({task: this.currentDebugImage.task, navigateEarlier: false}));
    }
  }

  previous() {
    if (this.canGoBack() && this.currentDebugImage) {
      this.imageLoaded = false;
      this.store.dispatch(getNextDebugImageSample({task: this.currentDebugImage.task, navigateEarlier: true}));
    }
  }

  closeImageDisplayer() {
    this.store.dispatch(resetDisplayer());
    this.dialogRef.close();
  }

  fitToScreen() {
    const heightScaleFit = (this.imageContainer.nativeElement.clientHeight - 120) / this.debugImage.nativeElement.naturalHeight;
    const widthScaleFit = (this.imageContainer.nativeElement.clientWidth - 120) / this.debugImage.nativeElement.naturalWidth;
    this.scale = Math.min(heightScaleFit, widthScaleFit);
    this.autoFitScale = this.scale;
    this.resetDrag();
    this.changeScale();
  }

  resetDrag() {
    this.imageTranslateY = 0;
    this.imageTranslateX = 0;
  }


  dragImage($event: MouseEvent) {
    if (this.dragging) {
      this.imageTranslateX += $event.movementX;
      this.imageTranslateY += $event.movementY;
    }
  }

  resetCords() {
    this.xCord = null;
    this.yCord = null;
  }

  disableNativeDrag() {
    return false;
  }

  setDragging(b: boolean) {
    this.dragging = b;
  }


  wheelZoom($event: WheelEvent) {
    this.scale = Math.max(this.scale - (0.005 * $event.deltaY), 0.1);
    this.changeScale();
  }

  downloadImage() {
    if (this.currentDebugImage) {
      const src = new URL(this.currentDebugImage.url);
      if (isFileserverUrl(this.currentDebugImage.url, window.location.hostname)) {
        src.searchParams.set('download', '');
      }
      const a = document.createElement('a') as HTMLAnchorElement;
      a.href = src.toString();
      a.download = last(src.pathname.split('/'));
      a.target = '_blank';
      a.click();
    }
  }

  changeIteration(value: number) {
    this.iteration = value;
    if (this.currentDebugImage) {
      const reqData = {
        task: this.currentDebugImage.task,
        metric: this.currentDebugImage.metric,
        variant: this.currentDebugImage.variant,
        iteration: value
      };
      this.store.dispatch(getDebugImageSample(reqData));
    }
  }

  ngOnInit(): void {
    this.currentDebugImageSubscription = this.currentDebugImage$.subscribe(currentDebugImage => {
      this.currentDebugImage = currentDebugImage;
      this.iteration = currentDebugImage.iter;
      this.changeDetector.detectChanges();
    });
    this.begOfTimeSub = this.beginningOfTime$.subscribe(beg => {
      this.beginningOfTime = beg;
      if (beg) {
        this.imageLoaded = true;
      }
    });
    this.endOfTimeSub = this.endOfTime$.subscribe(end => {
      this.endOfTime = end;
      if (end) {
        this.imageLoaded = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(setDebugImageViewerScrollId({scrollId: null}));
    this.currentDebugImageSubscription.unsubscribe();
    this.begOfTimeSub.unsubscribe();
    this.endOfTimeSub.unsubscribe();
    this.autoRefreshSub.unsubscribe();
  }

  showImage() {
    this.imageLoaded = true;
  }
}
