import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'sm-navbar-item',
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss'],
  standalone: true,
})
export class NavbarItemComponent {

  @Input() header: string;
  @Input() active: boolean;
  @Input() direction: 'bottom' | 'top' = 'bottom';
  @Input() subHeader: string;
  @Input() multi: boolean = false;
  @Input() large: boolean = true;
  @Output() itemSelected = new EventEmitter<string>();
}
