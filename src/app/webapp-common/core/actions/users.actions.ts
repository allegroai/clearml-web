import {Action} from '@ngrx/store';
import {USERS_ACTIONS} from '../../../app.constants';
import {User} from '../../../business-logic/model/users/user';


export class FetchCurrentUser implements Action {
  type = USERS_ACTIONS.FETCH_CURRENT_USER;

}

export class SetCurrentUser implements Action {
  type = USERS_ACTIONS.SET_CURRENT_USER;

  constructor(public payload: User) {}
}

export class Logout implements Action {
  type = USERS_ACTIONS.LOGOUT;
}

export class SetPreferences implements Action {
  type = USERS_ACTIONS.SET_PREF;

  constructor(public payload) {}
}
