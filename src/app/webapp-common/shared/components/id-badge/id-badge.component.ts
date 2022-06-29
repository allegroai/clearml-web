import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'sm-id-badge',
  templateUrl: './id-badge.component.html',
  styleUrls: ['./id-badge.component.scss']
})
export class IdBadgeComponent {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Input() id: string;
  @Output() copied = new EventEmitter();

  openMenu() {
    this.trigger.openMenu();
  }
}
