import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DynamicFormControlBase} from '../dynamic-form-control.base';

@Component({
  selector: 'sm-dynamic-input',
  templateUrl: './dynamic-input.component.html',
  styleUrls: ['./dynamic-input.component.scss']
})
// TODO: deprecated.
export class DynamicInputComponent extends DynamicFormControlBase<string> {
  @Input() controlName;
  @Output() change = new EventEmitter();
}
