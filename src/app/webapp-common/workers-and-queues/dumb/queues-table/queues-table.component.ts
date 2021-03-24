import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../../../../webapp-common/shared/ui-components/data/table/table.consts';
import {find, get} from 'lodash/fp';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {QUEUES_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';

@Component({
  selector   : 'sm-queues-table',
  templateUrl: './queues-table.component.html',
  styleUrls  : ['./queues-table.component.scss']
})
export class QueuesTableComponent implements OnInit {
  public cols: Array<ISmCol>;

  public readonly QUEUES_TABLE_COL_FIELDS = QUEUES_TABLE_COL_FIELDS;
  public menuOpen: boolean;
  @Input() queues: Array<Queue>;
  @Input() selectedQueue: Queue;
  @Output() queueSelected = new EventEmitter();
  @Output() deleteQueue = new EventEmitter();
  @Output() renameQueue = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ sortOrder: TableSortOrderEnum, colId: ISmCol['id'] }>();
  @Input() tableSortField: string;
  @Input() tableSortOrder: TableSortOrderEnum;
  @ViewChild('tableContainer', {static: true}) tableContainer;

  public menuPosition: { x: number; y: number };

  @HostListener('document:click', ['$event'])
  clickHandler(event) {
    if (event.button != 2) { // Bug in firefox: right click triggers `click` event
      this.menuOpen = false;
    }
  }

  constructor(private changeDetector: ChangeDetectorRef) {
    this.cols = [
      {
        id         : QUEUES_TABLE_COL_FIELDS.NAME,
        headerType : ColHeaderTypeEnum.sort,
        header     : 'QUEUE',
        style      : {width: '25%', minWidth: '500px'},
        sortable   : true,
      },
      {
        id         : QUEUES_TABLE_COL_FIELDS.TASK,
        headerType : ColHeaderTypeEnum.sort,
        header     : 'NEXT EXPERIMENT',
        style      : {width: '35%', minWidth: '800px'},
        sortable   : true,
      },
      {
        id         : QUEUES_TABLE_COL_FIELDS.LAST_UPDATED,
        headerType : ColHeaderTypeEnum.sort,
        header     : 'LAST UPDATED',
        style      : {width: '25%', minWidth: '400px'},
        sortable   : true,
      },
      {
        id         : QUEUES_TABLE_COL_FIELDS.IN_QUEUE,
        headerType : ColHeaderTypeEnum.sort,
        header     : 'IN QUEUE',
        sortable   : true,
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

  ngOnInit(): void {
  }

  openContextMenu(data) {
    data.e.preventDefault();
    this.queueSelected.emit(data.rowData);
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

  onSortChanged(sortOrder, colId: ISmCol['id']) {
    this.sortedChanged.emit({sortOrder, colId});
    this.scrollTableToTop();
  }
}
