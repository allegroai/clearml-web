import {Component, Input, Output} from '@angular/core';
import {EventEmitter} from '@angular/core';

@Component({
  selector: 'sm-debug-images-view',
  templateUrl: './debug-images-view.component.html',
  styleUrls: ['./debug-images-view.component.scss']
})
export class DebugImagesViewComponent {

  public trackKey = (index: number, item: any) => item.iter;
  public trackFrame = (index: number, item: any) => item.key;

  @Input() experimentId;
  @Input() isMergeIterations;
  @Input() title;
  @Input() iterations;
  @Input() isDarkTheme = false;
  @Output() imageClicked = new EventEmitter();
  @Output() refreshClicked = new EventEmitter();
  @Output() urlError = new EventEmitter();

  public imageUrlError(data: { frame: string; experimentId: string }) {
    this.urlError.emit(data);
  }
  get allIterationsEvents(){
    const iterationEvents = [];
    this.iterations.forEach(iteration=> iterationEvents.push(iteration.events));
    return iterationEvents;
  }
}
