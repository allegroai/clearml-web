import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-custom-columns-list',
  templateUrl: './custom-columns-list.component.html',
  styleUrls  : ['./custom-columns-list.component.scss']
})
export class CustomColumnsListComponent implements OnInit {
  @Input() tableCols;
  @Input() isLoading;
  @Output() removeColFromList = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

}
