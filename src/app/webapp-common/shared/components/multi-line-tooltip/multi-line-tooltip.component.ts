import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatMenuModule, MenuPositionY} from '@angular/material/menu';
import {HesitateDirective} from '@common/shared/ui-components/directives/hesitate.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-multi-line-tooltip',
  templateUrl: `./multi-line-tooltip.component.html`,
  styleUrls: ['./multi-line-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenuModule,
    HesitateDirective,
    ClickStopPropagationDirective
  ],
})
export class MultiLineTooltipComponent {
  @Input() infoData: any;
  @Input() iconClass: string;
  @Input() position: MenuPositionY = 'below';
}
