import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol} from '../../../../webapp-common/shared/ui-components/data/table/table.consts';
import {QUEUES_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {Task} from '../../../../business-logic/model/tasks/task';
import {TIME_FORMAT_STRING} from '../../../constants';

@Component({
  selector   : 'sm-queue-task-table',
  templateUrl: './queue-task-table.component.html',
  styleUrls  : ['./queue-task-table.component.scss']
})
export class QueueTaskTableComponent {

  public cols: Array<ISmCol>;
  public readonly QUEUES_TABLE_COL_FIELDS = QUEUES_TABLE_COL_FIELDS;

  @Input() queue: Queue;
  @Input() tasks: Array<Task>;
  @Output() taskSelected = new EventEmitter();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  constructor() {
    this.cols = [
      {
        id         : QUEUES_TABLE_COL_FIELDS.NAME,
        header     : 'Experiment Name',
        style      : {width: '680px'},
        headerType : ColHeaderTypeEnum.title,
        disableDrag: true,
        disablePointerEvents: true
      },
      {
        id         : QUEUES_TABLE_COL_FIELDS.ID,
        header     : 'Experiment ID',
        style      : {width: '300px'},
        headerType : ColHeaderTypeEnum.title,
        disableDrag: true,
        disablePointerEvents: true
      },
      {
        id         : QUEUES_TABLE_COL_FIELDS.QUEUED,
        header     : 'Queued At',
        style      : {width: '150px'},
        headerType : ColHeaderTypeEnum.title,
        disableDrag: true,
        disablePointerEvents: true
      },
    ];
  }

  onRowClicked(event) {
    this.taskSelected.emit(event.data);
  }
}
