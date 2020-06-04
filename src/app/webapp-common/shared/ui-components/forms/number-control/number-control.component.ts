import {Component, Input} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';

@Component({
  selector   : 'sm-number-control',
  templateUrl: './number-control.component.html',
  styleUrls  : ['./number-control.component.scss']
})
export class NumberControlComponent extends ImmutableFormField {

  @Input() min: number;
  @Input() max: number;
  @Input() maxLength: number;
  @Input() step: number;
  @Input() header: string;
  @Input() disabled: boolean;

  fieldValueChanged(event) {
    this.checkValidity(event.target.value);
    super.fieldValueChanged(event.target.value ? Number(event.target.value) : null);
  }

  beforeValueChanged(e) {
    if (!Number.isInteger(Number(e.key))) {
      return;
    }
    if (this.maxLength && e.target.value && e.target.value.length + 1 > Number(this.maxLength)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}
