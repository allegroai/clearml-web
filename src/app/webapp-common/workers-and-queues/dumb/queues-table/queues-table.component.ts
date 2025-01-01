import {
  ChangeDetectorRef,
  Component,
  viewChild,
  input,
  output,
  effect,
  inject,
  ElementRef,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {find, get} from 'lodash-es';
import {QUEUES_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';
import {BaseTableView} from '@common/shared/ui-components/data/table/base-table-view';
import {ActivatedRoute} from '@angular/router';
import {Queue} from '@common/workers-and-queues/actions/queues.actions';


@Component({
  selector: 'sm-queues-table',
  templateUrl: './queues-table.component.html',
  styleUrls: ['./queues-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueuesTableComponent extends BaseTableView {
  private changeDetector = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  protected cols: ISmCol[] = [
    {
      id: QUEUES_TABLE_COL_FIELDS.NAME,
      headerType: ColHeaderTypeEnum.sortFilter,
      header: 'QUEUE',
      style: {width: '35%', maxWidth: '600px'},
      sortable: true,
    },
    {
      id: QUEUES_TABLE_COL_FIELDS.WORKERS,
      headerType: ColHeaderTypeEnum.sortFilter,
      header: 'WORKERS',
      style: {width: '80px', maxWidth: '100px'},
      sortable: true,
    },
    {
      id: QUEUES_TABLE_COL_FIELDS.TASK,
      headerType: ColHeaderTypeEnum.sortFilter,
      header: 'NEXT TASK',
      style: {width: '30%', maxWidth: '600px'},
      sortable: true,
    },
    {
      id: QUEUES_TABLE_COL_FIELDS.LAST_UPDATED,
      headerType: ColHeaderTypeEnum.sortFilter,
      header: 'LAST UPDATED',
      style: {width: '150px',  maxWidth: '200px'},
      sortable: true,
    },
    {
      id: QUEUES_TABLE_COL_FIELDS.IN_QUEUE,
      headerType: ColHeaderTypeEnum.sortFilter,
      header: 'IN QUEUE',
      style: {width: '100px',  maxWidth: '150px'},
      sortable: true,
    }
  ];

  protected readonly QUEUES_TABLE_COL_FIELDS = QUEUES_TABLE_COL_FIELDS;
  protected menuOpen: boolean;
  protected queuesManager = this.route.snapshot.data.queuesManager;
  contextQueue: Queue;

  queues = input<Queue[]>();
  selectedQueue = input<Queue>();
  short = input(true);
  queueSelected = output<Queue>();
  deleteQueue = output<Queue>();
  renameQueue = output<Queue>();
  clearQueue = output<Queue>();
  sortedChanged = output<{
        isShift: boolean;
        colId: ISmCol['id'];
    }>();

  tableContainer = viewChild<ElementRef<HTMLDivElement>>('tableContainer');

  public menuPosition = signal<{ x: number; y: number }>(null);

  constructor() {
    super();
    effect(() => {
      if (this.queues()) {
        this.table?.focusSelected();
      }
    });

  }

  getBodyData(rowData: any, col: ISmCol) {
    return get(rowData, col.id);
  }

  getQNames(queues) {
    return queues.map(queue => this.getQName(queue));
  }

  getQName(queue) {
    const queueIns: any = find(this.queues(), {id: queue});
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
      this.menuPosition.set({x: data.e.clientX, y: data.e.clientY});
      this.menuOpen = true;
      this.changeDetector.detectChanges();
    }, 0);

  }

  override scrollTableToTop() {
    this.tableContainer().nativeElement.scroll({top: 0});
  }

  onSortChanged(isShift: boolean, colId: ISmCol['id']) {
    this.sortedChanged.emit({isShift, colId});
    this.scrollTableToTop();
  }

  override afterTableInit(): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitSelection(selection: any[]) {
  }
}
