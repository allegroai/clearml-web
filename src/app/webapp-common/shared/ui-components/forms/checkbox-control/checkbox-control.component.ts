import {ChangeDetectionStrategy, Component, Input, AfterViewInit, ChangeDetectorRef, HostListener} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';
import {isString} from 'lodash-es';
import {TableSelectionState} from '@common/constants';
import {NgIf} from '@angular/common';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@Component({
  selector: 'sm-checkbox-control',
  templateUrl: './checkbox-control.component.html',
  styleUrls: ['./checkbox-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipDirective,
    NgIf,
    ShowTooltipIfEllipsisDirective
  ],
  standalone: true
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

  @HostListener('mousedown', ['$event'])
  @HostListener('selectstart', ['$event'])
  stopPropagation(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  hostClicked(event: Event) {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (!this.isReadonly) {
      this.fieldValueChanged(!this.formData, event);
    }
  }

  override formDataUpdated() {
    if (!isString(this.formData)) {
      this.state = this.formData === true ? 'All' : 'None';
    } else {
      this.state = this.formData as TableSelectionState;
    }
    this.cdr.detectChanges();
  }
}
