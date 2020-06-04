import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';
import {FormControl} from '@angular/forms';
import {IOption} from '../../inputs/select-autocomplete/select-autocomplete.component';
import {Subscription} from 'rxjs';

@Component({
  selector       : 'sm-multi-select-control',
  templateUrl    : './multi-select-control.component.html',
  styleUrls      : ['./multi-select-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectControlComponent extends ImmutableFormField implements OnDestroy {

  @Input() options: Array<IOption>;
  @Input() multiple = true;
  @Input() optionAddable: boolean;
  @Input() header: string;

  @Input() clearable: boolean = true;
  @Input() autofocus: boolean;
  @Input() focusIt: boolean;
  @Input() appendTo: string;


  @Output() customOptionAdded = new EventEmitter<string>();

  formControl = new FormControl();
  private valueSubscription: Subscription;

  constructor() {
    super();
    this.valueSubscription = this.formControl.valueChanges.subscribe((formData) => {
      this.fieldValueChanged(formData);
    });
  }

  formDataUpdated(formData) {
    this.formControl.setValue(formData, {emitEvent: false});
  }

  getSelectedOption(data): IOption {
    return this.options.find(option => option.value === data) || {label: data, value: data};
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.valueSubscription.unsubscribe();
  }

}
