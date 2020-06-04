import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '../../../../business-logic/model/projects/projectsGetAllResponseSingle';

@Component({
  selector   : 'sm-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls  : ['./projects-list.component.scss']
})
export class ProjectsListComponent {

  @Input() projects: Array<ProjectsGetAllResponseSingle>;
  @Input() noMoreProjects: boolean;
  @Output() projectCardClicked   = new EventEmitter<ProjectsGetAllResponseSingle>();
  @Output() projectNameChanged   = new EventEmitter<{ project: string, name: string }>();
  @Output() deleteProjectClicked = new EventEmitter<{ projectId: string }>();
  @Output() loadMore = new EventEmitter();

}
