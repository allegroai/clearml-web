import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'sm-navbar-item',
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss'],
})
export class NavbarItemComponent implements OnInit {

  @Input() header: string;
  @Input() active: boolean;
  @Input() direction: 'bottom' | 'top' = 'bottom';
  @Input() subHeader: string;
  @Input() multi: boolean = false;

  @Output() itemSelected = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
