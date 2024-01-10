import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {TIME_FORMAT_STRING} from '@common/constants';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {DatePipe} from '@angular/common';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {CircleStatusComponent} from '@common/shared/ui-components/indicators/circle-status/circle-status.component';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';


@Component({
  selector: 'sm-model-card',
  templateUrl: './model-card.component.html',
  styleUrls: ['./model-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CopyClipboardComponent,
    TooltipDirective,
    DatePipe,
    TimeAgoPipe,
    CircleStatusComponent,
    CircleCounterComponent,
    CardComponent,
    ShowTooltipIfEllipsisDirective
  ]
})
export class ModelCardComponent {

  @Input() model: any; // TODO should be IModel
  @Output() modelCardClicked = new EventEmitter();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;
  CircleTypeEnum = CircleTypeEnum;


  public modelClicked() {
    this.modelCardClicked.emit(this.model);
  }
}
