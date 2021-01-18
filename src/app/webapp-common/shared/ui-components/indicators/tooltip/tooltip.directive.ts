import {Directive, Input} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip, MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {TooltipPosition} from "@angular/material/tooltip/tooltip";

export type TooltipTypeEnum = 'help' | 'validation' | 'error';

@Directive({
  selector: '[smTooltip]',
  providers: [
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {position: 'after'} as MatTooltipDefaultOptions
    }
  ]
})
export class TooltipDirective extends MatTooltip {

  public readonly TOOLTIP_TYPE = {
    HELP: 'help' as TooltipTypeEnum,
    VALIDATION: 'validation' as TooltipTypeEnum,
    ERROR: 'error' as TooltipTypeEnum,
  };

  @Input() set smTooltip(message) {
    this.tooltipClass = `sm-tooltip ${this.tooltipType} ${this.customClass}`;
    this.message = message;
  }

  @Input() tooltipType: TooltipTypeEnum = 'help';
  @Input() customClass: string;

  @Input() set showTooltip(show) {
    show && this.show();
  }

  @Input() showDelay = 0;

}
