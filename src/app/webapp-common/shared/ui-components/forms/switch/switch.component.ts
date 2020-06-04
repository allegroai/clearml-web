import {Component, Input} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';
import {MatSlideToggleChange} from '@angular/material/slide-toggle/slide-toggle';

@Component({
  selector: 'sm-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent extends ImmutableFormField {

  @Input() disableRipple: boolean;

  fieldValueChanged($event: MatSlideToggleChange) {
    super.fieldValueChanged($event.checked);
  }

}
