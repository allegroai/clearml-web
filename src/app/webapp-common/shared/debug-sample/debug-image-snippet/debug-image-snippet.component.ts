import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {Store} from '@ngrx/store';
import {tap} from 'rxjs/operators';
import {IsAudioPipe} from '../../pipes/is-audio.pipe';
import {IsVideoPipe} from '../../pipes/is-video.pipe';
import {addMessage} from '@common/core/actions/layout.actions';
import {MESSAGES_SEVERITY, ThemeEnum} from '@common/constants';
import {isHtmlPage} from '@common/shared/utils/is-html-page';
import {isTextFileURL} from '@common/shared/utils/is-text-file';
import {getSignedUrlOrOrigin$} from '@common/core/reducers/common-auth-reducer';

@Component({
  selector: 'sm-debug-image-snippet',
  templateUrl: './debug-image-snippet.component.html',
  styleUrls: ['./debug-image-snippet.component.scss']
})
export class DebugImageSnippetComponent {
  public type: 'image' | 'player' | 'html';
  public source$: Observable<string>;
  private _frame: any;
  public themeEnum = ThemeEnum;

  @Input() theme: ThemeEnum = ThemeEnum.Light;
  @Input() noHoverEffects: boolean;
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
  @Output() imageClicked = new EventEmitter<{src: string}>();
  @Output() createEmbedCode = new EventEmitter();
  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  isFailed = false;
  isLoading = true;

  constructor(private store: Store<any>) {
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

  iframeLoaded(event) {
    if (event.target.src) {
      this.isLoading = false;
    }
  }
}
