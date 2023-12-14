
import {createAction, props} from '@ngrx/store';
import { ICompany, IGroup, IUser } from './user-domain.reducer';


export const DASHBOARD_PREFIX = 'USER_PAGE_';

export const getUsers = createAction(DASHBOARD_PREFIX + '[get user lists]');
export const getGroups = createAction(DASHBOARD_PREFIX + '[get group lists]');
export const getCompanys = createAction(DASHBOARD_PREFIX + '[get company lists]');

export const delUser = createAction(DASHBOARD_PREFIX + '[delete user]',
 props<{user: IUser}>()
);
export const delGroup = createAction(DASHBOARD_PREFIX + '[delete group]',
 props<{group: IGroup}>()
);
export const delCompany = createAction(DASHBOARD_PREFIX + '[delete company]',
 props<{company: ICompany}>()
);

export const setUsers = createAction(
  DASHBOARD_PREFIX + '[set user lists]',
  props<{users: IUser[]}>()
);

export const setGroups = createAction(
  DASHBOARD_PREFIX + '[set group lists]',
  props<{groups: IGroup[]}>()
);

export const setCompanys = createAction(
  DASHBOARD_PREFIX + '[set company lists]',
  props<{companys: ICompany[]}>()
);
export const setSelected = createAction(
  DASHBOARD_PREFIX + '[set selected data]',
  props<{data: any}>()
);
