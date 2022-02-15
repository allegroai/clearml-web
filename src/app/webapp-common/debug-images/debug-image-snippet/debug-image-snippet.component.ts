import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {isHtmlPage, isTextFileURL} from '../../shared/utils/shared-utils';
import {IsAudioPipe} from '../../shared/pipes/is-audio.pipe';
import {IsVideoPipe} from '../../shared/pipes/is-video.pipe';
import {addMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {Store} from '@ngrx/store';
import {ThemeEnum} from '../../experiments/shared/common-experiments.const';
import {getSignedUrlOrOrigin$} from '../../core/reducers/common-auth-reducer';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';

@Component({
  selector: 'sm-debug-image-snippet',
  templateUrl: './debug-image-snippet.component.html',
  styleUrls: ['./debug-image-snippet.component.scss']
})
export class DebugImageSnippetComponent implements OnInit {
  public type: 'image' | 'player' | 'html';
  public themeEnum = ThemeEnum;
  public source$: Observable<string>;
  private _frame: any;

  @Input() set frame(frame) {
    if (frame.url) {
      this.source$ = getSignedUrlOrOrigin$(frame.url, this.store).pipe(
        tap(signed => {
          if (new IsVideoPipe().transform(signed) ||
            new IsAudioPipe().transform(signed)) {
            this.type = 'player';
          } else if (isHtmlPage(signed) || isTextFileURL(signed)) {
            this.type = 'html';
          } else {
            this.type = 'image';
          }
          this.isFailed = !signed?.startsWith('http');
        }));
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

  openInNewTab(source: string) {
    window.open(source, '_blank');
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

  log($event: ErrorEvent) {
    console.log($event);
  }
}
