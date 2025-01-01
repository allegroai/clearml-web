import {ChangeDetectionStrategy, Component, input } from '@angular/core';
import {MatMenuModule, MenuPositionY} from '@angular/material/menu';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {HesitateDirective} from '@common/shared/ui-components/directives/hesitate.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'sm-multi-line-tooltip',
  templateUrl: `./multi-line-tooltip.component.html`,
  styleUrls: ['./multi-line-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenuModule,
    HesitateDirective,
    ClickStopPropagationDirective,
    SaferPipe,
    MatIconButton,
    MatIcon
  ]
})
export class MultiLineTooltipComponent {
  iconClass = input<string>();
  smallIcon = input<boolean>(false);
  position = input<MenuPositionY>('below');
}
