import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';
import {IOption} from '../../inputs/select-autocomplete/select-autocomplete.component';

@Component({
  selector: 'sm-select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// TODO: rename to control.
export class SelectGroupComponent extends ImmutableFormField implements OnInit {

  @Input() options: Array<IOption>;
  // _registerForm(formData) {
  //   super._registerForm(formData);
  //   this.valueChange.emit(formData);
  // }

  getSelectedOption(): IOption {
    return this.options.find(option => option.value === this.formData);
  }

}
