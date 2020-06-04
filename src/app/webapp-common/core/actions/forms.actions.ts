import {ISmAction} from '../models/actions';
import {FORMS_ACTIONS} from '../../../app.constants';

export class SetFormData implements ISmAction {
  type = FORMS_ACTIONS.SET_FORM_DATA;
  payload: {path: string, formData: any};

  constructor(path: string, formData: any) {
    this.payload = {path, formData};
  }
}

export class SetFormStatus implements ISmAction {
  type = FORMS_ACTIONS.SET_FORM_STATUS;
  payload: {path: string, formStatus: string};

  constructor(path: string, formStatus: string) {
    this.payload = {path, formStatus};
  }
}

export class SetFormSubmitted implements ISmAction {
  type = FORMS_ACTIONS.SET_FORM_SUBMITTED;
  payload: {path: string};

  constructor(path: string) {
    this.payload = {path};
  }
}
