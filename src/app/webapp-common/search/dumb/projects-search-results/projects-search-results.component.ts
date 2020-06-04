import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Project} from '../../../../business-logic/model/projects/project';

@Component({
  selector   : 'sm-projects-search-results',
  templateUrl: './projects-search-results.component.html',
  styleUrls  : ['./projects-search-results.component.scss']
})
export class ProjectsSearchResultsComponent {
  // TODO add type
  @Input() projectsList: Array<Project>;
  @Output() projectClicked = new EventEmitter<string>();

  public projectCardClicked(projectId: string) {
    this.projectClicked.emit(projectId);
  }

}
