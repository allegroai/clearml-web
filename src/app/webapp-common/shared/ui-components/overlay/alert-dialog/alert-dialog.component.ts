import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {get} from 'lodash/fp';
import {isAnnotationTask} from '../../../utils/shared-utils';

@Component({
  selector   : 'sm-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls  : ['./alert-dialog.component.scss']
})
export class AlertDialogComponent {

  public alertMessage;
  public alertSubMessage;
  public okMessage;
  public moreInfoEntities: string[];
  public isOpen = false;
  private _moreInfo: any;
  private _resultMessage: string;

  set moreInfo(moreInfo) {
    this._moreInfo        = moreInfo;
    this.moreInfoEntities = moreInfo && Object.keys(moreInfo);
  }

  get moreInfo() {
    return this._moreInfo;
  }

  set resultMessage(resultMessage) {
    this._resultMessage = resultMessage;
  }

  get resultMessage() {
    return this._resultMessage;
  }

  constructor(@Inject(MAT_DIALOG_DATA) data: { alertMessage: string, alertSubMessage: string, okMessage: string, moreInfo: any, resultMessage: string }) {
    this.alertMessage    = data.alertMessage || '';
    this.alertSubMessage = data.alertSubMessage;
    this.moreInfo        = data.moreInfo;
    this.okMessage       = data.okMessage || 'OK';
    this.resultMessage   = data.resultMessage;
  }

  openToggle() {
    this.isOpen = !this.isOpen;
  }

  buildUrl(entity, entityName) {
    if (entityName === 'datasets') {
      return `/datasets/${entity.id}`;
    }
    if (entityName === 'tasks' && isAnnotationTask(entity)) {
      return `/annotations?annotationId=${entity.id}`;
    }
    return `/projects/${get('project.id', entity) || '*'}/experiments/${entity.id}`;
  }
}
