import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sm-multi-line-tooltip',
  templateUrl: `./multi-line-tooltip.component.html`,
  styleUrls: ['./multi-line-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiLineTooltipComponent {
  @Input() infoData: any;

  constructor() {
  }
}
