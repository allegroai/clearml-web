import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CircleTypeEnum} from '../../../../../shared/constants/non-common-consts';
import {Model} from '../../../../../business-logic/model/models/model';
import {TIME_FORMAT_STRING} from '../../../../constants';


@Component({
  selector: 'sm-model-card',
  templateUrl: './model-card.component.html',
  styleUrls: ['./model-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelCardComponent {

  @Input() model: any; // TODO should be IModel
  @Output() modelCardClicked = new EventEmitter();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;
  CircleTypeEnum = CircleTypeEnum;

  public modelClicked() {
    this.modelCardClicked.emit(this.model);
  }

  public numberOfLabels(labels: Model['labels']): number {
    if (labels) {
      return Object.keys(labels).length;
    } else {
      return 0;
    }

  }
}
