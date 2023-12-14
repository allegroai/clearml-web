import {Action} from '@ngrx/store';

export interface ISmAction extends Action {
  payload?: any;
  meta?: ISmActionMeta; // deprecated
}

export interface ISmActionMeta {
  loading?: boolean;
}
