import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../../../../webapp-common/shared/ui-components/data/table/table.consts';
import {get} from 'lodash/fp';
import {WORKERS_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';

@Component({
  selector   : 'sm-workers-table',
  templateUrl: './workers-table.component.html',
  styleUrls  : ['./workers-table.component.scss']
})
export class WorkersTableComponent {

  public cols: Array<ISmCol>;
  public readonly WORKERS_TABLE_COL_FIELDS = WORKERS_TABLE_COL_FIELDS;
  @Input() workers: Array<Worker>;
  @Input() selectedWorker: Worker;
  @Input() tableSortField: string;
  @Input() tableSortOrder: number;
  @Output() workerSelected                 = new EventEmitter();
  @Output() sortedChanged                  = new EventEmitter<{ sortOrder: TableSortOrderEnum, colId: ISmCol['id'] }>();

  @ViewChild('tableContainer', {static: true}) tableContainer;


  constructor() {
    this.cols = [
      {
        id        : WORKERS_TABLE_COL_FIELDS.ID,
        headerType: ColHeaderTypeEnum.sort,
        header    : 'AVAILABLE WORKERS',
        style     : {width: '30%', minWidth: '500px'},
        sortable  : true,
        disableDrag   : true,
      },
      {
        id      : WORKERS_TABLE_COL_FIELDS.TASK,
        headerType: ColHeaderTypeEnum.sort,
        header  : 'CURRENTLY RUNNING EXPERIMENT',
        style   : {width: '30%', minWidth: '500px'},
        sortable: true,
        disableDrag   : true,
      },
      {
        id      : WORKERS_TABLE_COL_FIELDS.TASK_RUNNING_TIME,
        headerType: ColHeaderTypeEnum.sort,
        header  : 'EXPERIMENT RUNNING TIME',
        sortable: true,
        disableDrag   : true,
      },
      {
        id      : WORKERS_TABLE_COL_FIELDS.TASK_ITERATIONS,
        headerType: ColHeaderTypeEnum.sort,
        header  : 'ITERATION',
        sortable: true,
        disableDrag   : true,
      },
    ];
  }

  getBodyData(rowData: any, col: ISmCol): any {
    return get(col.id, rowData);
  }

  onRowClicked(event) {
    this.workerSelected.emit(event.data);
  }

  scrollTableToTop() {
    this.tableContainer.nativeElement.scroll({top: 0});
  }

  onSortChanged(sortOrder, colId: ISmCol['id']) {
    this.sortedChanged.emit({sortOrder, colId});
    this.scrollTableToTop();
  }
}
