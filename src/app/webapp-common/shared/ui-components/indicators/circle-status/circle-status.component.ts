import {Component, Input} from '@angular/core';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {EXPERIMENTS_STATUS_LABELS} from '~/shared/constants/non-common-consts';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';


@Component({
  selector   : 'sm-circle-status',
  templateUrl: './circle-status.component.html',
  styleUrls  : ['./circle-status.component.scss']
})
export class CircleStatusComponent {
  @Input() status: TaskStatusEnum;
  @Input() type: TaskTypeEnum;
  @Input() defaultStatus: string = '';
  public readonly experimentsStatusLabels = EXPERIMENTS_STATUS_LABELS;
}
