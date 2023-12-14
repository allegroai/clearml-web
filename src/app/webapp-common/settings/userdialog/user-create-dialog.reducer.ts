import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CREATE_USER_ACTIONS } from './user-create-dialog.actions';
import { User } from '~/business-logic/model/users/user';
import { Group } from '~/business-logic/model/group/group';
import { Company } from '~/business-logic/model/company/company';

export type CreationRoleEnum = 'system' | 'root' | 'user';
export const CREATION_ROLE_STATUS = {
  SYSTEM: 'system' as CreationRoleEnum,
  ROOT: 'root' as CreationRoleEnum,
  USER: 'user' as CreationRoleEnum,
};

export interface ICreateUserDialog {
  user: User;
  group: Group;
  company: Company;
}

const createUserInitState: ICreateUserDialog = {
  user: {},
  group: {},
  company: {},
};

export const selectCreateUserDialog = createFeatureSelector<ICreateUserDialog>('userCreateDialog');
export const selectUser = createSelector(selectCreateUserDialog, (state): User => state.user);

export function userCreateDialogReducer<ActionReducer>(state: ICreateUserDialog = createUserInitState, action): ICreateUserDialog {
  switch (action.type) {
    case CREATE_USER_ACTIONS.CREATE_NEW_USER:
      return { ...state, user: action.payload };
    case CREATE_USER_ACTIONS.UPDATE_USER:
      return { ...state, user: action.payload };
    case CREATE_USER_ACTIONS.CREATE_NEW_GROUP:
      return { ...state, group: action.payload };
    case CREATE_USER_ACTIONS.UPDATE_GROUP:
      return { ...state, group: action.payload };
    case CREATE_USER_ACTIONS.CREATE_NEW_COMPANY:
      return { ...state, company: action.payload };
    case CREATE_USER_ACTIONS.UPDATE_COMPANY:
      return { ...state, company: action.payload };
    case CREATE_USER_ACTIONS.DELETE_USER:
      return { ...createUserInitState };
    case CREATE_USER_ACTIONS.GET_USER:
      return { ...state, user: action.payload };
    case CREATE_USER_ACTIONS.RESET_USER:
      return { ...createUserInitState };
    default:
      return state;
  }
}
