import {Component, Input, Output} from '@angular/core';
import {EventEmitter} from '@angular/core';
import {Iteration, Event} from '@common/debug-images/debug-images.component';
import {ThemeEnum} from '@common/constants';

@Component({
  selector: 'sm-debug-images-view',
  templateUrl: './debug-images-view.component.html',
  styleUrls: ['./debug-images-view.component.scss']
})
export class DebugImagesViewComponent {
  public themeEnum = ThemeEnum;

  public trackKey = (index: number, item: any) => item.iter;
  public trackFrame = (index: number, item: any) => `${item?.key} ${item?.timestamp}`;

  @Input() experimentId;
  @Input() isMergeIterations;
  @Input() title;
  @Input() iterations: Iteration[];
  @Input() isDarkTheme = false;
  @Input() isDatasetVersionPreview = false;
  @Output() imageClicked = new EventEmitter();
  @Output() refreshClicked = new EventEmitter();
  @Output() createEmbedCode = new EventEmitter<{metrics?: string[]; variants?: string[]}>();
  @Output() urlError = new EventEmitter();

  public imageUrlError(data: { frame: Event; experimentId: string }) {
    this.urlError.emit(data);
  }
}
