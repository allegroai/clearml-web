import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup, Validators,
} from '@angular/forms';
import {Observable, of, timer} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

export function ValidateEmail(mail) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail);
}

export function splitTextArea(value: string): string[] {
  return value
    .replace(/(,|;|\|)/g, ' ')
    .split(/\s+/g)
    .filter( x => !!x);
}
export function checkValidEmails(numberAvailableEmails: number): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
    if (control.value === null || control.value === '') {
      return of(null);
    }
    else {
      return timer(1000).pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap(() => {
          const values = splitTextArea(control.value)
          if (values.length > numberAvailableEmails) {
            return of({
              numberAvailableEmails: {value: numberAvailableEmails}
            });
          }
          const allEmails = values.every( ValidateEmail);
          if (!allEmails) {
            return of({
              emailsValidator: {value: 'emails'}
            });
          }
          return of(null);
        })
      );
    }
  };
}

@Component({
  selector: 'sm-user-management-dialog',
  templateUrl: './user-management-dialog.component.html',
  styleUrls: ['./user-management-dialog.component.scss']
})
export class UserManagementDialogComponent implements OnInit {

  emailForm = new FormGroup({
    email: new FormControl(
      '',
      [],
      [checkValidEmails(this.data.numberAvailableEmails)]
    )
  });

  constructor(public dialogRef: MatDialogRef<UserManagementDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { numberAvailableEmails: number }) {
  }

  ngOnInit(): void {
  }

  get emailController() {
    return this.emailForm.get('email');
  }
  onInviteHandler(value: string) {
    this.dialogRef.close(splitTextArea(value))
  }
}
