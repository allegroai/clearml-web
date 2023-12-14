import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {Project} from '~/business-logic/model/projects/project';
import {ICONS} from '@common/constants';
import {trackById} from '@common/shared/utils/forms-track-by';


@Component({
  selector: 'sm-nested-card',
  templateUrl: './nested-card.component.html',
  styleUrls: ['./nested-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedCardComponent {
  @Input() allTags: string[];
  @Output() addTag = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<string>();
  @Output() delete = new EventEmitter();
  trackById = trackById;
  private _project: ProjectsGetAllResponseSingle;
  public computeTime: string;
  readonly circleTypeEnum = CircleTypeEnum;
  readonly icons = ICONS;

  @Input() projectsNames: string[];

  @Input() set project(data: Project) {
    this._project = {...data, sub_projects: data.sub_projects?.filter(subP => !subP.name.includes('.pipelines') && !subP.name.includes('.datasets') && !subP.name.includes('.reports'))};
  };

  get project() {
    return this._project;
  }

  @Input() isRootProject;
  @Input() hideMenu = true;
  @Output() projectCardClicked = new EventEmitter<Project>();
  @Output() projectNameChanged = new EventEmitter();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @ViewChild('projectName', {static: true}) projectName;

  public projectClicked() {
    this.projectCardClicked.emit(this.project);
  }

  subProjectClicked(project) {
    this.projectCardClicked.emit(project);
  }

  prepareProjectNameForChange(projectName: string) {
    this.projectNameChanged.emit(this.project.name.substring(0, this.project.name.lastIndexOf('/') + 1) + projectName);
  }
}
