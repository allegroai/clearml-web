import {Action} from '@ngrx/store';

export const EXPERIMENTS_COMPARE_DEBUG_IMAGES_ = 'EXPERIMENTS_COMPARE_DEBUG_IMAGES_';

export const SET_SOMETHING = EXPERIMENTS_COMPARE_DEBUG_IMAGES_ + 'SET_SOMETHING';


export class SetSomething implements Action {
  readonly type = SET_SOMETHING;
}
