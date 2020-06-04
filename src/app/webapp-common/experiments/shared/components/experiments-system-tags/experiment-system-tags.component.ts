import {Component, Input, OnInit} from '@angular/core';
import {Task} from '../../../../../business-logic/model/tasks/task';
import {EXPERIMENTS_TAGS, EXPERIMENTS_TAGS_TOOLTIP} from '../../../../../features/experiments/shared/experiments.const';

@Component({
  selector   : 'sm-experiment-system-tags',
  templateUrl: './experiment-system-tags.component.html',
  styleUrls  : ['./experiment-system-tags.component.scss']
})
export class ExperimentSystemTagsComponent implements OnInit {

  public readonly EXPERIMENTS_TAGS = EXPERIMENTS_TAGS;
  public readonly EXPERIMENTS_TAGS_TOOLTIP = EXPERIMENTS_TAGS_TOOLTIP;

  @Input() tags: Task['system_tags'];

  @Input() tagsToDisplay = EXPERIMENTS_TAGS;

  constructor() {
  }

  ngOnInit() {
  }

}
