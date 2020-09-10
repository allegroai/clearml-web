import {Component, Input, ViewChild} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ImmutableFormField} from '../../../shared/ui-components/forms/immutableFormField';
import {TextareaControlComponent} from '../../../shared/ui-components/forms/textarea-control/textarea-control.component';

@Component({
  selector   : 'sm-experiment-network-design-form',
  templateUrl: './experiment-network-design-form.component.html',
  styleUrls  : ['./experiment-network-design-form.component.scss'],
})
export class ExperimentNetworkDesignFormComponent extends ImmutableFormField {

  @ViewChild('textarearef', {static: true}) textarea: TextareaControlComponent;
  private _editable: boolean;
  public lines: string;

  @Input() set editable(isEditable: boolean) {
    if (isEditable != this._editable) {
      this._editable = isEditable;
    }
  }

  get editable() {
    return this._editable;
  }

  @Input() set formData(formData) {
    this._formData = formData
    this.lines = this._formData ? this._formData.split('\n') : [];
  }

  get formData() {
    return this._formData;
  }

  public Object = Object;

  constructor() {
    super();
    // this.validators    = [this.jsonValidator];
    // this.errorMessages = <any> {'required': 'Required field', 'json': 'Not a valid json'};
  }

  jsonValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
    } catch (e) {
      return {json: true};
    }
    return null;
  };

}



