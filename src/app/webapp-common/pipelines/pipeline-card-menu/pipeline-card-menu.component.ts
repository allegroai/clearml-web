import {Component, EventEmitter, Input, Output} from '@angular/core';
import { ICONS } from '@common/constants';
import {Project} from '~/business-logic/model/projects/project';

@Component({
  selector: 'sm-pipeline-card-menu',
  templateUrl: './pipeline-card-menu.component.html',
  styleUrls: ['./pipeline-card-menu.component.scss']
})
export class PipelineCardMenuComponent {
  readonly icons = ICONS;

  @Input() project: Project;
  @Input() allTags: string[];
  @Output() run = new EventEmitter();
  @Output() addTag = new EventEmitter<string>();
  @Output() rename = new EventEmitter();
  @Output() delete = new EventEmitter();
}
