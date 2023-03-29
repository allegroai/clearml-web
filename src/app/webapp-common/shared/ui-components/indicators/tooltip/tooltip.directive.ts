import {Directive, Input} from '@angular/core';
import {MatLegacyTooltip as MatTooltip} from '@angular/material/legacy-tooltip';
import {MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY as MAT_TOOLTIP_SCROLL_STRATEGY} from '@angular/material/legacy-tooltip';
import {scrollFactory} from '@common/shared/utils/scroll-factory';
import {Overlay} from '@angular/cdk/overlay';

export type TooltipTypeEnum = 'help' | 'validation' | 'error';

@Directive({
  selector: '[smTooltip]',
  providers: [{ provide: MAT_TOOLTIP_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay] },],
  standalone: true
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
