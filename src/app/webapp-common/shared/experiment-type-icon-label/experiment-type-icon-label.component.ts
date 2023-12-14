import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';


@Component({
  selector: 'sm-experiment-type-icon-label',
  templateUrl: './experiment-type-icon-label.component.html',
  styleUrls: ['./experiment-type-icon-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentTypeIconLabelComponent{
  @Input() type: TaskTypeEnum;
  @Input() iconClass = 'md';
  @Input() showLabel = true;
  constructor() { }
}
