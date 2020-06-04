import { EventEmitter, Input, OnDestroy, OnInit, Output, Directive } from '@angular/core';
import {ImmutableForm} from './immutableForm.model';
import {get, isEmpty, omit, cloneDeep} from 'lodash/fp';
import {Subject} from 'rxjs';
import {debounceTime, filter, mapTo, tap} from 'rxjs/operators';

@Directive()
export class ImmutableFormContainer implements OnInit, OnDestroy, ImmutableForm {

  @Input() formData: any;
  @Input() fieldName: string;
  @Input() errors;
  @Input() validators: any;
  @Input() errorMessages: any;
  @Input() showErrors: boolean;

  @Output() formDataChanged      = new EventEmitter<{ field: string, value: any }>();
  @Output() errorsChanged        = new EventEmitter<{ field: string, errors: any }>();
  @Output() saveFormData         = new EventEmitter();
  @Output() cancelFormDataChange = new EventEmitter();
  @Output() activateEdit         = new EventEmitter();


  errorsChanged$ = new Subject();

  ngOnInit() {
    // if (!this.fieldName) {
    //   console.error('please specify field name');
    // }
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
          errors = this.calcNewErrors(errors, errEvent);
        });
        this.errorsChanged.emit({field: this.fieldName, errors: errors});
      });
  }

  ngOnDestroy() {
    this.errorsChanged$.unsubscribe();
  }

  fieldValueChanged(event: { field: string; value: any }) {
    this.formDataChanged.emit({field: this.fieldName, value: {...cloneDeep(this.formData), [event.field]: event.value}});
  }

  fieldErrorChanged(event: { field: string; errors: any }) {
    this.errorsChanged$.next(event);
  }

  getFieldErrors(field: string) {
    return get(field, this.errors);
  }

  calcNewErrors(errors, newErrors) {
    const err = this.updateErrorRow(errors, newErrors);

    return isEmpty(err) ? null : err;
  }

  updateErrorRow(errorRow, errorEvent) {
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

}
