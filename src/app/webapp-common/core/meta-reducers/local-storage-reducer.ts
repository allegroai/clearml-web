import {ActionReducer, Action} from '@ngrx/store';
import {merge, pick} from 'lodash/fp';
import {userPreferences} from '../../user-preferences';
import {USERS_ACTIONS} from '../../../app.constants';
import {SetPreferences} from '../actions/users.actions';

export function createLocalStorageReducer(key: string, syncedKeys: string[], actionsPrefix?: string[]): (reducer: ActionReducer<any, Action>) => ActionReducer<any, Action> {

  let firstRun = true;
  let timeout: number;

  return function (reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state, action): any {
      let nextState = reducer(state, action);

      if (firstRun && userPreferences.isReady()) {
        firstRun         = false;
        const savedState = userPreferences.getPreferences(key);
        nextState        = merge(nextState, savedState);
      }
      if (action.type === USERS_ACTIONS.SET_PREF) {
        const savedState = (action as SetPreferences).payload[key];
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
