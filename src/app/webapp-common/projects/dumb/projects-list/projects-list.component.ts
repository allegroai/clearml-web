import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '../../../../business-logic/model/projects/projectsGetAllResponseSingle';
import {Project} from '../../../../business-logic/model/projects/project';
import {isExample} from '../../../shared/utils/shared-utils';
import {pageSize} from '../../common-projects.consts';

@Component({
  selector: 'sm-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent {
  isExample = isExample;
  pageSize = pageSize;

  @Input() projects: Array<ProjectsGetAllResponseSingle>;
  @Input() noMoreProjects: boolean;
  @Output() projectCardClicked = new EventEmitter<ProjectsGetAllResponseSingle>();
  @Output() projectNameChanged = new EventEmitter<{ project: string, name: string }>();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() loadMore = new EventEmitter();
  @Output() moveToClicked = new EventEmitter<string>();
  @Output() createNewProjectClicked = new EventEmitter<string>();

}
