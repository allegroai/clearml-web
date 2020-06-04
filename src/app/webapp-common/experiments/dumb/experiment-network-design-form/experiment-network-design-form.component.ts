import {Component, Input, ViewChild, ElementRef} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {ImmutableFormField} from '../../../shared/ui-components/forms/immutableFormField';
import {TextareaControlComponent} from '../../../shared/ui-components/forms/textarea-control/textarea-control.component';

@Component({
  selector   : 'sm-experiment-network-design-form',
  templateUrl: './experiment-network-design-form.component.html',
  styleUrls  : ['./experiment-network-design-form.component.scss'],
})
export class ExperimentNetworkDesignFormComponent extends ImmutableFormField {

  @ViewChild('textarearef', { static: true }) textarea: TextareaControlComponent;
  private _editable: boolean;

  @Input() set editable( isEditable: boolean) {
    if (isEditable != this._editable) {
      this._editable = isEditable;
      window.setTimeout(() => this.textarea.onResize(), 50);
    }
  }

  get editable() {
    return this._editable;
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
  }

}



