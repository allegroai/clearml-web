import { EventEmitter, Input, OnDestroy, OnInit, Output, Directive } from '@angular/core';
import {ImmutableForm} from './immutableForm.model';
import {Subject} from 'rxjs';
import {isEmpty, omit, flattenDeep} from 'lodash/fp';
import {get} from 'lodash/fp';
import {debounceTime, filter, mapTo, tap} from 'rxjs/operators';
import {FormsTrackBy} from '../../utils/forms-track-by';

export class ImmutableFormArrayContainer extends FormsTrackBy implements OnInit, OnDestroy, ImmutableForm {

  @Input() formData: Array<any>;
  @Input() fieldName: string;
  @Input() errors: Array<any>;

  @Output() formDataChanged = new EventEmitter<{ field: string, value: Array<any> }>();
  @Output() errorsChanged   = new EventEmitter<{ field: string, errors: Array<any> }>();

  errorsChanged$ = new Subject();

  getData() {
    return this.formData;
  }

  ngOnInit() {
    if (!this.fieldName) {
      console.error('please specify field name');
    }

    const events = [];

    this.errorsChanged$
      .pipe(
        tap(event => events.push(event)),
        debounceTime(0),
        mapTo(events),
        filter(errorEvents => errorEvents.length > 0)
      )
      .subscribe(errorEvents => {
        let errors = this.errors;
        errorEvents.forEach((errEvent: any) => {
          errors = this.calcNewErrors(errors, errEvent, errEvent.index);
        });
        this.errorsChanged.emit({field: this.fieldName, errors: errors});
      });
  }

  ngOnDestroy() {
    this.errorsChanged$.unsubscribe();
  }

  fieldValueChanged(event: { field: string, value: any }, index) {
    this.formDataChanged.emit({
      field: this.fieldName,
      value: this.calcNewValue(this.formData, event, index)
    });
  }

  fieldErrorChanged(event: { field: string, errors: any }, index) {
    this.errorsChanged$.next({
      ...event,
      index: index
    });
  }

  addRow(defaultRow) {
    this.formDataChanged.emit({
      field: this.fieldName,
      value: this.formData.concat([{...defaultRow}])
    });
  }

  removeRow(index) {
    this.formDataChanged.emit({
      field: this.fieldName,
      value: this.formData.filter((row, rowIndex) => rowIndex !== index)
    });
    if (this.errors) {
      this.errorsChanged.emit({
        field : this.fieldName,
        errors: this.errors.filter((row, rowIndex) => rowIndex !== index)
      });
    }
  }

  getFieldErrors(field: string, index) {
    return get([index, field], this.errors);
  }

  calcNewValue(formData: Array<any>, event: { field: string, value: any }, index) {
    return formData.map((row, rowIndex) => rowIndex === index ? {...row, [event.field]: event.value} : row);
  }

  calcNewErrors(errors: Array<any>, errorEvent: { field: string, errors: Array<any> }, index) {
    const err = this.formData.map((row, rowIndex) => {
      if (index === rowIndex) {
        return this.updateErrorRow(get(rowIndex, errors), errorEvent);
      }
      return get(rowIndex, errors);
    });

    return this.isArrayEmpty(flattenDeep(err)) ? null : err;
  }

  private updateErrorRow(errorRow, errorEvent: { field: string, errors: Array<any> }) {
    if (errorRow) {
      if (errorEvent.errors) {
        return {...errorRow, [errorEvent.field]: errorEvent.errors};
      }
      return omit(errorEvent.field, errorRow);
    } else {
      if (errorEvent.errors) {
        return {[errorEvent.field]: errorEvent.errors};
      }
      return null;
    }
  }

  isArrayEmpty(arr) {
    const isEmptyArr = arr.filter(row => !isEmpty(row));

    return isEmptyArr.length === 0;
  }

}
