import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {Project} from '~/business-logic/model/projects/project';
import {ICONS} from '@common/constants';


@Component({
  selector: 'sm-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectCardComponent {
  private _project: ProjectsGetAllResponseSingle ;
  public computeTime: string;

  @Input() set project(data: ProjectsGetAllResponseSingle ) {
    this._project = data;
    this.computeTime = this.convertSecToDaysHrsMinsSec(data.stats?.active?.total_runtime)
  };

  get project() {
    return this._project;
  }
  @Input() isRootProject;
  @Input() hideMenu = false;
  @Output() projectCardClicked = new EventEmitter<Project>();
  @Output() projectNameChanged = new EventEmitter();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() moveToClicked = new EventEmitter<string>();
  @Output() newProjectClicked = new EventEmitter<string>();
  @ViewChild('projectName', {static: true}) projectName;
  readonly circleTypeEnum = CircleTypeEnum;
  readonly ICONS = ICONS;

  private projectNameActive = false;

  public convertSecToDaysHrsMinsSec(secs) {
    const dayInSec = 60 * 60 * 24;
    const hourInSec = 60 * 60;
    const minInSec = 60;
    const d = Math.floor(secs / dayInSec);
    const h = Math.floor((secs - (d * dayInSec)) / hourInSec);
    const m = Math.floor((secs - (d * dayInSec + h * hourInSec)) / minInSec);
    const s = secs % 60;
    const H = h < 10 ? '0' + h : h;
    const M = m < 10 ? '0' + m : m;
    const S = s < 10 ? '0' + s : s;
    return `${d === 1 ? d + ' DAY ' : d > 1 ? d + ' DAYS ' : ''} ${H}:${M}:${S}`;
  }

  public projectClicked() {
    if (!this.projectNameActive) {
      this.projectCardClicked.emit(this.project);
    }
  }

  public projectNameEditActiveChanged(active) {
    setTimeout(() => this.projectNameActive = active, 100);
  }

  subProjectClicked(id: string) {
    this.projectCardClicked.emit({id});
  }

  prepareProjectNameForChange(projectName: string) {
    this.projectNameChanged.emit(this.project.name.substring(0, this.project.name.lastIndexOf('/') + 1) + projectName);
  }
}
