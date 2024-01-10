import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ClipboardModule} from 'ngx-clipboard';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sm-id-badge',
  templateUrl: './id-badge.component.html',
  styleUrls: ['./id-badge.component.scss'],
  standalone: true,
  imports: [
    TooltipDirective,
    ClipboardModule,
    NgIf
  ]
})
export class IdBadgeComponent {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Input() id: string;
  @Output() copied = new EventEmitter();

  openMenu() {
    this.trigger.openMenu();
  }
}
