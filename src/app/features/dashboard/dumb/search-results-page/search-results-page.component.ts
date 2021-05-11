import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project} from '../../../../business-logic/model/projects/project';
import {Task} from '../../../../business-logic/model/tasks/task';
import {ITask} from '../../../../business-logic/model/al-task';
import {Model} from '../../../../business-logic/model/models/model';

@Component({
  selector   : 'sm-search-results-page',
  templateUrl: './search-results-page.component.html',
  styleUrls  : ['./search-results-page.component.scss']
})
export class SearchResultsPageComponent {
  @Input() projectsList: Array<Project> = [];
  @Input() experimentsList: Array<Task> = [];
  @Input() modelsList: Array<Model>     = [];
  @Input() activeLink                   = 'projects';

  @Output() projectSelected    = new EventEmitter<Project>();
  @Output() activeLinkChanged  = new EventEmitter<string>();
  @Output() experimentSelected = new EventEmitter<ITask>();
  @Output() modelSelected      = new EventEmitter<Model>();

  public projectClicked(project: Project) {
    this.projectSelected.emit(project);
  }

  public experimentClicked(experiment: ITask) {
    this.experimentSelected.emit(experiment);
  }

  public modelClicked(model: Model) {
    this.modelSelected.emit(model);
  }

}
