import {EventEmitter} from '@angular/core';

export type FormDataChangedEvent = {field: string, value: any};

export interface ImmutableForm {
  formData: any;
  errors: any; // Map<string, boolean>;
  fieldName: string;
  formDataChanged: EventEmitter<FormDataChangedEvent>;
  errorsChanged: EventEmitter<{field: string, errors: any}>;
}
