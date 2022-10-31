import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {Project} from '~/business-logic/model/projects/project';
import {isExample} from '@common/shared/utils/shared-utils';
import {pageSize} from '../../common-projects.consts';
import {trackById} from '@common/shared/utils/forms-track-by';

@Component({
  selector: 'sm-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent {
  isExample = isExample;
  pageSize = pageSize;
  trackById = trackById;
  private _projects: Project[];
  public projectsNames: string[];

  @Input() set projects(projects: Array<Project>) {
    this._projects = projects;
    this.projectsNames = projects?.map(p => p.basename);
  }

  get projects() {
    return this._projects;
  }

  @Input() noMoreProjects: boolean;
  @Input() showLast: boolean;
  @Output() projectCardClicked = new EventEmitter<ProjectsGetAllResponseSingle>();
  @Output() projectNameChanged = new EventEmitter<{ id: string, name: string }>();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() loadMore = new EventEmitter();
  @Output() moveToClicked = new EventEmitter<string>();
  @Output() createNewProjectClicked = new EventEmitter<string>();

}
