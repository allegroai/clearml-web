import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {Project} from '~/business-logic/model/projects/project';
import {ICONS} from '@common/constants';
import {trackById} from '@common/shared/utils/forms-track-by';
import {ProjectTypeEnum} from '@common/nested-project-view/nested-project-view-page/nested-project-view-page.component';


@Component({
  selector: 'sm-nested-card',
  templateUrl: './nested-card.component.html',
  styleUrls: ['./nested-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedCardComponent {

  trackById = trackById;
  private _project: ProjectsGetAllResponseSingle;
  public computeTime: string;
  readonly circleTypeEnum = CircleTypeEnum;
  readonly icons = ICONS;

  @Input() projectsNames: string[];

  @Input() set project(data: Project) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this._project = {...data, sub_projects: data.sub_projects?.filter(subP => !subP.name.includes('.pipelines') && !subP.name.includes('.datasets') && !subP.name.includes('.reports'))};
  };

  get project() {
    return this._project;
  }

  @Input() isRootProject;
  @Input() hideMenu = true;
  @Input() allTags: string[];
  @Input() entityType: ProjectTypeEnum;
  @Output() addTag = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<string>();
  @Output() delete = new EventEmitter();
  @Output() projectCardClicked = new EventEmitter<{ hasSubProjects: boolean; id: string; name: string }>();
  @Output() projectNameChanged = new EventEmitter();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @ViewChild('projectName', {static: true}) projectName;

  public projectClicked() {
    const hasSubProjects = this.project.sub_projects?.filter((subProject) => (!subProject.name.slice(this.project.name.length).startsWith(`/.${this.entityType}`))).length > 0;
    this.projectCardClicked.emit({hasSubProjects, id: this.project.id, name: this.project.name});
  }

  subProjectClicked(project) {
    const hasSubProjects = this.project.sub_projects?.filter(pr => pr.name.startsWith(`${project.name}/`))
      .filter((subProject) => {
        const realSubProject = subProject.name.slice(project.name.length);
        return !!realSubProject && !realSubProject.startsWith(`/.${this.entityType}`);
      }).length > 0;
    this.projectCardClicked.emit({hasSubProjects, id: project.id, name: project.name});

  }

  prepareProjectNameForChange(projectName: string) {
    this.projectNameChanged.emit(this.project.name.substring(0, this.project.name.lastIndexOf('/') + 1) + projectName);
  }
}
