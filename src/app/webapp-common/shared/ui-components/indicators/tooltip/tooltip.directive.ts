import {Directive, Input, OnInit} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import {TooltipPosition} from '@angular/material/tooltip';

export type TooltipTypeEnum = 'help' | 'validation' | 'error';

@Directive({
  selector: '[smTooltip]'
})


export class TooltipDirective extends MatTooltip {

  public readonly TOOLTIP_TYPE = {
    HELP      : 'help' as TooltipTypeEnum,
    VALIDATION: 'validation' as TooltipTypeEnum,
    ERROR     : 'error' as TooltipTypeEnum,
  };

  @Input() set smTooltip(message) {
    this.tooltipClass = `sm-tooltip ${this.tooltipType} ${this.customClass}`;
    this.message = message;
  }

  @Input() tooltipType: TooltipTypeEnum = 'help';
  @Input() position: TooltipPosition    = 'above';
  @Input() customClass: string;

  @Input() set showTooltip(show) {
    show && this.show();
  }

  @Input() showDelay = 0;
}
