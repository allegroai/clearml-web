import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Company } from '~/business-logic/model/company/company';

@Component({
  selector: 'sm-create-new-user-form',
  templateUrl: './create-new-user-form.component.html',
  styleUrls: ['./create-new-user-form.component.scss']
})
export class CreateNewUserFormComponent {
  private _user = {
    name: '',
    email: '',
    role: '',
    password: '',
    id: '',
    company: '',
    group: ''
  };

  // use getter setter to define the property
  get user(): any {
    return this._user;
  }

  @Input()
  set user(val: any) {
    if (val) {
      this._user = {
        name: val['name'],
        email: val['email'],
        role: val['role'],
        password: val['password'],
        id: val['id'],
        company: val['company'],
        group: val['group']
      };
    }
  }

  @Input() editMode: boolean;
  @Input() companys: Company[];

  @Output() userCreated = new EventEmitter();
  @ViewChild('userForm', { static: true }) userForm: NgForm;

  send() {
    if (this.userForm.valid) {
      this.userCreated.emit(this._user);
    } else {
      this.userForm.onSubmit(null);
    }
  }
}
