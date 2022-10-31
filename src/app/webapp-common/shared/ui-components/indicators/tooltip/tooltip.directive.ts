import {Directive, Input} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';

export type TooltipTypeEnum = 'help' | 'validation' | 'error';

@Directive({
  selector: '[smTooltip]',
})
export class TooltipDirective extends MatTooltip {

  @Input() set smTooltip(message) {
    this.tooltipClass = `sm-tooltip ${this.tooltipType} ${this.customClass}`;
    this.message = message;
  }

  @Input() tooltipType: TooltipTypeEnum = 'help';
  @Input() customClass: string;

  @Input() set showTooltip(show) {
    show && this.show();
  }
}
