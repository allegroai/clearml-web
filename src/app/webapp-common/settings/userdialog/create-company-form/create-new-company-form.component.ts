import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import { Company } from '~/business-logic/model/company/company';

@Component({
  selector   : 'sm-create-new-company-form',
  templateUrl: './create-new-company-form.component.html',
  styleUrls  : ['./create-new-company-form.component.scss']
})
export class CreateNewCompanyFormComponent {


  private _company = {
    id: '',
    name: '',
    description: '',
  };

  // use getter setter to define the property
  get company(): any {
    return this._company;
  }

  @Input()
  set company(val: any) {
    console.log('previous item = ', this._company);
    console.log('currently selected item=', val);
    if (val) {
      this._company = {
        id:  val['id'],
        name: val['name'],
        description:  val['description']
      }
    }
  }

  @Input() editMode: boolean;


  @Output() companyCreated = new EventEmitter();
  @ViewChild('companyForm', {static: true}) companyForm: NgForm;


  send() {
    if (this.companyForm.valid) {
      this.companyCreated.emit(this._company);
    } else {
      this.companyForm.onSubmit(null);
    }
  }
}
