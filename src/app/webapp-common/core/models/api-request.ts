import {Action} from '@ngrx/store';

export interface IApiRequest {
  payload?: any;
  meta: IApiRequestMeta;
  params?: object;
}

export interface SmHttpResponse {
  data: any;
  meta: any;
}

export interface IApiRequestAction extends IApiRequest, Action {
  payload?: any;
  meta: IApiRequestMetaAction;
  params?: object;
}
export interface IApiRequestMeta {
  method: string;
  endpoint: string;
}

export interface IApiRequestMetaAction extends IApiRequestMeta{
  dontCancel?: boolean;
  success?: string; // The action that will be fired after the api request succeed.
  error?: string; // The action that will be fired after the api request failed.
  successMessage?: string;
  errorMessage?: string;
  loading?: boolean;
  force?: boolean;
}

export interface IApiSuccessMeta extends IApiRequestMetaAction {
  _params?: object;
  _payload?: any;
}

export interface IApiSuccessAction extends Action {
  payload: any;
  meta?: IApiSuccessMeta;
  params?: object;
}

export interface IApiErrorAction extends Action {
  payload: any;
  meta?: IApiRequestMetaAction;
}

export interface IApiCancelAction extends Action {
  meta?: IApiRequestMetaAction;
}
