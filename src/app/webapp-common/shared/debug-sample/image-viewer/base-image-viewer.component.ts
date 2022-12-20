import {ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {last} from 'lodash/fp';
import {isFileserverUrl} from '~/shared/utils/url';
import {IsVideoPipe} from '@common/shared/pipes/is-video.pipe';
import {IsAudioPipe} from '@common/shared/pipes/is-audio.pipe';
import {resetViewer} from '@common/shared/debug-sample/debug-sample.actions';
import {selectCurrentImageViewerDebugImage} from '@common/shared/debug-sample/debug-sample.reducer';
import {getSignedUrl} from '@common/core/actions/common-auth.actions';
import {getSignedUrlOrOrigin$} from '@common/core/reducers/common-auth-reducer';

@Component({
  selector: 'sm-image-viewer',
  template: ''
})
export class BaseImageViewerComponent implements OnInit, OnDestroy {

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
  public currentDebugImage$: Observable<any>;
  public currentDebugImage: any;
  public url: string;
  public isPlayer: boolean;
  public currentDebugImageSubscription: Subscription;
  public imageLoaded: boolean = false;
  public iteration: number;


  @HostListener('document:keydown', ['$event'])
  baseOnKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case '+':
        this.calculateNewScale(true);
        break;
      case '-':
        this.calculateNewScale(false);
        break;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {index: number; isAllMetrics: boolean; snippetsMetaData: Array<{task: string; metric: string; variant: string; iter: number}>},
    public dialogRef: MatDialogRef<BaseImageViewerComponent>,
    public changeDetector: ChangeDetectorRef,
    public store: Store<any>
  ) {
    this.currentDebugImage$ = store.select(selectCurrentImageViewerDebugImage)
      .pipe(
        filter(event => !!event),
        map(event => {
          this.store.dispatch(getSignedUrl({url: event.url, config: {disableCache: event.timestamp}}));
          return event;
        })
      );
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

  closeImageViewer() {
    this.store.dispatch(resetViewer());
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
      if (isFileserverUrl(this.currentDebugImage.url)) {
        src.searchParams.set('download', '');
      }
      const a = document.createElement('a') as HTMLAnchorElement;
      a.href = src.toString();
      a.download = last(src.pathname.split('/'));
      a.target = '_blank';
      a.click();
    }
  }

  ngOnInit(): void {
    this.currentDebugImageSubscription = this.currentDebugImage$
      .pipe(
        tap(currentDebugImage => {
          this.currentDebugImage = currentDebugImage;
          this.iteration = currentDebugImage.iter;
        }),
        switchMap(currentDebugImage => getSignedUrlOrOrigin$(currentDebugImage.url, this.store))
      )
      .subscribe(signed => {
        this.url = signed;
        this.isPlayer = (new IsVideoPipe().transform(signed) || new IsAudioPipe().transform(signed));
        this.changeDetector.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(resetViewer());
    this.currentDebugImageSubscription.unsubscribe();
  }

  showImage() {
    this.imageLoaded = true;
  }

}
