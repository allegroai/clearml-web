import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {addMessage} from '../../../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../../../app.constants';
import {Store} from '@ngrx/store';
import {ThemeEnum} from '../../../../experiments/shared/common-experiments.const';
import { last } from 'lodash/fp';

@Component({
  selector   : 'sm-snippet-error',
  templateUrl: './snippet-error.component.html',
  styleUrls  : ['./snippet-error.component.scss']
})


export class SnippetErrorComponent implements OnInit {


  constructor(private store: Store<any>) {
  }

  @Output() openImageClicked = new EventEmitter();
  private _copyContent: string;
  public baseFile: string;
  @Input() set copyContent(content: string) {
    this._copyContent = content;
    this.baseFile = last(content?.split('/') || '');
  }
  get copyContent() {
    return this._copyContent;
  }

  @Input() theme: ThemeEnum = ThemeEnum.Dark;
  public ThemeEnum           = ThemeEnum;

  ngOnInit() {
  }

  copyToClipboardSuccess(success: boolean) {
    this.store.dispatch(addMessage(success ? MESSAGES_SEVERITY.SUCCESS : MESSAGES_SEVERITY.ERROR, success ? 'Path copied to clipboard' : 'No path to copy'));
  }

}
