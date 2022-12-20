import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {last} from 'lodash/fp';
import {ClipboardModule} from 'ngx-clipboard';
import {Store} from '@ngrx/store';
import {addMessage} from '@common/core/actions/layout.actions';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {MESSAGES_SEVERITY, ThemeEnum} from '@common/constants';

@Component({
  selector: 'sm-snippet-error',
  templateUrl: './snippet-error.component.html',
  styleUrls: ['./snippet-error.component.scss'],
  imports: [
    ClipboardModule,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective,
    NgIf
  ],
  standalone: true
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
