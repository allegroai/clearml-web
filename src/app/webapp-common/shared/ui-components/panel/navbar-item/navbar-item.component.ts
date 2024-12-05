import {Component, EventEmitter, Input, Output} from '@angular/core';
import { TooltipDirective } from '../../indicators/tooltip/tooltip.directive';

@Component({
  selector: 'sm-navbar-item',
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss'],
  standalone: true,
  imports: [TooltipDirective]
})
export class NavbarItemComponent {

  @Input() header: string;
  @Input() active: boolean;
  @Input() direction: 'bottom' | 'top' = 'bottom';
  @Input() subHeader: string;
  @Input() badge: string;
  @Input() badgeTooltip: string;
  @Input() large = true;
  @Output() itemSelected = new EventEmitter<string>();
}
