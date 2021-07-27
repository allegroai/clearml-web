import {ActionReducer, Action} from '@ngrx/store';
import {merge, pick} from 'lodash/fp';
import {userPreferences} from '../../user-preferences';
import {setPreferences} from '../actions/users.actions';

const firstRun = {};

export function createLocalStorageReducer(key: string, syncedKeys: string[], actionsPrefix?: string[]): (reducer: ActionReducer<any, Action>) => ActionReducer<any, Action> {

  if (firstRun[key] === undefined) {
    firstRun[key] = true;
  }
  let timeout: number;

  return function (reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state, action): any {
      let nextState = reducer(state, action);

      if (firstRun[key] && userPreferences.isReady()) {
        firstRun[key]         = false;
        const savedState = userPreferences.getPreferences(key);
        nextState        = merge(nextState, savedState);
      }
      if (action.type === setPreferences.type) {
        const savedState = (action as ReturnType<typeof setPreferences>).payload[key];
        nextState        = merge(nextState, savedState);
      }

      // filter unchanged state.
      if (state === nextState) {
        return nextState;
      }

      if (actionsPrefix &&
        !actionsPrefix.some(ap => action.type.startsWith(ap))) {
        return nextState;
      }

      const val = pick(syncedKeys, nextState);
      clearTimeout(timeout);
      timeout = window.setTimeout(() => userPreferences.setPreferences(key, val), 2000);
      return nextState;
    };
  };
}
