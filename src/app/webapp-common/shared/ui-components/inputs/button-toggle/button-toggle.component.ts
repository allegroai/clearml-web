import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {RippleButtonComponent} from '@common/shared/ui-components/buttons/ripple-button/ripple-button.component';

export interface Option {
  value: any;
  label: string;
  icon?: string;
  ripple?: boolean;
}


@Component({
  selector       : 'sm-button-toggle',
  templateUrl    : './button-toggle.component.html',
  styleUrls      : ['./button-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleComponent {

  public rippleComponent = RippleButtonComponent;
  public formControl = new UntypedFormControl();

  @Input() options: Option[];
  @Input() disabled: boolean;
  @Input() rippleEffect: boolean;

  @Input() set value(value: any) {
    this.formControl.setValue(value);
  }

  @Output() valueChanged = new EventEmitter();
  trackByValue = (index: number, option: Option) => option.value;

}
