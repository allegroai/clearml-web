import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {isHtmlPage, isTextFileURL} from '../../shared/utils/shared-utils';
import {IsAudioPipe} from '../../shared/pipes/is-audio.pipe';
import {IsVideoPipe} from '../../shared/pipes/is-video.pipe';
import {addMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {Store} from '@ngrx/store';
import {ThemeEnum} from '../../experiments/shared/common-experiments.const';

@Component({
  selector: 'sm-debug-image-snippet',
  templateUrl: './debug-image-snippet.component.html',
  styleUrls: ['./debug-image-snippet.component.scss']
})
export class DebugImageSnippetComponent implements OnInit {
  public isVideo: boolean;
  public isAudio: boolean;
  public isHtml: boolean;
  private _frame: any;
  public ThemeEnum = ThemeEnum;

  @Input() set frame(frame) {
    if (frame.url) {
      this.isVideo = (new IsVideoPipe().transform(frame.url));
      this.isAudio = (new IsAudioPipe()).transform(frame.url);
      this.isHtml = isHtmlPage(frame.url) || isTextFileURL(frame.url);
    }
    this._frame = frame;
  }
  get frame() {
    return this._frame;
  }
  @Output() imageError = new EventEmitter();
  @Output() imageClicked = new EventEmitter();
  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  isFailed = false;
  isLoading = true;

  constructor(private store: Store<any>) {
  }

  ngOnInit() {
  }

  openInNewTab() {
    window.open(this.frame.url || this.frame.oldSrc, '_blank');
  }

  loadedMedia() {
    this.isLoading = false;
    if (this.video?.nativeElement?.videoHeight === 0) {
      this.video.nativeElement.poster = '/app/webapp-common/assets/icons/audio.svg';
    }
  }

  copyToClipboardSuccess(success: boolean) {
    this.store.dispatch(addMessage(
      success ? MESSAGES_SEVERITY.SUCCESS : MESSAGES_SEVERITY.ERROR,
      success ? 'Path copied to clipboard' : 'No path to copy'
    ));
  }
}
