import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {ITask} from '~/business-logic/model/al-task';
import {Model} from '~/business-logic/model/models/model';
import {ActiveSearchLink} from '~/features/dashboard/containers/dashboard-search/dashboard-search.component';

@Component({
  selector   : 'sm-search-results-page',
  templateUrl: './search-results-page.component.html',
  styleUrls  : ['./search-results-page.component.scss']
})
export class SearchResultsPageComponent {
  @Input() projectsList: Array<Project> = [];
  @Input() experimentsList: Array<Task> = [];
  @Input() modelsList: Array<Model>     = [];
  @Input() pipelinesList: Array<Project> = [];
  @Input() activeLink: ActiveSearchLink;

  @Output() projectSelected    = new EventEmitter<Project>();
  @Output() activeLinkChanged  = new EventEmitter<string>();
  @Output() experimentSelected = new EventEmitter<ITask>();
  @Output() modelSelected      = new EventEmitter<Model>();
  @Output() pipelineSelected   = new EventEmitter<Project>();

  public projectClicked(project: Project) {
    this.projectSelected.emit(project);
  }

  public experimentClicked(experiment: ITask) {
    this.experimentSelected.emit(experiment);
  }

  public modelClicked(model: Model) {
    this.modelSelected.emit(model);
  }

  public pipelineClicked(pipeline: Project) {
    this.pipelineSelected.emit(pipeline);
  }

  getResults() {
    return this[`${this.activeLink}List`];
  }

  getCardHeight() {
    switch (this.activeLink) {
      case 'projects':
        return 246;
      case 'experiments':
      case 'models':
        return 264;
      case 'pipelines':
        return 226;
      default:
        return 250;
    }
  }
}
