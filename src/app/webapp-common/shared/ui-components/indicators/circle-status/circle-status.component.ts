import {Component, Input, OnInit} from '@angular/core';
import {TaskStatusEnum} from '../../../../../business-logic/model/tasks/taskStatusEnum';
import {EXPERIMENTS_STATUS_LABELS} from '../../../../../shared/constants/non-common-consts';


@Component({
  selector   : 'sm-circle-status',
  templateUrl: './circle-status.component.html',
  styleUrls  : ['./circle-status.component.scss']
})
export class CircleStatusComponent {
  @Input() status: TaskStatusEnum;
  public readonly EXPERIMENTS_STATUS_LABELS = EXPERIMENTS_STATUS_LABELS;
}
