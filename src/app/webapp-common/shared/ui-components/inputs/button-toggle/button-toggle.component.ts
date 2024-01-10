import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ReactiveFormsModule, UntypedFormControl} from '@angular/forms';
import {RippleButtonComponent} from '@common/shared/ui-components/buttons/ripple-button/ripple-button.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NgForOf, NgIf} from '@angular/common';
import {AppendComponentOnTopElementDirective} from '@common/shared/directive/append-component-on-top-element.directive';

export interface Option {
  value: any;
  label: string;
  icon?: string;
  ripple?: boolean;
}


@Component({
  selector: 'sm-button-toggle',
  templateUrl: './button-toggle.component.html',
  styleUrls: ['./button-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonToggleModule,
    TooltipDirective,
    NgForOf,
    ReactiveFormsModule,
    AppendComponentOnTopElementDirective,
    NgIf
  ]
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
