import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TIME_FORMAT_STRING} from '@common/constants';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {trackById} from '@common/shared/utils/forms-track-by';

@Component({
  selector: 'sm-pipeline-card',
  templateUrl: './pipeline-card.component.html',
  styleUrls: ['./pipeline-card.component.scss']
})
export class PipelineCardComponent extends ProjectCardComponent {
  @Input() allTags: string[];
  @Output() run = new EventEmitter();
  @Output() addTag = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<string>();
  @Output() delete = new EventEmitter();
  protected readonly TIME_FORMAT_STRING = TIME_FORMAT_STRING;
  timeFormatString = TIME_FORMAT_STRING;
}
