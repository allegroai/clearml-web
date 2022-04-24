import {ChangeDetectionStrategy, Component, Input, AfterViewInit, ChangeDetectorRef, HostListener} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';
import {isString} from 'lodash/fp';
import {TableSelectionState} from '@common/constants';

@Component({
  selector: 'sm-checkbox-control',
  templateUrl: './checkbox-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxControlComponent extends ImmutableFormField implements AfterViewInit {

  public state: TableSelectionState = null;

  @Input() label: string;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.inputClassName = '';
  }

  ngAfterViewInit() {
    this.formDataUpdated();
  }

  @HostListener('click', ['$event'])
  fieldValueChanged(event) {
    if (this.disabled) {
      return;
    }
    event.stopPropagation();

    if (!this.isReadonly) {
      super.fieldValueChanged(!this.formData, event);
    }
    // this.formDataChanged.emit({field: this.fieldName, value: !this.formData});
  }

  formDataUpdated() {
    if (!isString(this.formData)) {
      this.state = this.formData === true ? 'All' : 'None';
    } else {
      this.state = <TableSelectionState>this.formData;
    }
    this.cdr.detectChanges();
  }
}
