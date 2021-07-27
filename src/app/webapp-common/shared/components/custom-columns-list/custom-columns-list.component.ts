import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ISmCol} from '../../ui-components/data/table/table.consts';

@Component({
  selector   : 'sm-custom-columns-list',
  templateUrl: './custom-columns-list.component.html',
  styleUrls  : ['./custom-columns-list.component.scss']
})
export class CustomColumnsListComponent implements OnInit {
  @Input() tableCols: ISmCol[];
  @Input() isLoading;
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();

  constructor() {
  }

  ngOnInit(): void {
  }

  trackById = (index: number, col: ISmCol) => col.id;
}
