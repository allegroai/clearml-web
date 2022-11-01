import {Component, EventEmitter, Input, Output} from '@angular/core';
import {addMessage} from '@common/core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '~/app.constants';
import {Store} from '@ngrx/store';
import {ThemeEnum} from '@common/experiments/shared/common-experiments.const';
import {last} from 'lodash/fp';

@Component({
  selector   : 'sm-snippet-error',
  templateUrl: './snippet-error.component.html',
  styleUrls  : ['./snippet-error.component.scss'],
  // Can't onPush - too many calc in template
})
export class SnippetErrorComponent {
  private _copyContent: string;
  public baseFile: string;
  public floor = Math.floor;
  public min = Math.min;
  public missingSource: boolean = false;

  constructor(private store: Store<any>) {}

  @Output() openImageClicked = new EventEmitter();
  @Input() set copyContent(content: string) {
    this.missingSource = !content;
    this._copyContent = content;
    this.baseFile = last(content?.split('/') || '');
  }
  get copyContent() {
    return this._copyContent;
  }

  @Input() theme: ThemeEnum = ThemeEnum.Dark;
  @Input() height: number = 100;

  public themeEnum           = ThemeEnum;

  copyToClipboardSuccess(success: boolean) {
    this.store.dispatch(addMessage(success ? MESSAGES_SEVERITY.SUCCESS : MESSAGES_SEVERITY.ERROR, success ? 'Path copied to clipboard' : 'No path to copy'));
  }

}
