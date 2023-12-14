import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Company } from '~/business-logic/model/company/company';
import { User } from '~/business-logic/model/users/user';

@Component({
  selector: 'sm-create-new-group-form',
  templateUrl: './create-new-group-form.component.html',
  styleUrls: ['./create-new-group-form.component.scss']
})
export class CreateNewGroupFormComponent {
  private _group = {
    id: '',
    name: '',
    company: '',
    users: [],
    description: '',
  };

  // use getter setter to define the property
  get group(): any {
    return this._group;
  }

  @Input()
  set group(val: any) {
    if (val) {
      this._group = {
        id: val['id'],
        name: val['name'],
        company: val['company'],
        users: val['users'],
        description: val['description']
      };
    }
  }
  @Input() editMode: boolean;
  @Input() companys: Company[];
  @Input() users: User[];

  @Output() groupCreated = new EventEmitter();
  @ViewChild('groupForm', { static: true }) groupForm: NgForm;

  send() {
    if (this.groupForm.valid) {
      this.groupCreated.emit(this._group);
    } else {
      this.groupForm.onSubmit(null);
    }
  }
}
