import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {get} from 'lodash/fp';
import {WORKERS_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';
import {Worker} from '../../../../business-logic/model/workers/worker';
import {TableComponent} from '../../../shared/ui-components/data/table/table.component';
import {BaseTableView} from '../../../shared/ui-components/data/table/base-table-view';

@Component({
  selector: 'sm-workers-table',
  templateUrl: './workers-table.component.html',
  styleUrls: ['./workers-table.component.scss']
})
export class WorkersTableComponent extends BaseTableView {

  public cols: Array<ISmCol>;
  public readonly WORKERS_TABLE_COL_FIELDS = WORKERS_TABLE_COL_FIELDS;
  private _workers: Worker[];

  @Input() set workers(workers: Worker[]) {
    this._workers = workers;
    this.table && this.table.focusSelected();
  }

  get workers() {
    return this._workers;
  }

  @Input() selectedWorker: Worker;
  @Output() workerSelected = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();

  @ViewChild('tableContainer', {static: true}) tableContainer;
  @ViewChild('table', {static: false}) table: TableComponent;

  constructor() {
    super();
    this.cols = [
      {
        id: WORKERS_TABLE_COL_FIELDS.ID,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'AVAILABLE WORKERS',
        style: {width: '30%'},
        sortable: true,
      },
      {
        id: WORKERS_TABLE_COL_FIELDS.TASK,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'CURRENTLY RUNNING EXPERIMENT',
        style: {width: '30%'},
        sortable: true,
      },
      {
        id: WORKERS_TABLE_COL_FIELDS.TASK_RUNNING_TIME,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'EXPERIMENT RUNNING TIME',
        style: {width: '100px'},
        sortable: true,
      },
      {
        id: WORKERS_TABLE_COL_FIELDS.TASK_ITERATIONS,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'ITERATION',
        style: {width: '100px'},
        sortable: true,
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

  onSortChanged(isShift: boolean, colId: ISmCol['id']) {
    this.sortedChanged.emit({isShift, colId});
    this.scrollTableToTop();
  }

  afterTableInit(): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitSelection(selection: any[]) {
  }
}
