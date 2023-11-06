import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {isEmpty} from 'lodash-es';
import {TIME_FORMAT_STRING} from '@common/constants';
import {ITask} from '~/business-logic/model/al-task';


@Component({
  selector       : 'sm-experiment-card',
  templateUrl    : './experiment-card.component.html',
  styleUrls      : ['./experiment-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCardComponent {

  public isEmpty = isEmpty;

  @Input() experiment: ITask;
  @Output() experimentCardClicked = new EventEmitter();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  public experimentClicked() {
    this.experimentCardClicked.emit(this.experiment);
  }

}
