import {createAction, props} from '@ngrx/store';
import {USERS_PREFIX} from '../../app.constants';
import {GetCurrentUserResponseUserObject} from '../../business-logic/model/users/getCurrentUserResponseUserObject';

export const setCurrentUser = createAction(USERS_PREFIX + 'SET_CURRENT_USER',
  props<{user: GetCurrentUserResponseUserObject; terms_of_use?: any}>()
);
