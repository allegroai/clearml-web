import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls  : ['./refresh-button.component.scss']
})
export class RefreshButtonComponent implements OnInit {
  @Input() autoRefreshState: boolean;
  @Input() allowAutoRefresh: boolean = true;
  @Input() disabled: boolean = true;
  @Output() refreshList = new EventEmitter();
  @Output() setAutoRefresh = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
  }

}

