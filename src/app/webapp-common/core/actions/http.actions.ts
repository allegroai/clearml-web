import {HTTP_ACTIONS} from '../../../app.constants';
import {ISmAction} from '../models/actions';
import {omit} from 'lodash/fp';
import {HttpErrorResponse} from '@angular/common/http';

export class RequestFailed implements ISmAction {
  public type = HTTP_ACTIONS.REQUEST_FAILED;
  public payload: { err: any };

  constructor(err: HttpErrorResponse) {
    this.payload = { err: omit(['headers'], err) };
  }
}

