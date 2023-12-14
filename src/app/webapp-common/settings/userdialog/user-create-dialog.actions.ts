import { ISmAction } from '../../core/models/actions';
import { User } from '~/business-logic/model/users/user';
import { UsersUpdateRequest } from '~/business-logic/model/users/usersUpdateRequest';
import { UsersCreateRequest } from '~/business-logic/model/users/usersCreateRequest';
import { UsersDeleteRequest } from '~/business-logic/model/users/usersDeleteRequest';
import { UsersGetByIdRequest } from '~/business-logic/model/users/usersGetByIdRequest';
import { GroupUpdateRequest } from '~/business-logic/model/group/groupUpdateRequest';
import { GroupCreateRequest } from '~/business-logic/model/group/groupCreateRequest';
import { CompanyCreateRequest } from '~/business-logic/model/company/companyCreateRequest';
import { CompanyUpdateRequest } from '~/business-logic/model/company/companyUpdateRequest';


const CREATE_USER_DIALOG_PREFIX = 'CREATE_USER_DIALOG_';

export const CREATE_USER_ACTIONS = {
  GET_USER: CREATE_USER_DIALOG_PREFIX + 'GET_USER',
  SET_USER: CREATE_USER_DIALOG_PREFIX + 'SET_USER',
  RESET_USER: CREATE_USER_DIALOG_PREFIX + 'RESET_USER',
  CREATE_NEW_USER: CREATE_USER_DIALOG_PREFIX + 'CREATE_NEW_USER',
  UPDATE_USER: CREATE_USER_DIALOG_PREFIX + 'UPDATE_USER',
  CREATE_NEW_GROUP: CREATE_USER_DIALOG_PREFIX + 'CREATE_NEW_GROUP',
  UPDATE_GROUP: CREATE_USER_DIALOG_PREFIX + 'UPDATE_GROUP',
  CREATE_NEW_COMPANY: CREATE_USER_DIALOG_PREFIX + 'CREATE_NEW_COMPANY',
  UPDATE_COMPANY: CREATE_USER_DIALOG_PREFIX + 'UPDATE_COMPANY',
  DELETE_USER: CREATE_USER_DIALOG_PREFIX + 'DELETE_USER',
};


export class GetUser implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.GET_USER;

  constructor(public payload: UsersGetByIdRequest) {
  }
}

export class SetUser implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.SET_USER;
  public payload: { user: User };

  constructor(user: User) {
    this.payload = { user };
  }
}

export class ResetUser implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.RESET_USER;

  constructor() {
  }
}

export class CreateNewUser implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.CREATE_NEW_USER;

  constructor(public payload: UsersCreateRequest) {
  }
}

export class UpdateUser implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.UPDATE_USER;

  constructor(public payload: UsersUpdateRequest) {
  }
}

export class DeleteUser implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.DELETE_USER;

  constructor(public payload: UsersDeleteRequest) {
  }
}


export class CreateNewGroup implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.CREATE_NEW_GROUP;

  constructor(public payload: GroupCreateRequest) {
  }
}

export class UpdateGroup implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.UPDATE_GROUP;

  constructor(public payload: GroupUpdateRequest) {
  }
}

export class CreateNewCompany implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.CREATE_NEW_COMPANY;

  constructor(public payload: CompanyCreateRequest) {
  }
}

export class UpdateCompany implements ISmAction {
  readonly type = CREATE_USER_ACTIONS.UPDATE_COMPANY;

  constructor(public payload: CompanyUpdateRequest) {
  }
}
