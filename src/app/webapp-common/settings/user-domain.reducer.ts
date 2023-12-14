import { createFeatureSelector, createReducer, createSelector, on, ReducerTypes } from '@ngrx/store';

import { User } from '~/business-logic/model/users/user';
import { Group } from '~/business-logic/model/group/group';
import { Company } from '~/business-logic/model/company/company';

import { setUsers, setGroups, setCompanys, setSelected } from './user-domain.actions';

export interface IUser {
  id?: User['id'];
  role?: User['role'];
  name?: User['name'];
  given_name?: User['given_name'];
  family_name?: User['family_name'];
  created?: User['created'];
  last_update?: User['created'];
  company?: User['company'];
  status?: User['status'];
  email?: User['email'];
}

export interface IGroup {
  id?: Group['id'];
  description?: Group['description'];
  name?: Group['name'];
  created?: Group['created'];
  last_update?: Group['last_update'];
}

export interface ICompany {
  id?: Company['id'];
  description?: Company['description'];
  name?: Company['name'];
  created?: Company['created'];
  last_update?: Company['last_update'];
}

export interface UserPageState {
  listUsers: Array<IUser>;
  listGroups: Array<IGroup>;
  listCompanys: Array<ICompany>;
  selectedData: any;
}

// Todo remove selectedProjectId
export const userInitState: UserPageState = {
  listUsers: [],
  listGroups: [],
  listCompanys: [],
  selectedData: {},
};

export const userDashboardReducers = [
  on(setUsers, (state, action) => ({ ...state, listUsers: action.users })),
  on(setGroups, (state, action) => ({ ...state, listGroups: action.groups })),
  on(setCompanys, (state, action) => ({ ...state, listCompanys: action.companys })),
  on(setSelected, (state, action) => ({ ...state, selectedData: action.data })),
] as ReducerTypes<UserPageState, any>[];

export const userDashboardReducer = createReducer(
  userInitState,
  ...userDashboardReducers
);

export const selectUserDashboard = createFeatureSelector<UserPageState>('userpage');
export const selectUsers = createSelector(selectUserDashboard, (state: UserPageState): Array<IUser> => state ? state.listUsers : []);
export const selectGroups = createSelector(selectUserDashboard, (state: UserPageState): Array<IGroup> => state ? state.listGroups : []);
export const selectCompanys = createSelector(selectUserDashboard, (state: UserPageState): Array<ICompany> => state ? state.listCompanys : []);
export const selectSelectedData = createSelector(selectUserDashboard, (state: UserPageState): any => state ? state.selectedData : {});
