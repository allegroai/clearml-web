import {Component, ElementRef, inject, Input, Output, viewChildren} from '@angular/core';
import {EventEmitter} from '@angular/core';
import {ThemeEnum} from '@common/constants';
import {DebugSampleEvent, Iteration} from '@common/debug-images/debug-images-types';
import {VirtualGridComponent} from '@common/shared/components/virtual-grid/virtual-grid.component';

@Component({
  selector: 'sm-debug-images-view',
  templateUrl: './debug-images-view.component.html',
  styleUrls: ['./debug-images-view.component.scss']
})
export class DebugImagesViewComponent {
  protected ref = inject<ElementRef<HTMLElement>>(ElementRef);
  public themeEnum = ThemeEnum;

  public trackFrame = item => `${item?.key} ${item?.timestamp}`;

  @Input() experimentId;
  @Input() isMergeIterations;
  @Input() title;
  @Input() iterations: Iteration[];
  @Input() isDatasetVersionPreview = false;
  @Output() imageClicked = new EventEmitter();
  @Output() refreshClicked = new EventEmitter();
  @Output() createEmbedCode = new EventEmitter<{metrics?: string[]; variants?: string[]; domRect: DOMRect}>();
  @Output() urlError = new EventEmitter<{ frame: DebugSampleEvent; experimentId: string }>();

  private gridList = viewChildren(VirtualGridComponent);


  public imageUrlError(data: { frame: DebugSampleEvent; experimentId: string }) {
    this.urlError.emit(data);
  }

  resize() {
    this.gridList().forEach(grid => grid.resize(2))
  }
}
