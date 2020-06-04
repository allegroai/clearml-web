import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {InputControlBase} from '../input-control.base';
import {DynamicFormControlBase} from '../dynamic-form-control.base';
import {ImmutableFormField} from '../immutableFormField';

@Component({
  selector       : 'sm-input-group',
  templateUrl    : './input-group.component.html',
  styleUrls      : ['./input-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// TODO: rename to control.
export class InputGroupComponent extends ImmutableFormField implements OnInit {

  @Input() autofocus = false;

  constructor() {
    super();
  }

}


