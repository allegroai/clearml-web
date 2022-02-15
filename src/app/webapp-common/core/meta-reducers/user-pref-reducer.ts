import {ActionReducer, Action} from '@ngrx/store';
import {merge, pick} from 'lodash/fp';
import {setPreferences} from '../actions/users.actions';
import {UserPreferences} from '@common/user-preferences';

const firstRun = {};

export function createUserPrefReducer(
  key: string,
  syncedKeys: string[],
  actionsPrefix: string[],
  userPreferences: UserPreferences,
  reducer: ActionReducer<any>
): ActionReducer<any, Action> {

  if (firstRun[key] === undefined) {
    firstRun[key] = true;
  }
  let timeout: number;

  return function (state, action): any {
    let nextState = reducer(state, action);

    if (firstRun[key] && userPreferences.isReady() && nextState[key]) {
      firstRun[key]         = false;
      const savedState = userPreferences.getPreferences(key);
      return merge(nextState, {[key]: {...savedState, preferencesReady: true}});
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

    const val = pick(syncedKeys, nextState[key]);
    clearTimeout(timeout);
    timeout = window.setTimeout(() => userPreferences.setPreferences(key, val), 2000);
    return nextState;
  };
}
