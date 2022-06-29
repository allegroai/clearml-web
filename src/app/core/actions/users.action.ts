import {createAction, props} from '@ngrx/store';
import {USERS_PREFIX} from '~/app.constants';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';

export const setCurrentUser = createAction(USERS_PREFIX + 'SET_CURRENT_USER',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  props<{user: GetCurrentUserResponseUserObject; terms_of_use?: any; getting_started?: any}>()
);
