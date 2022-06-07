import {ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '@common/shared/ui-components/data/table/table.consts';
import {find, get} from 'lodash/fp';
import {Queue} from '~/business-logic/model/queues/queue';
import {QUEUES_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {BaseTableView} from '@common/shared/ui-components/data/table/base-table-view';
import {ActivatedRoute} from '@angular/router';
import {ICONS} from '@common/constants';

@Component({
  selector: 'sm-queues-table',
  templateUrl: './queues-table.component.html',
  styleUrls: ['./queues-table.component.scss']
})
export class QueuesTableComponent extends BaseTableView {
  public cols: Array<ISmCol>;
  public readonly QUEUES_TABLE_COL_FIELDS = QUEUES_TABLE_COL_FIELDS;
  public menuOpen: boolean;
  private _queues: Array<Queue>;
  public queuesManager: boolean;
  readonly ICONS = ICONS;
  contextQueue: Queue;

  @Input() set queues(queues: Array<Queue>) {
    this._queues = queues;
    this.table && this.table.focusSelected();
  }

  get queues() {
    return this._queues;
  }

  @Input() selectedQueue: Queue;
  @Output() queueSelected = new EventEmitter();
  @Output() deleteQueue = new EventEmitter();
  @Output() renameQueue = new EventEmitter();
  @Output() clearQueue = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();

  @Input() tableSortOrder: TableSortOrderEnum;
  @ViewChild('tableContainer', {static: false}) tableContainer;
  @ViewChild('table', {static: false}) table: TableComponent;

  public menuPosition: { x: number; y: number };

  constructor(private changeDetector: ChangeDetectorRef, private route: ActivatedRoute) {
    super();
    this.queuesManager = route.snapshot.data.queuesManager;
    this.cols = [
      {
        id: QUEUES_TABLE_COL_FIELDS.NAME,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'QUEUE',
        style: {width: '35%'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.WORKERS,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'WORKERS',
        style: {width: '80px'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.TASK,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'NEXT EXPERIMENT',
        style: {width: '30%'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.LAST_UPDATED,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'LAST UPDATED',
        style: {width: '150px'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.IN_QUEUE,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: 'IN QUEUE',
        style: {width: '100px'},
        sortable: true,
      }
    ];
  }

  getBodyData(rowData: any, col: ISmCol) {
    return get(col.id, rowData);
  }

  getQNames(queues) {
    return queues.map(queue => this.getQName(queue));
  }

  getQName(queue) {
    const queueIns: any = find({'id': queue}, this.queues);
    return queueIns ? queueIns.name : queue;
  }

  onRowClicked(event) {
    this.queueSelected.emit(event.data);
  }

  openContextMenu(data) {
    data.e.preventDefault();
    this.contextQueue = data.rowData;
    this.menuOpen = false;
    setTimeout(() => {
      this.menuPosition = {x: data.e.clientX, y: data.e.clientY};
      this.menuOpen = true;
      this.changeDetector.detectChanges();
    }, 0);

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
