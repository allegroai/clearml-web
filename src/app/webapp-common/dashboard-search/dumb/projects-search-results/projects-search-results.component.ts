import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project} from '../../../../business-logic/model/projects/project';

@Component({
  selector   : 'sm-projects-search-results',
  templateUrl: './projects-search-results.component.html',
  styleUrls  : ['./projects-search-results.component.scss']
})
export class ProjectsSearchResultsComponent {
  @Input() projectsList: Array<Project>;
  @Output() projectClicked = new EventEmitter<Project>();

  public projectCardClicked(project: Project) {
    this.projectClicked.emit(project);
  }

}
