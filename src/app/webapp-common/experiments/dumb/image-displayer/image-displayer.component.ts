import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {last} from 'lodash/fp';

@Component({
  selector: 'sm-image-displayer',
  templateUrl: './image-displayer.component.html',
  styleUrls: ['./image-displayer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDisplayerComponent {

  public imageSources: Array<any>;
  public currentIndex;
  public title: string;
  public xCord: number;
  public yCord: number;
  readonly snippetsMetaData: any;
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
  public hidden = false;

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { imageSources: Array<any>, index: number, snippetsMetaData: any },
              public dialogRef: MatDialogRef<ConfirmDialogComponent>, public changeDetector: ChangeDetectorRef) {
    this.imageSources = data.imageSources;
    this.currentIndex = data.index || 0;
    this.snippetsMetaData = data.snippetsMetaData;
    this.title = this.getFrameTitle(this.currentIndex);
  }

  canGoNext() {
    return this.currentIndex < (this.imageSources.length - 1);
  }

  canGoBack() {
    return this.currentIndex > 0;
  }

  private getFrameTitle(currentIndex: number) {
    const snippetMeta = this.snippetsMetaData[currentIndex];
    return snippetMeta.metric + ' - Iteration ' + snippetMeta.iter + ': ' + snippetMeta.variant;
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
    if (this.canGoNext()) {
      this.currentIndex++;
      this.title = this.getFrameTitle(this.currentIndex);
    }
  }

  previous() {
    if (this.canGoBack()) {
      this.currentIndex--;
      this.title = this.getFrameTitle(this.currentIndex);
    }
  }

  closeImageDisplayer() {
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
    const src = new URL(this.imageSources[this.currentIndex]);
    const a = document.createElement('a') as HTMLAnchorElement;
    a.href = this.imageSources[this.currentIndex];
    a.download = last(src.pathname.split('/'));
    a.target = '_blank';
    a.click();
  }
}
