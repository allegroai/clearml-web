import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {NoUnderscorePipe} from '@common/shared/pipes/no-underscore.pipe';
import {NgIf, TitleCasePipe} from '@angular/common';


@Component({
  selector: 'sm-experiment-type-icon-label',
  templateUrl: './experiment-type-icon-label.component.html',
  styleUrls: ['./experiment-type-icon-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NoUnderscorePipe,
    TitleCasePipe,
    NgIf
  ]
})
export class ExperimentTypeIconLabelComponent{
  @Input() type: TaskTypeEnum;
  @Input() iconClass = '';
  @Input() showLabel = true;
}
